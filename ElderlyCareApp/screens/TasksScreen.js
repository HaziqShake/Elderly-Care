// screens/TasksScreen.js
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const initialTasks = [
    { id: "1", label: "Oral Care", done: false },
    { id: "2", label: "Bed Making", done: false },
    { id: "3", label: "Mild Massage", done: false },
    { id: "4", label: "Backcare", done: false },
    { id: "5", label: "Bathing/Sponging", done: false },
    { id: "6", label: "Tea/Coffee/Milk for Patient", done: false },
    { id: "7", label: "Sugar Check / Insulin", done: false },
    { id: "8", label: "Breakfast", done: false },
    { id: "9", label: "Assistance for Exercise / Walk", done: false },
    { id: "10", label: "2-hourly Position Change", done: false },
    { id: "11", label: "Sanitary Care", done: false },
    { id: "12", label: "Diaper Change", done: false },
    { id: "13", label: "Catheter Care", done: false },
    { id: "14", label: "Nail Cutting", done: false },
    { id: "15", label: "Room Hygiene Supervision", done: false },
    { id: "16", label: "Perform Activities/Games", done: false },
    { id: "17", label: "Cloth Wash in Washing Machine", done: false },
    { id: "18", label: "Lunch", done: false },
    { id: "19", label: "Evening Tea/Coffee", done: false },
    { id: "20", label: "Hair Wash", done: false },
    { id: "21", label: "Bed Pan / Urine Pot", done: false },
    { id: "22", label: "Colostomy Bag Cleaning", done: false },
    { id: "23", label: "Eye Drops", done: false },
    { id: "24", label: "Denture Care", done: false },
    { id: "25", label: "Giving Medicines", done: false },
    { id: "26", label: "Veg. Food / Non-Veg. Food", done: false },
];


export default function TasksScreen() {
    const [tasks, setTasks] = useState(initialTasks);

    const toggleTask = (id) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <Text style={styles.header}>Common Task List</Text>

            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.taskRow}
                        onPress={() => toggleTask(item.id)}
                    >
                        <MaterialIcons
                            name={item.done ? "check-circle" : "radio-button-unchecked"}
                            size={22}
                            color={item.done ? "#2563EB" : "#9CA3AF"}
                        />
                        <Text
                            style={[
                                styles.taskText,
                                item.done && { textDecorationLine: "line-through", color: "#6B7280" },
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            />
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
    taskRow: {
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
    taskText: { marginLeft: 10, fontSize: 15, fontWeight: "500", color: "#111827" },
});
