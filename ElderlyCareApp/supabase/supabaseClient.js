// supabase/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SUPABASE_URL = "https://sppurdtzkwldhbvxfxfo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcHVyZHR6a3dsZGhidnhmeGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDY4NDksImV4cCI6MjA3MzQyMjg0OX0.-d0UAxBDFBTG0RBJiRULnGreTYAGNcVXOMMwJ5zOayw";


/**
 * Platform-safe storage adapter
 */
const ExpoSecureStoreAdapter = {
  getItem: async (key) => {
    if (Platform.OS === "web") return null;
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === "web") return;
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === "web") return;
    return SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storage: Platform.OS === "web" ? undefined : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      detectSessionInUrl: Platform.OS === "web",
    },
  }
);
