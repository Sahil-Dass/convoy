import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import * as Location from 'expo-location';

const AppContext = createContext<any>(null);

export function AppProvider({ children }) {
  // Mock User ID for Prototype (In real app, use Auth)
  const [userId] = useState('user_' + Math.floor(Math.random() * 1000));
  const [userProfile, setUserProfile] = useState({ name: 'Rider ' + Math.floor(Math.random() * 100), followers: 0, following: 0 });
  const [activeGroup, setActiveGroup] = useState(null); // { id: 'group_1', members: [] }
  const [groupLocations, setGroupLocations] = useState({}); // { user_id: { lat, lng } }

  // 1. Live Group Tracking Logic
  useEffect(() => {
    if (!activeGroup) return;

    // A. Subscribe to group locations
    const unsub = onSnapshot(collection(db, `groups/${activeGroup.id}/locations`), (snapshot) => {
      const locs = {};
      snapshot.forEach(doc => {
        if (doc.id !== userId) locs[doc.id] = doc.data();
      });
      setGroupLocations(locs);
    });

    // B. Push MY location periodically
    const interval = setInterval(async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude, speed } = loc.coords;
        // Write to Firestore
        await setDoc(doc(db, `groups/${activeGroup.id}/locations`, userId), {
          latitude, longitude, speed, timestamp: Date.now(), user: userProfile.name
        });
      }
    }, 5000); // Every 5 sec to save free tier writes

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [activeGroup]);

  // 2. Join/Create Group Logic
  const joinGroup = (groupId) => setActiveGroup({ id: groupId });
  const leaveGroup = () => { setActiveGroup(null); setGroupLocations({}); };

  return (
    <AppContext.Provider value={{ userId, userProfile, activeGroup, groupLocations, joinGroup, leaveGroup }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
