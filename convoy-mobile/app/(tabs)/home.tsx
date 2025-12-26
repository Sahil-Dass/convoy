import React, { useEffect, useState, useRef } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity, ScrollView, Image, RefreshControl, ActivityIndicator } from "react-native";
import { Appbar, Card, Text, Avatar, Button, IconButton, FAB } from "react-native-paper";
import { useRouter } from "expo-router";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../../src/firebase";
import { useAuth } from "../../src/auth/AuthProvider";
import { useThemeContext } from "../../src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function FeedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useThemeContext();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);

  const loadFeed = async () => {
    if (!user) return;
    try {
      if (isMounted.current) setRefreshing(true);
      const q = query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(20));
      const snap = await getDocs(q);
      if (isMounted.current) setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted.current) { setLoading(false); setRefreshing(false); }
    }
  };

  useEffect(() => { isMounted.current = true; if (user) loadFeed(); else setLoading(false); return () => { isMounted.current = false; }; }, [user]);

  const renderItem = ({ item }: any) => (
    <Card style={[s.feedCard, { backgroundColor: theme.colors.surface }]}>
      <View style={s.cardHeader}>
         <Avatar.Image size={42} source={{uri: item.userPhoto || "https://i.pravatar.cc/300"}} />
         <View style={{marginLeft: 12, flex: 1}}>
            <Text style={{fontWeight: "700", fontSize: 16, color: theme.colors.onSurface}}>{item.createdBy || "Athlete"}</Text>
            <View style={{flexDirection:"row", alignItems:"center"}}>
               <Text style={{color: "gray", fontSize: 12}}>
                  {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}) : "Just now"}
               </Text>
               <Ionicons name="location-sharp" size={10} color="gray" style={{marginLeft:5}} />
               <Text style={{color: "gray", fontSize: 12}}>{item.location || "Mumbai"}</Text>
            </View>
         </View>
         <IconButton icon="dots-horizontal" iconColor="gray" size={20} />
      </View>

      <Card.Content>
         <View style={{flexDirection:"row", alignItems:"center", marginBottom:10}}>
             <Ionicons name={item.type==="Run"?"walk":"bicycle"} size={20} color={theme.colors.primary} style={{marginRight:8}} />
             <Text style={{fontSize: 20, fontWeight: "bold", color: theme.colors.onSurface}}>{item.name}</Text>
         </View>
         
         <View style={s.statsRow}>
            <View>
              <Text style={s.statLabel}>Distance</Text>
              <Text style={[s.statValue, {color: theme.colors.onSurface}]}>{item.distance} km</Text>
            </View>
            <View>
              <Text style={s.statLabel}>Elev Gain</Text>
              <Text style={[s.statValue, {color: theme.colors.onSurface}]}>{item.elevation} m</Text>
            </View>
            <View>
              <Text style={s.statLabel}>Time</Text>
              <Text style={[s.statValue, {color: theme.colors.onSurface}]}>{item.duration}</Text>
            </View>
         </View>
      </Card.Content>

      {/* Map Image (Using Static Map API Placeholder) */}
      <Image 
        source={{ uri: "https://maps.googleapis.com/maps/api/staticmap?center=19.0760,72.8777&zoom=12&size=600x300&maptype=roadmap&key=YOUR_KEY" }} 
        style={{width:"100%", height: 200, marginTop:10}} 
      />

      <View style={s.actionRow}>
         <View style={{flexDirection:"row", alignItems:"center"}}>
            <IconButton icon="thumb-up-outline" iconColor={theme.isDark ? "#ccc" : "#666"} size={22} />
            <Text style={{color: theme.isDark ? "#ccc" : "#666"}}>{item.likes || 0}</Text>
         </View>
         <View style={{flexDirection:"row", alignItems:"center", marginLeft: 20}}>
            <IconButton icon="comment-outline" iconColor={theme.isDark ? "#ccc" : "#666"} size={22} />
            <Text style={{color: theme.isDark ? "#ccc" : "#666"}}>{item.comments || 0}</Text>
         </View>
         <View style={{flex: 1, alignItems: "flex-end"}}>
            <IconButton icon="share-variant-outline" iconColor={theme.isDark ? "#ccc" : "#666"} size={22} />
         </View>
      </View>
    </Card>
  );

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{backgroundColor: theme.colors.surface, elevation: 1}}>
         <Appbar.Content title="Convoy" titleStyle={{fontWeight: "900", fontStyle:"italic", color: theme.colors.primary, fontSize: 24}} />
         <Appbar.Action icon="magnify" color={theme.colors.onSurface} onPress={() => {}} />
         <Appbar.Action icon="bell-outline" color={theme.colors.onSurface} onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={i => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadFeed} colors={["#F97316"]} />}
        contentContainerStyle={{paddingBottom: 80}}
      />
      <FAB icon="plus" style={s.fab} color="white" onPress={() => router.push("/(tabs)/record")} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  feedCard: { marginBottom: 12, borderRadius: 0, elevation: 2 },
  cardHeader: { flexDirection: "row", padding: 12, paddingBottom: 5, alignItems: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingRight: 40, marginTop: 5 },
  statLabel: { color: "gray", fontSize: 11, textTransform: "uppercase" },
  statValue: { fontSize: 18, fontWeight: "500" },
  actionRow: { flexDirection: "row", paddingHorizontal: 5, paddingVertical: 5, alignItems: "center" },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: "#F97316", borderRadius: 30 },
});
