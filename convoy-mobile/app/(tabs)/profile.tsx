import React from "react";
import { View, StyleSheet, ScrollView, Image, Dimensions } from "react-native";
import { Text, Avatar, Button, Card, Divider } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/auth/AuthProvider";
import { useThemeContext } from "../../src/context/ThemeContext";
import { BarChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useThemeContext();
  const screenWidth = Dimensions.get("window").width;

  // Mock Data for Charts
  const chartData = {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    datasets: [{ data: [5, 12, 0, 8, 20, 45, 10] }]
  };

  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
    labelColor: (opacity = 1) => theme.colors.onSurface,
    barPercentage: 0.5,
  };

  return (
    <View style={[s.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={[s.header, { backgroundColor: theme.colors.surface }]}>
           <Avatar.Image size={80} source={{ uri: user?.photoURL || "https://i.pravatar.cc/300" }} />
           <Text variant="headlineSmall" style={{ marginTop: 10, fontWeight: "bold", color: theme.colors.onSurface }}>
             {user?.displayName || "Athlete"}
           </Text>
           <Text style={{ color: "gray" }}>Mumbai, India</Text>
           
           <View style={s.followRow}>
              <View style={s.followItem}>
                 <Text style={{fontWeight:"bold", color: theme.colors.onSurface}}>124</Text>
                 <Text style={{color:"gray", fontSize:12}}>Following</Text>
              </View>
              <View style={s.followItem}>
                 <Text style={{fontWeight:"bold", color: theme.colors.onSurface}}>856</Text>
                 <Text style={{color:"gray", fontSize:12}}>Followers</Text>
              </View>
              <View style={s.followItem}>
                 <Text style={{fontWeight:"bold", color: theme.colors.onSurface}}>28</Text>
                 <Text style={{color:"gray", fontSize:12}}>Activities</Text>
              </View>
           </View>

           <Button mode="outlined" style={{marginTop: 15, borderColor:"gray"}} textColor={theme.colors.onSurface} onPress={() => router.push("/(tabs)/edit-profile")}>
             Edit Profile
           </Button>
           <Button mode="text" textColor={theme.colors.primary} onPress={() => router.push("/(tabs)/settings")}>
             Settings
           </Button>
        </View>

        {/* Weekly Progress Chart */}
        <View style={[s.section, { backgroundColor: theme.colors.surface }]}>
           <Text variant="titleMedium" style={{fontWeight:"bold", marginBottom: 15, color: theme.colors.onSurface}}>Weekly Activity (km)</Text>
           <BarChart
             data={chartData}
             width={screenWidth - 40}
             height={220}
             yAxisLabel=""
             yAxisSuffix="km"
             chartConfig={chartConfig}
             style={{ borderRadius: 10 }}
             fromZero
           />
        </View>

        {/* Stats Grid */}
        <View style={[s.section, { backgroundColor: theme.colors.surface }]}>
           <Text variant="titleMedium" style={{fontWeight:"bold", marginBottom: 15, color: theme.colors.onSurface}}>All-Time Stats</Text>
           <View style={s.statsGrid}>
              <View style={s.statBox}>
                 <Text style={{color:"gray"}}>Distance</Text>
                 <Text variant="titleLarge" style={{color: theme.colors.onSurface}}>1,240 km</Text>
              </View>
              <View style={s.statBox}>
                 <Text style={{color:"gray"}}>Time</Text>
                 <Text variant="titleLarge" style={{color: theme.colors.onSurface}}>48h 20m</Text>
              </View>
              <View style={s.statBox}>
                 <Text style={{color:"gray"}}>Elev Gain</Text>
                 <Text variant="titleLarge" style={{color: theme.colors.onSurface}}>12,400m</Text>
              </View>
              <View style={s.statBox}>
                 <Text style={{color:"gray"}}>Rides</Text>
                 <Text variant="titleLarge" style={{color: theme.colors.onSurface}}>42</Text>
              </View>
           </View>
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", padding: 20, marginBottom: 10 },
  followRow: { flexDirection: "row", marginTop: 20, width: "80%", justifyContent: "space-between" },
  followItem: { alignItems: "center" },
  section: { padding: 20, marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statBox: { width: "48%", marginBottom: 20 },
});
