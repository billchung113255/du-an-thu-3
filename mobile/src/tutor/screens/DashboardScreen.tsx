import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, curriculumColor, displayText, radius, shadow, space } from '../theme/tokens';
import { Icon, IconName, SealBackdrop } from '../components/Icon';
import { AppButton, Card, ErrorView, LoadingView, SectionTitle, StatCard, Tag } from '../components/ui';
import { formatVNDShort, tutorApi } from '../data/mockData';
import type { DashboardData, Lesson } from '../types/models';
import type { TutorStackParamList as RootStackParamList } from '../navigation/TutorNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const QUICK_ACTIONS: { key: string; label: string; icon: IconName }[] = [
  { key: 'log', label: 'Ghi nhận buổi', icon: 'edit' },
  { key: 'schedule', label: 'Đặt lịch', icon: 'calendar' },
  { key: 'resources', label: 'Tài liệu', icon: 'book' },
  { key: 'grade', label: 'Chấm bài', icon: 'checkCircle' },
  { key: 'message', label: 'Nhắn tin', icon: 'message' },
  { key: 'earnings', label: 'Thu nhập', icon: 'dollar' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    try {
      setData(await tutorApi.getDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
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

  const onQuickAction = useCallback(
    (key: string) => {
      switch (key) {
        case 'schedule':
          navigation.navigate('Main', { screen: 'Schedule' } as never);
          break;
        case 'resources':
          navigation.navigate('Main', { screen: 'Resources' } as never);
          break;
        case 'earnings':
          navigation.navigate('Main', { screen: 'Earnings' } as never);
          break;
        default:
          // TODO(feature): wire log/grade/message flows.
          break;
      }
    },
    [navigation],
  );

  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!data) return <LoadingView />;

  const { greeting, stats, nextLesson, todayLessons, todos } = data;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + 96 }]}
    >
      <Text style={[displayText({ fontWeight: '500' }), styles.greet]}>{greeting}</Text>
      <Text style={styles.sub}>Hôm nay bạn có {todayLessons.length} buổi dạy và 1 bài tập cần chấm.</Text>

      {/* Stats */}
      <View style={styles.statGrid}>
        <StatCard value={String(stats.students)} label="Học viên đang dạy" icon="users" />
        <StatCard value={String(stats.hoursThisMonth)} label="Giờ dạy tháng này" icon="clock" trend="12% so với tháng trước" />
        <StatCard value={String(stats.lessonsThisWeek)} label="Buổi trong tuần" icon="calendar" />
        <StatCard value={formatVNDShort(stats.earningsThisMonth)} label="Thu nhập tháng này" icon="dollar" />
      </View>

      {/* Next lesson hero */}
      <View style={[styles.hero, shadow.hero]}>
        <SealBackdrop size={200} style={styles.heroSeal} />
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowLine} />
          <Text style={styles.eyebrow}>BUỔI HỌC TIẾP THEO</Text>
        </View>
        <View style={styles.heroRow}>
          <View style={styles.flex}>
            <Text style={[displayText({ fontWeight: '500' }), styles.heroName]}>{nextLesson.studentName}</Text>
            <View style={styles.heroMeta}>
              <Tag curriculum={nextLesson.curriculum} />
              <View style={styles.metaItem}>
                <Icon name="book" size={14} color={colors.goldSoft} />
                <Text style={styles.metaText}>{nextLesson.subject}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name={nextLesson.mode === 'Online' ? 'video' : 'mapPin'} size={14} color={colors.goldSoft} />
                <Text style={styles.metaText}>{nextLesson.mode}</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroTime}>
            <Text style={[displayText({ fontWeight: '600' }), styles.heroTimeT]}>{nextLesson.timeLabel}</Text>
            <Text style={styles.heroTimeD}>Hôm nay</Text>
          </View>
        </View>
        <View style={styles.heroActions}>
          <AppButton label="Vào lớp" onPress={() => {}} variant="gold" icon="video" style={styles.flex} />
          <AppButton
            label="Xem hồ sơ"
            onPress={() => navigation.navigate('StudentProfile', { studentId: nextLesson.studentId })}
            variant="light"
            style={styles.flex}
          />
        </View>
      </View>

      {/* Today's lessons */}
      <SectionTitle title="Lịch hôm nay" actionLabel="Cả tuần →" onAction={() => navigation.navigate('Main', { screen: 'Schedule' } as never)} />
      <Card>
        {todayLessons.map((l, i) => (
          <LessonRow
            key={l.id}
            lesson={l}
            done={doneIds.has(l.id)}
            onToggle={toggleDone}
            onPress={() => navigation.navigate('StudentProfile', { studentId: l.studentId })}
            last={i === todayLessons.length - 1}
          />
        ))}
      </Card>

      {/* Quick actions */}
      <SectionTitle title="Thao tác nhanh" />
      <View style={styles.qaGrid}>
        {QUICK_ACTIONS.map((qa) => (
          <Pressable
            key={qa.key}
            style={({ pressed }) => [styles.qa, pressed && styles.qaPressed]}
            onPress={() => onQuickAction(qa.key)}
            accessibilityRole="button"
            accessibilityLabel={qa.label}
          >
            <View style={styles.qaIc}>
              <Icon name={qa.icon} size={20} color={colors.navy700} />
            </View>
            <Text style={styles.qaText}>{qa.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* To-dos */}
      <SectionTitle title="Cần xử lý" />
      <Card>
        {todos.map((t, i) => (
          <View key={t.id} style={[styles.todo, i < todos.length - 1 && styles.todoBorder]}>
            <View style={[styles.todoBar, { backgroundColor: t.tone === 'warn' ? colors.warn : curriculumColor.IB.fg }]} />
            <View style={styles.flex}>
              <Text style={styles.todoTitle}>{t.title}</Text>
              <View style={styles.todoMeta}>
                <Tag curriculum={t.curriculum} />
                <Text style={styles.todoMetaText}>{t.meta}</Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

interface LessonRowProps {
  lesson: Lesson;
  done: boolean;
  last: boolean;
  onToggle: (id: string) => void;
  onPress: () => void;
}
const LessonRow = React.memo(function LessonRow({ lesson, done, last, onToggle, onPress }: LessonRowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.lesson, !last && styles.lessonBorder, done && styles.lessonDone]} accessibilityRole="button">
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
  flex: { flex: 1 },
  content: { paddingHorizontal: space.lg, backgroundColor: colors.beige },

  greet: { fontSize: 25, color: colors.ink },
  sub: { marginTop: 5, fontSize: 13.5, color: colors.slate },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: space.lg },

  hero: { marginTop: space.lg, borderRadius: radius.xl, padding: space.xl, backgroundColor: colors.navy, overflow: 'hidden' },
  heroSeal: { position: 'absolute', right: -50, top: -40 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  eyebrowLine: { width: 18, height: 1, backgroundColor: colors.gold },
  eyebrow: { fontSize: 10.5, letterSpacing: 1.8, color: colors.gold, fontWeight: '700' },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroName: { fontSize: 21, color: '#FBF7EE' },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#BCC4D2' },
  heroTime: { alignItems: 'flex-end' },
  heroTimeT: { fontSize: 26, color: colors.goldSoft },
  heroTimeD: { fontSize: 12, color: '#9AA3B2' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: space.lg },

  qaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  qa: { flexBasis: '31%', flexGrow: 1, alignItems: 'center', gap: 8, paddingVertical: 15, paddingHorizontal: 6, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, ...shadow.card },
  qaPressed: { backgroundColor: '#FFFDF8', borderColor: colors.gold },
  qaIc: { width: 40, height: 40, borderRadius: 11, backgroundColor: colors.parchment, alignItems: 'center', justifyContent: 'center' },
  qaText: { fontSize: 12, fontWeight: '600', color: colors.ink, textAlign: 'center' },

  lesson: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: space.lg },
  lessonBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  lessonDone: { opacity: 0.6 },
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

  todo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: space.lg },
  todoBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  todoBar: { width: 3, height: 38, borderRadius: 3 },
  todoTitle: { fontWeight: '600', fontSize: 14, color: colors.ink },
  todoMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  todoMetaText: { fontSize: 12.5, color: colors.slate },
});
