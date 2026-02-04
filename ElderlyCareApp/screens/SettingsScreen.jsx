import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState} from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../supabase/supabaseClient";

export default function SettingsScreen() {
  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);
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
  setConfirmLogoutVisible(true);
};

const confirmLogout = async () => {
  await supabase.auth.signOut();
  setConfirmLogoutVisible(false);
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#2563EB", marginBottom: 12, fontSize: 16 }}>
            Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.card}>
          <MaterialIcons name="person" size={36} color="#2563EB" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.label}>Logged in as</Text>
            <Text style={styles.value}>
              {email || "-"}
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
      {/* LOGOUT CONFIRMATION MODAL */}
<Modal
  visible={confirmLogoutVisible}
  transparent
  animationType="fade"
>
  <View style={styles.modalOverlay}>
    <View style={styles.confirmCard}>
      <Text style={styles.confirmTitle}>Log out</Text>
      <Text style={styles.confirmText}>
        Are you sure you want to log out?
      </Text>

      <View style={styles.modalButtonsRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setConfirmLogoutVisible(false)}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={confirmLogout}
        >
          <Text style={styles.logoutBtnText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  modalOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
},

confirmCard: {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 12,
  width: "85%",
},

confirmTitle: {
  fontSize: 18,
  fontWeight: "600",
  marginBottom: 8,
  textAlign: "center",
},

confirmText: {
  fontSize: 14,
  color: "#374151",
  textAlign: "center",
  marginBottom: 16,
},

modalButtonsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
},

cancelBtn: {
  flex: 1,
  backgroundColor: "#E5E7EB",
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
  marginRight: 6,
},

cancelBtnText: {
  color: "#374151",
  fontWeight: "500",
},

logoutBtn: {
  flex: 1,
  backgroundColor: "#DC2626",
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
  marginLeft: 6,
},

logoutBtnText: {
  color: "#FFFFFF",
  fontWeight: "600",
},

});
