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
import Toast from "react-native-toast-message";
import { supabase } from "../supabase/supabaseClient";

export default function AddResidentScreen({ navigation }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    room_number: "",
    condition: "",
    guardian_name: "",
    guardian_contact: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (saving) return;

    if (!form.name.trim()) {
      Toast.show({ type: "error", text1: "Name is required" });
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Toast.show({ type: "error", text1: "User not authenticated" });
      setSaving(false);
      return;
    }

    const { data, error } = await supabase
      .from("residents")
      .insert([
        {
          name: form.name.trim(),
          age: form.age ? parseInt(form.age) : null,
          room_number: form.room_number || null,
          condition: form.condition || null,
          guardian_name: form.guardian_name || null,
          guardian_contact: form.guardian_contact || null,
          owner_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      Toast.show({ type: "error", text1: "Failed to add resident" });
      setSaving(false);
      return;
    }

    Toast.show({ type: "success", text1: "Resident added" });

    navigation.navigate("MainTabs", {
      screen: "Home",
      params: { newResident: data },
    });

    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Resident</Text>
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

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.saveText}>
            {saving ? "Saving..." : "Save Resident"}
          </Text>
        </TouchableOpacity>

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

  saveBtn: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});
