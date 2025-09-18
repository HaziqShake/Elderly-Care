// screens/UpcomingTasksScreen.js
import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function UpcomingTasksScreen({ upcoming = [] }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.header}>Upcoming Tasks</Text>

      {upcoming.length === 0 ? (
        <Text style={styles.empty}>No upcoming tasks</Text>
      ) : (
        <FlatList
          data={upcoming}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <MaterialIcons
                name={item.type === "medicine" ? "medication" : "assignment"}
                size={24}
                color="#2563EB"
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.label}>
                  {item.type === "medicine" ? "💊 Medicine:" : "✅ Task:"}{" "}
                  <Text style={styles.value}>{item.label}</Text>
                </Text>
                <Text style={styles.resident}>👤 {item.resident}</Text>
                <Text style={styles.time}>
                  ⏰{" "}
                  {new Date(item.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB" },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
    textAlign: "center",
    marginVertical: 16,
  },
  empty: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
    marginTop: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 15, fontWeight: "600", color: "#111827" },
  value: { color: "#1E3A8A", fontWeight: "700" },
  resident: { fontSize: 13, color: "#374151", marginTop: 2 },
  time: { fontSize: 13, color: "#6B7280", marginTop: 2 },
});
