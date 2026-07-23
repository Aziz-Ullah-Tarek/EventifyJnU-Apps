import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const COLORS = {
  primary: '#0E3B6E', primaryLight: '#1A4F8B',
  accent: '#F97316',
  success: '#10B981', successLight: '#D1FAE5',
  danger: '#EF4444', dangerLight: '#FEE2E2',
  warning: '#F59E0B', warningLight: '#FEF3C7',
  info: '#3B82F6', infoLight: '#DBEAFE',
  purple: '#8B5CF6', purpleLight: '#EDE9FE',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B' }
};

const TIER_CONFIG = {
  'Title Sponsor': { color: '#FFD700', bg: '#FFFBE6', text: '#B8860B', icon: 'trophy' },
  'Gold Sponsor': { color: '#FFD700', bg: '#FFFBE6', text: '#B8860B', icon: 'medal' },
  'Silver Sponsor': { color: '#C0C0C0', bg: '#F5F5F5', text: '#71717A', icon: 'medal' },
  'Bronze Sponsor': { color: '#CD7F32', bg: '#FFF3E6', text: '#8B5E3C', icon: 'medal' },
  'Community Partner': { color: '#8B5CF6', bg: '#EDE9FE', text: '#6D28D9', icon: 'people' }
};

export default function SponsorDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [sponsorship, setSponsorship] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsorships/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSponsorship(data);
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load details' });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setReportLoading(true);
      const res = await fetch(`${API_BASE_URL}/sponsor/report/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setShowReport(true);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to generate report' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setReportLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Sponsorship', 'Are you sure you want to cancel this sponsorship?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/sponsorships/${id}/cancel`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Sponsor requested cancellation' })
          });
          if (res.ok) {
            Toast.show({ type: 'success', text1: 'Cancelled', text2: 'Sponsorship has been cancelled' });
            fetchDetails();
          }
        } catch (e) {
          Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to cancel' });
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!sponsorship) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Montserrat_600SemiBold', color: COLORS.gray[400] }}>Sponsorship not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const tierConf = TIER_CONFIG[sponsorship.tierName] || TIER_CONFIG['Bronze Sponsor'];
  const event = sponsorship.event || {};
  const sponsor = sponsorship.sponsor || {};

  const statusColors = {
    pending: { bg: COLORS.warningLight, text: COLORS.warning, label: 'Pending Approval' },
    approved: { bg: COLORS.infoLight, text: COLORS.info, label: 'Approved' },
    active: { bg: COLORS.successLight, text: COLORS.success, label: 'Active' },
    completed: { bg: COLORS.gray[100], text: COLORS.gray[500], label: 'Completed' },
    cancelled: { bg: COLORS.dangerLight, text: COLORS.danger, label: 'Cancelled' }
  };
  const sc = statusColors[sponsorship.status] || statusColors.pending;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={[{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }, { flex: 1 }]}>Sponsorship Details</Text>
          {sponsorship.status === 'pending' && (
            <TouchableOpacity onPress={handleCancel} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: tierConf.bg, alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 2, borderColor: tierConf.color }}>
              <Ionicons name={tierConf.icon} size={26} color={tierConf.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }}>{sponsorship.tierName}</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{event.title || 'Event'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#FFFFFF' }}>৳{sponsorship.tierAmount?.toLocaleString()}</Text>
            <View style={{ backgroundColor: sc.bg, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 }}>
              <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 11, color: sc.text }}>{sc.label}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Event Info */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: COLORS.gray[800], marginBottom: 12 }}>Event Details</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.gray[400]} style={{ marginRight: 10 }} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[600] }}>
              {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="location-outline" size={16} color={COLORS.gray[400]} style={{ marginRight: 10 }} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[600] }}>{event.location || 'TBD'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="people-outline" size={16} color={COLORS.gray[400]} style={{ marginRight: 10 }} />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[600] }}>
              {event.registeredCount || 0} / {event.capacity || 0} registered
            </Text>
          </View>
        </View>

        {/* Benefits */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: COLORS.gray[800], marginBottom: 12 }}>Benefits & Deliverables</Text>
          {(sponsorship.benefits || []).map((benefit, idx) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Ionicons name="checkmark-circle" size={18} color={tierConf.text} style={{ marginRight: 10 }} />
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[600], flex: 1 }}>{benefit}</Text>
            </View>
          ))}
          {(!sponsorship.benefits || sponsorship.benefits.length === 0) && (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400] }}>No specific benefits listed</Text>
          )}
        </View>

        {/* Payment Info */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: COLORS.gray[800], marginBottom: 12 }}>Payment Information</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[500] }}>Total Amount</Text>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>৳{sponsorship.tierAmount?.toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[500] }}>Amount Paid</Text>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.success }}>৳{sponsorship.amountPaid?.toLocaleString()}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[500] }}>Payment Status</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: sponsorship.paymentStatus === 'completed' ? COLORS.success : sponsorship.paymentStatus === 'partial' ? COLORS.warning : COLORS.danger }} />
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], textTransform: 'capitalize' }}>{sponsorship.paymentStatus}</Text>
            </View>
          </View>
          {sponsorship.invoiceNumber && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[500] }}>Invoice</Text>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.info }}>{sponsorship.invoiceNumber}</Text>
            </View>
          )}
        </View>

        {/* Sponsor Info */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: COLORS.gray[800], marginBottom: 12 }}>Sponsor Information</Text>
          <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[700] }}>{sponsorship.sponsorName}</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400] }}>{sponsorship.sponsorEmail}</Text>
          {sponsor.website ? (
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.info, marginTop: 4 }}>{sponsor.website}</Text>
          ) : null}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={generateReport} disabled={reportLoading}
            style={{ flex: 1, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            {reportLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="bar-chart" size={18} color="#FFFFFF" />
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 13 }}>View Report</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/sponsorship')}
            style={{ flex: 1, backgroundColor: COLORS.gray[100], paddingVertical: 14, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
            <Ionicons name="information-circle" size={18} color={COLORS.gray[600]} />
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: COLORS.gray[600], fontSize: 13 }}>Packages</Text>
          </TouchableOpacity>
        </View>

        {/* Report Section */}
        {showReport && report && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginTop: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.successLight }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.successLight, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="bar-chart" size={18} color={COLORS.success} />
              </View>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>Performance Report</Text>
            </View>
            
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 14, padding: 14, flex: 1, minWidth: '45%', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: COLORS.primary }}>{report.metrics.totalRegistrations}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[500] }}>Registrations</Text>
              </View>
              <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 14, padding: 14, flex: 1, minWidth: '45%', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: COLORS.success }}>{report.metrics.estimatedAttendance}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[500] }}>Est. Attendance</Text>
              </View>
              <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 14, padding: 14, flex: 1, minWidth: '45%', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: COLORS.accent }}>{report.metrics.registrationRate}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[500] }}>Fill Rate</Text>
              </View>
              <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 14, padding: 14, flex: 1, minWidth: '45%', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: COLORS.purple }}>{report.metrics.engagementScore}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[500] }}>Engagement</Text>
              </View>
            </View>
            
            <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 12, padding: 14 }}>
              <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: COLORS.gray[600], marginBottom: 8 }}>BRAND EXPOSURE</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[500] }}>Brand Impressions</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: COLORS.gray[800] }}>{report.metrics.brandImpressions?.toLocaleString()}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[500] }}>Social Mentions</Text>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: COLORS.gray[800] }}>{report.metrics.socialMentions}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}
