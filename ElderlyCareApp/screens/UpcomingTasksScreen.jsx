// screens/UpcomingTasksScreen.jsx
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { supabase } from "../supabase/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";

const pad = (n) => (n < 10 ? "0" + n : "" + n);
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function UpcomingTasksScreen() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);

      // 👉 FETCH ALL PENDING TASKS FOR TODAY
      const { data, error } = await supabase
        .from("daily_task_instances")
        .select(
          `id, resident_id, scheduled_time, status,
           residents(name),
           activities(label, type)`
        )
        .eq("date", today)
        .eq("status", "pending")
        .order("scheduled_time", { ascending: true });

      if (error) throw error;

      setTasks(
        (data || []).filter((t) => t.scheduled_time) // ignore untimed
      );
    } catch (err) {
      console.error("fetchTasks error:", err.message || err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const iv = setInterval(fetchTasks, 30_000);
    return () => clearInterval(iv);
  }, [fetchTasks]);

  // 👉 FILTER: overdue OR within next 30 minutes
  const upcoming = tasks.filter((t) => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const taskMin = toMinutes(t.scheduled_time);

    return taskMin < nowMin || taskMin - nowMin <= 30;
  });

  const renderItem = ({ item }) => {
    const isCommon = item.resident_id === null || item.activities?.type === "common";
    const residentLabel =
      item.resident_id === null
        ? "All residents"
        : item.residents?.name ?? "Unknown";

    const now = new Date();
    const taskDate = new Date();
    const [hh, mm] = item.scheduled_time.split(":").map(Number);
    taskDate.setHours(hh, mm, 0, 0);
    const overdue = taskDate < now;

    return (
      <View style={styles.card}>
        <MaterialIcons name="schedule" color="#2563EB" size={26} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <View style={styles.row}>
            <Text
              style={styles.taskLabel}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.activities?.label || "Unnamed task"}
            </Text>

            <View style={[styles.tag, isCommon ? styles.commonTag : styles.specificTag]}>
              <Text style={styles.tagText}>
                {isCommon ? "COMMON" : "SPECIFIC"}
              </Text>
            </View>
          </View>

          {overdue && (
            <View style={[styles.tag, styles.overdueTag]}>
              <Text style={styles.overdueTagText}>OVERDUE</Text>
            </View>
          )}

          <Text style={styles.residentName}>👵 {residentLabel}</Text>
          <Text style={styles.time}>⏰ {item.scheduled_time.slice(0, 5)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F8FB" }}>
      <View style={styles.container}>
        <Text style={styles.title}>Upcoming Tasks</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 30 }} />
        ) : upcoming.length === 0 ? (
          <Text style={styles.empty}>No upcoming tasks 🎉</Text>
        ) : (
          <FlatList
            data={upcoming}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
    textAlign: "center",
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    marginHorizontal: 14,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A8A",
    marginRight: 8,
  },
  residentName: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
  time: {
    fontSize: 14,
    color: "#2563EB",
    marginTop: 2,
  },
  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#6B7280",
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexShrink: 0,
  },
  commonTag: {
    backgroundColor: "#E0F2FE",
  },
  specificTag: {
    backgroundColor: "#F0FDF4",
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E3A8A",
  },
  overdueTag: {
    backgroundColor: "#FEE2E2",
    marginTop: 4,
    alignSelf: "flex-start",
  },
  overdueTagText: {
    color: "#B91C1C",
    fontWeight: "700",
    fontSize: 11,
  },
});
