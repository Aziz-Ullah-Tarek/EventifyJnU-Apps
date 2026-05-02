import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Image, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Dummy Data
const MOCK_EVENTS = [
  { id: '1', title: 'Tech Symposium 2026', category: 'Tech', date: 'Oct 15, 2026 • 10:00 AM', venue: 'Main Auditorium', price: 'Free', organizer: 'CSE Dept', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&q=80' },
  { id: '2', title: 'Annual Cultural Fest', category: 'Culture', date: 'Nov 02, 2026 • 5:00 PM', venue: 'Open Air Theatre', price: '$15.00', organizer: 'Arts Club', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80' },
  { id: '3', title: 'StartUp Pitch Deck', category: 'Business', date: 'Oct 20, 2026 • 1:00 PM', venue: 'Business Hall B', price: 'Free', organizer: 'Entrepreneurship Cell', image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500&q=80' },
  { id: '4', title: 'Inter-Department Basketball', category: 'Sports', date: 'Oct 25, 2026 • 8:00 AM', venue: 'University Gym', price: 'Free', organizer: 'Sports Committee', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&q=80' },
  { id: '5', title: 'AI & Data Science Workshop', category: 'Tech', date: 'Nov 10, 2026 • 9:00 AM', venue: 'Computer Lab 1', price: '$5.00', organizer: 'AI Society', image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=500&q=80' },
];

const CATEGORIES = ['All', 'Tech', 'Culture', 'Business', 'Sports'];

export default function EventsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredEvents = MOCK_EVENTS.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Ionicons name="arrow-back" size={28} color="#0E3B6E" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#0E3B6E', flex: 1 }}>
          Discover Events
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search events, organizers..."
            placeholderTextColor="#9CA3AF"
            style={{ flex: 1, marginLeft: 10, fontFamily: 'Poppins_400Regular', fontSize: 16, color: '#1F2937' }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setSearchQuery('')}>
               <Ionicons name="close-circle" size={20} color="#9CA3AF" />
             </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={{ backgroundColor: '#FFFFFF', paddingBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => setSelectedCategory(cat)}
              style={{
                backgroundColor: selectedCategory === cat ? '#0E3B6E' : '#F3F4F6',
                paddingHorizontal: 20,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 10,
                borderWidth: 1,
                borderColor: selectedCategory === cat ? '#0E3B6E' : '#E5E7EB'
              }}>
              <Text style={{ 
                fontFamily: selectedCategory === cat ? 'Montserrat_600SemiBold' : 'Montserrat_500Medium', 
                color: selectedCategory === cat ? '#FFFFFF' : '#4B5563',
                fontSize: 14
              }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Event List */}
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1F2937', marginBottom: 16 }}>
          {selectedCategory === 'All' ? 'All Events' : `${selectedCategory} Events`}
        </Text>

        {filteredEvents.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
            <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6B7280', marginTop: 12, fontSize: 16 }}>No events found.</Text>
          </View>
        ) : (
          filteredEvents.map(event => (
            <TouchableOpacity 
              key={event.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/event/${event.id}`)}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                overflow: 'hidden'
              }}
            >
              <Image source={{ uri: event.image }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
              
              <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#E86F21', fontSize: 14 }}>{event.price}</Text>
              </View>

              <View style={{ padding: 16 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1F2937', marginBottom: 6 }} numberOfLines={2}>
                  {event.title}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="time-outline" size={16} color="#6B7280" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13, marginLeft: 6 }}>{event.date}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="location-outline" size={16} color="#6B7280" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13, marginLeft: 6 }}>{event.venue}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="person-circle-outline" size={20} color="#0E3B6E" />
                    <Text style={{ fontFamily: 'Poppins_500Medium', color: '#0E3B6E', fontSize: 13, marginLeft: 6 }}>{event.organizer}</Text>
                  </View>
                  <Text style={{ fontFamily: 'Poppins_500Medium', color: '#E86F21', fontSize: 14 }}>View Details →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
