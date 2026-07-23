import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Platform, Dimensions, Modal, TextInput } from 'react-native';
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
  accent: '#F97316',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  gold: '#FFD700', goldLight: '#FFFBE6',
  silver: '#C0C0C0', silverLight: '#F5F5F5',
  bronze: '#CD7F32', bronzeLight: '#FFF3E6',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B' }
};

const TIER_CONFIG = {
  'Title Sponsor': { color: '#FFD700', bg: '#FFFBE6', text: '#B8860B', icon: 'trophy', gradient: ['#FFD700', '#FFA500'] },
  'Gold Sponsor': { color: '#FFD700', bg: '#FFFBE6', text: '#B8860B', icon: 'medal', gradient: ['#FFD700', '#FFC107'] },
  'Silver Sponsor': { color: '#C0C0C0', bg: '#F5F5F5', text: '#71717A', icon: 'medal', gradient: ['#E2E8F0', '#C0C0C0'] },
  'Bronze Sponsor': { color: '#CD7F32', bg: '#FFF3E6', text: '#8B5E3C', icon: 'medal', gradient: ['#CD7F32', '#D4956A'] },
  'Community Partner': { color: '#8B5CF6', bg: '#EDE9FE', text: '#6D28D9', icon: 'people', gradient: ['#8B5CF6', '#A78BFA'] }
};

const TierCard = ({ tier, onSelect, disabled }) => {
  const config = TIER_CONFIG[tier.name] || TIER_CONFIG['Bronze Sponsor'];
  const isFull = tier.spotsFilled >= tier.maxSponsors;

  return (
    <TouchableOpacity onPress={() => !isFull && onSelect(tier)} disabled={isFull || disabled}
      style={{ backgroundColor: config.bg, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 2, borderColor: config.color, opacity: isFull ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name={config.icon} size={24} color={config.text} />
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 17, color: COLORS.gray[800] }}>{tier.name}</Text>
        </View>
        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.primary }}>৳{tier.amount?.toLocaleString()}</Text>
      </View>
      
      {/* Benefits */}
      <View style={{ marginBottom: 12 }}>
        {tier.benefits?.slice(0, 4).map((benefit, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
            <Ionicons name="checkmark-circle" size={16} color={config.text} style={{ marginRight: 8 }} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[600], flex: 1 }}>{benefit}</Text>
          </View>
        ))}
        {tier.benefits?.length > 4 && (
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400], marginLeft: 24 }}>+{tier.benefits.length - 4} more benefits</Text>
        )}
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: config.color + '40' }}>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[500] }}>
          {isFull ? 'Fully Booked' : `${tier.maxSponsors - tier.spotsFilled} of ${tier.maxSponsors} spots available`}
        </Text>
        {!isFull && (
          <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 }}>
            <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 12, color: '#FFFFFF' }}>Select</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SponsorOpportunities() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [sponsorProfile, setSponsorProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [customReq, setCustomReq] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        await fetchSponsorProfile(u.email);
      }
      fetchOpportunities();
    });
    return unsub;
  }, []);

  const fetchSponsorProfile = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsor/profile/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setSponsorProfile(data);
      }
    } catch (e) {}
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsorship/opportunities`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load opportunities' });
    } finally {
      setLoading(false);
    }
  };

  const openTierModal = async (event) => {
    setSelectedEvent(event);
    setShowTierModal(true);
    setSelectedTier(null);
    setCustomReq('');
    setTiersLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/sponsorship/tiers/${event.event._id}`);
      if (res.ok) {
        const data = await res.json();
        setTiers(data);
      }
    } catch (e) {
      // Use default tiers
      setTiers([
        { name: 'Title Sponsor', tier: 1, amount: 100000, benefits: ['Title sponsorship with event naming rights', 'Prime logo on all banners & materials', '15 VIP passes', 'Dedicated booth at prime location', 'Opening ceremony speaking slot (5 min)', 'Social media campaign featuring brand', 'Logo on all promotional videos', 'Complimentary catering for 10 guests'], maxSponsors: 1, spotsFilled: 0, isActive: true },
        { name: 'Gold Sponsor', tier: 2, amount: 50000, benefits: ['Gold tier logo placement on banners', '8 VIP passes', 'Shared promotional booth', 'Social media mentions (5 posts)', 'Logo in event program', 'Stage announcement (3 times)', 'Complimentary catering for 5 guests'], maxSponsors: 2, spotsFilled: 0, isActive: true },
        { name: 'Silver Sponsor', tier: 3, amount: 25000, benefits: ['Logo on event banners', '5 VIP passes', 'Shared booth space', 'Social media mentions (3 posts)', 'Name in event program', 'Stage announcement (2 times)'], maxSponsors: 3, spotsFilled: 0, isActive: true },
        { name: 'Bronze Sponsor', tier: 4, amount: 10000, benefits: ['Small logo on banners', '2 VIP passes', 'Name in event program', 'Social media mention (1 post)'], maxSponsors: 5, spotsFilled: 0, isActive: true },
        { name: 'Community Partner', tier: 5, amount: 5000, benefits: ['Name listed as partner', '1 VIP pass', 'Social media thank-you post'], maxSponsors: 10, spotsFilled: 0, isActive: true }
      ]);
    } finally {
      setTiersLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedTier || !selectedEvent) return;
    if (!user) {
      Toast.show({ type: 'error', text1: 'Login Required', text2: 'Please login to apply' });
      router.push('/login');
      return;
    }
    if (!sponsorProfile) {
      Toast.show({ type: 'error', text1: 'Profile Required', text2: 'Please set up your sponsor profile first' });
      router.push('/sponsor/profile');
      return;
    }

    try {
      setApplying(true);
      const res = await fetch(`${API_BASE_URL}/sponsorship/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: selectedEvent.event._id,
          sponsor: sponsorProfile._id,
          sponsorName: sponsorProfile.organizationName,
          sponsorEmail: user.email,
          sponsorLogo: sponsorProfile.logoUrl || '',
          tierName: selectedTier.name,
          tierAmount: selectedTier.amount,
          currency: 'BDT',
          benefits: selectedTier.benefits || [],
          customRequirements: customReq
        })
      });
      const data = await res.json();
      if (res.ok) {
        setShowTierModal(false);
        Toast.show({ type: 'success', text1: 'Application Submitted!', text2: `You applied for ${selectedTier.name}` });
        setTimeout(() => router.push('/sponsor/dashboard'), 1500);
      } else {
        Toast.show({ type: 'error', text1: 'Failed', text2: data.message || 'Something went wrong' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#FFFFFF' }}>Sponsorship Opportunities</Text>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
          Support campus events and get brand visibility among thousands of students
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {opportunities.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Ionicons name="calendar-outline" size={80} color={COLORS.gray[300]} />
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 18, color: COLORS.gray[400], marginTop: 16 }}>No opportunities available</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.gray[400], marginTop: 8, textAlign: 'center' }}>Check back when new events are published!</Text>
          </View>
        ) : (
          opportunities.map((opp, index) => {
            const event = opp.event;
            return (
              <TouchableOpacity key={event._id || index} onPress={() => openTierModal(opp)}
                style={{ backgroundColor: '#FFFFFF', borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 }}>
                {event.imageUrl && (
                  <Image source={{ uri: event.imageUrl }} style={{ width: '100%', height: 160 }} />
                )}
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }} />
                <View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                  <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: '#FFFFFF', letterSpacing: 0.5 }}>{event.category || 'Event'}</Text>
                </View>
                <View style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                  <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }}>{event.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 6 }}>
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" style={{ marginLeft: 16 }} />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)', marginLeft: 6 }} numberOfLines={1}>{event.location}</Text>
                  </View>
                </View>
                
                {/* Tier Quick Overview */}
                <View style={{ padding: 16 }}>
                  <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[500], marginBottom: 10 }}>SPONSORSHIP TIERS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {opp.tiers?.map((tier, idx) => {
                      const config = TIER_CONFIG[tier.name] || TIER_CONFIG['Bronze Sponsor'];
                      return (
                        <View key={idx} style={{ backgroundColor: config.bg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: config.color, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name={config.icon} size={12} color={config.text} />
                          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: config.text }}>{tier.name}</Text>
                          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 10, color: COLORS.primary }}>৳{(tier.amount / 1000).toFixed(0)}K</Text>
                        </View>
                      );
                    })}
                  </View>
                  <TouchableOpacity onPress={() => openTierModal(opp)} style={{ marginTop: 14, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 14, alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 14 }}>View Tiers & Apply</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Tier Selection Modal */}
      <Modal visible={showTierModal} transparent animationType="slide" onRequestClose={() => setShowTierModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '85%', paddingTop: 8 }}>
            {/* Handle */}
            <View style={{ width: 40, height: 4, backgroundColor: COLORS.gray[300], borderRadius: 2, alignSelf: 'center', marginBottom: 8 }} />
            
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: COLORS.gray[800], flex: 1 }}>
                  {selectedEvent?.event?.title || 'Select Tier'}
                </Text>
                <TouchableOpacity onPress={() => setShowTierModal(false)} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray[100], alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="close" size={20} color={COLORS.gray[500]} />
                </TouchableOpacity>
              </View>

              {tiersLoading ? (
                <ActivityIndicator size="large" color={COLORS.accent} />
              ) : (
                <>
                  {tiers.map((tier, idx) => (
                    <TierCard key={idx} tier={tier} onSelect={(t) => setSelectedTier(t)} disabled={!!selectedTier && selectedTier.name !== tier.name} />
                  ))}

                  {selectedTier && (
                    <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 16, marginTop: 8 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: COLORS.gray[800], marginBottom: 12 }}>Custom Requirements (Optional)</Text>
                      <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[200], padding: 12 }}>
                        <TextInput
                          style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.gray[700], minHeight: 80, textAlignVertical: 'top' }}
                          placeholder="Describe any specific requirements, branding preferences, or special requests..."
                          placeholderTextColor={COLORS.gray[400]}
                          value={customReq}
                          onChangeText={setCustomReq}
                          multiline
                        />
                      </View>
                    </View>
                  )}

                  {selectedTier && (
                    <TouchableOpacity onPress={handleApply} disabled={applying}
                      style={{ backgroundColor: applying ? COLORS.gray[400] : COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16 }}>
                      {applying ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>
                          Apply for {selectedTier.name} - ৳{selectedTier.amount?.toLocaleString()}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
}
