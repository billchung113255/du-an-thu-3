import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, curriculumColor, displayText, radius, space } from '../theme/tokens';
import { Icon } from '../components/Icon';
import { Avatar, Card, EmptyView, ErrorView, LoadingView, ProgressBar, Tag } from '../components/ui';
import { tutorApi } from '../data/mockData';
import type { Curriculum, Student } from '../types/models';
import type { TutorStackParamList as RootStackParamList } from '../navigation/TutorNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type CurFilter = 'all' | Curriculum;

const FILTERS: { key: CurFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'IGCSE', label: 'IGCSE' },
  { key: 'A Level', label: 'A Level' },
  { key: 'IB', label: 'IB' },
  { key: 'AP', label: 'AP' },
];

export default function StudentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CurFilter>('all');

  const load = useCallback(async () => {
    setError(null);
    setStudents(null);
    try {
      setStudents(await tutorApi.getStudents());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được danh sách học viên.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (students ?? []).filter((s) => filter === 'all' || s.curriculum === filter),
    [students, filter],
  );

  const openStudent = useCallback((id: string) => navigation.navigate('StudentProfile', { studentId: id }), [navigation]);

  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!students) return <LoadingView />;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.md }]}>
      <View style={styles.header}>
        <Text style={[displayText({ fontWeight: '500' }), styles.title]}>Học viên</Text>
        <Text style={styles.sub}>{students.length} học viên đang theo học · lọc theo chương trình.</Text>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(s) => s.id}
        numColumns={1}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 96 }}
        ListHeaderComponent={
          <View style={styles.filters}>
            {FILTERS.map((f) => {
              const active = f.key === filter;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={[styles.fchip, active && styles.fchipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.fchipText, active && styles.fchipTextActive]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </View>
        }
        ListEmptyComponent={<EmptyView message="Chưa có học viên cho chương trình này." />}
        renderItem={({ item }) => <StudentCard student={item} onPress={openStudent} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const StudentCard = React.memo(function StudentCard({ student, onPress }: { student: Student; onPress: (id: string) => void }) {
  const c = curriculumColor[student.curriculum];
  return (
    <Pressable onPress={() => onPress(student.id)} accessibilityRole="button" accessibilityLabel={`Mở hồ sơ ${student.name}`}>
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <Avatar initials={student.initials} bg={c.fg} size={46} />
          <View style={styles.flex}>
            <View style={styles.topRow}>
              <View style={styles.flex}>
                <Text style={styles.name}>{student.name}</Text>
                <Text style={styles.meta}>
                  {student.subject} · {student.year} · {student.board}
                </Text>
              </View>
              <Tag curriculum={student.curriculum} />
            </View>

            <View style={styles.progWrap}>
              <View style={styles.progLabel}>
                <Text style={styles.progText}>Tiến độ giáo trình</Text>
                <Text style={styles.progText}>{student.progress}%</Text>
              </View>
              <ProgressBar pct={student.progress} height={6} />
            </View>

            <View style={styles.footer}>
              <Icon name="clock" size={13} color={colors.gold} />
              <Text style={styles.footerText}>
                Buổi tới: {student.nextSessionLabel ?? '—'} · {student.sessionsCompleted} buổi đã học
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.beige },
  header: { paddingHorizontal: space.lg },
  title: { fontSize: 25, color: colors.ink },
  sub: { marginTop: 5, fontSize: 13.5, color: colors.slate },

  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: space.md },
  fchip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  fchipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  fchipText: { fontSize: 13, fontWeight: '600', color: colors.slate },
  fchipTextActive: { color: '#FBF7EE' },

  card: { padding: space.lg },
  cardRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  flex: { flex: 1 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontWeight: '600', fontSize: 15, color: colors.ink },
  meta: { fontSize: 12.5, color: colors.slate, marginTop: 2 },

  progWrap: { marginTop: 11 },
  progLabel: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progText: { fontSize: 11, color: colors.slate },

  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 11 },
  footerText: { fontSize: 12, color: colors.slate, flex: 1 },
});
