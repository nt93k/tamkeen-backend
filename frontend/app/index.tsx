import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth';
import { theme } from '../src/theme';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <View style={s.c} testID="splash-screen">
        <Text style={s.title}>تمكين</Text>
        <Text style={s.sub}>منصة التعليم والتوظيف الذكي</Text>
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }
  if (!user) return <Redirect href="/auth/welcome" />;
  if (user.role === 'admin') return <Redirect href="/admin/dashboard" />;
  if (user.role === 'employer') return <Redirect href="/employer/home" />;
  return <Redirect href="/student/home" />;
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 48, fontWeight: '800', color: theme.colors.primary, letterSpacing: -1 },
  sub: { fontSize: 16, color: theme.colors.textSec, marginTop: 8 },
});
