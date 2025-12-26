import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useThemeContext } from "../../src/context/ThemeContext";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";
import { RouteListItem } from "../../src/components/RouteListItem";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const [recentRoutes, setRecentRoutes] = useState<any[]>([]);

  const fetchRecent = async () => {
    try {
      const q = query(collection(db, "routes"), orderBy("createdAt", "desc"), limit(3));
      const snap = await getDocs(q);
      setRecentRoutes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.log(e); }
  };

  useFocusEffect(useCallback(() => { fetchRecent(); }, []));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 20, color: theme.colors.onBackground }}>
          Welcome back!
        </Text>

        <View style={styles.sectionHeader}>
          <Text variant="titleLarge" style={{ fontWeight: 'bold', color: theme.colors.onBackground }}>Recent Rides</Text>
          <Button mode="text" onPress={() => router.push("/(tabs)/maps")}>See All</Button>
        </View>

        {recentRoutes.map((route) => (
          <RouteListItem 
            key={route.id} 
            route={route} 
            onPress={() => router.push("/routes/" + route.id)} 
          />
        ))}

        {recentRoutes.length === 0 && (
          <Text style={{color: "gray", textAlign: "center", marginTop: 20}}>No recent rides found. Start one!</Text>
        )}
        
        <Button 
          mode="contained" 
          icon="plus" 
          style={{ marginTop: 30, backgroundColor: "#F97316" }} 
          contentStyle={{ height: 50 }}
          onPress={() => router.push("/(tabs)/maps/create")}
        >
          Create New Route
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }
});
