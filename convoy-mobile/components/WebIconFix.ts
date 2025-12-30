import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Ionicons';
      src: url(https://unpkg.com/ionicons@5.5.2/dist/ionicons.ttf) format('truetype');
    }
  `;
  document.head.appendChild(style);
}
