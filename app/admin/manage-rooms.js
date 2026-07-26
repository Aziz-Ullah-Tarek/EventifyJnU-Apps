import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, ActivityIndicator, Alert, Platform, Modal, KeyboardAvoidingView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const COLORS = {
  primary: '#0E3B6E', primaryLight: '#1A4F8B',
  accent: '#F97316', accentLight: '#FB923C',
  success: '#10B981', successLight: '#D1FAE5',
  danger: '#EF4444', dangerLight: '#FEE2E2',
  warning: '#F59E0B', warningLight: '#FEF3C7',
  info: '#3B82F6', infoLight: '#DBEAFE',
  purple: '#8B5CF6', purpleLight: '#EDE9FE',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' }
};

const ROOM_TYPES = [
  { value: 'auditorium', label: 'Auditorium', icon: 'theater-masks' },
  { value: 'lab', label: 'Lab', icon: 'desktop-classic' },
  { value: 'classroom', label: 'Classroom', icon: 'school' },
  { value: 'conference', label: 'Conference Room', icon: 'briefcase' },
  { value: 'outdoor', label: 'Outdoor', icon: 'tree' },
  { value: 'seminar', label: 'Seminar Hall', icon: 'microphone-variant' },
  { value: 'office', label: 'Office', icon: 'office-building' },
];

const RoomFormModal = ({ visible, onClose, onSubmit, initialData }) => {
  const isEdit = !!initialData;
  const [name, setName] = useState('');
  const [type, setType] = useState('classroom');
  const [location, setLocation] = useState('');
  const [floor, setFloor] = useState('');
  const [capacity, setCapacity] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setType(initialData.type || 'classroom');
      setLocation(initialData.location || '');
      setFloor(initialData.floor || '');
      setCapacity(String(initialData.capacity || ''));
      setPricePerHour(String(initialData.pricePerHour || ''));
      setDescription(initialData.description || '');
      setImageUrl(initialData.imageUrl || '');
      setContactInfo(initialData.contactInfo || '');
      setAmenitiesText((initialData.amenities || []).join('\n'));
      setRulesText((initialData.rules || []).join('\n'));
      setIsAvailable(initialData.isAvailable !== false);
    } else {
      setName(''); setType('classroom'); setLocation(''); setFloor('');
      setCapacity(''); setPricePerHour(''); setDescription(''); setImageUrl('');
      setContactInfo(''); setAmenitiesText(''); setRulesText('');
      setIsAvailable(true);
    }
  }, [initialData, visible]);

  const handleSubmit = async () => {
    if (!name.trim() || !location.trim()) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name and location are required' });
      return;
    }
    setSubmitting(true);
    const roomData = {
      name: name.trim(),
      type,
      location: location.trim(),
      floor: floor.trim(),
      capacity: parseInt(capacity) || 0,
      pricePerHour: parseInt(pricePerHour) || 0,
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      contactInfo: contactInfo.trim(),
      amenities: amenitiesText.split('\n').filter(a => a.trim()).map(a => a.trim()),
      rules: rulesText.split('\n').filter(r => r.trim()).map(r => r.trim()),
      isAvailable,
    };
    try {
      const url = isEdit
        ? `${API_BASE_URL}/rooms/${initialData._id}`
        : `${API_BASE_URL}/rooms`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (res.ok) {
        Toast.show({ type: 'success', text1: isEdit ? 'Room Updated' : 'Room Created', text2: `${name} has been saved.` });
        onClose(true);
      } else {
        const err = await res.json();
        Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Something went wrong' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => onClose(false)}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => onClose(false)} style={{ padding: 4 }}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFF' }}>
            {isEdit ? 'Edit Room' : 'Add New Room'}
          </Text>
          <View style={{ width: 32 }} />
        </LinearGradient>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {/* Name */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Room Name *</Text>
            <TextInput value={name} onChangeText={setName} placeholder="e.g. VC Conference Room"
              style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200], marginBottom: 16 }} />

            {/* Type */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Room Type</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {ROOM_TYPES.map(rt => (
                <TouchableOpacity key={rt.value} onPress={() => setType(rt.value)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: type === rt.value ? COLORS.primary : '#FFF', borderWidth: 1, borderColor: type === rt.value ? COLORS.primary : COLORS.gray[200] }}>
                  <Ionicons name={rt.icon} size={14} color={type === rt.value ? '#FFF' : COLORS.gray[500]} />
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 11, color: type === rt.value ? '#FFF' : COLORS.gray[600] }}>{rt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location & Floor */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 2 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Location *</Text>
                <TextInput value={location} onChangeText={setLocation} placeholder="e.g. Admin Building"
                  style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200] }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Floor</Text>
                <TextInput value={floor} onChangeText={setFloor} placeholder="e.g. 2nd"
                  style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200] }} />
              </View>
            </View>

            {/* Capacity & Price */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Capacity</Text>
                <TextInput value={capacity} onChangeText={setCapacity} placeholder="e.g. 50" keyboardType="numeric"
                  style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200] }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Price/Hour (৳)</Text>
                <TextInput value={pricePerHour} onChangeText={setPricePerHour} placeholder="e.g. 500" keyboardType="numeric"
                  style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200] }} />
              </View>
            </View>

            {/* Description */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="Describe the room..." multiline numberOfLines={3}
              style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200], minHeight: 80, textAlignVertical: 'top', marginBottom: 16 }} />

            {/* Image URL */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Image URL</Text>
            <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://..."
              style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200], marginBottom: 16 }} />

            {/* Contact Info */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Contact Info</Text>
            <TextInput value={contactInfo} onChangeText={setContactInfo} placeholder="e.g. Admin Office - Ext: 101"
              style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200], marginBottom: 16 }} />

            {/* Amenities (one per line) */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Amenities (one per line)</Text>
            <TextInput value={amenitiesText} onChangeText={setAmenitiesText} placeholder="AC&#10;WiFi&#10;Projector&#10;Smart TV" multiline numberOfLines={4}
              style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200], minHeight: 100, textAlignVertical: 'top', marginBottom: 16 }} />

            {/* Rules (one per line) */}
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700], marginBottom: 6 }}>Rules (one per line)</Text>
            <TextInput value={rulesText} onChangeText={setRulesText} placeholder="No food inside&#10;Book 3 days in advance" multiline numberOfLines={3}
              style={{ backgroundColor: '#FFF', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, borderWidth: 1, borderColor: COLORS.gray[200], minHeight: 80, textAlignVertical: 'top', marginBottom: 16 }} />

            {/* Available Switch */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.gray[200], marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name={isAvailable ? 'checkmark-circle' : 'close-circle'} size={22} color={isAvailable ? COLORS.success : COLORS.danger} />
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[700] }}>Room Available</Text>
              </View>
              <TouchableOpacity onPress={() => setIsAvailable(!isAvailable)}
                style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: isAvailable ? COLORS.success : COLORS.gray[300], padding: 3 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF', alignSelf: isAvailable ? 'flex-end' : 'flex-start' }} />
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity onPress={handleSubmit} disabled={submitting}
              style={{ backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}>
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#FFF' }}>
                  {isEdit ? 'Update Room' : 'Create Room'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const TypeBadge = ({ type }) => {
  const t = ROOM_TYPES.find(rt => rt.value === type) || { label: type, icon: 'business' };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.gray[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' }}>
      <Ionicons name={t.icon} size={12} color={COLORS.gray[500]} />
      <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 9, color: COLORS.gray[600] }}>{t.label}</Text>
    </View>
  );
};

export default function ManageRoomsScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load rooms' });
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;
    return rooms.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.type || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rooms, searchQuery]);

  const handleDelete = (room) => {
    Alert.alert('Delete Room', `Are you sure you want to delete "${room.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/rooms/${room._id}`, { method: 'DELETE' });
            if (res.ok) {
              Toast.show({ type: 'success', text1: 'Deleted', text2: `${room.name} has been deleted.` });
              fetchRooms();
            }
          } catch (error) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#FFFFFF' }}>Manage Rooms</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{rooms.length} room(s) available</Text>
          </View>
          <TouchableOpacity onPress={() => { setEditRoom(null); setShowForm(true); }}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#FFF' }}>Add Room</Text>
          </TouchableOpacity>
        </View>
        {/* Search */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.6)" />
          <TextInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search rooms..." placeholderTextColor="rgba(255,255,255,0.5)"
            style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#FFF' }} />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.6)" /></TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {filteredRooms.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Ionicons name="business-outline" size={60} color={COLORS.gray[300]} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: COLORS.gray[400], marginTop: 16 }}>
                {searchQuery ? 'No rooms match your search' : 'No rooms yet'}
              </Text>
              <TouchableOpacity onPress={() => { setEditRoom(null); setShowForm(true); }}
                style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, marginTop: 16 }}>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#FFF' }}>Add Your First Room</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredRooms.map(room => (
              <View key={room._id} style={{ backgroundColor: '#FFF', borderRadius: 20, marginBottom: 14, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray[100], shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
                {/* Header */}
                <View style={{ padding: 16, paddingBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>{room.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        <TypeBadge type={room.type} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: room.isAvailable ? COLORS.successLight : COLORS.dangerLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Ionicons name={room.isAvailable ? 'checkmark-circle' : 'close-circle'} size={10} color={room.isAvailable ? COLORS.success : COLORS.danger} />
                          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 9, color: room.isAvailable ? COLORS.success : COLORS.danger }}>
                            {room.isAvailable ? 'Available' : 'Unavailable'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Details */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="location" size={14} color={COLORS.gray[400]} />
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500] }}>{room.location}{room.floor ? ` (${room.floor})` : ''}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="people" size={14} color={COLORS.gray[400]} />
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500] }}>{room.capacity} people</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Ionicons name="cash" size={14} color={COLORS.gray[400]} />
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500] }}>৳{room.pricePerHour}/hr</Text>
                    </View>
                  </View>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                      {room.amenities.slice(0, 5).map((a, i) => (
                        <View key={i} style={{ backgroundColor: COLORS.infoLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9, color: COLORS.info }}>{a}</Text>
                        </View>
                      ))}
                      {room.amenities.length > 5 && (
                        <View style={{ backgroundColor: COLORS.gray[100], paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                          <Text style={{ fontFamily: 'Poppins_500Medium', fontSize: 9, color: COLORS.gray[500] }}>+{room.amenities.length - 5}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.gray[100] }}>
                  <TouchableOpacity onPress={() => { setEditRoom(room); setShowForm(true); }}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRightWidth: 1, borderRightColor: COLORS.gray[100] }}>
                    <Ionicons name="create-outline" size={16} color={COLORS.info} />
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.info }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(room)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 }}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.danger }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add/Edit Room Modal */}
      <RoomFormModal
        visible={showForm}
        initialData={editRoom}
        onClose={(refreshed) => { setShowForm(false); setEditRoom(null); if (refreshed) fetchRooms(); }}
      />
    </SafeAreaView>
  );
}
