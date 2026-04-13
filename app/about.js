import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Platform, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} className="bg-white">
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      
      {/* Custom Header matching the theme */}
      <View style={{ 
        backgroundColor: '#0E3B6E', 
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5
      }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 20 }}>
          About Us
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' }}>
        
        {/* Mission / Intro Section */}
        <View style={{ width: '100%', alignItems: 'center', marginBottom: 32 }}>
          <View style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 50, 
            padding: 16, 
            marginBottom: 16,
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}>
            <Ionicons name="school" size={56} color="#E86F21" />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 28 }}>Eventify</Text>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#E86F21', fontSize: 28 }}>JnU</Text>
          </View>
          <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 10 }}>
            EventifyJNU is a Jagannath University-based event and volunteering management platform designed to connect students, streamline campus activities, and build a stronger community.
          </Text>
        </View>

        {/* Features Section */}
        <View style={{ width: '100%', marginBottom: 32 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 20, marginBottom: 16, textAlign: 'center' }}>
            Special Features
          </Text>
          
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
            <View style={{ backgroundColor: '#0E3B6E', padding: 12, borderRadius: 12, marginRight: 16 }}>
              <Ionicons name="calendar" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#1F2937', fontSize: 15, marginBottom: 4 }}>Seamless Event Hosting</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13 }}>Plan and discover campus events in one place.</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
            <View style={{ backgroundColor: '#E86F21', padding: 12, borderRadius: 12, marginRight: 16 }}>
              <Ionicons name="people" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#1F2937', fontSize: 15, marginBottom: 4 }}>Smart Volunteering</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13 }}>Easily find volunteering opportunities & track hours.</Text>
            </View>
          </View>

          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 }}>
            <View style={{ backgroundColor: '#0E3B6E', padding: 12, borderRadius: 12, marginRight: 16 }}>
              <Ionicons name="business" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#1F2937', fontSize: 15, marginBottom: 4 }}>Room Analytics</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13 }}>Live checks for room availability & booking requests.</Text>
            </View>
          </View>
        </View>

        {/* Founders Section */}
        <View style={{ width: '100%', marginBottom: 20 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 20, marginBottom: 20, textAlign: 'center' }}>
            Meet Our Founders
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            {/* Founder 1 */}
            <View style={{ width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center', elevation: 4, shadowColor: '#0E3B6E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5 }}>
              <Image 
                source={require('../assets/images/founder1.jpg')} 
                style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12, borderWidth: 3, borderColor: '#E86F21' }}
                resizeMode="cover"
              />
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#0E3B6E', fontSize: 14, textAlign: 'center', marginBottom: 2 }}>Aziz Ullah Tarek</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#E86F21', fontSize: 12, textAlign: 'center' }}>Co-Founder</Text>
            </View>

            {/* Founder 2 */}
            <View style={{ width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, alignItems: 'center', elevation: 4, shadowColor: '#0E3B6E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 5 }}>
              <Image 
                source={require('../assets/images/founder2.jpg')} 
                style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12, borderWidth: 3, borderColor: '#0E3B6E' }}
                resizeMode="cover"
              />
              <Text style={{ fontFamily: 'Poppins_700Bold', color: '#0E3B6E', fontSize: 14, textAlign: 'center', marginBottom: 2 }}>Ritu Akter</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#E86F21', fontSize: 12, textAlign: 'center' }}>Co-Founder</Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: 'center', opacity: 0.6, marginBottom: 10 }}>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#9CA3AF' }}>
            © 2026 EventifyJnU. All rights reserved.
          </Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}
