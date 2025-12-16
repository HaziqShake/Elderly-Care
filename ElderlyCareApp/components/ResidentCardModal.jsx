// components/ResidentCardModal.jsx
import * as ImagePicker from "expo-image-picker";
import DateNavigator from "../components/DateNavigator";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../supabase/supabaseClient";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";


export default function ResidentCardModal({ resident, onClose, onUpdateResident }) {
  // resident info edit mode (global for resident fields only)
  const WEEKDAYS = [
    { label: "S", value: 0 },
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
  ];
  const [repeatDays, setRepeatDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [savingResident, setSavingResident] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState([]); // daily instances with meta
  const [loadingTasks, setLoadingTasks] = useState(true);
  // New modal controls for Specific Task Add/Edit
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null); // null = adding new task
  const [taskLabel, setTaskLabel] = useState("");
  const [taskTime, setTaskTime] = useState(new Date());
  const [showTaskTimePicker, setShowTaskTimePicker] = useState(false);
  const [editTasks, setEditTasks] = useState(false);


  // Intake / Output state
  const [ioEntries, setIoEntries] = useState([]);
  const [ioLoading, setIoLoading] = useState(true);
  const [showIoForm, setShowIoForm] = useState(false);
  const [newIo, setNewIo] = useState({
    intake_ml: "",
    urine_ml: "",
    stool: "",
  });

  // Vitals state
  const [vitals, setVitals] = useState([]);
  const [vitalsLoading, setVitalsLoading] = useState(true);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [vitalForm, setVitalForm] = useState({
    bp: "",
    temp: "",
    pulse: "",
    resp: "",
    spo2: "",
    sugar: "",
    insulin: "",
  });
  const [vitalTime, setVitalTime] = useState(new Date());
  const [showVitalTimePicker, setShowVitalTimePicker] = useState(false);


  // resident form
  const [formData, setFormData] = useState({
    name: resident.name || "",
    age: resident.age?.toString() || "",
    room_number: resident.room_number || "",
    condition: resident.condition || "",
  });

  /* ---------- Helpers ---------- */

  // Normalize user input like "7", "7:5", "7:05 AM", "19:30" -> "HH:MM:SS"
  const normalizeToSqlTime = (input) => {
    if (input == null || input === "") return null;
    try {
      let s = String(input).trim();
      let ampm = null;
      const m = s.match(/(am|pm)$/i);
      if (m) {
        ampm = m[1].toLowerCase();
        s = s.replace(/(am|pm)$/i, "").trim();
      }
      const parts = s.split(":").map((p) => p.trim());
      let hh = 0,
        mm = 0;
      if (parts.length === 1) {
        hh = parseInt(parts[0] || "0", 10) || 0;
        mm = 0;
      } else {
        hh = parseInt(parts[0] || "0", 10) || 0;
        mm = parseInt(parts[1] || "0", 10) || 0;
      }
      if (ampm) {
        if (ampm === "pm" && hh < 12) hh += 12;
        if (ampm === "am" && hh === 12) hh = 0;
      }
      hh = Math.max(0, Math.min(23, hh));
      mm = Math.max(0, Math.min(59, mm));
      const hhStr = hh < 10 ? "0" + hh : String(hh);
      const mmStr = mm < 10 ? "0" + mm : String(mm);
      return `${hhStr}:${mmStr}:00`;
    } catch (e) {
      return null;
    }
  };

  // Display 'HH:MM:SS' => 'HH:MM'
  const displayTime = (sqlTime) => {
    if (!sqlTime) return "—";
    if (typeof sqlTime === "string") return sqlTime.slice(0, 5);
    return "—";
  };
  const handlePickResidentPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileExt = asset.uri.split(".").pop() || "jpg";
      const fileName = `${resident.id}.${fileExt}`;

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: fileName,
        type: "image/jpeg",
      });

      const { error: uploadError } = await supabase.storage
        .from("resident-photos")
        .upload(fileName, formData, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("resident-photos")
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;

      const { error: updateError } = await supabase
        .from("residents")
        .update({ photo_url: photoUrl })
        .eq("id", resident.id);

      if (updateError) throw updateError;

      onUpdateResident?.({ ...resident, photo_url: photoUrl });
    } catch (err) {
      console.error("Photo upload failed:", err);
      Toast.show({
        type: "error",
        text1: "Photo upload failed",
      });
    }
  };



  /* ---------- Fetching ---------- */


  // Fetch today's daily_task_instances for this resident
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_task_instances")
        .select("id, activity_id, status, scheduled_time, activities(label)")
        .eq("resident_id", resident.id)
        .eq("date", dateStr)
        .order("scheduled_time", { ascending: true });


      if (error) throw error;
      const formatted = (data || []).map((row) => ({
        id: row.id,
        activity_id: row.activity_id,
        label: row.activities?.label || "Unnamed Task",
        status: row.status || "pending",
        scheduled_time: row.scheduled_time || null,
        isNew: false,
      }));
      setTasks(formatted);
    } catch (err) {
      console.error("Error fetching daily tasks:", err.message || err);
      Toast.show({ type: "error", text1: "Could not load tasks" });
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    // seed form and clear task deletion list
    setFormData({
      name: resident.name || "",
      age: resident.age?.toString() || "",
      room_number: resident.room_number || "",
      condition: resident.condition || "",
    });
    fetchTasks();
  }, [resident.id, selectedDate]);

  useEffect(() => {
    const fetchIntakeOutput = async () => {
      try {
        setIoLoading(true);

        const dateStr = selectedDate.toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("intake_output")
          .select("id, date, time, intake_ml, urine_ml, stool")
          .eq("resident_id", resident.id)
          .eq("date", dateStr)
          .order("time", { ascending: false });

        if (error) throw error;
        setIoEntries(data || []);
      } catch (err) {
        console.error("Error fetching Intake/Output:", err.message);
      } finally {
        setIoLoading(false);
      }
    };

    fetchIntakeOutput();
  }, [resident.id, selectedDate]);


  useEffect(() => {
    const fetchVitals = async () => {
      try {
        setVitalsLoading(true);

        const dateStr = selectedDate.toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("vitals")
          .select("*")
          .eq("resident_id", resident.id)
          .eq("date", dateStr)
          .order("time", { ascending: false });

        if (error) throw error;
        setVitals(data || []);
      } catch (err) {
        console.error("Error fetching vitals:", err.message);
      } finally {
        setVitalsLoading(false);
      }
    };

    fetchVitals();
  }, [resident.id, selectedDate]);


  /* ---------- Local helpers for tasks ---------- */
  const isToday =
    selectedDate.toISOString().split("T")[0] ===
    new Date().toISOString().split("T")[0];


  const toggleStatusImmediate = async (task) => {
    try {
      const newStatus = task.status === "done" ? "pending" : "done";
      const { error } = await supabase
        .from("daily_task_instances")
        .update({ status: newStatus, created_at: new Date() })
        .eq("id", task.id);
      if (error) throw error;
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error("Toggle status failed:", err.message || err);
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  /* ---------- Task editing flow (local) ---------- */

  const startTaskEditing = () => {
    setEditTasks(true);
  };


  const cancelTaskEdits = () => {
    setEditTasks(false);
    fetchTasks(); // correct reload
  };




  /* ---------- Resident info save (only resident fields) ---------- */

  const handleSaveResident = async () => {
    setSavingResident(true);
    try {
      const { error } = await supabase
        .from("residents")
        .update({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          room_number: formData.room_number,
          condition: formData.condition,
        })
        .eq("id", resident.id);

      if (error) throw error;

      const { data: updatedResident, error: updErr } = await supabase
        .from("residents")
        .select("id, name, age, room_number, condition, photo_url")
        .eq("id", resident.id)
        .single();
      if (updErr) throw updErr;

      if (onUpdateResident && updatedResident) onUpdateResident(updatedResident);
      Toast.show({ type: "success", text1: "Resident saved" });
      setEditMode(false);
    } catch (err) {
      console.error("Save resident failed:", err.message || err);
      Toast.show({ type: "error", text1: "Save failed", text2: err.message || "" });
    } finally {
      setSavingResident(false);
    }
  };

  const handleCancelResident = () => {
    setEditMode(false);
    setFormData({
      name: resident.name || "",
      age: resident.age?.toString() || "",
      room_number: resident.room_number || "",
      condition: resident.condition || "",
    });
    // reload tasks to revert any pending changes
    fetchTasks();
  };

  /* ---------- Intake/Output handlers ---------- */

  const handleSaveIoEntry = async () => {
    try {
      const { error } = await supabase.from("intake_output").insert({
        resident_id: resident.id,
        intake_ml: newIo.intake_ml ? parseInt(newIo.intake_ml) : null,
        urine_ml: newIo.urine_ml ? parseInt(newIo.urine_ml) : null,
        stool: newIo.stool || null,
      });
      if (error) throw error;
      setIoEntries((prev) => [
        {
          id: Date.now().toString(),
          time: new Date().toTimeString().slice(0, 5),
          intake_ml: newIo.intake_ml,
          urine_ml: newIo.urine_ml,
          stool: newIo.stool,
        },
        ...prev,
      ]);
      setNewIo({ intake_ml: "", urine_ml: "", stool: "" });
      setShowIoForm(false);
      Toast.show({ type: "success", text1: "I/O saved" });
    } catch (err) {
      console.error("Error inserting I/O:", err.message || err);
      Toast.show({ type: "error", text1: "I/O save failed" });
    }
  };
  /* --------------------------------------------------
   SPECIFIC TASK ADD/EDIT MODAL
-------------------------------------------------- */
  const saveSpecificTaskFromModal = async () => {
    const timeSql = moment(taskTime).format("HH:mm:ss");

    // ADD NEW TASK
    if (!editingTask) {
      // 1) Create new activity
      const { data: act, error: actErr } = await supabase
        .from("activities")
        .insert({
          label: taskLabel,
          type: "specific",
          default_time: timeSql,
        })
        .select()
        .single();

      if (actErr) {
        console.log("Error creating activity:", actErr);
        return;
      }

      // 2) Create resident_activities mapping
      await supabase.from("resident_activities").insert({
        label: taskLabel,
        type: "specific",
        default_time: timeSql,
        repeat_days: repeatDays,
      });

      // 3) Create today's daily instance
      const today = new Date().toISOString().slice(0, 10);

      await supabase.from("daily_task_instances").insert({
        resident_id: resident.id,
        activity_id: act.id,
        scheduled_time: timeSql,
        date: today,
        status: "pending",
      });
    }

    // EDIT EXISTING TASK
    else {
      const { activity_id } = editingTask;

      // Update task name + default time
      await supabase
        .from("activities")
        .update({
          label: taskLabel,
          default_time: timeSql,
          repeat_days: repeatDays,
        })
        .eq("id", activity_id);

      // Update resident_activities scheduled_time
      await supabase
        .from("resident_activities")
        .update({ scheduled_time: timeSql })
        .eq("resident_id", resident.id)
        .eq("activity_id", activity_id);

      // Update today's daily instance
      const today = new Date().toISOString().slice(0, 10);

      await supabase
        .from("daily_task_instances")
        .update({ scheduled_time: timeSql })
        .eq("resident_id", resident.id)
        .eq("activity_id", activity_id)
        .eq("date", today);
    }

    // Close modal + reload
    setTaskModalVisible(false);
    setEditingTask(null);
    loadTasks();
  };

  // OPEN MODAL FOR ADD
  const openAddSpecificTask = () => {
    setEditingTask(null);
    setTaskLabel("");
    setTaskTime(new Date());
    setTaskModalVisible(true);
  };

  // OPEN MODAL FOR EDIT
  const openEditSpecificTask = (task) => {
    setEditingTask(task);
    setTaskLabel(task.label);
    setTaskTime(moment(task.scheduled_time, "HH:mm:ss").toDate());
    setTaskModalVisible(true);
  };
  const deleteSpecificTask = async (task) => {
    try {
      const today = new Date().toISOString().slice(0, 10);

      // 1. Delete today's daily instance
      await supabase
        .from("daily_task_instances")
        .delete()
        .match({
          resident_id: resident.id,
          activity_id: task.activity_id,
          date: today,
        });

      // 2. Delete resident_activities mapping
      await supabase
        .from("resident_activities")
        .delete()
        .match({
          resident_id: resident.id,
          activity_id: task.activity_id,
        });

      // 3. Delete the activity itself
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", task.activity_id);

      if (error) throw error;

      // 4. Reload tasks
      await fetchTasks();

    } catch (err) {
      console.log("Delete task error:", err.message || err);
    }
  };

  // TOGGLE STATUS
  const toggleSpecificTaskStatus = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";

    const today = new Date().toISOString().slice(0, 10);

    await supabase
      .from("daily_task_instances")
      .update({ status: newStatus })
      .eq("resident_id", resident.id)
      .eq("activity_id", task.activity_id)
      .eq("date", today);

    loadTasks();
  };


  /* ---------- Render ---------- */

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {editMode ? formData.name || "Edit Resident" : formData.name}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {!editMode && (
                <TouchableOpacity onPress={() => setEditMode(true)} style={{ marginRight: 10 }}>
                  <MaterialIcons name="edit" size={24} color="#fff" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <DateNavigator
            date={selectedDate}
            onChange={(d) => setSelectedDate(d)}
          />
          {!isToday && (
            <Text style={{ textAlign: "center", color: "#6B7280", marginBottom: 6 }}>
              Viewing past tasks (read-only)
            </Text>
          )}


          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Profile Info */}
            <View style={styles.profileRow}>
              <TouchableOpacity onPress={handlePickResidentPhoto}>
                {resident.photo_url ? (
                  <Image
                    source={{ uri: resident.photo_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.defaultAvatar]}>
                    <Text style={styles.avatarText}>
                      {resident.name?.charAt(0)?.toUpperCase() || "?"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>


              <View style={{ marginLeft: 12, flex: 1 }}>
                {editMode ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={formData.name}
                      onChangeText={(t) => setFormData({ ...formData, name: t })}
                      placeholder="Name"
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.age}
                      onChangeText={(t) => setFormData({ ...formData, age: t })}
                      placeholder="Age"
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.room_number}
                      onChangeText={(t) => setFormData({ ...formData, room_number: t })}
                      placeholder="Bed Number"
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.condition}
                      onChangeText={(t) => setFormData({ ...formData, condition: t })}
                      placeholder="Condition"
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.info}>🧓 Age: {resident.age}</Text>
                    <Text style={styles.info}>🛏 Bed: {resident.room_number}</Text>
                    <Text style={styles.info}>⚕️ Condition: {resident.condition || "N/A"}</Text>
                  </>
                )}
              </View>
            </View>

            {/* -------------------- SPECIFIC TASKS (NEW UI) -------------------- */}
            <View style={styles.sectionCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.sectionTitle}>Specific Tasks</Text>

                <TouchableOpacity
                  onPress={() => {
                    if (!isToday) return;
                    editTasks ? cancelTaskEdits() : startTaskEditing();
                  }}
                  style={{ opacity: !isToday ? 0.4 : 1 }}
                >


                  <MaterialIcons
                    name={editTasks ? "close" : "edit"}
                    size={22}
                    color={editTasks ? "#ef4444" : "#2563EB"}
                  />
                </TouchableOpacity>
              </View>

              {loadingTasks ? (
                <ActivityIndicator color="#2563EB" />
              ) : tasks.length === 0 ? (
                <Text style={{ color: "#6B7280", marginTop: 6 }}>No tasks assigned.</Text>
              ) : (
                tasks.map((item) => (
                  <View key={item.id} style={styles.taskRow}>
                    {/* CHECK/UNCHECK */}
                    {!editTasks ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (!isToday) return;
                          toggleSpecificTaskStatus(item);
                        }}
                        style={{ marginRight: 10, opacity: !isToday ? 0.4 : 1 }}
                      >

                        <MaterialIcons
                          name={item.status === "done" ? "check-circle" : "radio-button-unchecked"}
                          size={26}
                          color={item.status === "done" ? "#16A34A" : "#9CA3AF"}
                        />
                      </TouchableOpacity>
                    ) : null}

                    {/* LABEL + TIME */}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.taskText, item.status === "done" && { textDecorationLine: "line-through", color: "#6B7280" }]}>
                        {item.label}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#6B7280" }}>
                        ⏰ {moment(item.scheduled_time, "HH:mm:ss").format("h:mm A")}
                      </Text>
                    </View>

                    {/* EDIT MODE ACTIONS */}
                    {editTasks && isToday && (
                      <View style={{ flexDirection: "row", alignItems: "center" }}>

                        <TouchableOpacity onPress={() => openEditSpecificTask(item)} style={{ marginRight: 12 }}>
                          <MaterialIcons name="edit" size={22} color="#2563EB" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deleteSpecificTask(item)}>
                          <MaterialIcons name="delete" size={22} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}

              {/* ADD BUTTON (EDIT MODE ONLY) */}
              {editTasks && isToday && (
                <TouchableOpacity style={styles.addButton} onPress={openAddSpecificTask}>

                  <Text style={styles.addButtonText}>+ Add Task</Text>
                </TouchableOpacity>
              )}

            </View>

            {/* SPECIFIC TASKS MODAL */}
            <Modal visible={taskModalVisible} transparent animationType="fade">
              <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                  <Text style={styles.modalTitle}>
                    {editingTask ? "Edit Task" : "Add Task"}
                  </Text>

                  <Text style={styles.modalLabel}>Label</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={taskLabel}
                    onChangeText={setTaskLabel}
                    placeholder="Task name"
                  />

                  <Text style={styles.modalLabel}>Time</Text>

                  <TouchableOpacity style={styles.timeButton} onPress={() => setShowTaskTimePicker(true)}>
                    <MaterialIcons name="schedule" size={22} color="#2563EB" />
                    <Text style={styles.timeButtonText}>{moment(taskTime).format("h:mm A")}</Text>
                  </TouchableOpacity>

                  {showTaskTimePicker && (
                    <DateTimePicker
                      value={taskTime}
                      mode="time"
                      display="spinner"
                      is24Hour={false}
                      onChange={(e, picked) => {
                        if (picked) setTaskTime(picked);
                        setShowTaskTimePicker(false);
                      }}
                    />
                  )}
                  <Text style={styles.modalLabel}>Repeat on</Text>

                  <View style={styles.weekRow}>
                    {WEEKDAYS.map((d) => {
                      const selected = repeatDays.includes(d.value);
                      return (
                        <TouchableOpacity
                          key={d.value}
                          style={[
                            styles.dayCircle,
                            selected && styles.dayCircleActive,
                          ]}
                          onPress={() =>
                            setRepeatDays((prev) =>
                              prev.includes(d.value)
                                ? prev.filter((x) => x !== d.value)
                                : [...prev, d.value]
                            )
                          }
                        >
                          <Text
                            style={[
                              styles.dayText,
                              selected && styles.dayTextActive,
                            ]}
                          >
                            {d.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>


                  {/* Modal Buttons */}
                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setTaskModalVisible(false)}>
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveBtn} onPress={saveSpecificTaskFromModal}>
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Intake / Output (separate) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Intake / Output (Today)</Text>

              {ioLoading ? (
                <ActivityIndicator color="#2563EB" />
              ) : ioEntries.length === 0 ? (
                <Text style={{ color: "#6B7280" }}>No entries added today.</Text>
              ) : (
                ioEntries.map((item) => (
                  <View key={item.id} style={styles.ioRow}>
                    <Text style={styles.ioText}>🕒 {item.time?.slice(0, 5) ?? "—"}</Text>
                    <Text style={styles.ioText}>🥤 Intake: {item.intake_ml ?? 0} ml</Text>
                    <Text style={styles.ioText}>💧 Urine: {item.urine_ml ?? 0} ml</Text>
                    <Text style={styles.ioText}>🚽 Stool: {item.stool ?? "—"}</Text>
                  </View>
                ))
              )}

              <TouchableOpacity
                style={[styles.addButton, !isToday && { opacity: 0.4 }]}
                disabled={!isToday}
                onPress={() => setShowIoForm(true)}
              >
                <Text style={styles.addButtonText}>+ Add Intake/Output Entry</Text>
              </TouchableOpacity>

            </View>

            {/* Vitals (separate) */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Vitals (TPR / BP)</Text>

              {vitalsLoading ? (
                <ActivityIndicator color="#2563EB" />
              ) : vitals.length === 0 ? (
                <Text style={{ color: "#6B7280" }}>No vitals recorded today.</Text>
              ) : (

                vitals.map((v) => (
                  <View key={v.id} style={styles.vitalsCard}>
                    {/* Time */}
                    <Text style={styles.vitalsTime}>
                      🕒 {v.time ? moment(v.time, "HH:mm:ss").format("h:mm A") : "—"}

                    </Text>

                    {/* Row 1 */}
                    <View style={styles.vitalsRow}>
                      <Text style={styles.vitalsItem}><Text style={styles.vitalsLabel}>BP:</Text> {v.bp || "—"}</Text>
                      <Text style={styles.vitalsItem}><Text style={styles.vitalsLabel}>Temp:</Text> {v.temp || "—"}</Text>
                    </View>

                    {/* Row 2 */}
                    <View style={styles.vitalsRow}>
                      <Text style={styles.vitalsItem}><Text style={styles.vitalsLabel}>Pulse:</Text> {v.pulse || "—"}</Text>
                      <Text style={styles.vitalsItem}><Text style={styles.vitalsLabel}>Resp:</Text> {v.resp || "—"}</Text>
                    </View>

                    {/* Row 3 */}
                    <View style={styles.vitalsRow}>
                      <Text style={styles.vitalsItem}><Text style={styles.vitalsLabel}>SPO₂:</Text> {v.spo2 || "—"}</Text>
                      <Text style={styles.vitalsItem}><Text style={styles.vitalsLabel}>Sugar:</Text> {v.sugar || "—"}</Text>
                    </View>

                    {/* Row 4 (single column) */}
                    <Text style={styles.vitalsSingle}>
                      <Text style={styles.vitalsLabel}>Insulin:</Text> {v.insulin || "—"}
                    </Text>
                  </View>
                ))
              )}


              <TouchableOpacity
                style={[styles.addButton, !isToday && { opacity: 0.4 }]}
                disabled={!isToday}
                onPress={() => {
                  setVitalTime(new Date());
                  setShowVitalsForm(true);
                }}
              >
                <Text style={styles.addButtonText}>+ Add Vitals</Text>
              </TouchableOpacity>


            </View>

            {/* Save / Cancel (global resident info) */}
            {editMode && (
              <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelResident} disabled={savingResident}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveResident} disabled={savingResident}>
                  {savingResident ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Changes</Text>}
                </TouchableOpacity>
              </View>
            )}

            {/* Intake/Output Form Modal */}
            {showIoForm && (
              <Modal visible transparent animationType="fade">
                <View style={styles.formOverlay}>
                  <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Add Intake / Output</Text>

                    <TextInput
                      style={styles.input}
                      placeholder="Intake (ml)"
                      keyboardType="numeric"
                      value={newIo.intake_ml}
                      onChangeText={(t) => setNewIo({ ...newIo, intake_ml: t })}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Urine (ml)"
                      keyboardType="numeric"
                      value={newIo.urine_ml}
                      onChangeText={(t) => setNewIo({ ...newIo, urine_ml: t })}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder="Stool (Pass / Not Pass)"
                      value={newIo.stool}
                      onChangeText={(t) => setNewIo({ ...newIo, stool: t })}
                    />

                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                      <TouchableOpacity
                        style={[styles.saveBtn, { flex: 1, marginRight: 5 }]}
                        onPress={handleSaveIoEntry}
                      >
                        <Text style={styles.saveText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.cancelBtn, { flex: 1, marginLeft: 5 }]}
                        onPress={() => setShowIoForm(false)}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}

            {/* Vitals Form Modal */}
            {showVitalsForm && (
              <Modal visible transparent animationType="fade">
                <View style={styles.modalBg}>
                  <View style={styles.formCard}>
                    <Text style={styles.modalTitle}>Add Vital Reading</Text>
                    <Text style={styles.modalLabel}>Time</Text>

                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => setShowVitalTimePicker(true)}
                    >
                      <MaterialIcons name="schedule" size={22} color="#2563EB" />
                      <Text style={styles.timeButtonText}>
                        {moment(vitalTime).format("h:mm A")}
                      </Text>
                    </TouchableOpacity>

                    {showVitalTimePicker && (
                      <DateTimePicker
                        value={vitalTime}
                        mode="time"
                        display="spinner"
                        is24Hour={false}
                        onChange={(e, picked) => {
                          if (picked) setVitalTime(picked);
                          setShowVitalTimePicker(false);
                        }}
                      />
                    )}


                    {["bp", "temp", "pulse", "resp", "spo2", "sugar", "insulin"].map((field) => (
                      <TextInput
                        key={field}
                        placeholder={field.toUpperCase()}
                        style={styles.input}
                        value={vitalForm[field]}
                        onChangeText={(t) => setVitalForm((prev) => ({ ...prev, [field]: t }))}
                      />
                    ))}

                    <View style={styles.formRow}>
                      <TouchableOpacity
                        style={[styles.saveBtn, { flex: 1 }]}
                        onPress={async () => {
                          try {
                            const { error } = await supabase.from("vitals").insert({
                              resident_id: resident.id,
                              time: moment(vitalTime).format("HH:mm:ss"),
                              ...vitalForm,
                            });

                            if (error) throw error;
                            setVitals((prev) => [
                              {
                                id: Date.now().toString(),
                                ...vitalForm,
                              },
                              ...prev,
                            ]);
                            setShowVitalsForm(false);
                            setVitalForm({
                              bp: "",
                              temp: "",
                              pulse: "",
                              resp: "",
                              spo2: "",
                              sugar: "",
                              insulin: "",
                            });
                            Toast.show({ type: "success", text1: "Vital saved" });
                          } catch (err) {
                            console.error("Vitals insert error:", err.message || err);
                            Toast.show({ type: "error", text1: "Vitals save failed" });
                          }
                        }}
                      >
                        <Text style={styles.saveText}>Save</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.cancelBtn, { flex: 1, marginLeft: 6 }]}
                        onPress={() => setShowVitalsForm(false)}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
            )}
          </ScrollView>
        </View>
      </View >
    </Modal >
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    width: "92%",
    height: "90%",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 6,
  },
  header: {
    backgroundColor: "#2563EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#fff" },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
  },
  defaultAvatar: {
    backgroundColor: "#E5E7EB",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#6B7280",
  },

  info: { color: "#374151", fontSize: 14, marginBottom: 4 },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
    backgroundColor: "#fff",
  },

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 110,
  },
  saveText: { color: "#fff", fontWeight: "600" },

  cancelBtn: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: { color: "#374151", fontWeight: "600" },

  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    borderTopWidth: 3,
    borderTopColor: "#2563EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 6,
    borderBottomWidth: 2,
    borderColor: "#DBEAFE",
    paddingBottom: 4,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  taskText: { marginLeft: 10, fontSize: 15, color: "#111827", flexShrink: 1 },
  taskTime: { marginLeft: 6, color: "#6B7280", fontSize: 13 },

  addButton: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginTop: 18,
    marginBottom: 24,
  },

  formOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    width: "88%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    elevation: 6,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#2563EB",
  },

  ioRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  ioText: {
    fontSize: 14,
    color: "#374151",
  },

  ioCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  ioLine: { fontSize: 14, marginBottom: 2 },
  ioValue: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "700",
  },

  // modal forms
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  formCard: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 10,
  },

  formRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "white",
    width: "85%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 10,
  },
  modalInput: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  timeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1E3A8A",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginRight: 10,
  },
  cancelBtnText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#374151",
  },
  saveBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#2563EB",
    borderRadius: 8,
  },
  saveBtnText: {
    textAlign: "center",
    fontWeight: "700",
    color: "white",
  },
  editBar: {
    flexDirection: "row",
    marginTop: 12,
  },
  cancelBarBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  cancelBarText: {
    textAlign: "center",
    fontWeight: "600",
    color: "#374151",
  },
  saveBarBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
  },
  saveBarText: {
    textAlign: "center",
    fontWeight: "700",
    color: "white",
  },
  addButton: {
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
  vitalsCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  vitalsTime: {
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 6,
  },

  vitalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  vitalsItem: {
    width: "48%",
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },

  vitalsSingle: {
    fontSize: 14,
    marginTop: 4,
    color: "#111827",
  },

  vitalsLabel: {
    fontWeight: "700",
    color: "#1E3A8A",
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginVertical: 8,
  },


  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },


  dayCircleActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  dayText: {
    color: "#374151",
    fontWeight: "600",
  },

  dayTextActive: {
    color: "#fff",
  },

});
