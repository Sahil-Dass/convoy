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
