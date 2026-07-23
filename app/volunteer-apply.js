import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { auth } from '../constants/firebase';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function VolunteerApplyScreen() {
  const { eventId, role } = useLocalSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    applicantDept: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.applicantName || !formData.applicantEmail || !formData.applicantPhone || !formData.applicantDept) {
      Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Please fill in all required fields' });
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      const userEmail = user ? user.email : formData.applicantEmail;

      const response = await fetch(`${API_BASE_URL}/volunteer/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventId,
          role: role,
          userEmail: userEmail,
          applicantName: formData.applicantName,
          applicantEmail: formData.applicantEmail,
          applicantPhone: formData.applicantPhone,
          applicantDept: formData.applicantDept,
          experience: formData.experience
        })
      });

      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Success!', text2: 'Your application has been submitted.' });
        setTimeout(() => router.back(), 2000);
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit application');
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#0E3B6E" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#0E3B6E', marginLeft: 16 }}>Volunteer Application</Text>
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          <View style={{ backgroundColor: '#F0F9FF', padding: 16, borderRadius: 12, marginBottom: 24 }}>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#0E3B6E', fontSize: 14 }}>Applying for:</Text>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 20 }}>{role}</Text>
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 14, marginBottom: 8 }}>Full Name *</Text>
            <TextInput
              style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular' }}
              placeholder="Enter your full name"
              value={formData.applicantName}
              onChangeText={(text) => setFormData({...formData, applicantName: text})}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 14, marginBottom: 8 }}>Student Email / ID *</Text>
            <TextInput
              style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular' }}
              placeholder="e.g. B190305XXX or email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={formData.applicantEmail}
              onChangeText={(text) => setFormData({...formData, applicantEmail: text})}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 14, marginBottom: 8 }}>Phone Number *</Text>
            <TextInput
              style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular' }}
              placeholder="Enter contact number"
              keyboardType="phone-pad"
              value={formData.applicantPhone}
              onChangeText={(text) => setFormData({...formData, applicantPhone: text})}
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 14, marginBottom: 8 }}>Department *</Text>
            <TextInput
              style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular' }}
              placeholder="e.g. CSE, BBA, Physics"
              value={formData.applicantDept}
              onChangeText={(text) => setFormData({...formData, applicantDept: text})}
            />
          </View>

          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 14, marginBottom: 8 }}>Previous Experience (Optional)</Text>
            <TextInput
              style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', height: 100, textAlignVertical: 'top' }}
              placeholder="Tell us about your previous volunteering work..."
              multiline
              value={formData.experience}
              onChangeText={(text) => setFormData({...formData, experience: text})}
            />
          </View>

          <TouchableOpacity
            style={{ backgroundColor: '#0E3B6E', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 40 }}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>Submit Application</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}