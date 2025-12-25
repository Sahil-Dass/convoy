import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Appbar, Text, Card, Avatar, Divider, ActivityIndicator } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../src/firebase";
import RideMap from "../../../src/components/RideMap";

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
       try {
         const snap = await getDoc(doc(db, "rides", id));
         if (snap.exists()) setActivity({ id: snap.id, ...snap.data() });
       } catch(e) { console.log(e); }
       finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <View style={s.c}><ActivityIndicator color="#F97316" /></View>;
  if (!activity) return <View style={s.c}><Text style={{color: "white"}}>Activity not found</Text></View>;

  const fmtTime = (s: number) => {
     if (!s) return "0s";
     const h = Math.floor(s / 3600);
     const m = Math.floor((s % 3600) / 60);
     return `${h}h ${m}m`;
  };

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.BackAction color="#F9FAFB" onPress={() => router.back()} />
        <Appbar.Content title={activity.title || "Ride"} titleStyle={{ color: "#F9FAFB", fontWeight: "bold" }} />
        <Appbar.Action icon="share-variant" color="#F9FAFB" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView>
        <View style={s.header}>
           <Avatar.Text size={50} label={(activity.createdBy?.[0] || "U").toUpperCase()} style={{backgroundColor: "#F97316"}} />
           <View style={{marginLeft: 12}}>
              <Text style={s.name}>{activity.createdBy}</Text>
              <Text style={s.date}>{new Date(activity.createdAt?.seconds * 1000).toLocaleString()}</Text>
           </View>
        </View>

        <View style={s.statsRow}>
           <View>
             <Text style={s.statVal}>{activity.stats?.distance} km</Text>
             <Text style={s.statLbl}>Distance</Text>
           </View>
           <View>
             <Text style={s.statVal}>{fmtTime(activity.stats?.time)}</Text>
             <Text style={s.statLbl}>Moving Time</Text>
           </View>
           <View>
             <Text style={s.statVal}>{activity.stats?.avgSpeed} km/h</Text>
             <Text style={s.statLbl}>Avg Speed</Text>
           </View>
        </View>

        <View style={s.mapBox}>
           <RideMap path={activity.path} initialRegion={null} liteMode={true} />
        </View>

        <Card style={s.analysisCard}>
          <Card.Title title="Analysis" titleStyle={{color: "white"}} left={props => <Avatar.Icon {...props} icon="chart-bar" style={{backgroundColor: "transparent"}} color="#F97316"/>} />
          <Card.Content>
             <Text style={{color: "#94A3B8"}}>Elevation Gain: 124 m (Simulated)</Text>
             <Text style={{color: "#94A3B8"}}>Calories: 450 kcal (Est)</Text>
             <Divider style={{marginVertical: 10, backgroundColor: "#334155"}} />
             <Text style={{color: "#F97316", fontWeight: "bold"}}>View Full Analysis ></Text>
          </Card.Content>
        </Card>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  header: { flexDirection: "row", alignItems: "center", padding: 16 },
  name: { color: "white", fontWeight: "bold", fontSize: 16 },
  date: { color: "#94A3B8", fontSize: 12 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#1E293B" },
  statVal: { color: "white", fontSize: 24, fontWeight: "bold" },
  statLbl: { color: "#94A3B8", fontSize: 12 },
  mapBox: { height: 250, marginVertical: 10 },
  analysisCard: { margin: 16, backgroundColor: "#0B1120" }
});
