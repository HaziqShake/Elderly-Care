import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";

export default function DateNavigator({ date, onChange }) {
  const [showPicker, setShowPicker] = useState(false);

  const today = moment().startOf("day");
  const current = moment(date).startOf("day");

  const isToday = current.isSame(today);

  const goPrev = () => {
    onChange(current.clone().subtract(1, "day").toDate());
  };

  const goNext = () => {
    if (isToday) return;
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
      {/* Previous day */}
      <TouchableOpacity onPress={goPrev} style={{ padding: 6 }}>
        <MaterialIcons name="chevron-left" size={30} color="#2563EB" />
      </TouchableOpacity>

      {/* Date label / picker */}
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

      {/* Next day (disabled for future) */}
      <TouchableOpacity
        onPress={goNext}
        disabled={isToday}
        style={{ padding: 6, opacity: isToday ? 0.3 : 1 }}
      >
        <MaterialIcons name="chevron-right" size={30} color="#2563EB" />
      </TouchableOpacity>

      {/* Calendar picker (future dates blocked) */}
      {showPicker && (
        <DateTimePicker
          value={current.toDate()}
          mode="date"
          display="calendar"
          maximumDate={today.toDate()} // 🔒 BLOCK FUTURE DATES
          onChange={(e, picked) => {
            setShowPicker(false);
            if (picked) {
              const pickedDay = moment(picked).startOf("day");
              if (!pickedDay.isAfter(today)) {
                onChange(pickedDay.toDate());
              }
            }
          }}
        />
      )}
    </View>
  );
}
