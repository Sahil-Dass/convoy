#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1. Upgrade "Record" to Real GPS Tracker + Map + Save
cat > "app/(tabs)/record.tsx" <<'EOF'
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Button, Dialog, Portal, TextInput } from "react-native-paper";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../src/firebase";
import { useAuth } from "../../src/auth/AuthProvider";
import * as TaskManager from "expo-task-manager"; // For background (later)

export default function RecordScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  
  // Stats
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  
  // Path
  const [path, setPath] = useState<{latitude: number; longitude: number}[]>([]);
  const [currentLoc, setCurrentLoc] = useState<Location.LocationObject | null>(null);

  // Save Dialog
  const [showSave, setShowSave] = useState(false);
  const [rideTitle, setRideTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Timer
  useEffect(() => {
    let interval: any;
    if (recording && !paused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [recording, paused]);

  // GPS Tracker
  useEffect(() => {
    let sub: any;
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
        (loc) => {
          setCurrentLoc(loc);
          if (recording && !paused) {
             setSpeed(loc.coords.speed || 0);
             setPath(prev => {
               const last = prev[prev.length - 1];
               // Simple distance add (haversine is better in real app, but this works for prototype)
               // For now just storing path. Distance calc usually done via library (turf.js or geolib)
               return [...prev, { latitude: loc.coords.latitude, longitude: loc.coords.longitude }]
             });
             
             // Center map on user
             mapRef.current?.animateCamera({ center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude }, zoom: 17 });
           }
        }
      );
    };

    startTracking();
    return () => sub?.remove();
  }, [recording, paused]);

  // Approx distance calc (simple euclidean for short segments is okay-ish for demo, better to use Haversine)
  useEffect(() => {
     if (path.length < 2) return;
     const last = path[path.length - 1];
     const prev = path[path.length - 2];
     // 1 deg lat ~ 111km. Very rough approx for UI speed.
     const dLat = (last.latitude - prev.latitude) * 111000;
     const dLng = (last.longitude - prev.longitude) * 111000 * Math.cos(last.latitude * (Math.PI/180));
     const dist = Math.sqrt(dLat*dLat + dLng*dLng);
     setDistance(d => d + dist);
  }, [path.length]);

  const finishRide = () => {
    setPaused(true);
    // Open save modal
    const dateStr = new Date().toLocaleDateString(undefined, {weekday:'long'});
    const timeStr = new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 17 ? "Afternoon" : "Evening";
    setRideTitle(`${timeStr} Ride`);
    setShowSave(true);
  };

  const saveRide = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save to "rides" collection
      await addDoc(collection(db, "rides"), {
        title: rideTitle || "Untitled Ride",
        createdBy: user.displayName || "Rider",
        userId: user.uid,
        createdAt: serverTimestamp(),
        stats: {
          distance: (distance / 1000).toFixed(2), // km
          time: seconds, // seconds
          avgSpeed: (distance / seconds * 3.6).toFixed(1) // km/h
        },
        path: path, // Save full path for map display
        type: "Ride"
      });
      
      // Reset
      setRecording(false);
      setPaused(false);
      setSeconds(0);
      setDistance(0);
      setPath([]);
      setShowSave(false);
      
      // Go to feed
      router.push("/(tabs)/home");
    } catch (e) {
      Alert.alert("Error", "Could not save ride.");
    } finally {
      setSaving(false);
    }
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const h = Math.floor(m / 60);
    return `${h > 0 ? h + ':' : ''}${m % 60 < 10 ? '0' : ''}${m % 60}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <View style={s.c}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation={recording && !paused}
        initialRegion={{
           latitude: 19.0760, longitude: 72.8777, latitudeDelta: 0.01, longitudeDelta: 0.01
        }}
      >
        {path.length > 0 && (
          <Polyline coordinates={path} strokeColor="#F97316" strokeWidth={4} />
        )}
      </MapView>

      {/* Stats Overlay */}
      <View style={s.overlay}>
         <View style={s.statRow}>
            <View>
               <Text style={s.val}>{fmtTime(seconds)}</Text>
               <Text style={s.lbl}>Time</Text>
            </View>
            <View>
               <Text style={s.val}>{(speed * 3.6).toFixed(1)}</Text>
               <Text style={s.lbl}>Speed (km/h)</Text>
            </View>
            <View>
               <Text style={s.val}>{(distance / 1000).toFixed(2)}</Text>
               <Text style={s.lbl}>Distance (km)</Text>
            </View>
         </View>

         {/* Controls */}
         {!recording ? (
           <Button mode="contained" style={s.startBtn} labelStyle={s.btnTxt} onPress={() => setRecording(true)}>
             START
           </Button>
         ) : (
           <View style={{flexDirection: "row", gap: 20, justifyContent: "center"}}>
             <Button 
               mode="contained" 
               style={[s.ctrlBtn, {backgroundColor: paused ? "#22C55E" : "#F59E0B"}]} 
               onPress={() => setPaused(!paused)}
             >
               {paused ? "RESUME" : "PAUSE"}
             </Button>
             {paused && (
               <Button mode="contained" style={[s.ctrlBtn, {backgroundColor: "#EF4444"}]} onPress={finishRide}>
                 FINISH
               </Button>
             )}
           </View>
         )}
      </View>

      <Portal>
        <Dialog visible={showSave} onDismiss={() => setShowSave(false)} style={{backgroundColor: "#0F172A"}}>
          <Dialog.Title style={{color: "white"}}>Save Ride</Dialog.Title>
          <Dialog.Content>
             <TextInput 
               label="Title" 
               value={rideTitle} 
               onChangeText={setRideTitle} 
               style={{backgroundColor: "#1E293B", marginBottom: 10}} 
               textColor="white"
             />
             <Text style={{color: "#94A3B8"}}>
               Distance: {(distance/1000).toFixed(2)} km • Time: {fmtTime(seconds)}
             </Text>
          </Dialog.Content>
          <Dialog.Actions>
             <Button onPress={() => { setShowSave(false); setPath([]); setRecording(false); setPaused(false); setSeconds(0); setDistance(0); }}>Discard</Button>
             <Button onPress={saveRide} loading={saving} disabled={saving} labelStyle={{color: "#F97316"}}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  overlay: { 
    position: "absolute", bottom: 0, left: 0, right: 0, 
    backgroundColor: "rgba(2,6,23,0.9)", 
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40
  },
  statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, paddingHorizontal: 10 },
  val: { fontSize: 32, fontWeight: "bold", color: "#F9FAFB", textAlign: "center" },
  lbl: { fontSize: 12, color: "#94A3B8", textAlign: "center", textTransform: "uppercase" },
  startBtn: { borderRadius: 30, height: 60, justifyContent: "center", backgroundColor: "#F97316" },
  btnTxt: { fontSize: 20, fontWeight: "900", letterSpacing: 1 },
  ctrlBtn: { borderRadius: 30, height: 50, justifyContent: "center", flex: 1 }
});
EOF

# 2. Upgrade "Home" Feed to Show Real Rides + Maps
cat > "app/(tabs)/home.tsx" <<'EOF'
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Appbar, Card, Text, Avatar } from "react-native-paper";
import { useRouter } from "expo-router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

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
    // If path exists, calculate initial region
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

        {/* Mini Map View (Lite Mode for scrolling performance) */}
        <View style={s.mapContainer}>
           <MapView
             provider={PROVIDER_GOOGLE}
             style={StyleSheet.absoluteFill}
             liteMode
             initialRegion={region}
             scrollEnabled={false}
             zoomEnabled={false}
           >
             {item.path && <Polyline coordinates={item.path} strokeColor="#F97316" strokeWidth={3} />}
           </MapView>
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
echo "Done. Functional Ride Tracker + Feed installed. Run: npx expo start --tunnel --clear"
