import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ResidentListItem({ resident, onPress, isGrid }) {
  const initial = resident.name?.charAt(0)?.toUpperCase() || "?";
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    setImageError(false);
  }, [resident.photo_url]);



  return (
    <TouchableOpacity
      style={[
        styles.card,
        isGrid ? styles.gridCard : styles.listCard,
      ]}
      onPress={onPress}
    >
      {/* AVATAR */}
      {resident.photo_url && !imageError ? (
        <Image
          key={resident.photo_url} // Force refresh when URL changes
          source={{ uri: resident.photo_url }}
          style={[
            styles.avatar,
            isGrid ? styles.avatarGrid : styles.avatarList,
          ]}
          onError={() => setImageError(true)}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            isGrid ? styles.avatarGrid : styles.avatarList,
            {
              backgroundColor: "#E5E7EB",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <MaterialIcons
            name="person-outline"
            size={isGrid ? 32 : 24}
            color="#6B7280"
          />
        </View>
      )}


      {/* NAME */}
      <View style={styles.nameContainer}>
        <Text style={styles.name}>
          {resident.name}
        </Text>
      </View>




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
    backgroundColor: "transparent",
  },
  gridCard: {
    width: "100%",
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
    width: 62,
    height: 62,
    borderRadius: 31,
    marginBottom: 6,
  },
  avatarList: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "400",
    color: "#6B7280",
  },

  /* ---------- NAME ---------- */
  nameContainer: {
    width: "100%",          // Gives text full card width
    paddingHorizontal: 4,   // Small breathing room
  },

  name: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    lineHeight: 14,
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
