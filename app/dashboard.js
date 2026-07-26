import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../constants/firebase';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const getStatusStyle = (status) => {
  const s = (status || 'pending').toLowerCase();
  if (s === 'approved' || s === 'confirmed') return { bg: '#D1FAE5', text: '#059669', label: 'Approved' };
  if (s === 'checked-in') return { bg: '#DBEAFE', text: '#2563EB', label: 'Checked In' };
  if (s === 'rejected' || s === 'cancelled') return { bg: '#FEE2E2', text: '#DC2626', label: 'Rejected' };
  return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' };
};

/**
 * Check if a user email belongs to an admin.
 * Redirects to admin dashboard if so.
 */
async function redirectIfAdmin(email, router) {
  if (!email) return;
  try {
    const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.role === 'admin') {
        router.replace('/admin/dashboard');
        return true;
      }
      if (data.role === 'organizer') {
        router.replace('/organizer/dashboard');
        return true;
      }
    }
  } catch (e) {}
  return false;
}

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [stats, setStats] = useState({
    registrations: [],
    applications: [],
    bookings: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Check if admin first - if so, redirect to admin dashboard
        const isAdmin = await redirectIfAdmin(currentUser.email, router);
        if (isAdmin) return;

        setUser(currentUser);
        setPhotoError(false);
        await fetchUserFromDb(currentUser.email);
        fetchDashboardData(currentUser.email, currentUser.uid);
      } else {
        setLoading(false);
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, []);

  const fetchUserFromDb = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setDbUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchDashboardData = async (email, uid) => {
    try {
      setLoading(true);
      const [regRes, appRes, bookRes] = await Promise.all([
        fetch(`${API_BASE_URL}/registerevnts/${encodeURIComponent(email)}`),
        fetch(`${API_BASE_URL}/volunteer/my-applications/${encodeURIComponent(email)}`),
        fetch(`${API_BASE_URL}/bookings?userId=${uid}`)
      ]);
      const [regData, appData, bookData] = await Promise.all([
        regRes.json(), appRes.json(), bookRes.json()
      ]);
      setStats({
        registrations: Array.isArray(regData) ? regData : [],
        applications: Array.isArray(appData) ? appData : [],
        bookings: Array.isArray(bookData) ? bookData : []
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Toast.show({ type: 'success', text1: 'Signed Out', text2: 'See you again!' });
      // Navigation handled automatically by onAuthStateChanged in _layout.js
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Sign out failed', text2: error.message });
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) {
      fetchUserFromDb(user.email);
      fetchDashboardData(user.email, user.uid);
    }
  }, [user]);

  // Get the best available photo URL with fallback avatar
  const userName = dbUser?.name || user?.displayName || user?.email?.split('@')[0] || 'User';
  const photoUrl = (!photoError && (dbUser?.photoURL || user?.photoURL)) || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0E3B6E&color=fff&size=200&bold=true`;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#0E3B6E" />
        <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', marginTop: 12 }}>Loading dashboard...</Text>
      </View>
    );
  }

  const userRole = dbUser?.role || 'student';
  const roleColors = { admin: '#EF4444', moderator: '#8B5CF6', organizer: '#F97316', student: '#E86F21' };
  const roleLabels = { admin: 'Admin', moderator: 'Organizer', organizer: 'Organizer', student: 'Student' };
  const isOrganizerOrAdmin = userRole === 'organizer' || userRole === 'admin';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      
      {/* ===== HEADER with Gradient ===== */}
      <LinearGradient colors={['#0E3B6E', '#1A4F8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.push('/menu')} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFFFFF', letterSpacing: 0.5 }}>
            My Dashboard
          </Text>
          <TouchableOpacity onPress={handleSignOut} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="log-out-outline" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)', overflow: 'hidden' }}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <Ionicons name="person" size={32} color="#FFFFFF" />
            )}
          </View>
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 20 }} numberOfLines={1}>
              {dbUser?.name || user?.displayName || user?.email?.split('@')[0] || 'Eventify User'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <View style={{ backgroundColor: roleColors[userRole] || '#E86F21', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontFamily: 'Poppins_700Bold', color: '#FFFFFF', fontSize: 10, letterSpacing: 0.5 }}>{roleLabels[userRole] || 'Student'}</Text>
              </View>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 10 }} numberOfLines={1}>
                {user?.email || ''}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0E3B6E']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== STATS ROW ===== */}
        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 10 }}>
          {[
            { count: (stats.registrations || []).length, label: 'Registered Events', icon: 'ticket', color: '#0E3B6E', bg: '#EEF2FF' },
            { count: stats.applications.length, label: 'Volunteer Apps', icon: 'hand-right', color: '#E86F21', bg: '#FFF7ED' },
            { count: stats.bookings.length, label: 'Room Bookings', icon: 'business', color: '#059669', bg: '#ECFDF5' }
          ].map((item, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#1F2937' }}>{item.count}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ===== ORGANIZER PANEL BUTTON (only for organizer/admin) ===== */}
        {isOrganizerOrAdmin && (
          <TouchableOpacity
            onPress={() => router.push('/organizer/dashboard')}
            style={{ marginBottom: 20, backgroundColor: '#FFF7ED', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#F97316', borderStyle: 'dashed' }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Ionicons name="calendar" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#F97316' }}>Organizer Panel</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9A3412', marginTop: 2 }}>Create events, manage registrations & volunteers</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="#F97316" />
          </TouchableOpacity>
        )}

        {/* ===== REGISTERED EVENTS ===== */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 17, color: '#1F2937' }}>🎫 Registered Events</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tickets')}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#0E3B6E', fontSize: 13 }}>View All →</Text>
            </TouchableOpacity>
          </View>

          {(stats.registrations || []).length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ionicons name="ticket-outline" size={24} color="#9CA3AF" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6B7280', fontSize: 14 }}>No registered events yet</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/events')} style={{ marginTop: 12, backgroundColor: '#0E3B6E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 13 }}>Browse Events</Text>
              </TouchableOpacity>
            </View>
          ) : (
            stats.registrations.slice(0, 5).map((reg) => {
              const ev = reg.event || {};
              const st = getStatusStyle(reg.status);
              return (
                <TouchableOpacity key={reg._id} onPress={() => router.push(`/event/${ev._id}`)}
                  style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                  <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#F1F5F9', overflow: 'hidden', marginRight: 14 }}>
                    {ev.imageUrl ? (
                      <Image source={{ uri: ev.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="calendar" size={22} color="#0E3B6E" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1F2937' }} numberOfLines={1}>{ev.title || 'Unknown Event'}</Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                      {ev.date ? new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 }}>
                      <View style={{ backgroundColor: st.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 9, color: st.text }}>{st.label}</Text>
                      </View>
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 9 }}>{reg.ticketCode}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ===== VOLUNTEER APPLICATIONS ===== */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 17, color: '#1F2937' }}>🙋 Volunteer Applications</Text>
            <TouchableOpacity onPress={() => router.push('/volunteer')}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#0E3B6E', fontSize: 13 }}>Apply →</Text>
            </TouchableOpacity>
          </View>

          {stats.applications.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ionicons name="document-text-outline" size={24} color="#E86F21" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6B7280', fontSize: 14 }}>No applications yet</Text>
            </View>
          ) : (
            stats.applications.slice(0, 3).map((app) => {
              const st = getStatusStyle(app.status);
              return (
                <View key={app._id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1F293B' }}>{app.event?.title || 'Unknown Event'}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 }}>Role: {app.role}</Text>
                    </View>
                    <View style={{ backgroundColor: st.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: st.text }}>{st.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ===== ROOM BOOKINGS ===== */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 17, color: '#1F2937' }}>🏛️ Room Bookings</Text>
            <TouchableOpacity onPress={() => router.push('/room-booking')}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#0E3B6E', fontSize: 13 }}>Book →</Text>
            </TouchableOpacity>
          </View>

          {stats.bookings.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 28, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <Ionicons name="business-outline" size={24} color="#059669" />
              </View>
              <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6B7280', fontSize: 14 }}>No bookings yet</Text>
            </View>
          ) : (
            stats.bookings.slice(0, 5).map((booking) => {
              const st = getStatusStyle(booking.status);
              return (
                <View key={booking._id} style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                      <Ionicons name="calendar" size={22} color="#0E3B6E" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#1F293B' }} numberOfLines={1}>{booking.bookingTitle || booking.room?.name || 'Room Booking'}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                        {booking.startDateTime ? new Date(booking.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                        {' | '}
                        {booking.startDateTime ? new Date(booking.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: st.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: st.text }}>{st.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ===== BOTTOM CTA ===== */}
        <TouchableOpacity onPress={() => router.push('/(tabs)/events')}
          style={{ backgroundColor: '#0E3B6E', borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', marginTop: 4, shadowColor: '#0E3B6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="compass" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>Explore Events</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>Discover workshops, seminars & more</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
