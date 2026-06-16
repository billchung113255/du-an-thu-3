import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radius, spacing } from '../theme/tokens';
import { Button, Pill, ProgressBar, SectionLabel } from '../components/ui';
import { QUIZ } from '../data/mockData';

const PAST_PAPERS = [
  { id: 'pp1', title: 'Mathematics 0580 · Paper 2', meta: 'May/June 2024 · 90 phút', tone: 'gold' as const },
  { id: 'pp2', title: 'Chemistry 0620 · Paper 4', meta: 'Oct/Nov 2023 · 75 phút', tone: 'muted' as const },
  { id: 'pp3', title: 'Physics 0625 · Paper 2', meta: 'May/June 2023 · 45 phút', tone: 'muted' as const },
];

export default function PracticeScreen() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = QUIZ.length;
  const q = QUIZ[index];
  const isCorrect = checked && selected === q.answerIndex;

  const check = useCallback(() => {
    if (selected === null) return;
    setChecked(true);
    if (selected === QUIZ[index].answerIndex) setCorrectCount((c) => c + 1);
  }, [selected, index]);

  const next = useCallback(() => {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setChecked(false);
  }, [index, total]);

  const restart = useCallback(() => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  }, []);

  const optionStyle = useCallback(
    (i: number) => {
      if (!checked) return selected === i ? styles.optActive : styles.opt;
      if (i === q.answerIndex) return styles.optCorrect;
      if (i === selected) return styles.optWrong;
      return styles.opt;
    },
    [checked, selected, q.answerIndex],
  );

  const scorePct = useMemo(() => Math.round((correctCount / total) * 100), [correctCount, total]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Luyện đề</Text>

        {/* Quiz card */}
        <SectionLabel>Quiz nhanh · Quadratic Equations</SectionLabel>
        <View style={styles.quizCard}>
          {finished ? (
            <View style={styles.result}>
              <View style={[styles.resultRing, { borderColor: scorePct >= 67 ? colors.green : colors.amber }]}>
                <Text style={styles.resultPct}>{scorePct}%</Text>
              </View>
              <Text style={styles.resultTitle}>
                Em đúng {correctCount}/{total} câu
              </Text>
              <Text style={styles.resultSub}>
                {scorePct >= 67 ? 'Làm tốt lắm! Tiếp tục giữ phong độ nhé.' : 'Ôn lại lý thuyết rồi thử lại em nhé.'}
              </Text>
              <Button label="Làm lại" onPress={restart} icon="refresh" />
            </View>
          ) : (
            <>
              <View style={styles.quizHead}>
                <Text style={styles.quizCount}>
                  Câu {index + 1}/{total}
                </Text>
                <Pill label={`${correctCount} đúng`} tone="success" />
              </View>
              <ProgressBar value={((index + (checked ? 1 : 0)) / total) * 100} style={{ marginBottom: spacing.lg }} />
              <Text style={styles.question}>{q.prompt}</Text>

              <View style={{ gap: 10, marginTop: spacing.md }}>
                {q.options.map((opt, i) => (
                  <Pressable
                    key={i}
                    style={optionStyle(i)}
                    disabled={checked}
                    onPress={() => setSelected(i)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selected === i }}
                  >
                    <View style={[styles.optDot, selected === i && !checked && styles.optDotActive]}>
                      {checked && i === q.answerIndex ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
                      {checked && i === selected && i !== q.answerIndex ? <Ionicons name="close" size={13} color={colors.white} /> : null}
                    </View>
                    <Text style={styles.optText}>{opt}</Text>
                  </Pressable>
                ))}
              </View>

              {checked ? (
                <View style={[styles.explain, { borderColor: isCorrect ? 'rgba(47,143,107,0.3)' : 'rgba(194,135,43,0.3)' }]}>
                  <Text style={[styles.explainTag, { color: isCorrect ? colors.green : colors.amber }]}>
                    {isCorrect ? 'Chính xác!' : 'Chưa đúng'}
                  </Text>
                  <Text style={styles.explainText}>{q.explanation}</Text>
                </View>
              ) : null}

              {checked ? (
                <Button label={index + 1 >= total ? 'Xem kết quả' : 'Câu tiếp theo'} onPress={next} icon="arrow-forward" full style={{ marginTop: spacing.lg }} />
              ) : (
                <Button label="Kiểm tra" onPress={check} disabled={selected === null} full style={{ marginTop: spacing.lg }} />
              )}
            </>
          )}
        </View>

        {/* Past papers */}
        <SectionLabel>Đề thi thật</SectionLabel>
        <View style={{ gap: spacing.md }}>
          {PAST_PAPERS.map((p) => (
            <Pressable key={p.id} style={styles.paper} accessibilityRole="button">
              <View style={styles.paperIcon}>
                <Ionicons name="document-text" size={20} color={colors.navy700} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.paperTitle}>{p.title}</Text>
                <Text style={styles.paperMeta}>{p.meta}</Text>
              </View>
              <Ionicons name="download-outline" size={20} color={colors.slate2} />
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

  quizCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.xl },
  quizHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  quizCount: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.slate },
  question: { fontFamily: fonts.serifSemi, fontSize: 19, color: colors.ink, lineHeight: 27 },

  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, borderRadius: radius.md, padding: 14 },
  optActive: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.gold, backgroundColor: 'rgba(179,139,77,0.07)', borderRadius: radius.md, padding: 14 },
  optCorrect: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.green, backgroundColor: 'rgba(47,143,107,0.08)', borderRadius: radius.md, padding: 14 },
  optWrong: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: colors.danger, backgroundColor: 'rgba(180,69,47,0.07)', borderRadius: radius.md, padding: 14 },
  optDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  optDotActive: { borderColor: colors.gold },
  optText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14.5, color: colors.ink },

  explain: { marginTop: spacing.lg, padding: 14, borderWidth: 1, borderRadius: radius.md, backgroundColor: colors.paper2 },
  explainTag: { fontFamily: fonts.sansBold, fontSize: 13, marginBottom: 4 },
  explainText: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 21, color: colors.ink },

  result: { alignItems: 'center', paddingVertical: spacing.lg },
  resultRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  resultPct: { fontFamily: fonts.serifBold, fontSize: 26, color: colors.ink },
  resultTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink, marginBottom: 6 },
  resultSub: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.slate, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 21 },

  paper: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: spacing.lg },
  paperIcon: { width: 42, height: 42, borderRadius: radius.sm, backgroundColor: colors.paper2, alignItems: 'center', justifyContent: 'center' },
  paperTitle: { fontFamily: fonts.sansSemi, fontSize: 14.5, color: colors.ink },
  paperMeta: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.slate2, marginTop: 2 },
});
