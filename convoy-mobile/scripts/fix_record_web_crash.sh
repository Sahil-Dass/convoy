#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1. Create the Platform-Specific Tracker Component (Native)
# This contains ALL the 'react-native-maps' and 'expo-location' logic
cat > "src/components/RideTracker.native.tsx" <<'EOF'
import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Dialog, Portal, TextInput } from "react-native-paper";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthProvider";

export default function RideTracker() {
  const { user } = useAuth();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [path, setPath] = useState<{latitude: number; longitude: number}[]>([]);
  
  const [showSave, setShowSave] = useState(false);
  const [rideTitle, setRideTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let interval: any;
    if (recording && !paused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [recording, paused]);

  useEffect(() => {
    let sub: any;
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, distanceInterval: 5 },
        (loc) => {
          if (recording && !paused) {
             setSpeed(loc.coords.speed || 0);
             setPath(prev => [...prev, { latitude: loc.coords.latitude, longitude: loc.coords.longitude }]);
             mapRef.current?.animateCamera({ center: { latitude: loc.coords.latitude, longitude: loc.coords.longitude }, zoom: 17 });
           }
        }
      );
    };
    startTracking();
    return () => sub?.remove();
  }, [recording, paused]);

  useEffect(() => {
     if (path.length < 2) return;
     const last = path[path.length - 1];
     const prev = path[path.length - 2];
     const dLat = (last.latitude - prev.latitude) * 111000;
     const dLng = (last.longitude - prev.longitude) * 111000 * Math.cos(last.latitude * (Math.PI/180));
     const dist = Math.sqrt(dLat*dLat + dLng*dLng);
     setDistance(d => d + dist);
  }, [path.length]);

  const saveRide = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "rides"), {
        title: rideTitle || "Untitled Ride",
        createdBy: user.displayName || "Rider",
        userId: user.uid,
        createdAt: serverTimestamp(),
        stats: { distance: (distance / 1000).toFixed(2), time: seconds, avgSpeed: (distance / seconds * 3.6).toFixed(1) },
        path: path,
        type: "Ride"
      });
      setRecording(false); setPaused(false); setSeconds(0); setDistance(0); setPath([]); setShowSave(false);
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
        initialRegion={{ latitude: 19.0760, longitude: 72.8777, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
      >
        {path.length > 0 && <Polyline coordinates={path} strokeColor="#F97316" strokeWidth={4} />}
      </MapView>

      <View style={s.overlay}>
         <View style={s.statRow}>
            <View><Text style={s.val}>{fmtTime(seconds)}</Text><Text style={s.lbl}>Time</Text></View>
            <View><Text style={s.val}>{(speed * 3.6).toFixed(1)}</Text><Text style={s.lbl}>Speed</Text></View>
            <View><Text style={s.val}>{(distance / 1000).toFixed(2)}</Text><Text style={s.lbl}>Dist</Text></View>
         </View>
         {!recording ? (
           <Button mode="contained" style={s.startBtn} labelStyle={s.btnTxt} onPress={() => setRecording(true)}>START</Button>
         ) : (
           <View style={{flexDirection: "row", gap: 20, justifyContent: "center"}}>
             <Button mode="contained" style={[s.ctrlBtn, {backgroundColor: paused ? "#22C55E" : "#F59E0B"}]} onPress={() => setPaused(!paused)}>{paused ? "RESUME" : "PAUSE"}</Button>
             {paused && <Button mode="contained" style={[s.ctrlBtn, {backgroundColor: "#EF4444"}]} onPress={() => { setPaused(true); setRideTitle("My Ride"); setShowSave(true); }}>FINISH</Button>}
           </View>
         )}
      </View>

      <Portal>
        <Dialog visible={showSave} onDismiss={() => setShowSave(false)} style={{backgroundColor: "#0F172A"}}>
          <Dialog.Title style={{color: "white"}}>Save Ride</Dialog.Title>
          <Dialog.Content>
             <TextInput label="Title" value={rideTitle} onChangeText={setRideTitle} style={{backgroundColor: "#1E293B"}} textColor="white" />
          </Dialog.Content>
          <Dialog.Actions>
             <Button onPress={() => setShowSave(false)}>Discard</Button>
             <Button onPress={saveRide} loading={saving}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  overlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(2,6,23,0.9)", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  statRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, paddingHorizontal: 10 },
  val: { fontSize: 32, fontWeight: "bold", color: "#F9FAFB", textAlign: "center" },
  lbl: { fontSize: 12, color: "#94A3B8", textAlign: "center", textTransform: "uppercase" },
  startBtn: { borderRadius: 30, height: 60, justifyContent: "center", backgroundColor: "#F97316" },
  btnTxt: { fontSize: 20, fontWeight: "900", letterSpacing: 1 },
  ctrlBtn: { borderRadius: 30, height: 50, justifyContent: "center", flex: 1 }
});
EOF

# 2. Create the Web Fallback Tracker
cat > "src/components/RideTracker.web.tsx" <<'EOF'
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";

export default function RideTracker() {
  return (
    <View style={s.c}>
      <Text style={s.text}>GPS Tracking is Mobile Only</Text>
      <Text style={s.sub}>Please use the Android app to record rides.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617", alignItems: "center", justifyContent: "center" },
  text: { color: "#F9FAFB", fontSize: 20, fontWeight: "bold" },
  sub: { color: "#94A3B8", marginTop: 10 }
});
EOF

# 3. Clean the Record Screen (No Native Imports)
cat > "app/(tabs)/record.tsx" <<'EOF'
import React from "react";
import { View, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import RideTracker from "../../src/components/RideTracker"; // Safe import

export default function RecordScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: "#020617", elevation: 0 }}>
        <Appbar.Content title="Record" titleStyle={{ color: "#F9FAFB" }} />
      </Appbar.Header>
      <RideTracker />
    </View>
  );
}
EOF

rm -rf .expo node_modules/.cache
echo "Done. Record screen web crash fixed. Run: npx expo start --tunnel --clear"
