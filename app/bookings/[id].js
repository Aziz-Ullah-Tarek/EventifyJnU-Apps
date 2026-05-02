import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (id) fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
      const data = await response.json();
      setBooking(data);
      setLoading(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load booking details' });
      setLoading(false);
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelLoading(true);
              const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'User requested cancellation' })
              });

              if (response.ok) {
                const updatedBooking = await response.json();
                setBooking(updatedBooking);
                Toast.show({ type: 'success', text1: 'Success', text2: 'Booking cancelled' });
              }
            } catch (error) {
              Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel booking' });
            } finally {
              setCancelLoading(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#fbbf24';
      case 'Approved': return '#10b981';
      case 'Completed': return '#3b82f6';
      case 'Rejected': return '#ef4444';
      case 'Cancelled': return '#6b7280';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'clock-outline';
      case 'Approved': return 'checkmark-circle';
      case 'Completed': return 'checkmark-done-all';
      case 'Rejected': return 'close-circle';
      case 'Cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0E3B6E" />
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <Text className="text-gray-600">Booking not found</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#0E3B6E" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-gray-800">
            Booking Details
          </Text>
          <View className="w-7" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Status Banner */}
        <View className="m-4 rounded-2xl p-5 border-2" style={{ borderColor: getStatusColor(booking.status), backgroundColor: getStatusColor(booking.status) + '20' }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: getStatusColor(booking.status) }}>
                <Ionicons name={getStatusIcon(booking.status)} size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: getStatusColor(booking.status) }} className="text-lg">
                  {booking.status}
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', color: getStatusColor(booking.status) + '99' }} className="text-sm">
                  {booking.status === 'Pending' ? 'Awaiting approval' : booking.status === 'Approved' ? 'Ready to go' : booking.status === 'Completed' ? 'Event completed' : 'Cancelled'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Information */}
        <View className="mx-4 bg-white rounded-2xl p-5 mb-4 border border-gray-100">
          <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-lg mb-4">
            Booking Information
          </Text>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm mb-1">
              Title
            </Text>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-base">
              {booking.bookingTitle}
            </Text>
          </View>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm mb-1">
              Description
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700 text-base leading-6">
              {booking.description}
            </Text>
          </View>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm mb-1">
                Purpose
              </Text>
              <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-gray-800">
                {booking.purpose}
              </Text>
            </View>
            <View className="flex-1">
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm mb-1">
                Expected Attendees
              </Text>
              <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-gray-800">
                {booking.expectedAttendees} people
              </Text>
            </View>
          </View>
        </View>

        {/* Room Details */}
        <View className="mx-4 bg-white rounded-2xl p-5 mb-4 border border-gray-100">
          <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-lg mb-4">
            Room Details
          </Text>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm mb-2">
              Room
            </Text>
            <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-blue-900 mb-1">
                {booking.room?.name}
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-blue-800 text-sm">
                📍 {booking.room?.location} • 👥 Capacity: {booking.room?.capacity}
              </Text>
            </View>
          </View>

          {booking.room?.amenities && booking.room.amenities.length > 0 && (
            <View>
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm mb-2">
                Available Amenities
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {booking.room.amenities.map((amenity, idx) => (
                  <View key={idx} className="bg-green-100 rounded-full px-3 py-1">
                    <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-green-800 text-xs">
                      ✓ {amenity}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Date & Time */}
        <View className="mx-4 bg-white rounded-2xl p-5 mb-4 border border-gray-100">
          <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-lg mb-4">
            Date & Time
          </Text>

          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="play-circle-outline" size={18} color="#10b981" style={{ marginRight: 8 }} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm">
                Starts
              </Text>
            </View>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 ml-6">
              {formatDateTime(booking.startDateTime)}
            </Text>
          </View>

          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <Ionicons name="stop-circle-outline" size={18} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-600 text-sm">
                Ends
              </Text>
            </View>
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 ml-6">
              {formatDateTime(booking.endDateTime)}
            </Text>
          </View>

          <View className="bg-blue-50 rounded-lg p-3 border border-blue-200 mt-2">
            <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-blue-900">
              Duration: {booking.duration?.toFixed(1)} hours
            </Text>
          </View>
        </View>

        {/* Cost (if applicable) */}
        {booking.totalCost > 0 && (
          <View className="mx-4 bg-white rounded-2xl p-5 mb-4 border border-gray-100">
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-lg mb-3">
              Cost
            </Text>
            <View className="flex-row justify-between items-center bg-gray-50 rounded-lg p-3">
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-700">
                Total Cost
              </Text>
              <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-lg text-green-600">
                ৳{booking.totalCost.toFixed(2)}
              </Text>
            </View>
          </View>
        )}

        {/* Approval Details (if approved) */}
        {booking.approvedBy && (
          <View className="mx-4 bg-white rounded-2xl p-5 mb-4 border border-green-200 bg-green-50">
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-green-900 text-lg mb-3">
              Approval Details
            </Text>
            <View className="mb-2">
              <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-green-800 text-sm">
                Approved by
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-green-700">
                {booking.approvedBy.adminName}
              </Text>
            </View>
            {booking.approvedBy.remarks && (
              <View>
                <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-green-800 text-sm">
                  Remarks
                </Text>
                <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-green-700">
                  {booking.approvedBy.remarks}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Cancel Button */}
        {(booking.status === 'Pending' || booking.status === 'Approved') && (
          <View className="mx-4 mb-6">
            <TouchableOpacity
              className="bg-red-600 rounded-xl py-4 items-center flex-row justify-center gap-2"
              onPress={handleCancelBooking}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={20} color="white" />
                  <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-white text-lg">
                    Cancel Booking
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
