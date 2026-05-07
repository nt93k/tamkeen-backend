import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../src/theme';

export default function Welcome() {
  const [role, setRole] = useState<'student'|'employer'>('student');
  return (
    <SafeAreaView style={s.c} testID="welcome-screen">
      <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, flexGrow: 1 }}>
        <View style={s.brand}>
          <Text style={s.logo}>تمكين</Text>
          <Text style={s.tag}>جسرك من الجامعة إلى الوظيفة</Text>
        </View>

        <Image source={{ uri: 'https://static.prod-images.emergentagent.com/jobs/e541b2dc-ff18-436b-81a3-89cf2bf9af07/images/a0a42a731dd9238f3ab0bbc2f57bd67ede7d3900aba8d6b72185247ae12fecf9.png' }}
          style={s.hero} resizeMode="contain" />

        <Text style={s.h2}>اختر هويتك</Text>
        <View style={s.row}>
          <TouchableOpacity testID="role-student" onPress={() => setRole('student')}
            style={[s.role, role==='student' && s.roleActive]}>
            <Text style={s.roleEmoji}>🎓</Text>
            <Text style={[s.roleTitle, role==='student' && { color: '#fff' }]}>طالب</Text>
            <Text style={[s.roleSub, role==='student' && { color: '#E6ECFF' }]}>اختبر، تعلم، وظّف نفسك</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="role-employer" onPress={() => setRole('employer')}
            style={[s.role, role==='employer' && s.roleActive]}>
            <Text style={s.roleEmoji}>🏢</Text>
            <Text style={[s.roleTitle, role==='employer' && { color: '#fff' }]}>شركة</Text>
            <Text style={[s.roleSub, role==='employer' && { color: '#E6ECFF' }]}>وظّف أفضل المواهب</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: theme.spacing.xl }} />
        <TouchableOpacity testID="goto-register" style={s.btn}
          onPress={() => router.push({ pathname: '/auth/register', params: { role } })}>
          <Text style={s.btnText}>إنشاء حساب جديد</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="goto-login" style={s.btnOut}
          onPress={() => router.push('/auth/login')}>
          <Text style={s.btnOutText}>لدي حساب • تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  brand: { alignItems:'center', marginTop: theme.spacing.lg },
  logo: { fontSize: 44, fontWeight: '800', color: theme.colors.primary, letterSpacing: -1 },
  tag: { fontSize: 15, color: theme.colors.textSec, marginTop: 4 },
  hero: { width: '100%', height: 180, marginVertical: theme.spacing.lg },
  h2: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md, textAlign: 'right' },
  row: { flexDirection: 'row', gap: theme.spacing.md },
  role: { flex:1, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, alignItems:'center', borderWidth: 1, borderColor: theme.colors.border },
  roleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  roleEmoji: { fontSize: 36, marginBottom: 6 },
  roleTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  roleSub: { fontSize: 12, color: theme.colors.textSec, marginTop: 4, textAlign:'center' },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.full, paddingVertical: 16, alignItems:'center', marginTop: theme.spacing.md },
  btnText: { color: '#fff', fontWeight:'700', fontSize: 16 },
  btnOut: { backgroundColor: 'transparent', borderRadius: theme.radius.full, paddingVertical: 14, alignItems:'center', marginTop: theme.spacing.sm, borderWidth:1, borderColor: theme.colors.border },
  btnOutText: { color: theme.colors.text, fontWeight:'600', fontSize: 15 },
});
