import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Platform, StyleSheet } from 'react-native';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

const WebContainer = ({ children }) => {
  if (Platform.OS !== 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={styles.webBackground}>
      <View style={styles.mobileContainer}>
        {children}
      </View>
    </View>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (loaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <WebContainer>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="events" options={{ headerShown: false }} />
          <Stack.Screen name="volunteer" options={{ headerShown: false }} />
          <Stack.Screen name="room-booking" options={{ headerShown: false }} />
          <Stack.Screen name="menu" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </WebContainer>
  );
}

const styles = StyleSheet.create({
  webBackground: {
    flex: 1,
    backgroundColor: '#d1d5db', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  mobileContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 400,
    maxHeight: 850,
    backgroundColor: '#fff',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
});
