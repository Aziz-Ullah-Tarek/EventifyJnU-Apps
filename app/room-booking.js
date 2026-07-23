import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, FlatList, Modal, Platform, Image, KeyboardAvoidingView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
// Using custom in-app date/time picker modal instead of native DateTimePicker
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/firebase';

const { width } = Dimensions.get('window');
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const ROOM_ICONS = {
  auditorium: 'theater-masks',
  lab: 'desktop-classic',
  classroom: 'school',
  conference: 'briefcase',
  outdoor: 'tree',
  seminar: 'microphone-variant',
  office: 'office-building'
};

const ROOM_COLORS = {
  auditorium: '#8B5CF6',
  lab: '#3B82F6',
  classroom: '#10B981',
  conference: '#F59E0B',
  outdoor: '#22C55E',
  seminar: '#EC4899',
  office: '#6B7280'
};

export default function RoomBookingScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [clubName, setClubName] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [eventName, setEventName] = useState('');
  const [expectedAttendees, setExpectedAttendees] = useState('');
  const [purpose, setPurpose] = useState('');
  const [specialReq, setSpecialReq] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  // Date/Time state - user must select manually
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState(null); // 'start' or 'end'
  const [timePickerTarget, setTimePickerTarget] = useState(null); // 'start' or 'end'
  const [tempDate, setTempDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [errors, setErrors] = useState({});
  const [successModal, setSuccessModal] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setOrganizerName(u.displayName || u.email?.split('@')[0] || '');
        setOrganizerEmail(u.email || '');
      }
    });
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

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;
    return rooms.filter(room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.type || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', hour12: true
    });
  };

  // Open date picker modal
  const openDatePicker = (target) => {
    setDatePickerTarget(target);
    const current = target === 'start' ? startDate : endDate;
    setTempDate(current || new Date());
    setShowDatePicker(true);
  };

  // Open time picker modal
  const openTimePicker = (target) => {
    setTimePickerTarget(target);
    const current = target === 'start' ? startDate : endDate;
    setTempDate(current || new Date());
    setShowTimePicker(true);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date) => {
    setTempDate(date);
  };

  // Confirm date selection
  const confirmDate = () => {
    const target = datePickerTarget;
    const current = target === 'start' ? startDate : endDate;
    const newDate = new Date(tempDate);
    if (current) {
      newDate.setHours(current.getHours(), current.getMinutes(), current.getSeconds());
    } else {
      newDate.setHours(9, 0, 0, 0);
    }
    if (target === 'start') {
      setStartDate(newDate);
      // Open time picker automatically after date
      setTimeout(() => {
        setShowDatePicker(false);
        setTimePickerTarget('start');
        setTempDate(newDate);
        setShowTimePicker(true);
      }, 300);
    } else {
      setEndDate(newDate);
      setTimeout(() => {
        setShowDatePicker(false);
        setTimePickerTarget('end');
        setTempDate(newDate);
        setShowTimePicker(true);
      }, 300);
    }
  };

  // Handle time selection (updates temp date, modal stays open until confirm)
  const handleTimeSelect = (hours, minutes) => {
    const d = new Date(tempDate);
    d.setHours(hours, minutes, 0, 0);
    setTempDate(d);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!clubName.trim()) newErrors.clubName = 'Club name is required';
    if (!organizerName.trim()) newErrors.organizerName = 'Name is required';
    if (!organizerEmail.trim()) newErrors.organizerEmail = 'Email is required';
    if (!eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!selectedRoom) newErrors.selectedRoom = 'Please select a room';
    if (!purpose.trim()) newErrors.purpose = 'Purpose is required';
    if (!startDate) newErrors.dateTime = 'Please select start date & time';
    else if (!endDate) newErrors.dateTime = 'Please select end date & time';
    else if (startDate >= endDate) newErrors.dateTime = 'End time must be after start time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all required fields' });
      return;
    }
    if (!user) {
      Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login to book a room' });
      router.push('/login');
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        room: selectedRoom._id,
        bookingTitle: `${eventName.trim()} - ${clubName.trim()}`,
        description: `Event: ${eventName.trim()} | Club: ${clubName.trim()} | Purpose: ${purpose.trim()}`,
        purpose: purpose.trim(),
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        expectedAttendees: parseInt(expectedAttendees) || 1,
        specialRequirements: specialReq.trim() ? [specialReq.trim()] : [],
        bookedBy: {
          userId: user.uid,
          name: organizerName.trim(),
          email: organizerEmail.trim(),
          department: clubName.trim()
        }
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();
      if (response.ok) {
        setBookingResult(result);
        setSuccessModal(true);
        Toast.show({ type: 'success', text1: 'Booking Submitted!', text2: 'Waiting for admin approval' });
      } else {
        Toast.show({ type: 'error', text1: 'Booking Failed', text2: result.message });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const getRoomTypeColor = (type) => ROOM_COLORS[type] || '#6B7280';
  const getRoomIcon = (type) => ROOM_ICONS[type] || 'domain';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={{ backgroundColor: '#0E3B6E', paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 20 }}>Room Booking</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Reserve campus facilities</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          
          {/* Step 1: Select Room */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 16, marginBottom: 12 }}>
              1️⃣ Select a Room
            </Text>
            
            {loading ? (
              <View style={{ alignItems: 'center', padding: 30 }}>
                <ActivityIndicator size="large" color="#0E3B6E" />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 10 }}>
                {rooms.map((room) => {
                  const isSelected = selectedRoom?._id === room._id;
                  const typeColor = getRoomTypeColor(room.type);
                  return (
                    <TouchableOpacity
                      key={room._id}
                      onPress={() => setSelectedRoom(room)}
                      activeOpacity={0.85}
                      style={{
                        width: 200, marginRight: 12, backgroundColor: '#FFFFFF', borderRadius: 16,
                        overflow: 'hidden', borderWidth: 2,
                        borderColor: isSelected ? typeColor : '#E5E7EB',
                        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08, shadowRadius: 8, elevation: isSelected ? 6 : 2
                      }}
                    >
                      <Image
                        source={{ uri: room.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80' }}
                        style={{ width: '100%', height: 110 }} resizeMode="cover"
                      />
                      {isSelected && (
                        <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: typeColor, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 10 }}>SELECTED</Text>
                        </View>
                      )}
                      <View style={{ padding: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <MaterialCommunityIcons name={getRoomIcon(room.type)} size={14} color={typeColor} />
                          <Text style={{ fontFamily: 'Poppins_600SemiBold', color: typeColor, fontSize: 10, marginLeft: 4, textTransform: 'uppercase' }}>
                            {room.type || 'ROOM'}
                          </Text>
                        </View>
                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 14 }} numberOfLines={1}>{room.name}</Text>
                        <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 11, marginTop: 2 }}>
                          👥 {room.capacity} seats • ৳{room.pricePerHour}/hr
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            {errors.selectedRoom && <Text style={{ fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.selectedRoom}</Text>}

            {/* Selected Room Details */}
            {selectedRoom && (
              <View style={{ marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: getRoomTypeColor(selectedRoom.type) }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 16 }}>{selectedRoom.name}</Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 12, marginTop: 2 }}>
                      📍 {selectedRoom.location} {selectedRoom.floor ? `(${selectedRoom.floor})` : ''}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 18 }}>৳{selectedRoom.pricePerHour}<Text style={{ fontSize: 12, color: '#6B7280' }}>/hr</Text></Text>
                </View>
                <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 13, marginTop: 8, lineHeight: 18 }}>{selectedRoom.description}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                  {selectedRoom.amenities?.map((a, i) => (
                    <View key={i} style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 11 }}>{a}</Text>
                    </View>
                  ))}
                </View>
                {selectedRoom.rules?.length > 0 && (
                  <View style={{ marginTop: 10, backgroundColor: '#FEF2F2', padding: 10, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#DC2626', fontSize: 11 }}>⚠️ Rules</Text>
                    {selectedRoom.rules.map((rule, i) => (
                      <Text key={i} style={{ fontFamily: 'Poppins_400Regular', color: '#7F1D1D', fontSize: 11, marginTop: 2 }}>• {rule}</Text>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Step 2: Club & Organizer Info */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 16, marginBottom: 12 }}>
              2️⃣ Club & Organizer Info
            </Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 }}>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Club / Organization Name *</Text>
                <TextInput
                  style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.clubName ? '#EF4444' : '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                  placeholder="e.g. CSE Club, Robotics Society"
                  value={clubName}
                  onChangeText={setClubName}
                />
                {errors.clubName && <Text style={{ fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.clubName}</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, marginBottom: 14 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Organizer Name *</Text>
                  <TextInput
                    style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.organizerName ? '#EF4444' : '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                    placeholder="Your name"
                    value={organizerName}
                    onChangeText={setOrganizerName}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 14 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Phone</Text>
                  <TextInput
                    style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                    value={organizerPhone}
                    onChangeText={setOrganizerPhone}
                  />
                </View>
              </View>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Email *</Text>
                <TextInput
                  style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.organizerEmail ? '#EF4444' : '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={organizerEmail}
                  onChangeText={setOrganizerEmail}
                />
                {errors.organizerEmail && <Text style={{ fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.organizerEmail}</Text>}
              </View>
            </View>
          </View>

          {/* Step 3: Event Details */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 16, marginBottom: 12 }}>
              3️⃣ Event Details
            </Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 }}>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Event Name *</Text>
                <TextInput
                  style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.eventName ? '#EF4444' : '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                  placeholder="e.g. Tech Workshop 2026"
                  value={eventName}
                  onChangeText={setEventName}
                />
                {errors.eventName && <Text style={{ fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.eventName}</Text>}
              </View>
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Purpose *</Text>
                <TextInput
                  style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.purpose ? '#EF4444' : '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14, minHeight: 60, textAlignVertical: 'top' }}
                  placeholder="Describe the purpose of this booking..."
                  multiline
                  numberOfLines={3}
                  value={purpose}
                  onChangeText={setPurpose}
                />
                {errors.purpose && <Text style={{ fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 11, marginTop: 3 }}>{errors.purpose}</Text>}
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1, marginBottom: 14 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Expected Attendees</Text>
                  <TextInput
                    style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                    placeholder="Number"
                    keyboardType="number-pad"
                    value={expectedAttendees}
                    onChangeText={setExpectedAttendees}
                  />
                </View>
                <View style={{ flex: 1, marginBottom: 14 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 6 }}>Special Requirements</Text>
                  <TextInput
                    style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                    placeholder="e.g. Sound system"
                    value={specialReq}
                    onChangeText={setSpecialReq}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Step 4: Date & Time Selection */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 16, marginBottom: 12 }}>
              4️⃣ Select Date & Time
            </Text>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16 }}>
              
              {/* Start Date/Time */}
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 8 }}>Start Date & Time *</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <TouchableOpacity
                  onPress={() => openDatePicker('start')}
                  style={{ flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.dateTime ? '#EF4444' : (!startDate ? '#F59E0B' : '#E5E7EB'), borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Ionicons name="calendar" size={18} color="#0E3B6E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    {startDate ? (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#1F2937', fontSize: 13 }}>{formatDate(startDate)}</Text>
                    ) : (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 12 }}>Select Date</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openTimePicker('start')}
                  style={{ flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.dateTime ? '#EF4444' : (!startDate ? '#F59E0B' : '#E5E7EB'), borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Ionicons name="time-outline" size={18} color="#0E3B6E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    {startDate ? (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#1F2937', fontSize: 13 }}>{formatTime(startDate)}</Text>
                    ) : (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 12 }}>Select Time</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* End Date/Time */}
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#374151', fontSize: 13, marginBottom: 8 }}>End Date & Time *</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => openDatePicker('end')}
                  style={{ flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.dateTime ? '#EF4444' : (!endDate ? '#F59E0B' : '#E5E7EB'), borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Ionicons name="calendar" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    {endDate ? (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#1F2937', fontSize: 13 }}>{formatDate(endDate)}</Text>
                    ) : (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 12 }}>Select Date</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => openTimePicker('end')}
                  style={{ flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: errors.dateTime ? '#EF4444' : (!endDate ? '#F59E0B' : '#E5E7EB'), borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                    <Ionicons name="time-outline" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    {endDate ? (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#1F2937', fontSize: 13 }}>{formatTime(endDate)}</Text>
                    ) : (
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 12 }}>Select Time</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {errors.dateTime && <Text style={{ fontFamily: 'Poppins_400Regular', color: '#EF4444', fontSize: 11, marginTop: 6 }}>{errors.dateTime}</Text>}

              {/* Duration & Cost Summary */}
              {selectedRoom && startDate && endDate && endDate > startDate ? (
                <View style={{ marginTop: 16, backgroundColor: '#F0F9FF', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontFamily: 'Poppins_400Regular', color: '#0369A1', fontSize: 12 }}>Duration</Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 18 }}>
                      {Math.round((endDate - startDate) / (1000 * 60 * 60) * 10) / 10} hrs
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', color: '#0369A1', fontSize: 12 }}>Estimated Cost</Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 18 }}>
                      ৳{Math.round((endDate - startDate) / (1000 * 60 * 60) * selectedRoom.pricePerHour)}
                    </Text>
                  </View>
                </View>
              ) : selectedRoom ? (
                <View style={{ marginTop: 16, backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14 }}>
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#92400E', fontSize: 13, textAlign: 'center' }}>
                    👆 Please select start & end date/time above to see duration and cost
                  </Text>
                </View>
              ) : null}

            </View>
          </View>

          {/* ===== COMPACT DATE PICKER POPUP ===== */}
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, width: Math.min(width - 40, 340), padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 10 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937' }}>
                    {datePickerTarget === 'start' ? 'Select Start Date' : 'Select End Date'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Month/Year Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <TouchableOpacity
                    onPress={() => { const d = new Date(tempDate); d.setMonth(d.getMonth() - 1); setTempDate(d); }}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="chevron-back" size={20} color="#0E3B6E" />
                  </TouchableOpacity>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#1F2937' }}>
                    {tempDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity
                    onPress={() => { const d = new Date(tempDate); d.setMonth(d.getMonth() + 1); setTempDate(d); }}
                    style={{ padding: 6 }}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#0E3B6E" />
                  </TouchableOpacity>
                </View>

                {/* Day Headers */}
                <View style={{ flexDirection: 'row', marginBottom: 4 }}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: '#6B7280' }}>{day}</Text>
                    </View>
                  ))}
                </View>

                {/* Calendar Grid */}
                {(() => {
                  const year = tempDate.getFullYear();
                  const month = tempDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const today = new Date();
                  const minDate = datePickerTarget === 'start' ? new Date() : (startDate || new Date());
                  const rows = [];
                  let cells = [];
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(<View key={`e-${i}`} style={{ flex: 1 }} />);
                  }
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateObj = new Date(year, month, day);
                    const isToday = dateObj.toDateString() === today.toDateString();
                    const isSelected = dateObj.toDateString() === tempDate.toDateString();
                    const isPast = dateObj < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                    cells.push(
                      <TouchableOpacity
                        key={day}
                        onPress={() => !isPast && handleDateSelect(dateObj)}
                        style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}
                        disabled={isPast}
                      >
                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isSelected ? '#0E3B6E' : (isToday ? '#EEF2FF' : 'transparent'), alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: isSelected ? '#FFFFFF' : (isPast ? '#D1D5DB' : '#1F2937') }}>{day}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                    if (cells.length === 7) { rows.push(<View key={`r-${rows.length}`} style={{ flexDirection: 'row', marginBottom: 2 }}>{cells}</View>); cells = []; }
                  }
                  if (cells.length > 0) rows.push(<View key={`r-${rows.length}`} style={{ flexDirection: 'row', marginBottom: 2 }}>{cells}</View>);
                  return rows;
                })()}

                {/* Confirm */}
                <TouchableOpacity onPress={confirmDate} style={{ backgroundColor: '#0E3B6E', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ===== COMPACT TIME PICKER POPUP ===== */}
          <Modal visible={showTimePicker} transparent animationType="fade">
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, width: Math.min(width - 40, 320), padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 10 }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937' }}>
                    {timePickerTarget === 'start' ? 'Select Start Time' : 'Select End Time'}
                  </Text>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Ionicons name="close" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Time Display */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <View style={{ backgroundColor: '#EEF2FF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', marginHorizontal: 4 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 28, color: '#0E3B6E' }}>{String(tempDate.getHours()).padStart(2, '0')}</Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#6B7280' }}>Hour</Text>
                  </View>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 28, color: '#1F2937', marginBottom: 12 }}>:</Text>
                  <View style={{ backgroundColor: '#FEF3C7', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, alignItems: 'center', marginHorizontal: 4 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 28, color: '#D97706' }}>{String(tempDate.getMinutes()).padStart(2, '0')}</Text>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#6B7280' }}>Min</Text>
                  </View>
                </View>

                {/* Hour Picker */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#374151', marginBottom: 6 }}>Hour</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                    const isSelected = tempDate.getHours() === hour;
                    return (
                      <TouchableOpacity key={hour} onPress={() => { const d = new Date(tempDate); d.setHours(hour); handleTimeSelect(hour, d.getMinutes()); }}
                        style={{ paddingHorizontal: 14, paddingVertical: 8, marginRight: 6, borderRadius: 8, backgroundColor: isSelected ? '#0E3B6E' : '#F3F4F6' }}>
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: isSelected ? '#FFFFFF' : '#4B5563' }}>{String(hour).padStart(2, '0')}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Minute Picker */}
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#374151', marginBottom: 6 }}>Minute</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((min) => {
                    const isSelected = tempDate.getMinutes() === min;
                    return (
                      <TouchableOpacity key={min} onPress={() => { const d = new Date(tempDate); d.setMinutes(min); handleTimeSelect(d.getHours(), min); }}
                        style={{ paddingHorizontal: 14, paddingVertical: 8, marginRight: 6, borderRadius: 8, backgroundColor: isSelected ? '#D97706' : '#F3F4F6' }}>
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: isSelected ? '#FFFFFF' : '#4B5563' }}>{String(min).padStart(2, '0')}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Confirm */}
                <TouchableOpacity
                  onPress={() => {
                    const target = timePickerTarget;
                    const newDate = new Date(tempDate);
                    if (target === 'start') setStartDate(newDate);
                    else setEndDate(newDate);
                    setShowTimePicker(false);
                  }}
                  style={{ backgroundColor: '#0E3B6E', paddingVertical: 12, borderRadius: 10, alignItems: 'center' }}
                >
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>Set Time</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>

        {/* Bottom Submit Button */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: '#0E3B6E', paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>Submit Booking Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Modal */}
        <Modal visible={successModal} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, width: '100%', maxWidth: 360, padding: 24, alignItems: 'center' }}>
              <View style={{ backgroundColor: '#D1FAE5', borderRadius: 50, width: 64, height: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name="checkmark-circle" size={44} color="#10B981" />
              </View>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#1F2937', marginBottom: 4 }}>Booking Submitted!</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16 }}>
                Your room booking request has been sent to the admin for approval.
              </Text>

              {bookingResult && (
                <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, width: '100%', marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' }}>Room</Text>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 13, color: '#1F2937' }}>{bookingResult.room?.name || selectedRoom?.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' }}>Date</Text>
                    <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 13, color: '#1F2937' }}>{formatDate(startDate)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' }}>Status</Text>
                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6 }}>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#D97706' }}>PENDING</Text>
                    </View>
                  </View>
                </View>
              )}

              <TouchableOpacity
                onPress={() => { setSuccessModal(false); router.push('/dashboard'); }}
                style={{ backgroundColor: '#0E3B6E', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' }}
              >
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 15 }}>View Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setSuccessModal(false); router.back(); }}
                style={{ marginTop: 10 }}
              >
                <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 14 }}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
