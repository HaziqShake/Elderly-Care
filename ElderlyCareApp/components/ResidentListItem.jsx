import React from "react";
import { View, Text,Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ResidentListItem({ resident, onPress, isGrid }) {
  const initial = resident.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
      ]}
      onPress={onPress}
    >
      {/* AVATAR */}
      {resident.photo_url ? (
        <Image
          source={{ uri: resident.photo_url }}
          style={[
            styles.avatar,
            isGrid ? styles.avatarGrid : styles.avatarList,
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            isGrid ? styles.avatarGrid : styles.avatarList,
          ]}
        >
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}


      {/* NAME */}
      <Text
        style={[
          styles.name,
          !isGrid && { marginLeft: 12 },
        ]}
        numberOfLines={1}
      >
        {resident.name}
      </Text>

      {/* PENDING BADGE */}
      {resident.pendingCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {resident.pendingCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* ---------- CARD LAYOUT ---------- */
  card: {
    position: "relative",
    marginBottom: 16,
  },
  gridCard: {
    width: "30%",
    alignItems: "center",
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  /* ---------- AVATAR ---------- */
  avatar: {
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarGrid: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 6,
  },
  avatarList: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#6B7280",
  },

  /* ---------- NAME ---------- */
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    flexShrink: 1,
  },

  /* ---------- BADGE ---------- */
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
