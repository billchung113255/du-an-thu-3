import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, radius, spacing } from '../theme/tokens';
import { ProgressBar } from '../components/ui';
import { CURRICULA, SUBJECTS } from '../data/mockData';
import type { Curriculum, Subject } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SubjectsScreen() {
  const navigation = useNavigation<Nav>();
  const [curriculum, setCurriculum] = useState<Curriculum>('IGCSE');
  const [expanded, setExpanded] = useState<string | null>('0620'); // Chemistry open by default

  const subjects = useMemo(() => SUBJECTS.filter((s) => s.curriculum === curriculum), [curriculum]);

  const openTopic = useCallback(
    (topicId: string) => navigation.navigate('TopicDetail', { topicId }),
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Subject }) => {
      const open = expanded === item.code;
      return (
        <View style={styles.subjCard}>
          <Pressable
            style={styles.subjHead}
            onPress={() => setExpanded((c) => (c === item.code ? null : item.code))}
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
          >
            <View style={styles.subjBadge}>
              <Text style={styles.subjBadgeText}>{item.code}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.subjName}>{item.name}</Text>
              <Text style={styles.subjMeta}>{item.topics.length} chuyên đề</Text>
            </View>
            <View style={styles.subjRight}>
              <Text style={styles.subjPct}>{item.mastery}%</Text>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.slate2} />
            </View>
          </Pressable>
          <ProgressBar value={item.mastery} style={{ marginTop: 4 }} />

          {open ? (
            <View style={styles.topics}>
              {item.topics.map((t) => (
                <Pressable
                  key={t.id}
                  style={styles.topicRow}
                  onPress={() => openTopic(t.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Mở chuyên đề ${t.name}`}
                >
                  <Text style={styles.topicName}>{t.name}</Text>
                  <View style={styles.topicRight}>
                    <View style={styles.miniBar}>
                      <View style={[styles.miniFill, { width: `${t.mastery}%` }]} />
                    </View>
                    <Text style={styles.topicPct}>{t.mastery}%</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.slate2} />
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      );
    },
    [expanded, openTopic],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <Text style={styles.title}>Môn học</Text>
        <FlatList
          horizontal
          data={CURRICULA}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.segments}
          renderItem={({ item }) => {
            const active = item === curriculum;
            return (
              <Pressable
                onPress={() => setCurriculum(item)}
                style={[styles.segment, active && styles.segmentActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(s) => s.code + s.name}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có môn nào cho chương trình này.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  headerWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  title: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.ink, marginBottom: spacing.md },
  segments: { gap: 8, paddingVertical: 4 },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  segmentActive: { backgroundColor: colors.navy800, borderColor: colors.navy800 },
  segmentText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.slate },
  segmentTextActive: { color: colors.white },

  list: { padding: spacing.xl, paddingTop: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  empty: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.slate, textAlign: 'center', marginTop: spacing.xxl },

  subjCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.lg },
  subjHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjBadge: { backgroundColor: colors.paper2, borderRadius: radius.sm, paddingHorizontal: 9, paddingVertical: 5 },
  subjBadgeText: { fontFamily: fonts.sansBold, fontSize: 12, color: colors.navy700 },
  subjName: { fontFamily: fonts.sansSemi, fontSize: 15.5, color: colors.ink },
  subjMeta: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.slate2, marginTop: 1 },
  subjRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subjPct: { fontFamily: fonts.serifSemi, fontSize: 14, color: colors.goldDeep },

  topics: { marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.paper2, paddingTop: 4 },
  topicRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11 },
  topicName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink, flex: 1, paddingRight: 10 },
  topicRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  miniBar: { width: 54, height: 6, borderRadius: radius.pill, backgroundColor: colors.paper3, overflow: 'hidden' },
  miniFill: { height: '100%', backgroundColor: colors.gold, borderRadius: radius.pill },
  topicPct: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.slate, width: 34, textAlign: 'right' },
});
