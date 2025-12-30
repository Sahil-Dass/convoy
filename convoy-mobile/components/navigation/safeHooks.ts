import { Platform } from 'react-native';
import { useIsFocused as useIsFocusedNative, useNavigation as useNavigationNative } from '@react-navigation/native';

export function useIsFocused() {
  if (Platform.OS === 'web') {
    try {
      return useIsFocusedNative();
    } catch (e) {
      // On Web, if context is missing, assume focused to avoid crash
      return true;
    }
  }
  return useIsFocusedNative();
}

export function useNavigation() {
  if (Platform.OS === 'web') {
    try {
      return useNavigationNative();
    } catch (e) {
      console.warn('Navigation context missing on web. Returning dummy.');
      return { navigate: () => {}, goBack: () => {}, addListener: () => () => {} };
    }
  }
  return useNavigationNative();
}
