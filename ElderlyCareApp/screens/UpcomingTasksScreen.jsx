// screens/UpcomingTasksScreen.jsx
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import { supabase } from "../supabase/supabaseClient";
import { MaterialIcons } from "@expo/vector-icons";

const pad = (n) => (n < 10 ? "0" + n : "" + n);
const toMinutes = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const toLocalDateString = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function UpcomingTasksScreen() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const today = toLocalDateString(new Date());
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("daily_task_instances")
        .select(
          `id, resident_id, scheduled_time, status,
           residents(name),
           activities(label, type, repeat_days)`
        )
        .eq("date", today)
        .eq("status", "pending")
        .eq("owner_id", user.id)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;
      const weekday = new Date().getDay();

      const filtered = (data || []).filter((t) => {
        const repeatDays = t.activities?.repeat_days;
        if (!Array.isArray(repeatDays) || repeatDays.length === 0) return true;
        return repeatDays.includes(weekday);
      });

      setTasks(filtered.filter((t) => t.scheduled_time));
    } catch (err) {
      console.error("fetchTasks error:", err.message || err);
      setTasks([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useFocusEffect(
    useCallback(() => {
      fetchTasks({ silent: true });
      const iv = setInterval(() => fetchTasks({ silent: true }), 30_000);
      return () => clearInterval(iv);
    }, [fetchTasks])
  );

  // Filter: overdue OR within next 30 minutes
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
            <Text style={styles.taskLabel} numberOfLines={2} ellipsizeMode="tail">
              {item.activities?.label || "Unnamed task"}
            </Text>

            <View style={[styles.tag, isCommon ? styles.commonTag : styles.specificTag]}>
              <Text style={styles.tagText}>{isCommon ? "COMMON" : "SPECIFIC"}</Text>
            </View>
          </View>

          {overdue && (
            <View style={[styles.tag, styles.overdueTag]}>
              <Text style={styles.overdueTagText}>OVERDUE</Text>
            </View>
          )}

          <Text style={styles.residentName}>Resident: {residentLabel}</Text>
          <Text style={styles.time}>
            Time:{" "}
            {new Date(`1970-01-01T${item.scheduled_time}`).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </Text>
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
          <Text style={styles.empty}>No upcoming tasks</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
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
