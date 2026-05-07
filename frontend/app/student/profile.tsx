import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth';
import { api } from '../../src/api';
import { theme, DEPT_NAME } from '../../src/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const [apps, setApps] = useState<any[]>([]);
  useEffect(() => { (async () => { try { setApps(await api('/applications/mine') || []); } catch {} })(); }, []);
  if (!user) return null;
  return (
    <SafeAreaView style={s.c} testID="student-profile">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <View style={s.avatar}><Text style={s.avT}>{(user.name||'؟').charAt(0)}</Text></View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>

        <View style={s.card}>
          <Text style={s.row}>📚 القسم: <Text style={s.b}>{DEPT_NAME[user.department] || '-'}</Text></Text>
          <Text style={s.row}>🎓 المرحلة: <Text style={s.b}>{user.level || '-'}</Text></Text>
          <Text style={s.row}>👤 الجنس: <Text style={s.b}>{user.gender==='male'?'ذكر': user.gender==='female'?'أنثى':'-'}</Text></Text>
          <Text style={s.row}>✅ اختبار الكفاءة: <Text style={s.b}>{user.passed_competency ? `تم — ${user.last_score||0}%` : 'لم يتم'}</Text></Text>
        </View>

        <Text style={s.section}>طلباتي ({apps.length})</Text>
        {apps.map(a => (
          <View key={a.application_id} style={s.appCard}>
            <Text style={s.appTitle}>طلب رقم {a.application_id.slice(-6)}</Text>
            <Text style={s.appSt}>الحالة: <Text style={[s.b, {color: a.status==='accepted'?theme.colors.success:theme.colors.warning}]}>{a.status==='accepted'?'مقبول':'قيد المراجعة'}</Text></Text>
          </View>
        ))}
        {apps.length===0 && <Text style={s.muted}>لم تتقدم لأي وظيفة بعد</Text>}

        <TouchableOpacity testID="logout-btn" style={s.lo} onPress={async()=>{ await logout(); router.replace('/auth/welcome'); }}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={s.loT}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.primary, alignItems:'center', justifyContent:'center', alignSelf:'center', marginTop: 12 },
  avT: { color:'#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign:'center', marginTop: 12 },
  email: { color: theme.colors.textSec, textAlign:'center', marginBottom: theme.spacing.lg },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border },
  row: { fontSize: 14, color: theme.colors.textSec, marginVertical: 6, textAlign:'right' },
  b: { color: theme.colors.text, fontWeight: '700' },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, textAlign:'right' },
  appCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border },
  appTitle: { fontWeight: '700', color: theme.colors.text, textAlign:'right' },
  appSt: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  muted: { color: theme.colors.textTer, textAlign:'center' },
  linkBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 8, padding: 14, marginTop: theme.spacing.lg, borderRadius: theme.radius.full, backgroundColor: theme.colors.surface, borderWidth:1, borderColor: theme.colors.border },
  linkBtnT: { color: theme.colors.text, fontWeight: '700' },
  lo: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 6, padding: 14, marginTop: theme.spacing.lg, borderRadius: theme.radius.full, borderWidth:1, borderColor: theme.colors.error },
  loT: { color: theme.colors.error, fontWeight: '700' },
});
