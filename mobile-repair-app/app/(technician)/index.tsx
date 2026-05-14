import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { StatCard } from '../../src/components/ui/stat-card';
import { Badge } from '../../src/components/ui/badge';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { useAuthStore } from '../../src/stores/auth-store';
import * as jobService from '../../src/services/job-service';
import * as analyticsService from '../../src/services/analytics-service';
import { JobStatus } from '../../src/types';

/** Technician HUD Dashboard — real data from Supabase. */
export default function TechnicianDashboard() {
  const user = useAuthStore((s) => s.user);

  /* Fetch real jobs from Supabase */
  const { data: jobsResult, isLoading: jobsLoading } = useQuery({
    queryKey: ['technicianJobs', user?.id],
    queryFn: () => jobService.getTechnicianJobs(user?.id ?? ''),
    enabled: !!user?.id,
  });

  /* Fetch real stats */
  const { data: statsResult } = useQuery({
    queryKey: ['technicianStats', user?.id],
    queryFn: () => analyticsService.getTechnicianStats(user?.id ?? ''),
    enabled: !!user?.id,
  });

  const jobs = (jobsResult?.data ?? []).filter(
    (j: any) => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELLED,
  );
  const stats = statsResult?.data;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0A05', '#1A1508', '#1A2234']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* HUD Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
            <View>
              <Text style={[Typography.overline, { color: Colors.technician.accent }]}>
                TECHNICIAN HUD
              </Text>
              <Text style={[Typography.h2, styles.name]}>
                {user?.name ?? 'Technician'}
              </Text>
            </View>
            <View style={styles.statusIndicator}>
              <View style={styles.onlineDot} />
              <Text style={[Typography.caption, { color: Colors.success }]}>Online</Text>
            </View>
          </Animated.View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard
              title="Today's Jobs"
              value={String(stats?.todayJobs ?? 0)}
              icon={<Text style={{ fontSize: 18 }}>🔧</Text>}
              delay={200}
              testID="stat-today-jobs"
            />
            <StatCard
              title="Earnings"
              value={`$${stats?.todayEarnings ?? 0}`}
              icon={<Text style={{ fontSize: 18 }}>💰</Text>}
              delay={300}
              testID="stat-earnings"
            />
          </View>

          {/* Sparkline-like visual */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <GlassView style={styles.sparkContainer} borderColor={`${Colors.technician.primary}33`}>
              <Text style={[Typography.caption, { color: Colors.textSecondary }]}>
                WEEKLY REPAIR VOLUME
              </Text>
              <View style={styles.sparkRow}>
                {(stats?.weeklyVolume ?? [0, 0, 0, 0, 0, 0, 0]).map((val: number, i: number) => (
                  <View key={i} style={styles.sparkCol}>
                    <View
                      style={[
                        styles.sparkBar,
                        {
                          height: Math.max(val * 8, 4),
                          backgroundColor:
                            i === 6
                              ? Colors.technician.primary
                              : `${Colors.technician.primary}55`,
                        },
                      ]}
                    />
                    <Text style={styles.sparkLabel}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassView>
          </Animated.View>

          {/* Active Jobs */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.h3, { color: Colors.textPrimary }]}>Active Jobs</Text>
              <Badge label={`${jobs.length} active`} variant="warning" size="sm" />
            </View>
          </Animated.View>

          {jobsLoading ? (
            <ActivityIndicator color={Colors.technician.primary} style={{ marginTop: 20 }} />
          ) : jobs.length === 0 ? (
            <GlassView style={{ padding: Spacing.xl, alignItems: 'center' as const }}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.s }}>✅</Text>
              <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
                No active jobs.{"\n"}You're all caught up!
              </Text>
            </GlassView>
          ) : (
          jobs.map((job: any, i: number) => (
            <Animated.View key={job.id} entering={FadeInRight.delay(500 + i * 100).springify()}>
              <HapticPress
                onPress={() => router.push(`/(technician)/job/${job.id}`)}
                testID={`tech-job-${job.id}`}
              >
                <GlassView style={styles.jobCard} borderColor={`${Colors.technician.primary}33`}>
                  {/* Priority indicator bar */}
                  <View style={[styles.priorityBar, { backgroundColor: Colors.technician.primary }]} />
                  <View style={styles.jobContent}>
                    <View style={styles.jobTop}>
                      <View>
                        <Text style={[Typography.overline, { color: Colors.textMuted, fontSize: 10 }]}>
                          {job.id.slice(0, 8).toUpperCase()}
                        </Text>
                        <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                          {job.device_brand} {job.device_model}
                        </Text>
                        <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                          {job.issue_category?.replace('_', ' ') ?? ''} • {job.customer?.name ?? 'Customer'}
                        </Text>
                      </View>
                      <Badge
                        label={job.status.replace('_', ' ')}
                        variant={job.status === JobStatus.ASSIGNED ? 'warning' : 'info'}
                        size="sm"
                      />
                    </View>
                    <View style={styles.jobBottom}>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                        📍 {typeof job.location === 'object' ? job.location?.address ?? 'Location' : 'Location'}
                      </Text>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                        {new Date(job.updated_at ?? job.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </GlassView>
              </HapticPress>
            </Animated.View>
          )))}

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
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.l,
  },
  name: { color: Colors.textPrimary },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  statsRow: { flexDirection: 'row', gap: Spacing.m, marginBottom: Spacing.m },
  sparkContainer: { padding: Spacing.m, marginBottom: Spacing.l },
  sparkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: Spacing.m, height: 64 },
  sparkCol: { alignItems: 'center', flex: 1 },
  sparkBar: { width: 16, borderRadius: 4, marginBottom: 4 },
  sparkLabel: { fontSize: 10, color: Colors.textMuted, fontFamily: 'Inter_500Medium' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.m,
  },
  jobCard: { marginBottom: Spacing.m, overflow: 'hidden' },
  priorityBar: { height: 3, width: '100%' },
  jobContent: { padding: Spacing.m },
  jobTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Spacing.s,
  },
  jobBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingTop: Spacing.s, borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
