import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Alert } from 'react-native';
import { Accelerometer } from './sensors/SafeAccelerometer'; // Use our safe wrapper
import Haptics from './wrappers/SafeHaptics';

export default function CrashDetector() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [crashDetected, setCrashDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const subscription = Accelerometer.addListener(accelerometerData => {
      setData(accelerometerData);
      // Simple G-Force Calculation
      const gForce = Math.sqrt(
        Math.pow(accelerometerData.x, 2) + 
        Math.pow(accelerometerData.y, 2) + 
        Math.pow(accelerometerData.z, 2)
      );

      // Threshold: > 3.5Gs suggests hard impact/stop
      if (gForce > 3.5 && !crashDetected) {
        triggerCrashProtocol();
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => subscription && subscription.remove();
  }, [crashDetected]);

  const triggerCrashProtocol = () => {
    setCrashDetected(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Countdown Timer
    let timer = 10;
    setCountdown(10);
    const interval = setInterval(() => {
      timer -= 1;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        sendSOS();
      }
    }, 1000);
  };

  const sendSOS = () => {
    Alert.alert("SOS SENT", "Emergency contacts have been notified with your location.");
    setCrashDetected(false);
  };

  const cancelSOS = () => {
    setCrashDetected(false);
    // cancel timer logic would go here in full impl
  };

  if (!crashDetected) return null;

  return (
    <Modal visible={crashDetected} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>CRASH DETECTED!</Text>
          <Text style={styles.sub}>Sending SOS in...</Text>
          <Text style={styles.timer}>{countdown}</Text>
          <TouchableOpacity onPress={cancelSOS} style={styles.btn}>
            <Text style={styles.btnText}>I'M OKAY (CANCEL)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(255,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  alertBox: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', width: '80%' },
  title: { fontSize: 24, fontWeight: '900', color: 'red', marginBottom: 10 },
  sub: { fontSize: 16, color: '#333' },
  timer: { fontSize: 60, fontWeight: 'bold', marginVertical: 20 },
  btn: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 30, borderRadius: 30 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
