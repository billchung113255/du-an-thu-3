import React, { memo, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, curriculumColor, displayText, radius, shadow, space } from '../theme/tokens';
import type { Curriculum } from '../types/models';
import { Icon, IconName } from './Icon';

/* -------------------------------------------------------------------------- */
/*  Button                                                                     */
/* -------------------------------------------------------------------------- */
type ButtonVariant = 'gold' | 'navy' | 'light' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const BTN: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
  gold: { bg: colors.gold, fg: '#231A05' },
  navy: { bg: colors.navy, fg: '#FBF7EE' },
  light: { bg: 'rgba(255,255,255,0.12)', fg: '#F3EEE3', border: 'rgba(255,255,255,0.2)' },
  ghost: { bg: colors.white, fg: colors.ink, border: colors.line },
};

export const AppButton = memo(function AppButton({
  label,
  onPress,
  variant = 'gold',
  icon,
  fullWidth,
  loading,
  disabled,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const v = BTN[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border ?? 'transparent', borderWidth: v.border ? 1 : 0 },
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && styles.btnPressed,
        isDisabled && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <>
          {icon && <Icon name={icon} size={16} color={v.fg} />}
          <Text style={[styles.btnText, { color: v.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
});

/* -------------------------------------------------------------------------- */
/*  Tag (curriculum) + Pill                                                    */
/* -------------------------------------------------------------------------- */
export const Tag = memo(function Tag({ curriculum, style }: { curriculum: Curriculum; style?: StyleProp<ViewStyle> }) {
  const c = curriculumColor[curriculum];
  return (
    <View style={[styles.tag, { backgroundColor: c.bg }, style]}>
      <View style={[styles.tagDot, { backgroundColor: c.fg }]} />
      <Text style={[styles.tagText, { color: c.fg }]}>{curriculum}</Text>
    </View>
  );
});

type PillTone = 'default' | 'ok' | 'warn';
const PILL: Record<PillTone, { bg: string; fg: string }> = {
  default: { bg: colors.parchment, fg: colors.slate },
  ok: { bg: colors.okBg, fg: colors.ok },
  warn: { bg: colors.warnBg, fg: colors.warn },
};
export const Pill = memo(function Pill({ label, tone = 'default' }: { label: string; tone?: PillTone }) {
  const p = PILL[tone];
  return (
    <View style={[styles.pill, { backgroundColor: p.bg }]}>
      <Text style={[styles.pillText, { color: p.fg }]}>{label}</Text>
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*  ProgressBar                                                                */
/* -------------------------------------------------------------------------- */
export const ProgressBar = memo(function ProgressBar({ pct, height = 7 }: { pct: number; height?: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View
      style={[styles.barTrack, { height, borderRadius: height }]}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: clamped, min: 0, max: 100 }}
    >
      <View style={[styles.barFill, { width: `${clamped}%`, borderRadius: height }]} />
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*  Card / Avatar / SectionTitle                                               */
/* -------------------------------------------------------------------------- */
export const Card = memo(function Card({
  children,
  style,
  padded,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return <View style={[styles.card, padded && { padding: space.lg }, style]}>{children}</View>;
});

export const Avatar = memo(function Avatar({
  initials,
  bg,
  size = 46,
  textStyle,
}: {
  initials: string;
  bg: string;
  size?: number;
  textStyle?: TextStyle;
}) {
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg }]}>
      <Text style={[displayText({ fontWeight: '600' }), { color: '#FFFFFF', fontSize: size * 0.38 }, textStyle]}>
        {initials}
      </Text>
    </View>
  );
});

export function SectionTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={[displayText({ fontWeight: '500' }), styles.sectionTitleText]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  StatCard                                                                   */
/* -------------------------------------------------------------------------- */
export const StatCard = memo(function StatCard({
  value,
  label,
  icon,
  trend,
}: {
  value: string;
  label: string;
  icon?: IconName;
  trend?: string;
}) {
  return (
    <View style={styles.stat}>
      {icon && (
        <View style={styles.statIcon}>
          <Icon name={icon} size={18} color={colors.navy700} />
        </View>
      )}
      <Text style={[displayText({ fontWeight: '600' }), styles.statValue]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && <Text style={styles.statTrend}>▲ {trend}</Text>}
    </View>
  );
});

/* -------------------------------------------------------------------------- */
/*  Loading / Error / Empty state views                                        */
/* -------------------------------------------------------------------------- */
export function LoadingView({ label = 'Đang tải…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={styles.stateText}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.center}>
      <Icon name="bell" size={28} color={colors.warn} />
      <Text style={[styles.stateText, { marginBottom: space.lg }]}>{message}</Text>
      <AppButton label="Thử lại" onPress={onRetry} variant="ghost" icon="arrowRight" />
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  btnText: { fontSize: 13.5, fontWeight: '600' },

  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: radius.pill },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  tagText: { fontSize: 11, fontWeight: '600' },

  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '600' },

  barTrack: { backgroundColor: colors.parchment, overflow: 'hidden', width: '100%' },
  barFill: { height: '100%', backgroundColor: colors.gold },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, ...shadow.card },

  avatar: { alignItems: 'center', justifyContent: 'center' },

  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: space.xxl, marginBottom: space.md },
  sectionTitleText: { fontSize: 18, color: colors.ink },
  sectionAction: { fontSize: 13, fontWeight: '600', color: colors.navy700 },

  stat: { flexBasis: '48%', flexGrow: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: space.lg, ...shadow.card },
  statIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.parchment, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 23, color: colors.ink },
  statLabel: { fontSize: 12, color: colors.slate, marginTop: 5 },
  statTrend: { fontSize: 11, fontWeight: '600', color: colors.ok, marginTop: 7 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xxl, minHeight: 240 },
  stateText: { marginTop: space.md, fontSize: 14, color: colors.slate, textAlign: 'center' },
});
