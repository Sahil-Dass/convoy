import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Appbar, Searchbar, SegmentedButtons, Card, Text, FAB } from "react-native-paper";
import { useRouter } from "expo-router";

export default function MapsScreen() {
  const router = useRouter();
  const [scope, setScope] = useState("routes"); // routes | segments
  const [search, setSearch] = useState("");

  return (
    <View style={s.c}>
      <Appbar.Header style={{ backgroundColor: "#020617" }}>
        <Appbar.Content title="Maps" titleStyle={{ color: "#F9FAFB", fontWeight: "bold" }} />
      </Appbar.Header>

      <View style={{padding: 12}}>
        <Searchbar 
          placeholder="Search for routes..." 
          value={search} 
          onChangeText={setSearch} 
          style={{backgroundColor: "#1E293B", color: "white"}} 
          inputStyle={{color: "white"}}
          iconColor="#94A3B8"
        />
        <SegmentedButtons
          value={scope}
          onValueChange={setScope}
          buttons={[
            { value: 'routes', label: 'Routes', checkedColor: "white", style: {backgroundColor: scope==='routes'?'#F97316':'transparent'} },
            { value: 'segments', label: 'Segments', checkedColor: "white", style: {backgroundColor: scope==='segments'?'#F97316':'transparent'} },
          ]}
          style={{marginTop: 12}}
          theme={{colors: {secondaryContainer: "transparent"}}}
        />
      </View>

      <ScrollView contentContainerStyle={{padding: 12}}>
        <Text variant="titleMedium" style={{color: "white", marginBottom: 10, fontWeight: "bold"}}>
           {scope === 'routes' ? "Nearby Routes" : "Popular Segments"}
        </Text>
        
        {/* Mock Items */}
        {[1,2,3].map(i => (
           <Card key={i} style={s.card} onPress={() => {}}>
             <Card.Cover source={{ uri: "https://via.placeholder.com/300x150/1E293B/FFFFFF?text=Map+Preview" }} style={{height: 120}} />
             <Card.Title 
                title={scope === 'routes' ? `Scenic Loop ${i}` : `Sprint Segment ${i}`} 
                subtitle="25 km • 320m elev" 
                titleStyle={{color: "white", fontWeight: "bold"}} 
                subtitleStyle={{color: "#94A3B8"}} 
                right={(props) => <FAB icon={scope==='routes'?"star-outline":"trophy-outline"} small style={{backgroundColor: "transparent", elevation: 0}} color="#F97316" onPress={()=>{}} />}
             />
           </Card>
        ))}
      </ScrollView>
      
      <FAB
         icon="pencil-plus"
         label="Create Route"
         style={s.fab}
         color="white"
         onPress={() => {}} // Could link to a route builder tool
      />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: "#020617" },
  card: { marginBottom: 12, backgroundColor: "#0B1120" },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, backgroundColor: "#F97316" }
});
