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
