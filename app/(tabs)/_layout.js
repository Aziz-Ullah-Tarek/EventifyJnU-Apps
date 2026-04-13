import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Platform, View, Text } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: '#F8F9FA' }}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0E3B6E',
          elevation: 0, 
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleAlign: 'center',
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF', letterSpacing: 0.5 }}>Eventify</Text>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#E86F21', letterSpacing: 0.5 }}>JNU</Text>
          </View>
        ),
        headerLeft: () => (
          <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => router.push('/menu')}>
            <Ionicons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={{ flexDirection: 'row', marginRight: 16, alignItems: 'center' }}>
            <TouchableOpacity style={{ marginLeft: 8 }}>
              <View>
                <Ionicons name="notifications" size={24} color="#FFFFFF" />
                <View style={{ position: 'absolute', top: 0, right: 2, backgroundColor: '#E83F3F', width: 10, height: 10, borderRadius: 5 }} />
              </View>
            </TouchableOpacity>
          </View>
        ),
        tabBarStyle: { 
          backgroundColor: '#FFFFFF',
          borderTopWidth: 2,
          borderTopColor: '#0E3B6E',
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
          paddingTop: 12,
        },
        tabBarActiveTintColor: '#0E3B6E',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: {
          fontFamily: 'Montserrat_700Bold',
          fontSize: 12,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={26} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="login" 
        options={{ 
          title: 'Login', 
          tabBarLabel: 'Login',
          href: '/login',
          tabBarIcon: ({ color, size }) => <Ionicons name="log-in-outline" size={28} color={color} />
        }} 
      />
      <Tabs.Screen 
        name="register" 
        options={{ 
          title: 'Register', 
          tabBarLabel: 'Register',
          href: '/register',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={26} color={color} />
        }} 
      />
    </Tabs>
  );
}
