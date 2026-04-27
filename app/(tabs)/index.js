import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

// Adjust localhost for Android Emulator if tracking native Android
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Events from Backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.log('Fetch error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load events. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: '#F8F9FA' }} className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />
      
      {/* Header section */}
      <View className="flex-row justify-between items-center mb-6 mt-4">
        <View>
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#0E3B6E] text-2xl">
            Eventify<Text className="text-orange-500">JnU</Text>
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-sm">
            Discover Campus Events
          </Text>
        </View>
        <TouchableOpacity className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
          <Ionicons name="notifications-outline" size={24} color="#0E3B6E" />
        </TouchableOpacity>
      </View>

      {/* Featured/Upcoming Events Section */}
      <View className="mb-6">
        <View className="flex-row justify-between items-end mb-4">
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-800 text-lg">
            Upcoming Events
          </Text>
          <TouchableOpacity onPress={fetchEvents}>
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-[#0E3B6E] text-sm">Refresh</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="large" color="#E86F21" />
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 mt-4">Loading events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View className="py-10 items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200">
            <Ionicons name="calendar-clear-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-400 mt-2">No upcoming events right now.</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingRight: 20 }}
            className="-mx-5 px-5 pt-2 pb-6"
            decelerationRate="fast"
            snapToInterval={296}
          >
            {events.map((event) => (
              <TouchableOpacity 
                key={event._id} 
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 mr-4 w-[280px]"
                activeOpacity={0.9}
                onPress={() => router.push(`/event/${event._id}`)}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Image 
                  source={{ uri: event.imageUrl || 'https://via.placeholder.com/600x300' }} 
                  className="w-full h-40 bg-gray-200"
                  resizeMode="cover"
                />
                
                <View className="p-4">
                  {/* Category & Price Badge */}
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="bg-orange-50 px-2 py-1 rounded">
                      <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-orange-600 text-[10px] uppercase tracking-wider">
                        {event.organizer}
                      </Text>
                    </View>
                    <Text style={{ fontFamily: 'Montserrat_700Bold' }} className={event.isPaid ? "text-[#0E3B6E] text-sm" : "text-green-600 text-sm"}>
                      {event.isPaid ? `৳${event.price}` : 'FREE'}
                    </Text>
                  </View>

                  {/* Title */}
                  <Text style={{ fontFamily: 'Montserrat_700Bold', lineHeight: 22 }} className="text-gray-800 text-[16px] mb-1" numberOfLines={2}>
                    {event.title}
                  </Text>

                  {/* Description */}
                  <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-xs mb-3 leading-4" numberOfLines={2}>
                    {event.description}
                  </Text>

                  {/* Date & Location */}
                  <View className="flex-row items-center mb-1">
                    <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                    <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-[11px] ml-1.5">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={12} color="#6B7280" />
                    <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-[11px] ml-1.5">
                      {event.location}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Quick Actions / Grid Areas (Moved to bottom) */}
      <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-800 text-lg mb-4">
        Quick Links
      </Text>
      <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        <TouchableOpacity 
          onPress={() => router.push('/volunteer')}
          style={{ width: '48%', height: 100, backgroundColor: '#0E3B6E', borderRadius: 16, marginBottom: 16, padding: 16, position: 'relative' }}
          className="shadow-sm items-center justify-center"
        >
          <Ionicons name="hand-right" size={24} color="#FFFFFF" className="mb-2" />
          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, textAlign: 'center' }}>
            Volunteer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/room-booking')}
          style={{ width: '48%', height: 100, backgroundColor: '#E86F21', borderRadius: 16, marginBottom: 16, padding: 16, position: 'relative' }}
          className="shadow-sm items-center justify-center"
        >
          <Ionicons name="business" size={24} color="#FFFFFF" className="mb-2" />
          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, textAlign: 'center' }}>
            Room Booking
          </Text>
        </TouchableOpacity>

      </View>
      <View className="h-10" />

    </ScrollView>
  );
}
