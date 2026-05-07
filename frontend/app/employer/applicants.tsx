import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api';
import { theme } from '../../src/theme';

export default function Applicants() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const [list, setList] = useState<any[]>([]);
  useEffect(()=>{ (async()=>{ if(!jobId) return; try{ setList(await api(`/jobs/${jobId}/applicants`)||[]);}catch{} })(); }, [jobId]);
  return (
    <SafeAreaView style={s.c} testID="applicants-screen">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <Text style={s.h1}>المتقدمون (الترتيب الذكي)</Text>
        <Text style={s.sub}>مرتبون حسب نتيجة اختبار الكفاءة</Text>
        {list.map((a, i)=>(
          <View key={a.application_id} style={s.card}>
            <View style={s.rank}><Text style={s.rankT}>#{i+1}</Text></View>
            <View style={{flex:1}}>
              <Text style={s.name}>{a.student_name}</Text>
              <Text style={s.muted}>نتيجة الاختبار: <Text style={s.b}>{a.student_score}%</Text></Text>
              {a.custom_score!=null && <Text style={s.muted}>اختبار الشركة: {a.custom_score}%</Text>}
              <Text style={[s.muted,{color: a.status==='accepted'?theme.colors.success:theme.colors.warning}]}>{a.status==='accepted'?'مقبول':'قيد المراجعة'}</Text>
            </View>
          </View>
        ))}
        {list.length===0 && <Text style={s.empty}>لا متقدمين بعد</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  sub: { color: theme.colors.textSec, marginTop: 4, marginBottom: 16, textAlign:'right' },
  card: { flexDirection:'row', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 10, gap: 12 },
  rank: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primaryLight, alignItems:'center', justifyContent:'center' },
  rankT: { color: theme.colors.primary, fontWeight:'800' },
  name: { fontWeight:'700', color: theme.colors.text, fontSize: 15, textAlign:'right' },
  muted: { color: theme.colors.textSec, marginTop: 2, textAlign:'right' },
  b: { color: theme.colors.text, fontWeight:'700' },
  empty: { color: theme.colors.textTer, textAlign:'center', marginTop: 40 },
});
