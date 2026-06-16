import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, displayText, radius, shadow, space } from '../theme/tokens';
import { Icon, SealBackdrop } from '../components/Icon';
import { Card, ErrorView, LoadingView, Pill, SectionTitle } from '../components/ui';
import { formatVND, formatVNDShort, tutorApi } from '../data/mockData';
import type { EarningsData, Payment } from '../types/models';

const CHART_HEIGHT = 132;

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<EarningsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setData(null);
    try {
      setData(await tutorApi.getEarnings());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu thu nhập.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxAmount = useMemo(() => (data ? Math.max(...data.monthlySeries.map((m) => m.amount)) : 1), [data]);

  if (error) return <ErrorView message={error} onRetry={load} />;
  if (!data) return <LoadingView />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingHorizontal: space.lg, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + 96 }}
    >
      <Text style={[displayText({ fontWeight: '500' }), styles.title]}>Thu nhập</Text>
      <Text style={styles.sub}>{data.monthLabel}</Text>

      {/* Summary hero */}
      <View style={[styles.hero, shadow.hero]}>
        <SealBackdrop size={190} style={styles.heroSeal} />
        <Text style={styles.heroLabel}>TỔNG THU NHẬP THÁNG NÀY</Text>
        <Text style={[displayText({ fontWeight: '600' }), styles.heroValue]}>{formatVND(data.total)}</Text>
        <View style={styles.heroGrid}>
          <View style={styles.heroCell}>
            <Text style={styles.heroCellV}>{formatVNDShort(data.paid)}</Text>
            <Text style={styles.heroCellK}>Đã nhận</Text>
          </View>
          <View style={[styles.heroCell, styles.heroCellMid]}>
            <Text style={styles.heroCellV}>{formatVNDShort(data.pending)}</Text>
            <Text style={styles.heroCellK}>Chờ thanh toán</Text>
          </View>
          <View style={styles.heroCell}>
            <Text style={styles.heroCellV}>{data.sessions}</Text>
            <Text style={styles.heroCellK}>Buổi đã dạy</Text>
          </View>
        </View>
      </View>

      {/* Chart */}
      <SectionTitle title="6 tháng gần nhất" />
      <Card padded>
        <View style={styles.chart}>
          {data.monthlySeries.map((m, i) => {
            const isCurrent = i === data.monthlySeries.length - 1;
            const h = Math.max(6, Math.round((m.amount / maxAmount) * CHART_HEIGHT));
            return (
              <View key={m.label} style={styles.col}>
                <Text style={styles.colVal}>{formatVNDShort(m.amount)}</Text>
                <View style={[styles.bar, { height: h, backgroundColor: isCurrent ? colors.gold : colors.navy700 }]} />
                <Text style={[styles.colLabel, isCurrent && styles.colLabelCurrent]}>{m.label}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Payments */}
      <SectionTitle title="Lịch sử thanh toán" />
      <Card>
        {data.payments.map((p, i) => (
          <PaymentRow key={p.id} payment={p} last={i === data.payments.length - 1} />
        ))}
      </Card>
    </ScrollView>
  );
}

const PaymentRow = React.memo(function PaymentRow({ payment, last }: { payment: Payment; last: boolean }) {
  const paid = payment.status === 'paid';
  return (
    <View style={[styles.pay, !last && styles.payBorder]}>
      <View style={[styles.payIc, { backgroundColor: paid ? colors.okBg : colors.warnBg }]}>
        <Icon name={paid ? 'check' : 'clock'} size={17} color={paid ? colors.ok : colors.warn} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.payTitle} numberOfLines={1}>
          {payment.title}
        </Text>
        <Text style={styles.payDate}>{payment.dateLabel}</Text>
      </View>
      <View style={styles.payRight}>
        <Text style={[displayText({ fontWeight: '600' }), styles.payAmount]}>{formatVNDShort(payment.amount)}</Text>
        <Pill label={paid ? 'Đã nhận' : 'Chờ'} tone={paid ? 'ok' : 'warn'} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.beige },
  title: { fontSize: 25, color: colors.ink },
  sub: { marginTop: 5, fontSize: 13.5, color: colors.slate },

  hero: { marginTop: space.lg, borderRadius: radius.xl, padding: space.xl, backgroundColor: colors.navy, overflow: 'hidden' },
  heroSeal: { position: 'absolute', right: -45, top: -35 },
  heroLabel: { fontSize: 10.5, letterSpacing: 1.6, color: colors.gold, fontWeight: '700' },
  heroValue: { fontSize: 32, color: '#FBF7EE', marginTop: 8 },
  heroGrid: { flexDirection: 'row', marginTop: space.xl, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: space.lg },
  heroCell: { flex: 1, alignItems: 'center' },
  heroCellMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  heroCellV: { fontSize: 18, fontWeight: '700', color: colors.goldSoft },
  heroCellK: { fontSize: 11, color: '#AEB6C4', marginTop: 4, textAlign: 'center' },

  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: CHART_HEIGHT + 40 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 7 },
  colVal: { fontSize: 9.5, fontWeight: '600', color: colors.slate },
  bar: { width: '64%', maxWidth: 30, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  colLabel: { fontSize: 11, color: colors.slate2 },
  colLabelCurrent: { color: colors.ink, fontWeight: '700' },

  pay: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: space.lg },
  payBorder: { borderBottomWidth: 1, borderBottomColor: colors.line2 },
  payIc: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  payTitle: { fontWeight: '600', fontSize: 13.5, color: colors.ink },
  payDate: { fontSize: 11.5, color: colors.slate2, marginTop: 3 },
  payRight: { alignItems: 'flex-end', gap: 5 },
  payAmount: { fontSize: 15, color: colors.ink },
});
