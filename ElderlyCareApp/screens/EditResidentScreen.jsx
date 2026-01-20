import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../supabase/supabaseClient";
import Toast from "react-native-toast-message";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function EditResidentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { resident } = route.params;

  const [form, setForm] = useState({
    name: resident.name || "",
    age: resident.age?.toString() || "",
    room_number: resident.room_number || "",
    condition: resident.condition || "",
    guardian_name: resident.guardian_name || "",
    guardian_contact: resident.guardian_contact || "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }

    if (saving) return;
    setSaving(true);

    const { error } = await supabase
      .from("residents")
      .update({
        name: form.name.trim(),
        age: form.age ? parseInt(form.age) : null,
        room_number: form.room_number || null,
        condition: form.condition || null,
        guardian_name: form.guardian_name || null,
        guardian_contact: form.guardian_contact || null,
      })
      .eq("id", resident.id);

    if (error) {
      Toast.show({ type: "error", text1: "Update failed" });
    } else {
      Toast.show({ type: "success", text1: "Resident updated" });
      navigation.goBack();
    }

    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Resident</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>

        {[
          { key: "name", label: "Resident Name" },
          { key: "age", label: "Age", keyboard: "numeric" },
          { key: "room_number", label: "Room / Bed" },
          { key: "condition", label: "Condition" },
          { key: "guardian_name", label: "Guardian Name" },
          { key: "guardian_contact", label: "Guardian Contact", keyboard: "phone-pad" },
        ].map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={form[field.key]}
              keyboardType={field.keyboard || "default"}
              onChangeText={(text) => handleChange(field.key, text)}
            />
          </View>
        ))}

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.saveBtn]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelBtn]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  form: {
    padding: 16,
  },

  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#2563EB",
  },
  cancelBtn: {
    backgroundColor: "#6B7280",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
