import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeCard() {
  return (
    <View style={{ backgroundColor: '#097C87' }} className="p-6 rounded-3xl shadow-md mb-6 mt-2 relative overflow-hidden">
      {/* Decorative colored blobs behind the text for flair based on theme */}
      <View style={{ backgroundColor: '#23CED9', opacity: 0.2 }} className="absolute -top-10 -right-10 w-40 h-40 rounded-full" />
      <View style={{ backgroundColor: '#A1CCA6', opacity: 0.15 }} className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" />

      <Text style={{ fontFamily: 'Montserrat_700Bold' }} className="text-2xl text-white mb-2 z-10">
        Welcome to Eventify!
      </Text>
      <Text style={{ fontFamily: 'Poppins_400Regular' }} className="text-white opacity-90 mb-6 text-sm z-10 leading-relaxed">
        Your ultimate campus event management platform at JnU. Discover, join, and host.
      </Text>

      <TouchableOpacity 
        style={{ backgroundColor: '#FCA47C' }} 
        className="py-3.5 rounded-xl mb-3 flex-row justify-center items-center shadow-sm z-10"
      >
        <Ionicons name="log-in-outline" size={20} color="white" className="mr-2" />
        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-white text-base ml-2 tracking-wide">
          Login to Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ backgroundColor: '#rgba(255,255,255,0.15)', borderColor: '#F9D779' }} 
        className="border py-3.5 rounded-xl flex-row justify-center items-center z-10"
      >
        <Ionicons name="person-add" size={18} color="#F9D779" className="mr-2" />
        <Text style={{ fontFamily: 'Poppins_700Bold' }} className="text-[#F9D779] text-base ml-2 tracking-wide">
          Register as New User
        </Text>
      </TouchableOpacity>
    </View>
  );
}
