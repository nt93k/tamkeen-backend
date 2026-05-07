import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../src/api';
import { useAuth } from '../../src/auth';
import { theme, DEPT_NAME } from '../../src/theme';

export default function Academy() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => { (async () => {
    if (!user?.department) return;
    try {
      const params = new URLSearchParams();
      params.set('department', user.department);
      if (user.level) params.set('level', String(user.level));
      setCourses(await api(`/courses?${params.toString()}`) || []);
    } catch {}
  })(); }, [user?.department, user?.level]);

  return (
    <SafeAreaView style={s.c} testID="academy-screen">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <Text style={s.h1}>أكاديمية تمكين</Text>
        <Text style={s.sub}>دروس قصيرة وتحديات لرفع كفاءتك</Text>
        {courses.map(c => (
          <TouchableOpacity key={c.course_id} testID={`course-${c.course_id}`} style={s.card} onPress={()=>router.push(`/course/${c.course_id}`)}>
            <View style={s.row}>
              <View style={s.tag}><Text style={s.tagT}>{DEPT_NAME[c.department]}</Text></View>
              <View style={s.ltag}><Text style={s.ltagT}>المرحلة {c.level||1}</Text></View>
              <Text style={s.dur}>⏱ {c.duration_min} د</Text>
            </View>
            <Text style={s.title}>{c.title}</Text>
            <Text style={s.desc}>{c.summary}</Text>
            <Text style={s.lessons}>{c.lessons?.length || 0} دروس</Text>
          </TouchableOpacity>
        ))}
        {courses.length === 0 && <Text style={s.muted}>لا توجد دورات لقسمك حالياً</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  sub: { color: theme.colors.textSec, marginTop: 4, marginBottom: theme.spacing.md, textAlign:'right' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, marginBottom: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  tag: { backgroundColor: theme.colors.accentLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  tagT: { color: theme.colors.accent, fontWeight: '700', fontSize: 12 },
  ltag: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.radius.full },
  ltagT: { color: '#92400E', fontWeight: '700', fontSize: 12 },
  dur: { color: theme.colors.textSec, fontSize: 12 },
  title: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: 8, textAlign:'right' },
  desc: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  lessons: { color: theme.colors.primary, marginTop: 8, fontWeight: '600', textAlign:'right' },
  muted: { color: theme.colors.textTer, marginTop: 24, textAlign:'center' },
});
