import React from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../src/auth/AuthProvider";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#020617", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Not logged in -> go to auth screen
  if (!user) return <Redirect href="/auth" />;

  // Logged in -> go into tabs (tabs layout will redirect to /onboarding if needed)
  return <Redirect href="/(tabs)/home" />;
}
