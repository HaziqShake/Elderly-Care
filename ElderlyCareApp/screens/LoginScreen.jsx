import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../supabase/supabaseClient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Enter email and password");
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

        Alert.alert(
          "Account created",
          "You can now log in with your email and password"
        );
        setIsSignup(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSignup ? "Create Account" : "Login"}
      </Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>
          {isSignup ? "Sign Up" : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
        <Text style={styles.switchText}>
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
    color: "#2563EB",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  primaryButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
  switchText: {
    marginTop: 16,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "600",
  },
});
