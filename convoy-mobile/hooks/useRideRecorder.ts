import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Alert, Platform } from 'react-native';

export function useRideRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPath, setCurrentPath] = useState([]); // Array of {latitude, longitude}
  const [stats, setStats] = useState({ distance: 0, duration: 0, speed: 0 });
  const [permissionStatus, setPermissionStatus] = useState(null);
  
  const locationSubscription = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
    })();
    return () => stopRecording();
  }, []);

  // Helper to calculate distance between two coords (Haversine formula)
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };

  const deg2rad = (deg) => deg * (Math.PI/180);

  const startRecording = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission Denied', 'Enable location services to record rides.');
      return;
    }

    setIsRecording(true);
    setCurrentPath([]);
    setStats({ distance: 0, duration: 0, speed: 0 });
    startTime.current = Date.now();

    // Start tracking (high accuracy)
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5,
      },
      (newLocation) => {
        const { latitude, longitude, speed } = newLocation.coords;
        
        setCurrentPath((prev) => {
          const newPoint = { latitude, longitude };
          
          // Calculate distance added
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const dist = getDistance(lastPoint.latitude, lastPoint.longitude, latitude, longitude);
            setStats(s => ({ ...s, distance: s.distance + dist, speed: speed || 0 }));
          }
          return [...prev, newPoint];
        });
      }
    );
  };

  const stopRecording = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsRecording(false);
  };

  const saveRide = async (rideName = 'My Motorbike Ride') => {
    if (currentPath.length < 2) {
      Alert.alert('Too Short', 'Ride is too short to save.');
      return;
    }

    try {
      await addDoc(collection(db, 'rides'), {
        name: rideName,
        path: currentPath,
        stats: { ...stats, duration: (Date.now() - startTime.current) / 1000 },
        timestamp: serverTimestamp(),
        type: 'motorcycle'
      });
      Alert.alert('Success', 'Ride saved to your feed!');
      setCurrentPath([]);
    } catch (error) {
      console.error('Error saving ride:', error);
      Alert.alert('Error', 'Could not save ride.');
    }
  };

  return {
    isRecording,
    currentPath,
    stats,
    startRecording,
    stopRecording,
    saveRide
  };
}
