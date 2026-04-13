import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 32px padding total + 16px gap

const links = [
  { id: 1, title: 'Upcoming Events', icon: 'event', iconLib: 'MaterialIcons', color: '#097C87', bg: '#E6F4F1' },
  { id: 2, title: 'My Tickets', icon: 'ticket-alt', iconLib: 'FontAwesome5', color: '#FCA47C', bg: '#FFF1E8' },
  { id: 3, title: 'Host Event', icon: 'add-circle', iconLib: 'MaterialIcons', color: '#23CED9', bg: '#E4F9FA' },
  { id: 4, title: 'Clubs & Societies', icon: 'people', iconLib: 'Ionicons', color: '#F9D779', bg: '#FFFCE8' },
];

export default function QuickLinks() {
  return (
    <View className="mb-2">
      <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-xl text-[#097C87] mb-4 px-1 tracking-tight">
        Quick Access
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {links.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={{ width: cardWidth, borderWidth: 1, borderColor: '#F3F4F6' }} 
            className="bg-white p-5 rounded-2xl shadow-sm mb-4 items-center justify-center elevation-2"
          >
            <View style={{ backgroundColor: item.bg }} className="p-4 rounded-full mb-3 shadow-sm items-center justify-center">
              {item.iconLib === 'Ionicons' && <Ionicons name={item.icon} size={28} color={item.color} />}
              {item.iconLib === 'MaterialIcons' && <MaterialIcons name={item.icon} size={28} color={item.color} />}
              {item.iconLib === 'FontAwesome5' && <FontAwesome5 name={item.icon} size={22} color={item.color} />}
            </View>
            <Text style={{ fontFamily: 'Poppins_700Bold', color: '#2d3748' }} className="text-center text-[13px] tracking-wide">
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
