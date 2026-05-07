import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function EProfile() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <SafeAreaView style={s.c} testID="employer-profile">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <View style={s.avatar}><Text style={s.avT}>🏢</Text></View>
        <Text style={s.name}>{user.company_name || user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.card}>
          <Text style={s.row}>📍 العنوان: <Text style={s.b}>{user.company_address || '-'}</Text></Text>
          <Text style={s.row}>💼 التخصص: <Text style={s.b}>{user.company_specialty || '-'}</Text></Text>
          <Text style={s.row}>👤 المسؤول: <Text style={s.b}>{user.name}</Text></Text>
        </View>
        <TouchableOpacity testID="enotif-link" style={s.link} onPress={()=>router.push('/notifications')}>
          <Text style={s.linkT}>الإشعارات</Text>
          <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity testID="esupport-link" style={s.link} onPress={()=>router.push('/tickets')}>
          <Text style={s.linkT}>📨 تواصل مع الإدارة</Text>
          <Ionicons name="chevron-back" size={18} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity testID="elogout" style={s.lo} onPress={async()=>{ await logout(); router.replace('/auth/welcome'); }}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={s.loT}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  avatar: { width: 84, height: 84, borderRadius: 42, backgroundColor: theme.colors.primaryLight, alignItems:'center', justifyContent:'center', alignSelf:'center', marginTop: 12 },
  avT: { fontSize: 38 },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign:'center', marginTop: 12 },
  email: { color: theme.colors.textSec, textAlign:'center', marginBottom: theme.spacing.lg },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border },
  row: { fontSize: 14, color: theme.colors.textSec, marginVertical: 6, textAlign:'right' },
  b: { color: theme.colors.text, fontWeight: '700' },
  link: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, padding: 14, marginTop: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border },
  linkT: { fontWeight:'600', color: theme.colors.text },
  lo: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 6, padding: 14, marginTop: theme.spacing.lg, borderRadius: theme.radius.full, borderWidth:1, borderColor: theme.colors.error },
  loT: { color: theme.colors.error, fontWeight: '700' },
});
