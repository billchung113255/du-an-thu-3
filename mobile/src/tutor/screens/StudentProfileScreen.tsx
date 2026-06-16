import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Line as SvgLine } from 'react-native-svg';

import { colors, curriculumColor, displayText, radius, shadow, space } from '../theme/tokens';
import { Icon, SealBackdrop } from '../components/Icon';
import { AppButton, Avatar, Card, EmptyView, ErrorView, LoadingView, Pill, ProgressBar, Tag } from '../components/ui';
import { tutorApi } from '../data/mockData';
import type { LessonMode, SessionRecord, StudentDetail, TutorNote } from '../types/models';
import type { TutorStackParamList as RootStackParamList } from '../navigation/TutorNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'StudentProfile'>;

type TabKey = 'overview' | 'sessions' | 'grades' | 'materials' | 'notes';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Tổng quan' },
  { key: 'sessions', label: 'Buổi học' },
  { key: 'grades', label: 'Điểm số' },
  { key: 'materials', label: 'Tài liệu' },
  { key: 'notes', label: 'Ghi chú' },
];

const GRADE_PCT: Record<string, number> = { 'A*': 90, A: 80, B: 70, C: 60, D: 50, E: 40 };
const PLOT = 132;
const DURATIONS = [60, 90, 120];
const MODES: LessonMode[] = ['Online', 'Tại nhà'];

export default function StudentProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const studentId = route.params?.studentId; // untrusted nav param

  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('overview');

  // Local working copies so logging a session / adding a note feels live.
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [notes, setNotes] = useState<TutorNote[]>([]);
  const [sessionCount, setSessionCount] = useState(0);
  const [noteInput, setNoteInput] = useState('');

  // Log-session sheet state.
  const [sheetOpen, setSheetOpen] = useState(false);
  const [seTopic, setSeTopic] = useState('');
  const [seDuration, setSeDuration] = useState(90);
  const [seMode, setSeMode] = useState<LessonMode>('Online');
  const [seNote, setSeNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setDetail(null);
    if (!studentId) {
      setError('Thiếu thông tin học viên.');
      return;
    }
    try {
      const d = await tutorApi.getStudentDetail(studentId);
      setDetail(d);
      setSessions(d.sessions);
      setNotes(d.notes);
      setSessionCount(d.student.sessionsCompleted);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được hồ sơ học viên.');
    }
  }, [studentId]);

  useEffect(() => {
    load();
  }, [load]);

  const addNote = useCallback(() => {
    const text = noteInput.trim();
    if (!text) return;
    setNotes((prev) => [{ id: `note-${Date.now()}`, dateLabel: 'Hôm nay', text }, ...prev]);
    setNoteInput('');
  }, [noteInput]);

  const resetSheet = useCallback(() => {
    setSeTopic('');
    setSeDuration(90);
    setSeMode('Online');
    setSeNote('');
  }, []);

  const saveSession = useCallback(async () => {
    if (!studentId) return;
    try {
      setSaving(true);
      const record = await tutorApi.logSession(studentId, {
        topic: seTopic.trim() || 'Buổi học',
        durationMins: seDuration,
        mode: seMode,
        note: seNote.trim() || undefined,
      });
      setSessions((prev) => [record, ...prev]);
      setSessionCount((c) => c + 1);
      setSheetOpen(false);
      resetSheet();
      setTab('sessions');
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Không lưu được buổi học.');
    } finally {
      setSaving(false);
    }
  }, [studentId, seTopic, seDuration, seMode, seNote, resetSheet]);

  if (error) {
    return (
      <View style={styles.screen}>
        <Header insetTop={insets.top} onBack={() => navigation.goBack()} />
        <ErrorView message={error} onRetry={load} />
      </View>
    );
  }
  if (!detail) {
    return (
      <View style={styles.screen}>
        <Header insetTop={insets.top} onBack={() => navigation.goBack()} />
        <LoadingView />
      </View>
    );
  }

  const { student } = detail;
  const cc = curriculumColor[student.curriculum];

  return (
    <View style={styles.screen}>
      <Header insetTop={insets.top} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: insets.bottom + 110 }}>
        {/* Identity hero */}
        <View style={[styles.hero, shadow.hero]}>
          <SealBackdrop size={200} style={styles.heroSeal} />
          <View style={styles.heroTop}>
            <Avatar initials={student.initials} bg={cc.fg} size={60} />
            <View style={styles.flex}>
              <Text style={[displayText({ fontWeight: '500' }), styles.heroName]}>{student.name}</Text>
              <View style={styles.heroMeta}>
                <Tag curriculum={student.curriculum} />
                <Text style={styles.heroMetaText}>
                  {student.subject} · {student.year}
                </Text>
                <Text style={styles.heroMetaText}>{student.board}</Text>
              </View>
            </View>
          </View>
          <View style={styles.heroActions}>
            <AppButton label="Vào lớp" onPress={() => {}} variant="gold" icon="video" style={styles.flex} />
            <AppButton label="Nhắn tin" onPress={() => {}} variant="light" icon="message" style={styles.flex} />
          </View>
        </View>

        {/* Stat strip */}
        <View style={styles.strip}>
          <Mini value={String(sessionCount)} label="Buổi đã học" />
          <Mini value={`${student.progress}%`} label="Tiến độ" />
          <Mini value={`${student.avgScore}%`} label="Điểm TB" />
          <Mini value={`${student.attendance}%`} label="Chuyên cần" />
        </View>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                style={styles.tabBtn}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t.label}</Text>
                {active && <View style={styles.tabUnderline} />}
              </Pressable>
            );
          })}
        </ScrollView>

        {tab === 'overview' && <OverviewTab detail={detail} />}
        {tab === 'sessions' && <SessionsTab sessions={sessions} />}
        {tab === 'grades' && <GradesTab detail={detail} />}
        {tab === 'materials' && <MaterialsTab detail={detail} />}
        {tab === 'notes' && (
          <NotesTab notes={notes} value={noteInput} onChange={setNoteInput} onAdd={addNote} />
        )}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <AppButton label="Nhắn tin" onPress={() => {}} variant="ghost" icon="message" style={styles.flex} />
        <AppButton label="Ghi nhận buổi học" onPress={() => setSheetOpen(true)} variant="gold" icon="edit" style={styles.flex2} />
      </View>

      {/* Log-session sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => !saving && setSheetOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Đóng"
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + space.xl }, shadow.sheet]}>
          <View style={styles.grab} />
          <Text style={[displayText({ fontWeight: '500' }), styles.sheetTitle]}>Ghi nhận buổi học</Text>
          <Text style={styles.sheetSub}>
            {student.name} · {student.curriculum} {student.subject} · Hôm nay
          </Text>

          <Text style={styles.label}>Chủ đề buổi học</Text>
          <TextInput
            style={styles.input}
            value={seTopic}
            onChangeText={setSeTopic}
            placeholder="vd: Điện từ · Cảm ứng điện từ"
            placeholderTextColor={colors.slate2}
            accessibilityLabel="Chủ đề buổi học"
          />

          <Text style={styles.label}>Thời lượng</Text>
          <Segmented
            options={DURATIONS.map((d) => ({ value: String(d), label: `${d} phút` }))}
            value={String(seDuration)}
            onChange={(v) => setSeDuration(Number(v))}
          />

          <Text style={styles.label}>Hình thức</Text>
          <Segmented
            options={MODES.map((m) => ({ value: m, label: m }))}
            value={seMode}
            onChange={(v) => setSeMode(v as LessonMode)}
          />

          <Text style={styles.label}>Nhận xét & bài tập về nhà</Text>
          <TextInput
            style={[styles.input, styles.inputArea]}
            value={seNote}
            onChangeText={setSeNote}
            placeholder="Điểm em nắm tốt, phần cần luyện thêm, bài tập giao về…"
            placeholderTextColor={colors.slate2}
            multiline
            accessibilityLabel="Nhận xét"
          />

          <View style={styles.sheetActions}>
            <AppButton label="Hủy" onPress={() => setSheetOpen(false)} variant="ghost" style={styles.flex} disabled={saving} />
            <AppButton label="Lưu buổi học" onPress={saveSession} variant="gold" style={styles.flex} loading={saving} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                      */
/* -------------------------------------------------------------------------- */
const Header = React.memo(function Header({ insetTop, onBack }: { insetTop: number; onBack: () => void }) {
  return (
    <View style={[styles.header, { paddingTop: insetTop + 8 }]}>
      <Pressable onPress={onBack} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Quay lại">
        <Icon name="chevronLeft" size={20} color={colors.slate} />
      </Pressable>
      <Text style={[displayText({ fontWeight: '500' }), styles.headerTitle]}>Hồ sơ học viên</Text>
      <Pressable
        onPress={() => Alert.alert('Tùy chọn', 'Sửa hồ sơ · Tạm dừng · Lưu trữ')}
        style={styles.iconBtn}
        accessibilityRole="button"
        accessibilityLabel="Tùy chọn"
      >
        <Icon name="dots" size={20} color={colors.slate} />
      </Pressable>
    </View>
  );
});

const Mini = React.memo(function Mini({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.mini}>
      <Text style={[displayText({ fontWeight: '600' }), styles.miniV]}>{value}</Text>
      <Text style={styles.miniK}>{label}</Text>
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*  Overview tab                                                               */
/* -------------------------------------------------------------------------- */
function OverviewTab({ detail }: { detail: StudentDetail }) {
  return (
    <View>
      <Card padded style={styles.block}>
        <Text style={[displayText({ fontWeight: '500' }), styles.blockTitle]}>Mục tiêu & kỳ thi</Text>
        <View style={styles.goalRow}>
          <View style={[styles.goal, styles.goalTarget]}>
            <Text style={styles.goalKTarget}>Mục tiêu</Text>
            <Text style={[displayText({ fontWeight: '600' }), styles.goalVTarget]}>{detail.target}</Text>
          </View>
          <View style={styles.goal}>
            <Text style={styles.goalK}>Dự đoán hiện tại</Text>
            <Text style={[displayText({ fontWeight: '600' }), styles.goalV]}>{detail.predicted}</Text>
          </View>
          <View style={styles.goal}>
            <Text style={styles.goalK}>Kỳ thi</Text>
            <Text style={[displayText({ fontWeight: '600' }), styles.goalVsm]}>{detail.examLabel}</Text>
          </View>
        </View>
      </Card>

      <Text style={[displayText({ fontWeight: '500' }), styles.secTitle]}>Tiến độ theo chủ đề</Text>
      <Card padded>
        {detail.topics.map((t, i) => (
          <View key={t.name} style={[styles.topic, i < detail.topics.length - 1 && styles.topicBorder]}>
            <Text style={styles.topicName} numberOfLines={1}>
              {t.name}
            </Text>
            <View style={styles.topicBar}>
              <ProgressBar pct={t.pct} height={7} />
            </View>
            <Text style={styles.topicPct}>{t.pct}%</Text>
          </View>
        ))}
      </Card>

      <Text style={[displayText({ fontWeight: '500' }), styles.secTitle]}>Buổi học tiếp theo</Text>
      <Card padded>
        <View style={styles.nextRow}>
          <View style={styles.nextIc}>
            <Icon name="calendar" size={20} color={colors.navy700} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.nextT}>{detail.nextSession.dateLabel}</Text>
            <Text style={styles.nextS}>{detail.nextSession.detail}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sessions tab                                                               */
/* -------------------------------------------------------------------------- */
function SessionsTab({ sessions }: { sessions: SessionRecord[] }) {
  if (sessions.length === 0) return <EmptyView message="Chưa có buổi học nào được ghi nhận." />;
  return (
    <View style={styles.timeline}>
      {sessions.map((s) => (
        <View key={s.id} style={styles.tlItem}>
          <View style={[styles.tlDot, s.pending && { backgroundColor: colors.warn }]} />
          <Card style={styles.tlCard}>
            <View style={styles.tlHead}>
              <Text style={styles.tlTopic}>{s.topic}</Text>
              <Text style={styles.tlDate}>{s.dateLabel}</Text>
            </View>
            <View style={styles.tlMeta}>
              <Text style={styles.tlMetaText}>{s.durationMins} phút</Text>
              <Text style={styles.tlMetaText}>· {s.mode}</Text>
            </View>
            {s.note ? (
              <Text style={styles.tlNote}>
                <Text style={styles.tlNoteLabel}>Ghi chú: </Text>
                {s.note}
              </Text>
            ) : null}
          </Card>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Grades tab                                                                 */
/* -------------------------------------------------------------------------- */
function GradesTab({ detail }: { detail: StudentDetail }) {
  const [plotW, setPlotW] = useState(0);
  const scored = useMemo(
    () => detail.assessments.filter((a) => typeof a.score === 'number').slice().reverse(),
    [detail.assessments],
  );
  const targetPct = GRADE_PCT[detail.target] ?? 85;
  const targetY = PLOT * (1 - targetPct / 100);

  return (
    <View>
      {scored.length > 0 && (
        <Card padded style={styles.block}>
          <Text style={[displayText({ fontWeight: '500' }), styles.blockTitle]}>Điểm các bài gần đây</Text>
          <View style={styles.plot} onLayout={(e) => setPlotW(e.nativeEvent.layout.width)}>
            <View style={styles.bars}>
              {scored.map((a, i) => {
                const score = a.score ?? 0;
                const isBest = score === Math.max(...scored.map((x) => x.score ?? 0));
                return (
                  <View key={a.id} style={styles.barCol}>
                    <View style={[styles.bar, { height: Math.max(6, (score / 100) * PLOT), backgroundColor: isBest ? colors.gold : colors.navy700 }]}>
                      <Text style={styles.barVal}>{score}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            {plotW > 0 && (
              <Svg style={StyleSheet.absoluteFill} width={plotW} height={PLOT} pointerEvents="none">
                <SvgLine x1={0} y1={targetY} x2={plotW} y2={targetY} stroke={colors.gold} strokeWidth={2} strokeDasharray="6 5" />
              </Svg>
            )}
            <View style={[styles.targetTag, { top: Math.max(0, targetY - 9) }]}>
              <Text style={styles.targetTagText}>Mục tiêu {detail.target} · {targetPct}%</Text>
            </View>
          </View>
          <View style={styles.axis}>
            {scored.map((a) => (
              <Text key={a.id} style={styles.axisLabel} numberOfLines={1}>
                {a.dateLabel}
              </Text>
            ))}
          </View>
        </Card>
      )}

      <Text style={[displayText({ fontWeight: '500' }), styles.secTitle]}>Danh sách bài đánh giá</Text>
      {detail.assessments.length === 0 ? (
        <EmptyView message="Chưa có bài đánh giá." />
      ) : (
        <Card>
          {detail.assessments.map((a, i) => (
            <View key={a.id} style={[styles.assess, i < detail.assessments.length - 1 && styles.assessBorder]}>
              <View style={styles.flex}>
                <Text style={styles.assessT}>{a.title}</Text>
                <Text style={styles.assessD}>
                  {a.dateLabel} · {a.detail}
                </Text>
              </View>
              {a.pending ? (
                <Pill label="Chờ chấm" tone="warn" />
              ) : (
                <Text style={[displayText({ fontWeight: '600' }), styles.score, { color: (a.score ?? 0) >= 80 ? colors.ok : colors.warn }]}>
                  {a.score}%
                </Text>
              )}
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Materials tab                                                              */
/* -------------------------------------------------------------------------- */
function MaterialsTab({ detail }: { detail: StudentDetail }) {
  return (
    <View>
      <Text style={[displayText({ fontWeight: '500' }), styles.secTitle]}>Tài liệu đã giao</Text>
      {detail.materials.length === 0 ? (
        <EmptyView message="Chưa giao tài liệu nào." />
      ) : (
        <Card>
          {detail.materials.map((m, i) => (
            <View key={m.id} style={[styles.mat, i < detail.materials.length - 1 && styles.matBorder]}>
              <View style={styles.matIc}>
                <Icon name="fileText" size={19} color={colors.navy700} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.matT}>{m.title}</Text>
                <Text style={styles.matS}>{m.meta}</Text>
              </View>
              <Pill label={m.seen ? 'Đã xem' : 'Chưa xem'} tone={m.seen ? 'ok' : 'default'} />
            </View>
          ))}
        </Card>
      )}
      <AppButton
        label="Giao tài liệu mới"
        onPress={() => Alert.alert('Tài liệu', 'Mở thư viện để giao tài liệu mới.')}
        variant="ghost"
        icon="plus"
        fullWidth
        style={{ marginTop: space.lg }}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notes tab                                                                  */
/* -------------------------------------------------------------------------- */
function NotesTab({
  notes,
  value,
  onChange,
  onAdd,
}: {
  notes: TutorNote[];
  value: string;
  onChange: (t: string) => void;
  onAdd: () => void;
}) {
  return (
    <View>
      <Card padded style={styles.block}>
        <TextInput
          style={[styles.input, styles.inputArea]}
          value={value}
          onChangeText={onChange}
          placeholder="Thêm ghi chú về buổi học, tiến độ, hoặc trao đổi với phụ huynh…"
          placeholderTextColor={colors.slate2}
          multiline
          accessibilityLabel="Nội dung ghi chú"
        />
        <View style={styles.noteAddRow}>
          <AppButton label="Lưu ghi chú" onPress={onAdd} variant="navy" icon="check" />
        </View>
      </Card>

      {notes.length === 0 ? (
        <EmptyView message="Chưa có ghi chú." />
      ) : (
        <Card>
          {notes.map((n, i) => (
            <View key={n.id} style={[styles.note, i < notes.length - 1 && styles.noteBorder]}>
              <Text style={styles.noteDate}>{n.dateLabel}</Text>
              <Text style={styles.noteText}>{n.text}</Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Segmented control                                                          */
/* -------------------------------------------------------------------------- */
const Segmented = React.memo(function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segBtn, active && styles.segBtnActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.segText, active && styles.segTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.beige },
  flex: { flex: 1 },
  flex2: { flex: 1.4 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: space.lg, paddingBottom: 12, backgroundColor: colors.beige, borderBottomWidth: 1, borderBottomColor: colors.line },
  iconBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 17, color: colors.ink },

  hero: { marginTop: space.lg, borderRadius: radius.xl, padding: space.xl, backgroundColor: colors.navy, overflow: 'hidden' },
  heroSeal: { position: 'absolute', right: -48, top: -38 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroName: { fontSize: 22, color: '#FBF7EE' },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6 },
  heroMetaText: { fontSize: 13, color: '#BCC4D2' },
  heroActions: { flexDirection: 'row', gap: 10, marginTop: space.lg },

  strip: { flexDirection: 'row', gap: 8, marginTop: space.md },
  mini: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingVertical: 13, paddingHorizontal: 6, alignItems: 'center', ...shadow.card },
  miniV: { fontSize: 18, color: colors.ink },
  miniK: { fontSize: 10.5, color: colors.slate, marginTop: 5, textAlign: 'center' },

  tabsScroll: { marginTop: space.xl, borderBottomWidth: 1, borderBottomColor: colors.line },
  tabs: { gap: 4, paddingRight: space.lg },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 11, paddingBottom: 12, alignItems: 'center' },
  tabText: { fontSize: 13.5, fontWeight: '600', color: colors.slate },
  tabTextActive: { color: colors.ink },
  tabUnderline: { position: 'absolute', left: 10, right: 10, bottom: -1, height: 2.5, borderRadius: 3, backgroundColor: colors.gold },

  block: { marginTop: space.lg },
  blockTitle: { fontSize: 16, color: colors.ink, marginBottom: 13 },
  secTitle: { fontSize: 15, color: colors.ink, marginTop: space.xl, marginBottom: 11 },

  goalRow: { flexDirection: 'row', gap: 10 },
  goal: { flex: 1, borderRadius: radius.md, backgroundColor: colors.parchment, padding: 13 },
  goalTarget: { backgroundColor: colors.navy },
  goalK: { fontSize: 11, color: colors.slate },
  goalKTarget: { fontSize: 11, color: colors.gold },
  goalV: { fontSize: 22, color: colors.ink, marginTop: 4 },
  goalVsm: { fontSize: 14, color: colors.ink, marginTop: 6 },
  goalVTarget: { fontSize: 22, color: colors.goldSoft, marginTop: 4 },

  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  topicBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  topicName: { width: '36%', fontSize: 13.5, fontWeight: '500', color: colors.ink },
  topicBar: { flex: 1 },
  topicPct: { width: 38, textAlign: 'right', fontSize: 12, fontWeight: '600', color: colors.slate },

  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nextIc: { width: 42, height: 42, borderRadius: 11, backgroundColor: colors.parchment, alignItems: 'center', justifyContent: 'center' },
  nextT: { fontWeight: '600', fontSize: 14, color: colors.ink },
  nextS: { fontSize: 12.5, color: colors.slate, marginTop: 2 },

  timeline: { marginTop: space.lg, paddingLeft: 22 },
  tlItem: { position: 'relative', marginBottom: 12 },
  tlDot: { position: 'absolute', left: -22, top: 18, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.ok, borderWidth: 2.5, borderColor: colors.beige, zIndex: 1 },
  tlCard: { padding: 14 },
  tlHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 },
  tlTopic: { fontWeight: '600', fontSize: 14, color: colors.ink, flex: 1 },
  tlDate: { fontSize: 11.5, color: colors.slate2 },
  tlMeta: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tlMetaText: { fontSize: 12, color: colors.slate },
  tlNote: { fontSize: 12.5, color: colors.ink, marginTop: 9, paddingTop: 9, borderTopWidth: 1, borderTopColor: colors.line2, lineHeight: 18 },
  tlNoteLabel: { color: colors.navy700, fontWeight: '600' },

  plot: { height: PLOT, marginTop: 4 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, height: PLOT },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: PLOT },
  bar: { width: '70%', maxWidth: 34, borderTopLeftRadius: 6, borderTopRightRadius: 6, alignItems: 'center' },
  barVal: { position: 'absolute', top: -18, fontSize: 11, fontWeight: '700', color: colors.ink },
  targetTag: { position: 'absolute', right: 0 },
  targetTagText: { fontSize: 10, fontWeight: '700', color: colors.warn, backgroundColor: colors.beige, paddingHorizontal: 4 },
  axis: { flexDirection: 'row', gap: 12, marginTop: 8 },
  axisLabel: { flex: 1, textAlign: 'center', fontSize: 10, color: colors.slate2 },

  assess: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: space.lg },
  assessBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  assessT: { fontWeight: '600', fontSize: 13.5, color: colors.ink },
  assessD: { fontSize: 11.5, color: colors.slate2, marginTop: 2 },
  score: { fontSize: 18 },

  mat: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: space.lg },
  matBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  matIc: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.parchment, alignItems: 'center', justifyContent: 'center' },
  matT: { fontWeight: '600', fontSize: 13.5, color: colors.ink },
  matS: { fontSize: 11.5, color: colors.slate, marginTop: 2 },

  note: { paddingVertical: 13, paddingHorizontal: space.lg },
  noteBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  noteDate: { fontSize: 11.5, color: colors.gold, fontWeight: '600' },
  noteText: { fontSize: 13.5, color: colors.ink, marginTop: 5, lineHeight: 20 },
  noteAddRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },

  actionBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 10, paddingHorizontal: space.lg, paddingTop: 12, backgroundColor: colors.beige, borderTopWidth: 1, borderTopColor: colors.line },

  overlay: { flex: 1, backgroundColor: colors.overlay },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.beige, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: space.xl, paddingTop: space.lg, maxHeight: '90%' },
  grab: { width: 38, height: 4, borderRadius: 99, backgroundColor: '#D6CFC0', alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 20, color: colors.ink },
  sheetSub: { fontSize: 13, color: colors.slate, marginTop: 4, marginBottom: 16 },

  label: { fontSize: 12.5, fontWeight: '600', color: colors.ink, marginBottom: 7, marginTop: 12 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, paddingVertical: 12, paddingHorizontal: 13, fontSize: 14.5, color: colors.ink },
  inputArea: { minHeight: 64, textAlignVertical: 'top' },

  segment: { flexDirection: 'row', gap: 8 },
  segBtn: { flex: 1, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center' },
  segBtnActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  segText: { fontSize: 13.5, fontWeight: '600', color: colors.slate },
  segTextActive: { color: '#FBF7EE' },

  sheetActions: { flexDirection: 'row', gap: 10, marginTop: space.xl },
});
