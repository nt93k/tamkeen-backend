import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/api';
import { useAuth } from '../src/auth';
import { theme } from '../src/theme';

export default function Interview() {
  const { user } = useAuth();
  const [sessionId] = useState(() => `interview_${user?.user_id}_${Date.now()}`);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scroll = useRef<ScrollView>(null);

  useEffect(() => {
    // start with first question
    (async () => {
      setBusy(true);
      try {
        const r = await api('/ai/chat', { method:'POST', body: JSON.stringify({
          session_id: sessionId, mode: 'interview',
          message: 'ابدأ المقابلة بسؤال تعريفي',
          context: { department: user?.department },
        })});
        setMessages([{ role:'assistant', content: r.reply }]);
      } catch (e:any) { setMessages([{role:'assistant', content:`خطأ: ${e.message}`}]); }
      finally { setBusy(false); }
    })();
  }, []);
  useEffect(() => { scroll.current?.scrollToEnd({animated:true}); }, [messages]);

  const send = async () => {
    const t = input.trim(); if (!t || busy) return;
    setMessages(m=>[...m,{role:'user',content:t}]); setInput(''); setBusy(true);
    try {
      const r = await api('/ai/chat', { method:'POST', body: JSON.stringify({
        session_id: sessionId, mode:'interview', message: t,
        context: { department: user?.department },
      })});
      setMessages(m=>[...m,{role:'assistant',content:r.reply}]);
    } catch(e:any){ setMessages(m=>[...m,{role:'assistant',content:`خطأ: ${e.message}`}]); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.c} testID="interview-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <View style={s.head}>
          <TouchableOpacity onPress={()=>router.back()}><Ionicons name="chevron-forward" size={24} color={theme.colors.text} /></TouchableOpacity>
          <Text style={s.title}>المقابلة الافتراضية</Text>
          <View style={{width:24}} />
        </View>
        <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={{padding: 16}}>
          {messages.map((m,i)=>(
            <View key={i} style={[s.bubble, m.role==='user'?s.u:s.a]}>
              <Text style={[s.t, m.role==='user' && {color:'#fff'}]}>{m.content}</Text>
            </View>
          ))}
          {busy && <ActivityIndicator color={theme.colors.primary} />}
        </ScrollView>
        <View style={s.row}>
          <TextInput testID="interview-input" style={s.in} value={input} onChangeText={setInput} placeholder="إجابتك..." placeholderTextColor={theme.colors.textTer} multiline />
          <TouchableOpacity testID="interview-send" onPress={send} disabled={busy} style={s.send}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 12, borderBottomWidth:1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  bubble: { padding: 12, borderRadius: 16, marginVertical: 4, maxWidth: '85%' },
  u: { backgroundColor: theme.colors.primary, alignSelf:'flex-start' },
  a: { backgroundColor: theme.colors.surface, alignSelf:'flex-end', borderWidth:1, borderColor: theme.colors.border },
  t: { color: theme.colors.text, fontSize: 14, lineHeight: 20, textAlign:'right' },
  row: { flexDirection:'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems:'flex-end' },
  in: { flex:1, backgroundColor: theme.colors.surfaceAlt, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 120, textAlign:'right', color: theme.colors.text },
  send: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, alignItems:'center', justifyContent:'center' },
});
