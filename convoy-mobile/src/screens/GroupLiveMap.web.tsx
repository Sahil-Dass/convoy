import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function GroupLiveMapWeb() {
  return (
    <View style={s.c}>
      <Text style={s.h}>Live Map</Text>
      <Text style={s.p}>Live map is available on Android/iOS only.</Text>
      <Text style={s.p}>On web, use the Members screen to see live coordinates.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617", padding: 16, justifyContent: "center" },
  h: { color: "white", fontSize: 22, fontWeight: "900", marginBottom: 8 },
  p: { color: "#94A3B8" },
});
