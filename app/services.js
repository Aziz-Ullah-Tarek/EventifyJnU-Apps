import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Load the JSON data
import servicesData from '../constants/services.json';

export default function ServicesScreen() {
  const router = useRouter();
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  const toggleExpand = (id) => {
    if (expandedServiceId === id) {
      setExpandedServiceId(null);
    } else {
      setExpandedServiceId(id);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      
      {/* Header */}
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
          Our Services
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <View style={{ backgroundColor: '#E86F21', borderRadius: 40, padding: 16, marginBottom: 16, elevation: 4, shadowColor: '#E86F21', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}>
            <Ionicons name="layers-outline" size={48} color="#FFFFFF" />
          </View>
          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#0E3B6E', fontSize: 24, textAlign: 'center' }}>
            What We Offer
          </Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', textAlign: 'center', marginTop: 8, fontSize: 13 }}>
            Explore the core services EventifyJNU provides to elevate your campus events.
          </Text>
        </View>

        {servicesData.map((service) => {
          const isExpanded = expandedServiceId === service.id;

          return (
            <View 
              key={service.id}
              style={{ 
                backgroundColor: '#FFFFFF', 
                borderRadius: 16, 
                marginBottom: 16, 
                elevation: 2, 
                shadowColor: '#000', 
                shadowOpacity: 0.05, 
                shadowRadius: 4,
                overflow: 'hidden'
              }}
            >
              {/* Category Header (Clickable) */}
              <TouchableOpacity 
                onPress={() => toggleExpand(service.id)}
                style={{ 
                  padding: 20, 
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <View style={{ backgroundColor: '#F3F4F6', padding: 14, borderRadius: 12, marginRight: 16 }}>
                  <Ionicons name={service.icon} size={30} color="#0E3B6E" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 17, marginBottom: 4 }}>
                    {service.title}
                  </Text>
                  {!isExpanded && (
                    <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 13 }} numberOfLines={1}>
                      {service.description}
                    </Text>
                  )}
                </View>
                <View style={{ 
                  backgroundColor: isExpanded ? '#0E3B6E' : '#F3F4F6',
                  width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center'
                }}>
                  <Ionicons name={isExpanded ? "remove" : "add"} size={22} color={isExpanded ? "#FFFFFF" : "#0E3B6E"} />
                </View>
              </TouchableOpacity>

              {/* Expandable Details Area */}
              {isExpanded && (
                <View style={{ paddingHorizontal: 20, paddingBottom: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16 }}>
                  <Text style={{ fontFamily: 'Poppins_400Regular', color: '#4B5563', fontSize: 14, marginBottom: 20, lineHeight: 22 }}>
                    {service.description}
                  </Text>

                  <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 15, marginBottom: 12 }}>
                    Available Options & Pricing
                  </Text>

                  {service.details.map((item, index) => (
                    <View 
                      key={index} 
                      style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        backgroundColor: '#F9FAFB', 
                        padding: 16, 
                        borderRadius: 12, 
                        marginBottom: 10,
                        borderWidth: 1,
                        borderColor: '#E5E7EB'
                      }}
                    >
                      <Text style={{ fontFamily: 'Poppins_700Bold', color: '#374151', fontSize: 13, flex: 1, paddingRight: 10 }}>
                        {item.item}
                      </Text>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#E86F21', fontSize: 14 }}>
                        {item.price}
                      </Text>
                    </View>
                  ))}
                  
                  <TouchableOpacity 
                    style={{ backgroundColor: '#0E3B6E', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 12 }}
                    onPress={() => alert('Proceeding to booking flow...')}
                  >
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 15 }}>Select Service</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

      </ScrollView>
    </SafeAreaView>
  );
}