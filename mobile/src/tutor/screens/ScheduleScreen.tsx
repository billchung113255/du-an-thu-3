import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, displayText, radius, space } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { EmptyView, ErrorView, LoadingView, Tag } from '../components/ui';
import { tutorApi } from '../data/mockData';
import type { Lesson } from '../types/models';
import type { TutorStackParamList as RootStackParamList } from '../navigation/TutorNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Filter = 'all' | 'online' | 'home' | 'pending';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'online', label: 'Online' },
  { key: 'home', label: 'Tại nhà' },
  { key: 'pending', label: 'Chưa hoàn thành' },
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setError(null);
    setLessons(null);
    try {
      setLessons(await tutorApi.getLessons());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được lịch dạy.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleDone = useCallback((id: string) => {
    setDoneIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const sections = useMemo(() => {
    if (!lessons) return [];
    const filtered = lessons.filter((l) => {
      if (filter === 'online') return l.mode === 'Online';
      if (filter === 'home') return l.mode === 'Tại nhà';
      if (filter === 'pending') return !doneIds.has(l.id);
      return true;
    });
    const map = new Map<string, Lesson[]>();
    for (const l of filtered) {
      const arr = map.get(l.dayLabel) ?? [];
      arr.push(l);
      map.set(l.dayLabel, arr);
    }
    return Array.from(map, ([title, data]) => ({ title, data }));
  }, [lessons, filter, doneIds]);

  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!lessons) return <LoadingView />;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.md }]}>
      <View style={styles.header}>
        <Text style={[displayText({ fontWeight: '500' }), styles.title]}>Lịch dạy</Text>
        <Text style={styles.sub}>Tuần này · {lessons.length} buổi · 6,5 giờ giảng dạy.</Text>
      </View>

      <View style={styles.filterRow}>
        <SectionFilters filter={filter} onChange={setFilter} />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 96 }}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={<EmptyView message="Không có buổi học phù hợp bộ lọc." />}
        renderSectionHeader={({ section }) => <Text style={styles.dayLabel}>{section.title}</Text>}
        renderItem={({ item, index, section }) => (
          <View style={[styles.card, index === 0 && styles.cardTop, index === section.data.length - 1 && styles.cardBottom]}>
            <LessonRow
              lesson={item}
              done={doneIds.has(item.id)}
              last={index === section.data.length - 1}
              onToggle={toggleDone}
              onPress={() => navigation.navigate('StudentProfile', { studentId: item.studentId })}
            />
          </View>
        )}
      />
    </View>
  );
}

const SectionFilters = React.memo(function SectionFilters({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
  return (
    <View style={styles.filters}>
      {FILTERS.map((f) => {
        const active = f.key === filter;
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[styles.fchip, active && styles.fchipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.fchipText, active && styles.fchipTextActive]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

interface LessonRowProps {
  lesson: Lesson;
  done: boolean;
  last: boolean;
  onToggle: (id: string) => void;
  onPress: () => void;
}
const LessonRow = React.memo(function LessonRow({ lesson, done, last, onToggle, onPress }: LessonRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.lesson, !last && styles.lessonBorder, done && { opacity: 0.6 }]} accessibilityRole="button">
      <View style={styles.lessonTime}>
        <Text style={[displayText({ fontWeight: '600' }), styles.lessonH]}>{lesson.timeLabel}</Text>
        <Text style={styles.lessonM}>{lesson.durationMins}′</Text>
      </View>
      <View style={styles.lessonBar} />
      <View style={styles.flex}>
        <View style={styles.lessonStuRow}>
          <Text style={[styles.lessonStu, done && styles.strike]}>{lesson.studentName}</Text>
          <Tag curriculum={lesson.curriculum} />
        </View>
        <View style={styles.lessonMeta}>
          <Text style={styles.lessonMetaText}>{lesson.subject}</Text>
          <Text style={styles.lessonMetaText}>· {lesson.mode}</Text>
        </View>
      </View>
      <Pressable
        onPress={() => onToggle(lesson.id)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={done ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}
        style={[styles.checkBtn, done && styles.checkBtnOn]}
      >
        <Icon name="check" size={18} color={done ? '#FFFFFF' : colors.slate2} />
      </Pressable>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.beige },
  header: { paddingHorizontal: space.lg },
  title: { fontSize: 25, color: colors.ink },
  sub: { marginTop: 5, fontSize: 13.5, color: colors.slate },

  filterRow: { paddingVertical: space.md },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: space.lg },
  fchip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  fchipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  fchipText: { fontSize: 13, fontWeight: '600', color: colors.slate },
  fchipTextActive: { color: '#FBF7EE' },

  dayLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.4, color: colors.slate, textTransform: 'uppercase', marginTop: space.lg, marginBottom: 9, marginLeft: 4 },

  card: { backgroundColor: colors.card, borderColor: colors.line, borderLeftWidth: 1, borderRightWidth: 1 },
  cardTop: { borderTopWidth: 1, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
  cardBottom: { borderBottomWidth: 1, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },

  lesson: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: space.lg },
  lessonBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  lessonTime: { width: 52, alignItems: 'center' },
  lessonH: { fontSize: 16, color: colors.ink },
  lessonM: { fontSize: 11, color: colors.slate2 },
  lessonBar: { width: 3, alignSelf: 'stretch', borderRadius: 3, backgroundColor: colors.gold },
  lessonStuRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  lessonStu: { fontWeight: '600', fontSize: 14.5, color: colors.ink },
  strike: { textDecorationLine: 'line-through', color: colors.slate2 },
  lessonMeta: { flexDirection: 'row', gap: 5, marginTop: 3, flexWrap: 'wrap' },
  lessonMetaText: { fontSize: 12.5, color: colors.slate },
  checkBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  checkBtnOn: { backgroundColor: colors.ok, borderColor: colors.ok },
  flex: { flex: 1 },
});
