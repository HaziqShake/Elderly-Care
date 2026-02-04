import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import ResidentListItem from "../components/ResidentListItem";
import ResidentCardModal from "../components/ResidentCardModal";
import { supabase } from "../supabase/supabaseClient";

export default function HomeScreen({ navigation }) {
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState(null);

  const [editMode, setEditMode] = useState(false);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  const fetchResidents = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw userError || new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("residents")
        .select("id, name, age, room_number, condition, guardian_name, guardian_contact, photo_url")
        .eq("owner_id", user.id);

      if (error) throw error;
      setResidents(data || []);
    } catch (err) {
      console.error("Error fetching residents:", err.message);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);
  useFocusEffect(
    React.useCallback(() => {
      fetchResidents({ silent: true });
      if (navigation.getState) {
        const route = navigation.getState().routes.find(
          (r) => r.name === "Home"
        );

        const newResident = route?.params?.newResident;

        if (newResident) {
          setResidents((prev) => {
            const exists = prev.some((r) => r.id === newResident.id);
            return exists ? prev : [newResident, ...prev];
          });

          // Clear param so it doesn't re-add
          navigation.setParams({ newResident: undefined });
        }
      }
    }, [fetchResidents, navigation])
  );

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  const handleDeleteResident = async (resident) => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      Toast.show({
        type: "error",
        text1: "User not authenticated",
      });
      return;
    }
    const { error } = await supabase
      .from("residents")
      .delete()
      .eq("id", resident.id)
      .eq("owner_id", user.id);

    if (error) {
      console.error("Delete error:", error.message);
      Toast.show({
        type: "error",
        text1: "Failed to delete resident",
      });
    } else {
      setResidents((prev) =>
        prev.filter((r) => r.id !== resident.id)
      );
      Toast.show({
        type: "success",
        text1: "Resident deleted",
      });
    }
  };
  const confirmDeleteResident = async () => {
    if (!residentToDelete) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      Toast.show({
        type: "error",
        text1: "User not authenticated",
      });
      return;
    }

    const { error } = await supabase
      .from("residents")
      .delete()
      .eq("id", residentToDelete.id)
      .eq("owner_id", user.id);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Failed to delete resident",
      });
    } else {
      setResidents((prev) =>
        prev.filter((r) => r.id !== residentToDelete.id)
      );
      Toast.show({
        type: "success",
        text1: "Resident deleted",
      });
    }

    setConfirmDeleteVisible(false);
    setResidentToDelete(null);
  };


  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Elderly Care</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <MaterialIcons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search + Edit */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color="#6B7280" />
          <TextInput
            placeholder="Search resident..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditMode((p) => !p)}
        >
          <MaterialIcons
            name={editMode ? "close" : "edit"}
            size={22}
            color={editMode ? "#DC2626" : "#3B82F6"}
          />
        </TouchableOpacity>
      </View>

      {/* Resident list */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 12 }}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          columnGap: 8,
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <View style={styles.gridItemWrapper}>
            <ResidentListItem
              resident={item}
              onPress={() => !editMode && setSelectedResident(item)}
              isGrid
            />

            {editMode && (
              <TouchableOpacity
                style={styles.deleteBadge}
                onPress={() => {
                  setResidentToDelete(item);
                  setConfirmDeleteVisible(true);
                }}

              >
                <MaterialIcons name="remove" size={18} color="#fff" />
              </TouchableOpacity>
            )}


          </View>
        )}

      />

      {/* Add button (EDIT MODE ONLY) */}
      {editMode && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            navigation.navigate("AddResident", {
              onAdd: (newResident) => {
                setResidents((prev) => [newResident, ...prev]);
              },
            })
          }
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}

      {/* Resident modal */}
      {selectedResident && (
        <ResidentCardModal
          resident={selectedResident}
          onClose={() => setSelectedResident(null)}
          onUpdateResident={(updated) => {
            setResidents((prev) =>
              prev.map((r) => (r.id === updated.id ? updated : r))
            );
            setSelectedResident(updated);
          }}

        />
      )}
      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={confirmDeleteVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Delete Resident</Text>
            <Text style={styles.confirmText}>
              Are you sure you want to delete{" "}
              {residentToDelete?.name}
            </Text>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setConfirmDeleteVisible(false);
                  setResidentToDelete(null);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={confirmDeleteResident}
              >
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB" },

  headerBar: {
    margin: 12,
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: { flex: 1, padding: 8, fontSize: 15 },
  editBtn: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "#E0ECFF",
    borderRadius: 10,
  },

  deleteBadge: {
    position: "absolute",
    top: -2,
    right: 8,
    zIndex: 10,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 4,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 70,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabIcon: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "600",
  },
  gridItemWrapper: {
    width: "33.333%",
    position: "relative",
    alignItems: "center",
    paddingHorizontal: 6,
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

  deleteBtn: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 6,
  },


  deleteBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 6,
  },

});
