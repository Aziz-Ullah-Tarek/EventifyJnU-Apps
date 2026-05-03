import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../constants/firebase';
import Toast from 'react-native-toast-message';

const API_BASE_URL = 'http://localhost:5000/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    events: [],
    applications: [],
    bookings: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserFromDb(user.email);
        fetchDashboardData(user.email);
      } else {
        setLoading(false);
        router.replace('/login');
      }
    });
    
    return unsubscribe;
  }, []);

  const fetchUserFromDb = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${email}`);
      if (response.ok) {
        const data = await response.json();
        setDbUser(data);
      }
    } catch (error) {
      console.error('Error fetching user from DB:', error);
    }
  };

  const fetchDashboardData = async (email) => {
    try {
      setLoading(true);
      // Fetch volunteer applications
      const appRes = await fetch(`${API_BASE_URL}/volunteer/my-applications/${email}`);
      const appData = await appRes.json();

      // Fetch room bookings
      const bookRes = await fetch(`${API_BASE_URL}/bookings?userId=${email}`); // Corrected parameter based on index.js
      const bookData = await bookRes.json();

      setStats({
        applications: Array.isArray(appData) ? appData : [],
        bookings: Array.isArray(bookData) ? bookData : [],
        events: [] 
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
      router.replace('/login');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Sign out failed', text2: error.message });
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user) {
      fetchUserFromDb(user.email);
      fetchDashboardData(user.email);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
        <ActivityIndicator size="large" color="#0E3B6E" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" />
      
      {/* Custom Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
        <TouchableOpacity onPress={() => router.push('/menu')}>
          <Ionicons name="menu-outline" size={28} color="#0E3B6E" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#0E3B6E' }}>
          {dbUser?.role === 'admin' ? 'Admin Dashboard' : dbUser?.role === 'moderator' ? 'Moderator Dashboard' : 'Student Dashboard'}
        </Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Sign Out Button (Extra) */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF5F5', padding: 12, borderRadius: 15, marginBottom: 20, borderStyle: 'solid', borderWidth: 1, borderColor: '#FED7D7' }}
          onPress={handleSignOut}
        >
          <Ionicons name="power-outline" size={20} color="#FF4D4D" style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: 'Poppins_700Bold', color: '#FF4D4D' }}>Log Out</Text>
        </TouchableOpacity>

        {/* User Profile Card */}
        <View style={{ backgroundColor: '#0E3B6E', borderRadius: 28, padding: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 25, shadowColor: '#0E3B6E', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 18, elevation: 12 }}>
          <View style={{ 
            width: 80, 
            height: 80, 
            borderRadius: 40, 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            justifyContent: 'center', 
            alignItems: 'center', 
            marginRight: 20, 
            borderWidth: 2, 
            borderColor: 'rgba(255,255,255,0.5)',
            overflow: 'hidden'
          }}>
            { (dbUser?.photoURL || user?.photoURL) ? (
              <Image 
                key={dbUser?.photoURL || user?.photoURL}
                source={{ uri: dbUser?.photoURL || user?.photoURL }} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={45} color="#FFFFFF" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text 
              numberOfLines={1} 
              style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 24, letterSpacing: -0.5 }}
            >
              {dbUser?.name || user?.displayName || 'Eventify User'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
              <View style={{ 
                backgroundColor: dbUser?.role === 'admin' ? '#ef4444' : dbUser?.role === 'moderator' ? '#8b5cf6' : '#E86F21', 
                paddingHorizontal: 12, 
                paddingVertical: 3, 
                borderRadius: 12, 
                marginRight: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Poppins_700Bold', letterSpacing: 0.5 }}>
                  {(dbUser?.role || 'STUDENT').toUpperCase()}
                </Text>
              </View>
              <Text 
                numberOfLines={1} 
                style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.85)', fontSize: 13, flex: 1 }}
              >
                {dbUser?.email || user?.email || 'No email data'}
              </Text>
            </View>
          </View>
        </View>

        {!user && (
          <TouchableOpacity 
            style={{ backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 25, alignItems: 'center', borderStyle: 'solid', borderWidth: 1, borderColor: '#0E3B6E' }}
            onPress={() => router.push('/login')}
          >
            <Text style={{ fontFamily: 'Poppins_700Bold', color: '#0E3B6E' }}>Log In to Sync Data</Text>
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginRight: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Montserrat_700Bold', color: '#0E3B6E' }}>{stats.applications.length}</Text>
            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#64748b' }}>Volunteer Apps</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 15, marginLeft: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Montserrat_700Bold', color: '#0E3B6E' }}>{stats.bookings.length}</Text>
            <Text style={{ fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#64748b' }}>Room Bookings</Text>
          </View>
        </View>

        {/* Volunteer Applications Section */}
        <View style={{ marginBottom: 25 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#0E3B6E' }}>My Volunteer Applications</Text>
            <TouchableOpacity onPress={() => router.push('/volunteer')}>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#E86F21', fontSize: 13 }}>Apply More</Text>
            </TouchableOpacity>
          </View>
          
          {stats.applications.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' }}>
              <Ionicons name="document-text-outline" size={32} color="#94A3B8" />
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#64748B', marginTop: 10 }}>No applications yet</Text>
            </View>
          ) : (
            stats.applications.slice(0, 3).map((app, index) => (
              <View key={app._id} style={{ backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1E293B' }}>{app.event?.title || 'Unknown Event'}</Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#64748B' }}>Role: {app.role}</Text>
                  </View>
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#059669', fontSize: 11, fontFamily: 'Poppins_700Bold' }}>PENDING</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Room Bookings Section */}
        <View style={{ marginBottom: 25 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#0E3B6E' }}>My Room Bookings</Text>
            <TouchableOpacity onPress={() => router.push('/room-booking')}>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#E86F21', fontSize: 13 }}>Book Room</Text>
            </TouchableOpacity>
          </View>
          
          {stats.bookings.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#CBD5E1' }}>
              <Ionicons name="business-outline" size={32} color="#94A3B8" />
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#64748B', marginTop: 10 }}>No bookings yet</Text>
            </View>
          ) : (
            stats.bookings.slice(0, 3).map((booking, index) => (
              <View key={booking._id} style={{ backgroundColor: '#FFFFFF', borderRadius: 15, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 45, height: 45, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 }}>
                  <Ionicons name="calendar" size={22} color="#0E3B6E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#1E293B' }}>{booking.eventName}</Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#64748B' }}>{new Date(booking.date).toLocaleDateString()} | {booking.startTime}</Text>
                </View>
                <View style={{ backgroundColor: booking.status === 'confirmed' ? '#ECFDF5' : '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ color: booking.status === 'confirmed' ? '#059669' : '#D97706', fontSize: 10, fontFamily: 'Poppins_700Bold' }}>{booking.status.toUpperCase()}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Explore More Card */}
        <TouchableOpacity 
          style={{ backgroundColor: '#E86F21', borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
          onPress={() => router.push('/(tabs)/events')}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 18 }}>Discover More Events</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 }}>Find upcoming workshops and seminars</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
