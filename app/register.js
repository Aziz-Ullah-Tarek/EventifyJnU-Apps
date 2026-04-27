import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !emailId || !password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill in all fields.' });
      return;
    }
    
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password mismatch', text2: 'Passwords do not match.' });
      return;
    }

    try {
      setLoading(true);
      // Determine if it is email or custom ID, here we assume it's email format. 
      // If it's B19XXXXX format, Firebase needs an email format to register (like B19XXXXX@jnu.ac.bd).
      let processingEmail = emailId;
      if (!emailId.includes('@')) {
        processingEmail = `${emailId}@jnu.ac.bd`;
      }
      
      const userCredential = await auth().createUserWithEmailAndPassword(processingEmail, password);
      // You can update the user profile with the Full Name here
      await userCredential.user.updateProfile({
        displayName: fullName,
      });

      Toast.show({ type: 'success', text1: 'Success', text2: 'Account created successfully!' });
      router.push('/(tabs)');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Registration failed', text2: error.message });
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
            
            <View className="mb-8 items-center mt-6">
              <View className="bg-orange-500 rounded-full p-5 mb-6 shadow-md shadow-orange-200">
                <Ionicons name="person-add" size={42} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
              <View className="flex-row items-center mb-2">
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#0E3B6E] text-4xl">Join </Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-orange-500 text-4xl">Eventify</Text>
              </View>
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-base mt-2 text-center leading-6">
                Create an account to host and attend exciting campus events.
              </Text>
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1 font-medium">
                Full Name
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl bg-gray-50 px-4 py-3.5 focus:border-[#0E3B6E] focus:bg-white shadow-sm transition">
                <Ionicons name="person-outline" size={22} color="#64748b" className="mr-3" />
                <TextInput 
                  placeholder="Enter your full name"
                  placeholderTextColor="#94a3b8"
                  value={fullName}
                  onChangeText={setFullName}
                  className="flex-1 text-base text-gray-800 h-10"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1 font-medium">
                Student ID / Email
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl bg-gray-50 px-4 py-3.5 focus:border-[#0E3B6E] focus:bg-white shadow-sm transition">
                <Ionicons name="mail-outline" size={22} color="#64748b" className="mr-3" />
                <TextInput 
                  placeholder="B19XXXXX or @jnu.ac.bd"
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
                  placeholder="Create a password"
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

            <View className="mb-8">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1 font-medium">
                Confirm Password
              </Text>
              <View className="flex-row items-center border border-gray-200 rounded-2xl bg-gray-50 px-4 py-3.5 focus:border-[#0E3B6E] focus:bg-white shadow-sm transition">
                <Ionicons name="lock-closed-outline" size={22} color="#64748b" className="mr-3" />
                <TextInput 
                  placeholder="Confirm your password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="flex-1 text-base text-gray-800 h-10"
                  style={{ fontFamily: 'Poppins_400Regular' }}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                  <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={22} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              className="bg-[#0E3B6E] py-4 rounded-2xl mb-6 shadow-lg shadow-blue-900/30 items-center justify-center active:bg-blue-900"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-lg tracking-wide">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Social Divider */}
            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-gray-200" />
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="mx-4 text-gray-400 text-sm">
                Or register with
              </Text>
              <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            {/* Google Register Button */}
            <TouchableOpacity 
              className="bg-white border border-gray-200 flex-row items-center justify-center py-3.5 rounded-2xl mb-8 shadow-sm active:bg-gray-50"
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" style={{ marginRight: 12 }} />
              <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-700 text-base">
                Register with Google
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center pb-8">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-base">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-orange-500 text-base underline">
                  Log In Here
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
