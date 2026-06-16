import React, { useMemo } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import { ProgressBar, SectionLabel } from '../components/ui';
import { SUBJECTS, WEAK_AREAS, WEEK_MINUTES } from '../data/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const READINESS = 67;
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function Ring({ value, size = 132, stroke = 12 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.paper3} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.gold}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPct}>{value}%</Text>
        <Text style={styles.ringLabel}>sẵn sàng</Text>
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const navigation = useNavigation<Nav>();
  const maxMin = useMemo(() => Math.max(...WEEK_MINUTES, 1), []);
  const totalMin = useMemo(() => WEEK_MINUTES.reduce((a, b) => a + b, 0), []);
  const tracked = useMemo(() => SUBJECTS.filter((s) => s.curriculum === 'IGCSE'), []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Tiến độ</Text>

        {/* Readiness */}
        <View style={styles.readyCard}>
          <Ring value={READINESS} />
          <View style={{ flex: 1, marginLeft: spacing.xl }}>
            <Text style={styles.readyTitle}>Mức sẵn sàng thi</Text>
            <Text style={styles.readySub}>Dựa trên độ thành thạo các chuyên đề IGCSE của em.</Text>
            <View style={styles.readyTag}>
              <Ionicons name="trending-up" size={15} color={colors.green} />
              <Text style={styles.readyTagText}>+8% so với tuần trước</Text>
            </View>
          </View>
        </View>

        {/* Weekly study */}
        <SectionLabel>Thời lượng học 7 ngày</SectionLabel>
        <View style={styles.chartCard}>
          <View style={styles.chartHead}>
            <Text style={styles.chartTotal}>{(totalMin / 60).toFixed(1)} giờ</Text>
            <Text style={styles.chartMeta}>tuần này</Text>
          </View>
          <View style={styles.chart}>
            {WEEK_MINUTES.map((m, i) => (
              <View key={i} style={styles.chartCol}>
                <View style={styles.chartBarTrack}>
                  <View style={[styles.chartBar, { height: `${(m / maxMin) * 100}%` }]} />
                </View>
                <Text style={styles.chartDay}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Subject mastery */}
        <SectionLabel>Thành thạo theo môn</SectionLabel>
        <View style={styles.card}>
          {tracked.map((s, i) => (
            <View key={s.code} style={[styles.masteryRow, i === 0 && { borderTopWidth: 0, paddingTop: 0 }]}>
              <View style={styles.masteryTop}>
                <Text style={styles.masteryName}>{s.name}</Text>
                <Text style={styles.masteryPct}>{s.mastery}%</Text>
              </View>
              <ProgressBar value={s.mastery} fillColor={s.mastery >= 70 ? colors.green : s.mastery >= 55 ? colors.gold : colors.amber} />
            </View>
          ))}
        </View>

        {/* Weak areas */}
        <SectionLabel>Cần cải thiện</SectionLabel>
        <View style={{ gap: spacing.md }}>
          {WEAK_AREAS.map((w) => (
            <Pressable
              key={w.topicId}
              style={styles.weak}
              onPress={() => navigation.navigate('TopicDetail', { topicId: w.topicId })}
              accessibilityRole="button"
              accessibilityLabel={`Luyện ${w.topicName}`}
            >
              <View style={styles.weakIcon}>
                <Ionicons name="alert-circle" size={20} color={colors.amber} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.weakTopic}>{w.topicName}</Text>
                <Text style={styles.weakSubject}>
                  {w.subjectName} · {w.mastery}% thành thạo
                </Text>
              </View>
              <View style={styles.weakCta}>
                <Text style={styles.weakCtaText}>Luyện ngay</Text>
                <Ionicons name="chevron-forward" size={15} color={colors.goldDeep} />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.ink, marginBottom: spacing.lg },

  readyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.xl },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontFamily: fonts.serifBold, fontSize: 28, color: colors.ink },
  ringLabel: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.slate2, marginTop: -2 },
  readyTitle: { fontFamily: fonts.serifSemi, fontSize: 18, color: colors.ink },
  readySub: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.slate, marginTop: 4, lineHeight: 19 },
  readyTag: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  readyTagText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.green },

  chartCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.xl },
  chartHead: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: spacing.lg },
  chartTotal: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.ink },
  chartMeta: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.slate2 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', height: 120, alignItems: 'flex-end' },
  chartCol: { flex: 1, alignItems: 'center', gap: 7 },
  chartBarTrack: { width: 22, height: 96, backgroundColor: colors.paper2, borderRadius: radius.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  chartBar: { width: '100%', backgroundColor: colors.gold, borderRadius: radius.sm },
  chartDay: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.slate2 },

  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.xl },
  masteryRow: { borderTopWidth: 1, borderTopColor: colors.paper2, paddingTop: spacing.md, marginTop: spacing.md },
  masteryTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  masteryName: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  masteryPct: { fontFamily: fonts.serifSemi, fontSize: 14, color: colors.slate },

  weak: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.lg },
  weakIcon: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: 'rgba(194,135,43,0.1)', alignItems: 'center', justifyContent: 'center' },
  weakTopic: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  weakSubject: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.slate2, marginTop: 2 },
  weakCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  weakCtaText: { fontFamily: fonts.sansSemi, fontSize: 12.5, color: colors.goldDeep },
});
