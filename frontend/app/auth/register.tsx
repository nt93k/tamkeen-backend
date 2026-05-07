import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/auth';
import { theme, DEPARTMENTS } from '../../src/theme';

export default function Register() {
  const { register } = useAuth();
  const params = useLocalSearchParams<{ role?: string }>();
  const role = (params.role === 'employer' ? 'employer' : 'student') as 'student'|'employer';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // student
  const [department, setDepartment] = useState(DEPARTMENTS[0].id);
  const [level, setLevel] = useState(1);
  const [gender, setGender] = useState<'male'|'female'>('male');
  // employer
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email || !password || !name) return Alert.alert('تنبيه','أكمل البيانات الأساسية');
    setBusy(true);
    try {
      await register({
        email: email.trim(), password, name, role,
        department: role==='student'?department:undefined,
        level: role==='student'?level:undefined,
        gender: role==='student'?gender:undefined,
        company_name: role==='employer'?companyName:undefined,
        company_address: role==='employer'?address:undefined,
        company_specialty: role==='employer'?specialty:undefined,
      });
      router.replace('/');
    } catch (e: any) { Alert.alert('خطأ', e.message); }
    finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.c} testID="register-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
          <Text style={s.h1}>إنشاء حساب {role==='student'?'طالب':'شركة'}</Text>
          <Text style={s.sub}>أدخل بياناتك لبدء رحلتك</Text>

          <Text style={s.lab}>{role==='employer'?'اسم المسؤول':'الاسم الكامل'}</Text>
          <TextInput testID="reg-name" style={s.in} value={name} onChangeText={setName} placeholder="الاسم" placeholderTextColor={theme.colors.textTer} />
          <Text style={s.lab}>البريد الإلكتروني</Text>
          <TextInput testID="reg-email" style={s.in} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="email@example.com" placeholderTextColor={theme.colors.textTer} />
          <Text style={s.lab}>كلمة السر</Text>
          <TextInput testID="reg-password" style={s.in} value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" placeholderTextColor={theme.colors.textTer} />

          {role==='student' ? (
            <>
              <Text style={s.lab}>القسم</Text>
              <View style={s.chips}>
                {DEPARTMENTS.map(d => (
                  <TouchableOpacity key={d.id} testID={`dept-${d.id}`} onPress={()=>setDepartment(d.id)}
                    style={[s.chip, department===d.id && s.chipA]}>
                    <Text style={[s.chipT, department===d.id && {color:'#fff'}]}>{d.emoji} {d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.lab}>المرحلة الدراسية</Text>
              <View style={s.chips}>
                {[1,2,3,4].map(n => (
                  <TouchableOpacity key={n} testID={`level-${n}`} onPress={()=>setLevel(n)} style={[s.chip, level===n && s.chipA]}>
                    <Text style={[s.chipT, level===n && {color:'#fff'}]}>المرحلة {n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.lab}>الجنس</Text>
              <View style={s.chips}>
                <TouchableOpacity testID="gender-male" onPress={()=>setGender('male')} style={[s.chip, gender==='male' && s.chipA]}>
                  <Text style={[s.chipT, gender==='male' && {color:'#fff'}]}>ذكر</Text>
                </TouchableOpacity>
                <TouchableOpacity testID="gender-female" onPress={()=>setGender('female')} style={[s.chip, gender==='female' && s.chipA]}>
                  <Text style={[s.chipT, gender==='female' && {color:'#fff'}]}>أنثى</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={s.lab}>اسم الشركة</Text>
              <TextInput testID="reg-company" style={s.in} value={companyName} onChangeText={setCompanyName} placeholder="اسم الشركة" placeholderTextColor={theme.colors.textTer} />
              <Text style={s.lab}>العنوان</Text>
              <TextInput testID="reg-address" style={s.in} value={address} onChangeText={setAddress} placeholder="المدينة، الدولة" placeholderTextColor={theme.colors.textTer} />
              <Text style={s.lab}>التخصص</Text>
              <TextInput testID="reg-specialty" style={s.in} value={specialty} onChangeText={setSpecialty} placeholder="مثال: تطوير برمجيات" placeholderTextColor={theme.colors.textTer} />
            </>
          )}

          <TouchableOpacity testID="reg-submit" style={s.btn} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>إنشاء الحساب</Text>}
          </TouchableOpacity>
          <TouchableOpacity testID="goto-login" onPress={()=>router.replace('/auth/login')} style={{marginTop: theme.spacing.md, alignItems:'center'}}>
            <Text style={{color: theme.colors.primary, fontWeight:'600'}}>لدي حساب • تسجيل الدخول</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 28, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  sub: { fontSize: 14, color: theme.colors.textSec, marginTop: 4, textAlign:'right', marginBottom: theme.spacing.md },
  lab: { fontSize: 13, fontWeight: '600', color: theme.colors.textSec, marginTop: theme.spacing.md, textAlign:'right' },
  in: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 14, fontSize: 15, marginTop: 6, textAlign:'right', color: theme.colors.text },
  chips: { flexDirection:'row', flexWrap:'wrap', gap: 8, marginTop: 8 },
  chip: { backgroundColor: theme.colors.surfaceAlt, paddingVertical: 10, paddingHorizontal: 14, borderRadius: theme.radius.full },
  chipA: { backgroundColor: theme.colors.primary },
  chipT: { color: theme.colors.text, fontWeight: '600', fontSize: 13 },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 16, alignItems:'center', marginTop: theme.spacing.lg },
  btnT: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
