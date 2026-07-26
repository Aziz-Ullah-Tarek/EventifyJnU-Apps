// Tab entry point for Memories - Facebook-style social feed
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Platform,
  ActivityIndicator, RefreshControl, TextInput, Dimensions, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../constants/firebase';

const { width } = Dimensions.get('window');
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const DefaultAvatar = ({ size = 42 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#0E3B6E', justifyContent: 'center', alignItems: 'center' }}>
    <Ionicons name="person" size={size * 0.55} color="#FFF" />
  </View>
);

const UserAvatar = ({ photoURL, size = 42 }) => {
  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E2E8F0' }} />;
  }
  return <DefaultAvatar size={size} />;
};

export default function MemoriesScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [menuPostId, setMenuPostId] = useState(null); // 3-dot menu modal

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) fetchPosts();
      else setLoading(false);
    });
    return unsub;
  }, [fetchPosts]);

  const onRefresh = () => { setRefreshing(true); fetchPosts(); };

  const handleLove = async (postId) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/love`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: user.email })
      });
      if (res.ok) {
        const { loveReacts, likes } = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, loveReacts, likes } : p));
      }
    } catch (e) {}
  };

  const handleComment = async (postId) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    const text = commentInputs[postId].trim();
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: user.displayName || user.email?.split('@')[0] || 'User',
          userPhoto: user.photoURL || '',
          text
        })
      });
      if (res.ok) {
        const { comments } = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments } : p));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (e) {}
  };

  const handleDeletePost = (postId) => {
    setMenuPostId(null);
    Alert.alert('Delete Post', 'Are you sure you want to delete this memory?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/posts/${postId}?userEmail=${encodeURIComponent(user.email?.toLowerCase())}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            setPosts(prev => prev.filter(p => p._id !== postId));
            Alert.alert('Deleted', 'Your memory has been deleted.');
          } else {
            Alert.alert('Error', data.message || 'Failed to delete');
          }
        } catch (e) {
          Alert.alert('Error', 'Network error');
        }
      }}
    ]);
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/comment/${commentId}?userEmail=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (res.ok) {
        const { comments } = await res.json();
        setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments } : p));
      }
    } catch (e) {}
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="images-outline" size={80} color="#0E3B6E" />
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#0E3B6E', marginTop: 20, textAlign: 'center' }}>Event Memories</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>Login to share and view event memories</Text>
          <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 24, backgroundColor: '#0E3B6E', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 16 }}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E3B6E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
      <StatusBar style="dark" />

      {/* Header with title and messenger icon */}
      <View style={{ backgroundColor: '#FFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E4E6EB', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#0E3B6E' }}>Memories</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280' }}>Share & connect with CSE family</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/messenger')}
          style={{ backgroundColor: '#E8F0FE', borderRadius: 30, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="chatbubbles" size={20} color="#0E3B6E" />
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#0E3B6E', marginLeft: 6 }}>Chat</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0E3B6E']} tintColor="#0E3B6E" />}>

        {/* Share prompt at top */}
        <TouchableOpacity onPress={() => router.push('/create-memory')}
          style={{ backgroundColor: '#FFF', margin: 12, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E4E6EB' }}>
          <UserAvatar photoURL={user?.photoURL} size={40} />
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: '#65676B', marginLeft: 10, flex: 1 }}>Share an event memory...</Text>
          <Ionicons name="images" size={22} color="#45BD62" />
        </TouchableOpacity>

        {posts.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
            <Ionicons name="camera-outline" size={70} color="#CBD5E1" />
            <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#94A3B8', marginTop: 16, textAlign: 'center' }}>No memories yet</Text>
            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Be the first to share an event memory!</Text>
            <TouchableOpacity onPress={() => router.push('/create-memory')}
              style={{ marginTop: 20, backgroundColor: '#0E3B6E', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 25 }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 14 }}>Share Memory</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post) => {
            const isLoved = user && post.loveReacts?.includes(user.email?.toLowerCase());
            const showComments = expandedComments[post._id];
            const totalReactions = (post.loveReacts?.length || 0);
            const isOwner = user?.email?.toLowerCase() === post.userEmail?.toLowerCase();

            return (
              <View key={post._id} style={{ backgroundColor: '#FFF', marginHorizontal: 12, marginBottom: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>

                {/* ===== IMAGE SECTION (like events card) ===== */}
                <View style={{ position: 'relative' }}>
                  {post.images && post.images.length > 0 ? (
                    post.images.length === 1 ? (
                      <Image source={{ uri: post.images[0] }} style={{ width: '100%', height: 300 }} resizeMode="cover" />
                    ) : (
                      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                        {post.images.map((img, idx) => (
                          <Image key={idx} source={{ uri: img }} style={{ width: width - 24, height: 300 }} resizeMode="cover" />
                        ))}
                      </ScrollView>
                    )
                  ) : null}

                  {/* Image counter dots */}
                  {post.images && post.images.length > 1 && (
                    <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                      {post.images.map((_, idx) => (
                        <View key={idx} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' }} />
                      ))}
                    </View>
                  )}

                  {/* Poster Name & Avatar Overlay on Image */}
                  <View style={{ position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <UserAvatar photoURL={post.userPhoto} size={40} />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }}>{post.userName || 'User'}</Text>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.9)', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>{formatTime(post.createdAt)}</Text>
                    </View>
                    {isOwner && (
                      <TouchableOpacity onPress={() => setMenuPostId(post._id)} style={{ padding: 8 }}>
                        <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* ===== CAPTION ===== */}
                {post.caption ? (
                  <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: '#1C1E21', lineHeight: 22 }}>{post.caption}</Text>
                  </View>
                ) : null}

                {/* ===== REACTION STATS BAR ===== */}
                <View style={{ paddingHorizontal: 16, paddingTop: post.caption ? 8 : 14, paddingBottom: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {totalReactions > 0 && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#E83F3F', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' }}>
                            <Ionicons name="heart" size={11} color="#FFF" />
                          </View>
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#65676B', marginLeft: 6 }}>{totalReactions}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => toggleComments(post._id)}>
                      <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#65676B' }}>
                        {(post.comments?.length || 0) > 0 ? `${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}` : 'Comment'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ===== DIVIDER ===== */}
                <View style={{ height: 1, backgroundColor: '#E4E6EB', marginHorizontal: 16 }} />

                {/* ===== ACTION BUTTONS (Love | Comment) ===== */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 }}>
                  <TouchableOpacity onPress={() => handleLove(post._id)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6 }}>
                    <Ionicons name={isLoved ? "heart" : "heart-outline"} size={22} color={isLoved ? '#E83F3F' : '#65676B'} />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: isLoved ? '#E83F3F' : '#65676B', marginLeft: 6 }}>Love</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => toggleComments(post._id)}
                    style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 6 }}>
                    <Ionicons name="chatbubble-outline" size={22} color="#65676B" />
                    <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#65676B', marginLeft: 6 }}>Comment</Text>
                  </TouchableOpacity>
                </View>

                {/* ===== DIVIDER ===== */}
                <View style={{ height: 1, backgroundColor: '#E4E6EB', marginHorizontal: 16 }} />

                {/* ===== COMMENTS SECTION ===== */}
                {showComments && (
                  <View style={{ paddingHorizontal: 16, paddingBottom: 14, paddingTop: 10, backgroundColor: '#F8F9FA' }}>
                    {post.comments && post.comments.length > 0 && post.comments.map((comment, idx) => (
                      <View key={comment._id || idx} style={{ flexDirection: 'row', marginTop: idx === 0 ? 0 : 10, alignItems: 'flex-start' }}>
                        <UserAvatar photoURL={comment.userPhoto} size={34} />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                          <View style={{ backgroundColor: '#FFF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: '#1E293B' }}>{comment.userName || 'User'}</Text>
                              {user?.email?.toLowerCase() === comment.userEmail?.toLowerCase() && (
                                <TouchableOpacity onPress={() => handleDeleteComment(post._id, comment._id)}>
                                  <Ionicons name="close-circle" size={16} color="#CBD5E1" />
                                </TouchableOpacity>
                              )}
                            </View>
                            <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1C1E21', marginTop: 3 }}>{comment.text}</Text>
                          </View>
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#65676B', marginLeft: 14, marginTop: 3 }}>{formatTime(comment.createdAt)}</Text>
                        </View>
                      </View>
                    ))}

                    {/* Comment Input */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                      <UserAvatar photoURL={user?.photoURL} size={34} />
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8, backgroundColor: '#FFF', borderRadius: 24, borderWidth: 1, borderColor: '#E4E6EB', paddingHorizontal: 16 }}>
                        <TextInput placeholder="Write a comment..." placeholderTextColor="#8A8D91"
                          value={commentInputs[post._id] || ''}
                          onChangeText={(t) => setCommentInputs(prev => ({ ...prev, [post._id]: t }))}
                          maxLength={500}
                          multiline
                          style={{ flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#1C1E21', paddingVertical: 10, maxHeight: 80 }} />
                        <TouchableOpacity onPress={() => handleComment(post._id)} disabled={!commentInputs[post._id]?.trim()}>
                          <Ionicons name="send" size={22} color={commentInputs[post._id]?.trim() ? '#0E3B6E' : '#BCC0C4'} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ===== 3-DOT MENU MODAL - Centered compact popup ===== */}
      <Modal visible={!!menuPostId} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setMenuPostId(null)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 40 }}
        >
          <TouchableOpacity activeOpacity={1} style={{ backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxWidth: 300, overflow: 'hidden' }}>
            {/* Header */}
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#1F2937', textAlign: 'center' }}>
                Post Options
              </Text>
            </View>

            {/* Delete Option */}
            <TouchableOpacity
              onPress={() => handleDeletePost(menuPostId)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </View>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#DC2626', flex: 1 }}>Delete Post</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setMenuPostId(null)}
              style={{ paddingVertical: 14, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#6B7280' }}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

