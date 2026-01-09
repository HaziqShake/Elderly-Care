// screens/AddResidentScreen.jsx
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { supabase } from "../supabase/supabaseClient";

export default function AddResidentScreen({ navigation }) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    bed_number: "",
    condition: "",
    guardian_name: "",
    guardian_contact: "",
    photo_url: "",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (saving) return; // 🔒 prevent double submit
    if (!form.name || !form.bed_number) {
      Toast.show({
        type: "error",
        text1: "Name and Bed Number are required",
      });

      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        Toast.show({
          type: "error",
          text1: "User not authenticated",
        });

        setSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("residents")
        .insert([
          {
            name: form.name,
            age: form.age ? parseInt(form.age) : null,
            room_number: form.bed_number,
            condition: form.condition,
            guardian_name: form.guardian_name,
            guardian_contact: form.guardian_contact,
            photo_url: form.photo_url || null,
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        Toast.show({
          type: "error",
          text1: "Failed to add resident",
        });

        setSaving(false);
        return;
      }

      navigation.navigate("MainTabs", {
        screen: "Home",
        params: {
          newResident: data,
        },
      });

      setSaving(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* 🔙 Back button (Web + Mobile) */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Add Resident</Text>

        {[
          { key: "name", label: "Name" },
          { key: "age", label: "Age", keyboard: "numeric" },
          { key: "bed_number", label: "Bed No." },
          { key: "condition", label: "Condition" },
          { key: "guardian_name", label: "Guardian Name" },
          { key: "guardian_contact", label: "Guardian Contact" },
        ].map((field) => (
          <TextInput
            key={field.key}
            style={styles.input}
            placeholder={field.label}
            value={form[field.key]}
            onChangeText={(text) => handleChange(field.key, text)}
            keyboardType={field.keyboard || "default"}
          />
        ))}

        <TouchableOpacity
          style={[styles.button, saving && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Resident"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backText: {
    color: "#2563EB",
    fontSize: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#2563EB",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
