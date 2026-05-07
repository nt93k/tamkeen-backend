import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth';
import { theme } from '../../src/theme';

export default function AProfile() {
  const { user, logout } = useAuth();
  if (!user) return null;
  return (
    <SafeAreaView style={s.c} testID="admin-profile">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}}>
        <View style={s.avatar}><Text style={s.avT}>👑</Text></View>
        <Text style={s.name}>{user.name}</Text>
        <Text style={s.email}>{user.email}</Text>
        <View style={s.badge}><Text style={s.badgeT}>مدير المنصة</Text></View>
        <TouchableOpacity testID="alogout" style={s.lo} onPress={async()=>{ await logout(); router.replace('/auth/welcome'); }}>
          <Ionicons name="log-out-outline" size={18} color={theme.colors.error} />
          <Text style={s.loT}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.accentLight, alignItems:'center', justifyContent:'center', alignSelf:'center', marginTop: 12 },
  avT: { fontSize: 44 },
  name: { fontSize: 22, fontWeight: '800', color: theme.colors.text, textAlign:'center', marginTop: 12 },
  email: { color: theme.colors.textSec, textAlign:'center' },
  badge: { alignSelf:'center', backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: theme.radius.full, marginTop: 8 },
  badgeT: { color:'#fff', fontWeight:'700', fontSize: 13 },
  lo: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap: 6, padding: 14, marginTop: theme.spacing.xl, borderRadius: theme.radius.full, borderWidth:1, borderColor: theme.colors.error },
  loT: { color: theme.colors.error, fontWeight: '700' },
});
