// supabase/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";

const SUPABASE_URL = "https://sppurdtzkwldhbvxfxfo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwcHVyZHR6a3dsZGhidnhmeGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDY4NDksImV4cCI6MjA3MzQyMjg0OX0.-d0UAxBDFBTG0RBJiRULnGreTYAGNcVXOMMwJ5zOayw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => SecureStore.getItemAsync(key),
      setItem: (key, value) => SecureStore.setItemAsync(key, value),
      removeItem: (key) => SecureStore.deleteItemAsync(key),
    },
  },
});
