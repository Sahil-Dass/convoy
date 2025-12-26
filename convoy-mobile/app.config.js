export default {
  expo: {
    name: "convoy-mobile",
    slug: "convoy-mobile",
    scheme: "convoy",  // <--- Added Scheme
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.anonymous.convoymobile"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "@react-native-community/datetimepicker",
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Convoy to use your location."
        }
      ]
    ]
  }
};
