#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

cat > "app/(tabs)/_layout.tsx" <<'EOF'
import React from "react";
import { Tabs } from "expo-router";
import { LocationTracker } from "../../src/location/LocationTracker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <>
      <LocationTracker />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: "#020617", borderTopColor: "#1E293B" },
          tabBarActiveTintColor: "#F97316",
          tabBarInactiveTintColor: "#94A3B8",
        }}
      >
        {/* 1. Feed (Home) */}
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-variant" size={28} color={color} />,
          }}
        />
        
        {/* 2. Maps (Search/Explore) */}
        <Tabs.Screen
          name="maps"
          options={{
            title: "Maps",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-search-outline" size={26} color={color} />,
          }}
        />

        {/* 3. Record (Center Action) */}
        <Tabs.Screen
          name="record"
          options={{
            title: "Record",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="record-circle-outline" size={30} color={color} />,
          }}
        />

        {/* 4. Groups (Clubs) */}
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={28} color={color} />,
          }}
        />

        {/* 5. You (Profile) */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle-outline" size={28} color={color} />,
          }}
        />

        {/* HIDE ALL OTHER ROUTES (Legacy/Detail screens that happen to be in (tabs) folder) */}
        {/* Note: 'profile' is NOT in this list because it is defined above. */}
        
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="rides" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="calendar" options={{ href: null }} />
        <Tabs.Screen name="marketplace" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="map" options={{ href: null }} />
        <Tabs.Screen name="two" options={{ href: null }} />
      </Tabs>
    </>
  );
}
EOF

rm -rf .expo node_modules/.cache
echo "Done. Fixed duplicate screen error. Run: npx expo start --tunnel --clear"
