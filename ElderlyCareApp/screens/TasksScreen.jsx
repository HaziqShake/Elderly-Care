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
  Alert,
} from "react-native";
import { supabase } from "../supabase/supabaseClient";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setLabel(editingTask.label);
      setTime(moment(editingTask.scheduled_time, "HH:mm:ss").toDate());
      setRepeatDays(editingTask.repeat_days || [0, 1, 2, 3, 4, 5, 6]);
    } else {
      setLabel("");
      setTime(new Date());
      setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
    }
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
            onPress={() => setShowPicker(true)}
          >
            <MaterialIcons name="schedule" size={22} color="#2563EB" />
            <Text style={styles.timeButtonText}>
              {moment(time).format("h:mm A")}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              is24Hour={false}
              onChange={(e, picked) => {
                if (picked) setTime(picked);
                setShowPicker(false);
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

          <View style={styles.modalButtonsRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          </View>
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
      Alert.alert("Error", "User not authenticated");
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
        Alert.alert("Error", actErr.message);
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
        Alert.alert("Error", instErr.message);
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
        Alert.alert("Error", error.message);
        return;
      }
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
        Alert.alert("Error", "User not authenticated");
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
    } catch (err) {
      console.error("Delete common task error:", err.message);
      Alert.alert("Error", "Failed to delete task");
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

          <Pressable
            onPress={() =>
              Alert.alert(
                "Delete Task",
                `Delete "${item.label}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteCommonTask(item),
                  },
                ]
              )
            }
          >
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
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 12,
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
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    textAlign: "center",
    fontWeight: "700",
    color: "white",
  },
});
