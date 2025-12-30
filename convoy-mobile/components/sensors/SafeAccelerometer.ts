import { Platform } from 'react-native';
import { Accelerometer as NativeAccelerometer } from 'expo-sensors';

// Web Stub for Accelerometer
const WebAccelerometer = {
  addListener: () => ({ remove: () => {} }),
  removeAllListeners: () => {},
  setUpdateInterval: () => {},
  isAvailableAsync: async () => false, // Report unavailable on web to be safe
  getPermissionsAsync: async () => ({ status: 'denied' }),
  requestPermissionsAsync: async () => ({ status: 'denied' }),
};

// Export the real one on Native, fake one on Web
export const Accelerometer = Platform.OS === 'web' 
  ? WebAccelerometer 
  : NativeAccelerometer;

