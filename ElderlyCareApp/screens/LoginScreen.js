// screens/LoginScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // icon library

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");

  function handleLogin() {
    onLogin({ name: name.trim() || "Manager" });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FB" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        {/* Blue circular icon placeholder */}
        <View style={styles.logoWrapper}>
          <MaterialIcons name="elderly" size={48} color="#fff" />
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.title}>NestCare Manager</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

          <TextInput
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            placeholderTextColor="#9CA3AF"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 4,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#102A43", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 20 },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
