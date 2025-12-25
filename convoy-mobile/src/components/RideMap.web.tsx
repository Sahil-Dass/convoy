import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RideMap({ path }: any) {
  return (
    <View style={s.container}>
      <Text style={s.text}>Map View (Mobile Only)</Text>
      {path && <Text style={s.sub}>{path.length} points</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1E293B", alignItems: "center", justifyContent: "center" },
  text: { color: "#94A3B8", fontWeight: "bold" },
  sub: { color: "#64748B", fontSize: 12 }
});
