import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Animated, Easing } from 'react-native';
import { updateDoc, doc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function FeedCard({ item }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(item.kudos || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Animations
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handleLike = async () => {
    if (liked) return; // Prevent double like for prototype
    setLiked(true);
    setLikesCount(c => c + 1);

    // Pop Animation
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1.0, duration: 100, useNativeDriver: true }),
    ]).start();

    // DB Update
    const rideRef = doc(db, 'rides', item.id);
    await updateDoc(rideRef, { kudos: increment(1) });
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    const rideRef = doc(db, 'rides', item.id);
    await updateDoc(rideRef, {
      comments: arrayUnion({ text: commentText, user: 'Me', time: Date.now() })
    });
    setCommentText('');
    setShowComments(false);
    // In a real app, you'd update local state to show it immediately
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View>
          <Text style={styles.name}>Motor Rider</Text>
          <Text style={styles.date}>{new Date(item.timestamp?.toDate()).toLocaleDateString()}</Text>
        </View>
      </View>

      <Text style={styles.title}>{item.name}</Text>

      {/* Stats Grid */}
      <View style={styles.statsRow}>
        <View>
          <Text style={styles.label}>Dist</Text>
          <Text style={styles.val}>{item.stats?.distance?.toFixed(1)} km</Text>
        </View>
        <View>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.val}>{Math.floor(item.stats?.duration / 60)}m</Text>
        </View>
        <View>
           <Text style={styles.label}>Avg Speed</Text>
           <Text style={styles.val}>{(item.stats?.speed * 3.6).toFixed(1)} km/h</Text>
        </View>
      </View>

      {/* Map Preview Placeholder (Static or Mini-Map) */}
      <View style={styles.mapPreview}>
        <Text style={{color:'#aaa'}}>🗺️ Route Map Preview</Text>
        {/* If item.path exists, you could render a static SVG line here */}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Animated.Text style={[styles.icon, { transform: [{ scale: scaleValue }], color: liked ? '#ff4757' : '#666' }]}>
            {liked ? '❤️' : '��'}
          </Animated.Text>
          <Text style={styles.actionText}>{likesCount} Kudos</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowComments(true)} style={styles.actionBtn}>
          <Text style={styles.icon}>💬</Text>
          <Text style={styles.actionText}>{item.comments?.length || 0} Comments</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Modal */}
      <Modal visible={showComments} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comments</Text>
            {/* List existing comments here */}
            {(item.comments || []).map((c, i) => (
              <Text key={i} style={styles.commentLine}><Text style={{fontWeight:'bold'}}>{c.user}:</Text> {c.text}</Text>
            ))}
            
            <TextInput 
              style={styles.input} 
              placeholder="Write a comment..." 
              value={commentText}
              onChangeText={setCommentText}
            />
            <View style={{flexDirection:'row', justifyContent:'flex-end', gap:10, marginTop:10}}>
              <TouchableOpacity onPress={() => setShowComments(false)}><Text style={{color:'red'}}>Close</Text></TouchableOpacity>
              <TouchableOpacity onPress={handlePostComment}><Text style={{color:'blue', fontWeight:'bold'}}>Post</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginHorizontal: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF5500', marginRight: 10 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  date: { color: '#999', fontSize: 12 },
  title: { fontSize: 18, fontWeight: '800', marginBottom: 15, color: '#222' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 10 },
  label: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  val: { fontSize: 20, fontWeight: '300', color: '#444' },
  mapPreview: { height: 120, backgroundColor: '#f8f9fa', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12 },
  actionBtn: { cursor: "pointer", flexDirection: 'row', alignItems: 'center', marginRight: 25 },
  icon: { fontSize: 18, marginRight: 5 },
  actionText: { fontSize: 14, color: '#555', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 300 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  commentLine: { marginBottom: 10, fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginTop: 10 }
});
