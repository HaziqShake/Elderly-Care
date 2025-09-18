// App.js
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

// screens
import HomeScreen from "./screens/HomeScreen";
import TasksScreen from "./screens/TasksScreen";
import UpcomingTasksScreen from "./screens/UpcomingTasksScreen";

// data
import sampleResidents from "./data/sampleData";

const Tab = createBottomTabNavigator();

export default function App() {
  const [residents, setResidents] = useState(sampleResidents);

  // Build upcoming list from residents
  const upcoming = residents
    .flatMap((r) => [
      ...(r.activities || []).map((a) => ({
        ...a,
        type: "task",
        resident: r.name,
      })),
      ...(r.medicines || []).map((m) => ({
        ...m,
        type: "medicine",
        resident: r.name,
      })),
    ])
    .filter((item) => item.time) // only those with time
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === "Home") iconName = "home";
              else if (route.name === "Tasks") iconName = "checklist";
              else if (route.name === "Upcoming") iconName = "schedule"; // clock icon
              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "#2563EB",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
            tabBarStyle: {
              position: "absolute",
              left: 10,
              right: 10,
              bottom: 10,
              borderRadius: 20,
              height: 60,
              paddingBottom: 5,
              backgroundColor: "#fff",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 6,
            },
          })}
        >
          <Tab.Screen name="Home">
            {() => <HomeScreen user={{ name: "Manager" }} onLogout={() => {}} />}
          </Tab.Screen>

          <Tab.Screen name="Tasks" component={TasksScreen} />

          <Tab.Screen name="Upcoming">
            {() => <UpcomingTasksScreen upcoming={upcoming} />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
