import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, Platform, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import Toast from 'react-native-toast-message';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function MyTicketsScreen() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchTickets(u.email);
      else setLoading(false);
    });
    return unsub;
  }, []);

  const fetchTickets = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/registerevnts/${email}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.log('Fetch tickets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingTickets = registrations.filter(r => {
    const eventDate = r.event?.date ? new Date(r.event.date) : now;
    return eventDate >= now && r.status !== 'cancelled';
  });
  const pastTickets = registrations.filter(r => {
    const eventDate = r.event?.date ? new Date(r.event.date) : now;
    return eventDate < now || r.status === 'cancelled';
  });

  const filteredTickets = activeTab === 'upcoming' ? upcomingTickets : pastTickets;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#0E3B6E' }}>My Tickets</Text>
      </View>

      {/* Tabs segment */}
      <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('upcoming')}
          style={{ flex: 1, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: activeTab === 'upcoming' ? '#E86F21' : 'transparent', alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 16, color: activeTab === 'upcoming' ? '#E86F21' : '#6B7280' }}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('past')}
          style={{ flex: 1, paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: activeTab === 'past' ? '#E86F21' : 'transparent', alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 16, color: activeTab === 'past' ? '#E86F21' : '#6B7280' }}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Ticket List */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <ActivityIndicator size="large" color="#E86F21" />
            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', marginTop: 12 }}>Loading tickets...</Text>
          </View>
        ) : !user ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="ticket-outline" size={80} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 18, color: '#6B7280', marginTop: 16 }}>Login to view tickets</Text>
            <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 16, backgroundColor: '#0E3B6E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>Log In</Text>
            </TouchableOpacity>
          </View>
        ) : filteredTickets.length === 0 ? (
           <View style={{ alignItems: 'center', marginTop: 60 }}>
             <Ionicons name="ticket-outline" size={80} color="#D1D5DB" />
             <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 18, color: '#6B7280', marginTop: 16 }}>No tickets found</Text>
             <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>You haven&apos;t registered for any events yet.</Text>
           </View>
        ) : (
          filteredTickets.map(reg => {
            const ev = reg.event || {};
            const eventDate = ev.date ? new Date(ev.date) : new Date();
            return (
              <TouchableOpacity key={reg._id} activeOpacity={0.9} onPress={() => { setSelectedTicket(reg); setShowQR(true); }} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, overflow: 'hidden' }}>
                <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', borderStyle: 'dashed' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1F2937', flex: 1, paddingRight: 12 }} numberOfLines={2}>
                      {ev.title || 'Unknown Event'}
                    </Text>
                    <View style={{ backgroundColor: reg.status === 'checked-in' ? '#D1FAE5' : activeTab === 'upcoming' ? '#FEF3C7' : '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 12, color: reg.status === 'checked-in' ? '#059669' : activeTab === 'upcoming' ? '#D97706' : '#6B7280' }}>
                        {reg.status === 'checked-in' ? 'Checked In' : reg.status === 'cancelled' ? 'Cancelled' : activeTab === 'upcoming' ? 'Valid' : 'Expired'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4B5563', marginLeft: 8 }}>
                      {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4B5563', marginLeft: 8 }}>{ev.location || 'N/A'}</Text>
                  </View>
                </View>
                <View style={{ position: 'absolute', top: '65%', left: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#F8F9FA' }} />
                <View style={{ position: 'absolute', top: '65%', right: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#F8F9FA' }} />
                <View style={{ padding: 20, backgroundColor: '#FAFAFA', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' }}>Ticket ID</Text>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: '#0E3B6E' }}>{reg.ticketCode}</Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Status</Text>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: reg.status === 'confirmed' ? '#10B981' : reg.status === 'checked-in' ? '#3B82F6' : '#6B7280' }}>{reg.status}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => { setSelectedTicket(reg); setShowQR(true); }}
                    style={{ backgroundColor: '#0E3B6E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: '#FFFFFF' }}>Show QR</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* QR Code Modal */}
      <Modal visible={showQR} transparent animationType="fade" onRequestClose={() => setShowQR(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, width: '100%', maxWidth: 360, alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setShowQR(false)} style={{ position: 'absolute', top: 16, right: 16, padding: 8, zIndex: 10 }}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>

            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#0E3B6E', marginBottom: 4, textAlign: 'center', marginTop: 10 }}>
              {selectedTicket?.event?.title || 'Event Ticket'}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>
              {selectedTicket?.event?.date ? new Date(selectedTicket.event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </Text>

            {selectedTicket?.qrCode ? (
              <Image source={{ uri: selectedTicket.qrCode }} style={{ width: 240, height: 240 }} resizeMode="contain" />
            ) : (
              <View style={{ width: 240, height: 240, backgroundColor: '#F3F4F6', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="qr-code" size={80} color="#D1D5DB" />
              </View>
            )}

            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, width: '100%', alignItems: 'center', marginTop: 20 }}>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9CA3AF' }}>Ticket Code</Text>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#0E3B6E', marginTop: 2 }}>{selectedTicket?.ticketCode}</Text>
            </View>

            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
              Show this QR code at the event entry for check-in
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}