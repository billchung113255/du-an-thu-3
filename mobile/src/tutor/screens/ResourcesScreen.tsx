import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, curriculumColor, displayText, radius, space } from '../theme/tokens';
import { Icon, IconName } from '../components/Icon';
import { Card, EmptyView, ErrorView, LoadingView, Pill, Tag } from '../components/ui';
import { tutorApi } from '../data/mockData';
import type { Curriculum, ResourceItem, ResourceType } from '../types/models';

type CurFilter = 'all' | Curriculum;

const FILTERS: { key: CurFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'IGCSE', label: 'IGCSE' },
  { key: 'A Level', label: 'A Level' },
  { key: 'IB', label: 'IB' },
  { key: 'AP', label: 'AP' },
];

const TYPE_ICON: Record<ResourceType, IconName> = {
  'Đề thi': 'fileText',
  'Mark scheme': 'checkCircle',
  'Revision notes': 'book',
  Worksheet: 'edit',
  'Bài luyện': 'edit',
  'Câu hỏi chủ đề': 'fileText',
};

export default function ResourcesScreen() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ResourceItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CurFilter>('all');

  const load = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      setItems(await tutorApi.getResources());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được kho tài liệu.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (items ?? []).filter((r) => filter === 'all' || r.curriculum === filter),
    [items, filter],
  );

  const onDownload = useCallback((r: ResourceItem) => {
    // TODO(api): trigger signed-URL download / open viewer.
    Alert.alert('Tài liệu', `Đang mở: ${r.title}`);
  }, []);

  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!items) return <LoadingView />;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + space.md }]}>
      <View style={styles.header}>
        <Text style={[displayText({ fontWeight: '500' }), styles.title]}>Tài liệu</Text>
        <Text style={styles.sub}>Đề thi, mark scheme & ghi chú ôn tập theo từng chương trình.</Text>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(r) => r.id}
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
        ListEmptyComponent={<EmptyView message="Chưa có tài liệu cho chương trình này." />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <ResourceRow item={item} onDownload={onDownload} />}
      />
    </View>
  );
}

const ResourceRow = React.memo(function ResourceRow({ item, onDownload }: { item: ResourceItem; onDownload: (r: ResourceItem) => void }) {
  const c = curriculumColor[item.curriculum];
  return (
    <Card style={styles.row}>
      <View style={[styles.icon, { backgroundColor: c.bg }]}>
        <Icon name={TYPE_ICON[item.type]} size={20} color={c.fg} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.rowMeta}>
          <Tag curriculum={item.curriculum} />
          <Pill label={item.type} />
        </View>
        <Text style={styles.rowSub}>{item.meta}</Text>
      </View>
      <Pressable
        onPress={() => onDownload(item)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Tải ${item.title}`}
        style={({ pressed }) => [styles.dl, pressed && styles.dlPressed]}
      >
        <Icon name="download" size={18} color={colors.navy700} />
      </Pressable>
    </Card>
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

  row: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: space.md },
  icon: { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  rowTitle: { fontWeight: '600', fontSize: 14, color: colors.ink, lineHeight: 19 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7, flexWrap: 'wrap' },
  rowSub: { fontSize: 11.5, color: colors.slate2, marginTop: 6 },
  dl: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  dlPressed: { backgroundColor: colors.parchment, borderColor: colors.gold },
});
