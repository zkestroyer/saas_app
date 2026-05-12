import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Badge } from '../../src/components/ui/badge';

const JOBS = [
  { id: 'J-101', device: 'iPhone 15 Pro', customer: 'Sarah M.', tech: 'Alex K.', status: 'repairing', amount: '$189' },
  { id: 'J-102', device: 'Galaxy S24', customer: 'Mike R.', tech: 'Maria S.', status: 'en_route', amount: '$79' },
  { id: 'J-103', device: 'Pixel 8', customer: 'Lisa K.', tech: 'James R.', status: 'diagnosing', amount: '$—' },
  { id: 'J-104', device: 'iPad Air', customer: 'Tom H.', tech: 'Priya M.', status: 'completed', amount: '$249' },
  { id: 'J-105', device: 'OnePlus 12', customer: 'Anna L.', tech: null, status: 'pending', amount: '$—' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  assigned: { label: 'Assigned', variant: 'info' },
  en_route: { label: 'En Route', variant: 'info' },
  diagnosing: { label: 'Diagnosing', variant: 'warning' },
  repairing: { label: 'Repairing', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
};

/** Jobs overview for tenant/owner. */
export default function JobsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0515', '#12082A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.h1, styles.title]}>All Jobs</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>
              {JOBS.length} total • {JOBS.filter((j) => j.status !== 'completed').length} active
            </Text>
          </Animated.View>

          {JOBS.map((job, i) => {
            const badge = STATUS_MAP[job.status] ?? STATUS_MAP.pending;
            return (
              <Animated.View key={job.id} entering={FadeInDown.delay(200 + i * 80).springify()}>
                <GlassView style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={[Typography.overline, { color: Colors.textMuted }]}>{job.id}</Text>
                    <Badge label={badge.label} variant={badge.variant} size="sm" />
                  </View>
                  <Text style={[Typography.h4, { color: Colors.textPrimary }]}>{job.device}</Text>
                  <View style={styles.cardMeta}>
                    <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                      👤 {job.customer}
                    </Text>
                    <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                      🔧 {job.tech ?? 'Unassigned'}
                    </Text>
                    <Text style={[Typography.h4, { color: Colors.tenant.accent }]}>
                      {job.amount}
                    </Text>
                  </View>
                </GlassView>
              </Animated.View>
            );
          })}

          <View style={{ height: 80 }} />
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
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.xs,
  },
  cardMeta: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: Spacing.s,
    paddingTop: Spacing.s, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
