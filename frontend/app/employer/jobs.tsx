import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../../src/api';
import { theme, DEPT_NAME } from '../../src/theme';

export default function EJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  useFocusEffect(React.useCallback(()=>{ (async()=>{ try{ setJobs(await api('/jobs')||[]);}catch{} })(); }, []));
  return (
    <SafeAreaView style={s.c} testID="employer-jobs">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <Text style={s.h1}>وظائفي ({jobs.length})</Text>
        {jobs.map(j=>(
          <TouchableOpacity key={j.job_id} testID={`ejob-${j.job_id}`} style={s.card} onPress={()=>router.push(`/employer/applicants?jobId=${j.job_id}`)}>
            <Text style={s.title}>{j.title}</Text>
            <Text style={s.muted}>{DEPT_NAME[j.department]} • {j.seats} شاغر</Text>
            <Text style={s.link}>عرض المتقدمين ←</Text>
          </TouchableOpacity>
        ))}
        {jobs.length===0 && <Text style={s.empty}>لا وظائف بعد. اضغط تبويب نشر</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 24, fontWeight: '800', color: theme.colors.text, marginBottom: 16, textAlign:'right' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 12 },
  title: { fontWeight:'700', color: theme.colors.text, fontSize: 16, textAlign:'right' },
  muted: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  link: { color: theme.colors.primary, fontWeight: '700', marginTop: 8, textAlign:'right' },
  empty: { color: theme.colors.textTer, textAlign:'center', marginTop: 40 },
});
