import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Badge } from '../../src/components/ui/badge';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { useAuthStore } from '../../src/stores/auth-store';
import * as invoiceService from '../../src/services/invoice-service';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'neutral' }> = {
  paid: { label: 'Paid', variant: 'success' },
  draft: { label: 'Draft', variant: 'neutral' },
  quoted: { label: 'Quoted', variant: 'info' },
  approved: { label: 'Approved', variant: 'warning' },
  cancelled: { label: 'Cancelled', variant: 'neutral' },
};

/** Invoice list for customer — fetches real data from Supabase. */
export default function InvoicesScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: result, isLoading } = useQuery({
    queryKey: ['customerInvoices', user?.id],
    queryFn: () => invoiceService.getCustomerInvoices(user?.id ?? ''),
    enabled: !!user?.id,
  });

  const invoices = result?.data ?? [];

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

          {isLoading ? (
            <ActivityIndicator color={Colors.customer.primary} style={{ marginTop: 40 }} />
          ) : invoices.length === 0 ? (
            <GlassView style={styles.emptyCard}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.s }}>📄</Text>
              <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
                No invoices yet.{'\n'}They will appear here after your repairs.
              </Text>
            </GlassView>
          ) : (
            invoices.map((inv: any, i: number) => {
              const badge = STATUS_MAP[inv.status] ?? STATUS_MAP.draft;
              const device = inv.job ? `${inv.job.device_brand} ${inv.job.device_model}` : 'Repair';
              return (
                <Animated.View key={inv.id} entering={FadeInDown.delay(200 + i * 100).springify()}>
                  <HapticPress testID={`invoice-${inv.id}`}>
                    <GlassView style={styles.card}>
                      <View style={styles.cardTop}>
                        <View>
                          <Text style={[Typography.overline, { color: Colors.textMuted }]}>
                            {inv.id.slice(0, 8).toUpperCase()}
                          </Text>
                          <Text style={[Typography.h4, { color: Colors.textPrimary }]}>{device}</Text>
                        </View>
                        <Badge label={badge.label} variant={badge.variant} />
                      </View>
                      <View style={styles.cardBottom}>
                        <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                          {new Date(inv.created_at).toLocaleDateString()}
                        </Text>
                        <Text style={[Typography.h3, { color: Colors.customer.accent }]}>
                          ${Number(inv.total).toFixed(2)}
                        </Text>
                      </View>
                    </GlassView>
                  </HapticPress>
                </Animated.View>
              );
            })
          )}

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
  emptyCard: { padding: Spacing.xl, alignItems: 'center' },
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
