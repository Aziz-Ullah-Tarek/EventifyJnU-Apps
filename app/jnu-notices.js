import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';

export default function JnuNoticesScreen() {
  const router = useRouter();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotices = async () => {
    try {
      setError(null);
      const res = await fetch(`${API_BASE_URL}/jnu-notices`);
      const data = await res.json();
      if (data.success) {
        setNotices(data.notices);
      } else {
        setError(data.message || 'Failed to fetch notices');
      }
    } catch (err) {
      setError('Could not connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotices();
  };

  const handleOpenPdf = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleOpenDetail = async (detailUrl) => {
    if (!detailUrl) {
      Alert.alert('Info', 'No detail page available for this notice.');
      return;
    }
    try {
      // Fetch detail page to find PDFs
      const res = await fetch(
        `${API_BASE_URL}/jnu-notices/detail?url=${encodeURIComponent(detailUrl)}`
      );
      const data = await res.json();
      if (data.success && data.pdfLinks.length > 0) {
        // Open the first PDF
        handleOpenPdf(data.pdfLinks[0].url);
      } else if (data.success && data.pdfLinks.length === 0) {
        // No PDFs found, open the detail page in browser
        handleOpenPdf(detailUrl);
      } else {
        handleOpenPdf(detailUrl);
      }
    } catch (err) {
      // Fallback: open detail URL in browser
      handleOpenPdf(detailUrl);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0E3B6E' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: Platform.OS === 'ios' ? 60 : 40,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)',
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Montserrat_700Bold',
              color: '#FFFFFF',
              fontSize: 22,
            }}
          >
            JnU Notices
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              color: '#A0AEC0',
              fontSize: 12,
            }}
          >
            Official notices from Jagannath University
          </Text>
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#E86F21" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#E86F21" />
          <Text
            style={{
              fontFamily: 'Poppins_400Regular',
              color: '#A0AEC0',
              marginTop: 12,
              fontSize: 14,
            }}
          >
            Fetching notices from JnU website...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Ionicons name="cloud-offline-outline" size={60} color="#EF4444" />
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              color: '#EF4444',
              fontSize: 18,
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchNotices}
            style={{
              marginTop: 20,
              backgroundColor: '#E86F21',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins_700Bold',
                color: '#FFFFFF',
                fontSize: 14,
              }}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : notices.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Ionicons name="document-text-outline" size={60} color="#A0AEC0" />
          <Text
            style={{
              fontFamily: 'Poppins_700Bold',
              color: '#A0AEC0',
              fontSize: 16,
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            No notices found at the moment.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#E86F21"
              colors={['#E86F21']}
            />
          }
        >
          {/* Info Banner */}
          <View
            style={{
              backgroundColor: 'rgba(232,111,33,0.15)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(232,111,33,0.3)',
            }}
          >
            <Ionicons name="information-circle" size={20} color="#E86F21" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontFamily: 'Poppins_400Regular',
                color: '#FBD38D',
                fontSize: 12,
                flex: 1,
              }}
            >
              Showing latest notices from JnU official website. Tap on a notice to view details or download PDF.
            </Text>
          </View>

          {/* Notice List */}
          {notices.map((notice, index) => (
            <TouchableOpacity
              key={notice.id || index}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
              onPress={() => {
                if (notice.pdfLinks && notice.pdfLinks.length > 0) {
                  // If PDF links exist, show options
                  if (notice.pdfLinks.length === 1) {
                    handleOpenPdf(notice.pdfLinks[0].url);
                  } else {
                    // Multiple PDFs - open first one
                    handleOpenPdf(notice.pdfLinks[0].url);
                  }
                } else if (notice.detailUrl) {
                  handleOpenDetail(notice.detailUrl);
                } else {
                  Alert.alert('Info', 'No link available for this notice.');
                }
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                {/* Number Badge */}
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#E86F21',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                    marginTop: 2,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Montserrat_700Bold',
                      color: '#FFFFFF',
                      fontSize: 14,
                    }}
                  >
                    {index + 1}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins_700Bold',
                      color: '#FFFFFF',
                      fontSize: 15,
                      lineHeight: 22,
                    }}
                    numberOfLines={3}
                  >
                    {notice.title}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 8,
                    }}
                  >
                    {notice.date ? (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color="#A0AEC0"
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontFamily: 'Poppins_400Regular',
                            color: '#A0AEC0',
                            fontSize: 12,
                          }}
                        >
                          {notice.date}
                        </Text>
                      </View>
                    ) : null}

                    {/* PDF Badge */}
                    {notice.pdfLinks && notice.pdfLinks.length > 0 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginLeft: 12,
                          backgroundColor: 'rgba(239,68,68,0.2)',
                          paddingHorizontal: 8,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}
                      >
                        <Ionicons
                          name="document-text"
                          size={12}
                          color="#EF4444"
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={{
                            fontFamily: 'Poppins_700Bold',
                            color: '#EF4444',
                            fontSize: 10,
                          }}
                        >
                          PDF
                        </Text>
                      </View>
                    )}

                    {/* Detail Link Badge */}
                    {(!notice.pdfLinks || notice.pdfLinks.length === 0) &&
                      notice.detailUrl && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 12,
                            backgroundColor: 'rgba(59,130,246,0.2)',
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Ionicons
                            name="open-outline"
                            size={12}
                            color="#3B82F6"
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={{
                              fontFamily: 'Poppins_700Bold',
                              color: '#3B82F6',
                              fontSize: 10,
                            }}
                          >
                            View
                          </Text>
                        </View>
                      )}
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#A0AEC0"
                  style={{ marginLeft: 8, marginTop: 4 }}
                />
              </View>
            </TouchableOpacity>
          ))}

          {/* Footer */}
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 20,
            }}
          >
            <Text
              style={{
                fontFamily: 'Poppins_400Regular',
                color: '#4A5568',
                fontSize: 11,
              }}
            >
              Data sourced from jnu.ac.bd
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
