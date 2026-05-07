import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/api';
import { theme } from '../src/theme';

export default function Notifications() {
  const [list, setList] = useState<any[]>([]);
  const load = async () => { try { setList(await api('/notifications')||[]); } catch {} };
  useEffect(()=>{ load(); }, []);
  const markRead = async (n:any) => { if(!n.read){ await api(`/notifications/${n.id}/read`, {method:'POST'}); load(); } };
  return (
    <SafeAreaView style={s.c} testID="notifications-screen">
      <View style={s.head}>
        <TouchableOpacity onPress={()=>router.back()}><Ionicons name="chevron-forward" size={24} color={theme.colors.text} /></TouchableOpacity>
        <Text style={s.h1}>الإشعارات</Text>
        <View style={{width: 24}} />
      </View>
      <ScrollView contentContainerStyle={{padding: 16}}>
        {list.map(n=>(
          <TouchableOpacity key={n.id} onPress={()=>markRead(n)} style={[s.item, !n.read && s.unread]}>
            <Text style={s.t}>{n.title}</Text>
            <Text style={s.b}>{n.body}</Text>
          </TouchableOpacity>
        ))}
        {list.length===0 && <Text style={s.empty}>لا توجد إشعارات</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding: 12, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  h1: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  item: { backgroundColor: theme.colors.surface, padding: 14, borderRadius: theme.radius.md, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  unread: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  t: { fontWeight: '700', color: theme.colors.text, textAlign:'right' },
  b: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  empty: { color: theme.colors.textTer, textAlign:'center', marginTop: 40 },
});
