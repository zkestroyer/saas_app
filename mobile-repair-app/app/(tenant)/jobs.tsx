import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Badge } from '../../src/components/ui/badge';
import { useAuthStore } from '../../src/stores/auth-store';
import * as jobService from '../../src/services/job-service';

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'neutral' }> = {
  pending: { label: 'Pending', variant: 'warning' },
  assigned: { label: 'Assigned', variant: 'info' },
  en_route: { label: 'En Route', variant: 'info' },
  diagnosing: { label: 'Diagnosing', variant: 'warning' },
  repairing: { label: 'Repairing', variant: 'info' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
};

/** Jobs overview for tenant/owner — fetches real data from Supabase. */
export default function JobsScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: result, isLoading } = useQuery({
    queryKey: ['tenantJobs', user?.tenant_id],
    queryFn: () => jobService.getTenantJobs(user?.tenant_id ?? ''),
    enabled: !!user?.tenant_id,
  });

  const jobs = result?.data ?? [];
  const activeCount = jobs.filter((j: any) => j.status !== 'completed' && j.status !== 'cancelled').length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0515', '#12082A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.h1, styles.title]}>All Jobs</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>
              {jobs.length} total • {activeCount} active
            </Text>
          </Animated.View>

          {isLoading ? (
            <ActivityIndicator color={Colors.tenant.primary} style={{ marginTop: 40 }} />
          ) : jobs.length === 0 ? (
            <GlassView style={styles.emptyCard}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.s }}>📋</Text>
              <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
                No jobs yet.{'\n'}Jobs will appear here as customers book repairs.
              </Text>
            </GlassView>
          ) : (
            jobs.map((job: any, i: number) => {
              const badge = STATUS_MAP[job.status] ?? STATUS_MAP.pending;
              return (
                <Animated.View key={job.id} entering={FadeInDown.delay(200 + i * 80).springify()}>
                  <GlassView style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={[Typography.overline, { color: Colors.textMuted }]}>
                        {job.id.slice(0, 8).toUpperCase()}
                      </Text>
                      <Badge label={badge.label} variant={badge.variant} size="sm" />
                    </View>
                    <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                      {job.device_brand} {job.device_model}
                    </Text>
                    <View style={styles.cardMeta}>
                      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                        👤 {job.customer?.name ?? 'Customer'}
                      </Text>
                      <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                        🔧 {job.technician?.name ?? 'Unassigned'}
                      </Text>
                      <Text style={[Typography.h4, { color: Colors.tenant.accent }]}>
                        {job.issue_category?.replace('_', ' ') ?? ''}
                      </Text>
                    </View>
                  </GlassView>
                </Animated.View>
              );
            })
          )}

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
  emptyCard: { padding: Spacing.xl, alignItems: 'center' },
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
