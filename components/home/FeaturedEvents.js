import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const upcomingEvents = [
  { id: '1', title: 'Tech Symposium 2026', date: 'April 20, 2026', type: 'Tech', color: '#23CED9' },
  { id: '2', title: 'Annual Cultural Fest', date: 'May 5, 2026', type: 'Culture', color: '#FCA47C' },
  { id: '3', title: 'StartUp Pitch Deck', date: 'May 15, 2026', type: 'Business', color: '#F9D779' },
];

export default function FeaturedEvents() {
  return (
    <View className="mt-4">
      <View className="flex-row justify-between items-center mb-4 px-1">
        <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-[#097C87] tracking-tight">
          Trending Events
        </Text>
        <TouchableOpacity>
          <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-[#FCA47C] text-sm">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
        {upcomingEvents.map((event, index) => (
          <TouchableOpacity 
            key={event.id}
            style={{ width: 220, marginLeft: index === 0 ? 0 : 16 }}
            className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex-col"
          >
            <View style={{ backgroundColor: event.color, alignSelf: 'flex-start' }} className="px-3 py-1 rounded-full mb-3 shadow-sm">
              <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-[10px] tracking-widest uppercase">
                {event.type}
              </Text>
            </View>

            <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-[#2d3748] text-base mb-2 px-1" numberOfLines={2}>
              {event.title}
            </Text>

            <View className="flex-row items-center mt-auto pt-2 px-1">
              <MaterialIcons name="event-note" size={16} color="#A1CCA6" />
              <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-gray-500 text-[12px] ml-1">
                {event.date}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
