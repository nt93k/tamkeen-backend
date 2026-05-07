import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function Forgot() {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState<1|2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!email) return Alert.alert('تنبيه','أدخل بريدك');
    setBusy(true);
    try { await forgotPassword(email.trim()); setStep(2); Alert.alert('تم','تحقق من بريدك (أو الـ Spam)'); }
    catch(e:any){ Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };
  const reset = async () => {
    if (code.length<4 || pw.length<6) return Alert.alert('تنبيه','أكمل البيانات (كلمة سر 6+ حروف)');
    setBusy(true);
    try { await resetPassword(email.trim(), code, pw); Alert.alert('تم','تم تحديث كلمة السر، سجّل الدخول'); router.replace('/auth/login'); }
    catch(e:any){ Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.c} testID="forgot-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding: 24, flexGrow:1, justifyContent:'center'}}>
          <View style={s.icon}><Ionicons name="key" size={36} color={theme.colors.primary} /></View>
          <Text style={s.h1}>{step===1?'استعادة كلمة السر':'كلمة سر جديدة'}</Text>
          <Text style={s.sub}>{step===1?'سنرسل رمز تحقق إلى بريدك':`أدخل الرمز المرسل إلى ${email}`}</Text>
          {step===1 ? (
            <>
              <TextInput testID="forgot-email" style={s.in} value={email} onChangeText={setEmail} placeholder="email@example.com"
                placeholderTextColor={theme.colors.textTer} keyboardType="email-address" autoCapitalize="none" />
              <TouchableOpacity testID="forgot-send" style={s.btn} onPress={send} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>إرسال الرمز</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput testID="forgot-code" style={s.in} value={code} onChangeText={t=>setCode(t.replace(/\D/g,'').slice(0,6))}
                keyboardType="number-pad" placeholder="رمز التحقق (6 أرقام)" placeholderTextColor={theme.colors.textTer} maxLength={6} />
              <TextInput testID="forgot-pw" style={s.in} value={pw} onChangeText={setPw} secureTextEntry placeholder="كلمة سر جديدة"
                placeholderTextColor={theme.colors.textTer} />
              <TouchableOpacity testID="forgot-reset" style={s.btn} onPress={reset} disabled={busy}>
                {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>تعيين كلمة السر</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setStep(1)} style={{marginTop:12, alignItems:'center'}}>
                <Text style={{color: theme.colors.primary, fontWeight:'600'}}>تغيير البريد</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={()=>router.replace('/auth/login')} style={{marginTop:16, alignItems:'center'}}>
            <Text style={{color: theme.colors.textSec, fontSize:13}}>العودة لتسجيل الدخول</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primaryLight, alignItems:'center', justifyContent:'center', alignSelf:'center', marginBottom: 20 },
  h1: { fontSize: 26, fontWeight: '800', color: theme.colors.text, textAlign:'center' },
  sub: { color: theme.colors.textSec, marginTop: 8, textAlign:'center', marginBottom: 24 },
  in: { backgroundColor: theme.colors.surface, borderWidth:1, borderColor: theme.colors.border, borderRadius: 14, padding: 16, fontSize: 15, marginTop: 12, textAlign:'right', color: theme.colors.text },
  btn: { backgroundColor: theme.colors.primary, borderRadius: 100, paddingVertical: 16, alignItems:'center', marginTop: 20 },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 16 },
});
