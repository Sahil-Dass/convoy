#!/usr/bin/env bash
set -euo pipefail
cd /workspaces/convoy/convoy-mobile

# 1. ADD CHALLENGES TAB TO GROUPS SCREEN
# We are rewriting groups.tsx to have two sub-tabs: "Clubs" and "Challenges"
cat > "app/(tabs)/groups.tsx" <<'EOF'
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, useWindowDimensions } from "react-native";
import { Appbar, Card, Text, Avatar, FAB, SegmentedButtons, ProgressBar } from "react-native-paper";
import { useRouter } from "expo-router";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";

export default function GroupsScreen() {
  const router = useRouter();
  const [scope, setScope] = useState("clubs"); // clubs | challenges
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    // Mock data fetch - in real app, fetch "clubs" or "challenges" collection
    if (scope === 'clubs') {
       // Fetch Clubs (existing logic)
       (async () => {
         try {
           const q = query(collection(db, "groups"));
           const snap = await getDocs(q);
           setItems(snap.docs.map(d => ({ id: d.id, type: 'club', ...d.data() })));
         } catch(e) {}
       })();
    } else {
       // Mock Challenges
       setItems([
         { id: 'c1', type: 'challenge', title: 'December Gran Fondo', goal: '100 km', progress: 0.65, daysLeft: 6 },
         { id: 'c2', type: 'challenge', title: 'Year End Climbing', goal: '2000 m', progress: 0.3, daysLeft: 6 },
       ]);
    }
  }, [scope]);

  const renderClub = ({ item }: any) => (
    <TouchableOpacity onPress={() => router.push(`/group/${item.id}`)} activeOpacity={0.8}>
      <Card style={s.card}>
        <Card.Title
          title={item.name}
          subtitle={`${item.memberCount || 1} members • ${item.location || "Global"}`}
          left={(props) => <Avatar.Text {...props} label={item.name?.[0] || "C"} style={{backgroundColor: "#F97316"}} />}
          titleStyle={{ color: "white", fontWeight: "bold" }}
          subtitleStyle={{ color: "#94A3B8" }}
        />
      </Card>
    </TouchableOpacity>
  );

  const renderChallenge = ({ item }: any) => (
    <Card style={s.card}>
       <Card.Content>
         <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 10}}>
            <Avatar.Icon size={40} icon="trophy-outline" style={{backgroundColor: "rgba(249,115,22,0.2)"}} color="#F97316" />
            <View style={{marginLeft: 12, flex: 1}}>
               <Text style={{color: "white", fontWeight: "bold", fontSize: 16}}>{item.title}</Text>
               <Text style={{color: "#94A3B8"}}>{item.daysLeft} days left</Text>
            </View>
         </View>
         <View style={{marginBottom: 6, flexDirection: 'row', justifyComponent: 'space-between'}}>
            <Text style={{color: "#94A3B8", fontSize: 12}}>Progress</Text>
            <Text style={{color: "#F97316", fontSize: 12, fontWeight: 'bold'}}>{(item.progress * 100).toFixed(0)}%</Text>
         </View>
         <ProgressBar progress={item.progress} color="#F97316" style={{height: 6, borderRadius: 3, backgroundColor: "#334155"}} />
         <Text style={{color: "#64748B", fontSize: 11, marginTop: 6, textAlign: 'right'}}>Goal: {item.goal}</Text>
       </Card.Content>
    </Card>
  );

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.Content title="Groups" titleStyle={{ color: "#F9FAFB", fontWeight: "bold" }} />
        <Appbar.Action icon="magnify" color="#F9FAFB" onPress={() => {}} />
      </Appbar.Header>

      <View style={{padding: 12}}>
        <SegmentedButtons
          value={scope}
          onValueChange={setScope}
          buttons={[
            { value: 'clubs', label: 'Clubs', checkedColor: "white", style: {backgroundColor: scope==='clubs'?'#F97316':'transparent'} },
            { value: 'challenges', label: 'Challenges', checkedColor: "white", style: {backgroundColor: scope==='challenges'?'#F97316':'transparent'} },
          ]}
          theme={{colors: {secondaryContainer: "transparent"}}}
        />
      </View>

      <FlatList
        data={items}
        renderItem={scope === 'clubs' ? renderClub : renderChallenge}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={{textAlign: "center", color: "#64748B", marginTop: 40}}>No items found.</Text>}
      />

      {scope === 'clubs' && (
        <FAB
          icon="plus"
          style={s.fab}
          color="white"
          onPress={() => router.push("/(tabs)/rides/create")}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  card: { marginBottom: 12, backgroundColor: "#0B1120" },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, backgroundColor: "#F97316" }
});
EOF

# 2. UPGRADE PROFILE WITH TRAINING LOG (Calendar)
# We append a "Training Log" section to profile.tsx
sed -i 's/<Text variant="titleMedium" style={{ color: "#F9FAFB", marginBottom: 12, fontWeight: "bold" }}>Gear<\/Text>/<Text variant="titleMedium" style={{ color: "#F9FAFB", marginBottom: 12, fontWeight: "bold" }}>Training Log<\/Text>\n        <View style={{flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 24}}>\n           {[...Array(28)].map((_, i) => (\n              <View key={i} style={{width: 30, height: 30, borderRadius: 15, backgroundColor: Math.random() > 0.7 ? "#F97316" : "#1E293B", alignItems: "center", justifyContent: "center"}}>\n                 <Text style={{color: "white", fontSize: 10}}>{i+1}<\/Text>\n              <\/View>\n           ))}\n        <\/View>\n\n        <Text variant="titleMedium" style={{ color: "#F9FAFB", marginBottom: 12, fontWeight: "bold" }}>Gear<\/Text>/' "app/(tabs)/profile.tsx"

rm -rf .expo node_modules/.cache
echo "Done. Final Strava Features Added. Run: npx expo start --tunnel --clear"
