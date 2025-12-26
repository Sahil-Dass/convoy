import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/auth/AuthProvider";
import { ActivityIndicator, View } from "react-native";
import { useThemeContext } from "../../src/context/ThemeContext";
import { PaperProvider } from "react-native-paper";

export default function TabLayout() {
  const { loading } = useAuth();
  const { theme } = useThemeContext();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#F97316",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { 
            backgroundColor: theme.colors.surface, 
            borderTopWidth: 0,
            elevation: 5,
            height: 60,
            paddingBottom: 5
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: "bold" },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
          }}
        />
        
        {/* CORRECTED: Point to 'maps/index' but call it 'Maps' */}
        <Tabs.Screen
          name="maps/index"
          options={{
            title: "Maps",
            tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={26} color={color} />,
          }}
        />

        <Tabs.Screen
          name="record"
          options={{
            title: "Record",
            tabBarIcon: ({ color }) => <Ionicons name="radio-button-on" size={34} color={color} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => <Ionicons name="people-outline" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={30} color={color} />,
          }}
        />

        {/* HIDE ALL INTERNAL FILES */}
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="security" options={{ href: null }} />
        <Tabs.Screen name="activity/[id]" options={{ href: null }} />
        
        {/* Fix: 'rides' is the folder/file name, not rides/[id] if it wasn't scanned that way */}
        <Tabs.Screen name="rides" options={{ href: null }} />
        
        <Tabs.Screen name="calendar" options={{ href: null }} />
        <Tabs.Screen name="map" options={{ href: null }} />
        <Tabs.Screen name="marketplace" options={{ href: null }} />
        <Tabs.Screen name="two" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
        
        {/* Hide extra maps routes */}
        <Tabs.Screen name="maps/create" options={{ href: null }} />
        
        {/* Hide 'index' if it refers to the root tab index (redirects usually handle this) */}
        <Tabs.Screen name="index" options={{ href: null }} />

      </Tabs>
    </PaperProvider>
  );
}
