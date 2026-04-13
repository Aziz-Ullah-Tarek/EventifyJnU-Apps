import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EventsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#0E3B6E' }}>
          Events
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 20 }}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
        <Ionicons name="calendar" size={72} color="#0E3B6E" style={{ marginBottom: 16 }} />
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#0E3B6E', marginBottom: 8, textAlign: 'center' }}>
          Events will coming soon
        </Text>
        <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', textAlign: 'center', fontSize: 14 }}>
          We are preparing a great list of campus events for you. Stay tuned!
        </Text>
      </View>
    </SafeAreaView>
  );
}