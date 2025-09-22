// components/ResidentCardModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function ResidentCardModal({
  resident,
  onClose,
  onUpdateActivities,
  onUpdateMedicines,
  onUpdateIntakeOutput,
  onUpdateVitals,
}) {
  const [activities, setActivities] = useState(resident.activities || []);
  const [medicines, setMedicines] = useState(resident.medicines || []);
  const [intakeOutput, setIntakeOutput] = useState(resident.intake_output || []);
  const [vitals, setVitals] = useState(resident.vitals || []);

  const toggleTask = (id) => {
    const updated = activities.map((a) =>
      a.id === id ? { ...a, done: !a.done } : a
    );
    setActivities(updated);
    onUpdateActivities?.(resident.id, updated);
  };

  const toggleMedicine = (id) => {
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, given: !m.given } : m
    );
    setMedicines(updated);
    onUpdateMedicines?.(resident.id, updated);
  };

  const addIntakeEntry = () => {
    const now = new Date();
    const newEntry = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      intake_ml: `${Math.floor(100 + Math.random() * 300)} ml`,
      urine_ml: `${Math.floor(50 + Math.random() * 200)} ml`,
      stool: Math.random() > 0.8 ? "Pass" : "Not Pass",
    };
    const updated = [...intakeOutput, newEntry];
    setIntakeOutput(updated);
    onUpdateIntakeOutput?.(resident.id, updated);
  };

  const addVitalReading = () => {
    const now = new Date();
    const newReading = {
      id: Date.now().toString(),
      date: now.toISOString().split("T")[0],
      time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      bp: "120/80",
      temp: "98.6°F",
      pulse: "76",
      resp: "18",
      spo2: "97%",
      sugar: "110 mg/dl",
      insulin: "2 U",
    };
    const updated = [...vitals, newReading];
    setVitals(updated);
    onUpdateVitals?.(resident.id, updated);
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{resident.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={26} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            {/* Resident Info */}
            <View style={styles.profileRow}>
              <Image source={{ uri: resident.photo }} style={styles.avatar} />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.info}>Bed: {resident.room_number}</Text>
                <Text style={styles.info}>Age: {resident.age}</Text>
                <Text style={styles.info}>{resident.condition || ""}</Text>
              </View>
            </View>

            {/* Specific Tasks */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Specific Tasks</Text>
              {activities.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.taskRow,
                    { backgroundColor: item.done ? "#D1FAE5" : "#F9FAFB" },
                  ]}
                  onPress={() => toggleTask(item.id)}
                >
                  <MaterialIcons
                    name={item.done ? "check-circle" : "radio-button-unchecked"}
                    size={22}
                    color={item.done ? "#16A34A" : "#9CA3AF"}
                  />
                  <Text
                    style={[
                      styles.taskText,
                      item.done && {
                        textDecorationLine: "line-through",
                        color: "#6B7280",
                      },
                    ]}
                  >
                    <Text style={styles.ioValue}>{item.label}</Text>
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.divider} />

            {/* Medicines */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Medicines</Text>
              {medicines.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.medicineRow,
                    { backgroundColor: item.given ? "#D1FAE5" : "#F9FAFB" },
                  ]}
                  onPress={() => toggleMedicine(item.id)}
                >
                  <MaterialIcons
                    name={item.given ? "check-circle" : "radio-button-unchecked"}
                    size={22}
                    color={item.given ? "#16A34A" : "#9CA3AF"}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text
                      style={[
                        styles.medicineName,
                        item.given && {
                          textDecorationLine: "line-through",
                          color: "#6B7280",
                        },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text style={styles.medicineDetails}>
                      <Text style={styles.ioLabel}>💊 Dosage: </Text>
                      <Text style={styles.ioValue}>{item.dosage}</Text>
                    </Text>
                    <Text style={styles.medicineDetails}>
                      <Text style={styles.ioLabel}>📋 Instructions: </Text>
                      <Text style={styles.ioValue}>{item.instructions}</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.divider} />

            {/* Intake / Output */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Intake / Output</Text>
              {intakeOutput.map((item) => (
                <View key={item.id} style={styles.ioCard}>
                  <Text style={styles.ioLine}>
                    <Text style={styles.ioLabel}>💧 Water Intake: </Text>
                    <Text style={styles.ioValue}>{item.intake_ml}</Text>
                  </Text>
                  <Text style={styles.ioLine}>
                    <Text style={styles.ioLabel}>🚻 Urine: </Text>
                    <Text style={styles.ioValue}>{item.urine_ml}</Text>
                  </Text>
                  <Text style={styles.ioLine}>
                    <Text style={styles.ioLabel}>🚾 Stool: </Text>
                    <Text style={styles.ioValue}>{item.stool}</Text>
                  </Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addIntakeEntry}>
                <Text style={styles.addButtonText}>+ Add Entry</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            {/* Vitals */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Vitals (TPR / BP)</Text>
              {vitals.map((item) => (
                <View key={item.id} style={styles.vitalCard}>
                  <Text style={styles.vitalDate}>
                    {item.date} — {item.time}
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>🩺 BP: </Text>
                    <Text style={styles.vitalValue}>{item.bp}</Text>
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>🌡 Temp: </Text>
                    <Text style={styles.vitalValue}>{item.temp}</Text>
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>❤️ Pulse: </Text>
                    <Text style={styles.vitalValue}>{item.pulse}</Text>
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>🌬 Resp: </Text>
                    <Text style={styles.vitalValue}>{item.resp}</Text>
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>🩸 SpO₂: </Text>
                    <Text style={styles.vitalValue}>{item.spo2}</Text>
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>🍬 Sugar: </Text>
                    <Text style={styles.vitalValue}>{item.sugar}</Text>
                  </Text>
                  <Text style={styles.vitalLine}>
                    <Text style={styles.vitalLabel}>💉 Insulin: </Text>
                    <Text style={styles.vitalValue}>{item.insulin}</Text>
                  </Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addButton} onPress={addVitalReading}>
                <Text style={styles.addButtonText}>+ Add Vital</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
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
  closeBtn: { padding: 6 },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatar: { width: 70, height: 70, borderRadius: 35 },
  info: { color: "#374151", fontSize: 14, marginBottom: 2 },

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
    marginBottom: 10,
    borderBottomWidth: 2,
    borderColor: "#DBEAFE",
    paddingBottom: 4,
  },

  // tasks
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  taskText: { marginLeft: 10, fontSize: 15, color: "#111827" },

  // medicines
  medicineRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A8A",
  },
  medicineDetails: {
    fontSize: 13,
    color: "#374151",
    marginTop: 2,
  },

  // intake/output
  ioCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  ioLine: { fontSize: 14, marginBottom: 2 },
  ioLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  ioValue: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "700",
  },

  addButton: {
    marginTop: 10,
    backgroundColor: "#2563EB",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  // vitals
  vitalCard: {
    backgroundColor: "#F0F7FF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  vitalDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 6,
  },
  vitalLine: { fontSize: 14, marginBottom: 2 },
  vitalLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  vitalValue: {
    fontSize: 14,
    color: "#1E3A8A",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#DBEAFE",
    marginVertical: 12,
    marginHorizontal: 8,
    borderRadius: 1,
  },
});
