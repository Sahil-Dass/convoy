import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/auth/AuthProvider";
import { PaperProvider } from "react-native-paper";
import { View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { checkOnboardingStatus } from "../src/data/userProfile";
import { ThemeProvider, useThemeContext } from "../src/context/ThemeContext";

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useThemeContext();
  const [checkingOnboard, setCheckingOnboard] = useState(false);

  useEffect(() => {
    if (loading || checkingOnboard) return;

    const inAuthGroup = segments[0] === "auth";
    const inTabsGroup = segments[0] === "(tabs)";

    const verifyRoute = async () => {
      if (!user) {
        if (!inAuthGroup) router.replace("/auth");
      } else {
        if (inAuthGroup) {
          setCheckingOnboard(true);
          const needsOnboard = await checkOnboardingStatus(user.uid);
          setCheckingOnboard(false);
          router.replace(needsOnboard ? "/onboarding" : "/(tabs)/home");
        }
      }
    };
    verifyRoute();
  }, [user, loading, segments]);

  if (loading || checkingOnboard) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}
