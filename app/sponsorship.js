import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#0E3B6E', primaryLight: '#1A4F8B',
  accent: '#F97316',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  purple: '#8B5CF6',
  gray: { 50: '#F8FAFC', 100: '#F1F5F9', 200: '#E2E8F0', 300: '#CBD5E1', 400: '#94A3B8', 500: '#64748B', 600: '#475569', 700: '#334155', 800: '#1E293B' }
};

const TIERS = [
  {
    name: 'Title Sponsor', amount: '৳100,000', tier: 1, maxSponsors: 1,
    color: '#FFD700', bg: '#FFFBE6', text: '#B8860B', icon: 'trophy',
    benefits: ['Event naming rights (e.g., "Presented by [Brand]")', 'Prime logo on ALL banners, posters & materials', '15 VIP passes with dedicated seating', 'Dedicated promotional booth at prime location', 'Opening ceremony speaking slot (5 minutes)', 'Social media campaign featuring your brand (10 posts)', 'Logo in all promotional videos & event coverage', 'Complimentary catering for 10 guests', 'Brand mention in all press releases']
  },
  {
    name: 'Gold Sponsor', amount: '৳50,000', tier: 2, maxSponsors: 2,
    color: '#FFD700', bg: '#FFFBE6', text: '#B8860B', icon: 'medal',
    benefits: ['Gold tier logo placement on all banners', '8 VIP passes with priority seating', 'Shared promotional booth (premium location)', 'Social media mentions (5 dedicated posts)', 'Logo in event program & handbook', 'Stage announcement (3 times during event)', 'Complimentary catering for 5 guests', 'Brand roll-up at venue entrance']
  },
  {
    name: 'Silver Sponsor', amount: '৳25,000', tier: 3, maxSponsors: 3,
    color: '#C0C0C0', bg: '#F5F5F5', text: '#71717A', icon: 'medal',
    benefits: ['Logo on event banners', '5 VIP passes', 'Shared booth space', 'Social media mentions (3 posts)', 'Name in event program', 'Stage announcement (2 times)', 'Logo on digital screens']
  },
  {
    name: 'Bronze Sponsor', amount: '৳10,000', tier: 4, maxSponsors: 5,
    color: '#CD7F32', bg: '#FFF3E6', text: '#8B5E3C', icon: 'medal',
    benefits: ['Small logo on event banners', '2 VIP passes', 'Name in event program', 'Social media mention (1 post)', 'Certificate of appreciation']
  },
  {
    name: 'Community Partner', amount: '৳5,000', tier: 5, maxSponsors: 10,
    color: '#8B5CF6', bg: '#EDE9FE', text: '#6D28D9', icon: 'people',
    benefits: ['Name listed as community partner', '1 VIP pass', 'Social media thank-you post', 'Certificate of appreciation']
  }
];

export default function SponsorshipScreen() {
  const router = useRouter();
  const [expandedTier, setExpandedTier] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#FFFFFF' }}>Sponsorship Program</Text>
        </View>
        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 22 }}>
          Partner with EventifyJnU to showcase your brand among thousands of university students, faculty, and industry professionals.
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* Why Sponsor Section */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.gray[800], marginBottom: 16 }}>Why Sponsor Campus Events?</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[
              { icon: 'people', label: '5,000+', sub: 'Student Reach', color: COLORS.primary },
              { icon: 'trending-up', label: '85%', sub: 'Engagement Rate', color: COLORS.success },
              { icon: 'megaphone', label: '50K+', sub: 'Brand Impressions', color: COLORS.accent },
              { icon: 'heart', label: '95%', sub: 'Positive Recall', color: '#E11D48' }
            ].map((item, idx) => (
              <View key={idx} style={{ width: '46%', backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gray[100] }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: item.color + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: COLORS.gray[800] }}>{item.label}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[400] }}>{item.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sponsorship Tiers */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.gray[800], marginBottom: 6 }}>Sponsorship Tiers</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[400], marginBottom: 20 }}>Choose a package that fits your brand goals and budget.</Text>

          {TIERS.map((tier, idx) => {
            const isExpanded = expandedTier === idx;
            return (
              <TouchableOpacity key={idx} onPress={() => setExpandedTier(isExpanded ? null : idx)}
                style={{ backgroundColor: tier.bg, borderRadius: 16, marginBottom: 12, borderWidth: 2, borderColor: tier.color, overflow: 'hidden' }}>
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Ionicons name={tier.icon} size={24} color={tier.text} />
                      <View>
                        <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: COLORS.gray[800] }}>{tier.name}</Text>
                        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: COLORS.gray[400] }}>Up to {tier.maxSponsors} sponsor{tier.maxSponsors > 1 ? 's' : ''}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.primary }}>{tier.amount}</Text>
                      <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.gray[400]} />
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: tier.color + '60' }}>
                      {tier.benefits.map((benefit, bIdx) => (
                        <View key={bIdx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
                          <Ionicons name="checkmark-circle" size={18} color={tier.text} style={{ marginRight: 10, marginTop: 2 }} />
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: COLORS.gray[600], flex: 1 }}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* How It Works */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: COLORS.gray[800], marginBottom: 20 }}>How It Works</Text>
          {[
            { step: '1', icon: 'person-add', title: 'Create Profile', desc: 'Set up your organization profile with contact details and branding.' },
            { step: '2', icon: 'search', title: 'Explore Opportunities', desc: 'Browse upcoming events and select sponsorship tiers that match your goals.' },
            { step: '3', icon: 'paper-plane', title: 'Apply & Negotiate', desc: 'Submit your sponsorship application. Admin will review and approve.' },
            { step: '4', icon: 'card', title: 'Make Payment', desc: 'Complete payment via bank transfer, bKash, Nagad, or other methods.' },
            { step: '5', icon: 'bar-chart', title: 'Get Reports', desc: 'Receive detailed performance reports with registrations, attendance, and engagement metrics.' }
          ].map((item, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#FFFFFF' }}>{item.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: COLORS.gray[700] }}>{item.title}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[400], marginTop: 2 }}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={{ gap: 12, marginTop: 8 }}>
          <TouchableOpacity onPress={() => router.push('/sponsor/opportunities')}
            style={{ backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 16, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFFFFF', fontSize: 16 }}>Explore Opportunities</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/sponsor/dashboard')}
            style={{ backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: COLORS.primary, fontSize: 16 }}>Go to Sponsor Dashboard</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={{ backgroundColor: COLORS.gray[50], borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: COLORS.gray[200], flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <Ionicons name="mail" size={22} color={COLORS.info} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: COLORS.gray[700] }}>Interested in sponsoring?</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: COLORS.gray[400] }}>Contact us at sponsorship@eventifyjnu.com</Text>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </SafeAreaView>
  );
}