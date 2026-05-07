import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api';
import { theme, DEPT_NAME } from '../../src/theme';

export default function JobDetail() {
  const { id } = useLocalSearchParams<{id:string}>();
  const [job, setJob] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(()=>{ (async()=>{ try{ setJob(await api(`/jobs/${id}`)); }catch(e:any){ Alert.alert('خطأ', e.message); } })(); }, [id]);
  if (!job) return null;
  const apply = async () => {
    setBusy(true);
    try { const r = await api(`/jobs/${id}/apply`, { method:'POST', body: JSON.stringify({}) });
      Alert.alert('تم', r.status==='accepted'?'تم قبولك مبدئياً!':'تم إرسال طلبك');
      router.back();
    } catch(e:any){ Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };
  return (
    <SafeAreaView style={s.c} testID="job-detail">
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={s.title}>{job.title}</Text>
        <Text style={s.company}>🏢 {job.company_name}</Text>
        <View style={s.tags}>
          <View style={s.tag}><Text style={s.tagT}>{DEPT_NAME[job.department]}</Text></View>
          <View style={s.tag}><Text style={s.tagT}>المرحلة ≥ {job.level_required}</Text></View>
          <View style={s.tag}><Text style={s.tagT}>{job.seats} شاغر</Text></View>
        </View>
        <Text style={s.section}>الوصف</Text>
        <Text style={s.body}>{job.description}</Text>
        <TouchableOpacity testID="apply-btn" disabled={busy} style={s.btn} onPress={apply}>
          <Text style={s.btnT}>{busy?'...':'التقديم الآن'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>router.back()} style={{marginTop:12, alignItems:'center'}}>
          <Text style={{color: theme.colors.primary}}>عودة</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  title: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  company: { color: theme.colors.textSec, marginTop: 6, textAlign:'right' },
  tags: { flexDirection:'row', flexWrap:'wrap', gap: 6, marginTop: 12 },
  tag: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  tagT: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: 24, textAlign:'right' },
  body: { color: theme.colors.textSec, lineHeight: 22, marginTop: 8, textAlign:'right' },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: theme.radius.full, marginTop: 24, alignItems:'center' },
  btnT: { color:'#fff', fontWeight:'700' },
});
