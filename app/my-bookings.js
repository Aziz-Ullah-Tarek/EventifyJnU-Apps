import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, ActivityIndicator, Alert, RefreshControl, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function MyBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All'); // All, Pending, Approved, Completed, Cancelled
  const [userId, setUserId] = useState('user123'); // Get from auth

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (filter !== 'All') params.append('status', filter);

      const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load bookings' });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings().finally(() => setRefreshing(false));
  }, [filter, userId]);

  const handleCancelBooking = (bookingId) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'User requested cancellation' })
              });

              if (response.ok) {
                Toast.show({ type: 'success', text1: 'Success', text2: 'Booking cancelled' });
                fetchBookings();
              }
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel booking' });
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'clock-outline';
      case 'Approved': return 'checkmark-circle';
      case 'Completed': return 'checkmark-done-all';
      case 'Cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const BookingCard = ({ booking }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 border border-gray-200"
      onPress={() => router.push({
        pathname: '/bookings/[id]',
        params: { id: booking._id }
      })}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-base mb-1">
            {booking.bookingTitle}
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-sm">
            📍 {booking.room?.name || 'Unknown Room'}
          </Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-1 ${getStatusColor(booking.status)}`}>
          <Ionicons name={getStatusIcon(booking.status)} size={14} />
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-xs">
            {booking.status}
          </Text>
        </View>
      </View>

      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <View className="flex-row items-center mb-2">
          <Ionicons name="calendar-outline" size={16} color="#64748b" style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm">
            {formatDateTime(booking.startDateTime)} - {new Date(booking.endDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="people-outline" size={16} color="#64748b" style={{ marginRight: 8 }} />
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-sm">
            {booking.expectedAttendees} attendees • {booking.duration?.toFixed(1) || '0'} hours
          </Text>
        </View>
      </View>

      {booking.status === 'Pending' && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-red-50 border border-red-200 rounded-lg py-2 items-center flex-row justify-center gap-2"
            onPress={() => handleCancelBooking(booking._id)}
          >
            <Ionicons name="close" size={16} color="#dc2626" />
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-red-600 text-sm">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-blue-50 border border-blue-200 rounded-lg py-2 items-center flex-row justify-center gap-2">
            <Ionicons name="pencil" size={16} color="#2563eb" />
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-blue-600 text-sm">
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {booking.approvedBy?.remarks && (
        <View className="mt-3 bg-blue-50 rounded-lg p-2 border border-blue-100">
          <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-blue-700 text-xs mb-1">
            Admin Note:
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-blue-600 text-xs">
            {booking.approvedBy.remarks}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#0E3B6E" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-gray-800">
            My Bookings
          </Text>
          <TouchableOpacity onPress={() => router.push('/room-booking')}>
            <Ionicons name="add-circle" size={28} color="#0E3B6E" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'Pending', 'Approved', 'Completed', 'Cancelled'].map((status) => (
            <TouchableOpacity
              key={status}
              className={`mr-3 px-4 py-2 rounded-full ${
                filter === status
                  ? 'bg-blue-600'
                  : 'bg-gray-200'
              }`}
              onPress={() => {
                setFilter(status);
                setLoading(true);
              }}
            >
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className={filter === status ? 'text-white' : 'text-gray-700'}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0E3B6E" />
        </View>
      ) : bookings.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Ionicons name="document-outline" size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-lg mb-2">
            No Bookings Found
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-600 text-center mb-6">
            You haven&apos;t made any room bookings yet. Start by booking a room!
          </Text>
          <TouchableOpacity
            className="bg-blue-600 px-6 py-3 rounded-xl"
            onPress={() => router.push('/room-booking')}
          >
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-white">
              Book a Room
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
