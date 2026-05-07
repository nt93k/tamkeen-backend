import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme } from '../../src/theme';

export default function Dashboard() {
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const load = async () => {
    try { setStats(await api('/admin/stats')); setUsers(await api('/admin/users')); } catch {}
  };
  useEffect(()=>{ load(); }, []);
  const onR = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const tiles = [
    { k:'users', n:stats.users||0, l:'إجمالي المستخدمين', i:'people', c:theme.colors.primary },
    { k:'students', n:stats.students||0, l:'الطلاب', i:'school', c:'#10B981' },
    { k:'employers', n:stats.employers||0, l:'الشركات', i:'business', c:theme.colors.accent },
    { k:'jobs', n:stats.jobs||0, l:'الوظائف', i:'briefcase', c:'#7C3AED' },
    { k:'applications', n:stats.applications||0, l:'الطلبات', i:'document-text', c:'#F59E0B' },
    { k:'questions', n:stats.questions||0, l:'الأسئلة', i:'help-circle', c:'#0EA5E9' },
    { k:'courses', n:stats.courses||0, l:'الكورسات', i:'book', c:'#EC4899' },
    { k:'open_tickets', n:stats.open_tickets||0, l:'تذاكر مفتوحة', i:'mail-unread', c:theme.colors.error },
  ];

  return (
    <SafeAreaView style={s.c} testID="admin-dashboard">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onR} />}>
        <Text style={s.h1}>لوحة الإدارة</Text>
        <Text style={s.muted}>نظرة عامة على المنصة</Text>
        <View style={s.grid}>
          {tiles.map(t => (
            <View key={t.k} style={s.tile}>
              <View style={[s.icCirc, {backgroundColor: t.c+'22'}]}>
                <Ionicons name={t.i as any} size={22} color={t.c} />
              </View>
              <Text style={s.n}>{t.n}</Text>
              <Text style={s.l}>{t.l}</Text>
            </View>
          ))}
        </View>
        <Text style={s.section}>أحدث المستخدمين</Text>
        {users.slice(0,10).map(u=>(
          <View key={u.user_id} style={s.uRow}>
            <View style={[s.role, {backgroundColor: u.role==='admin'?theme.colors.error+'22':u.role==='employer'?theme.colors.accent+'22':theme.colors.primary+'22'}]}>
              <Text style={[s.roleT, {color: u.role==='admin'?theme.colors.error:u.role==='employer'?theme.colors.accent:theme.colors.primary}]}>
                {u.role==='admin'?'مدير':u.role==='employer'?'شركة':'طالب'}
              </Text>
            </View>
            <View style={{flex:1}}>
              <Text style={s.uName}>{u.name}</Text>
              <Text style={s.uEm}>{u.email}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  muted: { color: theme.colors.textSec, marginTop: 4, marginBottom: theme.spacing.md, textAlign:'right' },
  grid: { flexDirection:'row', flexWrap:'wrap', gap: 10 },
  tile: { width: '48%', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 14, borderWidth:1, borderColor: theme.colors.border },
  icCirc: { width: 40, height: 40, borderRadius: 20, alignItems:'center', justifyContent:'center', marginBottom: 8 },
  n: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  l: { color: theme.colors.textSec, fontSize: 12, marginTop: 2, textAlign:'right' },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, textAlign:'right' },
  uRow: { flexDirection:'row', alignItems:'center', gap: 10, backgroundColor: theme.colors.surface, padding: 12, borderRadius: theme.radius.md, marginBottom: 6, borderWidth:1, borderColor: theme.colors.border },
  role: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  roleT: { fontSize: 11, fontWeight: '700' },
  uName: { fontWeight:'700', color: theme.colors.text, textAlign:'right' },
  uEm: { color: theme.colors.textSec, fontSize: 12, textAlign:'right' },
});
