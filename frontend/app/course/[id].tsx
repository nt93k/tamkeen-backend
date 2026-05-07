import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
        {c.provider && <Text style={s.provider}>📚 {c.provider}</Text>}
        <Text style={s.desc}>{c.summary}</Text>

        {c.external_url && (
          <TouchableOpacity testID="open-external" style={s.cta} onPress={()=>Linking.openURL(c.external_url)}>
            <Ionicons name="open-outline" size={18} color="#fff" />
            <Text style={s.ctaT}>افتح الكورس على المنصة</Text>
          </TouchableOpacity>
        )}

        <Text style={s.section}>الدروس ({c.lessons?.length||0})</Text>
        {c.lessons?.map((l:any)=>(
          <View key={l.id} style={s.lesson}>
            <TouchableOpacity onPress={()=>setOpened(opened===l.id?null:l.id)}>
              <Text style={s.lt}>📘 {l.title}</Text>
              <Text style={s.lm}>{l.video_minutes} دقائق</Text>
              {opened===l.id && (
                <>
                  {l.content ? <Text style={s.body}>{l.content}</Text> : null}
                  {l.url ? (
                    <TouchableOpacity onPress={()=>Linking.openURL(l.url)} style={s.lessonLink}>
                      <Ionicons name="play-circle" size={18} color={theme.colors.primary} />
                      <Text style={s.lessonLinkT}>مشاهدة الفيديو</Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              )}
            </TouchableOpacity>
          </View>
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
  provider: { color: theme.colors.accent, marginTop: 4, fontWeight: '700', textAlign:'right' },
  desc: { color: theme.colors.textSec, marginTop: 8, textAlign:'right' },
  cta: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 8, backgroundColor: theme.colors.accent, paddingVertical: 14, borderRadius: theme.radius.full, marginTop: 16 },
  ctaT: { color:'#fff', fontWeight:'700', fontSize: 15 },
  section: { fontSize: 17, fontWeight: '700', color: theme.colors.text, marginTop: 20, textAlign:'right' },
  lesson: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginTop: 10, borderWidth:1, borderColor: theme.colors.border },
  lt: { fontWeight:'700', color: theme.colors.text, textAlign:'right' },
  lm: { color: theme.colors.textTer, fontSize: 12, marginTop: 2, textAlign:'right' },
  body: { color: theme.colors.textSec, marginTop: 8, lineHeight: 20, textAlign:'right' },
  lessonLink: { flexDirection:'row', alignItems:'center', gap: 6, marginTop: 10, padding: 8, backgroundColor: theme.colors.primaryLight, borderRadius: theme.radius.md, alignSelf:'flex-end' },
  lessonLinkT: { color: theme.colors.primary, fontWeight: '700' },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: theme.radius.full, marginTop: 24, alignItems:'center' },
  btnT: { color:'#fff', fontWeight:'700' },
});
