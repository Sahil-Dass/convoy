import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl, Image } from "react-native";
import { Appbar, Card, Text, Button, FAB, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { useThemeContext } from "../../src/context/ThemeContext"; // Theme
import { getUserGroups } from "../../src/data/groups";
import { Ionicons } from "@expo/vector-icons";

export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useThemeContext(); // Get Theme
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = async () => {
    if (!user) return;
    try {
      const data = await getUserGroups(user.uid);
      setGroups(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadGroups(); }, [user]);

  const renderGroup = ({ item }: any) => (
    <Card 
      style={[s.card, { backgroundColor: theme.colors.surface }]} // Dynamic BG
      onPress={() => router.push(`/group/${item.id}`)}
    >
      <View style={{ flexDirection: "row", padding: 15, alignItems: "center" }}>
        <Image 
          source={{ uri: item.photoURL || "https://i.pravatar.cc/100?u=" + item.id }} 
          style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: "#333" }} 
        />
        <View style={{ marginLeft: 15, flex: 1 }}>
          <Text variant="titleMedium" style={{ fontWeight: "bold", color: theme.colors.onSurface }}>{item.name}</Text>
          <Text variant="bodySmall" style={{ color: "gray" }}>
             {item.memberCount || 1} Members • {item.sport || "Cycling"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="gray" />
      </View>
    </Card>
  );

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface, elevation: 0 }}>
        <Appbar.Content title="Groups" titleStyle={{ fontWeight: "bold", color: theme.colors.onSurface }} />
        <Appbar.Action icon="magnify" color={theme.colors.onSurface} onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={groups}
        renderItem={renderGroup}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadGroups} colors={["#F97316"]} />}
        ListEmptyComponent={
          !loading ? (
            <View style={{ alignItems: "center", marginTop: 50 }}>
               <Ionicons name="people-outline" size={60} color="gray" />
               <Text style={{ color: "gray", marginTop: 10 }}>You haven't joined any groups yet.</Text>
               <Button mode="contained" buttonColor="#F97316" style={{ marginTop: 20 }} onPress={() => {}}>Find a Club</Button>
            </View>
          ) : null
        }
      />

      <FAB
        icon="plus"
        label="Create Group"
        style={[s.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={() => router.push("/(tabs)/groups/create")} // You might need to create this route later
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  card: { marginBottom: 10, borderRadius: 10 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 },
});
