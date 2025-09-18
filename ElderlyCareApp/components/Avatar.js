import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function Avatar({ initials = "NA", size = 46 }) {
  const bgColors = ["#F59E0B", "#3B82F6", "#EF4444", "#10B981", "#8B5CF6"];
  const bg = bgColors[initials.charCodeAt(0) % bgColors.length];
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.txt, { fontSize: Math.round(size / 2.6) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  txt: { color: "#fff", fontWeight: "700" },
});
