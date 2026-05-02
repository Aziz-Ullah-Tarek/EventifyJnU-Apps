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
import auth from '@react-native-firebase/auth';
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
  const [fullName, setFullName] = useState('');
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const passwordStrength = getPasswordStrength(password);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters';
    }

    if (!emailId.trim()) {
      newErrors.emailId = 'Student ID or Email is required';
    } else if (!validateEmail(emailId.trim())) {
      newErrors.emailId = 'Use valid email or Student ID format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Include uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please fix the highlighted fields.',
      });
      return;
    }

    try {
      setLoading(true);
      let processingEmail = emailId.trim();

      if (!processingEmail.includes('@')) {
        processingEmail = `${processingEmail}@jnu.ac.bd`;
      }

      const userCredential = await auth().createUserWithEmailAndPassword(processingEmail, password);
      await userCredential.user.updateProfile({
        displayName: fullName.trim(),
      });

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully!',
      });
      router.push('/(tabs)');
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
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
                  Use your Student ID or email to continue.
                </Text>
              </View>

              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-700 text-sm">
                    Full Name
                  </Text>
                  {!!fullName && <Ionicons name="checkmark-circle" size={18} color="#10b981" />}
                </View>
                <View
                  className={`flex-row items-center rounded-2xl px-4 py-3 border ${
                    errors.fullName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Ionicons name="person-outline" size={20} color={errors.fullName ? '#ef4444' : '#64748b'} />
                  <TextInput
                    placeholder="Enter your full name"
                    placeholderTextColor="#94a3b8"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName) setErrors({ ...errors, fullName: '' });
                    }}
                    className="flex-1 text-base text-slate-800 ml-3"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  />
                </View>
                {!!errors.fullName && (
                  <Text className="text-red-500 text-xs mt-1 ml-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {errors.fullName}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-700 text-sm">
                    Student ID / Email
                  </Text>
                  {!!emailId && validateEmail(emailId) && <Ionicons name="checkmark-circle" size={18} color="#10b981" />}
                </View>
                <View
                  className={`flex-row items-center rounded-2xl px-4 py-3 border ${
                    errors.emailId ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Ionicons name="mail-outline" size={20} color={errors.emailId ? '#ef4444' : '#64748b'} />
                  <TextInput
                    placeholder="B19XXXXX or your email"
                    placeholderTextColor="#94a3b8"
                    value={emailId}
                    onChangeText={(text) => {
                      setEmailId(text);
                      if (errors.emailId) setErrors({ ...errors, emailId: '' });
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 text-base text-slate-800 ml-3"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  />
                </View>
                {!!errors.emailId && (
                  <Text className="text-red-500 text-xs mt-1 ml-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {errors.emailId}
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-700 text-sm">
                    Password
                  </Text>
                  {!!password && (
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', color: passwordStrength.color }} className="text-xs">
                      {passwordStrength.text}
                    </Text>
                  )}
                </View>
                <View
                  className={`flex-row items-center rounded-2xl px-4 py-3 border ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={errors.password ? '#ef4444' : '#64748b'} />
                  <TextInput
                    placeholder="Create a strong password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className="flex-1 text-base text-slate-800 ml-3"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                {!!password && (
                  <View className="mt-2 flex-row">
                    {[...Array(3)].map((_, i) => (
                      <View
                        key={i}
                        className="h-1.5 flex-1 rounded-full mr-1"
                        style={{ backgroundColor: i < passwordStrength.level ? passwordStrength.color : '#e2e8f0' }}
                      />
                    ))}
                  </View>
                )}
                {!!errors.password && (
                  <Text className="text-red-500 text-xs mt-1 ml-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {errors.password}
                  </Text>
                )}
              </View>

              <View className="mb-6">
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-slate-700 text-sm">
                    Confirm Password
                  </Text>
                  {!!confirmPassword && password === confirmPassword && (
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  )}
                </View>
                <View
                  className={`flex-row items-center rounded-2xl px-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Ionicons name="lock-closed-outline" size={20} color={errors.confirmPassword ? '#ef4444' : '#64748b'} />
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                    }}
                    className="flex-1 text-base text-slate-800 ml-3"
                    style={{ fontFamily: 'Poppins_400Regular' }}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-1">
                    <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                {!!errors.confirmPassword && (
                  <Text className="text-red-500 text-xs mt-1 ml-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                    {errors.confirmPassword}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={{ backgroundColor: loading ? '#7BA0C5' : '#0E3B6E' }}
                className="py-4 rounded-2xl items-center justify-center"
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-base">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center items-center mt-5">
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
