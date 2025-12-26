#!/usr/bin/env bash
set -euo pipefail

# 1. Create a Reusable Route List Item Component
# This handles the map preview safely and consistently.
mkdir -p src/components
cat > "src/components/RouteListItem.tsx" <<'EOF'
import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Text, Card } from "react-native-paper";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../context/ThemeContext";

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
];

export const RouteListItem = ({ route, onPress }: any) => {
  const { theme, isDark } = useThemeContext();
  const points = route.points || [];
  
  // Calculate region safely
  const initialRegion = useMemo(() => {
    if (points.length === 0) return undefined;
    const lats = points.map((p: any) => p.latitude);
    const longs = points.map((p: any) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...longs);
    const maxLng = Math.max(...longs);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5; // Add padding
    const deltaLng = (maxLng - minLng) * 1.5;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.02),
      longitudeDelta: Math.max(deltaLng, 0.02),
    };
  }, [points]);

  return (
    <Card style={[s.card, { backgroundColor: theme.colors.surface }]} onPress={onPress}>
      {/* Map Preview Area */}
      <View style={s.mapContainer} pointerEvents="none"> 
        {points.length > 0 ? (
          <MapView
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            customMapStyle={isDark ? darkMapStyle : []}
            userInterfaceStyle={isDark ? 'dark' : 'light'}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
            liteMode={Platform.OS === 'android'} // Use LiteMode on Android for list performance
          >
            <Polyline coordinates={points} strokeColor="#F97316" strokeWidth={3} />
          </MapView>
        ) : (
          <View style={[s.placeholder, { backgroundColor: theme.colors.surfaceVariant }]}>
             <Ionicons name="map-outline" size={40} color="gray" />
             <Text style={{color:"gray", marginTop: 5}}>No route data</Text>
          </View>
        )}
      </View>

      <Card.Content style={{ paddingVertical: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
          <Ionicons name="bicycle" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text variant="titleMedium" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>
            {route.name || "Untitled Ride"}
          </Text>
        </View>
        <Text variant="bodySmall" style={{ color: "gray" }}>
          {(route.distance || 0).toFixed(1)} km • {route.type || "Ride"}
        </Text>
      </Card.Content>
    </Card>
  );
};

const s = StyleSheet.create({
  card: { marginBottom: 15, borderRadius: 10, overflow: 'hidden', elevation: 2 },
  mapContainer: { height: 150, width: "100%", backgroundColor: "#eee" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center" }
});
EOF

# 2. Update Maps Screen to use the new Component
cat > "app/(tabs)/maps/index.tsx" <<'EOF'
import React, { useCallback, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { FAB, Searchbar, ActivityIndicator } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../src/firebase";
import { useThemeContext } from "../../../src/context/ThemeContext";
import { RouteListItem } from "../../../src/components/RouteListItem";

export default function MapsScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    // setLoading(true); // Don't block UI on refocus
    try {
      const q = query(collection(db, "routes"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRoutes(data);
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchRoutes(); }, []));

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ padding: 15 }}>
        <Searchbar placeholder="Find a route..." value="" style={{ backgroundColor: theme.colors.surface, elevation: 0 }} />
      </View>
      
      {loading && routes.length === 0 ? (
        <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator color="#F97316" /></View>
      ) : (
        <FlatList
          data={routes}
          renderItem={({ item }) => (
            <RouteListItem route={item} onPress={() => router.push("/routes/" + item.id)} />
          )}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 15, paddingTop: 0 }}
        />
      )}
      
      <FAB icon="plus" style={[s.fab, { backgroundColor: theme.colors.primary }]} color="white" onPress={() => router.push("/(tabs)/maps/create")} />
    </View>
  );
}
const s = StyleSheet.create({ container: { flex: 1 }, fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 } });
EOF

# 3. Update Home Screen to use the new Component (Fix Home Page Thumbnails)
cat > "app/(tabs)/index.tsx" <<'EOF'
import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeContext } from "../../src/context/ThemeContext";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";
import { RouteListItem } from "../../src/components/RouteListItem";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);

  const fetchRecent = async () => {
    try {
      const q = query(collection(db, "routes"), orderBy("createdAt", "desc"), limit(3));
      const snap = await getDocs(q);
      setRecentRoutes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
  };

  useFocusEffect(useCallback(() => { fetchRecent(); }, []));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 20, color: theme.colors.onBackground }}>
          Welcome back!
        </Text>

        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>Recent Rides</Text>
          <Button mode="text" onPress={() => router.push("/(tabs)/maps")}>See All</Button>
        </View>

        {recentRoutes.map((route) => (
          <RouteListItem 
            key={route.id} 
            route={route} 
            onPress={() => router.push("/routes/" + route.id)} 
          />
        ))}

        {recentRoutes.length === 0 && (
          <Text style={{color: "gray", textAlign: "center", marginTop: 20}}>No recent rides found. Start one!</Text>
        )}
        
        <Button 
          mode="contained" 
          icon="plus" 
          style={{ marginTop: 30, backgroundColor: "#F97316" }} 
          contentStyle={{ height: 50 }}
          onPress={() => router.push("/(tabs)/maps/create")}
        >
          Create New Route
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
});
EOF

echo "✅ Created Shared RouteListItem component."
echo "✅ Updated Maps Screen & Home Screen to use safe Map Previews."
