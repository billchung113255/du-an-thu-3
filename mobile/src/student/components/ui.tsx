import React, { memo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadow, spacing } from '../theme/tokens';

/* ---------------- SealLogo ---------------- */
export const SealLogo = memo(function SealLogo({ size = 34 }: { size?: number }) {
  return (
    <View
      style={[
        styles.seal,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.sealText, { fontSize: size * 0.42 }]}>Te</Text>
    </View>
  );
});

/* ---------------- Button ---------------- */
type ButtonVariant = 'gold' | 'navy' | 'outline' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  full?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button = memo(function Button({
  label,
  onPress,
  variant = 'gold',
  loading = false,
  disabled = false,
  icon,
  full = false,
  style,
}: ButtonProps) {
  const v = BTN[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border },
        full && styles.btnFull,
        variant === 'gold' && !isDisabled && shadow.gold,
        pressed && !isDisabled && styles.btnPressed,
        isDisabled && styles.btnDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={v.fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[styles.btnLabel, { color: v.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
});

const BTN: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  gold: { bg: colors.gold, fg: colors.navy900, border: 'transparent' },
  navy: { bg: colors.navy800, fg: colors.white, border: 'transparent' },
  outline: { bg: 'transparent', fg: colors.ink, border: colors.line },
  ghost: { bg: colors.white, fg: colors.ink, border: colors.line },
};

/* ---------------- ProgressBar ---------------- */
export const ProgressBar = memo(function ProgressBar({
  value,
  height = 8,
  trackColor = colors.paper3,
  fillColor = colors.gold,
  style,
}: {
  value: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct), min: 0, max: 100 }}
      style={[{ height, backgroundColor: trackColor, borderRadius: radius.pill, overflow: 'hidden' }, style]}
    >
      <View style={{ width: `${pct}%`, height: '100%', backgroundColor: fillColor, borderRadius: radius.pill }} />
    </View>
  );
});

/* ---------------- Pill ---------------- */
type PillTone = 'navy' | 'gold' | 'muted' | 'success' | 'onDark';
export const Pill = memo(function Pill({
  label,
  tone = 'muted',
  icon,
}: {
  label: string;
  tone?: PillTone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const p = PILL[tone];
  return (
    <View style={[styles.pill, { backgroundColor: p.bg, borderColor: p.border }]}>
      {icon ? <Ionicons name={icon} size={13} color={p.fg} style={{ marginRight: 6 }} /> : null}
      <Text style={[styles.pillText, { color: p.fg }]}>{label}</Text>
    </View>
  );
});

const PILL: Record<PillTone, { bg: string; fg: string; border: string }> = {
  navy: { bg: colors.navy800, fg: colors.white, border: 'transparent' },
  gold: { bg: 'rgba(179,139,77,0.14)', fg: colors.goldDeep, border: 'rgba(179,139,77,0.3)' },
  muted: { bg: colors.white, fg: colors.slate, border: colors.line },
  success: { bg: 'rgba(47,143,107,0.12)', fg: colors.green, border: 'rgba(47,143,107,0.3)' },
  onDark: { bg: 'rgba(255,255,255,0.08)', fg: 'rgba(255,255,255,0.92)', border: 'rgba(216,184,119,0.28)' },
};

/* ---------------- Card ---------------- */
export const Card = memo(function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
});

/* ---------------- SectionLabel ---------------- */
export const SectionLabel = memo(function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
});

/* ---------------- Callout ---------------- */
export const Callout = memo(function Callout({
  kind,
  title,
  body,
}: {
  kind: 'tip' | 'warn';
  title: string;
  body: string;
}) {
  const isTip = kind === 'tip';
  const accent = isTip ? colors.goldDeep : colors.amber;
  const bg = isTip ? 'rgba(179,139,77,0.09)' : 'rgba(194,135,43,0.1)';
  const border = isTip ? 'rgba(179,139,77,0.3)' : 'rgba(194,135,43,0.3)';
  return (
    <View style={[styles.callout, { backgroundColor: bg, borderColor: border }]}>
      <Ionicons name={isTip ? 'bulb' : 'warning'} size={18} color={accent} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={[styles.calloutTitle, { color: accent }]}>{title}</Text>
        <Text style={styles.calloutBody}>{body}</Text>
      </View>
    </View>
  );
});

/* ---------------- FormulaBox ---------------- */
export const FormulaBox = memo(function FormulaBox({
  label,
  rows,
}: {
  label: string;
  rows: { eq: string; note: string }[];
}) {
  return (
    <View style={styles.formula}>
      <Text style={styles.formulaLabel}>{label}</Text>
      {rows.map((r, i) => (
        <View key={i} style={[styles.formulaRow, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
          <Text style={styles.formulaEq}>{r.eq}</Text>
          <Text style={styles.formulaNote}>{r.note}</Text>
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  seal: { backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  sealText: { fontFamily: fonts.serifBold, color: colors.navy900 },

  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  btnFull: { alignSelf: 'stretch' },
  btnPressed: { transform: [{ translateY: 1 }], opacity: 0.95 },
  btnDisabled: { opacity: 0.55 },
  btnLabel: { fontFamily: fonts.sansSemi, fontSize: 15 },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillText: { fontFamily: fonts.sansMedium, fontSize: 12.5 },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    ...shadow.card,
  },

  sectionLabel: {
    fontFamily: fonts.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.slate2,
    marginBottom: 5,
  },

  callout: { flexDirection: 'row', borderRadius: radius.md, borderWidth: 1, padding: 14, marginVertical: 6 },
  calloutTitle: { fontFamily: fonts.sansBold, fontSize: 13, marginBottom: 3 },
  calloutBody: { fontFamily: fonts.sansRegular, fontSize: 13.5, lineHeight: 20, color: colors.ink },

  formula: { backgroundColor: colors.navy800, borderRadius: radius.md, padding: 16, marginVertical: 8 },
  formulaLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 10.5,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: colors.goldBright,
    marginBottom: 10,
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  formulaEq: { fontFamily: fonts.serifSemi, fontSize: 17, color: colors.goldBright, flexShrink: 1, paddingRight: 10 },
  formulaNote: { fontFamily: fonts.sansRegular, fontSize: 11.5, color: 'rgba(255,255,255,0.6)', textAlign: 'right', flexShrink: 1 },
});
