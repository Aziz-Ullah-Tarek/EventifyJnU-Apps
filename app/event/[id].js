import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Dimensions, Platform, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';

const SCREEN_WIDTH = Dimensions.get('window').width;
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchEventDetails();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.log('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login to register for events' });
      router.push('/login');
      return;
    }
    try {
      setRegistering(true);
      const response = await fetch(`${API_BASE_URL}/events/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userName: user.displayName || user.email?.split('@')[0] || 'Student',
          userEmail: user.email,
          userDepartment: '',
          userBatch: '',
          paymentMethod: event.isPaid ? 'stripe' : 'free'
        })
      });
      const data = await response.json();
      if (response.ok) {
        setTicketData(data.registration);
        setShowTicket(true);
        // Refresh event to update count
        fetchEventDetails();
        Toast.show({ type: 'success', text1: 'Registered!', text2: `Ticket: ${data.registration.ticketCode}` });
      } else {
        Toast.show({ type: 'error', text1: 'Registration Failed', text2: data.message });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#E86F21" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={60} color="#D1D5DB" />
        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#6B7280', marginTop: 16 }}>Event not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12, backgroundColor: '#F3F4F6', borderRadius: 8 }}>
          <Text style={{ fontFamily: 'Poppins_400Regular' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = (event.registeredCount / event.capacity) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: event.imageUrl }} style={{ width: SCREEN_WIDTH, height: 300 }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 40, left: 20, width: 44, height: 44, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ backgroundColor: '#E86F21', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 12 }}>{event.isPaid ? 'Paid' : 'Free'}</Text>
              </View>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 18 }}>{event.isPaid ? `৳${event.price}` : 'FREE'}</Text>
            </View>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 26, lineHeight: 32 }} numberOfLines={2}>
              {event.title}
            </Text>
          </View>
        </View>

        {/* Details Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 24, minHeight: 400 }}>
          
          {/* Info Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start' }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="calendar" size={24} color="#0E3B6E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 12 }}>Date</Text>
                <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1F2937', fontSize: 14, marginTop: 2 }}>{new Date(event.date).toLocaleDateString()}</Text>
              </View>
            </View>
            
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', marginLeft: 10 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="location" size={24} color="#E86F21" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 12 }}>Venue</Text>
                <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1F2937', fontSize: 14, marginTop: 2 }}>{event.location}</Text>
              </View>
            </View>
          </View>

          {/* Organizer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#0E3B6E', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13 }}>Organized by</Text>
              <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1F2937', fontSize: 15 }}>{event.organizer}</Text>
            </View>
          </View>

          {/* About */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 18, marginBottom: 12 }}>About Event</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 15, lineHeight: 24 }}>
              {event.description}
            </Text>
          </View>

          {/* Capacity Progress */}
          <View style={{ marginTop: 30, backgroundColor: '#F8F9FA', padding: 16, borderRadius: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#1F2937', fontSize: 14 }}>Event Capacity</Text>
              <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#0E3B6E', fontSize: 14 }}>{event.registeredCount} / {event.capacity}</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${progress}%`, backgroundColor: progress > 90 ? '#E83F3F' : '#0E3B6E', borderRadius: 4 }} />
            </View>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 12, marginTop: 8 }}>
              {event.capacity - event.registeredCount} seats remaining
            </Text>
          </View>

          {/* Volunteer Hiring Section */}
          {event.hiringVolunteers && (
            <View style={{ marginTop: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ backgroundColor: '#E86F21', padding: 8, borderRadius: 8, marginRight: 12 }}>
                  <Ionicons name="hand-right" size={20} color="#FFFFFF" />
                </View>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 18 }}>We are hiring Volunteers!</Text>
              </View>

              {event.volunteerRoles?.map((v, index) => (
                <View key={index} style={{ backgroundColor: '#F0F9FF', borderRadius: 16, padding: 20, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#0E3B6E' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 16 }}>{v.role}</Text>
                    <View style={{ backgroundColor: '#0E3B6E', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF', fontSize: 10 }}>{v.spots - v.filledSpots} SPOTS LEFT</Text>
                    </View>
                  </View>
                  
                  <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 4 }}>Role:</Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 13, marginBottom: 12 }}>{v.description || 'No description'}</Text>

                  {v.requirements && (
                    <>
                      <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 4 }}>Requirements & Skills:</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 13, marginBottom: 12 }}>{v.requirements}</Text>
                    </>
                  )}
                  
                  {v.schedule && (
                    <>
                      <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 4 }}>Work Schedule:</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 13, marginBottom: 12 }}>{v.schedule}</Text>
                    </>
                  )}

                  {v.benefits && (
                    <>
                      <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 4 }}>Benefits & Rewards:</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {(typeof v.benefits === 'string' ? v.benefits.split(',') : v.benefits || []).map((benefit, bIdx) => (
                          <View key={bIdx} style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="gift-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
                            <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#059669', fontSize: 11 }}>{(benefit || '').trim()}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  <TouchableOpacity 
                    onPress={() => router.push({
                      pathname: '/volunteer-apply',
                      params: { eventId: event._id, role: v.role }
                    })}
                    style={{ backgroundColor: '#0E3B6E', marginTop: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>Apply as {v.role}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13 }}>Total Price</Text>
          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 22 }}>{event.isPaid ? `৳${event.price}` : 'FREE'}</Text>
        </View>
        <TouchableOpacity 
          onPress={handleRegister}
          disabled={registering}
          style={{ backgroundColor: '#E86F21', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, shadowColor: '#E86F21', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6, opacity: registering ? 0.7 : 1 }}
        >
          {registering ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>Register Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Ticket Modal */}
      <Modal visible={showTicket} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 360, padding: 24, alignItems: 'center' }}>
            <View style={{ backgroundColor: '#D1FAE5', borderRadius: 50, width: 60, height: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#1F2937', marginBottom: 4 }}>Registration Successful!</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
              Show this QR code at the event entry
            </Text>

            {ticketData?.qrCode && (
              <Image source={{ uri: ticketData.qrCode }} style={{ width: 220, height: 220 }} resizeMode="contain" />
            )}

            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, width: '100%', alignItems: 'center', marginTop: 16 }}>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' }}>Ticket Code</Text>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#0E3B6E', marginTop: 2 }}>{ticketData?.ticketCode}</Text>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setShowTicket(false); router.push('/(tabs)/tickets'); }}
                style={{ flex: 1, backgroundColor: '#0E3B6E', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>My Tickets</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowTicket(false)}
                style={{ flex: 1, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#4B5563', fontSize: 14 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}