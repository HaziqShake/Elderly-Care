// screens/AddResidentScreen.jsx
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
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

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.bed_number) {
      Alert.alert("Error", "Name and Bed Number are required");
      return;
    }

    const { error } = await supabase.from("residents").insert([{
      name: form.name,
      age: form.age ? parseInt(form.age) : null,
      room_number: form.bed_number,  // ✅ maps to DB column
      condition: form.condition,
      guardian_name: form.guardian_name,
      guardian_contact: form.guardian_contact,
      photo_url: form.photo_url || "https://via.placeholder.com/70",
    }]);

    if (error) {
      console.error("Supabase error:", error.message);
      Alert.alert("Error", "Failed to add resident");
    } else {
      Alert.alert("Success", "Resident added successfully");
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
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

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Save Resident</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20, color: "#2563EB" },
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
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  safe: {
  flex: 1,
  backgroundColor: "#fff",
},


});
