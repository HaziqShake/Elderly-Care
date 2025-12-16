import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

export default function DateNavigator({ date, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const today = moment().startOf("day");
  const current = moment(date);

  const goPrev = () => {
    onChange(current.clone().subtract(1, "day").toDate());
  };

  const goNext = () => {
    if (current.isSame(today)) return;
    onChange(current.clone().add(1, "day").toDate());
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
      {/* Previous */}
      <TouchableOpacity onPress={goPrev} style={{ padding: 6 }}>
        <MaterialIcons name="chevron-left" size={30} color="#2563EB" />
      </TouchableOpacity>

      {/* Date */}
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
          {current.isSame(today)
            ? "Today"
            : current.format("DD MMM YYYY")}
        </Text>
      </TouchableOpacity>

      {/* Next */}
      <TouchableOpacity
        onPress={goNext}
        disabled={current.isSame(today)}
        style={{ padding: 6, opacity: current.isSame(today) ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-right" size={30} color="#2563EB" />
      </TouchableOpacity>

      {/* Calendar Picker */}
      {showPicker && (
        <DateTimePicker
          value={current.toDate()}
          mode="date"
          display="calendar"
          onChange={(e, picked) => {
            setShowPicker(false);
            if (picked) onChange(picked);
          }}
        />
      )}
    </View>
  );
}
