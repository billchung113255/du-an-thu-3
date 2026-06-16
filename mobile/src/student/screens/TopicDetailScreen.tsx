import React, { memo, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { colors, fonts, gradients, radius, spacing } from '../theme/tokens';
import { Button, Callout, FormulaBox, Pill, ProgressBar, SectionLabel } from '../components/ui';
import { getTopicContent } from '../data/mockData';
import { sendTutorMessage } from '../api/tutor';
import type {
  ChatMessage,
  Flashcard,
  GlossaryTerm,
  NoteSection,
  WorkedExample,
} from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'TopicDetail'>;
type Rt = RouteProp<RootStackParamList, 'TopicDetail'>;

export default function TopicDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const content = getTopicContent(route.params?.topicId ?? 'stoich');
  const [learned, setLearned] = useState(false);
  const mastery = learned ? 100 : content.mastery;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.back} accessibilityRole="button" accessibilityLabel="Quay lại">
          <Ionicons name="chevron-back" size={22} color={colors.ink} />
        </Pressable>
        <Text style={styles.crumb} numberOfLines={1}>
          {content.curriculum} · {content.subjectName}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={gradients.navy} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <Text style={styles.heroEyebrow}>{content.subjectName} · IGCSE {content.subjectCode}</Text>
          <Text style={styles.heroTitle}>{content.title}</Text>
          <Text style={styles.heroSub}>{content.subtitle}</Text>
          <View style={styles.heroChips}>
            {content.examChips.map((c) => (
              <Pill key={c} label={c} tone="onDark" />
            ))}
          </View>
          <View style={styles.heroProgRow}>
            <Text style={styles.heroProgLabel}>Thành thạo</Text>
            <ProgressBar value={mastery} fillColor={colors.goldBright} trackColor="rgba(255,255,255,0.16)" style={{ flex: 1 }} />
            <Text style={styles.heroPct}>{mastery}%</Text>
          </View>
          <Button
            label={learned ? 'Đã hoàn thành' : 'Đánh dấu đã học'}
            variant={learned ? 'gold' : 'outline'}
            icon="checkmark-done"
            onPress={() => setLearned((v) => !v)}
            style={learned ? undefined : styles.heroOutlineBtn}
          />
        </LinearGradient>

        <View style={styles.body}>
          {/* Overview */}
          <SectionLabel>Tổng quan</SectionLabel>
          <Text style={styles.h2}>Em sẽ học được gì?</Text>
          <Text style={styles.para}>{content.overview}</Text>
          <View style={styles.objBox}>
            {content.objectives.map((o) => (
              <View key={o} style={styles.objItem}>
                <View style={styles.objTick}>
                  <Ionicons name="checkmark" size={12} color={colors.green} />
                </View>
                <Text style={styles.objText}>{o}</Text>
              </View>
            ))}
          </View>

          {/* Key terms */}
          <SectionLabel>Khái niệm chính</SectionLabel>
          <Text style={styles.h2}>Thuật ngữ cần nhớ</Text>
          <View style={styles.termGrid}>
            {content.terms.map((t) => (
              <TermCard key={t.term} term={t} />
            ))}
          </View>

          {/* Revision notes */}
          <SectionLabel>Ghi chú ôn tập</SectionLabel>
          <Text style={styles.h2}>Lý thuyết cốt lõi</Text>
          {content.notes.map((n) => (
            <NotesSection key={n.heading} section={n} />
          ))}

          {/* Worked examples */}
          <SectionLabel>Ví dụ mẫu</SectionLabel>
          <Text style={styles.h2}>Bài giải từng bước</Text>
          {content.examples.map((ex, i) => (
            <WorkedExampleItem key={ex.id} index={i + 1} example={ex} />
          ))}

          {/* Flashcards */}
          <SectionLabel>Active recall · Lặp lại ngắt quãng</SectionLabel>
          <Text style={styles.h2}>Flashcards</Text>
          <FlashcardDeck cards={content.flashcards} />

          {/* Ask AI */}
          <View style={{ marginTop: spacing.xl }}>
            <AskTutor curriculum={content.curriculum} subjectCode={content.subjectCode} topic={content.title} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- Term card ---------------- */
const TermCard = memo(function TermCard({ term }: { term: GlossaryTerm }) {
  return (
    <View style={styles.term}>
      <Text style={styles.termTitle}>{term.term}</Text>
      <Text style={styles.termDef}>{term.definition}</Text>
    </View>
  );
});

/* ---------------- Notes section ---------------- */
const NotesSection = memo(function NotesSection({ section }: { section: NoteSection }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.h3}>{section.heading}</Text>
      {section.paragraphs.map((p, i) => (
        <Text key={i} style={styles.para}>
          {p}
        </Text>
      ))}
      {section.formula ? <FormulaBox label={section.formula.label} rows={section.formula.rows} /> : null}
      {section.callout ? <Callout kind={section.callout.kind} title={section.callout.title} body={section.callout.body} /> : null}
    </View>
  );
});

/* ---------------- Worked example (expandable) ---------------- */
const WorkedExampleItem = memo(function WorkedExampleItem({ index, example }: { index: number; example: WorkedExample }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.wex}>
      <Pressable style={styles.wexHead} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={styles.wexNum}>
          <Text style={styles.wexNumText}>{index}</Text>
        </View>
        <Text style={styles.wexQ}>{example.question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.slate2} />
      </Pressable>
      {open ? (
        <View style={styles.wexBody}>
          {example.steps.map((s) => (
            <View key={s.label} style={styles.wexStep}>
              <Text style={styles.wexStepNum}>{s.label}</Text>
              <Text style={styles.wexStepText}>{s.text}</Text>
            </View>
          ))}
          <View style={styles.wexAns}>
            <Text style={styles.wexAnsText}>{example.answer}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
});

/* ---------------- Flashcard deck (spaced repetition) ---------------- */
type Rating = 'again' | 'hard' | 'good' | 'easy';
const RATINGS: { r: Rating; label: string; interval: string; color: string }[] = [
  { r: 'again', label: 'Lại', interval: '<1 phút', color: colors.danger },
  { r: 'hard', label: 'Khó', interval: '10 phút', color: colors.amber },
  { r: 'good', label: 'Tốt', interval: '1 ngày', color: colors.blue },
  { r: 'easy', label: 'Dễ', interval: '4 ngày', color: colors.green },
];

const FlashcardDeck = memo(function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
  const total = cards.length;
  const [queue, setQueue] = useState<Flashcard[]>(cards);
  const [settled, setSettled] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const flip = useCallback(() => {
    const to = flipped ? 0 : 1;
    setFlipped((f) => !f);
    Animated.timing(anim, { toValue: to, duration: 320, useNativeDriver: true }).start();
  }, [flipped, anim]);

  const resetFlip = useCallback(() => {
    setFlipped(false);
    anim.setValue(0);
  }, [anim]);

  const rate = useCallback(
    (r: Rating) => {
      if (!flipped) return;
      setQueue((prev) => {
        if (prev.length === 0) return prev;
        const [card, ...rest] = prev;
        let next: Flashcard[];
        if (r === 'again') next = [...rest, card];
        else if (r === 'hard') next = [rest[0], card, ...rest.slice(1)].filter(Boolean) as Flashcard[];
        else {
          next = rest;
          setSettled((s) => s + 1);
        }
        if (next.length === 0) setDone(true);
        return next;
      });
      resetFlip();
    },
    [flipped, resetFlip],
  );

  const restart = useCallback(() => {
    setQueue(cards);
    setSettled(0);
    setDone(false);
    resetFlip();
  }, [cards, resetFlip]);

  const frontRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = anim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const progress = Math.round((settled / total) * 100);
  const current = queue[0];

  return (
    <View>
      <View style={styles.deckHead}>
        <Text style={styles.deckLabel}>
          Bộ thẻ <Text style={{ fontFamily: fonts.sansBold, color: colors.ink }}>Stoichiometry</Text> · {total} thẻ
        </Text>
        <View style={styles.deckProg}>
          <ProgressBar value={progress} style={{ flex: 1 }} />
          <Text style={styles.deckLeft}>{total - settled} còn lại</Text>
        </View>
      </View>

      {done || !current ? (
        <View style={styles.fcDone}>
          <View style={styles.fcDoneIcon}>
            <Ionicons name="checkmark" size={26} color={colors.navy900} />
          </View>
          <Text style={styles.fcDoneTitle}>Hoàn thành phiên ôn tập! 🎉</Text>
          <Text style={styles.fcDoneSub}>Em đã ôn xong {total} thẻ. Lịch ôn tiếp theo: ngày mai.</Text>
          <Button label="Ôn lại bộ thẻ" onPress={restart} />
        </View>
      ) : (
        <>
          <Pressable onPress={flip} accessibilityRole="button" accessibilityLabel="Lật thẻ" style={styles.fcStage}>
            <Animated.View style={[styles.fcFace, styles.fcFront, { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}>
              <Text style={styles.fcTag}>Câu hỏi</Text>
              <Text style={styles.fcCount}>{settled + 1} / {total}</Text>
              <Text style={styles.fcQuestion}>{current.front}</Text>
              <Text style={styles.fcHint}>Chạm để lật</Text>
            </Animated.View>
            <Animated.View style={[styles.fcFace, styles.fcBack, { transform: [{ perspective: 1000 }, { rotateY: backRotate }] }]}>
              <Text style={[styles.fcTag, { color: colors.goldBright }]}>Trả lời</Text>
              <Text style={styles.fcAnswer}>{current.back}</Text>
            </Animated.View>
          </Pressable>

          {flipped ? (
            <View style={styles.rateRow}>
              {RATINGS.map((it) => (
                <Pressable key={it.r} style={styles.rateBtn} onPress={() => rate(it.r)} accessibilityRole="button" accessibilityLabel={it.label}>
                  <Text style={[styles.rateLabel, { color: it.color }]}>{it.label}</Text>
                  <Text style={styles.rateInterval}>{it.interval}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Button label="Lật thẻ" variant="navy" onPress={flip} style={{ marginTop: spacing.md }} />
          )}
        </>
      )}
    </View>
  );
});

/* ---------------- Ask tutor widget ---------------- */
const SUGGESTIONS = [
  'Phân biệt empirical và molecular formula?',
  'Một câu về limiting reagent kèm lời giải',
  'Các bước tính theo phương trình',
];

const AskTutor = memo(function AskTutor({
  curriculum,
  subjectCode,
  topic,
}: {
  curriculum: string;
  subjectCode: string;
  topic: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(
    async (raw: string) => {
      const textValue = raw.trim();
      if (!textValue || loading) return;
      setError(null);
      const next: ChatMessage[] = [...messages, { role: 'user', content: textValue }];
      setMessages(next);
      setInput('');
      setLoading(true);
      try {
        const reply = await sendTutorMessage({ curriculum, subjectCode, topic, messages: next });
        setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Có lỗi xảy ra. Em thử lại nhé.');
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, curriculum, subjectCode, topic],
  );

  return (
    <LinearGradient colors={gradients.navy} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ask}>
      <View style={styles.askHead}>
        <View style={styles.askAvatar}>
          <Ionicons name="sparkles" size={20} color={colors.goldBright} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.askTitle}>Chưa hiểu chỗ nào?</Text>
          <Text style={styles.askSub}>Hỏi Gia sư AI ngay trong chuyên đề {topic}</Text>
        </View>
      </View>

      {messages.map((m, i) => (
        <View key={i} style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.bubbleText, m.role === 'user' && { color: colors.white }]}>{m.content}</Text>
        </View>
      ))}
      {loading ? (
        <View style={[styles.bubble, styles.bubbleAi, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
          <ActivityIndicator size="small" color={colors.goldBright} />
          <Text style={styles.bubbleText}>Đang soạn câu trả lời…</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.askError}>{error}</Text> : null}

      <View style={styles.askRow}>
        <TextInput
          style={styles.askInput}
          value={input}
          onChangeText={setInput}
          placeholder="VD: Vì sao phải cân bằng phương trình?"
          placeholderTextColor="rgba(255,255,255,0.45)"
          onSubmitEditing={() => ask(input)}
          returnKeyType="send"
          accessibilityLabel="Câu hỏi cho Gia sư AI"
        />
        <Pressable style={[styles.askSend, loading && { opacity: 0.5 }]} disabled={loading} onPress={() => ask(input)} accessibilityRole="button" accessibilityLabel="Gửi">
          <Ionicons name="arrow-forward" size={19} color={colors.navy900} />
        </Pressable>
      </View>

      {messages.length === 0 ? (
        <View style={styles.askSug}>
          {SUGGESTIONS.map((s) => (
            <Pressable key={s} style={styles.askSugChip} onPress={() => ask(s)}>
              <Text style={styles.askSugText}>{s}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    backgroundColor: colors.paper,
  },
  back: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  crumb: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.slate, flex: 1 },

  scroll: { paddingBottom: spacing.xxxl },
  hero: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },
  heroEyebrow: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.goldBright, marginBottom: 8 },
  heroTitle: { fontFamily: fonts.serifSemi, fontSize: 34, color: colors.white, letterSpacing: -0.5 },
  heroSub: { fontFamily: fonts.sansRegular, fontSize: 15, color: 'rgba(255,255,255,0.74)', marginTop: 6, lineHeight: 22 },
  heroChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: spacing.lg },
  heroProgRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: spacing.lg },
  heroProgLabel: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' },
  heroPct: { fontFamily: fonts.serifBold, fontSize: 15, color: colors.goldBright },
  heroOutlineBtn: { borderColor: 'rgba(216,184,119,0.5)', backgroundColor: 'transparent' },

  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  h2: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.ink, marginBottom: spacing.md, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.serifSemi, fontSize: 17, color: colors.ink, marginTop: spacing.md, marginBottom: 6 },
  para: { fontFamily: fonts.sansRegular, fontSize: 15, lineHeight: 24, color: '#27324a', marginBottom: 10 },

  objBox: { gap: 10, marginBottom: spacing.xl, marginTop: 2 },
  objItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  objTick: { width: 24, height: 24, borderRadius: 7, backgroundColor: 'rgba(47,143,107,0.12)', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  objText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink, flex: 1, lineHeight: 20 },

  termGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: spacing.xl },
  term: { width: '47%', flexGrow: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 14 },
  termTitle: { fontFamily: fonts.serifSemi, fontSize: 15, color: colors.goldDeep, marginBottom: 4 },
  termDef: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 19, color: colors.slate },

  wex: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.white, marginBottom: 12, overflow: 'hidden' },
  wexHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15 },
  wexNum: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.navy800, alignItems: 'center', justifyContent: 'center' },
  wexNumText: { fontFamily: fonts.serifBold, fontSize: 14, color: colors.goldBright },
  wexQ: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink, lineHeight: 20 },
  wexBody: { paddingHorizontal: 15, paddingBottom: 15, borderTopWidth: 1, borderTopColor: colors.line },
  wexStep: { flexDirection: 'row', gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.paper2 },
  wexStepNum: { fontFamily: fonts.serifBold, fontSize: 13, color: colors.goldDeep, width: 18 },
  wexStepText: { fontFamily: fonts.sansRegular, fontSize: 14, color: '#27324a', flex: 1, lineHeight: 21 },
  wexAns: { marginTop: 12, padding: 12, backgroundColor: 'rgba(47,143,107,0.09)', borderWidth: 1, borderColor: 'rgba(47,143,107,0.28)', borderRadius: radius.sm },
  wexAnsText: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.green },

  deckHead: { marginBottom: spacing.md },
  deckLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.slate, marginBottom: 8 },
  deckProg: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deckLeft: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.slate },

  fcStage: { height: 230, marginBottom: 4 },
  fcFace: { position: 'absolute', top: 0, left: 0, right: 0, height: 230, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 24, alignItems: 'center', justifyContent: 'center', backfaceVisibility: 'hidden' },
  fcFront: { backgroundColor: colors.white },
  fcBack: { backgroundColor: colors.navy800, borderColor: colors.navy800 },
  fcTag: { position: 'absolute', top: 16, left: 20, fontFamily: fonts.sansBold, fontSize: 10.5, letterSpacing: 1.3, textTransform: 'uppercase', color: colors.goldDeep },
  fcCount: { position: 'absolute', top: 14, right: 18, fontFamily: fonts.sansSemi, fontSize: 12, color: colors.slate2 },
  fcQuestion: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.ink, textAlign: 'center', lineHeight: 30 },
  fcHint: { position: 'absolute', bottom: 15, fontFamily: fonts.sansMedium, fontSize: 11.5, color: colors.slate2 },
  fcAnswer: { fontFamily: fonts.sansMedium, fontSize: 17, color: colors.white, textAlign: 'center', lineHeight: 26 },

  rateRow: { flexDirection: 'row', gap: 8, marginTop: spacing.md },
  rateBtn: { flex: 1, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, borderRadius: radius.md, paddingVertical: 11, alignItems: 'center', gap: 3 },
  rateLabel: { fontFamily: fonts.sansBold, fontSize: 14 },
  rateInterval: { fontFamily: fonts.sansRegular, fontSize: 10.5, color: colors.slate2 },

  fcDone: { alignItems: 'center', padding: 30, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', borderRadius: radius.lg, backgroundColor: colors.paper2 },
  fcDoneIcon: { width: 56, height: 56, borderRadius: radius.lg, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  fcDoneTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink, marginBottom: 6, textAlign: 'center' },
  fcDoneSub: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.slate, marginBottom: 18, textAlign: 'center' },

  ask: { borderRadius: radius.lg, padding: spacing.xl },
  askHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.md },
  askAvatar: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: 'rgba(216,184,119,0.14)', alignItems: 'center', justifyContent: 'center' },
  askTitle: { fontFamily: fonts.serifSemi, fontSize: 18, color: colors.white },
  askSub: { fontFamily: fonts.sansRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  bubble: { borderRadius: radius.md, padding: 12, marginTop: 10, maxWidth: '92%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: 'rgba(216,184,119,0.18)' },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  bubbleText: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: 'rgba(251,250,246,0.92)' },
  askError: { fontFamily: fonts.sansMedium, fontSize: 13, color: '#F0C4BA', marginTop: 10 },
  askRow: { flexDirection: 'row', gap: 9, marginTop: spacing.lg },
  askInput: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 14, color: colors.white, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.14)', borderRadius: radius.md, paddingHorizontal: 14, height: 46 },
  askSend: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.goldBright, alignItems: 'center', justifyContent: 'center' },
  askSug: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 12 },
  askSugChip: { borderWidth: 1, borderColor: 'rgba(216,184,119,0.4)', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 6 },
  askSugText: { fontFamily: fonts.sansMedium, fontSize: 12, color: 'rgba(255,255,255,0.92)' },
});
