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
