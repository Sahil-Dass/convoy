import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import * as Location from 'expo-location';
import { useThemeContext } from "../../src/context/ThemeContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/firebase";

export default function RecordScreen() {
  const { theme, isDark } = useThemeContext();
  const { routeId } = useLocalSearchParams();
  const [ghostPath, setGhostPath] = useState<any[]>([]);
  const [recording, setRecording] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [path, setPath] = useState<any[]>([]);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (routeId) {
      getDoc(doc(db, "routes", routeId as string)).then(snap => {
        if(snap.exists()) setGhostPath(snap.data().points || []);
      });
    }
  }, [routeId]);

  useEffect(() => {
    let interval: any;
    if (recording) interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [recording]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      if(recording) setPath(prev => [...prev, { latitude: loc.coords.latitude, longitude: loc.coords.longitude }]);
    })();
  }, [recording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <MapView
        key={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        showsUserLocation
        followsUserLocation
        userInterfaceStyle={isDark ? "dark" : "light"}
        customMapStyle={isDark ? darkMapStyle : []}
        region={location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.005, longitudeDelta: 0.005,
        } : undefined}
      >
         {ghostPath.length > 0 && <Polyline coordinates={ghostPath} strokeColor="rgba(255,255,255,0.5)" strokeWidth={5} />}
         <Polyline coordinates={path} strokeColor="#F97316" strokeWidth={5} />
      </MapView>

      <View style={s.overlay}>
         <View style={[s.statCard, { backgroundColor: theme.colors.surface }]}>
            <View style={s.statItem}><Text style={[s.statLabel, {color: "gray"}]}>Time</Text><Text style={[s.statValue, {color: theme.colors.onSurface}]}>{formatTime(duration)}</Text></View>
            <View style={s.statItem}><Text style={[s.statLabel, {color: "gray"}]}>Speed</Text><Text style={[s.statValue, {color: theme.colors.onSurface}]}>0.0</Text></View>
            <View style={s.statItem}><Text style={[s.statLabel, {color: "gray"}]}>Dist</Text><Text style={[s.statValue, {color: theme.colors.onSurface}]}>0.00</Text></View>
         </View>
         <View style={s.controls}>
             {!recording ? (
               <Button mode="contained" onPress={() => setRecording(true)} style={s.startBtn} contentStyle={{height: 80}} labelStyle={{fontSize: 20, fontWeight: "bold"}} buttonColor="#F97316">Start</Button>
             ) : (
               <View style={{flexDirection:"row", gap: 20}}>
                  <Button mode="contained" onPress={() => setRecording(false)} style={s.pauseBtn} buttonColor="#EF4444">Pause</Button>
                  <Button mode="contained" onPress={() => { setRecording(false); setDuration(0); setPath([]); }} style={s.pauseBtn} buttonColor="gray">Stop</Button>
               </View>
             )}
         </View>
      </View>
    </View>
  );
}
const darkMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }];
const s = StyleSheet.create({ container: { flex: 1 }, overlay: { position: "absolute", bottom: 0, width: "100%", padding: 20, alignItems: "center" }, statCard: { flexDirection: "row", justifyContent: "space-around", width: "100%", padding: 20, borderRadius: 15, marginBottom: 30, elevation: 5 }, statItem: { alignItems: "center" }, statLabel: { fontSize: 12, textTransform: "uppercase", marginBottom: 5 }, statValue: { fontSize: 28, fontWeight: "bold" }, controls: { alignItems: "center", width: "100%" }, startBtn: { borderRadius: 40, width: "80%", justifyContent: "center" }, pauseBtn: { borderRadius: 30, width: 120, height: 60, justifyContent: "center" } });
