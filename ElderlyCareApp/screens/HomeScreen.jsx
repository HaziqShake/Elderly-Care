import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import ResidentListItem from "../components/ResidentListItem";
import ResidentCardModal from "../components/ResidentCardModal";
import { supabase } from "../supabase/supabaseClient";

export default function HomeScreen({ navigation }) {
  const [editMode, setEditMode] = useState(false);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
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

          // ✅ clear param so it doesn't re-add
          navigation.setParams({ newResident: undefined });
        }
      }
    }, [])
  );


  const fetchResidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("residents")
        .select("id, name, age, room_number, condition, photo_url");

      if (error) throw error;
      setResidents(data || []);
    } catch (err) {
      console.error("Error fetching residents:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResident = (resident) => {
    Alert.alert(
      "Delete Resident",
      `Are you sure you want to delete ${resident.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("residents")
              .delete()
              .eq("id", resident.id);

            if (!error) {
              setResidents((prev) =>
                prev.filter((r) => r.id !== resident.id)
              );
            }
          },
        },
      ]
    );
  };

  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
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
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
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
                onPress={() => handleDeleteResident(item)}
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
    top: -6,
    right: -6,
    zIndex: 10,
    backgroundColor: "#DC2626",
    borderRadius: 12,
    padding: 4,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  fabIcon: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
  },
  gridItemWrapper: {
    flex: 1,
    position: "relative",
    alignItems: "center",
  },

});
