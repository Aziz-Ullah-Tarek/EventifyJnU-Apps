import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, Platform, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import Toast from 'react-native-toast-message';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

// Dynamically determine the local backend IP based on Expo's dev server host
const debuggerHost = Constants.expoConfig?.hostUri;
const localIP = debuggerHost ? debuggerHost.split(':')[0] : (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const API_BASE_URL = `http://${localIP}:5000/api`;

const COLORS = {
  primary: '#0E3B6E', primaryLight: '#1A4F8B',
  accent: '#F97316', accentLight: '#FB923C',
  success: '#10B981', successLight: '#D1FAE5',
  danger: '#EF4444', dangerLight: '#FEE2E2',
  warning: '#F59E0B', warningLight: '#FEF3C7',
  info: '#3B82F6', infoLight: '#DBEAFE',
  purple: '#8B5CF6', purpleLight: '#EDE9FE',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' }
};

const StatCard = ({ icon, label, count, gradientColors }) => (
  <LinearGradient colors={gradientColors || ['#0E3B6E', '#1E5A9E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={{ flex: 1, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 }}>
    <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
      <Ionicons name={icon} size={20} color="#FFFFFF" />
    </View>
    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 28, color: '#FFFFFF', letterSpacing: -0.5 }}>{count}</Text>
    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{label}</Text>
  </LinearGradient>
);

const SectionCard = ({ icon, iconColor, title, children }) => (
  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${iconColor}15`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>{title}</Text>
    </View>
    {children}
  </View>
);

const StatusBadge = ({ status }) => {
  const config = { pending: { bg: COLORS.warningLight, text: COLORS.warning, label: 'Pending' }, published: { bg: COLORS.successLight, text: COLORS.success, label: 'Published' }, approved: { bg: COLORS.successLight, text: COLORS.success, label: 'Approved' }, rejected: { bg: COLORS.dangerLight, text: COLORS.danger, label: 'Rejected' }, cancelled: { bg: COLORS.dangerLight, text: COLORS.danger, label: 'Cancelled' } };
  const s = (status || 'pending').toLowerCase();
  const c = config[s] || config.pending;
  return <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' }}><Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 9, color: c.text }}>{c.label}</Text></View>;
};

const ActionBtn = ({ label, onPress, color, bgColor, icon }) => (
  <TouchableOpacity onPress={onPress} style={{ backgroundColor: bgColor || '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: color || COLORS.gray[200], flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    {icon && <Ionicons name={icon} size={14} color={color} />}
    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: color || COLORS.gray[700] }}>{label}</Text>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sponsorships, setSponsorships] = useState([]);
  const [sponsorPayments, setSponsorPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { fetchAdminData(); }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, eventsRes, volRes, resBookings, sponsorshipsRes, sponsorPaymentsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`).then(r => r.json()),
        fetch(`${API_BASE_URL}/events`).then(r => r.json()),
        fetch(`${API_BASE_URL}/volunteer/applications`).then(r => r.json()),
        fetch(`${API_BASE_URL}/bookings`).then(r => r.json()),
        fetch(`${API_BASE_URL}/sponsorships`).then(r => r.json()),
        fetch(`${API_BASE_URL}/sponsor/payments`).then(r => r.json())
      ]);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : []);
      setVolunteers(Array.isArray(volRes) ? volRes : []);
      setBookings(Array.isArray(resBookings) ? resBookings : []);
      setSponsorships(Array.isArray(sponsorshipsRes) ? sponsorshipsRes : []);
      setSponsorPayments(Array.isArray(sponsorPaymentsRes) ? sponsorPaymentsRes : []);
    } catch (error) {
      console.error('Fetch Admin Data Error:', error);
      Toast.show({ type: 'error', text1: 'Fetch failed', text2: `Could not connect to ${API_BASE_URL}` });
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Toast.show({ type: 'success', text1: 'Logged Out', text2: 'You have been logged out successfully.' });
      // Navigation handled automatically by onAuthStateChanged in _layout.js
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const updateUserRole = async (email, newRole) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${email}/role`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Success', text2: `User role updated to ${newRole}` }); fetchAdminData(); }
    } catch (error) { console.error(error); }
  };

  const updateEventStatus = async (id, status, featured) => {
    try {
      const body = { status }; if (featured !== undefined) body.featured = featured;
      const res = await fetch(`${API_BASE_URL}/events/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Success', text2: 'Event updated!' }); fetchAdminData(); }
    } catch (error) { console.error(error); }
  };

  const deleteEvent = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: async () => { try { const res = await fetch(`${API_BASE_URL}/events/${id}`, { method: 'DELETE' }); if (res.ok) { Toast.show({ type: 'success', text1: 'Deleted', text2: 'Event deleted.' }); fetchAdminData(); } } catch (e) { console.error(e); } }, style: 'destructive' }
    ]);
  };

  const updateVolunteerStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/volunteer/applications/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Success', text2: `Volunteer ${status}` }); fetchAdminData(); }
    } catch (error) { console.error(error); }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Success', text2: `Booking ${status}` }); fetchAdminData(); }
    } catch (error) { console.error(error); }
  };

  // Sponsorship actions
  const approveSponsorship = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsorships/${id}/approve`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ adminId: 'admin', adminName: 'Admin' })
      });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Approved', text2: 'Sponsorship approved!' }); fetchAdminData(); }
    } catch (e) { console.error(e); }
  };

  const activateSponsorship = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsorships/${id}/activate`, { method: 'PUT' });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Activated', text2: 'Sponsorship activated!' }); fetchAdminData(); }
    } catch (e) { console.error(e); }
  };

  const completeSponsorship = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsorships/${id}/complete`, { method: 'PUT' });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Completed', text2: 'Sponsorship completed!' }); fetchAdminData(); }
    } catch (e) { console.error(e); }
  };

  const cancelSponsorship = (id) => {
    Alert.alert('Cancel Sponsorship', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/sponsorships/${id}/cancel`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Cancelled by admin' })
          });
          if (res.ok) { Toast.show({ type: 'success', text1: 'Cancelled' }); fetchAdminData(); }
        } catch (e) {}
      }}
    ]);
  };

  const verifySponsorPayment = async (paymentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsor/payment/${paymentId}/verify`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verifiedBy: 'Admin' })
      });
      if (res.ok) { Toast.show({ type: 'success', text1: 'Verified', text2: 'Payment verified!' }); fetchAdminData(); }
    } catch (e) { console.error(e); }
  };

  const pendingEvents = events.filter(e => e.status === 'pending' || !e.status).length;
  const pendingVolunteers = volunteers.filter(v => v.status === 'pending' || !v.status).length;
  const pendingBookings = bookings.filter(b => b.status === 'pending' || !b.status).length;
  const pendingSponsorships = sponsorships.filter(s => s.status === 'pending').length;

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'grid-outline' },
    { key: 'users', label: 'Users', icon: 'people-outline' },
    { key: 'events', label: 'Events', icon: 'calendar-outline' },
    { key: 'volunteers', label: 'Volunteers', icon: 'hand-right-outline' },
    { key: 'bookings', label: 'Bookings', icon: 'business-outline' },
    { key: 'sponsorships', label: 'Sponsors', icon: 'gift-outline' },
  ];

  const renderOverview = () => (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <View style={{ width: '47%' }}><StatCard icon="people" label="Total Users" count={users.length} gradientColors={['#0E3B6E', '#1E5A9E']} /></View>
        <View style={{ width: '47%' }}><StatCard icon="calendar" label="Total Events" count={events.length} gradientColors={['#F97316', '#FB923C']} /></View>
        <View style={{ width: '47%' }}><StatCard icon="hand-right" label="Volunteers" count={volunteers.length} gradientColors={['#8B5CF6', '#A78BFA']} /></View>
        <View style={{ width: '47%' }}><StatCard icon="business" label="Bookings" count={bookings.length} gradientColors={['#10B981', '#34D399']} /></View>
        <View style={{ width: '47%' }}><StatCard icon="gift" label="Sponsorships" count={sponsorships.length} gradientColors={['#F59E0B', '#FBBF24']} /></View>
        <View style={{ width: '47%' }}><StatCard icon="cash" label="Sponsor Payments" count={sponsorPayments.length} gradientColors={['#8B5CF6', '#A78BFA']} /></View>
      </View>
      <SectionCard icon="flash" iconColor={COLORS.warning} title="Quick Actions">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <TouchableOpacity onPress={() => setActiveTab('events')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.warningLight, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, flex: 1, minWidth: 140 }}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.warning} />
            <View><Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Pending Events</Text><Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.warning }}>{pendingEvents}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('volunteers')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.purpleLight, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, flex: 1, minWidth: 140 }}>
            <Ionicons name="people" size={20} color={COLORS.purple} />
            <View><Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Volunteer Reqs</Text><Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.purple }}>{pendingVolunteers}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('bookings')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.infoLight, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, flex: 1, minWidth: 140 }}>
            <Ionicons name="business" size={20} color={COLORS.info} />
            <View><Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Room Requests</Text><Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.info }}>{pendingBookings}</Text></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('sponsorships')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFBE6', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, flex: 1, minWidth: 140 }}>
            <Ionicons name="gift" size={20} color="#F59E0B" />
            <View><Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Sponsor Reqs</Text><Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#F59E0B' }}>{pendingSponsorships}</Text></View>
          </TouchableOpacity>
        </View>
      </SectionCard>
      <SectionCard icon="timer" iconColor={COLORS.primary} title="Recent Activity">
        {events.slice(0, 3).map((event, i) => (
          <View key={event._id || i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < Math.min(events.length, 3) - 1 ? 1 : 0, borderBottomColor: COLORS.gray[100] }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: event.status === 'pending' ? COLORS.warningLight : COLORS.successLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name={event.status === 'pending' ? 'time-outline' : 'checkmark-circle'} size={18} color={event.status === 'pending' ? COLORS.warning : COLORS.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700] }} numberOfLines={1}>{event.title}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>{event.status === 'pending' ? 'Awaiting approval' : 'Published'}</Text>
            </View>
            <StatusBadge status={event.status} />
          </View>
        ))}
        {events.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 16 }}>No events yet.</Text>}
      </SectionCard>
    </>
  );

  const renderUsers = () => (
    <SectionCard icon="people" iconColor={COLORS.primary} title={`All Users (${users.length})`}>
      {users.map(user => (
        <View key={user._id} style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray[100] }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: user.role === 'admin' ? COLORS.dangerLight : user.role === 'moderator' ? COLORS.purpleLight : COLORS.infoLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name={user.photoURL ? 'person-circle' : 'person'} size={28} color={user.role === 'admin' ? COLORS.danger : user.role === 'moderator' ? COLORS.purple : COLORS.info} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[800] }}>{user.name}</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[400] }}>{user.email}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
              <View style={{ backgroundColor: user.role === 'admin' ? COLORS.dangerLight : user.role === 'moderator' ? COLORS.purpleLight : COLORS.infoLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 9, color: user.role === 'admin' ? COLORS.danger : user.role === 'moderator' ? COLORS.purple : COLORS.info }}>{user.role?.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <View style={{ gap: 6 }}>
            {user.role === 'student' && <ActionBtn label="Make Organizer" icon="shield-checkmark" onPress={() => updateUserRole(user.email, 'moderator')} color={COLORS.purple} bgColor={COLORS.purpleLight} />}
            {user.role === 'moderator' && <ActionBtn label="Revoke" icon="remove-circle" onPress={() => updateUserRole(user.email, 'student')} color={COLORS.danger} bgColor={COLORS.dangerLight} />}
          </View>
        </View>
      ))}
      {users.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 20 }}>No users registered yet.</Text>}
    </SectionCard>
  );

  const renderEvents = () => (
    <SectionCard icon="calendar" iconColor={COLORS.accent} title={`Events (${events.length})`}>
      {events.map(event => (
        <View key={event._id} style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gray[100] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[800] }}>{event.title}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8, flexWrap: 'wrap' }}>
                <StatusBadge status={event.status} />
                {event.featured && <View style={{ backgroundColor: COLORS.warningLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 3 }}><Ionicons name="star" size={10} color={COLORS.warning} /><Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 9, color: COLORS.warning }}>Featured</Text></View>}
              </View>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400], marginTop: 4 }}>{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date'} | {event.location || 'TBD'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[200], flexWrap: 'wrap' }}>
            {(event.status === 'pending' || !event.status) && <ActionBtn label="Approve" icon="checkmark-circle" onPress={() => updateEventStatus(event._id, 'published')} color={COLORS.success} bgColor={COLORS.successLight} />}
            {!event.featured ? <ActionBtn label="Feature" icon="star" onPress={() => updateEventStatus(event._id, event.status, true)} color={COLORS.warning} bgColor={COLORS.warningLight} /> : <ActionBtn label="Unfeature" icon="star-outline" onPress={() => updateEventStatus(event._id, event.status, false)} color={COLORS.gray[500]} bgColor={COLORS.gray[100]} />}
            <ActionBtn label="Delete" icon="trash" onPress={() => deleteEvent(event._id)} color={COLORS.danger} bgColor={COLORS.dangerLight} />
          </View>
        </View>
      ))}
      {events.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 20 }}>No events found.</Text>}
    </SectionCard>
  );

  const renderVolunteers = () => (
    <SectionCard icon="hand-right" iconColor={COLORS.purple} title={`Volunteer Applications (${volunteers.length})`}>
      {volunteers.map((vol, index) => (
        <View key={vol._id || index} style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gray[100] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[800] }}>{vol.applicantName}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500], marginTop: 2 }}>Role: {vol.role}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400], marginTop: 1 }}>Event: {vol.event?.title || 'Unknown'}</Text>
              <View style={{ marginTop: 6 }}><StatusBadge status={vol.status} /></View>
            </View>
          </View>
          {vol.status === 'pending' && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[200] }}>
              <ActionBtn label="Approve" icon="checkmark-circle" onPress={() => updateVolunteerStatus(vol._id, 'approved')} color={COLORS.success} bgColor={COLORS.successLight} />
              <ActionBtn label="Reject" icon="close-circle" onPress={() => updateVolunteerStatus(vol._id, 'rejected')} color={COLORS.danger} bgColor={COLORS.dangerLight} />
            </View>
          )}
        </View>
      ))}
      {volunteers.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 20 }}>No volunteer applications yet.</Text>}
    </SectionCard>
  );

  const renderBookings = () => (
    <SectionCard icon="business" iconColor={COLORS.info} title={`Room Bookings (${bookings.length})`}>
      {bookings.map((bk, index) => (
        <View key={bk._id || index} style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gray[100] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[800] }}>{bk.room?.name || 'Unknown Room'}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500], marginTop: 2 }}>By: {bk.bookedBy?.name || bk.bookedBy?.email || 'Unknown'}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400], marginTop: 4 }}>📅 {bk.startDateTime ? new Date(bk.startDateTime).toLocaleString() : 'N/A'}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>🕐 {bk.endDateTime ? new Date(bk.endDateTime).toLocaleString() : 'N/A'}</Text>
              <View style={{ marginTop: 6 }}><StatusBadge status={bk.status} /></View>
            </View>
          </View>
          {(!bk.status || String(bk.status).toLowerCase() === 'pending') && (
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[200] }}>
              <ActionBtn label="Approve" icon="checkmark-circle" onPress={() => updateBookingStatus(bk._id, 'approved')} color={COLORS.success} bgColor={COLORS.successLight} />
              <ActionBtn label="Reject" icon="close-circle" onPress={() => updateBookingStatus(bk._id, 'rejected')} color={COLORS.danger} bgColor={COLORS.dangerLight} />
            </View>
          )}
        </View>
      ))}
      {bookings.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 20 }}>No room booking requests found.</Text>}
    </SectionCard>
  );

  const renderSponsorships = () => (
    <>
      <SectionCard icon="gift" iconColor="#F59E0B" title={`Sponsorships (${sponsorships.length})`}>
        {sponsorships.map((sp, index) => {
          const tierColors = {
            'Title Sponsor': { bg: '#FFFBE6', text: '#B8860B' },
            'Gold Sponsor': { bg: '#FFFBE6', text: '#B8860B' },
            'Silver Sponsor': { bg: '#F5F5F5', text: '#71717A' },
            'Bronze Sponsor': { bg: '#FFF3E6', text: '#8B5E3C' },
            'Community Partner': { bg: '#EDE9FE', text: '#6D28D9' }
          };
          const tc = tierColors[sp.tierName] || { bg: '#F3F4F6', text: '#6B7280' };
          return (
            <View key={sp._id || index} style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gray[100] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <View style={{ backgroundColor: tc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: tc.text }}>{sp.tierName}</Text>
                    </View>
                    <StatusBadge status={sp.status} />
                  </View>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[800] }}>{sp.sponsorName}</Text>
                  <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500] }}>Event: {sp.event?.title || 'Unknown'}</Text>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: COLORS.primary, marginTop: 4 }}>৳{sp.tierAmount?.toLocaleString()}</Text>
                  {sp.paymentStatus && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sp.paymentStatus === 'completed' ? COLORS.success : COLORS.warning }} />
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400], textTransform: 'capitalize' }}>Payment: {sp.paymentStatus}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[200], flexWrap: 'wrap' }}>
                {sp.status === 'pending' && <>
                  <ActionBtn label="Approve" icon="checkmark-circle" onPress={() => approveSponsorship(sp._id)} color={COLORS.success} bgColor={COLORS.successLight} />
                  <ActionBtn label="Cancel" icon="close-circle" onPress={() => cancelSponsorship(sp._id)} color={COLORS.danger} bgColor={COLORS.dangerLight} />
                </>}
                {sp.status === 'approved' && <ActionBtn label="Activate" icon="flash" onPress={() => activateSponsorship(sp._id)} color={COLORS.info} bgColor={COLORS.infoLight} />}
                {sp.status === 'active' && <ActionBtn label="Complete" icon="checkmark-done" onPress={() => completeSponsorship(sp._id)} color={COLORS.success} bgColor={COLORS.successLight} />}
              </View>
            </View>
          );
        })}
        {sponsorships.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 20 }}>No sponsorships yet.</Text>}
      </SectionCard>
      
      {/* Sponsor Payments */}
      <SectionCard icon="cash" iconColor={COLORS.purple} title={`Sponsor Payments (${sponsorPayments.length})`}>
        {sponsorPayments.map((pm, index) => (
          <View key={pm._id || index} style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.gray[100] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[800] }}>৳{pm.amount?.toLocaleString()}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500] }}>Sponsor: {pm.sponsor?.organizationName || 'Unknown'}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>Event: {pm.event?.title || 'N/A'} | Method: {pm.paymentMethod?.replace('_', ' ') || 'N/A'}</Text>
                <View style={{ marginTop: 6 }}><StatusBadge status={pm.status} /></View>
              </View>
            </View>
            {pm.status === 'pending' && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[200] }}>
                <ActionBtn label="Verify Payment" icon="checkmark-circle" onPress={() => verifySponsorPayment(pm._id)} color={COLORS.success} bgColor={COLORS.successLight} />
              </View>
            )}
          </View>
        ))}
        {sponsorPayments.length === 0 && <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], textAlign: 'center', paddingVertical: 20 }}>No payments yet.</Text>}
      </SectionCard>
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: 0.5 }}>Admin Panel</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>System Management</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="log-out-outline" size={18} color="#FCA5A5" />
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#FCA5A5' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }} style={{ backgroundColor: COLORS.gray[50] }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: activeTab === tab.key ? COLORS.primary : '#FFFFFF', borderWidth: 1, borderColor: activeTab === tab.key ? COLORS.primary : COLORS.gray[200], shadowColor: activeTab === tab.key ? COLORS.primary : '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: activeTab === tab.key ? 0.2 : 0.04, shadowRadius: 6, elevation: activeTab === tab.key ? 4 : 1 }}>
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#FFFFFF' : COLORS.gray[500]} />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: activeTab === tab.key ? '#FFFFFF' : COLORS.gray[600] }}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}><ActivityIndicator size="large" color={COLORS.primary} /><Text style={{ fontFamily: 'Poppins_400Regular', color: COLORS.gray[400], marginTop: 12 }}>Loading dashboard data...</Text></View>
        ) : (
          <>{activeTab === 'overview' && renderOverview()}{activeTab === 'users' && renderUsers()}{activeTab === 'events' && renderEvents()}{activeTab === 'volunteers' && renderVolunteers()}{activeTab === 'bookings' && renderBookings()}{activeTab === 'sponsorships' && renderSponsorships()}</>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}