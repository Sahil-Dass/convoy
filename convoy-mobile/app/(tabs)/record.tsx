import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRideRecorder } from '../../hooks/useRideRecorder';
import ConvoyMap from '../../components/ConvoyMap'; // Uses your split .web.js / .native.js automatically

export default function RecordScreen() {
  const { isRecording, currentPath, stats, startRecording, stopRecording, saveRide } = useRideRecorder();
  const [elapsed, setElapsed] = useState(0);

  // Simple Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {/* Map Background - We pass the recorded path to draw it live */}
      <View style={styles.mapContainer}>
         <ConvoyMap routePath={currentPath} isRecording={isRecording} />
      </View>

      {/* Stats Overlay */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
           <Text style={styles.statLabel}>SPEED</Text>
           <Text style={styles.statValue}>{(stats.speed * 3.6).toFixed(1)} <Text style={styles.unit}>km/h</Text></Text>
        </View>
        <View style={styles.statBox}>
           <Text style={styles.statLabel}>DISTANCE</Text>
           <Text style={styles.statValue}>{stats.distance.toFixed(2)} <Text style={styles.unit}>km</Text></Text>
        </View>
        <View style={styles.statBox}>
           <Text style={styles.statLabel}>TIME</Text>
           <Text style={styles.statValue}>{formatTime(elapsed)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
          <TouchableOpacity style={[styles.btn, styles.btnStart]} onPress={startRecording}>
            <Text style={styles.btnText}>GO</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', gap: 20 }}>
             <TouchableOpacity style={[styles.btn, styles.btnStop]} onPress={() => { stopRecording(); saveRide(); }}>
              <Text style={styles.btnText}>FINISH</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  mapContainer: { flex: 1 },
  statsContainer: {
    position: 'absolute', top: 50, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 12
  },
  statBox: { alignItems: 'center' },
  statLabel: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  unit: { fontSize: 12, color: '#aaa' },
  controls: { zIndex: 9999, pointerEvents: "box-none",
    position: 'absolute', bottom: 40, alignSelf: 'center',
    width: '100%', alignItems: 'center'
  },
  btn: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  btnStart: { backgroundColor: '#fc5200', borderWidth: 4, borderColor: 'white' }, // Strava Orange
  btnStop: { backgroundColor: 'black', borderWidth: 4, borderColor: 'white', width: 80, height: 80 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
