import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function VolunteerEventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVolunteerEvents();
  }, []);

  const fetchVolunteerEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/volunteer/events`);
      if (!response.ok) throw new Error('Failed to fetch volunteer events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0E3B6E" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#0E3B6E', marginLeft: 16 }}>Volunteer Opportunities</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E86F21" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {events.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
              <Ionicons name="hand-right-outline" size={80} color="#D1D5DB" />
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#6B7280', marginTop: 16, textAlign: 'center' }}>No active volunteer openings found.</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>Check back later for new opportunities!</Text>
            </View>
          ) : (
            events.map((event) => (
              <TouchableOpacity
                key={event._id}
                onPress={() => router.push(`/event/${event._id}`)}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
              >
                <Image source={{ uri: event.imageUrl }} style={{ width: '100%', height: 150 }} />
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ backgroundColor: '#E86F21', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 10, letterSpacing: 1 }}>OPENING NOW</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6B7280', fontSize: 12, marginLeft: 4 }}>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    </View>
                  </View>
                  
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 20, marginBottom: 6 }}>{event.title}</Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 14, marginBottom: 16, lineHeight: 20 }} numberOfLines={2}>{event.description}</Text>
                  
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: '#374151', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Available Roles</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {event.volunteerRoles?.map((role, idx) => (
                        <View key={idx} style={{ backgroundColor: '#F0F9FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#BAE6FD', flexDirection: 'row', alignItems: 'center' }}>
                          <MaterialIcons name="person-search" size={14} color="#0369A1" style={{ marginRight: 4 }} />
                          <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#0369A1', fontSize: 11 }}>{role.role}</Text>
                          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#0369A1', marginHorizontal: 6, opacity: 0.3 }} />
                          <Text style={{ fontFamily: 'Poppins_500Medium', color: '#0284C7', fontSize: 10 }}>{role.spots - role.filledSpots} left</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                        <Ionicons name="location" size={14} color="#0E3B6E" />
                      </View>
                      <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6B7280', fontSize: 13 }}>{event.location}</Text>
                    </View>
                    <View style={{ backgroundColor: '#0E3B6E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 12 }}>Details</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}