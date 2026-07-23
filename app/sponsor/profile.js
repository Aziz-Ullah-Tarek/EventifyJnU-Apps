import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform, KeyboardAvoidingView, Alert } from 'react-native';
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
  success: '#10B981',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B' }
};

const ORGANIZATION_TYPES = ['Corporate', 'Startup', 'NGO', 'Educational', 'Government', 'Other'];
const INDUSTRIES = ['Technology', 'Finance', 'Education', 'Healthcare', 'Retail', 'Telecom', 'Media', 'Real Estate', 'Manufacturing', 'Logistics', 'Energy', 'Other'];

export default function SponsorProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showOrgTypes, setShowOrgTypes] = useState(false);
  const [showIndustries, setShowIndustries] = useState(false);
  
  const [form, setForm] = useState({
    organizationName: '',
    organizationType: 'Corporate',
    industry: 'Technology',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    contactDesignation: '',
    address: '',
    city: 'Dhaka',
    country: 'Bangladesh',
    description: '',
    facebook: '',
    linkedin: '',
    twitter: ''
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setForm(prev => ({ ...prev, contactEmail: u.email || '' }));
        await fetchProfile(u.email);
      } else {
        setLoading(false);
        router.replace('/login');
      }
    });
    return unsub;
  }, []);

  const fetchProfile = async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sponsor/profile/${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setForm({
          organizationName: data.organizationName || '',
          organizationType: data.organizationType || 'Corporate',
          industry: data.industry || 'Technology',
          website: data.website || '',
          contactPerson: data.contactPerson || '',
          contactEmail: data.contactEmail || email || '',
          contactPhone: data.contactPhone || '',
          contactDesignation: data.contactDesignation || '',
          address: data.address || '',
          city: data.city || 'Dhaka',
          country: data.country || 'Bangladesh',
          description: data.description || '',
          facebook: data.socialLinks?.facebook || '',
          linkedin: data.socialLinks?.linkedin || '',
          twitter: data.socialLinks?.twitter || ''
        });
      }
    } catch (e) {
      console.log('No existing profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.organizationName || !form.contactPerson) {
      Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Organization name & contact person required' });
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`${API_BASE_URL}/sponsor/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          organizationName: form.organizationName,
          organizationType: form.organizationType,
          industry: form.industry,
          website: form.website,
          contactPerson: form.contactPerson,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          contactDesignation: form.contactDesignation,
          address: form.address,
          city: form.city,
          country: form.country,
          description: form.description,
          socialLinks: {
            facebook: form.facebook,
            linkedin: form.linkedin,
            twitter: form.twitter
          }
        })
      });
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Sponsor profile saved!' });
        router.back();
      } else {
        const data = await res.json();
        Toast.show({ type: 'error', text1: 'Error', text2: data.message || 'Failed to save' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const renderDropdown = (items, selected, onSelect, visible, setVisible) => (
    <View style={{ position: 'relative', zIndex: 100 }}>
      <TouchableOpacity onPress={() => setVisible(!visible)}
        style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: COLORS.gray[700] }}>{selected}</Text>
        <Ionicons name={visible ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray[400]} />
      </TouchableOpacity>
      {visible && (
        <View style={{ position: 'absolute', top: 52, left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray[200], elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, zIndex: 200 }}>
          {items.map((item, idx) => (
            <TouchableOpacity key={idx} onPress={() => { onSelect(item); setVisible(false); }}
              style={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: idx < items.length - 1 ? 1 : 0, borderBottomColor: COLORS.gray[100] }}>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: selected === item ? COLORS.primary : COLORS.gray[600] }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFFFFF' }}>Sponsor Profile</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          {/* Organization Section */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800], marginBottom: 16 }}>Organization Information</Text>
            
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Organization Name *</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="e.g. ABC Corporation" value={form.organizationName} onChangeText={(t) => setForm({...form, organizationName: t})} />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Organization Type</Text>
            {renderDropdown(ORGANIZATION_TYPES, form.organizationType, (v) => setForm({...form, organizationType: v}), showOrgTypes, setShowOrgTypes)}
            <View style={{ height: 14 }} />
            
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Industry</Text>
            {renderDropdown(INDUSTRIES, form.industry, (v) => setForm({...form, industry: v}), showIndustries, setShowIndustries)}
            <View style={{ height: 14 }} />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Website</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="https://example.com" value={form.website} onChangeText={(t) => setForm({...form, website: t})} autoCapitalize="none" />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Description</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Tell us about your organization..." value={form.description} onChangeText={(t) => setForm({...form, description: t})} multiline />
          </View>

          {/* Contact Section */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800], marginBottom: 16 }}>Contact Information</Text>

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Contact Person *</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="e.g. John Doe" value={form.contactPerson} onChangeText={(t) => setForm({...form, contactPerson: t})} />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Designation</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="e.g. Marketing Manager" value={form.contactDesignation} onChangeText={(t) => setForm({...form, contactDesignation: t})} />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Email</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="email@example.com" value={form.contactEmail} onChangeText={(t) => setForm({...form, contactEmail: t})} keyboardType="email-address" autoCapitalize="none" />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Phone</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="+8801XXXXXXXXX" value={form.contactPhone} onChangeText={(t) => setForm({...form, contactPhone: t})} keyboardType="phone-pad" />

            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Address</Text>
            <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14, marginBottom: 14 }}
              placeholder="Street address" value={form.address} onChangeText={(t) => setForm({...form, address: t})} />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>City</Text>
                <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                  placeholder="Dhaka" value={form.city} onChangeText={(t) => setForm({...form, city: t})} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[600], marginBottom: 6 }}>Country</Text>
                <TextInput style={{ backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                  placeholder="Bangladesh" value={form.country} onChangeText={(t) => setForm({...form, country: t})} />
              </View>
            </View>
          </View>

          {/* Social Links */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800], marginBottom: 16 }}>Social Links</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="logo-facebook" size={22} color="#1877F2" style={{ marginRight: 12 }} />
              <TextInput style={{ flex: 1, backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                placeholder="Facebook URL" value={form.facebook} onChangeText={(t) => setForm({...form, facebook: t})} autoCapitalize="none" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="logo-linkedin" size={22} color="#0A66C2" style={{ marginRight: 12 }} />
              <TextInput style={{ flex: 1, backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                placeholder="LinkedIn URL" value={form.linkedin} onChangeText={(t) => setForm({...form, linkedin: t})} autoCapitalize="none" />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="logo-twitter" size={22} color="#1DA1F2" style={{ marginRight: 12 }} />
              <TextInput style={{ flex: 1, backgroundColor: COLORS.gray[50], borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 12, padding: 14, fontFamily: 'Poppins_400Regular', fontSize: 14 }}
                placeholder="Twitter URL" value={form.twitter} onChangeText={(t) => setForm({...form, twitter: t})} autoCapitalize="none" />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity onPress={handleSave} disabled={saving}
            style={{ backgroundColor: saving ? COLORS.gray[400] : COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 8 }}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>Save Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast />
    </SafeAreaView>
  );
}
