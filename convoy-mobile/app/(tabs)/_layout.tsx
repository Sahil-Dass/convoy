import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: Platform.OS === 'android' ? 65 : 85,
        paddingBottom: Platform.OS === 'android' ? 10 : 30,
        paddingTop: 8,
        elevation: 0,
      },
      tabBarActiveTintColor: '#FC4C02', // Strava Orange
      tabBarInactiveTintColor: '#666666',
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2 },
    }}>
      {/* 1. HOME */}
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
      
      {/* 2. MAPS */}
      <Tabs.Screen name="maps/index" options={{ title: 'Maps', tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> }} />
      
      {/* 3. RECORD (Center Button) */}
      <Tabs.Screen name="record" options={{ 
        title: 'Record',
        tabBarIcon: ({ color }) => (
          <View style={{
            width: 50, height: 50, borderRadius: 25, 
            backgroundColor: '#FC4C02', alignItems: 'center', justifyContent: 'center',
            marginBottom: Platform.OS === 'android' ? 20 : 10,
            borderWidth: 3, borderColor: 'white', elevation: 4
          }}>
            <Ionicons name="radio-button-on" size={30} color="white" />
          </View>
        ),
        tabBarLabelStyle: { display: 'none' } 
      }} />

      {/* 4. GROUPS */}
      <Tabs.Screen name="groups" options={{ title: 'Groups', tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group-outline" size={26} color={color} /> }} />
      
      {/* 5. PROFILE */}
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: ({ color }) => <Ionicons name="person-circle-outline" size={26} color={color} /> }} />

      {/* --- HIDE ALL OTHER FILES FROM TAB BAR --- */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="feed" options={{ href: null }} />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="rides" options={{ href: null }} />
      <Tabs.Screen name="calendar" options={{ href: null }} />
      <Tabs.Screen name="security" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="marketplace" options={{ href: null }} />
      <Tabs.Screen name="maps" options={{ href: null }} />
      <Tabs.Screen name="edit-profile" options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
      <Tabs.Screen name="map.web" options={{ href: null }} />
    </Tabs>
  );
}
