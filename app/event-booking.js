import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, StyleSheet, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const MOCK_EVENTS = {
  '1': { id: '1', title: 'Tech Symposium 2026', price: 'Free', priceValue: 0, category: 'Tech' },
  '2': { id: '2', title: 'Annual Cultural Fest', price: '$15.00', priceValue: 15, category: 'Culture' },
  '3': { id: '3', title: 'StartUp Pitch Deck', price: 'Free', priceValue: 0, category: 'Business' },
  '4': { id: '4', title: 'Inter-Department Basketball', price: 'Free', priceValue: 0, category: 'Sports' },
  '5': { id: '5', title: 'AI & Data Science Workshop', price: '$5.00', priceValue: 5, category: 'Tech' },
};

export default function EventBookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const event = MOCK_EVENTS[id] || MOCK_EVENTS['1'];

  const handlePayment = async () => {
    setLoading(true);
    // Simulating Stripe Payment Process in Test Mode
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={100} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>Registration Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your spot has been reserved for {event.title}. A confirmation email has been sent to your student ID.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/tickets')}
          >
            <Text style={styles.buttonText}>View My Tickets</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Registration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepContainer}>
            <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.activeStep]}><Text style={styles.stepNum}>1</Text></View>
                <Text style={styles.stepLabel}>Details</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
                <View style={[styles.stepDot, styles.activeStep]}><Text style={styles.stepNum}>2</Text></View>
                <Text style={styles.stepLabel}>Payment</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
                <View style={styles.stepDot}><Text style={styles.stepNum}>3</Text></View>
                <Text style={styles.stepLabel}>Ticket</Text>
            </View>
        </View>

        {/* Event Summary Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventLabel}>Event</Text>
              <Text style={styles.eventTitle}>{event.title}</Text>
            </View>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>1x</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{event.price}</Text>
          </View>
        </View>

        {/* Payment Section (Simulated Stripe UI) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={24} color="#0E3B6E" />
            <Text style={styles.paymentText}>Credit or Debit Card</Text>
            <Ionicons name="checkmark-circle" size={20} color="#0E3B6E" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
          
          <View style={styles.stripePlaceholder}>
             <View style={styles.placeholderRow}>
                <Text style={styles.placeholderLabel}>Card Number</Text>
                <Text style={styles.placeholderValue}>**** **** **** 4242</Text>
             </View>
             <View style={[styles.placeholderRow, { marginTop: 12 }]}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.placeholderLabel}>Expiry</Text>
                    <Text style={styles.placeholderValue}>12 / 26</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.placeholderLabel}>CVC</Text>
                    <Text style={styles.placeholderValue}>***</Text>
                </View>
             </View>
          </View>

          <View style={styles.testInfo}>
            <Ionicons name="information-circle" size={18} color="#6B7280" />
            <Text style={styles.testText}>Stripe Test Mode Enabled</Text>
          </View>
        </View>

        <View style={styles.policySection}>
          <Ionicons name="shield-checkmark" size={20} color="#6B7280" style={{ marginRight: 8 }} />
          <Text style={styles.policyText}>
            Secure payment powered by Stripe. Your data is protected by industry-standard encryption.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payButton, loading && styles.disabledButton]} 
          onPress={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonInner}>
                <Ionicons name="lock-closed" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.payButtonText}>
                {event.priceValue > 0 ? `Pay ${event.price}` : 'Confirm Registration'}
                </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollContent: {
    padding: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeStep: {
    backgroundColor: '#0E3B6E',
  },
  stepNum: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 10,
    marginTop: -15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  qtyBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0E3B6E',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#E86F21',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0E3B6E',
    marginBottom: 16,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
  },
  stripePlaceholder: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  placeholderLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placeholderValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 2,
  },
  placeholderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  testText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  policySection: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  policyText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  payButton: {
    backgroundColor: '#0E3B6E',
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E3B6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  successIconContainer: {
    width: 140,
    height: 140,
    backgroundColor: '#ECFDF5',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#0E3B6E',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});