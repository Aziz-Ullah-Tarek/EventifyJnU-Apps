import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const COLORS = {
  primary: '#0E3B6E', primaryLight: '#1A4F8B',
  accent: '#F97316', accentLight: '#FB923C',
  success: '#10B981', successLight: '#D1FAE5',
  danger: '#EF4444', dangerLight: '#FEE2E2',
  warning: '#F59E0B', warningLight: '#FEF3C7',
  info: '#3B82F6', infoLight: '#DBEAFE',
  purple: '#8B5CF6', purpleLight: '#EDE9FE',
  gold: '#FFD700', goldLight: '#FFFBE6',
  silver: '#C0C0C0', silverLight: '#F5F5F5',
  bronze: '#CD7F32', bronzeLight: '#FFF3E6',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B', 900: '#0F172A' }
};

const StatCard = ({ icon, label, count, gradientColors, iconColor }) => (
  <LinearGradient colors={gradientColors || ['#0E3B6E', '#1E5A9E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={{ borderRadius: 20, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4, minHeight: 110 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#FFFFFF', opacity: 0.9 }}>TOTAL</Text>
      </View>
    </View>
    <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 28, color: '#FFFFFF', letterSpacing: -0.5, marginTop: 12 }}>{count}</Text>
    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{label}</Text>
  </LinearGradient>
);

const SponsorshipCard = ({ item, onPress }) => {
  const tierColors = {
    'Title Sponsor': { bg: '#FFFBE6', border: '#FFD700', text: '#B8860B', icon: 'trophy' },
    'Gold Sponsor': { bg: '#FFFBE6', border: '#FFD700', text: '#B8860B', icon: 'medal' },
    'Silver Sponsor': { bg: '#F5F5F5', border: '#C0C0C0', text: '#71717A', icon: 'medal' },
    'Bronze Sponsor': { bg: '#FFF3E6', border: '#CD7F32', text: '#8B5E3C', icon: 'medal' },
    'Community Partner': { bg: '#EDE9FE', border: '#8B5CF6', text: '#6D28D9', icon: 'people' }
  };
  const tc = tierColors[item.tierName] || tierColors['Bronze Sponsor'];
  const statusColors = {
    pending: { bg: '#FEF3C7', text: '#D97706' },
    approved: { bg: '#DBEAFE', text: '#2563EB' },
    active: { bg: '#D1FAE5', text: '#059669' },
    completed: { bg: '#E2E8F0', text: '#64748B' },
    cancelled: { bg: '#FEE2E2', text: '#DC2626' }
  };
  const sc = statusColors[item.status] || statusColors.pending;

  return (
    <TouchableOpacity onPress={() => onPress(item)}
      style={{ backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 14, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: tc.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: tc.border }}>
          <Ionicons name={tc.icon} size={24} color={tc.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>{item.tierName}</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], marginTop: 2 }}>{item.event?.title || 'Event'}</Text>
        </View>
        <View style={{ backgroundColor: sc.bg, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
          <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 11, color: sc.text, textTransform: 'capitalize' }}>{item.status}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[100] }}>
        <View>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>Amount</Text>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.primary }}>৳{item.tierAmount?.toLocaleString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>Payment</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.paymentStatus === 'completed' ? COLORS.success : item.paymentStatus === 'partial' ? COLORS.warning : COLORS.danger }} />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], textTransform: 'capitalize' }}>{item.paymentStatus}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SponsorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [sponsorships, setSponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) { setUser(u); fetchSponsorData(u.email); }
      else { setLoading(false); router.replace('/login'); }
    });
    return unsub;
  }, []);

  const fetchSponsorData = async (email) => {
    try {
      // Fetch profile, stats, and sponsorships in parallel
      const [profileRes, statsRes, sponsorshipsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/sponsor/profile/${encodeURIComponent(email)}`),
        fetch(`${API_BASE_URL}/sponsor/stats/${encodeURIComponent(email)}`),
        fetch(`${API_BASE_URL}/sponsorships/mine/${encodeURIComponent(email)}`)
      ]);
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (sponsorshipsRes.ok) {
        const data = await sponsorshipsRes.json();
        setSponsorships(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Fetch sponsor data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (user) fetchSponsorData(user.email);
  }, [user]);

  const handleSponsorshipPress = (item) => {
    router.push(`/sponsor/details?id=${item._id}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
        <StatusBar style="light" backgroundColor={COLORS.primary} />
        <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 24 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 24, color: '#FFFFFF' }}>Sponsor Dashboard</Text>
        </LinearGradient>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 16, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }}>Sponsor Dashboard</Text>
          <TouchableOpacity onPress={() => router.push('/sponsor/profile')} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Profile Summary */}
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 50, height: 50, borderRadius: 16, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="business" size={26} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFFFFF' }}>
              {profile?.organizationName || user?.email?.split('@')[0] || 'Sponsor'}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {profile ? `${profile.contactPerson} • ${profile.industry || 'Sponsor'}` : 'Set up your sponsor profile'}
            </Text>
          </View>
          {!profile && (
            <TouchableOpacity onPress={() => router.push('/sponsor/profile')} style={{ backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 11, color: '#FFFFFF' }}>Setup</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}>
        
        {/* Stats Overview */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <View style={{ width: '47%' }}>
            <StatCard icon="briefcase" label="Active Sponsorships" count={stats?.activeSponsorships || 0} gradientColors={[COLORS.primary, '#1E5A9E']} />
          </View>
          <View style={{ width: '47%' }}>
            <StatCard icon="checkmark-done" label="Completed" count={stats?.completedSponsorships || 0} gradientColors={[COLORS.success, '#34D399']} />
          </View>
          <View style={{ width: '47%' }}>
            <StatCard icon="cash" label="Total Spent (৳)" count={stats?.totalSpent ? `৳${(stats.totalSpent / 1000).toFixed(1)}K` : '৳0'} gradientColors={[COLORS.accent, '#FB923C']} />
          </View>
          <View style={{ width: '47%' }}>
            <StatCard icon="time" label="Pending" count={stats?.pendingSponsorships || 0} gradientColors={[COLORS.warning, '#FBBF24']} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800], marginBottom: 16 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <TouchableOpacity onPress={() => router.push('/sponsor/opportunities')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.goldLight, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, flex: 1, minWidth: 140, borderWidth: 1, borderColor: COLORS.gold }}>
              <Ionicons name="search" size={22} color="#B8860B" />
              <View>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Explore</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#B8860B' }}>Opportunities</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/sponsor/profile')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.infoLight, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, flex: 1, minWidth: 140, borderWidth: 1, borderColor: COLORS.info }}>
              <Ionicons name="business" size={22} color={COLORS.info} />
              <View>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Manage</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: COLORS.info }}>Profile</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/sponsor/payments')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.successLight, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, flex: 1, minWidth: 140, borderWidth: 1, borderColor: COLORS.success }}>
              <Ionicons name="receipt" size={22} color={COLORS.success} />
              <View>
                <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: COLORS.gray[700] }}>Payment</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: COLORS.success }}>History</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Sponsorships */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>My Sponsorships</Text>
            <TouchableOpacity onPress={() => router.push('/sponsor/opportunities')}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.accent }}>View All</Text>
            </TouchableOpacity>
          </View>
          {sponsorships.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 30 }}>
              <Ionicons name="gift-outline" size={60} color={COLORS.gray[300]} />
              <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 16, color: COLORS.gray[400], marginTop: 12 }}>No sponsorships yet</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], marginTop: 6, textAlign: 'center' }}>Explore sponsorship opportunities{'\n'}and support campus events!</Text>
              <TouchableOpacity onPress={() => router.push('/sponsor/opportunities')} style={{ marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>Explore Opportunities</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sponsorships.slice(0, 5).map((item) => (
              <SponsorshipCard key={item._id} item={item} onPress={handleSponsorshipPress} />
            ))
          )}
        </View>

        {/* Need Help? */}
        <TouchableOpacity onPress={() => router.push('/sponsorship')}
          style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.gray[200], flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.purpleLight, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="information-circle" size={24} color={COLORS.purple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[700] }}>Learn About Sponsorship</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[400] }}>View packages, benefits, and terms</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}
