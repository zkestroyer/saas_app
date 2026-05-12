import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Badge } from '../../src/components/ui/badge';
import { HapticPress } from '../../src/components/ui/haptic-press';

const INVOICES = [
  { id: 'INV-001', device: 'iPhone 15 Pro', total: 189.99, status: 'paid', date: 'May 10, 2026' },
  { id: 'INV-002', device: 'Samsung Galaxy S24', total: 79.50, status: 'draft', date: 'May 8, 2026' },
  { id: 'INV-003', device: 'iPad Air', total: 249.00, status: 'quoted', date: 'May 5, 2026' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  paid: { label: 'Paid', variant: 'success' },
  draft: { label: 'Draft', variant: 'neutral' },
  quoted: { label: 'Quoted', variant: 'info' },
  approved: { label: 'Approved', variant: 'warning' },
};

/** Invoice list for customer. */
export default function InvoicesScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.h1, styles.title]}>Invoices</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>
              Your repair billing history
            </Text>
          </Animated.View>

          {INVOICES.map((inv, i) => {
            const badge = STATUS_MAP[inv.status] ?? STATUS_MAP.draft;
            return (
              <Animated.View key={inv.id} entering={FadeInDown.delay(200 + i * 100).springify()}>
                <HapticPress testID={`invoice-${inv.id}`}>
                  <GlassView style={styles.card}>
                    <View style={styles.cardTop}>
                      <View>
                        <Text style={[Typography.overline, { color: Colors.textMuted }]}>{inv.id}</Text>
                        <Text style={[Typography.h4, { color: Colors.textPrimary }]}>{inv.device}</Text>
                      </View>
                      <Badge label={badge.label} variant={badge.variant} />
                    </View>
                    <View style={styles.cardBottom}>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>{inv.date}</Text>
                      <Text style={[Typography.h3, { color: Colors.customer.accent }]}>
                        ${inv.total.toFixed(2)}
                      </Text>
                    </View>
                  </GlassView>
                </HapticPress>
              </Animated.View>
            );
          })}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.l },
  title: { color: Colors.textPrimary },
  sub: { color: Colors.textSecondary, marginBottom: Spacing.l },
  card: { padding: Spacing.m, marginBottom: Spacing.m },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Spacing.m,
  },
  cardBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: Spacing.s,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
