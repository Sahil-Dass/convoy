import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Convoy</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="notifications-outline" size={24} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="settings-outline" size={24} color="#333" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weekly Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Weekly Goal</Text>
            <Text style={styles.progressValue}>45 / 100 km</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '45%' }]} />
          </View>
        </View>

        {/* Activity Feed Item 1 */}
        <View style={styles.activityCard}>
          <View style={styles.userRow}>
             <View style={styles.avatar} />
             <View>
               <Text style={styles.userName}>Rider Name</Text>
               <Text style={styles.timestamp}>Today at 6:45 AM • Pune, IN</Text>
             </View>
          </View>
          <Text style={styles.activityTitle}>Morning Hill Climb 🚵</Text>
          <View style={styles.mapPlaceholder}>
             <Ionicons name="map" size={40} color="#ccc" />
             <Text style={{color: '#888'}}>Map Preview</Text>
          </View>
          <View style={styles.statsRow}>
            <View><Text style={styles.statLabel}>Distance</Text><Text style={styles.statNum}>24.5 km</Text></View>
            <View><Text style={styles.statLabel}>Elev Gain</Text><Text style={styles.statNum}>340 m</Text></View>
            <View><Text style={styles.statLabel}>Time</Text><Text style={styles.statNum}>1h 12m</Text></View>
          </View>
        </View>

        {/* Activity Feed Item 2 */}
        <View style={styles.activityCard}>
          <View style={styles.userRow}>
             <View style={[styles.avatar, { backgroundColor: '#4A90E2' }]} />
             <View>
               <Text style={styles.userName}>Sarah Jenkins</Text>
               <Text style={styles.timestamp}>Yesterday at 5:30 PM</Text>
             </View>
          </View>
          <Text style={styles.activityTitle}>Sunset Loop 🌅</Text>
          <View style={styles.statsRow}>
            <View><Text style={styles.statLabel}>Distance</Text><Text style={styles.statNum}>18.2 km</Text></View>
            <View><Text style={styles.statLabel}>Elev Gain</Text><Text style={styles.statNum}>120 m</Text></View>
            <View><Text style={styles.statLabel}>Time</Text><Text style={styles.statNum}>45m 10s</Text></View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#FC4C02', fontStyle: 'italic' },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { padding: 4 },
  content: { flex: 1 },
  
  progressCard: { margin: 16, padding: 16, backgroundColor: 'white', borderRadius: 8, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressTitle: { fontWeight: 'bold', color: '#333' },
  progressValue: { color: '#FC4C02', fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#eee', borderRadius: 4 },
  progressBarFill: { height: 8, backgroundColor: '#FC4C02', borderRadius: 4 },

  activityCard: { backgroundColor: 'white', marginBottom: 12, padding: 16, elevation: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', marginRight: 12 },
  userName: { fontWeight: 'bold', fontSize: 15 },
  timestamp: { color: '#666', fontSize: 12 },
  activityTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  mapPlaceholder: { height: 150, backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  statLabel: { color: '#888', fontSize: 12 },
  statNum: { fontSize: 16, fontWeight: '600', color: '#333' }
});
