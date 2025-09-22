// screens/HomeScreen.js
// import { supabase } from "../supabase/supabaseClient";

import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import sampleResidents from "../data/sampleData";
import ResidentListItem from "../components/ResidentListItem";
import ResidentCardModal from "../components/ResidentCardModal";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen({ user, onLogout }) {
  const [residents, setResidents] = useState(sampleResidents); // default dummy data

  // Example Supabase fetch (commented for demo)
  /*
  useEffect(() => {
    const fetchResidents = async () => {
      let { data, error } = await supabase.from("residents").select("*");
      if (error) console.error(error);
      else setResidents(data);
    };
    fetchResidents();
  }, []);
  */

  const [search, setSearch] = useState("");
  const [selectedResident, setSelectedResident] = useState(null);

  const filtered = residents.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Floating header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Elderly Care</Text>
        <TouchableOpacity style={styles.profileBtn}>
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
        numColumns={3} // 3 per row
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 16 }}
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
          onUpdateActivities={(id, updatedActivities) => {
            setResidents((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, activities: updatedActivities } : r
              )
            );
          }}
          onUpdateMedicines={(id, updatedMedicines) => {
            setResidents((prev) =>
              prev.map((r) =>
                r.id === id ? { ...r, medicines: updatedMedicines } : r
              )
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8FB" },

  //  Header
  headerBar: {
    marginTop: 10,
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
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
    color: "#1E3A8A",
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
});
