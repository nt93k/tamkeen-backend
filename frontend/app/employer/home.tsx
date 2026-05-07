import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/auth';
import { api } from '../../src/api';
import { theme } from '../../src/theme';

export default function EHome() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  useEffect(() => { (async()=>{ try { setJobs(await api('/jobs')||[]); setNotifs(await api('/notifications')||[]); } catch{} })(); }, []);
  if (!user) return null;
  const totalApps = 0; // computed via applicants
  return (
    <SafeAreaView style={s.c} testID="employer-home">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <Text style={s.h1}>أهلاً {user.name}</Text>
        <Text style={s.muted}>{user.company_name} • {user.company_specialty || '—'}</Text>

        <View style={s.row}>
          <View style={s.stat}><Text style={s.n}>{jobs.length}</Text><Text style={s.l}>وظائف نشطة</Text></View>
          <View style={s.stat}><Text style={s.n}>{notifs.length}</Text><Text style={s.l}>إشعارات</Text></View>
        </View>

        <TouchableOpacity testID="quick-post" style={s.cta} onPress={()=>router.push('/employer/post')}>
          <Text style={s.ctaT}>+ نشر وظيفة جديدة</Text>
        </TouchableOpacity>

        <Text style={s.section}>أحدث الوظائف</Text>
        {jobs.slice(0,5).map(j => (
          <TouchableOpacity key={j.job_id} style={s.card} onPress={()=>router.push(`/employer/applicants?jobId=${j.job_id}`)}>
            <Text style={s.title}>{j.title}</Text>
            <Text style={s.muted}>{j.seats} شاغر • مرحلة ≥ {j.level_required}</Text>
          </TouchableOpacity>
        ))}
        {jobs.length===0 && <Text style={s.muted}>لم تنشر أي وظيفة بعد</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  muted: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  row: { flexDirection:'row', gap: 12, marginTop: theme.spacing.lg },
  stat: { flex:1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, alignItems:'center' },
  n: { fontSize: 28, fontWeight:'800', color: theme.colors.primary },
  l: { color: theme.colors.textSec, marginTop: 4 },
  cta: { backgroundColor: theme.colors.accent, borderRadius: theme.radius.full, paddingVertical: 16, alignItems:'center', marginTop: theme.spacing.lg },
  ctaT: { color:'#fff', fontWeight:'700', fontSize: 15 },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: theme.spacing.lg, marginBottom: theme.spacing.sm, textAlign:'right' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 8 },
  title: { fontWeight:'700', color: theme.colors.text, textAlign:'right' },
});
