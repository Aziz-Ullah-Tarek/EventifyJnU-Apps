import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ backgroundColor: '#F8F9FA' }} className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40, alignItems: 'center' }}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      
      {/* Central Logo Area */}
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginTop: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, position: 'relative' }}>
          <View style={{ position: 'relative', width: 80, height: 100, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="location" size={90} color="#0E3B6E" />
            <View style={{ position: 'absolute', top: 22, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 3 }}>
              <Ionicons name="business" size={20} color="#E86F21" />
            </View>
          </View>
          <Ionicons name="calendar-outline" size={50} color="#E86F21" style={{ marginLeft: -10, marginTop: -20 }} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#0E3B6E' }}>
            Eventify
          </Text>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#E86F21' }}>
            JNU
          </Text>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', color: '#374151', fontSize: 13, marginTop: 2 }}>
          Empowering Campus Events
        </Text>
      </View>

      {/* Grid Menu Area */}
      <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        {/* Events Button */}
        <TouchableOpacity 
          onPress={() => router.push('/events')}
          style={{ width: '48%', height: 160, backgroundColor: '#0E3B6E', borderRadius: 16, marginBottom: 16, padding: 16, position: 'relative' }}
          className="shadow-sm"
        >
          <Ionicons name="calendar-outline" size={32} color="#FFFFFF" style={{ position: 'absolute', top: 16, left: 16 }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>
              Events
            </Text>
          </View>
        </TouchableOpacity>

        {/* Volunteer Button */}
        <TouchableOpacity 
          onPress={() => router.push('/volunteer')}
          style={{ width: '48%', height: 160, backgroundColor: '#D95E16', borderRadius: 16, marginBottom: 16, padding: 16, position: 'relative' }}
          className="shadow-sm"
        >
          <Ionicons name="hand-right" size={32} color="#FFFFFF" style={{ position: 'absolute', top: 16, left: 16 }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>
              Volunteer
            </Text>
          </View>
        </TouchableOpacity>

        {/* Room Booking Button */}
        <TouchableOpacity 
          onPress={() => router.push('/room-booking')}
          style={{ width: '48%', height: 160, backgroundColor: '#0A2A50', borderRadius: 16, marginBottom: 16, padding: 16, position: 'relative' }}
          className="shadow-sm"
        >
          <Ionicons name="business" size={32} color="#FFFFFF" style={{ position: 'absolute', top: 16, left: 16 }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 15, textAlign: 'center' }}>
              Room Booking
            </Text>
          </View>
        </TouchableOpacity>

        {/* About Button */}
        <TouchableOpacity 
          onPress={() => router.push('/about')}
          style={{ width: '48%', height: 160, backgroundColor: '#E86F21', borderRadius: 16, marginBottom: 16, padding: 16, position: 'relative' }}
          className="shadow-sm"
        >
          <Ionicons name="information-circle-outline" size={32} color="#FFFFFF" style={{ position: 'absolute', top: 16, left: 16 }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>
              About Us
            </Text>
          </View>
        </TouchableOpacity>

      </View>
      
    </ScrollView>
  );
}
