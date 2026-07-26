import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform, Dimensions, Animated, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [notices, setNotices] = useState([]);
  const [noticeIndex, setNoticeIndex] = useState(0);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const noticeScrollX = useRef(new Animated.Value(0)).current;
  const noticeTimer = useRef(null);

  useEffect(() => {
    fetchEvents();
    fetchNotices();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
      if (noticeTimer.current) clearInterval(noticeTimer.current);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.log('Fetch error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Could not load events. Make sure backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/jnu-notices`);
      const data = await response.json();
      if (data.success && data.notices.length > 0) {
        setNotices(data.notices);
      }
    } catch (error) {
      console.log('Notice fetch error:', error);
    }
  };

  // Auto-slide notices every 4 seconds
  useEffect(() => {
    if (notices.length === 0) return;
    noticeTimer.current = setInterval(() => {
      setNoticeIndex((prev) => (prev + 1) % notices.length);
    }, 4000);
    return () => {
      if (noticeTimer.current) clearInterval(noticeTimer.current);
    };
  }, [notices.length]);

  const handleNoticePress = async (notice) => {
    try {
      if (notice.pdfLinks && notice.pdfLinks.length > 0) {
        const pdfUrl = notice.pdfLinks[0].url;
        const supported = await Linking.canOpenURL(pdfUrl);
        if (supported) {
          await Linking.openURL(pdfUrl);
        }
      } else if (notice.detailUrl) {
        const supported = await Linking.canOpenURL(notice.detailUrl);
        if (supported) {
          await Linking.openURL(notice.detailUrl);
        }
      }
    } catch (error) {
      console.log('Error opening notice:', error);
    }
  };

  const featuredEvents = events.filter(e => e.featured);
  const otherEvents = events.filter(e => !e.featured);

  return (
    <ScrollView style={{ backgroundColor: '#F8F9FA' }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      {/* ===== GRADIENT HERO HEADER ===== */}
      <LinearGradient colors={['#0E3B6E', '#1A4F8B', '#2563A0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 26, letterSpacing: 0.5 }}>
              Eventify<Text style={{ color: '#F59E0B' }}>JnU</Text>
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: -2 }}>
              Jagannath University
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tickets')} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="ticket" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/dashboard')} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Banner */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#F59E0B', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>
              {events.length} Events{events.length > 0 ? ` • ${events.filter(e => e.featured).length} Featured` : ''}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>
              Discover, register, and participate!
            </Text>
          </View>
          <TouchableOpacity onPress={fetchEvents} style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ===== JNU OFFICIAL NOTICES SLIDER ===== */}
      {notices.length > 0 && (
        <View style={{ marginTop: 20, marginBottom: 20, paddingHorizontal: 20 }}>
          {/* Section Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#E86F21', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Ionicons name="newspaper" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 16 }}>
                📢 JnU Official Notices
              </Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 11 }}>
                Latest from Jagannath University
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 8 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 5 }} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#6B7280', fontSize: 11 }}>Live</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAllNotices(!showAllNotices)}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}
            >
              <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#4F46E5', fontSize: 11, marginRight: 4 }}>
                {showAllNotices ? 'Collapse' : 'See All'}
              </Text>
              <Ionicons name={showAllNotices ? 'chevron-up' : 'chevron-down'} size={14} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* Notice Card Slider */}
          <View style={{ position: 'relative' }}>
            <Animated.View
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: '#0E3B6E',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 16,
                elevation: 8,
                borderWidth: 1,
                borderColor: '#F0F0F0',
              }}
            >
              {/* Card Header Gradient */}
              <LinearGradient
                colors={['#0E3B6E', '#1E5A9E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="ribbon" size={16} color="#F59E0B" style={{ marginRight: 8 }} />
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 12, flex: 1 }}>
                  Official Notice #{noticeIndex + 1} of {notices.length}
                </Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontFamily: 'Poppins_700Bold', color: '#FFFFFF', fontSize: 10 }}>
                    {notices[noticeIndex]?.date || ''}
                  </Text>
                </View>
              </LinearGradient>

              {/* Card Body */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleNoticePress(notices[noticeIndex])}
                style={{ padding: 16 }}
              >
                <Text
                  style={{
                    fontFamily: 'Poppins_600SemiBold',
                    color: '#1F2937',
                    fontSize: 14,
                    lineHeight: 21,
                    marginBottom: 12,
                  }}
                  numberOfLines={3}
                >
                  {notices[noticeIndex]?.title || 'Loading...'}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                      <Ionicons name="document-text" size={14} color="#D97706" />
                    </View>
                    <Text style={{ fontFamily: 'Poppins_500Medium', color: '#D97706', fontSize: 12 }}>
                      View Official PDF
                    </Text>
                  </View>
                  <View style={{ backgroundColor: '#E86F21', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 11 }}>
                      Open ↗
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Bottom Progress Dots */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, backgroundColor: '#F9FAFB' }}>
                {notices.slice(0, 10).map((_, i) => (
                  <TouchableOpacity key={i} onPress={() => setNoticeIndex(i)} activeOpacity={0.7}>
                    <View
                      style={{
                        width: i === noticeIndex ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === noticeIndex ? '#0E3B6E' : '#D1D5DB',
                        marginHorizontal: 3,
                      }}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </View>

          {/* See All - Expanded List */}
          {showAllNotices && (
            <View style={{ marginTop: 12 }}>
              {notices.map((notice, index) => (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleNoticePress(notice)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                  }}
                >
                  {/* Number Badge */}
                  <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: index === noticeIndex ? '#0E3B6E' : '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: index === noticeIndex ? '#FFFFFF' : '#6B7280', fontSize: 13 }}>
                      {index + 1}
                    </Text>
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins_600SemiBold',
                        color: '#1F2937',
                        fontSize: 13,
                        lineHeight: 19,
                      }}
                      numberOfLines={2}
                    >
                      {notice.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name="calendar-outline" size={11} color="#9CA3AF" style={{ marginRight: 4 }} />
                      <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 11 }}>
                        {notice.date || ''}
                      </Text>
                      {notice.pdfLinks && notice.pdfLinks.length > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Ionicons name="document-text" size={10} color="#D97706" style={{ marginRight: 3 }} />
                          <Text style={{ fontFamily: 'Poppins_700Bold', color: '#D97706', fontSize: 9 }}>PDF</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color="#D1D5DB" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#E86F21" />
          <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>Loading events...</Text>
        </View>
      ) : (
        <>
          {/* ===== FEATURED EVENTS - HERO SLIDER ===== */}
          {featuredEvents.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 18 }}>
                  🔥 Featured Events
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
                  <Text style={{ fontFamily: 'Poppins_500Medium', color: '#E86F21', fontSize: 13 }}>See All</Text>
                </TouchableOpacity>
              </View>

              <Animated.ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 20}
                decelerationRate="fast"
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
                scrollEventThrottle={16}
              >
                {featuredEvents.map((event, index) => {
                  const inputRange = [
                    (index - 1) * (CARD_WIDTH + 20),
                    index * (CARD_WIDTH + 20),
                    (index + 1) * (CARD_WIDTH + 20)
                  ];
                  const scale = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.9, 1, 0.9],
                    extrapolate: 'clamp'
                  });
                  return (
                    <Animated.View key={event._id} style={{ width: CARD_WIDTH, marginRight: 20, transform: [{ scale }] }}>
                      <TouchableOpacity
                        activeOpacity={0.95}
                        onPress={() => router.push(`/event/${event._id}`)}
                        style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 }}
                      >
                        <Image source={{ uri: event.imageUrl || 'https://via.placeholder.com/600x300' }} style={{ width: '100%', height: 200 }} resizeMode="cover" />
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, backgroundColor: 'rgba(0,0,0,0.25)' }} />
                        
                        {/* Badges */}
                        <View style={{ position: 'absolute', top: 16, left: 16, flexDirection: 'row', gap: 8 }}>
                          <View style={{ backgroundColor: '#E86F21', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 }}>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 11, letterSpacing: 0.5 }}>{event.category}</Text>
                          </View>
                          {event.isPaid && (
                            <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 }}>
                              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFD700', fontSize: 11 }}>৳{event.price}</Text>
                            </View>
                          )}
                        </View>

                        {!event.isPaid && (
                          <View style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 }}>
                            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 11 }}>FREE</Text>
                          </View>
                        )}

                        <View style={{ padding: 16 }}>
                          <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 18, marginBottom: 4 }} numberOfLines={1}>
                            {event.title}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 12, marginLeft: 6 }}>
                              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="location-outline" size={14} color="#6B7280" />
                            <Text style={{ fontFamily: 'Poppins_400Regular', color: '#6B7280', fontSize: 12, marginLeft: 6 }} numberOfLines={1}>
                              {event.location}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </Animated.ScrollView>
            </View>
          )}

          {/* ===== ALL UPCOMING EVENTS ===== */}
          <View style={{ marginBottom: 20, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 18 }}>
                📅 Upcoming Events
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#0E3B6E', fontSize: 13 }}>See All →</Text>
              </TouchableOpacity>
            </View>

            {events.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' }}>
                <Ionicons name="calendar-clear-outline" size={48} color="#D1D5DB" />
                <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', marginTop: 8 }}>No upcoming events right now.</Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 10 }}
                decelerationRate="fast"
                snapToInterval={190}
              >
                {events.slice(0, 10).map((event) => (
                  <TouchableOpacity
                    key={event._id}
                    activeOpacity={0.85}
                    onPress={() => router.push(`/event/${event._id}`)}
                    style={{ width: 175, marginRight: 14, backgroundColor: '#FFFFFF', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 }}
                  >
                    <Image source={{ uri: event.imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80' }} style={{ width: '100%', height: 110 }} resizeMode="cover" />
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: event.isPaid ? '#0E3B6E' : '#10B981', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 10 }}>{event.isPaid ? `৳${event.price}` : 'FREE'}</Text>
                    </View>
                    <View style={{ padding: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={{ backgroundColor: '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontFamily: 'Poppins_600SemiBold', color: '#6B7280', fontSize: 9 }}>{event.category || 'Event'}</Text>
                        </View>
                      </View>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 13, lineHeight: 17 }} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                        <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                        <Text style={{ fontFamily: 'Poppins_400Regular', color: '#9CA3AF', fontSize: 10, marginLeft: 4 }}>
                          {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </>
      )}

      {/* ===== QUICK ACTIONS ===== */}
      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#1F2937', fontSize: 18, marginBottom: 14 }}>
          ⚡ Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={() => router.push('/volunteer')} style={{ width: '48%', height: 110, backgroundColor: '#0E3B6E', borderRadius: 18, marginBottom: 14, padding: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#0E3B6E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="hand-right" size={28} color="#FFFFFF" />
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, marginTop: 8 }}>Volunteer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/room-booking')} style={{ width: '48%', height: 110, backgroundColor: '#E86F21', borderRadius: 18, marginBottom: 14, padding: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#E86F21', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="business" size={28} color="#FFFFFF" />
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, marginTop: 8 }}>Room Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/cse-calendar')} style={{ width: '48%', height: 110, backgroundColor: '#059669', borderRadius: 18, marginBottom: 14, padding: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="calendar" size={28} color="#FFFFFF" />
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, marginTop: 8 }}>CSE Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/about')} style={{ width: '48%', height: 110, backgroundColor: '#7C3AED', borderRadius: 18, marginBottom: 14, padding: 18, justifyContent: 'center', alignItems: 'center', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <Ionicons name="information-circle" size={28} color="#FFFFFF" />
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14, marginTop: 8 }}>About Us</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}
