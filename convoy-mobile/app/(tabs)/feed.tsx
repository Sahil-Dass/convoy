import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, SafeAreaView, Text, StatusBar } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import FeedCard from '../../components/FeedCard';

const STRAVA_BG = '#F7F7FA';

export default function FeedScreen() {
  const [rides, setRides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'rides'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRides(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}><Text style={styles.headerTitle}>Activity Feed</Text></View>
      <FlatList
        data={rides}
        renderItem={({ item }) => <FeedCard item={item} />}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FC4C02" />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={{padding:20, alignItems:'center'}}><Text style={{color:'#999'}}>No rides yet.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: STRAVA_BG },
  header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#242428' },
  listContent: { paddingVertical: 10 }
});
