#!/bin/bash
set -e  # Exit on any error

echo "🔧 Starting Convoy App Fixes..."

# 1. Update Tab Layout - NOTE THE QUOTES around the path!
cat > "app/(tabs)/_layout_inner.tsx" << 'INNEREOF'
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: Platform.OS === 'android' ? 60 : 85,
        paddingBottom: Platform.OS === 'android' ? 10 : 30,
        paddingTop: 10,
      },
      tabBarActiveTintColor: '#FC4C02',
      tabBarInactiveTintColor: '#888',
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      <Tabs.Screen name="maps/index" options={{ title: 'Maps', tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} /> }} />
      <Tabs.Screen name="record" options={{ title: 'Record', tabBarIcon: ({ color }) => <Ionicons name="radio-button-on" size={32} color={color} /> }} />
      <Tabs.Screen name="groups" options={{ title: 'Groups', tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} />
    </Tabs>
  );
}
INNEREOF

echo "✅ Tab Layout Updated"

# 2. Update Groups with Top Tabs
cat > "app/(tabs)/groups.tsx" << 'GROUPSEOF'
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GroupsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Groups</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="chatbubble-outline" size={24} color="black" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="search" size={24} color="black" /></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}><Ionicons name="settings-outline" size={24} color="black" /></TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={{ flex: 1, backgroundColor: '#f7f7fa', padding: 15 }}>
        <TouchableOpacity style={styles.createBtn}>
          <Text style={styles.createBtnText}>+ Create New Ride</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>Your Active Rides</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Morning Commute</Text>
          <Text style={styles.cardSub}>3 Riders • Live</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: 'black' },
  headerIcons: { flexDirection: 'row' },
  iconBtn: { marginLeft: 20 },
  createBtn: { backgroundColor: '#FC4C02', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  createBtnText: { color: 'white', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10 },
  cardTitle: { fontWeight: 'bold', fontSize: 16 },
  cardSub: { color: '#666', marginTop: 5 }
});
GROUPSEOF

echo "✅ Groups Screen Updated"

# 3. Update Profile
cat > "app/(tabs)/profile.tsx" << 'PROFILEOF'
import React from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, ScrollView } from 'react-native';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const { userProfile } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
           <Image source={{ uri: 'https://ui-avatars.com/api/?name=Rider&background=FC4C02&color=fff' }} style={styles.avatar} />
           <Text style={styles.name}>{userProfile.name}</Text>
           <Text style={styles.location}>Pune, Maharashtra</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { alignItems: 'center', paddingVertical: 30 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  name: { color: 'white', fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  location: { color: '#888', fontSize: 14, marginTop: 5 }
});
PROFILEOF

echo "✅ Profile Updated"

echo "✅✅✅ All Fixes Applied Successfully!"
echo "Now run: npx expo start --clear --tunnel"
