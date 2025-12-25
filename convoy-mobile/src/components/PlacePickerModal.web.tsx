import React from "react";
import { View, Text, StyleSheet } from "react-native";

export type PickedPlace = { label?: string; lat: number; lng: number };

export default function PlacePickerModalWeb() {
  return (
    <View style={s.c}>
      <Text style={s.h}>Map picker</Text>
      <Text style={s.p}>Map picker is available on Android/iOS only.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617", justifyContent: "center", padding: 16 },
  h: { color: "white", fontSize: 20, fontWeight: "900", marginBottom: 8 },
  p: { color: "#94A3B8" },
});
