import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Platform, RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/firebase';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const CATEGORY_COLORS = {
  Sports: '#EF4444',
  Cultural: '#F59E0B',
  Academic: '#3B82F6',
  Tech: '#8B5CF6',
  Social: '#10B981',
  Club: '#EC4899',
  Departmental: '#0E3B6E',
  Holiday: '#F97316',
  Other: '#6B7280',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CseCalendar() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const res = await fetch(`${API_BASE_URL}/users/${encodeURIComponent(currentUser.email)}`);
          if (res.ok) {
            const data = await res.json();
            setUserRole(data.role || 'student');
          }
        } catch (e) {}
      }
    });
    fetchEvents();
    return unsubscribe;
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/cse-calendar`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, []);

  const canEdit = userRole === 'admin' || userRole === 'organizer' || userRole === 'student';

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      const eDate = new Date(e.date);
      const eDateStr = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}-${String(eDate.getDate()).padStart(2, '0')}`;
      return eDateStr === dateStr;
    });
  };

  const handleDayPress = (day) => {
    if (!day) return;
    const dayEvents = getEventsForDate(day);
    setSelectedDate(day);
    setSelectedEvents(dayEvents);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedEvents([]);
  };

  const openAddModal = () => {
    router.push('/cse-calendar/add-event');
  };

  const openEditModal = (event) => {
    router.push(`/cse-calendar/edit-event?id=${event._id}`);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' }}>
        {/* Month Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={handlePrevMonth} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="chevron-back" size={22} color="#0E3B6E" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#1F2937' }}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="chevron-forward" size={22} color="#0E3B6E" />
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          {DAYS.map((day, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#94A3B8' }}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        {weeks.map((week, wIdx) => (
          <View key={wIdx} style={{ flexDirection: 'row' }}>
            {week.map((day, dIdx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day === todayDate && currentMonth === todayMonth && currentYear === todayYear;
              const isSelected = day === selectedDate;
              const hasEvents = dayEvents.length > 0;
              const eventColors = [...new Set(dayEvents.map(ev => ev.color || CATEGORY_COLORS[ev.category] || '#0E3B6E'))];
              const mainEventColor = eventColors[0] || '#0E3B6E';

              return (
                <TouchableOpacity
                  key={dIdx}
                  onPress={() => day && handleDayPress(day)}
                  disabled={!day}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 6,
                    marginVertical: 2,
                    backgroundColor: isSelected ? '#0E3B6E' : 'transparent',
                    borderRadius: 12,
                    position: 'relative',
                  }}
                >
                  {/* Date number */}
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: isSelected ? '#0E3B6E' : isToday ? '#EFF6FF' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: hasEvents && !isSelected && !isToday ? 2 : 0,
                    borderColor: hasEvents && !isSelected && !isToday ? mainEventColor : 'transparent',
                  }}>
                    <Text style={{
                      fontFamily: isToday ? 'Montserrat_700Bold' : 'Poppins_400Regular',
                      fontSize: 13,
                      color: isSelected ? '#FFFFFF' : isToday ? '#0E3B6E' : '#1F2937',
                    }}>
                      {day || ''}
                    </Text>
                  </View>

                  {/* Event indicator dots */}
                  {hasEvents && (
                    <View style={{ flexDirection: 'row', gap: 2, marginTop: 3 }}>
                      {dayEvents.slice(0, 3).map((ev, i) => (
                        <View key={i} style={{
                          width: 6, height: 6, borderRadius: 3,
                          backgroundColor: ev.color || CATEGORY_COLORS[ev.category] || '#0E3B6E',
                          borderWidth: isSelected ? 1 : 0,
                          borderColor: isSelected ? 'rgba(255,255,255,0.6)' : 'transparent',
                        }} />
                      ))}
                      {dayEvents.length > 3 && (
                        <Text style={{ fontSize: 7, color: isSelected ? 'rgba(255,255,255,0.7)' : mainEventColor, fontWeight: '700' }}>
                          +{dayEvents.length - 3}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Bottom accent bar for event dates */}
                  {hasEvents && !isSelected && (
                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 20,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: mainEventColor,
                      opacity: 0.6,
                    }} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderEventCard = (event, index) => {
    const catColor = CATEGORY_COLORS[event.category] || '#6B7280';
    const d = new Date(event.date);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    return (
      <TouchableOpacity
        key={event._id || index}
        onPress={() => canEdit && openEditModal(event)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#F1F5F9',
          borderLeftWidth: 4,
          borderLeftColor: catColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <View style={{ backgroundColor: `${catColor}20`, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 9, color: catColor }}>{event.category}</Text>
              </View>
              {event.createdByRole === 'student' && (
                <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 8, color: '#F59E0B' }}>STUDENT</Text>
                </View>
              )}
            </View>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#1F2937' }}>{event.title}</Text>
            {event.description ? (
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#64748B', marginTop: 2 }} numberOfLines={2}>{event.description}</Text>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#94A3B8' }}>{dateStr}</Text>
              </View>
              {event.time ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="time-outline" size={13} color="#94A3B8" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#94A3B8' }}>{event.time}</Text>
                </View>
              ) : null}
              {event.location ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location-outline" size={13} color="#94A3B8" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#94A3B8' }} numberOfLines={1}>{event.location}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#CBD5E1', marginTop: 4 }}>
              Added by: {event.createdBy || 'Unknown'}
            </Text>
          </View>
          {canEdit && (
            <TouchableOpacity onPress={() => openEditModal(event)} style={{ padding: 4 }}>
              <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };



  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar style="light" backgroundColor="#0E3B6E" />
      
      {/* Header */}
      <LinearGradient colors={['#0E3B6E', '#1A4F8B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }}>CSE Calendar</Text>
          <TouchableOpacity onPress={openAddModal} style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center' }}>
          CSE Department Event Calendar - Jagannath University
        </Text>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0E3B6E" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0E3B6E']} />}>
          
          {/* Calendar */}
          {renderCalendar()}

          {/* Selected Date Events */}
          {selectedDate && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#1F2937', marginBottom: 12 }}>
                Events on {selectedDate} {MONTHS[currentMonth]} {currentYear}
              </Text>
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event, i) => renderEventCard(event, i))
              ) : (
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 20 }}>
                  No events on this day
                </Text>
              )}
            </View>
          )}

          {/* Upcoming Events */}
          {!selectedDate && (
            <View style={{ marginTop: 20 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#1F2937', marginBottom: 12 }}>
                📅 Upcoming Events
              </Text>
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => renderEventCard(event, i))
              ) : (
                <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' }}>
                  <Ionicons name="calendar-outline" size={48} color="#CBD5E1" />
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#94A3B8', marginTop: 12, textAlign: 'center' }}>
                    No upcoming events{'\n'}Tap + to add one!
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Quick Stats */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#1F2937', marginBottom: 12 }}>
              📊 Quick Stats
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                const count = events.filter(e => e.category === cat).length;
                if (count === 0) return null;
                return (
                  <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#F1F5F9' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#374151' }}>{cat}</Text>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: color }}>{count}</Text>
                  </View>
                );
              })}
              {events.length === 0 && (
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#94A3B8' }}>No events to show stats</Text>
              )}
            </View>
          </View>
        </ScrollView>
      )}

    </SafeAreaView>
  );
}
