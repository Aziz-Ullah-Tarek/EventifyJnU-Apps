import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Alert, Platform, Image, RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const COLORS = {
  primary: '#0E3B6E', accent: '#F97316', success: '#10B981', danger: '#EF4444',
  warning: '#F59E0B', info: '#3B82F6', purple: '#8B5CF6',
};

const StatCard = ({ icon, label, count, color }) => (
  <View style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#F1F5F9' }}>
    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#1F2937' }}>{count}</Text>
    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 }}>{label}</Text>
  </View>
);

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('events');

  const fetchData = useCallback(async () => {
    if (!user?.email) return;
    try {
      const [evRes, regRes, volRes] = await Promise.all([
        fetch(`${API_BASE_URL}/organizer/events/${encodeURIComponent(user.email)}`).then(r => r.json()),
        fetch(`${API_BASE_URL}/organizer/registrations/${encodeURIComponent(user.email)}`).then(r => r.json()),
        fetch(`${API_BASE_URL}/organizer/volunteers/${encodeURIComponent(user.email)}`).then(r => r.json()),
      ]);
      setEvents(Array.isArray(evRes) ? evRes : []);
      setRegistrations(Array.isArray(regRes) ? regRes : []);
      setVolunteers(Array.isArray(volRes) ? volRes : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user?.email]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) { setUser(u); } else { router.replace('/login'); }
    });
    return unsub;
  }, []);

  useEffect(() => { if (user?.email) fetchData(); }, [user?.email, fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleDeleteEvent = (id) => {
    Alert.alert('Delete Event', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' });
        Toast.show({ type: 'success', text1: 'Deleted' });
        fetchData();
      }}
    ]);
  };

  const handleVolunteerStatus = async (id, status) => {
    await fetch(`${API_BASE_URL}/organizer/volunteers/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    Toast.show({ type: 'success', text1: `Volunteer ${status}` });
    fetchData();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient colors={['#0E3B6E', '#1A4F8B']} style={{ paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFF' }}>Organizer Panel</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
          {user?.displayName || user?.email?.split('@')[0]}
        </Text>
      </LinearGradient>

      {/* Stats */}
      <View style={{ flexDirection: 'row', padding: 16, gap: 10 }}>
        <StatCard icon="calendar" label="My Events" count={events.length} color={COLORS.primary} />
        <StatCard icon="people" label="Registrations" count={registrations.length} color={COLORS.success} />
        <StatCard icon="hand-left" label="Volunteers" count={volunteers.length} color={COLORS.accent} />
      </View>

      {/* Tab Bar */}
      <View style={{ flexDirection: 'row', marginHorizontal: 16, backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 }}>
        {['events', 'registrations', 'volunteers'].map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: activeTab === tab ? '#FFF' : 'transparent', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: activeTab === tab ? COLORS.primary : '#64748B' }}>
              {tab === 'events' ? '📋 Events' : tab === 'registrations' ? '🎫 Registrations' : '🤝 Volunteers'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Event Button */}
      <TouchableOpacity onPress={() => router.push('/organizer/create-event')}
        style={{ marginHorizontal: 16, marginTop: 14, backgroundColor: COLORS.accent, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="add-circle" size={22} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 15 }}>Create New Event</Text>
      </TouchableOpacity>

      {/* CSE Calendar Button */}
      <TouchableOpacity onPress={() => router.push('/cse-calendar')}
        style={{ marginHorizontal: 16, marginTop: 10, backgroundColor: '#059669', borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="calendar" size={22} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 15 }}>CSE Calendar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          events.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#94A3B8', marginTop: 12 }}>No events yet</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#94A3B8', marginTop: 4 }}>Create your first event!</Text>
              <TouchableOpacity onPress={() => router.push('/organizer/create-event')}
                style={{ marginTop: 16, backgroundColor: COLORS.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 25 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 14 }}>➕ Create Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            events.map(event => (
              <View key={event._id} style={{ backgroundColor: '#FFF', borderRadius: 16, marginBottom: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
                <Image source={{ uri: event.imageUrl || 'https://via.placeholder.com/400x200' }} style={{ width: '100%', height: 150 }} resizeMode="cover" />
                <View style={{ padding: 14 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#1F2937' }}>{event.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginLeft: 4 }}>{formatDate(event.date)}</Text>
                    <Ionicons name="people-outline" size={14} color="#6B7280" style={{ marginLeft: 12 }} />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginLeft: 4 }}>{event.registeredCount}/{event.capacity}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 10, gap: 8 }}>
                    <TouchableOpacity onPress={() => router.push(`/organizer/edit-event?id=${event._id}`)}
                      style={{ flex: 1, backgroundColor: '#EEF2FF', borderRadius: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="create-outline" size={16} color={COLORS.primary} />
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: COLORS.primary, marginLeft: 6 }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteEvent(event._id)}
                      style={{ flex: 1, backgroundColor: '#FEF2F2', borderRadius: 10, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: COLORS.danger, marginLeft: 6 }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )
        )}

        {/* REGISTRATIONS TAB */}
        {activeTab === 'registrations' && (
          registrations.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Ionicons name="ticket-outline" size={60} color="#CBD5E1" />
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#94A3B8', marginTop: 12 }}>No registrations yet</Text>
            </View>
          ) : (
            registrations.map(reg => (
              <View key={reg._id} style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: COLORS.success }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#1F2937' }}>{reg.event?.title || 'Event'}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' }}>👤 {reg.userName || reg.userEmail}</Text>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: COLORS.primary }}>🎫 {reg.ticketCode}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' }}>{formatDate(reg.createdAt)}</Text>
                  <View style={{ backgroundColor: reg.status === 'confirmed' ? '#D1FAE5' : '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: reg.status === 'confirmed' ? COLORS.success : COLORS.warning }}>{reg.status?.toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            ))
          )
        )}

        {/* VOLUNTEERS TAB */}
        {activeTab === 'volunteers' && (
          volunteers.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Ionicons name="hand-left-outline" size={60} color="#CBD5E1" />
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#94A3B8', marginTop: 12 }}>No volunteer applications</Text>
            </View>
          ) : (
            volunteers.map(vol => (
              <View key={vol._id} style={{ backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: COLORS.accent }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#1F2937' }}>{vol.event?.title || 'Event'}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginTop: 4 }}>👤 {vol.userName || vol.userEmail} — {vol.role || 'Volunteer'}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{vol.message || ''}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' }}>{formatDate(vol.createdAt)}</Text>
                  {vol.status === 'pending' ? (
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <TouchableOpacity onPress={() => handleVolunteerStatus(vol._id, 'approved')}
                        style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 11, color: COLORS.success }}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleVolunteerStatus(vol._id, 'rejected')}
                        style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 11, color: COLORS.danger }}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: vol.status === 'approved' ? '#D1FAE5' : '#FEE2E2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: vol.status === 'approved' ? COLORS.success : COLORS.danger }}>{vol.status?.toUpperCase()}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
