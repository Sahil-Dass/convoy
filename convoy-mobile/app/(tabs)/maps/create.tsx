import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Dimensions, ActivityIndicator } from "react-native";
import { TextInput, Button, Text, FAB } from "react-native-paper";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../src/firebase";
import { useAuth } from "../../../src/auth/AuthProvider";
import { useThemeContext } from "../../../src/context/ThemeContext";

export default function CreateRouteScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useThemeContext(); // Use isDark
  const [name, setName] = useState("");
  const [points, setPoints] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingLoc, setLoadingLoc] = useState(true);

  // Default: Mumbai
  const [region, setRegion] = useState({
    latitude: 19.0760, longitude: 72.8777,
    latitudeDelta: 0.05, longitudeDelta: 0.05,
  });

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission denied", "We need location access to center the map.");
          setLoadingLoc(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (e) {
        console.log(e);
      } finally {
        setLoadingLoc(false);
      }
    })();
  }, []);

  const handleMapPress = (e: any) => {
    const newPoint = e.nativeEvent.coordinate;
    setPoints([...points, newPoint]);
  };

  const handleUndo = () => {
    if (points.length > 0) setPoints(points.slice(0, -1));
  };

  const handleSave = async () => {
    if (!name) return Alert.alert("Missing Name", "Please name your route.");
    if (points.length < 2) return Alert.alert("Invalid Route", "Tap on the map to add at least 2 points.");
    setSaving(true);
    try {
      await addDoc(collection(db, "routes"), {
        name,
        points,
        distance: 5.0,
        createdBy: user?.uid,
        createdAt: serverTimestamp(),
        type: "Ride",
      });
      Alert.alert("Success", "Route saved!");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingLoc) {
    return <View style={[s.container, {justifyContent:'center', backgroundColor: theme.colors.background}]}><ActivityIndicator size="large" color="#F97316"/></View>;
  }

  return (
    <View style={s.container}>
      <MapView
        style={s.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onPress={handleMapPress}
        customMapStyle={isDark ? darkMapStyle : []} // <-- FIX: Check isDark boolean
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {points.map((p, i) => (
           <Marker key={i} coordinate={p} pinColor="#F97316" />
        ))}
        <Polyline coordinates={points} strokeColor="#F97316" strokeWidth={4} />
      </MapView>

      <View style={[s.controls, { backgroundColor: theme.colors.surface }]}>
         <TextInput
           label="Route Name"
           value={name}
           onChangeText={setName}
           mode="outlined"
           style={{marginBottom: 10, backgroundColor: theme.colors.background}}
           textColor={theme.colors.onSurface}
         />
         <View style={s.btnRow}>
            <Button mode="outlined" onPress={handleUndo} disabled={points.length===0} textColor={theme.colors.onSurface}>Undo</Button>
            <Button mode="contained" onPress={handleSave} loading={saving} buttonColor="#F97316">Save</Button>
         </View>
      </View>

      <FAB icon="close" style={s.closeFab} small onPress={() => router.back()} />
    </View>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
];

const s = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },
  controls: { position: "absolute", bottom: 0, width: "100%", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5 },
  btnRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  closeFab: { position: "absolute", top: 40, left: 20, backgroundColor: "white" }
});
