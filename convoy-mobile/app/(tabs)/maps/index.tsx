import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapsScreen() {
  return (
    <SafeAreaView style={styles.container}>
       {/* Search Bar */}
       <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
          <TextInput 
             placeholder="Find a route, place or segment" 
             placeholderTextColor="#666"
             style={styles.searchInput}
          />
       </View>

       {/* Map Placeholder */}
       <View style={styles.mapArea}>
          <Text style={{ color: '#888', marginBottom: 10 }}>Map View Loading...</Text>
          <TouchableOpacity style={styles.primaryBtn}>
             <Text style={styles.btnText}>Use Current Location</Text>
          </TouchableOpacity>
       </View>

       {/* Floating Tools */}
       <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab}><Ionicons name="layers" size={24} color="#333" /></TouchableOpacity>
          <TouchableOpacity style={styles.fab}><Ionicons name="locate" size={24} color="#333" /></TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  searchContainer: { margin: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f0f0f5', padding: 12, borderRadius: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  mapArea: { flex: 1, backgroundColor: '#e5e5e5', justifyContent: 'center', alignItems: 'center' },
  primaryBtn: { backgroundColor: '#FC4C02', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
  btnText: { color: 'white', fontWeight: 'bold' },
  fabContainer: { position: 'absolute', right: 16, bottom: 30, gap: 12 },
  fab: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: {width: 0, height: 2} }
});
