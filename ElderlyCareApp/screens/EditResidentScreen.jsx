// screens/EditResidentScreen.jsx
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { supabase } from "../supabase/supabaseClient";
import Toast from "react-native-toast-message";

export default function EditResidentScreen({ route, navigation }) {
  const { resident } = route.params;

  const [form, setForm] = useState({
    name: resident.name || "",
    age: resident.age ? String(resident.age) : "",
    bed_number: resident.room_number || "",
    condition: resident.condition || "",
    guardian_name: resident.guardian_name || "",
    guardian_contact: resident.guardian_contact || "",
    photo_url: resident.photo_url || "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("residents")
      .update({
        name: form.name,
        age: form.age ? parseInt(form.age) : null,
        room_number: form.bed_number,
        condition: form.condition,
        guardian_name: form.guardian_name,
        guardian_contact: form.guardian_contact,
        photo_url: form.photo_url,
      })
      .eq("id", resident.id);

    if (error) {
      console.error("Update error:", error.message);
      Toast.show({
        type: "error",
        text1: "Failed to update resident",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Resident updated successfully",
      });
      navigation.goBack();
    }

  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("residents")
      .delete()
      .eq("id", resident.id);

    if (error) {
      console.error("Delete error:", error.message);
      Toast.show({
        type: "error",
        text1: "Failed to delete resident",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Resident deleted",
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Resident</Text>

        {[
          { key: "name", label: "Name" },
          { key: "age", label: "Age", keyboard: "numeric" },
          { key: "bed_number", label: "Bed No." },
          { key: "condition", label: "Condition" },
          { key: "guardian_name", label: "Guardian Name" },
          { key: "guardian_contact", label: "Guardian Contact" },
          { key: "photo_url", label: "Photo URL" },
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

        <TouchableOpacity style={[styles.button, styles.updateBtn]} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.deleteBtn]} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
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
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  updateBtn: { backgroundColor: "#2563EB" },
  deleteBtn: { backgroundColor: "#DC2626" }, // red
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
