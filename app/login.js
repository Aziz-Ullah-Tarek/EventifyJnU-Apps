import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../constants/firebase';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const router = useRouter();
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailId || !password) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill in both email and password.' });
      return;
    }

    try {
      setLoading(true);
      let processingEmail = emailId.trim();
      const trimmedPassword = password.trim();
      
      if (!processingEmail.includes('@')) {
        processingEmail = `${processingEmail}@jnu.ac.bd`;
      }

      const userCredential = await signInWithEmailAndPassword(auth, processingEmail, trimmedPassword);
      const user = userCredential.user;

      // Sync user with Backend MongoDB
      try {
        const syncResponse = await fetch('https://eventify-jnu-backend.vercel.app/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || '',
          }),
        });
        if (!syncResponse.ok) {
          // If Vercel fails, try local as fallback
          await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.displayName, photoURL: user.photoURL }),
          });
        }
      } catch (syncError) {
        // Final fallback to localhost
        try {
          await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.displayName, photoURL: user.photoURL }),
          });
        } catch(e) {}
      }
      
      Toast.show({ type: 'success', text1: 'Success', text2: 'Logged in successfully!' });
      
      // Check user role from backend to determine routing
      const API_BASE = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
      let isAdmin = false;
      try {
        const userRes = await fetch(`${API_BASE}/users/${encodeURIComponent(user.email)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          isAdmin = userData.role === 'admin';
        }
      } catch (e) {}
      
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Login failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      let user;

      // Try web popup first, fallback to redirect for mobile
      try {
        const result = await signInWithPopup(auth, googleProvider);
        user = result.user;
      } catch (popupError) {
        // If popup blocked or on mobile, try alternate approach
        console.log('Popup login failed, using fallback:', popupError.message);
        throw popupError;
      }

      const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

      // Sync user with Backend MongoDB - use a proper photoURL from Google
      const googlePhotoURL = user.photoURL || 
        (user.providerData && user.providerData[0]?.photoURL) || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'U')}&background=0E3B6E&color=fff&size=200`;

      const syncPayload = {
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: googlePhotoURL,
      };

      // Sync with local backend first
      try {
        const syncResponse = await fetch(`${API_BASE_URL}/users/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncPayload),
        });
        if (!syncResponse.ok) throw new Error('Local sync failed');
      } catch (localError) {
        // Fallback to Vercel
        try {
          await fetch('https://eventify-jnu-backend.vercel.app/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncPayload),
          });
        } catch (vercelError) {
          console.error('Failed to sync user with DB:', vercelError);
        }
      }
      
      Toast.show({ type: 'success', text1: 'Success', text2: `Welcome ${user.displayName || user.email}!` });
      
      // Check user role from backend to determine routing
      let isAdmin = false;
      try {
        const userRes = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(user.email)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          isAdmin = userData.role === 'admin';
        }
      } catch (e) {}
      
      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Google Login failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} className="bg-white">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md self-center">
            
            <View className="mb-10 items-center mt-8">
              <View className="bg-orange-500 rounded-full p-5 mb-6 shadow-md shadow-orange-200">
                <Ionicons name="log-in-outline" size={48} color="#FFFFFF" />
              </View>
              <View className="flex-row items-center mb-2">
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#0E3B6E] text-4xl">Welcome </Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-orange-500 text-4xl">Back!</Text>
              </View>
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-base text-center px-4 leading-6">
                Login to your EventifyJNU account to discover and manage campus events.
              </Text>
            </View>

            <View className="mb-5">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1 font-medium">
                Email Address / Student ID
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl bg-gray-50 px-4 py-3.5 focus:border-[#0E3B6E] focus:bg-white shadow-sm transition">
                <Ionicons name="mail-outline" size={22} color="#64748b" className="mr-3" />
                <TextInput 
                  placeholder="Enter your email or ID"
                  placeholderTextColor="#94a3b8"
                  value={emailId}
                  onChangeText={setEmailId}
                  className="flex-1 text-base text-gray-800 h-10"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1 font-medium">
                Password
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl bg-gray-50 px-4 py-3.5 focus:border-[#0E3B6E] focus:bg-white shadow-sm transition">
                <Ionicons name="lock-closed-outline" size={22} color="#64748b" className="mr-3" />
                <TextInput 
                  placeholder="Enter your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 text-base text-gray-800 h-10"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-end mb-8 mt-1">
              <TouchableOpacity>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-[#0E3B6E] text-sm font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              className="bg-[#0E3B6E] py-4 rounded-2xl mb-6 shadow-lg shadow-blue-900/30 items-center active:bg-blue-900"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                 <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-lg tracking-wide">
                  Login to EventifyJNU
                </Text>
              )}
            </TouchableOpacity>

            {/* Social Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="mx-4 text-gray-400 text-sm">
                Or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity 
              className="bg-white border border-gray-200 flex-row items-center justify-center py-3.5 rounded-2xl mb-8 shadow-sm active:bg-gray-50"
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" style={{ marginRight: 12 }} />
              <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-700 text-base">
                Sign in with Google
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center pb-8">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-base">
                Don&apos;t have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-orange-500 text-base">
                  Register Here
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
