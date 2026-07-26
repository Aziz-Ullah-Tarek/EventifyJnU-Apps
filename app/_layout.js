import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View, Platform, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFonts, Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/firebase';

const ADMIN_EMAIL = 'azizullaht2002@gmail.com';

export const unstable_settings = {
  anchor: '(tabs)',
};

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync();
}

// Simple cache to avoid repeated API calls
let adminRoleCache = null;

async function checkIsAdmin(userEmail) {
  if (!userEmail) return false;
  if (userEmail.toLowerCase() === ADMIN_EMAIL) return true;
  try {
    const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
    const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(userEmail)}`);
    if (res.ok) {
      const data = await res.json();
      return data.role === 'admin' || data.role === 'organizer';
    }
  } catch (e) {}
  return false;
}

/**
 * Auth Guard Component to handle protected routes
 */
function useProtectedRoute(user, loaded) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loaded) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';
    const isAdminRoute = segments[0] === 'admin';
    const isOrganizerRoute = segments[0] === 'organizer';

    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      checkIsAdmin(user.email).then(isAdminOrOrganizer => {
        if (isAdminOrOrganizer) {
          // Check specific role to redirect correctly
          const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
          fetch(`${API_BASE_URL}/users/${encodeURIComponent(user.email)}`)
            .then(r => r.json())
            .then(data => {
              if (data.role === 'admin') router.replace('/admin/dashboard');
              else if (data.role === 'organizer') router.replace('/organizer/dashboard');
              else router.replace('/(tabs)');
            })
            .catch(() => router.replace('/(tabs)'));
        } else {
          router.replace('/(tabs)');
        }
      });
    } else if (user && (isAdminRoute || isOrganizerRoute)) {
      checkIsAdmin(user.email).then(isAdmin => {
        if (!isAdmin) {
          router.replace('/(tabs)');
        }
      });
    }
  }, [user, segments, loaded]);
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
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const [loaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_700Bold,
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loaded && Platform.OS !== 'web') {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useProtectedRoute(user, loaded);

  if (!loaded || initializing) return null;

  return (
    <WebContainer>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="about" options={{ headerShown: false }} />
          <Stack.Screen name="volunteer" options={{ headerShown: false }} />
          <Stack.Screen name="volunteer-apply" options={{ headerShown: false }} />
          <Stack.Screen name="room-booking" options={{ headerShown: false }} />
          <Stack.Screen name="event-booking" options={{ headerShown: false }} />
          <Stack.Screen name="cse-calendar" options={{ headerShown: false }} />
          <Stack.Screen name="cse-calendar/add-event" options={{ headerShown: false }} />
          <Stack.Screen name="cse-calendar/edit-event" options={{ headerShown: false }} />
          <Stack.Screen name="services" options={{ headerShown: false }} />
          <Stack.Screen name="memories" options={{ headerShown: false }} />
          <Stack.Screen name="create-memory" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="bookings/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="menu" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="organizer/dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="organizer/create-event" options={{ headerShown: false }} />
          <Stack.Screen name="organizer/edit-event" options={{ headerShown: false }} />
          <Stack.Screen name="admin/dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="admin/create-event" options={{ headerShown: false }} />
          <Stack.Screen name="admin/edit-event" options={{ headerShown: false }} />

        </Stack>
        <Toast />
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
