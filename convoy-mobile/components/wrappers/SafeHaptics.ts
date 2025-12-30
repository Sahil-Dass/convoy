import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Web Stub for Haptics (Does nothing)
const WebHaptics = {
  notificationAsync: async () => {},
  selectionAsync: async () => {},
  impactAsync: async () => {},
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  }
};

export default Platform.OS === 'web' ? WebHaptics : Haptics;
