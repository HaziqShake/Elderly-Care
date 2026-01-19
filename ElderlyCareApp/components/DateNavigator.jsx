import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import moment from "moment";

export default function DateNavigator({ date, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const today = moment().startOf("day");
  const current = moment(date).startOf("day");
  const isToday = current.isSame(today);

  const goPrev = () => onChange(current.clone().subtract(1, "day").toDate());
  const goNext = () => {
    if (!isToday) onChange(current.clone().add(1, "day").toDate());
  };

  // Generate picker data
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = moment.months();
  const years = [];
  for (let y = today.year(); y >= today.year() - 5; y--) years.push(y);

  const [tempDay, setTempDay] = useState(current.date());
  const [tempMonth, setTempMonth] = useState(current.month());
  const [tempYear, setTempYear] = useState(current.year());

  const confirmDate = () => {
    const picked = moment()
      .year(tempYear)
      .month(tempMonth)
      .date(tempDay)
      .startOf("day");

    if (!picked.isAfter(today)) {
      onChange(picked.toDate());
    }
    setShowPicker(false);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
      }}
    >
      {/* Prev */}
      <TouchableOpacity onPress={goPrev} style={{ padding: 6 }}>
        <MaterialIcons name="chevron-left" size={30} color="#2563EB" />
      </TouchableOpacity>

      {/* Date pill */}
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: "#EFF6FF",
        }}
      >
        <Text style={{ fontWeight: "700", color: "#1E3A8A" }}>
          {isToday ? "Today" : current.format("DD MMM YYYY")}
        </Text>
      </TouchableOpacity>

      {/* Next */}
      <TouchableOpacity
        onPress={goNext}
        disabled={isToday}
        style={{ padding: 6, opacity: isToday ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-right" size={30} color="#2563EB" />
      </TouchableOpacity>

      {/* Custom Date Picker Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 12,
              width: 300,
            }}
          >
            <Text style={{ fontWeight: "700", marginBottom: 10 }}>
              Select Date
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              {/* Day */}
              <ScrollView style={{ height: 150 }}>
                {days.map((d) => (
                  <TouchableOpacity key={d} onPress={() => setTempDay(d)}>
                    <Text
                      style={{
                        padding: 6,
                        textAlign: "center",
                        fontWeight: d === tempDay ? "700" : "400",
                        color: d === tempDay ? "#2563EB" : "#000",
                      }}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Month */}
              <ScrollView style={{ height: 150 }}>
                {months.map((m, idx) => (
                  <TouchableOpacity key={m} onPress={() => setTempMonth(idx)}>
                    <Text
                      style={{
                        padding: 6,
                        textAlign: "center",
                        fontWeight: idx === tempMonth ? "700" : "400",
                        color: idx === tempMonth ? "#2563EB" : "#000",
                      }}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Year */}
              <ScrollView style={{ height: 150 }}>
                {years.map((y) => (
                  <TouchableOpacity key={y} onPress={() => setTempYear(y)}>
                    <Text
                      style={{
                        padding: 6,
                        textAlign: "center",
                        fontWeight: y === tempYear ? "700" : "400",
                        color: y === tempYear ? "#2563EB" : "#000",
                      }}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={{ marginRight: 16, color: "#6B7280" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDate}>
                <Text style={{ color: "#2563EB", fontWeight: "700" }}>Done</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </View>
  );
}
