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

        <Text variant="titleMedium" style={{ color: "#F9FAFB", marginBottom: 12, fontWeight: "bold" }}>Training Log</Text>
        <View style={{flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 24}}>
           {[...Array(28)].map((_, i) => (
              <View key={i} style={{width: 30, height: 30, borderRadius: 15, backgroundColor: Math.random() > 0.7 ? "#F97316" : "#1E293B", alignItems: "center", justifyContent: "center"}}>
                 <Text style={{color: "white", fontSize: 10}}>{i+1}</Text>
              </View>
           ))}
        </View>

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
