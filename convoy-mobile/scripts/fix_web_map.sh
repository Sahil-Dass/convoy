#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

mkdir -p src/components

# 1. Native Map Implementation (Android/iOS)
cat > "src/components/RideMap.native.tsx" <<'EOF'
import React from "react";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View } from "react-native";

export default function RideMap({ path, initialRegion, liteMode = false }: any) {
  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={StyleSheet.absoluteFill}
      liteMode={liteMode}
      initialRegion={initialRegion}
      scrollEnabled={!liteMode}
      zoomEnabled={!liteMode}
    >
      {path && path.length > 0 && (
        <Polyline coordinates={path} strokeColor="#F97316" strokeWidth={3} />
      )}
    </MapView>
  );
}
EOF

# 2. Web Fallback (Just a placeholder image/text)
cat > "src/components/RideMap.web.tsx" <<'EOF'
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RideMap({ path }: any) {
  return (
    <View style={s.container}>
      <Text style={s.text}>Map View (Mobile Only)</Text>
      {path && <Text style={s.sub}>{path.length} points</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  text: { color: "#94A3B8", fontWeight: "bold" },
  sub: { color: "#64748B", fontSize: 12 }
});
EOF

# 3. Patch Home.tsx to use this safe component
cat > "app/(tabs)/home.tsx" <<'EOF'
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Appbar, Card, Text, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";
import RideMap from "../../src/components/RideMap"; // Automatically picks .native or .web

export default function FeedScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "rides"), orderBy("createdAt", "desc"), limit(20));
      const snap = await getDocs(q);
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeed(); }, []);

  const fmtTime = (s: number) => {
    if (!s) return "0s";
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  };

  const renderItem = ({ item }: { item: any }) => {
    let region = { latitude: 19.0760, longitude: 72.8777, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    if (item.path && item.path.length > 0) {
       const first = item.path[0];
       region = { latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }

    return (
      <Card style={s.card}>
        <Card.Title
          title={item.createdBy || "Rider"}
          subtitle={item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : ""}
          left={(props) => <Avatar.Text {...props} label={(item.createdBy?.[0] || "R").toUpperCase()} style={{backgroundColor: "#F97316"}} />}
        />
        <Card.Content>
          <Text variant="titleMedium" style={{ fontWeight: "bold", color: "#F9FAFB", marginBottom: 6 }}>{item.title}</Text>
          <View style={s.statsRow}>
            <View>
              <Text style={s.statLabel}>Distance</Text>
              <Text style={s.statValue}>{item.stats?.distance || 0} km</Text>
            </View>
            <View>
              <Text style={s.statLabel}>Avg Speed</Text>
              <Text style={s.statValue}>{item.stats?.avgSpeed || 0} km/h</Text>
            </View>
            <View>
              <Text style={s.statLabel}>Time</Text>
              <Text style={s.statValue}>{fmtTime(item.stats?.time || 0)}</Text>
            </View>
          </View>
        </Card.Content>

        <View style={s.mapContainer}>
           {/* Use the safe component here */}
           <RideMap path={item.path} initialRegion={region} liteMode={true} />
        </View>
      </Card>
    );
  };

  return (
    <View style={s.container}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.Content title="Convoy" titleStyle={{ fontWeight: "900", color: "#F97316", fontStyle: "italic" }} />
      </Appbar.Header>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadFeed} tintColor="#F97316" />}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  card: { marginBottom: 12, backgroundColor: "#0B1120" },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 8, marginBottom: 12 },
  statLabel: { fontSize: 12, color: "#94A3B8" },
  statValue: { fontSize: 18, color: "#F9FAFB", fontWeight: "600" },
  mapContainer: { height: 200, marginTop: 0, borderRadius: 0, overflow: 'hidden' }
});
EOF

rm -rf .expo node_modules/.cache
echo "Done. Web map crash fixed. Run: npx expo start --tunnel --clear"
