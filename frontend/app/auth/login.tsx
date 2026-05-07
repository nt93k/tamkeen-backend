import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function Login() {
  const { login, googleExchange } = useAuth();
  const [email, setEmail] = useState('student@tamkeen.com');
  const [password, setPassword] = useState('Student123!');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try { await login(email.trim(), password); router.replace('/'); }
    catch (e: any) { Alert.alert('خطأ', e.message); }
    finally { setBusy(false); }
  };

  const googleLogin = async () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    try {
      const redirect = `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/callback`;
      const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirect);
      if (result.type === 'success' && result.url) {
        const hash = result.url.split('#')[1] || '';
        const sid = new URLSearchParams(hash).get('session_id');
        if (sid) { await googleExchange(sid, 'student'); router.replace('/'); }
      }
    } catch (e: any) { Alert.alert('خطأ', e.message || 'فشل تسجيل الدخول بجوجل'); }
  };

  return (
    <SafeAreaView style={s.c} testID="login-screen">
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
          <Text style={s.h1}>أهلاً بعودتك</Text>
          <Text style={s.sub}>سجل دخولك للمتابعة</Text>

          <Text style={s.lab}>البريد الإلكتروني</Text>
          <TextInput testID="login-email" style={s.in} value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" placeholder="email@example.com" placeholderTextColor={theme.colors.textTer} />
          <Text style={s.lab}>كلمة السر</Text>
          <TextInput testID="login-password" style={s.in} value={password} onChangeText={setPassword}
            secureTextEntry placeholder="••••••••" placeholderTextColor={theme.colors.textTer} />

          <TouchableOpacity testID="login-submit" style={s.btn} onPress={submit} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.btnT}>دخول</Text>}
          </TouchableOpacity>

          <View style={s.div}><Text style={s.divT}>أو</Text></View>

          <TouchableOpacity testID="login-google" style={s.gbtn} onPress={googleLogin}>
            <Text style={s.gIcon}>G</Text>
            <Text style={s.gT}>متابعة بحساب جوجل</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="goto-welcome" onPress={() => router.replace('/auth/welcome')} style={{marginTop: theme.spacing.lg, alignItems:'center'}}>
            <Text style={{color: theme.colors.primary, fontWeight: '600'}}>ليس لديك حساب؟ إنشاء حساب</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  h1: { fontSize: 32, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  sub: { fontSize: 15, color: theme.colors.textSec, marginTop: 4, textAlign:'right', marginBottom: theme.spacing.lg },
  lab: { fontSize: 13, fontWeight: '600', color: theme.colors.textSec, marginTop: theme.spacing.md, textAlign:'right' },
  in: { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, padding: 16, fontSize: 15, marginTop: 6, textAlign:'right', color: theme.colors.text },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 16, alignItems:'center', marginTop: theme.spacing.lg },
  btnT: { color:'#fff', fontWeight:'700', fontSize: 16 },
  div: { flexDirection:'row', alignItems:'center', marginVertical: theme.spacing.lg },
  divT: { color: theme.colors.textTer, alignSelf:'center', flex:1, textAlign:'center' },
  gbtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 10, backgroundColor: theme.colors.surface, borderRadius: theme.radius.full, paddingVertical: 14, borderWidth: 1, borderColor: theme.colors.border },
  gIcon: { width:28, height:28, borderRadius:14, backgroundColor:'#FF5A36', color:'#fff', textAlign:'center', lineHeight:28, fontWeight:'800' },
  gT: { fontWeight:'600', color: theme.colors.text, fontSize: 15 },
});
