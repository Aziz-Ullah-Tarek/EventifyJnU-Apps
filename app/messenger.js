import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Platform,
  ActivityIndicator, TextInput, KeyboardAvoidingView, Alert, Modal, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../constants/firebase';

const { width } = Dimensions.get('window');
const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api';

const GROUP_ICONS = {
  'JnU CSE Connect': 'chatbubbles',
  'CSE CR Community': 'people',
  'CSE Faculty & Students': 'school',
};

const GROUP_COLORS = {
  'JnU CSE Connect': '#0E3B6E',
  'CSE CR Community': '#7C3AED',
  'CSE Faculty & Students': '#059669',
};

const DefaultAvatar = ({ size = 36 }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#0E3B6E', justifyContent: 'center', alignItems: 'center' }}>
    <Ionicons name="person" size={size * 0.55} color="#FFF" />
  </View>
);

const UserAvatar = ({ photoURL, size = 36 }) => {
  if (photoURL) {
    return <Image source={{ uri: photoURL }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E2E8F0' }} />;
  }
  return <DefaultAvatar size={size} />;
};

// ======================
// GROUP LIST SCREEN
// ======================
function GroupListScreen({ user, onSelectGroup, router }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/messenger/groups`);
        if (res.ok) setGroups(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ backgroundColor: '#0E3B6E', paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A5A9E', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="chatbubbles" size={22} color="#FFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#FFF' }}>Messenger</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>CSE Group Chats</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0E3B6E" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#1F2937', marginBottom: 16 }}>Available Groups</Text>
          {groups.map((g) => (
            <TouchableOpacity
              key={g.id}
              onPress={() => onSelectGroup(g.id)}
              style={{
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
                borderLeftWidth: 4,
                borderLeftColor: g.color,
              }}
            >
              {/* Group Icon */}
              <View style={{
                width: 56, height: 56, borderRadius: 16,
                backgroundColor: g.color + '15',
                justifyContent: 'center', alignItems: 'center',
              }}>
                <Ionicons name={GROUP_ICONS[g.id] || 'chatbubbles'} size={28} color={g.color} />
              </View>

              {/* Group Info */}
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#1F2937' }}>{g.name}</Text>
                <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6B7280', marginTop: 2 }}>{g.members}</Text>
              </View>

              {/* Arrow */}
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ======================
// CHAT SCREEN
// ======================
function ChatScreen({ groupId, user, onBack, router }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const scrollRef = useRef(null);

  const groupColor = GROUP_COLORS[groupId] || '#0E3B6E';
  const groupIcon = GROUP_ICONS[groupId] || 'chatbubbles';

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages?group=${encodeURIComponent(groupId)}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    if (!loading && messages.length > 0 && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), 200);
    }
  }, [messages, loading]);

  // Poll
  useEffect(() => {
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!user || !inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group: groupId,
          userEmail: user.email,
          userName: user.displayName || user.email?.split('@')[0] || 'User',
          userPhoto: user.photoURL || '',
          text
        })
      });
      if (res.ok) await fetchMessages();
    } catch (e) { console.error(e); }
    finally { setSending(false); }
  };

  const handleDeleteMessage = async () => {
    if (!user || !deleteTarget) return;
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${deleteTarget}?userEmail=${encodeURIComponent(user.email)}`, { method: 'DELETE' });
      if (res.ok) setMessages(prev => prev.filter(m => m._id !== deleteTarget));
    } catch (e) { console.error(e); }
    finally { setDeleteTarget(null); }
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const groupMessagesByDate = (msgs) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];
    msgs.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) groups.push({ date: currentDate, messages: currentGroup });
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });
    if (currentGroup.length > 0) groups.push({ date: currentDate, messages: currentGroup });
    return groups;
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={groupColor} />
      </SafeAreaView>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
      <StatusBar style="dark" />

      {/* Chat Header */}
      <View style={{ backgroundColor: groupColor, paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={onBack} style={{ marginRight: 10 }}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name={groupIcon} size={22} color="#FFF" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 16, color: '#FFF' }}>{groupId}</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.8)' }}>
            {messages.length > 0 ? `${messages.length} messages` : 'Group chat'}
          </Text>
        </View>
        <TouchableOpacity onPress={fetchMessages} style={{ padding: 8 }}>
          <Ionicons name="refresh" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
              <Ionicons name="chatbubble-ellipses-outline" size={70} color="#CBD5E1" />
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 18, color: '#94A3B8', marginTop: 16, textAlign: 'center' }}>No messages yet</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>Be the first to say something!</Text>
            </View>
          ) : (
            groupedMessages.map((group, gIdx) => (
              <View key={gIdx}>
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  <View style={{ backgroundColor: '#E4E6EB', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 }}>
                    <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#65676B' }}>{group.date}</Text>
                  </View>
                </View>
                {group.messages.map((msg, mIdx) => {
                  const isMine = user?.email?.toLowerCase() === msg.userEmail?.toLowerCase();
                  const showAvatar = mIdx === 0 || group.messages[mIdx - 1]?.userEmail !== msg.userEmail;
                  return (
                    <TouchableOpacity
                      key={msg._id}
                      activeOpacity={isMine ? 0.7 : 1}
                      onLongPress={() => isMine && setDeleteTarget(msg._id)}
                      style={{
                        flexDirection: isMine ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        marginBottom: 4,
                        marginLeft: isMine ? 50 : 0,
                        marginRight: isMine ? 0 : 50,
                      }}
                    >
                      {showAvatar ? (
                        <View style={{ marginHorizontal: 6 }}>
                          <UserAvatar photoURL={msg.userPhoto} size={32} />
                        </View>
                      ) : (
                        <View style={{ width: 44 }} />
                      )}
                      <View style={{
                        maxWidth: '78%',
                        backgroundColor: isMine ? groupColor : '#FFF',
                        borderRadius: 18,
                        borderBottomRightRadius: isMine ? 4 : 18,
                        borderBottomLeftRadius: !isMine && showAvatar ? 4 : 18,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        marginTop: showAvatar ? 0 : 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 3,
                        elevation: 2,
                      }}>
                        {!isMine && showAvatar && (
                          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 12, color: groupColor, marginBottom: 2 }}>
                            {msg.userName || 'User'}
                          </Text>
                        )}
                        <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 15, color: isMine ? '#FFF' : '#1C1E21', lineHeight: 21 }}>
                          {msg.text}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
                          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 10, color: isMine ? 'rgba(255,255,255,0.7)' : '#9CA3AF' }}>
                            {formatTime(msg.createdAt)}
                          </Text>
                          {isMine && <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 4 }} />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={{
          backgroundColor: '#FFF',
          borderTopWidth: 1, borderTopColor: '#E4E6EB',
          paddingHorizontal: 12, paddingVertical: 10,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          flexDirection: 'row', alignItems: 'flex-end',
        }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'flex-end',
            backgroundColor: '#F0F2F5', borderRadius: 24,
            paddingHorizontal: 16, paddingVertical: 4, marginRight: 8,
          }}>
            <TextInput
              placeholder="Type a message..."
              placeholderTextColor="#8A8D91"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              style={{ flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 15, color: '#1C1E21', maxHeight: 100, paddingVertical: 8 }}
              onKeyPress={(e) => {
                if (Platform.OS === 'web' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: inputText.trim() ? groupColor : '#BCC0C4', justifyContent: 'center', alignItems: 'center' }}
          >
            {sending ? <ActivityIndicator size="small" color="#FFF" /> : <Ionicons name="send" size={20} color="#FFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Delete Modal */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <TouchableOpacity activeOpacity={1} onPress={() => setDeleteTarget(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <TouchableOpacity activeOpacity={1} style={{ backgroundColor: '#FFF', borderRadius: 20, width: '100%', maxWidth: 280, overflow: 'hidden' }}>
            <View style={{ paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center' }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="trash-outline" size={28} color="#DC2626" />
              </View>
              <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 17, color: '#1F2937', textAlign: 'center' }}>Delete Message?</Text>
              <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6 }}>This action cannot be undone.</Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => setDeleteTarget(null)} style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#F3F4F6' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#6B7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteMessage} style={{ flex: 1, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#DC2626' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ======================
// MAIN MESSENGER SCREEN
// ======================
export default function MessengerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(params?.group || null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  if (authLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0E3B6E" />
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F0F2F5' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Ionicons name="chatbubbles" size={80} color="#0E3B6E" />
          <Text style={{ fontFamily: 'Montserrat_700Bold', fontSize: 22, color: '#0E3B6E', marginTop: 20, textAlign: 'center' }}>Messenger</Text>
          <Text style={{ fontFamily: 'Poppins_400Regular', fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' }}>Login to join CSE group chats</Text>
          <TouchableOpacity onPress={() => router.push('/login')} style={{ marginTop: 24, backgroundColor: '#0E3B6E', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 }}>
            <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#FFF', fontSize: 16 }}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGroup) {
    return (
      <ChatScreen
        groupId={selectedGroup}
        user={user}
        onBack={() => setSelectedGroup(null)}
        router={router}
      />
    );
  }

  return (
    <GroupListScreen
      user={user}
      onSelectGroup={setSelectedGroup}
      router={router}
    />
  );
}
