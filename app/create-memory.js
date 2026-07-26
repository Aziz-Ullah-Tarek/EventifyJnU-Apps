import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Image, Platform,
  TextInput, Alert, ActivityIndicator, ScrollView, Dimensions, KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const { width } = Dimensions.get('window');
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';
const MAX_IMAGES = 4;

const DefaultAvatar = ({ size = 44 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#0E3B6E', justifyContent: 'center', alignItems: 'center' }}>
    <Ionicons name="person" size={size * 0.55} color="#FFF" />
  </View>
);

const UserAvatar = ({ photoURL, size = 44 }) => {
  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E2E8F0' }} />;
  }
  return <DefaultAvatar size={size} />;
};

// Compress image to reduce base64 size
const compressImage = async (uri) => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return `data:image/jpeg;base64,${result.base64}`;
  } catch (e) {
    console.log('Compress error:', e);
    return null;
  }
};

export default function CreateMemoryScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace('/login');
      else setUser(u);
    });
    return unsub;
  }, []);

  const pickImage = async () => {
    const totalItems = images.length + imageUrls.length;
    if (totalItems >= MAX_IMAGES) {
      Alert.alert('Limit', `Maximum ${MAX_IMAGES} images per post`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera roll permission is needed');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const compressed = await compressImage(result.assets[0].uri);
      if (compressed) {
        setImages(prev => [...prev, compressed]);
      } else {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImages(prev => [...prev, base64Img]);
      }
    }
  };

  const takePhoto = async () => {
    const totalItems = images.length + imageUrls.length;
    if (totalItems >= MAX_IMAGES) {
      Alert.alert('Limit', `Maximum ${MAX_IMAGES} images per post`);
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera permission is needed');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const compressed = await compressImage(result.assets[0].uri);
      if (compressed) {
        setImages(prev => [...prev, compressed]);
      } else {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setImages(prev => [...prev, base64Img]);
      }
    }
  };

  const addImageUrl = () => {
    const totalItems = images.length + imageUrls.length;
    if (totalItems >= MAX_IMAGES) {
      Alert.alert('Limit', `Maximum ${MAX_IMAGES} images per post`);
      return;
    }
    const trimmed = urlInput.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }
    if (!trimmed.startsWith('http')) {
      Alert.alert('Error', 'Please enter a valid image URL (https://...)');
      return;
    }
    setImageUrls(prev => [...prev, trimmed]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeImageUrl = (index) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!user) {
      Alert.alert('Error', 'Please login first');
      return;
    }
    const allImages = [...images, ...imageUrls];
    if (allImages.length === 0) {
      Alert.alert('Error', 'Please add at least one image or image URL');
      return;
    }

    setPosting(true);
    try {
      const body = JSON.stringify({
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        userPhoto: user.photoURL || '',
        caption: caption.trim(),
        images: allImages
      });
      console.log('Posting, body size:', (body.length / 1024).toFixed(1), 'KB');

      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });

      const result = await res.json();
      console.log('Post response:', res.status);

      if (res.ok) {
        Alert.alert('Success', 'Memory shared! 🎉', [
          { text: 'View Feed', onPress: () => router.replace('/memories') },
          { text: 'Share More', style: 'cancel' }
        ]);
        setImages([]);
        setImageUrls([]);
        setCaption('');
      } else {
        Alert.alert('Error', result.message || 'Failed to post');
      }
    } catch (e) {
      console.error('Post error:', e);
      Alert.alert('Error', 'Network error. Is the backend running?');
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient colors={['#0E3B6E', '#1A56A8']} style={{ paddingTop: Platform.OS === 'ios' ? 0 : 10, paddingBottom: 16, paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 20, color: '#FFF' }}>
              Share Memory
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePost}
            disabled={posting || (images.length === 0 && imageUrls.length === 0)}
            style={{
              backgroundColor: posting || (images.length === 0 && imageUrls.length === 0) ? '#94A3B8' : '#E86F21',
              paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20
            }}
          >
            {posting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 14 }}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* User Info */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <UserAvatar photoURL={user?.photoURL} size={44} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1E293B' }}>
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#94A3B8' }}>
              Sharing an event memory...
            </Text>
          </View>
        </View>

        {/* Caption Input */}
        <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <TextInput
            placeholder="What's on your mind? Share your event memory..."
            placeholderTextColor="#94A3B8"
            value={caption}
            onChangeText={setCaption}
            maxLength={500}
            multiline
            style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: '#1E293B', minHeight: 80, textAlignVertical: 'top' }}
          />
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: caption.length >= 500 ? '#E83F3F' : '#94A3B8', textAlign: 'right', marginTop: 4 }}>
            {caption.length}/500
          </Text>
        </View>

        {/* Image Preview Area */}
        {(images.length > 0 || imageUrls.length > 0) ? (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {images.map((img, idx) => (
                <View key={`img-${idx}`} style={{ position: 'relative', width: (width - 40) / 2, height: (width - 40) / 2 }}>
                  <Image
                    source={{ uri: img }}
                    style={{ width: '100%', height: '100%', borderRadius: 12, resizeMode: 'contain', backgroundColor: '#F1F5F9' }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(idx)}
                    style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 9, color: '#FFF' }}>📱 Upload</Text>
                  </View>
                </View>
              ))}
              {imageUrls.map((url, idx) => (
                <View key={`url-${idx}`} style={{ position: 'relative', width: (width - 40) / 2, height: (width - 40) / 2 }}>
                  <Image
                    source={{ uri: url }}
                    style={{ width: '100%', height: '100%', borderRadius: 12, resizeMode: 'contain', backgroundColor: '#F1F5F9' }}
                  />
                  <TouchableOpacity
                    onPress={() => removeImageUrl(idx)}
                    style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' }}
                  >
                    <Ionicons name="close" size={16} color="#FFF" />
                  </TouchableOpacity>
                  <View style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(16,185,129,0.7)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 9, color: '#FFF' }}>🔗 URL</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ backgroundColor: '#FFF', borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', padding: 30, alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="images-outline" size={48} color="#CBD5E1" />
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#94A3B8', marginTop: 8, textAlign: 'center' }}>
              Add photos or paste image URLs
            </Text>
          </View>
        )}

        {/* Add Image Buttons */}
        {(images.length + imageUrls.length) < MAX_IMAGES && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={pickImage}
                style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name="images" size={22} color="#0E3B6E" />
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#0E3B6E', marginLeft: 8 }}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={takePhoto}
                style={{ flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name="camera" size={22} color="#E86F21" />
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#E86F21', marginLeft: 8 }}>Camera</Text>
              </TouchableOpacity>
            </View>

            {/* Image URL Input */}
            {!showUrlInput ? (
              <TouchableOpacity
                onPress={() => setShowUrlInput(true)}
                style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#10B981', borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'center' }}
              >
                <Ionicons name="link" size={22} color="#10B981" />
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#10B981', marginLeft: 8 }}>Paste Image URL</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#6B7280', marginLeft: 6 }}>(imgbb, etc.)</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#10B981' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#10B981', marginBottom: 8 }}>
                  🔗 Paste Image URL
                </Text>
                <TextInput
                  placeholder="https://i.ibb.co/your-image.jpg"
                  placeholderTextColor="#9CA3AF"
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{ backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1E293B' }}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={addImageUrl}
                    style={{ flex: 1, backgroundColor: '#10B981', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 13 }}>Add URL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { setShowUrlInput(false); setUrlInput(''); }}
                    style={{ backgroundColor: '#F3F4F6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' }}
                  >
                    <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#6B7280', fontSize: 13 }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tips */}
        <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="bulb" size={18} color="#0E3B6E" />
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#0E3B6E', marginLeft: 6 }}>Tips</Text>
          </View>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#475569', lineHeight: 18 }}>
            • Share up to {MAX_IMAGES} images per post{'\n'}
            • Upload directly or paste image URL (imgbb recommended){'\n'}
            • Using image URLs reduces server load{'\n'}
            • Be respectful & follow community guidelines
          </Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
