import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const CATEGORY_COLORS = {
  Sports: '#EF4444', Cultural: '#F59E0B', Academic: '#3B82F6',
  Tech: '#8B5CF6', Social: '#10B981', Club: '#EC4899',
  Departmental: '#0E3B6E', Holiday: '#F97316', Other: '#6B7280',
};

export default function EditCalendarEvent() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Other');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cse-calendar/${id}`);
      if (res.ok) {
        const ev = await res.json();
        setTitle(ev.title);
        setDescription(ev.description || '');
        const d = new Date(ev.date);
        setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
        setTime(ev.time || '');
        setLocation(ev.location || '');
        setCategory(ev.category || 'Other');
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Event not found' });
        router.back();
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load event' });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim() || !date.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Title and date are required' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/cse-calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          date: date.trim(),
          time: time.trim(),
          location: location.trim(),
          category,
          color: CATEGORY_COLORS[category] || '#0E3B6E',
        }),
      });
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Event updated!' });
        router.back();
      } else {
        const data = await res.json();
        Toast.show({ type: 'error', text1: 'Error', text2: data.message || 'Failed to update' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Connection failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/cse-calendar/${id}`, { method: 'DELETE' });
            if (res.ok) {
              Toast.show({ type: 'success', text1: 'Deleted', text2: 'Event removed' });
              router.back();
            } else {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Could not delete' });
            }
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Connection failed' });
          }
        }
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E3B6E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      <LinearGradient colors={['#0E3B6E', '#1A4F8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFFFFF', flex: 1 }}>Edit Event</Text>
        <TouchableOpacity onPress={handleDelete} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 4 }}>Event Title *</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Event title"
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
          <TextInput value={location} onChangeText={setLocation} placeholder="e.g. CSE Building"
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

          {/* Update */}
          <TouchableOpacity onPress={handleUpdate} disabled={submitting}
            style={{ backgroundColor: '#0E3B6E', borderRadius: 16, padding: 16, alignItems: 'center', opacity: submitting ? 0.6 : 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#FFFFFF' }}>
              {submitting ? 'Updating...' : 'Update Event'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
