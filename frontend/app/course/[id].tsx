import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { api } from '../../src/api';
import { theme } from '../../src/theme';

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{id:string}>();
  const [c, setC] = useState<any>(null);
  const [opened, setOpened] = useState<string|null>(null);
  useEffect(()=>{ (async()=>{ try{ setC(await api(`/courses/${id}`)); }catch{} })(); }, [id]);
  if (!c) return null;
  return (
    <SafeAreaView style={s.c} testID="course-detail">
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={s.title}>{c.title}</Text>
        <Text style={s.desc}>{c.summary}</Text>
        <Text style={s.section}>الدروس ({c.lessons?.length||0})</Text>
        {c.lessons?.map((l:any)=>(
          <TouchableOpacity key={l.id} style={s.lesson} onPress={()=>setOpened(opened===l.id?null:l.id)}>
            <Text style={s.lt}>📘 {l.title}</Text>
            <Text style={s.lm}>{l.video_minutes} دقائق</Text>
            {opened===l.id && <Text style={s.body}>{l.content}</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity testID="retake-test" style={s.btn} onPress={()=>router.replace('/test/competency')}>
          <Text style={s.btnT}>إعادة اختبار الكفاءة</Text>
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
  title: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  desc: { color: theme.colors.textSec, marginTop: 8, textAlign:'right' },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: 20, textAlign:'right' },
  lesson: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginTop: 10, borderWidth:1, borderColor: theme.colors.border },
  lt: { fontWeight:'700', color: theme.colors.text, textAlign:'right' },
  lm: { color: theme.colors.textTer, fontSize: 12, marginTop: 2, textAlign:'right' },
  body: { color: theme.colors.textSec, marginTop: 8, lineHeight: 20, textAlign:'right' },
  btn: { backgroundColor: theme.colors.accent, paddingVertical: 14, borderRadius: theme.radius.full, marginTop: 24, alignItems:'center' },
  btnT: { color:'#fff', fontWeight:'700' },
});
