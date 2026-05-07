import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/api';
import { theme } from '../src/theme';

export default function MyTickets() {
  const [list, setList] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const load = async () => { try { setList(await api('/tickets')||[]); } catch {} };
  useFocusEffect(React.useCallback(()=>{ load(); }, []));

  return (
    <SafeAreaView style={s.c} testID="my-tickets">
      <View style={s.head}>
        <TouchableOpacity onPress={()=>router.back()}><Ionicons name="chevron-forward" size={24} color={theme.colors.text} /></TouchableOpacity>
        <Text style={s.h1}>التواصل مع الإدارة</Text>
        <TouchableOpacity testID="open-create" onPress={()=>setShow(true)}><Ionicons name="add-circle" size={26} color={theme.colors.primary} /></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        {list.length===0 && (
          <View style={s.empty}>
            <Text style={s.eEmoji}>📬</Text>
            <Text style={s.eT}>لا توجد رسائل بعد</Text>
            <Text style={s.eS}>افتح تذكرة جديدة للتواصل مع إدارة المنصة</Text>
            <TouchableOpacity testID="empty-create" style={s.btn} onPress={()=>setShow(true)}>
              <Text style={s.btnT}>+ تذكرة جديدة</Text>
            </TouchableOpacity>
          </View>
        )}
        {list.map(t=>(
          <TouchableOpacity key={t.ticket_id} style={s.card} onPress={()=>router.push(`/ticket/${t.ticket_id}`)}>
            <View style={s.row}>
              <View style={[s.dot, {backgroundColor: t.status==='open'?theme.colors.success:theme.colors.textTer}]} />
              <Text style={s.subj}>{t.subject}</Text>
              <Text style={s.st}>{t.status==='open'?'مفتوحة':'مغلقة'}</Text>
            </View>
            <Text style={s.last} numberOfLines={2}>{t.messages[t.messages.length-1]?.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <CreateTicket visible={show} onClose={()=>setShow(false)} onCreated={load} />
    </SafeAreaView>
  );
}

function CreateTicket({ visible, onClose, onCreated }: any) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!subject.trim() || !message.trim()) return Alert.alert('تنبيه','أكمل البيانات');
    setBusy(true);
    try { await api('/tickets', { method:'POST', body: JSON.stringify({ subject, message })});
      setSubject(''); setMessage(''); onCreated(); onClose();
      Alert.alert('تم','تم إرسال التذكرة');
    } catch(e:any){ Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{flex:1, backgroundColor: theme.colors.bg}}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <View style={s.mhead}>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
            <Text style={s.mTitle}>تذكرة جديدة</Text>
            <View style={{width:24}} />
          </View>
          <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
            <Text style={s.lab}>الموضوع</Text>
            <TextInput testID="t-subject" style={s.in} value={subject} onChangeText={setSubject} placeholder="مثال: مشكلة في نشر وظيفة" placeholderTextColor={theme.colors.textTer} />
            <Text style={s.lab}>الرسالة</Text>
            <TextInput testID="t-msg" style={[s.in,{height:140}]} multiline value={message} onChangeText={setMessage} placeholder="اشرح طلبك..." placeholderTextColor={theme.colors.textTer} />
            <TouchableOpacity testID="t-send" onPress={submit} disabled={busy} style={s.sBtn}>
              <Text style={s.sBtnT}>{busy?'...':'إرسال التذكرة'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding: 14, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  h1: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 10 },
  row: { flexDirection:'row', alignItems:'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  subj: { flex:1, fontSize: 15, fontWeight:'700', color: theme.colors.text, textAlign:'right' },
  st: { fontSize: 11, color: theme.colors.textSec },
  last: { color: theme.colors.textSec, marginTop: 8, fontSize: 13, textAlign:'right' },
  empty: { alignItems:'center', padding: 40 },
  eEmoji: { fontSize: 56 },
  eT: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginTop: 12 },
  eS: { color: theme.colors.textSec, marginTop: 4, textAlign:'center' },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 12, paddingHorizontal: 24, borderRadius: theme.radius.full, marginTop: 20 },
  btnT: { color:'#fff', fontWeight:'700' },
  mhead: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding: 14, backgroundColor: theme.colors.surface, borderBottomWidth:1, borderBottomColor: theme.colors.border },
  mTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  lab: { fontSize: 13, fontWeight:'600', color: theme.colors.textSec, marginTop: theme.spacing.md, textAlign:'right' },
  in: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 12, fontSize: 14, marginTop: 6, textAlign:'right', color: theme.colors.text },
  sBtn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 14, alignItems:'center', marginTop: theme.spacing.lg },
  sBtnT: { color:'#fff', fontWeight:'700', fontSize: 15 },
});
