import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, KeyboardAvoidingView, Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const CATEGORY_COLORS = {
  Sports: '#EF4444', Cultural: '#F59E0B', Academic: '#3B82F6',
  Tech: '#8B5CF6', Social: '#10B981', Club: '#EC4899',
  Departmental: '#0E3B6E', Holiday: '#F97316', Other: '#6B7280',
};

export default function AddCalendarEvent() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Other');
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(u.email)}`);
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role || 'student');
          }
        } catch (e) {}
      }
    });
    return unsub;
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Event title is required' });
      return;
    }
    if (!date.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Date is required' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cse-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date: date.trim(),
          time: time.trim(),
          location: location.trim(),
          category,
          color: CATEGORY_COLORS[category] || '#0E3B6E',
          createdBy: user?.displayName || user?.email || 'Unknown',
          createdByEmail: user?.email || '',
          createdByRole: userRole,
        }),
      });
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Event added to calendar!' });
        router.back();
      } else {
        const data = await res.json();
        Toast.show({ type: 'error', text1: 'Error', text2: data.message || 'Failed to add' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Connection failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      <LinearGradient colors={['#0E3B6E', '#1A4F8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFFFFF', flex: 1 }}>Add Calendar Event</Text>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 }}>Event Title *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Sports Carnival 2026"
            style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 14, fontFamily: 'Poppins_400Regular', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 }} />

          {/* Description */}
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 }}>Description</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Event description..." multiline numberOfLines={3}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 14, fontFamily: 'Poppins_400Regular', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14, minHeight: 80, textAlignVertical: 'top' }} />

          {/* Date & Time */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 }}>Date *</Text>
              <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
                style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 14, fontFamily: 'Poppins_400Regular', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 }}>Time</Text>
              <TextInput value={time} onChangeText={setTime} placeholder="e.g. 10:00 AM"
                style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 14, fontFamily: 'Poppins_400Regular', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 }} />
            </View>
          </View>

          {/* Location */}
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 }}>Location</Text>
          <TextInput value={location} onChangeText={setLocation} placeholder="e.g. CSE Building, JU"
            style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, fontSize: 14, fontFamily: 'Poppins_400Regular', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 }} />

          {/* Category */}
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8 }}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, backgroundColor: category === cat ? CATEGORY_COLORS[cat] : '#F1F5F9' }}>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: category === cat ? '#FFFFFF' : CATEGORY_COLORS[cat] }}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}
            style={{ backgroundColor: '#0E3B6E', borderRadius: 16, padding: 16, alignItems: 'center', opacity: submitting ? 0.6 : 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#FFFFFF' }}>
              {submitting ? 'Adding...' : 'Add Event'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
