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
