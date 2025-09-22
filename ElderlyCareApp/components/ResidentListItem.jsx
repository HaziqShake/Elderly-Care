// components/ResidentListItem.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ResidentListItem({ resident, onPress, isGrid }) {
  return (
    <TouchableOpacity
      style={[styles.card, isGrid && styles.gridCard]}
      onPress={onPress}
    >
      <Image
        source={
          typeof resident.photo === "string"
            ? { uri: resident.photo } // URL photo
            : resident.photo // require() photo
        }
        style={isGrid ? styles.avatarGrid : styles.avatarList}
      />
      <Text style={styles.name}>{resident.name}</Text>

      {resident.pendingCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{resident.pendingCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  gridCard: {
    width: "30%",
  },
  avatarGrid: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 6,
  },
  avatarList: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
