import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../supabase/supabaseClient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleAuth = async () => {
    if (!email || !password || (isSignup && !confirmPassword)) {
      Alert.alert("Missing fields", "Please fill all fields");
      return;
    }

    if (isSignup && password !== confirmPassword) {
      Alert.alert("Password mismatch", "Passwords do not match");
      return;
    }


    setLoading(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
      // ✅ App.js will react via onAuthStateChange
    } catch (e) {
      Alert.alert("Error", e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignup ? "Create Account" : "Login"}
      </Text>

      {/* Email */}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      {/* Password */}
      <View style={styles.passwordRow}>
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity
          onPress={() => setShowPassword((p) => !p)}
          style={styles.eyeBtn}
        >
          <MaterialIcons
            name={showPassword ? "visibility-off" : "visibility"}
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      {/* Confirm Password (Signup only) */}
      {isSignup && (
        <View style={styles.passwordRow}>
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((p) => !p)}
            style={styles.eyeBtn}
          >
            <MaterialIcons
              name={showPassword ? "visibility-off" : "visibility"}
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
      )}


      {/* Submit */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? isSignup
              ? "Creating..."
              : "Logging in..."
            : isSignup
              ? "Create Account"
              : "Login"}
        </Text>
      </TouchableOpacity>

      {/* Toggle Login / Signup */}
      <TouchableOpacity
        onPress={() => setIsSignup((p) => !p)}
        style={{ marginTop: 14 }}
      >
        <Text style={styles.toggleText}>
          {isSignup
            ? "Already have an account? Login"
            : "New here? Create an account"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F7F8FB",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: "#2563EB",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  toggleText: {
    color: "#2563EB",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
