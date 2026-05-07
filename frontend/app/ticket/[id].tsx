import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{id:string}>();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState('');
  const scroll = useRef<ScrollView>(null);

  const load = async () => { try { setTickets(await api('/tickets')||[]); } catch {} };
  useEffect(()=>{ load(); }, []);
  const t = tickets.find(x=>x.ticket_id===id);
  useEffect(()=>{ scroll.current?.scrollToEnd({animated:true}); }, [t?.messages?.length]);

  const send = async () => {
    if (!reply.trim() || busy) return;
    setBusy(true);
    try { await api(`/tickets/${id}/reply`, { method:'POST', body: JSON.stringify({ message: reply })}); setReply(''); await load(); }
    catch(e:any){ Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };

  const close = async () => {
    try { await api(`/tickets/${id}/close`, { method:'POST' }); Alert.alert('تم', 'تم إغلاق التذكرة'); router.back(); }
    catch(e:any){ Alert.alert('خطأ', e.message); }
  };

  if (!t) return <View style={[s.c, {alignItems:'center', justifyContent:'center'}]}><ActivityIndicator color={theme.colors.primary} /></View>;

  return (
    <SafeAreaView style={s.c} testID="ticket-detail">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <View style={s.head}>
          <TouchableOpacity onPress={()=>router.back()}><Ionicons name="chevron-forward" size={24} color={theme.colors.text} /></TouchableOpacity>
          <View style={{flex:1, alignItems:'center'}}>
            <Text style={s.title} numberOfLines={1}>{t.subject}</Text>
            <Text style={s.from}>{t.user_name}</Text>
          </View>
          {user?.role==='admin' && t.status==='open' && (
            <TouchableOpacity onPress={close}><Ionicons name="checkmark-done" size={22} color={theme.colors.success} /></TouchableOpacity>
          )}
          {!(user?.role==='admin' && t.status==='open') && <View style={{width:22}} />}
        </View>
        <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={{padding: 14}}>
          {t.messages.map((m:any, i:number)=>{
            const mine = m.from === user?.role;
            return (
              <View key={i} style={[s.bubble, mine?s.mine:s.other]}>
                <Text style={[s.from2, mine && {color:'rgba(255,255,255,0.9)'}]}>{m.from==='admin'?'الإدارة':m.name}</Text>
                <Text style={[s.txt, mine && {color:'#fff'}]}>{m.text}</Text>
              </View>
            );
          })}
        </ScrollView>
        {t.status === 'open' ? (
          <View style={s.row}>
            <TextInput testID="reply-input" style={s.in} value={reply} onChangeText={setReply} placeholder="اكتب ردك..." placeholderTextColor={theme.colors.textTer} multiline />
            <TouchableOpacity testID="reply-send" onPress={send} disabled={busy} style={s.send}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
          </View>
        ) : (
          <View style={s.closed}><Text style={s.closedT}>التذكرة مغلقة</Text></View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 12, borderBottomWidth:1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  from: { fontSize: 12, color: theme.colors.textSec },
  bubble: { padding: 12, borderRadius: 16, marginVertical: 4, maxWidth: '85%' },
  mine: { backgroundColor: theme.colors.primary, alignSelf:'flex-start' },
  other: { backgroundColor: theme.colors.surface, alignSelf:'flex-end', borderWidth:1, borderColor: theme.colors.border },
  from2: { fontSize: 11, color: theme.colors.textSec, marginBottom: 4, fontWeight:'700', textAlign:'right' },
  txt: { color: theme.colors.text, fontSize: 14, lineHeight: 20, textAlign:'right' },
  row: { flexDirection:'row', padding: 12, gap: 8, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface, alignItems:'flex-end' },
  in: { flex:1, backgroundColor: theme.colors.surfaceAlt, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, maxHeight: 120, textAlign:'right', color: theme.colors.text },
  send: { backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, alignItems:'center', justifyContent:'center' },
  closed: { padding: 16, backgroundColor: theme.colors.surface, alignItems:'center', borderTopWidth:1, borderTopColor: theme.colors.border },
  closedT: { color: theme.colors.textTer, fontWeight:'600' },
});
