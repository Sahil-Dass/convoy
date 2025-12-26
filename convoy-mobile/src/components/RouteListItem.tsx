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
