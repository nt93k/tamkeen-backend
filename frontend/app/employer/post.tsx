import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { api } from '../../src/api';
import { theme, DEPARTMENTS } from '../../src/theme';

export default function PostJob() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [department, setDepartment] = useState('cs');
  const [level, setLevel] = useState(1);
  const [seats, setSeats] = useState('1');
  const [direct, setDirect] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title || !desc) return Alert.alert('تنبيه','أكمل الحقول');
    setBusy(true);
    try {
      await api('/jobs', { method:'POST', body: JSON.stringify({
        title, description: desc, department, level_required: level,
        seats: parseInt(seats)||1, direct_accept: direct, custom_questions: [],
      })});
      Alert.alert('تم','تم نشر الوظيفة');
      router.replace('/employer/jobs');
    } catch (e:any) { Alert.alert('خطأ', e.message); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.c} testID="post-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
          <Text style={s.h1}>نشر وظيفة جديدة</Text>
          <Text style={s.lab}>المسمى الوظيفي</Text>
          <TextInput testID="post-title" style={s.in} value={title} onChangeText={setTitle} placeholder="مطور تطبيقات..." placeholderTextColor={theme.colors.textTer} />
          <Text style={s.lab}>الوصف</Text>
          <TextInput testID="post-desc" style={[s.in,{height:100}]} value={desc} onChangeText={setDesc} multiline placeholder="وصف الوظيفة..." placeholderTextColor={theme.colors.textTer} />
          <Text style={s.lab}>القسم المطلوب</Text>
          <View style={s.chips}>
            {DEPARTMENTS.map(d=> (
              <TouchableOpacity key={d.id} testID={`pdept-${d.id}`} onPress={()=>setDepartment(d.id)} style={[s.chip, department===d.id&&s.chipA]}>
                <Text style={[s.chipT, department===d.id&&{color:'#fff'}]}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.lab}>المرحلة الأدنى</Text>
          <View style={s.chips}>
            {[1,2,3,4].map(n=>(
              <TouchableOpacity key={n} onPress={()=>setLevel(n)} style={[s.chip, level===n&&s.chipA]}>
                <Text style={[s.chipT, level===n&&{color:'#fff'}]}>المرحلة {n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={s.lab}>عدد الشواغر</Text>
          <TextInput testID="post-seats" style={s.in} value={seats} onChangeText={setSeats} keyboardType="numeric" />
          <View style={s.row}>
            <Text style={s.lab2}>قبول مباشر بناء على نتيجة الاختبار</Text>
            <TouchableOpacity testID="toggle-direct" onPress={()=>setDirect(!direct)} style={[s.toggle, direct&&s.toggleOn]}>
              <View style={[s.knob, direct&&{alignSelf:'flex-end'}]} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity testID="post-submit" style={s.btn} onPress={submit} disabled={busy}>
            <Text style={s.btnT}>{busy?'...':'نشر الوظيفة'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  lab: { fontSize: 13, fontWeight: '600', color: theme.colors.textSec, marginTop: theme.spacing.md, textAlign:'right' },
  lab2: { fontSize: 13, fontWeight: '600', color: theme.colors.textSec, flex:1, textAlign:'right' },
  in: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 14, fontSize: 15, marginTop: 6, textAlign:'right', color: theme.colors.text },
  chips: { flexDirection:'row', flexWrap:'wrap', gap: 8, marginTop: 8 },
  chip: { backgroundColor: theme.colors.surfaceAlt, paddingVertical:8, paddingHorizontal: 14, borderRadius: theme.radius.full },
  chipA: { backgroundColor: theme.colors.primary },
  chipT: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  row: { flexDirection:'row', alignItems:'center', marginTop: theme.spacing.lg, gap: 12 },
  toggle: { width: 50, height: 28, borderRadius: 14, backgroundColor: theme.colors.surfaceAlt, padding: 2, justifyContent:'center' },
  toggleOn: { backgroundColor: theme.colors.success },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 16, alignItems:'center', marginTop: theme.spacing.lg },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 16 },
});
