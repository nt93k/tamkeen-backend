import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { api } from '../../src/api';
import { useAuth } from '../../src/auth';
import { theme, DEPT_NAME } from '../../src/theme';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { setLoading(true); try { setJobs(await api('/jobs') || []); } catch (e:any) { Alert.alert('خطأ', e.message); } finally { setLoading(false); } };
  useFocusEffect(React.useCallback(() => { load(); }, []));

  if (!user?.passed_competency) {
    return (
      <SafeAreaView style={s.c} testID="jobs-locked">
        <View style={s.locked}>
          <Text style={s.lockEmoji}>🔒</Text>
          <Text style={s.lockTitle}>اجتز اختبار الكفاءة لفتح الوظائف</Text>
          <Text style={s.lockSub}>الشركات تظهر فقط للطلاب المؤهلين</Text>
          <TouchableOpacity testID="goto-test" style={s.btn} onPress={()=>router.push('/test/competency')}>
            <Text style={s.btnT}>بدء الاختبار</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.c} testID="jobs-screen">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <Text style={s.h1}>الوظائف المتاحة</Text>
        <Text style={s.sub}>{jobs.length} فرصة تناسب تخصصك</Text>
        {loading && <Text style={s.muted}>جاري التحميل...</Text>}
        {!loading && jobs.length === 0 && <Text style={s.muted}>لا توجد وظائف متاحة حالياً</Text>}
        {jobs.map(j => (
          <TouchableOpacity key={j.job_id} testID={`job-${j.job_id}`} style={s.card} onPress={()=>router.push(`/job/${j.job_id}`)}>
            <Text style={s.title}>{j.title}</Text>
            <Text style={s.company}>🏢 {j.company_name}</Text>
            <View style={s.tags}>
              <View style={s.tag}><Text style={s.tagT}>{DEPT_NAME[j.department]}</Text></View>
              <View style={s.tag}><Text style={s.tagT}>المرحلة ≥ {j.level_required}</Text></View>
              <View style={s.tag}><Text style={s.tagT}>{j.seats} شاغر</Text></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  sub: { color: theme.colors.textSec, marginTop: 4, marginBottom: theme.spacing.md, textAlign:'right' },
  muted: { color: theme.colors.textTer, marginTop: 24, textAlign:'center' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.text, textAlign:'right' },
  company: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  tags: { flexDirection:'row', flexWrap:'wrap', gap: 6, marginTop: 10 },
  tag: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  tagT: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  locked: { flex:1, alignItems:'center', justifyContent:'center', padding: 24 },
  lockEmoji: { fontSize: 56 },
  lockTitle: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginTop: 12, textAlign:'center' },
  lockSub: { color: theme.colors.textSec, marginTop: 6, textAlign:'center' },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 14, paddingHorizontal: 32, marginTop: 24 },
  btnT: { color:'#fff', fontWeight:'700' },
});
