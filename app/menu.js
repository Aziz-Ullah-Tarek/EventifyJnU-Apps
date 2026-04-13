import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0E3B6E' }}>
      
      {/* Header Close Button */}
      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start' }}>
          <Ionicons name="close" size={36} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}>
        
        {/* User Identity Area (Placeholder) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E86F21', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <Ionicons name="person-outline" size={30} color="#FFFFFF" />
          </View>
          <View>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 24 }}>Welcome</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#A0AEC0', fontSize: 14 }}>To EventifyJNU</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#FFFFFF', opacity: 0.1, marginBottom: 30 }} />

        {/* Login Menu Item */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18 }}
          onPress={() => { router.back(); router.push('/login'); }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <Ionicons name="log-in-outline" size={20} color="#E86F21" />
          </View>
          <Text style={{ fontFamily: 'Poppins_700Bold', color: '#FFFFFF', fontSize: 18 }}>Log In</Text>
          <Ionicons name="chevron-forward" size={20} color="#A0AEC0" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Register Menu Item */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18 }}
          onPress={() => { router.back(); router.push('/register'); }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <Ionicons name="person-add-outline" size={20} color="#E86F21" />
          </View>
          <Text style={{ fontFamily: 'Poppins_700Bold', color: '#FFFFFF', fontSize: 18 }}>Create Account</Text>
          <Ionicons name="chevron-forward" size={20} color="#A0AEC0" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* About Us Menu Item */}
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18 }}
          onPress={() => { router.back(); router.push('/about'); }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
            <Ionicons name="information-circle-outline" size={20} color="#E86F21" />
          </View>
          <Text style={{ fontFamily: 'Poppins_700Bold', color: '#FFFFFF', fontSize: 18 }}>About Us</Text>
          <Ionicons name="chevron-forward" size={20} color="#A0AEC0" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}