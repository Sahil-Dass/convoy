import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Appbar, FAB } from "react-native-paper";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../src/firebase";
import { useThemeContext } from "../../src/context/ThemeContext";

export default function RouteDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme, isDark } = useThemeContext();
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const snap = await getDoc(doc(db, "routes", id as string));
        if (snap.exists()) setRoute({ id: snap.id, ...snap.data() });
      } catch (e) { console.log(e); } finally { setLoading(false); }
    };
    if (id) fetchRoute();
  }, [id]);

  const handleStartRide = () => {
    router.push({ pathname: "/(tabs)/record", params: { routeId: id } });
  };

  if (loading) return <View style={[s.container, {backgroundColor: theme.colors.background, justifyContent:'center'}]}><ActivityIndicator size="large" color="#F97316"/></View>;
  if (!route) return <View style={[s.container, {backgroundColor: theme.colors.background}]}><Text>Route not found</Text></View>;

  // SAFE GUARD: Check if points exist
  const points = route.points || [];
  const hasPoints = points.length > 0;
  
  const initialRegion = hasPoints ? {
    latitude: points[0].latitude,
    longitude: points[0].longitude,
    latitudeDelta: 0.05, longitudeDelta: 0.05
  } : {
    latitude: 19.0760, longitude: 72.8777, // Default fallback
    latitudeDelta: 0.1, longitudeDelta: 0.1
  };

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.BackAction onPress={() => router.back()} color={theme.colors.onSurface} />
        <Appbar.Content title={route.name} titleStyle={{ color: theme.colors.onSurface }} />
      </Appbar.Header>

      <MapView
        key={isDark ? "dark" : "light"}
        style={s.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isDark ? darkMapStyle : []}
        initialRegion={initialRegion}
      >
         {hasPoints && <Polyline coordinates={points} strokeColor="#F97316" strokeWidth={4} />}
         {hasPoints && <Marker coordinate={points[0]} title="Start" pinColor="green" />}
         {hasPoints && <Marker coordinate={points[points.length-1]} title="End" pinColor="red" />}
      </MapView>

      <FAB label="Start Ride" icon="bike" style={[s.fab, {backgroundColor: "#F97316"}]} color="white" onPress={handleStartRide} />
    </View>
  );
}
const darkMapStyle = [{ "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] }];
const s = StyleSheet.create({ container: { flex: 1 }, map: { flex: 1 }, fab: { position: 'absolute', bottom: 50, right: 20 } });
