import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} className="bg-white">
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          
          <View className="mb-10 items-center mt-4">
            <View className="bg-[#E86F21] rounded-full p-4 mb-4">
              <Ionicons name="person-add" size={48} color="#FFFFFF" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 32 }}>Create </Text>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#E86F21', fontSize: 32 }}>Account</Text>
            </View>
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-sm mt-2 text-center">
              Join EventifyJNU to host and attend exciting campus events.
            </Text>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1">
              Full Name
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-4 py-3">
              <Ionicons name="person-outline" size={20} color="#0E3B6E" className="mr-3" />
              <TextInput 
                placeholder="Enter your full name"
                placeholderTextColor="#A0AEC0"
                className="flex-1 text-base text-gray-800 h-10"
                style={{ fontFamily: 'Poppins_400Regular' }}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1">
              Student ID / Email
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-4 py-3">
              <Ionicons name="mail-outline" size={20} color="#0E3B6E" className="mr-3" />
              <TextInput 
                placeholder="B19XXXXX or @jnu.ac.bd"
                placeholderTextColor="#A0AEC0"
                className="flex-1 text-base text-gray-800 h-10"
                style={{ fontFamily: 'Poppins_400Regular' }}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1">
              Password
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-4 py-3">
              <Ionicons name="lock-closed-outline" size={20} color="#0E3B6E" className="mr-3" />
              <TextInput 
                placeholder="Create a password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showPassword}
                className="flex-1 text-base text-gray-800 h-10"
                style={{ fontFamily: 'Poppins_400Regular' }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#0E3B6E" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-8">
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm mb-2 ml-1">
              Confirm Password
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl bg-gray-50 px-4 py-3">
              <Ionicons name="lock-closed-outline" size={20} color="#0E3B6E" className="mr-3" />
              <TextInput 
                placeholder="Confirm your password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!showConfirmPassword}
                className="flex-1 text-base text-gray-800 h-10"
                style={{ fontFamily: 'Poppins_400Regular' }}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#0E3B6E" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={{ backgroundColor: '#0E3B6E' }} 
            className="py-4 rounded-xl mb-4 shadow-md items-center"
            onPress={() => router.push('/login')}
          >
            <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-lg tracking-wide">
              Create Account
            </Text>
          </TouchableOpacity>

          {/* Social Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
            <Text style={{ fontFamily: 'Poppins_400Regular', marginHorizontal: 12, color: '#A0AEC0', fontSize: 13 }}>Or register with</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#E2E8F0' }} />
          </View>

          {/* Google Register Button */}
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderWidth: 1, 
              borderColor: '#E2E8F0',
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
            }} 
            className="py-3 rounded-xl mb-6 shadow-sm"
          >
            <Ionicons name="logo-google" size={22} color="#DB4437" style={{ marginRight: 10 }} />
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#4A5568', fontSize: 16 }}>
              Register with Google
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-2">
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-sm">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-[#E86F21] text-sm underline">
                Log In
              </Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
