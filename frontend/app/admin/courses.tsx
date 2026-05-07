import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme, DEPARTMENTS, DEPT_NAME } from '../../src/theme';

export default function AdminCourses() {
  const [list, setList] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const load = async () => { try { setList(await api('/courses')||[]); } catch {} };
  useEffect(()=>{ load(); }, []);
  const del = (cid:string) => {
    Alert.alert('تأكيد','حذف هذه الدورة؟',[
      {text:'إلغاء', style:'cancel'},
      {text:'حذف', style:'destructive', onPress: async () => {
        try { await api(`/admin/courses/${cid}`, { method:'DELETE' }); load(); } catch(e:any){ Alert.alert('خطأ', e.message); }
      }}
    ]);
  };
  return (
    <SafeAreaView style={s.c} testID="admin-courses">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <View style={s.head}>
          <Text style={s.h1}>الكورسات ({list.length})</Text>
          <TouchableOpacity testID="add-c" style={s.add} onPress={()=>setShowAdd(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.addT}>إضافة</Text>
          </TouchableOpacity>
        </View>
        {list.map(c=>(
          <View key={c.course_id} style={s.card}>
            <View style={s.row}>
              <View style={s.dtag}><Text style={s.dtagT}>{DEPT_NAME[c.department]}</Text></View>
              <Text style={s.dur}>⏱ {c.duration_min} د • {c.lessons?.length||0} دروس</Text>
              <TouchableOpacity onPress={()=>del(c.course_id)}>
                <Ionicons name="trash" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={s.title}>{c.title}</Text>
            <Text style={s.desc}>{c.summary}</Text>
          </View>
        ))}
      </ScrollView>
      <AddC visible={showAdd} onClose={()=>setShowAdd(false)} onAdded={load} />
    </SafeAreaView>
  );
}

function AddC({ visible, onClose, onAdded }: any) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [dept, setDept] = useState('cs');
  const [duration, setDuration] = useState('20');
  const [lessons, setLessons] = useState<any[]>([{id:'l1', title:'', content:'', video_minutes:5}]);
  const [busy, setBusy] = useState(false);

  const addLesson = () => setLessons(l => [...l, {id:`l${l.length+1}`, title:'', content:'', video_minutes:5}]);
  const setL = (i:number, k:string, v:any) => setLessons(l => l.map((x,idx)=> idx===i?{...x,[k]:v}:x));

  const submit = async () => {
    if (!title.trim() || !summary.trim() || lessons.some(l=>!l.title)) return Alert.alert('تنبيه','أكمل البيانات');
    setBusy(true);
    try {
      await api('/admin/courses', { method:'POST', body: JSON.stringify({
        title, summary, department: dept, duration_min: parseInt(duration)||20, lessons,
      })});
      setTitle(''); setSummary(''); setLessons([{id:'l1', title:'', content:'', video_minutes:5}]);
      onAdded(); onClose();
    } catch(e:any){ Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{flex:1, backgroundColor: theme.colors.bg}}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <View style={s.mhead}>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
            <Text style={s.mTitle}>كورس جديد</Text>
            <View style={{width:24}} />
          </View>
          <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
            <Text style={s.lab}>عنوان الكورس</Text>
            <TextInput style={s.in} value={title} onChangeText={setTitle} placeholder="مثال: أساسيات بايثون" placeholderTextColor={theme.colors.textTer} />
            <Text style={s.lab}>وصف مختصر</Text>
            <TextInput style={[s.in,{height:70}]} multiline value={summary} onChangeText={setSummary} placeholder="ماذا سيتعلم الطالب" placeholderTextColor={theme.colors.textTer} />
            <Text style={s.lab}>القسم</Text>
            <View style={s.chips}>{DEPARTMENTS.map(d=>(
              <TouchableOpacity key={d.id} onPress={()=>setDept(d.id)} style={[s.chip, dept===d.id&&s.chipA]}><Text style={[s.chipT, dept===d.id&&{color:'#fff'}]}>{d.name}</Text></TouchableOpacity>
            ))}</View>
            <Text style={s.lab}>المدة (بالدقائق)</Text>
            <TextInput style={s.in} value={duration} onChangeText={setDuration} keyboardType="numeric" />
            <View style={[s.row, {marginTop: theme.spacing.lg}]}>
              <Text style={[s.lab,{marginTop:0, flex:1}]}>الدروس ({lessons.length})</Text>
              <TouchableOpacity onPress={addLesson} style={s.miniBtn}><Text style={s.miniBtnT}>+ درس</Text></TouchableOpacity>
            </View>
            {lessons.map((l,i)=>(
              <View key={i} style={s.lcard}>
                <Text style={s.lnum}>درس {i+1}</Text>
                <TextInput style={s.in} value={l.title} onChangeText={t=>setL(i,'title',t)} placeholder="عنوان الدرس" placeholderTextColor={theme.colors.textTer} />
                <TextInput style={[s.in,{height:60}]} multiline value={l.content} onChangeText={t=>setL(i,'content',t)} placeholder="محتوى الدرس" placeholderTextColor={theme.colors.textTer} />
                <TextInput style={s.in} value={String(l.video_minutes)} onChangeText={t=>setL(i,'video_minutes', parseInt(t)||0)} placeholder="دقائق" keyboardType="numeric" placeholderTextColor={theme.colors.textTer} />
              </View>
            ))}
            <TouchableOpacity testID="save-c" onPress={submit} disabled={busy} style={s.btn}>
              <Text style={s.btnT}>{busy?'...':'حفظ الكورس'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: 12 },
  h1: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  add: { flexDirection:'row', alignItems:'center', gap: 4, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full },
  addT: { color:'#fff', fontWeight:'700' },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 10 },
  row: { flexDirection:'row', alignItems:'center', gap: 8 },
  dtag: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full },
  dtagT: { color: theme.colors.primary, fontSize: 11, fontWeight:'700' },
  dur: { color: theme.colors.textSec, fontSize: 12, flex:1, textAlign:'right' },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 8, textAlign:'right' },
  desc: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  chips: { flexDirection:'row', flexWrap:'wrap', gap: 8, marginTop: 8 },
  chip: { backgroundColor: theme.colors.surfaceAlt, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full },
  chipA: { backgroundColor: theme.colors.primary },
  chipT: { color: theme.colors.text, fontWeight:'600', fontSize: 13 },
  mhead: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding: 14, backgroundColor: theme.colors.surface, borderBottomWidth:1, borderBottomColor: theme.colors.border },
  mTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  lab: { fontSize: 13, fontWeight:'600', color: theme.colors.textSec, marginTop: theme.spacing.md, textAlign:'right' },
  in: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 12, fontSize: 14, marginTop: 6, textAlign:'right', color: theme.colors.text },
  miniBtn: { backgroundColor: theme.colors.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radius.full },
  miniBtnT: { color:'#fff', fontWeight:'700', fontSize: 12 },
  lcard: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 10, marginTop: 8 },
  lnum: { fontWeight: '700', color: theme.colors.primary, marginBottom: 4, textAlign:'right' },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 14, alignItems:'center', marginTop: theme.spacing.lg },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 15 },
});
