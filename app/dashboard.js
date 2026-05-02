import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-toast-message';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    events: [],
    applications: [],
    bookings: []
  });

  useEffect(() => {
    // Check if firebase is initialized
    let subscriber;
    try {
      subscriber = auth().onAuthStateChanged((user) => {
        setUser(user);
        if (user) {
          fetchDashboardData(user.email);
        } else {
          setLoading(false);
          // router.replace('/login'); // Commented out to prevent redirect before firebase setup
        }
      });
    } catch (e) {
      console.warn("Firebase not initialized yet. Showing guest dashboard.");
      setLoading(false);
    }
    
    return subscriber ? subscriber : undefined;
  }, []);

  const fetchDashboardData = async (email) => {
    try {
      setLoading(true);
      // Fetch volunteer applications
      const appRes = await fetch(`${API_BASE_URL}/volunteer/my-applications/${email}`);
      const appData = await appRes.json();

      // Fetch room bookings
      const bookRes = await fetch(`${API_BASE_URL}/bookings/user/${email}`);
      const bookData = await bookRes.json();

      setStats({
        applications: Array.isArray(appData) ? appData : [],
        bookings: Array.isArray(bookData) ? bookData : [],
        events: [] // Could be extended to show registered events if that model existed
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (user) fetchDashboardData(user.email);
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
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#0E3B6E' }}>Student Dashboard</Text>
        <TouchableOpacity onPress={() => {
          try {
            auth().signOut();
          } catch(e) {
            router.replace('/login');
          }
        }}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={{ padding: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* User Profile Card */}
        <View style={{ backgroundColor: '#0E3B6E', borderRadius: 24, padding: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 25, shadowColor: '#0E3B6E', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 }}>
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 20, borderWidth: 2, borderColor: '#FFFFFF' }}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 22 }}>
              {user?.displayName || (user ? 'Student User' : 'Guest User')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <View style={{ backgroundColor: '#E86F21', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, marginRight: 8 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 10, fontFamily: 'Poppins_700Bold' }}>{user ? 'STUDENT' : 'GUEST'}</Text>
              </View>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
                {user?.email || 'Login to see your data'}
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
