import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

const { width } = Dimensions.get('window');

export default function Welcome() {
  const [role, setRole] = useState<'student'|'employer'>('student');
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={s.c} testID="welcome-screen">
      <ScrollView contentContainerStyle={{padding: 24, flexGrow: 1}} showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.heroWrap, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={s.badge}>
            <View style={s.dot} />
            <Text style={s.badgeT}>منصة الجيل الجديد</Text>
          </View>
          <Text style={s.heroTitle}>تَمْكين</Text>
          <Text style={s.heroSub}>جسرك من الجامعة{'\n'}إلى عالم الفرص</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fade, marginTop: 20 }}>
          <View style={s.statsRow}>
            <View style={s.stat}><Text style={s.statN}>4</Text><Text style={s.statL}>أقسام</Text></View>
            <View style={s.statDiv} />
            <View style={s.stat}><Text style={s.statN}>AI</Text><Text style={s.statL}>مرشد ذكي</Text></View>
            <View style={s.statDiv} />
            <View style={s.stat}><Text style={s.statN}>∞</Text><Text style={s.statL}>فرص</Text></View>
          </View>
        </Animated.View>

        <Text style={s.h2}>اختر هويتك</Text>

        <View style={s.row}>
          <TouchableOpacity testID="role-student" onPress={()=>setRole('student')} activeOpacity={0.9}
            style={[s.role, role==='student' && s.roleActiveStudent]}>
            <View style={[s.roleIcon, role==='student' && {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
              <Text style={s.roleEmoji}>🎓</Text>
            </View>
            <Text style={[s.roleTitle, role==='student' && {color:'#fff'}]}>طالب</Text>
            <Text style={[s.roleSub, role==='student' && {color:'rgba(255,255,255,0.85)'}]}>اختبر • تعلّم • وظّف</Text>
            {role==='student' && <Ionicons name="checkmark-circle" size={20} color="#fff" style={s.checkIcon} />}
          </TouchableOpacity>

          <TouchableOpacity testID="role-employer" onPress={()=>setRole('employer')} activeOpacity={0.9}
            style={[s.role, role==='employer' && s.roleActiveEmployer]}>
            <View style={[s.roleIcon, role==='employer' && {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
              <Text style={s.roleEmoji}>🏢</Text>
            </View>
            <Text style={[s.roleTitle, role==='employer' && {color:'#fff'}]}>شركة</Text>
            <Text style={[s.roleSub, role==='employer' && {color:'rgba(255,255,255,0.85)'}]}>وظّف أفضل المواهب</Text>
            {role==='employer' && <Ionicons name="checkmark-circle" size={20} color="#fff" style={s.checkIcon} />}
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity testID="goto-register" style={s.cta} activeOpacity={0.9}
          onPress={() => router.push({ pathname: '/auth/register', params: { role } })}>
          <Text style={s.ctaT}>إنشاء حساب جديد</Text>
          <Ionicons name="arrow-back" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity testID="goto-login" style={s.ctaOut} onPress={()=>router.push('/auth/login')}>
          <Text style={s.ctaOutT}>لدي حساب • تسجيل الدخول</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  heroWrap: { alignItems:'center', marginTop: 24 },
  badge: { flexDirection:'row', alignItems:'center', gap: 8, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, marginBottom: 16 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  badgeT: { color: theme.colors.primary, fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 64, fontWeight: '900', color: theme.colors.text, letterSpacing: -2 },
  heroSub: { fontSize: 17, color: theme.colors.textSec, marginTop: 8, textAlign:'center', lineHeight: 26 },
  statsRow: { flexDirection:'row', backgroundColor: theme.colors.surface, borderRadius: 22, padding: 16, alignItems:'center', justifyContent:'space-around', ...theme.shadow.sm },
  stat: { flex:1, alignItems:'center' },
  statN: { fontSize: 22, fontWeight: '900', color: theme.colors.primary },
  statL: { fontSize: 11, color: theme.colors.textSec, marginTop: 2, fontWeight:'600' },
  statDiv: { width: 1, height: 28, backgroundColor: theme.colors.border },
  h2: { fontSize: 22, fontWeight: '800', color: theme.colors.text, marginTop: 32, marginBottom: 16, textAlign:'right' },
  row: { flexDirection:'row', gap: 12 },
  role: { flex:1, backgroundColor: theme.colors.surface, borderRadius: 22, padding: 18, borderWidth: 1.5, borderColor: theme.colors.border, minHeight: 140, ...theme.shadow.sm },
  roleActiveStudent: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary, ...theme.shadow.lg },
  roleActiveEmployer: { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse },
  roleIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: theme.colors.surfaceAlt, alignItems:'center', justifyContent:'center', marginBottom: 12 },
  roleEmoji: { fontSize: 30 },
  roleTitle: { fontSize: 19, fontWeight: '800', color: theme.colors.text },
  roleSub: { fontSize: 12, color: theme.colors.textSec, marginTop: 2 },
  checkIcon: { position: 'absolute', top: 14, left: 14 },
  cta: { flexDirection:'row', justifyContent:'center', alignItems:'center', gap: 10, backgroundColor: theme.colors.primary, borderRadius: 100, paddingVertical: 18, marginTop: 32, ...theme.shadow.lg },
  ctaT: { color:'#fff', fontWeight:'800', fontSize: 16 },
  ctaOut: { paddingVertical: 14, alignItems:'center', marginTop: 8 },
  ctaOutT: { color: theme.colors.text, fontWeight:'600', fontSize: 14 },
});
