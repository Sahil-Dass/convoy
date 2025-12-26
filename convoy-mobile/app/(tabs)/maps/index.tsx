import React, { useCallback, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { FAB, Searchbar, ActivityIndicator } from "react-native-paper";
import { useRouter, useFocusEffect } from "expo-router";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../../src/firebase";
import { useThemeContext } from "../../../src/context/ThemeContext";
import { RouteListItem } from "../../../src/components/RouteListItem";

export default function MapsScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutes = async () => {
    // setLoading(true); // Don't block UI on refocus
    try {
      const q = query(collection(db, "routes"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRoutes(data);
    } catch (e) { console.log(e); } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { fetchRoutes(); }, []));

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <View style={{ padding: 15 }}>
        <Searchbar placeholder="Find a route..." value="" style={{ backgroundColor: theme.colors.surface, elevation: 0 }} />
      </View>
      
      {loading && routes.length === 0 ? (
        <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator color="#F97316" /></View>
      ) : (
        <FlatList
          data={routes}
          renderItem={({ item }) => (
            <RouteListItem route={item} onPress={() => router.push("/routes/" + item.id)} />
          )}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: 15, paddingTop: 0 }}
        />
      )}
      
      <FAB icon="plus" style={[s.fab, { backgroundColor: theme.colors.primary }]} color="white" onPress={() => router.push("/(tabs)/maps/create")} />
    </View>
  );
}
const s = StyleSheet.create({ container: { flex: 1 }, fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 } });
