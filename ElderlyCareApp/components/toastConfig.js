import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Animated, Easing } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const LineLoader = () => {
  const [width, setWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (width <= 0) return;
    translateX.setValue(-width * 0.4);
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: width,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX, width]);

  return (
    <View
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%", height: 3, backgroundColor: "#DBEAFE", overflow: "hidden" }}
    >
      <Animated.View
        style={{
          width: width * 0.4,
          height: 3,
          backgroundColor: "#2563EB",
          transform: [{ translateX }],
        }}
      />
    </View>
  );
};

const ToastCard = ({ text1, text2 }) => (
  <View
    style={{
      backgroundColor: "#FFFFFF",
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: "#2563EB",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      alignSelf: "center",
      maxWidth: "90%",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <Text style={{ color: "#1E3A8A", fontWeight: "700", fontSize: 14 }}>
          {text1}
        </Text>
        {!!text2 && (
          <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>
            {text2}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()}>
        <MaterialIcons name="close" size={22} color="#64748B" />
      </TouchableOpacity>
    </View>
    <View style={{ marginTop: 8 }}>
      <LineLoader />
    </View>
  </View>
);

export const toastConfig = {
  success: ({ text1, text2 }) => <ToastCard text1={text1} text2={text2} />,
  error: ({ text1, text2 }) => <ToastCard text1={text1} text2={text2} />,
  info: ({ text1, text2 }) => <ToastCard text1={text1} text2={text2} />,
};
