import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { supabase } from "./supabase/supabaseClient";

// Screens
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import TasksScreen from "./screens/TasksScreen";
import UpcomingTasksScreen from "./screens/UpcomingTasksScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AddResidentScreen from "./screens/AddResidentScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* -------------------- TABS -------------------- */
function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === "Home") icon = "home";
          if (route.name === "Tasks") icon = "checklist";
          if (route.name === "Upcoming") icon = "schedule";
          return <MaterialIcons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#BFDBFE",
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: insets.bottom,
          height: 60,
          backgroundColor: "#2563EB",
          elevation: 6,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Upcoming" component={UpcomingTasksScreen} />
    </Tab.Navigator>
  );
}

/* -------------------- APP ROOT -------------------- */
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
              <Stack.Screen name="AddResident" component={AddResidentScreen} />
            </>
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}
