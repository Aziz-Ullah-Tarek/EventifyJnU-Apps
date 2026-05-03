import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../constants/firebase';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 768;

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const studentIdRegex = /^[Bb]?\d{2,8}$/;
  return emailRegex.test(email) || studentIdRegex.test(email);
};

const getPasswordStrength = (password) => {
  if (!password) return { level: 0, text: '', color: '#e5e7eb' };
  if (password.length < 8) return { level: 1, text: 'Weak', color: '#ef4444' };
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { level: 2, text: 'Fair', color: '#f59e0b' };
  }
  return { level: 3, text: 'Strong', color: '#10b981' };
};

export default function RegisterScreen() {
  const router = useRouter();
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!emailId || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing fields',
        text2: 'Please enter both email and password.',
      });
      return;
    }

    try {
      setLoading(true);
      let processingEmail = emailId.trim();

      if (!processingEmail.includes('@')) {
        processingEmail = `${processingEmail}@jnu.ac.bd`;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, processingEmail, password);
      const user = userCredential.user;

      // Sync user with Backend MongoDB
      try {
        const syncResponse = await fetch('https://eventify-jnu-backend.vercel.app/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.email.split('@')[0], // Default name from email
            photoURL: '',
            studentID: processingEmail.includes('@') ? '' : emailId,
          }),
        });
        if (!syncResponse.ok) {
          // Fallback to local
          await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.email.split('@')[0], photoURL: '' }),
          });
        }
      } catch (syncError) {
        try {
          await fetch('http://localhost:5000/api/users/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, name: user.email.split('@')[0], photoURL: '' }),
          });
        } catch(e) {}
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully!',
      });
      router.replace('/(tabs)');
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      }

      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Sync user with Backend MongoDB
      try {
        const syncResponse = await fetch('http://localhost:5000/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
          }),
        });
        if (!syncResponse.ok) console.error('Sync failed:', await syncResponse.text());
      } catch (syncError) {
        console.error('Failed to sync user with DB:', syncError);
      }

      Toast.show({ type: 'success', text1: 'Success', text2: `Welcome ${user.displayName}!` });
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Google Sign-In failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EEF3FF' }}>
      <StatusBar style="dark" backgroundColor="#EEF3FF" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: isSmallScreen ? 16 : 24,
            paddingTop: 18,
            paddingBottom: 32,
          }}
        >
          <View style={{ backgroundColor: '#0E3B6E' }} className="rounded-3xl px-6 pt-7 pb-8 mb-6">
            <View className="flex-row items-center justify-between">
              <View className="flex-1 pr-3">
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-2xl mb-1">
                  Create Account
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-blue-100 text-sm leading-5">
                  Join Eventify and register for campus programs in seconds.
                </Text>
              </View>
              <View style={{ backgroundColor: '#1A4D85' }} className="h-14 w-14 rounded-2xl items-center justify-center">
                <Ionicons name="person-add" size={28} color="#FFFFFF" />
              </View>
            </View>
          </View>

          <View className="w-full self-center" style={{ maxWidth: 460 }}>
            <View className="bg-white rounded-3xl p-5 border border-blue-100" style={{ elevation: 2 }}>
              <View className="mb-5">
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#0E3B6E] text-xl">
                  Register
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-slate-500 text-sm mt-1">
                  Use your email to join EventifyJnU.
                </Text>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-700 text-sm">
                    Email / Student ID
                  </Text>
                </View>
                <View className="flex-row items-center rounded-2xl px-4 py-3 border border-slate-200 bg-slate-50">
                  <Ionicons name="mail-outline" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Enter your email or ID"
                    placeholderTextColor="#94a3b8"
                    value={emailId}
                    onChangeText={setEmailId}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 text-base text-slate-800 ml-3 h-10"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  />
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-700 text-sm">
                    Password
                  </Text>
                </View>
                <View className="flex-row items-center rounded-2xl px-4 py-3 border border-slate-200 bg-slate-50">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                  <TextInput
                    placeholder="Minimum 8 characters"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 text-base text-slate-800 ml-3 h-10"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: loading ? '#7BA0C5' : '#0E3B6E' }}
                className="py-4 rounded-2xl items-center justify-center mb-4"
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-base">
                    Quick Register
                  </Text>
                )}
              </TouchableOpacity>

              {/* Social Divider */}
              <View className="flex-row items-center my-3">
                <View className="flex-1 h-[1px] bg-gray-100" />
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="mx-4 text-gray-400 text-xs">
                  Or
                </Text>
                <View className="flex-1 h-[1px] bg-gray-100" />
              </View>

              {/* Google Register Button */}
              <TouchableOpacity 
                className="bg-white border border-gray-200 flex-row items-center justify-center py-3.5 rounded-2xl mb-4 active:bg-gray-50"
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={22} color="#DB4437" style={{ marginRight: 10 }} />
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-700 text-sm">
                  Register with Google
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-2">
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-slate-600 text-sm">
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#0E3B6E] text-sm">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
