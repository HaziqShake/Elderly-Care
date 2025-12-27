import DateNavigator from "../components/DateNavigator";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { MaterialIcons } from "@expo/vector-icons";

/* -----------------------------------------------------
   WEEKDAY CONSTANT
----------------------------------------------------- */
const WEEKDAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

/* -----------------------------------------------------
   COMMON TASK MODAL (ADD + EDIT)
----------------------------------------------------- */
function CommonTaskModal({ visible, editingTask, onClose, onSave }) {
  const [label, setLabel] = useState("");
  const [time, setTime] = useState(new Date());
  const [repeatDays, setRepeatDays] = useState([0, 1, 2, 3, 4, 5, 6]);

  // custom time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [hour, setHour] = useState("9");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");


  useEffect(() => {
    const d = editingTask
      ? moment(editingTask.scheduled_time, "HH:mm:ss").toDate()
      : new Date();

    setLabel(editingTask ? editingTask.label : "");
    setTime(d);
    setRepeatDays(
      editingTask?.repeat_days || [0, 1, 2, 3, 4, 5, 6]
    );

    let h = d.getHours();
    setAmpm(h >= 12 ? "PM" : "AM");
    h = h % 12 || 12;
    setHour(String(h));
    setMinute(String(d.getMinutes()).padStart(2, "0"));
  }, [editingTask]);


  const handleSave = () => {
    onSave({
      label,
      timeSql: moment(time).format("HH:mm:ss"),
      repeat_days: repeatDays,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {editingTask ? "Edit Common Task" : "Add Common Task"}
          </Text>

          <Text style={styles.modalLabel}>Label</Text>
          <TextInput
            style={styles.modalInput}
            value={label}
            onChangeText={setLabel}
            placeholder="Task name"
          />

          <Text style={styles.modalLabel}>Time</Text>
          <Pressable
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
          >
            <MaterialIcons name="schedule" size={22} color="#2563EB" />
            <Text style={styles.timeButtonText}>
              {hour}:{minute} {ampm}
            </Text>
          </Pressable>

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

          <View style={styles.modalButtonsRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
          {/* 🔽 CUSTOM TIME PICKER MODAL */}
          {showTimePicker && (
            <Modal
              transparent
              animationType="fade"
              presentationStyle="overFullScreen"
            >
              <View
                style={[
                  styles.modalOverlay,
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  },
                ]}
              >
                <View style={[styles.modalCard, { maxHeight: "70%" }]}>
                  <Text style={styles.modalTitle}>Select Time</Text>

                  <Text style={{ textAlign: "center", fontSize: 18, marginBottom: 12 }}>
                    {hour}:{minute} {ampm}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      maxHeight: 220,
                    }}
                  >
                    {/* Hour */}
                    <View style={{ width: 80 }}>
                      <FlatList
                        data={Array.from({ length: 12 }, (_, i) => String(i + 1))}
                        keyExtractor={(i) => i}
                        renderItem={({ item }) => {
                          const selected = hour === item;
                          return (
                            <TouchableOpacity
                              onPress={() => setHour(item)}
                              style={[
                                styles.timeOption,
                                selected && styles.timeOptionSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.timeOptionText,
                                  selected && styles.timeOptionTextSelected,
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>


                    {/* Minute */}
                    <View style={{ width: 80 }}>
                      <FlatList
                        data={Array.from({ length: 60 }, (_, i) =>
                          String(i).padStart(2, "0")
                        )}
                        keyExtractor={(i) => i}
                        renderItem={({ item }) => {
                          const selected = minute === item;
                          return (
                            <TouchableOpacity
                              onPress={() => setMinute(item)}
                              style={[
                                styles.timeOption,
                                selected && styles.timeOptionSelected,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.timeOptionText,
                                  selected && styles.timeOptionTextSelected,
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        }}
                      />
                    </View>


                    {/* AM / PM */}
                    <View style={{ width: 80 }}>
                      {["AM", "PM"].map((p) => {
                        const selected = ampm === p;
                        return (
                          <TouchableOpacity
                            key={p}
                            onPress={() => setAmpm(p)}
                            style={[
                              styles.timeOption,
                              selected && styles.timeOptionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.timeOptionText,
                                selected && styles.timeOptionTextSelected,
                              ]}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                  </View>

                  <View style={styles.modalButtonsRow}>
                    <Pressable
                      style={styles.cancelBtn}
                      onPress={() => setShowTimePicker(false)}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      style={styles.saveBtn}
                      onPress={() => {
                        let h = parseInt(hour, 10);
                        if (ampm === "PM" && h !== 12) h += 12;
                        if (ampm === "AM" && h === 12) h = 0;

                        const d = new Date();
                        d.setHours(h);
                        d.setMinutes(parseInt(minute, 10));
                        d.setSeconds(0);

                        setTime(d);
                        setShowTimePicker(false);
                      }}
                    >
                      <Text style={styles.saveBtnText}>Done</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </Modal>
          )}
          {/* 🔼 END CUSTOM TIME PICKER MODAL */}

        </View>
      </View>
    </Modal>
  );
}

/* -----------------------------------------------------
   MAIN SCREEN
----------------------------------------------------- */
export default function TasksScreen() {
  const [commonTasks, setCommonTasks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedStr = selectedDate.toISOString().split("T")[0];
  const isToday = selectedStr === todayStr;

  /* ---------------------------------------------------
     LOAD COMMON TASKS
  --------------------------------------------------- */
  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("daily_task_instances")
      .select(`
        id,
        scheduled_time,
        status,
        activity_id,
        activities(label, repeat_days)
      `)
      .eq("date", selectedStr)
      .is("resident_id", null)
      .order("scheduled_time", { ascending: true });
    const weekday = new Date(selectedStr).getDay();

    const filtered = (data || []).filter((t) => {
      const repeatDays = t.activities?.repeat_days;
      if (!Array.isArray(repeatDays) || repeatDays.length === 0) return true;
      return repeatDays.includes(weekday);
    });


    if (!error && data) {
      setCommonTasks(
        filtered.map((t) => ({
          id: t.id,
          activity_id: t.activity_id,
          label: t.activities?.label ?? "",
          scheduled_time: t.scheduled_time,
          repeat_days: t.activities?.repeat_days,
          timeDisplay: t.scheduled_time
            ? moment(t.scheduled_time, "HH:mm:ss").format("h:mm A")
            : "—",
          status: t.status,
        }))
      );
    }
  };

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  /* ---------------------------------------------------
     TOGGLE STATUS
  --------------------------------------------------- */
  const toggleCommonTask = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";

    setCommonTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t
      )
    );

    const { error } = await supabase
      .from("daily_task_instances")
      .update({ status: newStatus })
      .eq("id", task.id);

    if (error) {
      setCommonTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t
        )
      );
    }
  };


  /* ---------------------------------------------------
     SAVE ADD / EDIT
  --------------------------------------------------- */
  const handleSaveCommonTask = async ({ label, timeSql, repeat_days }) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Toast.show({ type: "error", text1: "User not authenticated" });
      return;
    }

    if (!editingTask) {
      const { data: activity, error: actErr } = await supabase
        .from("activities")
        .insert({
          label,
          type: "common",
          default_time: timeSql,
          repeat_days,
          owner_id: user.id,
        })
        .select()
        .single();

      if (actErr) {
        Toast.show({ type: "error", text1: actErr.message });
        return;
      }

      const { error: instErr } = await supabase
        .from("daily_task_instances")
        .insert({
          activity_id: activity.id,
          resident_id: null,
          scheduled_time: timeSql,
          date: todayStr,
          status: "pending",
          owner_id: user.id,
        });

      if (instErr) {
        Toast.show({ type: "error", text1: instErr.message });
        return;
      }

    } else {
      const { error } = await supabase
        .from("activities")
        .update({
          label,
          default_time: timeSql,
          repeat_days,
        })
        .eq("id", editingTask.activity_id)
        .eq("owner_id", user.id);

      if (error) {
        Toast.show({ type: "error", text1: error.message });
        return;
      }

      await supabase
        .from("daily_task_instances")
        .update({ scheduled_time: timeSql })
        .eq("activity_id", editingTask.activity_id)
        .eq("date", todayStr)
        .eq("owner_id", user.id);
    }


    setModalVisible(false);
    setEditingTask(null);
    loadTasks();
  };
  const deleteCommonTask = async (task) => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Toast.show({ type: "error", text1: "User not authenticated" });
        return;
      }

      // 1️⃣ Delete daily instances (today + future)
      await supabase
        .from("daily_task_instances")
        .delete()
        .eq("activity_id", task.activity_id)
        .eq("owner_id", user.id);

      // 2️⃣ Delete the activity itself
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", task.activity_id)
        .eq("owner_id", user.id);

      if (error) throw error;

      // 3️⃣ Refresh list
      loadTasks();
      Toast.show({ type: "success", text1: "Task deleted" });

    } catch (err) {
      console.error("Delete common task error:", err.message);
      Toast.show({ type: "error", text1: "Failed to delete task" });
    }
  };



  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  const renderTask = ({ item }) => (
    <View style={styles.taskRow}>
      <Pressable
        onPress={() => toggleCommonTask(item)}
        style={!isToday && { opacity: 0.4 }}
      >
        <MaterialIcons
          name={item.status === "done" ? "check-circle" : "radio-button-unchecked"}
          size={28}
          color={item.status === "done" ? "#22C55E" : "#CBD5E1"}
        />
      </Pressable>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.taskLabel}>{item.label}</Text>
        <Text style={styles.taskTime}>{item.timeDisplay}</Text>
      </View>

      {editMode && (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => {
              setEditingTask(item);
              setModalVisible(true);
            }}
            style={{ marginRight: 12 }}
          >
            <MaterialIcons name="edit" size={24} color="#2563EB" />
          </Pressable>

          <Pressable onPress={() => deleteCommonTask(item)}>

            <MaterialIcons name="delete" size={24} color="#DC2626" />
          </Pressable>
        </View>
      )}

    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>Common Tasks</Text>
          <Pressable onPress={() => setEditMode(!editMode)}>
            <MaterialIcons
              name={editMode ? "close" : "edit"}
              size={26}
              color="#2563EB"
            />
          </Pressable>
        </View>

        {editMode && (
          <Pressable style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>+ Add Task</Text>
          </Pressable>
        )}

        <DateNavigator date={selectedDate} onChange={setSelectedDate} />

        <FlatList
          data={commonTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      <CommonTaskModal
        visible={modalVisible}
        editingTask={editingTask}
        onClose={() => { setModalVisible(false); setEditingTask(null); }}
        onSave={handleSaveCommonTask}
      />
    </SafeAreaView>
  );
}

/* -----------------------------------------------------
   STYLES
----------------------------------------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FB" },
  container: { flex: 1, paddingHorizontal: 16 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563EB",
  },

  addButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },

  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  taskLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  taskTime: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 4,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    width: "85%",
    maxHeight: "70%",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginTop: 12,
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

  weekRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
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
    marginVertical: 4,
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
    color: "white",
  },

  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 6,
  },

  cancelBtnText: {
    color: "#374151",
    fontWeight: "500",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  timePreview: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111827",
  },

  timePickerColumn: {
    width: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginHorizontal: 6,
  },

  timeOption: {
    paddingVertical: 10,
    alignItems: "center",
  },

  timeOptionSelected: {
    backgroundColor: "#2563EB",
    borderRadius: 6,
  },

  timeOptionText: {
    fontSize: 16,
    color: "#374151",
  },

  timeOptionTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
