import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

export default function EmployerLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textTer,
      tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 64, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="home" options={{ title: 'الرئيسية', tabBarIcon: ({color,size}) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="jobs" options={{ title: 'وظائفي', tabBarIcon: ({color,size}) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <Tabs.Screen name="post" options={{ title: 'نشر', tabBarIcon: ({color,size}) => <Ionicons name="add-circle" size={size+4} color={theme.colors.accent} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'حسابي', tabBarIcon: ({color,size}) => <Ionicons name="person-circle" size={size} color={color} /> }} />
    </Tabs>
  );
}
