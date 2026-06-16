import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { brand, brandFonts, hotline, supportEmail } from '../theme/brand';
import { useAuth, type Role } from '../app/AuthContext';

/**
 * Single entry point for the whole platform. The person chooses their space —
 * Học viên or Gia sư — and the root navigator mounts the matching module.
 */
type RoleCard = {
  role: Role;
  title: string;
  desc: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
};

const ROLES: RoleCard[] = [
  { role: 'student', title: 'Học viên', desc: 'Học tập, luyện đề và gia sư AI', icon: 'school', tint: brand.teal },
  { role: 'tutor', title: 'Gia sư', desc: 'Lớp học, lịch dạy và thu nhập', icon: 'person', tint: brand.goldDeep },
];

export default function RoleLoginScreen() {
  const { signIn } = useAuth();
  const [pending, setPending] = useState<Role | null>(null);

  const onPick = async (role: Role) => {
    if (pending) return;
    setPending(role);
    try {
      await signIn(role);
    } finally {
      setPending(null);
    }
  };

  return (
    <LinearGradient colors={[brand.navy700, brand.navy800, brand.navy900]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <LinearGradient colors={[brand.goldBright, brand.gold, brand.goldDeep]} style={styles.logo}>
              <Ionicons name="school" size={24} color={brand.white} />
            </LinearGradient>
            <View>
              <Text style={styles.brandName}>Times Edu</Text>
              <Text style={styles.brandSub}>OPERATING PLATFORM</Text>
            </View>
          </View>

          <Text style={styles.lead}>Một nền tảng,{'\n'}bốn vai trò.</Text>
          <Text style={styles.blurb}>
            Chương trình quốc tế IGCSE · A Level · IB · AP. Chọn không gian để bắt đầu.
          </Text>

          <View style={styles.cards}>
            {ROLES.map((r) => {
              const loading = pending === r.role;
              return (
                <Pressable
                  key={r.role}
                  onPress={() => onPick(r.role)}
                  disabled={!!pending}
                  accessibilityRole="button"
                  accessibilityLabel={`Đăng nhập với vai trò ${r.title}`}
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                >
                  <View style={[styles.cardIcon, { backgroundColor: r.tint }]}>
                    <Ionicons name={r.icon} size={22} color={brand.white} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{r.title}</Text>
                    <Text style={styles.cardDesc}>{r.desc}</Text>
                  </View>
                  {loading ? (
                    <ActivityIndicator color={brand.gold} />
                  ) : (
                    <Ionicons name="arrow-forward" size={20} color={brand.slate2} />
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footText}>Hỗ trợ {hotline}</Text>
            <Text style={styles.footDot}>·</Text>
            <Text style={styles.footText}>{supportEmail}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 26, gap: 4 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 30 },
  logo: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  brandName: { fontFamily: brandFonts.serifBold, color: brand.white, fontSize: 17 },
  brandSub: { color: '#C9D4E4', fontSize: 10, letterSpacing: 1.6, marginTop: 3, fontFamily: brandFonts.sansSemi },
  lead: { fontFamily: brandFonts.serifBold, color: brand.white, fontSize: 34, lineHeight: 39, letterSpacing: -0.5 },
  blurb: { color: '#C7D2E2', fontSize: 14.5, lineHeight: 22, marginTop: 12, marginBottom: 28, maxWidth: 320, fontFamily: brandFonts.sansRegular },
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: brand.paper,
    borderRadius: 18,
    padding: 16,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  cardIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: brandFonts.serifSemi, fontSize: 17, color: brand.ink },
  cardDesc: { fontFamily: brandFonts.sansRegular, fontSize: 12.5, color: brand.slate, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 28 },
  footText: { color: '#A9B6CB', fontSize: 12, fontFamily: brandFonts.sansMedium },
  footDot: { color: '#6E7C95' },
});
