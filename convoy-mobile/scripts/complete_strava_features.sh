#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1. UPGRADE PROFILE (Real Stats from Firestore)
cat > "app/(tabs)/profile.tsx" <<'EOF'
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Avatar, Text, Button, Card, Divider, ActivityIndicator } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { collection, query, where, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "../../src/firebase";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ rides: 0, distance: 0, time: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
       try {
         const q = query(collection(db, "rides"), where("userId", "==", user.uid));
         const snap = await getDocs(q);
         let dist = 0;
         let time = 0;
         snap.forEach(d => {
            const data = d.data();
            dist += Number(data.stats?.distance || 0);
            time += Number(data.stats?.time || 0);
         });
         setStats({ rides: snap.size, distance: dist, time });
       } catch(e) { console.log(e); }
       finally { setLoading(false); }
    })();
  }, [user]);

  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600);
    return `${h}h ${(s % 3600 / 60).toFixed(0)}m`;
  };

  if (!user) return <View style={s.c}><ActivityIndicator /></View>;

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.Content title="You" titleStyle={{ color: "#F9FAFB", fontWeight: "bold" }} />
        <Appbar.Action icon="cog-outline" color="#F9FAFB" onPress={() => router.push("/(tabs)/settings")} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Avatar.Text size={100} label={user.displayName?.[0] || "U"} style={{ backgroundColor: "#F97316", marginBottom: 12 }} />
          <Text variant="headlineSmall" style={{ color: "#F9FAFB", fontWeight: "bold" }}>{user.displayName || "Rider"}</Text>
          <Text style={{ color: "#94A3B8" }}>{user.email}</Text>
          <Button mode="outlined" style={{ marginTop: 12, borderColor: "#94A3B8" }} textColor="#F9FAFB" onPress={() => router.push("/(tabs)/settings")}>Edit Profile</Button>
        </View>

        <Text variant="titleMedium" style={{ color: "#F9FAFB", marginBottom: 12, fontWeight: "bold" }}>Statistics</Text>
        
        <View style={s.statsGrid}>
           <Card style={s.statCard}>
             <Card.Content>
               <Text style={s.statLabel}>Activities</Text>
               <Text style={s.statVal}>{stats.rides}</Text>
             </Card.Content>
           </Card>
           <Card style={s.statCard}>
             <Card.Content>
               <Text style={s.statLabel}>Distance</Text>
               <Text style={s.statVal}>{stats.distance.toFixed(1)} km</Text>
             </Card.Content>
           </Card>
           <Card style={s.statCard}>
             <Card.Content>
               <Text style={s.statLabel}>Time</Text>
               <Text style={s.statVal}>{fmtTime(stats.time)}</Text>
             </Card.Content>
           </Card>
        </View>

        <Divider style={{ marginVertical: 24, backgroundColor: "#1E293B" }} />

        <Text variant="titleMedium" style={{ color: "#F9FAFB", marginBottom: 12, fontWeight: "bold" }}>Gear</Text>
        <Card style={{ backgroundColor: "#0B1120" }} onPress={() => {}}>
           <Card.Title title="My Bikes" left={(props) => <Avatar.Icon {...props} icon="bike" style={{backgroundColor: "transparent"}} color="#F97316" />} right={(props) => <Button textColor="#94A3B8">Add</Button>} titleStyle={{color: "white"}} />
        </Card>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  statsGrid: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, backgroundColor: "#0B1120" },
  statLabel: { fontSize: 12, color: "#94A3B8" },
  statVal: { fontSize: 20, color: "#F9FAFB", fontWeight: "bold", marginTop: 4 }
});
EOF

# 2. UPGRADE GROUPS (Clubs) - List + FAB
cat > "app/(tabs)/groups.tsx" <<'EOF'
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Appbar, Card, Text, Avatar, FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";

export default function GroupsScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
       try {
         const q = query(collection(db, "groups"));
         const snap = await getDocs(q);
         setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })));
       } catch(e) {}
    })();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => router.push(`/group/${item.id}`)} activeOpacity={0.8}>
      <Card style={s.card}>
        <Card.Title
          title={item.name}
          subtitle={`${item.memberCount || 1} members • ${item.location || "Global"}`}
          left={(props) => <Avatar.Text {...props} label={item.name[0]} style={{backgroundColor: "#F97316"}} />}
          titleStyle={{ color: "white", fontWeight: "bold" }}
          subtitleStyle={{ color: "#94A3B8" }}
        />
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.Content title="Clubs" titleStyle={{ color: "#F9FAFB", fontWeight: "bold" }} />
        <Appbar.Action icon="magnify" color="#F9FAFB" onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={groups}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={{textAlign: "center", color: "#64748B", marginTop: 40}}>No clubs found. Create one!</Text>}
      />

      <FAB
        icon="plus"
        style={s.fab}
        color="white"
        onPress={() => router.push("/(tabs)/rides/create")} // Reusing ride create logic for now, or make separate
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  card: { marginBottom: 10, backgroundColor: "#0B1120" },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, backgroundColor: "#F97316" }
});
EOF

# 3. UPGRADE SETTINGS (Logout + Units)
cat > "app/(tabs)/settings.tsx" <<'EOF'
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, List, Switch, Button, Divider, Text } from "react-native-paper";
import { useAuth } from "../../src/auth/AuthProvider";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = React.useState(true);
  const [units, setUnits] = React.useState(true); // true = metric

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.BackAction color="#F9FAFB" onPress={() => router.back()} />
        <Appbar.Content title="Settings" titleStyle={{ color: "#F9FAFB" }} />
      </Appbar.Header>

      <ScrollView>
        <List.Section>
          <List.Subheader style={{color: "#F97316"}}>Display</List.Subheader>
          <List.Item
            title="Units of Measure"
            description={units ? "Metric (km, m)" : "Imperial (mi, ft)"}
            titleStyle={{color: "white"}}
            descriptionStyle={{color: "#94A3B8"}}
            right={() => <Switch value={units} onValueChange={setUnits} color="#F97316" />}
          />
        </List.Section>
        <Divider style={{backgroundColor: "#1E293B"}} />

        <List.Section>
          <List.Subheader style={{color: "#F97316"}}>Account</List.Subheader>
          <List.Item
             title="Email"
             description={user?.email}
             titleStyle={{color: "white"}}
             descriptionStyle={{color: "#94A3B8"}}
             left={props => <List.Icon {...props} icon="email-outline" color="#94A3B8"/>}
          />
          <List.Item
             title="Privacy Controls"
             titleStyle={{color: "white"}}
             left={props => <List.Icon {...props} icon="lock-outline" color="#94A3B8"/>}
             right={props => <List.Icon {...props} icon="chevron-right" color="#94A3B8"/>}
          />
        </List.Section>

        <View style={{padding: 20, marginTop: 20}}>
          <Button mode="outlined" textColor="#EF4444" style={{borderColor: "#EF4444"}} onPress={() => { signOut(); router.replace("/auth"); }}>
            Log Out
          </Button>
          <Text style={{textAlign: "center", color: "#475569", marginTop: 20, fontSize: 12}}>Version 1.0.0 (Build 2025)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" }
});
EOF

rm -rf .expo node_modules/.cache
echo "Done. All Tabs Upgraded. Run: npx expo start --tunnel --clear"
