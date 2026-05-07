import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme } from '../../src/theme';

export default function AdminTickets() {
  const [list, setList] = useState<any[]>([]);
  const load = async () => { try { setList(await api('/tickets')||[]); } catch {} };
  useFocusEffect(React.useCallback(()=>{ load(); }, []));

  return (
    <SafeAreaView style={s.c} testID="admin-tickets">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <Text style={s.h1}>التذاكر ({list.length})</Text>
        <Text style={s.muted}>رسائل الشركات والطلاب</Text>
        {list.map(t=>(
          <TouchableOpacity key={t.ticket_id} testID={`ticket-${t.ticket_id}`} style={s.card} onPress={()=>router.push(`/ticket/${t.ticket_id}`)}>
            <View style={s.row}>
              <View style={[s.statusDot, {backgroundColor: t.status==='open'?theme.colors.success:theme.colors.textTer}]} />
              <Text style={s.subj}>{t.subject}</Text>
            </View>
            <Text style={s.from}>{t.user_role==='employer'?'🏢':'🎓'} {t.user_name}</Text>
            <Text style={s.last} numberOfLines={2}>{t.messages[t.messages.length-1]?.text}</Text>
            <Text style={s.count}>{t.messages.length} رسائل</Text>
          </TouchableOpacity>
        ))}
        {list.length===0 && <Text style={s.empty}>لا توجد تذاكر</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  muted: { color: theme.colors.textSec, marginTop: 4, marginBottom: 16, textAlign:'right' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 10 },
  row: { flexDirection:'row', alignItems:'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  subj: { fontSize: 16, fontWeight:'700', color: theme.colors.text, flex:1, textAlign:'right' },
  from: { color: theme.colors.textSec, fontSize: 13, marginTop: 6, textAlign:'right' },
  last: { color: theme.colors.text, marginTop: 8, fontSize: 13, textAlign:'right' },
  count: { color: theme.colors.primary, fontSize: 12, marginTop: 6, textAlign:'right' },
  empty: { color: theme.colors.textTer, textAlign:'center', marginTop: 40 },
});
