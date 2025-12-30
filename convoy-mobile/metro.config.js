const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // 1. Web-Only Overrides
  if (platform === 'web') {
    // Redirect direct 'react-native-maps' imports to our Web Implementation
    if (moduleName === 'react-native-maps') {
       return {
        filePath: path.resolve(__dirname, 'components/ConvoyMapImplementation.web.js'),
        type: 'sourceFile',
      };
    }
    
    // Block internal React Native paths
    if (moduleName.startsWith('react-native/') && moduleName !== 'react-native-web') {
      return {
        filePath: path.resolve(__dirname, 'web-empty-stub.js'),
        type: 'sourceFile',
      };
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
