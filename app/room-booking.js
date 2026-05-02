import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert, FlatList, Modal, Platform, Image, KeyboardAvoidingView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const PRIMARY_COLOR = '#0E3B6E';
const SECONDARY_COLOR = '#4a90e2';
const ACCENT_COLOR = '#f59e0b';
const SUCCESS_COLOR = '#10b981';

export default function RoomBookingScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingTitle, setBookingTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('Academic Class');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showPurposePicker, setShowPurposePicker] = useState(false);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date(Date.now() + 3600000));
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const purposes = ['Academic Class', 'Seminar', 'Workshop', 'Meeting', 'Events & Gala', 'Examination', 'Other'];

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;
    return rooms.filter(room => 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms`);
      const data = await response.json();
      setRooms(data);
      setLoading(false);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load rooms' });
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bookingTitle.trim()) newErrors.bookingTitle = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!selectedRoom) newErrors.selectedRoom = 'Please select a room';
    if (!expectedAttendees || isNaN(expectedAttendees) || parseInt(expectedAttendees) < 1) {
      newErrors.expectedAttendees = 'Valid number of attendees required';
    }
    if (selectedRoom && parseInt(expectedAttendees) > selectedRoom.capacity) {
      newErrors.expectedAttendees = `Exceeds room capacity (${selectedRoom.capacity})`;
    }
    if (startDateTime >= endDateTime) {
      newErrors.dateTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookRoom = async () => {
    if (!validateForm()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fix the errors' });
      return;
    }

    try {
      setSubmitting(true);
      
      const bookingData = {
        room: selectedRoom._id,
        bookingTitle: bookingTitle.trim(),
        description: description.trim(),
        purpose,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        expectedAttendees: parseInt(expectedAttendees),
        specialRequirements: specialRequirements ? specialRequirements.split(',').map(s => s.trim()) : [],
        bookedBy: {
          userId: 'user123', // Get from auth
          name: 'User Name', // Get from auth
          email: 'user@jnu.ac.bd', // Get from auth
          department: 'CSE'
        }
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const booking = await response.json();
        Toast.show({ 
          type: 'success', 
          text1: 'Success! 🎉', 
          text2: 'Room booking request submitted for approval' 
        });
        
        // Reset form
        setBookingTitle('');
        setDescription('');
        setPurpose('Academic Class');
        setSelectedRoom(null);
        setExpectedAttendees('');
        setSpecialRequirements('');
        setStartDateTime(new Date());
        setEndDateTime(new Date(Date.now() + 3600000));
        setErrors({});

        // Navigate to booking details
        setTimeout(() => {
          router.push({
            pathname: '/bookings/[id]',
            params: { id: booking._id }
          });
        }, 1500);
      } else {
        const error = await response.json();
        Toast.show({ 
          type: 'error', 
          text1: 'Booking Failed', 
          text2: error.message || 'Unable to book room' 
        });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDateChange = (event, selectedDate, dateType) => {
    if (selectedDate) {
      if (dateType === 'start') {
        setStartDateTime(selectedDate);
        setShowStartDatePicker(false);
      } else {
        setEndDateTime(selectedDate);
        setShowEndDatePicker(false);
      }
    }
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="mt-4 text-gray-500 font-medium">Loading spaces...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-100 px-4 py-4 pb-4">
        <View className="flex-row items-center justify-between mb-1">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={28} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-gray-900">
            Room Booking
          </Text>
          <TouchableOpacity className="w-10 h-10 items-center justify-center -mr-2">
            <Ionicons name="notifications-outline" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-xs text-center">
          Reserve the perfect space for your academic needs
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          {/* Progress Indicator - Slimmer version */}
          <View className="flex-row items-center justify-between mb-6 px-6">
            <View className="items-center">
              <View className={`w-7 h-7 rounded-full items-center justify-center ${selectedRoom ? 'bg-green-500' : 'bg-blue-600'}`}>
                {selectedRoom ? <Ionicons name="checkmark" size={14} color="white" /> : <Text className="text-white font-bold text-[10px]">1</Text>}
              </View>
              <Text className="text-[10px] mt-1 font-bold text-gray-500 uppercase tracking-tighter">Space</Text>
            </View>
            <View className={`h-[1px] flex-1 mt-[-10px] mx-1 ${selectedRoom ? 'bg-green-500' : 'bg-gray-200'}`} />
            
            <View className="items-center">
              <View className={`w-7 h-7 rounded-full items-center justify-center ${bookingTitle && description ? 'bg-green-500' : (selectedRoom ? 'bg-blue-600' : 'bg-gray-200')}`}>
                {bookingTitle && description ? <Ionicons name="checkmark" size={14} color="white" /> : <Text className={`${selectedRoom ? 'text-white' : 'text-gray-400'} font-bold text-[10px]`}>2</Text>}
              </View>
              <Text className="text-[10px] mt-1 font-bold text-gray-400 uppercase tracking-tighter">Details</Text>
            </View>
            <View className={`h-[1px] flex-1 mt-[-10px] mx-1 ${bookingTitle && description ? 'bg-green-500' : 'bg-gray-200'}`} />

            <View className="items-center">
              <View className="w-7 h-7 rounded-full items-center justify-center bg-gray-200">
                <Text className="text-gray-400 font-bold text-[10px]">3</Text>
              </View>
              <Text className="text-[10px] mt-1 font-bold text-gray-400 uppercase tracking-tighter">Review</Text>
            </View>
          </View>

          {/* Room Selection Card */}
          <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-4">
              <View className="w-9 h-9 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <MaterialCommunityIcons name="office-building-marker-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-900 text-base">
                Venue
              </Text>
            </View>

            <TouchableOpacity 
              className={`border rounded-2xl px-4 py-3.5 flex-row items-center justify-between ${
                errors.selectedRoom ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-slate-50'
              }`}
              onPress={() => setShowRoomPicker(true)}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons name="search" size={18} color={selectedRoom ? PRIMARY_COLOR : "#94a3b8"} style={{ marginRight: 10 }} />
                <Text 
                  numberOfLines={1}
                  style={{ fontFamily: 'Poppins_400Regular' }} 
                  className={selectedRoom ? 'text-gray-900 font-medium text-sm' : 'text-slate-400 text-sm'}
                >
                  {selectedRoom ? selectedRoom.name : 'Choose a space...'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
            </TouchableOpacity>
            
            {errors.selectedRoom && (
              <Text className="text-red-500 text-[10px] mt-1.5 ml-1" style={{ fontFamily: 'Poppins_400Regular' }}>
                {errors.selectedRoom}
              </Text>
            )}

            {selectedRoom && (
              <View className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 flex-row items-center">
                <Image 
                  source={{ uri: selectedRoom.imageUrl }} 
                  className="w-14 h-14 rounded-lg" 
                />
                <View className="ml-3 flex-1">
                  <Text style={{ fontFamily: 'Poppins_600SemiBold' }} className="text-gray-900 text-xs">{selectedRoom.name}</Text>
                  <View className="flex-row items-center mt-0.5">
                    <Ionicons name="location" size={10} color="#64748b" />
                    <Text className="text-slate-500 text-[10px] ml-1">{selectedRoom.location}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedRoom(null)} className="p-2">
                  <Ionicons name="close-circle" size={20} color="#cbd5e1" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Schedule Selection Container */}
          <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
            <View className="flex-row items-center mb-4">
              <View className="w-9 h-9 bg-orange-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="calendar-outline" size={20} color={ACCENT_COLOR} />
              </View>
              <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-900 text-base">
                Date & Time
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between">
              {/* Start */}
              <TouchableOpacity
                className="w-[100%] border border-slate-200 rounded-2xl px-4 py-3 mb-3 flex-row items-center bg-slate-50"
                onPress={() => setShowStartDatePicker(true)}
              >
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={16} color={PRIMARY_COLOR} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 text-[9px] font-bold uppercase">From</Text>
                  <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-gray-800 text-xs">
                    {formatDateTime(startDateTime)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
              </TouchableOpacity>

              {/* End */}
              <TouchableOpacity
                className="w-[100%] border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center bg-slate-50"
                onPress={() => setShowEndDatePicker(true)}
              >
                <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={16} color={ACCENT_COLOR} />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-400 text-[9px] font-bold uppercase">Until</Text>
                  <Text style={{ fontFamily: 'Poppins_500Medium' }} className="text-gray-800 text-xs">
                    {formatDateTime(endDateTime)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {errors.dateTime && (
              <View className="bg-red-50 p-2 rounded-xl mt-3 flex-row items-center border border-red-100">
                <Ionicons name="alert-circle" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                <Text className="text-red-500 text-[10px] font-medium">{errors.dateTime}</Text>
              </View>
            )}
          </View>

          {/* Purpose & Attendees - Compact */}
          <View className="flex-row mb-4 justify-between">
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 w-[48%]"
              onPress={() => setShowPurposePicker(true)}
            >
              <Text className="text-slate-400 text-[9px] uppercase font-bold mb-1 tracking-wider">Purpose</Text>
              <View className="flex-row items-center justify-between">
                <Text numberOfLines={1} style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-800 text-xs flex-1">
                  {purpose}
                </Text>
                <Ionicons name="apps-outline" size={14} color={PRIMARY_COLOR} />
              </View>
            </TouchableOpacity>

            <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 w-[48%]">
              <Text className="text-slate-400 text-[9px] uppercase font-bold mb-1 tracking-wider">Attendees</Text>
              <View className="flex-row items-center">
                <TextInput
                  placeholder="Count"
                  keyboardType="number-pad"
                  value={expectedAttendees}
                  onChangeText={(text) => { setExpectedAttendees(text); if (errors.expectedAttendees) setErrors({...errors, expectedAttendees: ''}) }}
                  style={{ fontFamily: 'Montserrat_600SemiBold', padding: 0 }}
                  className="text-gray-800 text-xs flex-1"
                />
                <Ionicons name="people-outline" size={14} color={PRIMARY_COLOR} />
              </View>
              {errors.expectedAttendees && <Text className="text-red-500 text-[8px] mt-1">{errors.expectedAttendees}</Text>}
            </View>
          </View>

          {/* Detailed Description Section */}
          <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-slate-100">
            <Text style={{ fontFamily: 'Montserrat_600SemiBold' }} className="text-gray-900 text-base mb-4">
              Booking Brief
            </Text>

            <View className="mb-3">
              <TextInput
                placeholder="Booking Title (e.g. Lab Session)"
                placeholderTextColor="#94a3b8"
                value={bookingTitle}
                onChangeText={(text) => { setBookingTitle(text); if (errors.bookingTitle) setErrors({...errors, bookingTitle: ''}) }}
                className={`rounded-xl px-4 py-3 text-sm ${
                  errors.bookingTitle ? 'border border-red-500 bg-red-50' : 'bg-slate-50 border border-slate-100'
                }`}
                style={{ fontFamily: 'Poppins_400Regular' }}
              />
            </View>

            <TextInput
              placeholder="Requirements (Projector, AC, etc.)"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={(text) => { setDescription(text); if (errors.description) setErrors({...errors, description: ''}) }}
              multiline
              numberOfLines={3}
              className={`rounded-xl px-4 py-3 min-h-[80px] text-sm ${
                errors.description ? 'border border-red-500 bg-red-50' : 'bg-slate-50 border border-slate-100'
              }`}
              style={{ fontFamily: 'Poppins_400Regular', textAlignVertical: 'top' }}
            />
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleBookRoom}
            disabled={submitting}
            className="mb-4"
          >
            <LinearGradient
              colors={[PRIMARY_COLOR, '#1e40af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className={`py-4 rounded-2xl items-center justify-center flex-row shadow-lg shadow-blue-900/20`}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-white text-base mr-2">
                    Submit Request
                  </Text>
                  <Ionicons name="paper-plane" size={18} color="white" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Room Picker Modal Enhanced - Mobile optimized */}
      <Modal visible={showRoomPicker} transparent animationType="slide">
        <View className="flex-1 bg-black/60">
          <TouchableOpacity 
            className="h-[15%]" 
            activeOpacity={1} 
            onPress={() => setShowRoomPicker(false)} 
          />
          <View className="bg-white rounded-t-[32px] flex-1 shadow-2xl">
            <View className="px-6 py-4 border-b border-slate-50">
              <View className="w-12 h-1 bg-slate-200 rounded-full self-center mb-4" />
              <View className="flex-row items-center justify-between mb-4">
                <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-gray-900">
                  Select Space
                </Text>
                <TouchableOpacity 
                   onPress={() => setShowRoomPicker(false)}
                   className="w-8 h-8 items-center justify-center"
                >
                  <Ionicons name="close-circle" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              
              <View className="bg-slate-100 rounded-xl px-4 py-1.5 flex-row items-center">
                <Ionicons name="search" size={16} color="#94a3b8" />
                <TextInput 
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-2 h-9 text-sm font-medium"
                />
              </View>
            </View>
            
            <FlatList
              data={filteredRooms}
              contentContainerStyle={{ padding: 16 }}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  className={`mb-4 rounded-2xl overflow-hidden bg-white border ${
                    selectedRoom?._id === item._id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100 shadow-sm'
                  }`}
                  onPress={() => {
                    setSelectedRoom(item);
                    setShowRoomPicker(false);
                  }}
                >
                  <View className="flex-row p-3">
                    <Image source={{ uri: item.imageUrl }} className="w-20 h-20 rounded-xl" />
                    <View className="flex-1 ml-3 justify-center">
                        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-gray-900 text-sm">
                          {item.name}
                        </Text>
                        <View className="flex-row items-center mt-0.5">
                          <Ionicons name="location-outline" size={10} color="#64748b" />
                          <Text className="text-slate-500 text-[10px] ml-1">{item.location}</Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                           <View className="bg-slate-100 px-2 py-0.5 rounded-md mr-2 flex-row items-center">
                              <Ionicons name="people" size={10} color="#64748b" style={{marginRight: 2}} />
                              <Text className="text-[10px] font-bold text-slate-600">{item.capacity}</Text>
                           </View>
                           <View className={`px-2 py-0.5 rounded-md ${item.isAvailable ? 'bg-green-100' : 'bg-red-100'}`}>
                             <Text className={`text-[9px] font-bold ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                               {item.isAvailable ? 'AVAILABLE' : 'BUSY'}
                             </Text>
                           </View>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" className="self-center" />
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="items-center py-10">
                  <Ionicons name="search-outline" size={40} color="#cbd5e1" />
                  <Text className="text-slate-400 mt-2 text-xs font-medium text-center">No venues found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Purpose Picker Modal Enhanced - Standard List */}
      <Modal visible={showPurposePicker} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center p-6">
          <View className="bg-white rounded-[32px] w-full max-h-[80%] overflow-hidden">
            <View className="p-6 border-b border-slate-50 flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-lg text-gray-900">
                Choose Purpose
              </Text>
              <TouchableOpacity 
                onPress={() => setShowPurposePicker(false)}
                className="w-8 h-8 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <ScrollView className="px-4 py-2" showsVerticalScrollIndicator={false}>
              {purposes.map((item) => (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.6}
                  className={`mb-2 p-4 rounded-xl flex-row items-center ${
                    purpose === item ? 'bg-blue-600' : 'bg-slate-50'
                  }`}
                  onPress={() => {
                    setPurpose(item);
                    setShowPurposePicker(false);
                  }}
                >
                  <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${
                    purpose === item ? 'bg-white/20' : 'bg-white'
                  }`}>
                    {item === 'Academic Class' && <Ionicons name="book" size={18} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                    {item === 'Seminar' && <MaterialCommunityIcons name="presentation" size={20} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                    {item === 'Workshop' && <MaterialCommunityIcons name="tools" size={18} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                    {item === 'Meeting' && <Ionicons name="people" size={20} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                    {item === 'Events & Gala' && <MaterialCommunityIcons name="party-popper" size={20} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                    {item === 'Examination' && <MaterialCommunityIcons name="file-document-edit" size={20} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                    {item === 'Other' && <Ionicons name="ellipsis-horizontal-circle" size={20} color={purpose === item ? 'white' : PRIMARY_COLOR} />}
                  </View>
                  <Text style={{ fontFamily: 'Poppins_500Medium' }} className={`text-sm ${purpose === item ? 'text-white' : 'text-gray-900'}`}>
                    {item}
                  </Text>
                  {purpose === item && <Ionicons name="checkmark-circle" size={20} color="white" className="ml-auto" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDateTime}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, 'start')}
          minimumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDateTime}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => handleDateChange(event, date, 'end')}
          minimumDate={startDateTime}
        />
      )}
    </SafeAreaView>
  );
}
