import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function Verify() {
  const { verifyEmail, resendCode } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = params.email || '';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async () => {
    if (code.length < 4) return Alert.alert('تنبيه','أدخل الرمز كاملاً');
    setBusy(true);
    try { await verifyEmail(email, code); router.replace('/'); }
    catch (e:any) { Alert.alert('خطأ', e.message); } finally { setBusy(false); }
  };
  const resend = async () => {
    setResending(true);
    try { await resendCode(email, 'verify'); Alert.alert('تم','أُرسل رمز جديد إلى بريدك'); }
    catch(e:any){ Alert.alert('خطأ', e.message); } finally { setResending(false); }
  };

  return (
    <SafeAreaView style={s.c} testID="verify-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding: 24, flexGrow: 1, justifyContent:'center'}}>
          <View style={s.icon}><Ionicons name="mail-open" size={42} color={theme.colors.primary} /></View>
          <Text style={s.h1}>تحقق من بريدك</Text>
          <Text style={s.sub}>أرسلنا رمزاً مكوناً من 6 أرقام إلى</Text>
          <Text style={s.email}>{email}</Text>

          <TextInput testID="otp-input" style={s.otp} value={code} onChangeText={t=>setCode(t.replace(/\D/g,'').slice(0,6))}
            keyboardType="number-pad" maxLength={6} placeholder="• • • • • •" placeholderTextColor={theme.colors.textTer}
            textAlign="center" />

          <TouchableOpacity testID="verify-submit" style={s.btn} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>تأكيد</Text>}
          </TouchableOpacity>
          <TouchableOpacity testID="resend-btn" onPress={resend} disabled={resending} style={{marginTop:16, alignItems:'center'}}>
            <Text style={{color: theme.colors.primary, fontWeight:'600'}}>{resending?'...':'لم يصلك الرمز؟ إعادة إرسال'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>router.replace('/auth/welcome')} style={{marginTop:8, alignItems:'center'}}>
            <Text style={{color: theme.colors.textSec, fontSize:13}}>عودة</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primaryLight, alignItems:'center', justifyContent:'center', alignSelf:'center', marginBottom: 20 },
  h1: { fontSize: 28, fontWeight: '800', color: theme.colors.text, textAlign:'center' },
  sub: { color: theme.colors.textSec, marginTop: 8, textAlign:'center' },
  email: { color: theme.colors.primary, fontWeight: '700', marginTop: 4, textAlign:'center' },
  otp: { backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border, borderRadius: 16, paddingVertical: 18, fontSize: 28, fontWeight: '800', letterSpacing: 8, marginTop: 32, color: theme.colors.text },
  btn: { backgroundColor: theme.colors.primary, borderRadius: 100, paddingVertical: 16, alignItems:'center', marginTop: 24 },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 16 },
});
