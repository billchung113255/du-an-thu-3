import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radius, spacing } from '../theme/tokens';
import { SealLogo } from '../components/ui';
import { sendTutorMessage } from '../api/tutor';
import { PROFILE } from '../data/mockData';
import type { ChatMessage } from '../types';

const SUGGESTIONS = [
  'Giải thích định luật Ohm dễ hiểu',
  'Cách nhớ bảng tuần hoàn',
  'Lập dàn ý Economics essay',
  'Mẹo làm Paper 2 Maths',
];

interface Row {
  id: string;
  role: ChatMessage['role'] | 'typing' | 'error';
  content: string;
}

export default function TutorScreen() {
  const listRef = useRef<FlatList<Row>>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const scrollEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const ask = useCallback(
    async (raw: string) => {
      const value = raw.trim();
      if (!value || loading) return;

      const userMsg: ChatMessage = { role: 'user', content: value };
      const nextHistory = [...history, userMsg];
      setHistory(nextHistory);
      setRows((r) => [...r, { id: `u${Date.now()}`, role: 'user', content: value }, { id: 'typing', role: 'typing', content: '' }]);
      setInput('');
      setLoading(true);
      scrollEnd();

      try {
        const reply = await sendTutorMessage({ curriculum: PROFILE.curriculum, messages: nextHistory });
        setHistory((h) => [...h, { role: 'assistant', content: reply }]);
        setRows((r) => [...r.filter((x) => x.id !== 'typing'), { id: `a${Date.now()}`, role: 'assistant', content: reply }]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Có lỗi xảy ra. Em thử lại nhé.';
        setRows((r) => [...r.filter((x) => x.id !== 'typing'), { id: `e${Date.now()}`, role: 'error', content: msg }]);
      } finally {
        setLoading(false);
        scrollEnd();
      }
    },
    [history, loading, scrollEnd],
  );

  const renderRow = useCallback(({ item }: { item: Row }) => {
    if (item.role === 'typing') {
      return (
        <View style={[styles.bubble, styles.bubbleAi, styles.typing]}>
          <ActivityIndicator size="small" color={colors.goldDeep} />
          <Text style={styles.typingText}>Đang soạn…</Text>
        </View>
      );
    }
    if (item.role === 'error') {
      return (
        <View style={[styles.bubble, styles.bubbleError]}>
          <Text style={styles.errorText}>{item.content}</Text>
        </View>
      );
    }
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
        <Text style={[styles.bubbleText, isUser && { color: colors.white }]}>{item.content}</Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <SealLogo size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Gia sư AI</Text>
          <Text style={styles.subtitle}>Hỏi đáp mọi môn · IGCSE · A Level · IB · AP</Text>
        </View>
        <View style={styles.live}>
          <View style={styles.dot} />
          <Text style={styles.liveText}>online</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {rows.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="sparkles" size={26} color={colors.gold} />
            </View>
            <Text style={styles.emptyTitle}>Bắt đầu trò chuyện</Text>
            <Text style={styles.emptySub}>Hỏi bất cứ điều gì về bài học, đề thi, hay cách ôn tập hiệu quả.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={rows}
            keyExtractor={(r) => r.id}
            renderItem={renderRow}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollEnd}
          />
        )}

        <View style={styles.composer}>
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={(s) => s}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sugRow}
            renderItem={({ item }) => (
              <Pressable style={styles.sugChip} onPress={() => ask(item)} accessibilityRole="button">
                <Text style={styles.sugText}>{item}</Text>
              </Pressable>
            )}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Nhập câu hỏi của em…"
              placeholderTextColor={colors.slate2}
              onSubmitEditing={() => ask(input)}
              returnKeyType="send"
              accessibilityLabel="Câu hỏi cho Gia sư AI"
            />
            <Pressable style={[styles.send, (loading || !input.trim()) && { opacity: 0.5 }]} disabled={loading || !input.trim()} onPress={() => ask(input)} accessibilityRole="button" accessibilityLabel="Gửi">
              <Ionicons name="arrow-up" size={20} color={colors.navy900} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  title: { fontFamily: fonts.serifSemi, fontSize: 18, color: colors.ink },
  subtitle: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.slate2, marginTop: 1 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.green },
  liveText: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.green },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  emptyIcon: { width: 60, height: 60, borderRadius: radius.lg, backgroundColor: 'rgba(179,139,77,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink, marginBottom: 6 },
  emptySub: { fontFamily: fonts.sansRegular, fontSize: 14, color: colors.slate, textAlign: 'center', lineHeight: 21 },

  list: { padding: spacing.xl, gap: 10 },
  bubble: { borderRadius: radius.md, padding: 13, maxWidth: '88%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.navy800, borderBottomRightRadius: 4 },
  bubbleAi: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 4 },
  bubbleError: { alignSelf: 'flex-start', backgroundColor: 'rgba(180,69,47,0.08)', borderWidth: 1, borderColor: 'rgba(180,69,47,0.3)' },
  bubbleText: { fontFamily: fonts.sansRegular, fontSize: 14.5, lineHeight: 22, color: colors.ink },
  errorText: { fontFamily: fonts.sansMedium, fontSize: 13.5, color: colors.danger },
  typing: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.slate },

  composer: { borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.paper, paddingTop: 10 },
  sugRow: { gap: 8, paddingHorizontal: spacing.xl, paddingBottom: 10 },
  sugChip: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 13, paddingVertical: 8 },
  sugText: { fontFamily: fonts.sansMedium, fontSize: 12.5, color: colors.slate },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  input: { flex: 1, fontFamily: fonts.sansRegular, fontSize: 15, color: colors.ink, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 15, height: 48 },
  send: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
});
