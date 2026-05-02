import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Dummy Tickets Data
const TICKETS = [
  { id: 't1', title: 'Tech Symposium 2026', date: 'Oct 15, 2026', time: '10:00 AM', venue: 'Main Auditorium', status: 'upcoming', type: 'General Admission', ticketCode: '#TS26-804A' },
  { id: 't2', title: 'StartUp Pitch Deck', date: 'Oct 20, 2026', time: '1:00 PM', venue: 'Business Hall B', status: 'upcoming', type: 'VIP Delegate', ticketCode: '#SP26-001V' },
  { id: 't3', title: 'Spring Music Concert', date: 'Mar 10, 2026', time: '6:30 PM', venue: 'Open Air Theatre', status: 'past', type: 'General Admission', ticketCode: '#SM26-443B' },
];

export default function MyTicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [selectedTicket, setSelectedTicket] = useState(null);

  const filteredTickets = TICKETS.filter(t => t.status === activeTab);

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
        {filteredTickets.length === 0 ? (
           <View style={{ alignItems: 'center', marginTop: 60 }}>
             <Ionicons name="ticket-outline" size={80} color="#D1D5DB" />
             <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 18, color: '#6B7280', marginTop: 16 }}>No tickets found</Text>
             <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>You haven&apos;t registered for any events yet.</Text>
           </View>
        ) : (
          filteredTickets.map(ticket => (
            <View key={ticket.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, overflow: 'hidden' }}>
              {/* Ticket Top */}
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', borderStyle: 'dashed' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1F2937', flex: 1, paddingRight: 12 }} numberOfLines={2}>
                    {ticket.title}
                  </Text>
                  <View style={{ backgroundColor: activeTab === 'upcoming' ? '#FEF3C7' : '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 12, color: activeTab === 'upcoming' ? '#D97706' : '#6B7280' }}>
                      {activeTab === 'upcoming' ? 'Valid' : 'Expired'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4B5563', marginLeft: 8 }}>{ticket.date} • {ticket.time}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#4B5563', marginLeft: 8 }}>{ticket.venue}</Text>
                </View>
              </View>

              {/* Ticket Cutouts (Simulated visually) */}
              <View style={{ position: 'absolute', top: '65%', left: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#F8F9FA' }} />
              <View style={{ position: 'absolute', top: '65%', right: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: '#F8F9FA' }} />

              {/* Ticket Bottom */}
              <View style={{ padding: 20, backgroundColor: '#FAFAFA', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' }}>Ticket Type</Text>
                  <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: '#1F2937' }}>{ticket.type}</Text>
                  
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>Ticket ID</Text>
                  <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: '#0E3B6E' }}>{ticket.ticketCode}</Text>
                </View>

                <TouchableOpacity 
                  disabled={activeTab === 'past'}
                  onPress={() => setSelectedTicket(ticket)}
                  style={{
                    backgroundColor: activeTab === 'upcoming' ? '#0E3B6E' : '#E5E7EB',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12
                  }}>
                  <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 14, color: activeTab === 'upcoming' ? '#FFFFFF' : '#9CA3AF' }}>
                    Show QR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* QR Code Expansion Modal */}
      {selectedTicket && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 100 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 30, width: '100%', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => setSelectedTicket(null)} style={{ position: 'absolute', top: 16, right: 16, padding: 8 }}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>

            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#0E3B6E', marginBottom: 8, textAlign: 'center', marginTop: 10 }}>{selectedTicket.title}</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginBottom: 24 }}>{selectedTicket.date} • {selectedTicket.time}</Text>

            {/* Simulated Large QR */}
            <View style={{ padding: 16, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 16, backgroundColor: '#FFFFFF', marginBottom: 24 }}>
               <View style={{ width: 200, height: 200, backgroundColor: '#000000', flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center' }}>
                  {[...Array(64)].map((_, i) => (
                      <View key={i} style={{ width: 25, height: 25, backgroundColor: i % 2 === 0 ? '#000' : '#FFF' }} />
                  ))}
               </View>
            </View>

            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280' }}>Scan this code at the venue entry</Text>
            <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 16 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#0E3B6E', letterSpacing: 2 }}>{selectedTicket.ticketCode}</Text>
            </View>

          </View>
        </View>
      )}
    </SafeAreaView>
  );
}