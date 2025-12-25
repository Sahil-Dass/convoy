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
