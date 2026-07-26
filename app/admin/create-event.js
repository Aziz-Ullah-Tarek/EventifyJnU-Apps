import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, Alert, Platform, Switch, KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const CATEGORIES = ['Tech', 'Culture', 'Business', 'Sports', 'Music', 'Workshop', 'Other'];

export default function AdminCreateEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEdit = !!id;

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [category, setCategory] = useState('Tech');
  const [imageUrl, setImageUrl] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [featured, setFeatured] = useState(false);
  const [hiringVolunteers, setHiringVolunteers] = useState(false);
  const [volunteerRoles, setVolunteerRoles] = useState([]);
  const [newRole, setNewRole] = useState('');
  const [newSpots, setNewSpots] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(isEdit);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.replace('/login'); return; }
      setUser(u);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      fetch(`${API_BASE_URL}/events/${id}`).then(r => r.json()).then(event => {
        if (event) {
          setTitle(event.title || '');
          setDescription(event.description || '');
          const d = new Date(event.date);
          setDate(d.toISOString().split('T')[0]);
          setTime(d.toTimeString().slice(0, 5));
          setLocation(event.location || '');
          setOrganizer(event.organizer || '');
          setCategory(event.category || 'Tech');
          setImageUrl(event.imageUrl || '');
          setIsPaid(event.isPaid || false);
          setPrice(String(event.price || ''));
          setCapacity(String(event.capacity || ''));
          setFeatured(event.featured || false);
          setHiringVolunteers(event.hiringVolunteers || false);
          setVolunteerRoles(event.volunteerRoles || []);
        }
      }).catch(e => console.error(e)).finally(() => setLoadingEvent(false));
    }
  }, [id, isEdit]);

  const addVolunteerRole = () => {
    if (!newRole.trim() || !newSpots.trim()) { Alert.alert('Error', 'Role name & spots required'); return; }
    setVolunteerRoles(prev => [...prev, { role: newRole.trim(), spots: parseInt(newSpots) || 1, filledSpots: 0, description: newRoleDesc.trim() }]);
    setNewRole(''); setNewSpots(''); setNewRoleDesc('');
  };

  const removeVolunteerRole = (idx) => {
    setVolunteerRoles(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !date || !time || !location.trim() || !imageUrl.trim()) {
      Alert.alert('Error', 'Please fill all required fields (title, description, date, time, location, image URL)');
      return;
    }

    setSubmitting(true);
    try {
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        date: new Date(`${date}T${time}:00`).toISOString(),
        location: location.trim(),
        organizer: organizer.trim() || 'Admin',
        category,
        imageUrl: imageUrl.trim(),
        isPaid,
        price: isPaid ? (parseInt(price) || 0) : 0,
        capacity: parseInt(capacity) || 100,
        featured,
        hiringVolunteers,
        volunteerRoles: hiringVolunteers ? volunteerRoles : [],
        createdBy: user?.email?.toLowerCase() || 'admin',
        status: 'published'
      };

      const url = isEdit ? `${API_BASE_URL}/events/${id}` : `${API_BASE_URL}/events`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (res.ok) {
        Alert.alert('Success', isEdit ? 'Event updated!' : 'Event created!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        const err = await res.json();
        Alert.alert('Error', err.message || 'Failed to save event');
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingEvent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E3B6E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <LinearGradient colors={['#0E3B6E', '#1A4F8B']} style={{ paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="close" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFF', flex: 1 }}>
            {isEdit ? 'Edit Event' : 'Create Event'}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}
            style={{ backgroundColor: submitting ? '#94A3B8' : '#F97316', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}>
            {submitting ? <ActivityIndicator size="small" color="#FFF" /> :
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 14 }}>{isEdit ? 'Update' : 'Publish'}</Text>}
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

          {/* Basic Info */}
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937', marginBottom: 10 }}>📋 Basic Info</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            {[
              { label: 'Event Title *', value: title, setter: setTitle, placeholder: 'e.g. Tech Workshop 2026' },
              { label: 'Description *', value: description, setter: setDescription, placeholder: 'Describe the event...', multiline: true, lines: 4 },
              { label: 'Location *', value: location, setter: setLocation, placeholder: 'e.g. Main Auditorium, JnU' },
              { label: 'Organizer Name', value: organizer, setter: setOrganizer, placeholder: 'Your club/org name' },
            ].map((field, i) => (
              <View key={i} style={{ marginBottom: i < 3 ? 14 : 0 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>{field.label}</Text>
                <TextInput
                  style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1F2937', minHeight: field.multiline ? 80 : undefined, textAlignVertical: field.multiline ? 'top' : 'center' }}
                  placeholder={field.placeholder}
                  placeholderTextColor="#9CA3AF"
                  value={field.value}
                  onChangeText={field.setter}
                  multiline={field.multiline}
                  numberOfLines={field.lines}
                />
              </View>
            ))}
          </View>

          {/* Date & Category */}
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937', marginBottom: 10 }}>📅 Date & Category</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>Date * (YYYY-MM-DD)</Text>
                <TextInput style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }} placeholder="2026-08-15" placeholderTextColor="#9CA3AF" value={date} onChangeText={setDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>Time * (HH:MM)</Text>
                <TextInput style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }} placeholder="10:00" placeholderTextColor="#9CA3AF" value={time} onChangeText={setTime} />
              </View>
            </View>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: category === cat ? '#0E3B6E' : '#F1F5F9' }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: category === cat ? '#FFF' : '#64748B' }}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Image URL */}
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937', marginBottom: 10 }}>🖼️ Image</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>Image URL *</Text>
            <TextInput style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }} placeholder="https://i.ibb.co/your-image.jpg" placeholderTextColor="#9CA3AF" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9CA3AF', marginTop: 4 }}>Use imgbb.com or any image hosting URL</Text>
          </View>

          {/* Pricing & Capacity */}
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937', marginBottom: 10 }}>💰 Pricing & Capacity</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#374151' }}>Paid Event</Text>
              <Switch value={isPaid} onValueChange={setIsPaid} trackColor={{ false: '#E5E7EB', true: '#0E3B6E' }} thumbColor={isPaid ? '#FFF' : '#FFF'} />
            </View>
            {isPaid && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>Price (৳)</Text>
                <TextInput style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }} placeholder="200" keyboardType="number-pad" value={price} onChangeText={setPrice} />
              </View>
            )}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 6 }}>Capacity</Text>
            <TextInput style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }} placeholder="100" keyboardType="number-pad" value={capacity} onChangeText={setCapacity} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#374151' }}>Featured Event</Text>
              <Switch value={featured} onValueChange={setFeatured} trackColor={{ false: '#E5E7EB', true: '#F97316' }} thumbColor={featured ? '#FFF' : '#FFF'} />
            </View>
          </View>

          {/* Volunteers */}
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937', marginBottom: 10 }}>🤝 Volunteers</Text>
          <View style={{ backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#374151' }}>Hiring Volunteers</Text>
              <Switch value={hiringVolunteers} onValueChange={setHiringVolunteers} trackColor={{ false: '#E5E7EB', true: '#10B981' }} thumbColor={hiringVolunteers ? '#FFF' : '#FFF'} />
            </View>
            {hiringVolunteers && (
              <>
                {volunteerRoles.map((role, idx) => (
                  <View key={idx} style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#1F2937' }}>{role.role}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280' }}>{role.spots} spots — {role.description}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeVolunteerRole(idx)}>
                      <Ionicons name="close-circle" size={22} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TextInput style={{ flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, fontFamily: 'Poppins_400Regular', fontSize: 13 }} placeholder="Role name" value={newRole} onChangeText={setNewRole} />
                  <TextInput style={{ width: 60, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, fontFamily: 'Poppins_400Regular', fontSize: 13 }} placeholder="Spots" keyboardType="number-pad" value={newSpots} onChangeText={setNewSpots} />
                </View>
                <TextInput style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 10, fontFamily: 'Poppins_400Regular', fontSize: 13, marginTop: 6 }} placeholder="Description (optional)" value={newRoleDesc} onChangeText={setNewRoleDesc} />
                <TouchableOpacity onPress={addVolunteerRole}
                  style={{ backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 13 }}>+ Add Role</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
