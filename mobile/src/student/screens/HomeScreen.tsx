import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing, shadow } from '../theme/tokens';
import { Card, Pill, ProgressBar, SectionLabel } from '../components/ui';
import { PROFILE, TODAY_PLAN } from '../data/mockData';
import type { PlanItem } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function greeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

function daysUntil(iso: string): number {
  const target = new Date(iso + 'T00:00:00').getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86400000));
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [plan, setPlan] = useState<PlanItem[]>(TODAY_PLAN);
  const examDays = useMemo(() => daysUntil(PROFILE.examDateISO), []);
  const doneCount = plan.filter((p) => p.done).length;

  const toggle = useCallback((id: string) => {
    setPlan((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  }, []);

  const openStoich = useCallback(() => {
    navigation.navigate('TopicDetail', { topicId: 'stoich' });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greet}>{greeting()},</Text>
            <Text style={styles.name}>{PROFILE.name} 👋</Text>
          </View>
          <View style={styles.streak}>
            <Ionicons name="flame" size={16} color={colors.gold} />
            <Text style={styles.streakText}>{PROFILE.streakDays} ngày</Text>
          </View>
        </View>

        {/* Resume card */}
        <Pressable onPress={openStoich} accessibilityRole="button" style={({ pressed }) => [styles.resume, pressed && { opacity: 0.95 }]}>
          <View style={styles.resumeTop}>
            <Pill label="Học tiếp" tone="gold" icon="play" />
            <Ionicons name="arrow-forward" size={18} color={colors.goldBright} />
          </View>
          <Text style={styles.resumeSubj}>Chemistry · IGCSE 0620</Text>
          <Text style={styles.resumeTitle}>Stoichiometry</Text>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar value={50} fillColor={colors.goldBright} trackColor="rgba(255,255,255,0.16)" />
            <Text style={styles.resumePct}>Hoàn thành 50%</Text>
          </View>
        </Pressable>

        {/* Today plan */}
        <SectionLabel>Kế hoạch hôm nay</SectionLabel>
        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.planHead}>
            <Text style={styles.planHeadText}>
              {doneCount}/{plan.length} hoàn thành
            </Text>
            <ProgressBar value={(doneCount / plan.length) * 100} style={{ flex: 1, marginLeft: 12 }} />
          </View>
          {plan.map((item) => (
            <Pressable
              key={item.id}
              style={styles.planItem}
              onPress={() => toggle(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.done }}
              accessibilityLabel={item.label}
            >
              <View style={[styles.check, item.done && styles.checkOn]}>
                {item.done ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planLabel, item.done && styles.planLabelDone]}>{item.label}</Text>
                <Text style={styles.planMeta}>{item.meta}</Text>
              </View>
            </Pressable>
          ))}
        </Card>

        {/* Exam countdown */}
        <View style={styles.exam}>
          <View>
            <Text style={styles.examLabel}>Kỳ thi IGCSE sắp tới</Text>
            <Text style={styles.examDate}>01 / 10 / 2026</Text>
          </View>
          <View style={styles.examDays}>
            <Text style={styles.examNum}>{examDays}</Text>
            <Text style={styles.examUnit}>ngày</Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.stats}>
          <StatCard icon="book" value="4" label="Môn học" />
          <StatCard icon="time" value="3.5h" label="Tuần này" />
          <StatCard icon="trophy" value="67%" label="Sẵn sàng" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={18} color={colors.gold} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  greet: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.slate },
  name: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.ink, letterSpacing: -0.3 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  streakText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },

  resume: {
    backgroundColor: colors.navy800,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  resumeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  resumeSubj: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' },
  resumeTitle: { fontFamily: fonts.serifSemi, fontSize: 24, color: colors.white, marginTop: 2 },
  resumePct: { fontFamily: fonts.sansMedium, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 7 },

  planHead: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  planHeadText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.ink },
  planItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.paper2 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkOn: { backgroundColor: colors.green, borderColor: colors.green },
  planLabel: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  planLabelDone: { textDecorationLine: 'line-through', color: colors.slate2 },
  planMeta: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.slate2, marginTop: 2 },

  exam: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(179,139,77,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(179,139,77,0.3)',
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  examLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.goldDeep },
  examDate: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink, marginTop: 2 },
  examDays: { alignItems: 'center' },
  examNum: { fontFamily: fonts.serifBold, fontSize: 30, color: colors.goldDeep, lineHeight: 32 },
  examUnit: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.goldDeep },

  stats: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink },
  statLabel: { fontFamily: fonts.sansMedium, fontSize: 11.5, color: colors.slate2 },
});
