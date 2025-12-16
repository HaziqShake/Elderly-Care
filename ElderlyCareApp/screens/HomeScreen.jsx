// screens/HomeScreen.js
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ResidentListItem from "../components/ResidentListItem";
import ResidentCardModal from "../components/ResidentCardModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../supabase/supabaseClient";

export default function HomeScreen({ navigation, user }) {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  // Fetch from Supabase
  useEffect(() => {
    const fetchResidents = async () => {
      try {
        setLoading(true);

        const { data: residentData, error } = await supabase
          .from("residents")
          .select("id, name, age, room_number, condition, photo_url");

        if (error) throw error;

        setResidents(residentData || []);
      } catch (err) {
        console.error("Error fetching residents:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, []);

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Floating header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Elderly Care</Text>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <MaterialIcons name="person" size={24} color="#3B82F6" />
        </TouchableOpacity>


      </View>

      {/* Search bar */}
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

      {/* Resident list */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={3}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        renderItem={({ item }) => (
          <ResidentListItem
            resident={item}
            onPress={() => setSelectedResident(item)}
            isGrid={true}
          />
        )}
      />

      {/* Modal for resident */}
      {selectedResident && (
        <ResidentCardModal
          resident={selectedResident}
          onClose={() => setSelectedResident(null)}
          onUpdateResident={(updatedResident) => {
            setResidents((prev) =>
              prev.map((r) => (r.id === updatedResident.id ? updatedResident : r))
            );
            setSelectedResident(updatedResident);
          }}
        />

      )}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddResident")}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>



    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB" },


  // Header
  headerBar: {
    marginTop: 10,
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#3B82F6",
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffffff",
  },
  profileBtn: {
    backgroundColor: "#E0ECFF",
    padding: 8,
    borderRadius: 20,
  },

  // Search bar
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  searchInput: { flex: 1, padding: 8, fontSize: 15, color: "#111" },
  addResidentButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 80, // sits ABOVE tab bar
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    elevation: 6,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90, // safely above bottom nav
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6, // Android shadow
  },

  fabIcon: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "600",
    marginTop: -2, // visually center "+"
  },


});
