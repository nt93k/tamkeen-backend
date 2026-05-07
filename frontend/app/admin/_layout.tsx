import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';

export default function AdminLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textTer,
      tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 64, paddingTop: 6 },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="dashboard" options={{ title:'لوحة التحكم', tabBarIcon: ({color,size}) => <Ionicons name="analytics" size={size} color={color} /> }} />
      <Tabs.Screen name="questions" options={{ title:'الأسئلة', tabBarIcon: ({color,size}) => <Ionicons name="help-circle" size={size} color={color} /> }} />
      <Tabs.Screen name="courses" options={{ title:'الكورسات', tabBarIcon: ({color,size}) => <Ionicons name="book" size={size} color={color} /> }} />
      <Tabs.Screen name="tickets" options={{ title:'التذاكر', tabBarIcon: ({color,size}) => <Ionicons name="mail" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title:'حسابي', tabBarIcon: ({color,size}) => <Ionicons name="person-circle" size={size} color={color} /> }} />
    </Tabs>
  );
}
