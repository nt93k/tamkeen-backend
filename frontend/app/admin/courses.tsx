import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme, DEPARTMENTS, DEPT_NAME } from '../../src/theme';
import { confirmAction, notify } from '../../src/dialog';

export default function AdminCourses() {
  const [list, setList] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const load = async () => { try { setList(await api('/courses')||[]); } catch {} };
  useEffect(()=>{ load(); }, []);
  const del = (cid:string) => {
    confirmAction('تأكيد', 'حذف هذه الدورة؟', async () => {
      try { await api(`/admin/courses/${cid}`, { method:'DELETE' }); load(); }
      catch(e:any){ notify('خطأ', e.message); }
    });
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
              {c.provider && <View style={s.ptag}><Text style={s.ptagT}>{c.provider}</Text></View>}
              <Text style={s.dur}>⏱ {c.duration_min} د • {c.lessons?.length||0} دروس</Text>
              <TouchableOpacity onPress={()=>setEditing(c)} testID={`edit-c-${c.course_id}`}>
                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>del(c.course_id)} testID={`del-c-${c.course_id}`}>
                <Ionicons name="trash" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={s.title}>{c.title}</Text>
            <Text style={s.desc}>{c.summary}</Text>
            {c.external_url ? (
              <TouchableOpacity onPress={()=>Linking.openURL(c.external_url)}>
                <Text style={s.link} numberOfLines={1}>🔗 {c.external_url}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <CForm visible={showAdd} initial={null} onClose={()=>setShowAdd(false)} onSaved={load} />
      <CForm visible={!!editing} initial={editing} onClose={()=>setEditing(null)} onSaved={load} />
    </SafeAreaView>
  );
}

function CForm({ visible, initial, onClose, onSaved }: any) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [dept, setDept] = useState('cs');
  const [duration, setDuration] = useState('20');
  const [provider, setProvider] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [lessons, setLessons] = useState<any[]>([{id:'l1', title:'', content:'', video_minutes:5, url:''}]);
  const [busy, setBusy] = useState(false);
  const isEdit = !!initial;

  useEffect(()=>{
    if (initial) {
      setTitle(initial.title); setSummary(initial.summary); setDept(initial.department);
      setDuration(String(initial.duration_min||20)); setProvider(initial.provider||''); setExternalUrl(initial.external_url||'');
      setLessons(initial.lessons?.length ? initial.lessons.map((l:any)=>({...l, url: l.url||''})) : [{id:'l1', title:'', content:'', video_minutes:5, url:''}]);
    } else {
      setTitle(''); setSummary(''); setDept('cs'); setDuration('20'); setProvider(''); setExternalUrl('');
      setLessons([{id:'l1', title:'', content:'', video_minutes:5, url:''}]);
    }
  }, [visible, initial]);

  const addLesson = () => setLessons(l => [...l, {id:`l${l.length+1}`, title:'', content:'', video_minutes:5, url:''}]);
  const removeLesson = (i:number) => setLessons(l => l.filter((_,idx)=>idx!==i));
  const setL = (i:number, k:string, v:any) => setLessons(l => l.map((x,idx)=> idx===i?{...x,[k]:v}:x));

  const submit = async () => {
    if (!title.trim() || !summary.trim()) return notify('تنبيه','أكمل العنوان والوصف');
    if (lessons.length && lessons.some(l=>!l.title)) return notify('تنبيه','أكمل عناوين الدروس');
    setBusy(true);
    try {
      const body = { title, summary, department: dept, duration_min: parseInt(duration)||20, provider: provider||null, external_url: externalUrl||null, lessons };
      if (isEdit) await api(`/admin/courses/${initial.course_id}`, { method:'PUT', body: JSON.stringify(body) });
      else await api('/admin/courses', { method:'POST', body: JSON.stringify(body) });
      onSaved(); onClose();
    } catch(e:any){ notify('خطأ', e.message); } finally { setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{flex:1, backgroundColor: theme.colors.bg}}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <View style={s.mhead}>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
            <Text style={s.mTitle}>{isEdit?'تعديل كورس':'كورس جديد'}</Text>
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
            <Text style={s.lab}>المنصة (اختياري)</Text>
            <View style={s.chips}>
              {['Coursera','Udemy','edX','YouTube','Khan Academy','أخرى'].map(p=>(
                <TouchableOpacity key={p} onPress={()=>setProvider(p)} style={[s.chip, provider===p&&s.chipA]}><Text style={[s.chipT, provider===p&&{color:'#fff'}]}>{p}</Text></TouchableOpacity>
              ))}
            </View>
            <Text style={s.lab}>رابط الكورس الخارجي (URL)</Text>
            <TextInput style={s.in} value={externalUrl} onChangeText={setExternalUrl} placeholder="https://www.coursera.org/learn/..." placeholderTextColor={theme.colors.textTer} autoCapitalize="none" />
            <View style={[s.row, {marginTop: theme.spacing.lg}]}>
              <Text style={[s.lab,{marginTop:0, flex:1}]}>الدروس ({lessons.length})</Text>
              <TouchableOpacity onPress={addLesson} style={s.miniBtn}><Text style={s.miniBtnT}>+ درس</Text></TouchableOpacity>
            </View>
            {lessons.map((l,i)=>(
              <View key={i} style={s.lcard}>
                <View style={s.row}>
                  <Text style={s.lnum}>درس {i+1}</Text>
                  <View style={{flex:1}} />
                  {lessons.length>1 && (
                    <TouchableOpacity onPress={()=>removeLesson(i)}><Ionicons name="trash" size={16} color={theme.colors.error} /></TouchableOpacity>
                  )}
                </View>
                <TextInput style={s.in} value={l.title} onChangeText={t=>setL(i,'title',t)} placeholder="عنوان الدرس" placeholderTextColor={theme.colors.textTer} />
                <TextInput style={[s.in,{height:60}]} multiline value={l.content} onChangeText={t=>setL(i,'content',t)} placeholder="محتوى الدرس (اختياري)" placeholderTextColor={theme.colors.textTer} />
                <TextInput style={s.in} value={l.url||''} onChangeText={t=>setL(i,'url',t)} placeholder="رابط الفيديو (YouTube/Coursera...)" autoCapitalize="none" placeholderTextColor={theme.colors.textTer} />
                <TextInput style={s.in} value={String(l.video_minutes)} onChangeText={t=>setL(i,'video_minutes', parseInt(t)||0)} placeholder="دقائق" keyboardType="numeric" placeholderTextColor={theme.colors.textTer} />
              </View>
            ))}
            <TouchableOpacity testID="save-c" onPress={submit} disabled={busy} style={s.btn}>
              <Text style={s.btnT}>{busy?'...':isEdit?'حفظ التعديلات':'حفظ الكورس'}</Text>
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
  ptag: { backgroundColor: theme.colors.accentLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full },
  ptagT: { color: theme.colors.accent, fontSize: 11, fontWeight:'700' },
  dur: { color: theme.colors.textSec, fontSize: 12, flex:1, textAlign:'right' },
  title: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginTop: 8, textAlign:'right' },
  desc: { color: theme.colors.textSec, marginTop: 4, textAlign:'right' },
  link: { color: theme.colors.primary, fontSize: 12, marginTop: 8, textAlign:'right' },
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
