import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#F97316',
    background: '#000000',
    surface: '#1c1c1e',
    onSurface: '#ffffff',
    secondaryContainer: '#333',
  },
};

const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#F97316',
    background: '#f2f2f7',
    surface: '#ffffff',
    onSurface: '#000000',
    secondaryContainer: '#eee',
  },
};

const ThemeContext = createContext({
  isDark: true,
  toggleTheme: () => {},
  theme: CustomDarkTheme,
});

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('userTheme').then(val => {
      if (val) setIsDark(val === 'dark');
      else setIsDark(systemScheme === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem('userTheme', next ? 'dark' : 'light');
      return next;
    });
  };

  const theme = isDark ? CustomDarkTheme : CustomLightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
