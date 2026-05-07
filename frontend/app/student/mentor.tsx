import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function Mentor() {
  const { user } = useAuth();
  const [sessionId] = useState(() => `mentor_${user?.user_id}_${Date.now()}`);
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'مرحباً! أنا مرشد تمكين الذكي. اسألني عن أي موضوع دراسي وسأساعدك.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => { scroll.current?.scrollToEnd({ animated: true }); }, [messages]);

  const send = async () => {
    const text = input.trim(); if (!text || busy) return;
    setMessages(m => [...m, { role:'user', content: text }]); setInput(''); setBusy(true);
    try {
      const r = await api('/ai/chat', { method:'POST', body: JSON.stringify({
        session_id: sessionId, message: text, mode: 'mentor',
        context: { department: user?.department, level: user?.level },
      })});
      setMessages(m => [...m, { role:'assistant', content: r.reply }]);
    } catch (e:any) {
      setMessages(m => [...m, { role:'assistant', content: `خطأ: ${e.message}` }]);
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.c} testID="mentor-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <View style={s.head}>
          <Ionicons name="sparkles" size={22} color={theme.colors.primary} />
          <Text style={s.title}>المرشد الذكي</Text>
        </View>
        <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={{padding: theme.spacing.md}}>
          {messages.map((m, i) => (
            <View key={i} style={[s.bubble, m.role==='user' ? s.uBubble : s.aBubble]}>
              <Text style={[s.bT, m.role==='user' && {color:'#fff'}]}>{m.content}</Text>
            </View>
          ))}
          {busy && <ActivityIndicator color={theme.colors.primary} style={{marginVertical:8}} />}
        </ScrollView>
        <View style={s.inputRow}>
          <TextInput testID="mentor-input" style={s.in} value={input} onChangeText={setInput} placeholder="اكتب سؤالك..." placeholderTextColor={theme.colors.textTer} multiline />
          <TouchableOpacity testID="mentor-send" onPress={send} disabled={busy} style={s.sendBtn}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', alignItems:'center', gap: 8, padding: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  bubble: { padding: 12, borderRadius: 16, marginVertical: 4, maxWidth: '85%' },
  uBubble: { backgroundColor: theme.colors.primary, alignSelf: 'flex-start' },
  aBubble: { backgroundColor: theme.colors.surface, alignSelf: 'flex-end', borderWidth:1, borderColor: theme.colors.border },
  bT: { color: theme.colors.text, fontSize: 14, lineHeight: 20, textAlign:'right' },
  inputRow: { flexDirection:'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems: 'flex-end' },
  in: { flex:1, backgroundColor: theme.colors.surfaceAlt, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 120, textAlign: 'right', color: theme.colors.text },
  sendBtn: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, alignItems:'center', justifyContent:'center' },
});
