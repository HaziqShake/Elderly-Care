import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export default function Avatar({
  photoUrl,
  initials = "NA",
  size = 46,
}) {
  const hasPhoto =
    typeof photoUrl === "string" && photoUrl.trim().length > 0;

  const bgColors = ["#F59E0B", "#3B82F6", "#EF4444", "#10B981", "#8B5CF6"];
  const bg = bgColors[initials.charCodeAt(0) % bgColors.length];

  if (hasPhoto) {
    return (
      <Image
        source={{ uri: photoUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#0055ffff",
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bg,
        },
      ]}
    >
      <Text style={[styles.txt, { fontSize: Math.round(size / 2.6) }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  txt: {
    color: "#fff",
    fontWeight: "700",
  },
});
