import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event');
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.log('Fetch error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load event details.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Navigate to a dedicated registration/payment screen later
    Toast.show({ 
      type: 'success', 
      text1: 'Registration Initiated', 
      text2: 'Redirecting to booking layout...' 
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#E86F21" />
      </View>
    );
  }

  if (!event) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-4">
        <Ionicons name="alert-circle-outline" size={60} color="#D1D5DB" />
        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-500 mt-4 text-center">Event not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-3 bg-gray-100 rounded-lg">
          <Text style={{ fontFamily: 'Poppins_400Regular' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View className="relative w-full h-72">
          <Image 
            source={{ uri: event.imageUrl || 'https://via.placeholder.com/600x300' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          {/* Overlay gradient for readability */}
          <View className="absolute inset-0 bg-black/30" />
          
          {/* Custom Back Button */}
          <View className="absolute top-12 left-5 z-10 w-10 h-10 shadow-sm bg-white/20 rounded-full overflow-hidden border border-white/10" style={{ backdropFilter: 'blur(10px)' }}>
            <TouchableOpacity 
              onPress={() => router.back()}
              className="flex-1 items-center justify-center"
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body */}
        <View className="px-5 pt-6 pb-32 bg-white rounded-t-3xl -mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
              <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-orange-600 text-xs tracking-wider uppercase">
                {event.organizer}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Montserrat_700Bold' }} className={event.isPaid ? "text-[#0E3B6E] text-xl" : "text-green-600 text-xl"}>
              {event.isPaid ? `৳${event.price}` : 'FREE'}
            </Text>
          </View>

          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-2xl text-gray-800 mb-6 leading-8">
            {event.title}
          </Text>

          {/* Info Rows */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Ionicons name="calendar" size={20} color="#0E3B6E" />
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-xs">Date & Time</Text>
                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-gray-800 text-sm">
                  {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-xs">
                  {new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-3">
                <Ionicons name="location" size={20} color="#D95E16" />
              </View>
              <View>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-xs">Location</Text>
                <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-gray-800 text-sm">
                  {event.location}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-xs">
                  Jagannath University Campus
                </Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-800 text-lg mb-2 mt-4">
            About this Event
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-sm leading-relaxed mb-6">
            {event.description}
          </Text>

          {/* Capacity Progress */}
          <View className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm mb-6 mt-4">
            <View className="flex-row justify-between mb-2">
              <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-gray-700 text-sm">Capacity</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-sm">
                {event.registeredCount} / {event.capacity} registered
              </Text>
            </View>
            <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <View 
                className="h-full bg-orange-500 rounded-full" 
                style={{ width: `${Math.min((event.registeredCount / event.capacity) * 100, 100)}%` }} 
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 pb-8 pt-4 px-5 bg-white flex-row items-center justify-between" style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', elevation: 20, shadowColor: '#000', shadowOffset: { height: -4, width: 0 }, shadowOpacity: 0.05, shadowRadius: 10 }}>
        <View>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-xs tracking-wider uppercase mb-1">Total Price</Text>
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#0E3B6E] text-2xl">
             {event.isPaid ? `৳ ${event.price}` : 'FREE'}
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-[#D95E16] px-8 py-3.5 rounded-xl items-center justify-center flex-row shadow-md active:bg-orange-700"
          onPress={handleRegister}
        >
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-base mr-2 tracking-wide">
            Register Now
          </Text>
          <Ionicons name="arrow-forward" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}