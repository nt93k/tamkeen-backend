import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../src/api';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function Competency() {
  const { user, refresh } = useAuth();
  const [qs, setQs] = useState<any[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const start = useRef(Date.now());

  useEffect(() => { (async () => {
    if (!user?.department || !user?.level) return;
    try { const r = await api(`/questions?department=${user.department}&level=${user.level}&count=8`); setQs(r||[]); }
    catch(e:any) { Alert.alert('خطأ', e.message); }
    finally { setBusy(false); }
  })(); }, [user?.department, user?.level]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await api('/tests/submit', { method:'POST', body: JSON.stringify({
        department: user.department, level: user.level,
        answers: qs.map(q => ({ question_id: q.id, selected: answers[q.id] ?? -1 })),
        duration_seconds: Math.floor((Date.now()-start.current)/1000),
      })});
      setResult(r); await refresh();
    } catch (e:any) { Alert.alert('خطأ', e.message); }
    finally { setSubmitting(false); }
  };

  if (busy) return <View style={s.center}><ActivityIndicator color={theme.colors.primary} /></View>;
  if (qs.length === 0) return <View style={s.center}><Text>لا توجد أسئلة متاحة</Text></View>;

  if (result) {
    return (
      <SafeAreaView style={s.c} testID="result-screen">
        <View style={[s.center, {padding: 24}]}>
          <Text style={s.bigEmoji}>{result.passed?'🎉':'📚'}</Text>
          <Text style={s.bigScore}>{result.score}%</Text>
          <Text style={s.resTitle}>{result.passed ? 'مبروك! اجتزت الاختبار' : 'تحتاج للمزيد من التدريب'}</Text>
          <Text style={s.resSub}>أجبت بشكل صحيح على {result.correct} من {result.total}</Text>
          <TouchableOpacity testID="result-cta" style={s.btn} onPress={()=>router.replace(result.passed?'/student/jobs':'/student/academy')}>
            <Text style={s.btnT}>{result.passed?'تصفح الوظائف الآن':'الذهاب لأكاديمية تمكين'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>router.replace('/student/home')} style={{marginTop:16}}>
            <Text style={{color: theme.colors.primary}}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const q = qs[idx];
  const sel = answers[q.id];
  const isLast = idx === qs.length-1;
  const allAnswered = qs.every(x => answers[x.id] !== undefined);

  return (
    <SafeAreaView style={s.c} testID="test-screen">
      <ScrollView contentContainerStyle={{padding: 20}}>
        <Text style={s.prog}>سؤال {idx+1} من {qs.length}</Text>
        <View style={s.bar}><View style={[s.barFill, {width: `${((idx+1)/qs.length)*100}%`}]} /></View>
        <Text style={s.q}>{q.q}</Text>
        {q.options.map((o: string, i: number) => (
          <TouchableOpacity key={i} testID={`opt-${i}`} onPress={()=>setAnswers(a=>({...a, [q.id]: i}))}
            style={[s.opt, sel===i && s.optA]}>
            <Text style={[s.optT, sel===i && {color:'#fff'}]}>{o}</Text>
          </TouchableOpacity>
        ))}
        <View style={s.navRow}>
          <TouchableOpacity disabled={idx===0} onPress={()=>setIdx(idx-1)} style={[s.navBtn, idx===0&&{opacity:0.4}]}>
            <Text style={s.navT}>السابق</Text>
          </TouchableOpacity>
          {isLast ? (
            <TouchableOpacity testID="submit-test" onPress={submit} disabled={!allAnswered||submitting} style={[s.navBtn, s.primary]}>
              <Text style={[s.navT,{color:'#fff'}]}>{submitting?'...':'إرسال'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity testID="next-q" onPress={()=>setIdx(idx+1)} disabled={sel===undefined} style={[s.navBtn, s.primary, sel===undefined&&{opacity:0.4}]}>
              <Text style={[s.navT,{color:'#fff'}]}>التالي</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  center: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor: theme.colors.bg },
  prog: { color: theme.colors.textSec, textAlign:'right' },
  bar: { height: 6, backgroundColor: theme.colors.surfaceAlt, borderRadius: 3, marginTop: 8 },
  barFill: { height: 6, backgroundColor: theme.colors.primary, borderRadius: 3 },
  q: { fontSize: 20, fontWeight: '700', color: theme.colors.text, marginTop: 24, textAlign:'right', lineHeight: 28 },
  opt: { backgroundColor: theme.colors.surface, padding: 16, borderRadius: theme.radius.md, marginTop: 10, borderWidth: 1, borderColor: theme.colors.border },
  optA: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  optT: { color: theme.colors.text, fontSize: 15, fontWeight: '600', textAlign:'right' },
  navRow: { flexDirection:'row', justifyContent:'space-between', marginTop: 24, gap: 12 },
  navBtn: { flex:1, padding: 14, borderRadius: theme.radius.full, alignItems:'center', backgroundColor: theme.colors.surfaceAlt },
  primary: { backgroundColor: theme.colors.primary },
  navT: { fontWeight:'700', color: theme.colors.text },
  bigEmoji: { fontSize: 80 },
  bigScore: { fontSize: 56, fontWeight: '900', color: theme.colors.primary, marginTop: 12 },
  resTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 8, textAlign:'center' },
  resSub: { color: theme.colors.textSec, marginTop: 6, textAlign:'center' },
  btn: { backgroundColor: theme.colors.primary, paddingVertical: 16, paddingHorizontal: 28, borderRadius: theme.radius.full, marginTop: 24 },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 15 },
});
