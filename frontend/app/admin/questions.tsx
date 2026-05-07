import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api';
import { theme, DEPARTMENTS, DEPT_NAME } from '../../src/theme';
import { confirmAction, notify } from '../../src/dialog';

export default function AdminQuestions() {
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const load = async () => { try { setList(await api('/admin/questions')||[]); } catch {} };
  useEffect(()=>{ load(); }, []);

  const del = (qid: string) => {
    confirmAction('تأكيد', 'حذف هذا السؤال؟', async () => {
      try { await api(`/admin/questions/${qid}`, { method:'DELETE' }); load(); }
      catch(e:any){ notify('خطأ', e.message); }
    });
  };

  const shown = filter==='all'?list:list.filter(q=>q.department===filter);

  return (
    <SafeAreaView style={s.c} testID="admin-questions">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <View style={s.head}>
          <Text style={s.h1}>الأسئلة ({list.length})</Text>
          <TouchableOpacity testID="add-q" style={s.add} onPress={()=>setShowAdd(true)}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={s.addT}>إضافة</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8, paddingVertical:8}}>
          <TouchableOpacity onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipA]}><Text style={[s.chipT, filter==='all'&&{color:'#fff'}]}>الكل</Text></TouchableOpacity>
          {DEPARTMENTS.map(d=>(
            <TouchableOpacity key={d.id} onPress={()=>setFilter(d.id)} style={[s.chip, filter===d.id&&s.chipA]}>
              <Text style={[s.chipT, filter===d.id&&{color:'#fff'}]}>{d.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {shown.map(q => (
          <View key={q.id} style={s.card}>
            <View style={s.row}>
              <View style={s.dtag}><Text style={s.dtagT}>{DEPT_NAME[q.department]}</Text></View>
              <View style={s.ltag}><Text style={s.ltagT}>المرحلة {q.level}</Text></View>
              <TouchableOpacity onPress={()=>setEditing(q)} testID={`edit-${q.id}`}>
                <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>del(q.id)} testID={`del-${q.id}`}>
                <Ionicons name="trash" size={18} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={s.q}>{q.q}</Text>
            {q.options.map((o:string, i:number)=>(
              <Text key={i} style={[s.opt, i===q.correct && s.optC]}>{i===q.correct?'✓':'•'} {o}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
      <QForm visible={showAdd} initial={null} onClose={()=>setShowAdd(false)} onSaved={load} />
      <QForm visible={!!editing} initial={editing} onClose={()=>setEditing(null)} onSaved={load} />
    </SafeAreaView>
  );
}

function QForm({ visible, initial, onClose, onSaved }: any) {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState(['','','','']);
  const [correct, setCorrect] = useState(0);
  const [dept, setDept] = useState('cs');
  const [lvl, setLvl] = useState(1);
  const [busy, setBusy] = useState(false);
  const isEdit = !!initial;

  useEffect(()=>{
    if (initial) {
      setQ(initial.q); setOpts([...initial.options, '', '', '', ''].slice(0,4)); setCorrect(initial.correct);
      setDept(initial.department); setLvl(initial.level);
    } else { setQ(''); setOpts(['','','','']); setCorrect(0); setDept('cs'); setLvl(1); }
  }, [visible, initial]);

  const submit = async () => {
    if (!q.trim() || opts.some(o=>!o.trim())) return notify('تنبيه','أكمل السؤال والخيارات');
    setBusy(true);
    try {
      const body = { q, options: opts, correct, department: dept, level: lvl };
      if (isEdit) await api(`/admin/questions/${initial.id}`, { method:'PUT', body: JSON.stringify(body) });
      else await api('/admin/questions', { method:'POST', body: JSON.stringify(body) });
      onSaved(); onClose();
    } catch(e:any) { notify('خطأ', e.message); } finally { setBusy(false); }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{flex:1, backgroundColor: theme.colors.bg}}>
        <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
          <View style={s.mhead}>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={theme.colors.text} /></TouchableOpacity>
            <Text style={s.mTitle}>{isEdit?'تعديل سؤال':'سؤال جديد'}</Text>
            <View style={{width:24}} />
          </View>
          <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
            <Text style={s.lab}>السؤال</Text>
            <TextInput style={[s.in,{height:80}]} multiline value={q} onChangeText={setQ} placeholder="نص السؤال" placeholderTextColor={theme.colors.textTer} />
            <Text style={s.lab}>القسم</Text>
            <View style={s.chips}>{DEPARTMENTS.map(d=>(
              <TouchableOpacity key={d.id} onPress={()=>setDept(d.id)} style={[s.chip, dept===d.id&&s.chipA]}><Text style={[s.chipT, dept===d.id&&{color:'#fff'}]}>{d.name}</Text></TouchableOpacity>
            ))}</View>
            <Text style={s.lab}>المرحلة</Text>
            <View style={s.chips}>{[1,2,3,4].map(n=>(
              <TouchableOpacity key={n} onPress={()=>setLvl(n)} style={[s.chip, lvl===n&&s.chipA]}><Text style={[s.chipT, lvl===n&&{color:'#fff'}]}>المرحلة {n}</Text></TouchableOpacity>
            ))}</View>
            <Text style={s.lab}>الخيارات (اختر الإجابة الصحيحة)</Text>
            {opts.map((o,i)=>(
              <View key={i} style={s.optRow}>
                <TouchableOpacity onPress={()=>setCorrect(i)} style={[s.radio, correct===i && s.radioA]}>
                  {correct===i && <View style={s.dot} />}
                </TouchableOpacity>
                <TextInput style={[s.in, {flex:1, marginTop:0}]} value={o} onChangeText={t=>{const n=[...opts]; n[i]=t; setOpts(n);}} placeholder={`الخيار ${i+1}`} placeholderTextColor={theme.colors.textTer} />
              </View>
            ))}
            <TouchableOpacity testID="save-q" onPress={submit} disabled={busy} style={s.btn}>
              <Text style={s.btnT}>{busy?'...':isEdit?'حفظ التعديلات':'حفظ السؤال'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  head: { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  h1: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  add: { flexDirection:'row', alignItems:'center', gap: 4, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full },
  addT: { color:'#fff', fontWeight:'700' },
  chips: { flexDirection:'row', flexWrap:'wrap', gap:8, marginTop:8 },
  chip: { backgroundColor: theme.colors.surfaceAlt, paddingHorizontal: 14, paddingVertical: 8, borderRadius: theme.radius.full },
  chipA: { backgroundColor: theme.colors.primary },
  chipT: { color: theme.colors.text, fontWeight:'600', fontSize: 13 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, marginBottom: 10 },
  row: { flexDirection:'row', alignItems:'center', gap: 8 },
  dtag: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full },
  dtagT: { color: theme.colors.primary, fontSize: 11, fontWeight:'700' },
  ltag: { backgroundColor: theme.colors.accentLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radius.full, marginLeft: 'auto' },
  ltagT: { color: theme.colors.accent, fontSize: 11, fontWeight:'700' },
  q: { fontSize: 15, fontWeight:'700', color: theme.colors.text, marginTop: 8, textAlign:'right' },
  opt: { color: theme.colors.textSec, marginTop: 4, fontSize: 13, textAlign:'right' },
  optC: { color: theme.colors.success, fontWeight:'700' },
  mhead: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding: 14, backgroundColor: theme.colors.surface, borderBottomWidth:1, borderBottomColor: theme.colors.border },
  mTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  lab: { fontSize: 13, fontWeight:'600', color: theme.colors.textSec, marginTop: theme.spacing.md, textAlign:'right' },
  in: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 12, fontSize: 14, marginTop: 6, textAlign:'right', color: theme.colors.text },
  optRow: { flexDirection:'row', alignItems:'center', gap: 8, marginTop: 8 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.textTer, alignItems:'center', justifyContent:'center' },
  radioA: { borderColor: theme.colors.primary },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 14, alignItems:'center', marginTop: theme.spacing.lg },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 15 },
});
