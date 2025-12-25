import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../supabase/supabaseClient";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#2563EB", marginBottom: 12, fontSize: 16 }}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <MaterialIcons name="person" size={36} color="#2563EB" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.label}>Logged in as</Text>
            <Text style={styles.value}>
              {email || "—"}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity style={styles.row} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="#DC2626" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Elderly Care App</Text>
          <Text style={styles.footerSub}>Version 1.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F8FB",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  footerSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
});
