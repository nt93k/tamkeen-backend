import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/auth';
import { api } from '../../src/api';
import { theme, DEPT_NAME } from '../../src/theme';

export default function Home() {
  const { user, refresh } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { const n = await api('/notifications'); setNotifs(n || []); } catch {}
  }, []);
  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await refresh(); await load(); setRefreshing(false); };

  if (!user) return null;
  const passed = !!user.passed_competency;
  const unread = notifs.filter(n => !n.read).length;

  return (
    <SafeAreaView style={s.c} testID="student-home">
      <ScrollView contentContainerStyle={{padding: theme.spacing.lg}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={s.header}>
          <View>
            <Text style={s.hi}>أهلاً، {user.name?.split(' ')[0]}</Text>
            <Text style={s.muted}>{DEPT_NAME[user.department] || ''} • المرحلة {user.level || '—'}</Text>
          </View>
          <TouchableOpacity testID="notif-bell" onPress={()=>router.push('/notifications')} style={s.bell}>
            <Ionicons name="notifications" size={22} color={theme.colors.text} />
            {unread > 0 && <View style={s.badge}><Text style={s.badgeT}>{unread}</Text></View>}
          </TouchableOpacity>
        </View>

        <View style={[s.card, passed ? s.cardSuccess : s.cardWarn]}>
          <Text style={s.cardTitle}>{passed ? '🎉 لقد اجتزت اختبار الكفاءة' : '🚀 ابدأ بإجراء اختبار الكفاءة'}</Text>
          <Text style={s.cardSub}>{passed ? `نتيجتك: ${user.last_score || 0}% — تصفح الوظائف الآن` : 'مستوى أداءك يحدد مساراً مخصصاً لك'}</Text>
          <TouchableOpacity testID="cta-test" onPress={()=>router.push('/test/competency')} style={s.cta}>
            <Text style={s.ctaT}>{passed ? 'إعادة الاختبار' : 'بدء الاختبار'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.section}>طريقك السريع</Text>
        <View style={s.grid}>
          <TouchableOpacity testID="quick-jobs" onPress={()=>router.push('/student/jobs')} style={s.tile}>
            <Ionicons name="briefcase" size={28} color={theme.colors.primary} />
            <Text style={s.tileT}>الوظائف</Text>
            <Text style={s.tileSub}>{passed ? 'تصفح الفرص' : 'اجتز الاختبار أولاً'}</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quick-academy" onPress={()=>router.push('/student/academy')} style={s.tile}>
            <Ionicons name="school" size={28} color={theme.colors.accent} />
            <Text style={s.tileT}>أكاديمية تمكين</Text>
            <Text style={s.tileSub}>دروس قصيرة وتحديات</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quick-mentor" onPress={()=>router.push('/student/mentor')} style={s.tile}>
            <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
            <Text style={s.tileT}>المرشد الذكي</Text>
            <Text style={s.tileSub}>اسأل ما تريد</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="quick-interview" onPress={()=>router.push('/interview')} style={s.tile}>
            <Ionicons name="chatbubbles" size={28} color={theme.colors.accent} />
            <Text style={s.tileT}>مقابلة افتراضية</Text>
            <Text style={s.tileSub}>تدرّب قبل الشركات</Text>
          </TouchableOpacity>
        </View>

        <Image source={{ uri: 'https://static.prod-images.emergentagent.com/jobs/e541b2dc-ff18-436b-81a3-89cf2bf9af07/images/341b89a940edbf6be2b004b421336cdf14ab93555f04c72fb135818f1ce802fe.png' }}
          style={{ width:'100%', height: 160, marginTop: theme.spacing.lg, borderRadius: theme.radius.lg }} resizeMode="contain" />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  c: { flex:1, backgroundColor: theme.colors.bg },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom: theme.spacing.lg },
  hi: { fontSize: 24, fontWeight: '800', color: theme.colors.text, textAlign:'right' },
  muted: { color: theme.colors.textSec, fontSize: 13, marginTop: 2, textAlign:'right' },
  bell: { padding: 10, backgroundColor: theme.colors.surface, borderRadius: theme.radius.full },
  badge: { position:'absolute', top:4, left:4, backgroundColor: theme.colors.accent, minWidth:18, height:18, borderRadius:9, alignItems:'center', justifyContent:'center', paddingHorizontal:4 },
  badgeT: { color:'#fff', fontSize:10, fontWeight:'700' },
  card: { borderRadius: theme.radius.lg, padding: theme.spacing.lg, marginBottom: theme.spacing.lg },
  cardWarn: { backgroundColor: theme.colors.primary },
  cardSuccess: { backgroundColor: theme.colors.success },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign:'right' },
  cardSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 6, textAlign:'right' },
  cta: { backgroundColor: '#fff', alignSelf:'flex-end', borderRadius: theme.radius.full, paddingVertical: 10, paddingHorizontal: 20, marginTop: theme.spacing.md },
  ctaT: { color: theme.colors.primary, fontWeight: '700' },
  section: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: theme.spacing.md, textAlign:'right' },
  grid: { flexDirection:'row', flexWrap:'wrap', gap: 12 },
  tile: { width: '48%', backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: theme.spacing.md, borderWidth:1, borderColor: theme.colors.border, minHeight: 120 },
  tileT: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginTop: 8, textAlign:'right' },
  tileSub: { fontSize: 11, color: theme.colors.textSec, marginTop: 2, textAlign:'right' },
});
