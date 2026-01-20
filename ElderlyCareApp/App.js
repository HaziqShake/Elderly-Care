// App.js
import EditResidentScreen from "./screens/EditResidentScreen";
import { ensureTodayInstances } from "./supabase/ensureTodayInstances";
import { AppState } from "react-native";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { supabase } from "./supabase/supabaseClient";

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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon = "home";
          if (route.name === "Tasks") icon = "checklist";
          if (route.name === "Upcoming") icon = "schedule";
          return <MaterialIcons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#BFDBFE",
        tabBarStyle: {
          backgroundColor: "#2563EB", // 🔵 back to blue
          height: 60,
          borderTopWidth: 0,
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
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") {
      ensureTodayInstances();
    }
  });

  return () => sub.remove();
}, []);


  useEffect(() => {
    let mounted = true;

    // Get initial session (WEB + MOBILE)
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = !!session?.user;

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AddResident" component={AddResidentScreen} />
            <Stack.Screen name="EditResident" component={EditResidentScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
