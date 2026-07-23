import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';
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
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B' }
};

export default function SponsorPaymentsScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) { setUser(u); fetchPayments(u.email); }
      else { setLoading(false); router.replace('/login'); }
    });
    return unsub;
  }, []);

  const fetchPayments = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsor/payments/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Fetch payments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'verified') return { bg: COLORS.successLight, text: COLORS.success, icon: 'checkmark-circle' };
    if (s === 'pending') return { bg: COLORS.warningLight, text: COLORS.warning, icon: 'time' };
    if (s === 'failed') return { bg: COLORS.dangerLight, text: COLORS.danger, icon: 'close-circle' };
    if (s === 'refunded') return { bg: COLORS.infoLight, text: COLORS.info, icon: 'refresh' };
    return { bg: COLORS.gray[100], text: COLORS.gray[500], icon: 'help-circle' };
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'bkash': return 'phone-portrait';
      case 'nagad': return 'phone-portrait';
      case 'bank_transfer': return 'business';
      case 'stripe': return 'card';
      case 'cash': return 'cash';
      default: return 'wallet';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.gray[50] }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }}>Payment History</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {loading ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        ) : payments.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="receipt-outline" size={80} color={COLORS.gray[300]} />
            <Text style={{ fontFamily: 'Montserrat_600SemiBold', fontSize: 18, color: COLORS.gray[400], marginTop: 16 }}>No payments yet</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.gray[400], marginTop: 8, textAlign: 'center' }}>Payments will appear here once you{'\n'}apply for a sponsorship.</Text>
          </View>
        ) : (
          payments.map((payment) => {
            const ss = getStatusStyle(payment.status);
            return (
              <View key={payment._id} style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: COLORS.gray[100] }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: ss.bg, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name={ss.icon} size={22} color={ss.text} />
                    </View>
                    <View>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>৳{payment.amount?.toLocaleString()}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[400] }}>
                        {payment.event?.title || 'Sponsorship Payment'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: ss.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                    <Text style={{ fontFamily: 'Poppins_700Bold', fontSize: 10, color: ss.text, textTransform: 'capitalize' }}>{payment.status}</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.gray[100] }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name={getPaymentMethodIcon(payment.paymentMethod)} size={14} color={COLORS.gray[400]} />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500], textTransform: 'capitalize' }}>
                      {payment.paymentMethod?.replace('_', ' ')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.gray[400]} />
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[500] }}>
                      {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
                
                {payment.transactionId ? (
                  <View style={{ marginTop: 10, backgroundColor: COLORS.gray[50], borderRadius: 10, padding: 10 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>Transaction ID</Text>
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600] }}>{payment.transactionId}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}
