#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1. Update Layout to Strava-style Tabs (Feed, Groups, Record, Profile)
# We move "Record" to a modal or prominent middle button later, for now it's a tab.

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
          tabBarActiveTintColor: "#F97316", // Strava Orange
          tabBarInactiveTintColor: "#94A3B8",
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home-variant" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="maps"
          options={{
            title: "Maps",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="map-search-outline" size={26} color={color} />,
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: "Record",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="record-circle-outline" size={30} color={color} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: "Groups",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle-outline" size={28} color={color} />,
          }}
        />

        {/* Hidden / Utility routes */}
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

# 2. Implement the "Feed" (Home) - Activities + Rides
cat > "app/(tabs)/home.tsx" <<'EOF'
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Image } from "react-native";
import { Appbar, Card, Text, Avatar, FAB, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";

// Mock "Activity" type matching Strava
type Activity = {
  id: string;
  type: "Ride" | "Run";
  title: string;
  stats: { distance: number; time: string; elevation: number }; // km, "1h 20m", m
  mapUrl?: string; // Static map image
  user: { displayName: string; avatarUrl?: string };
  createdAt: any;
};

export default function FeedScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    // In real app: fetch friends' activities + your own.
    // Here: fetch recent rides as "activities"
    try {
      const q = query(collection(db, "rides"), orderBy("createdAt", "desc"), limit(10));
      const snap = await getDocs(q);
      const list: Activity[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: "Ride",
          title: data.title || "Afternoon Ride",
          stats: {
            distance: (Math.random() * 50).toFixed(1) as any, // Mock stats if missing
            time: "1h 45m",
            elevation: 120,
          },
          user: { displayName: data.createdBy || "Rider" },
          createdAt: data.createdAt,
        };
      });
      setItems(list);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const renderItem = ({ item }: { item: Activity }) => (
    <Card style={s.card}>
      <Card.Title
        title={item.user.displayName}
        subtitle={new Date(item.createdAt?.seconds * 1000).toLocaleString()}
        left={(props) => <Avatar.Text {...props} label={item.user.displayName[0]} style={{backgroundColor: "#F97316"}} />}
      />
      <Card.Content>
        <Text variant="titleMedium" style={{ fontWeight: "bold", color: "#F9FAFB" }}>{item.title}</Text>
        <View style={s.statsRow}>
          <View>
            <Text style={s.statLabel}>Distance</Text>
            <Text style={s.statValue}>{item.stats.distance} km</Text>
          </View>
          <View>
            <Text style={s.statLabel}>Elev Gain</Text>
            <Text style={s.statValue}>{item.stats.elevation} m</Text>
          </View>
          <View>
            <Text style={s.statLabel}>Time</Text>
            <Text style={s.statValue}>{item.stats.time}</Text>
          </View>
        </View>
      </Card.Content>
      {/* Placeholder for Map/Image */}
      <View style={{ height: 150, backgroundColor: "#1E293B", marginTop: 12, borderRadius: 8, alignItems: "center", justifyContent: "center" }}>
         <Text style={{color: "#475569"}}>Map / Photo</Text>
      </View>
      <Card.Actions>
        <MaterialCommunityIcons name="thumb-up-outline" size={20} color="#94A3B8" style={{marginRight: 6}} />
        <MaterialCommunityIcons name="comment-outline" size={20} color="#94A3B8" />
      </Card.Actions>
    </Card>
  );

  return (
    <View style={s.container}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.Content title="Convoy" titleStyle={{ fontWeight: "900", color: "#F97316", fontStyle: "italic" }} />
        <Appbar.Action icon="bell-outline" color="#F9FAFB" onPress={() => {}} />
        <Appbar.Action icon="cog-outline" color="#F9FAFB" onPress={() => router.push("/(tabs)/settings")} />
      </Appbar.Header>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFeed} tintColor="#F97316" />}
        ListEmptyComponent={!loading ? <Text style={{textAlign: "center", color: "#64748B", marginTop: 20}}>No activities yet. Go record one!</Text> : null}
      />
    </View>
  );
}

import { MaterialCommunityIcons } from "@expo/vector-icons";

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  card: { marginBottom: 12, backgroundColor: "#0B1120" },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  statLabel: { fontSize: 12, color: "#94A3B8" },
  statValue: { fontSize: 18, color: "#F9FAFB", fontWeight: "600" },
});
EOF

# 3. Create the "Record" Screen (GPS Tracking)
cat > "app/(tabs)/record.tsx" <<'EOF'
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text as RNText, TouchableOpacity } from "react-native";
import { Appbar } from "react-native-paper";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Basic Stopwatch + GPS Speed
export default function RecordScreen() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speed, setSpeed] = useState(0); // m/s
  const [distance, setDistance] = useState(0); // meters
  
  // Timer
  useEffect(() => {
    let interval: any;
    if (recording) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (!recording && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording]);

  // GPS
  useEffect(() => {
    let sub: any;
    (async () => {
      if (recording) {
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
          (loc) => {
            setSpeed(loc.coords.speed || 0);
            // In real app: accumulate distance from prev points
          }
        );
      }
    })();
    return () => sub?.remove();
  }, [recording]);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const h = Math.floor(m / 60);
    return `${h > 0 ? h + ':' : ''}${m % 60 < 10 ? '0' : ''}${m % 60}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617", elevation: 0 }}>
        <Appbar.Content title="Record" titleStyle={{ color: "#F9FAFB" }} />
      </Appbar.Header>

      <View style={s.mapArea}>
        {/* Map would go here */}
        <MaterialCommunityIcons name="map-marker-radius" size={64} color="#334155" />
        <RNText style={{color: "#475569", marginTop: 10}}>GPS Ready</RNText>
      </View>

      <View style={s.statsPanel}>
        <View style={s.statRow}>
           <View style={s.stat}>
             <RNText style={s.val}>{fmtTime(seconds)}</RNText>
             <RNText style={s.lbl}>Time</RNText>
           </View>
           <View style={s.stat}>
             <RNText style={s.val}>{(speed * 3.6).toFixed(1)}</RNText>
             <RNText style={s.lbl}>Speed (km/h)</RNText>
           </View>
           <View style={s.stat}>
             <RNText style={s.val}>{(distance / 1000).toFixed(2)}</RNText>
             <RNText style={s.lbl}>Distance (km)</RNText>
           </View>
        </View>

        <TouchableOpacity 
          style={[s.btn, { backgroundColor: recording ? "#EF4444" : "#F97316" }]}
          onPress={() => setRecording(!recording)}
        >
          <RNText style={s.btnTxt}>{recording ? "STOP" : "START"}</RNText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  mapArea: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0F172A" },
  statsPanel: { backgroundColor: "#020617", padding: 20, borderTopWidth: 1, borderTopColor: "#1E293B" },
  statRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 30 },
  stat: { alignItems: "center" },
  val: { fontSize: 32, fontWeight: "bold", color: "#F9FAFB" },
  lbl: { fontSize: 12, color: "#94A3B8", textTransform: "uppercase" },
  btn: { height: 70, borderRadius: 35, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  btnTxt: { fontSize: 24, fontWeight: "900", color: "white", letterSpacing: 1 },
});
EOF

rm -rf .expo node_modules/.cache
echo "Done. Strava-fication complete. Run: npx expo start --tunnel --clear"
