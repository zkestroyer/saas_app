import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Badge } from '../../src/components/ui/badge';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { useAuthStore } from '../../src/stores/auth-store';
import { useJobStore } from '../../src/stores/job-store';
import { JobStatus } from '../../src/types';

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  [JobStatus.PENDING]: { label: 'Pending', variant: 'warning' },
  [JobStatus.ASSIGNED]: { label: 'Assigned', variant: 'info' },
  [JobStatus.EN_ROUTE]: { label: 'En Route', variant: 'info' },
  [JobStatus.DIAGNOSING]: { label: 'Diagnosing', variant: 'warning' },
  [JobStatus.REPAIRING]: { label: 'Repairing', variant: 'info' },
  [JobStatus.COMPLETED]: { label: 'Completed', variant: 'success' },
  [JobStatus.CANCELLED]: { label: 'Cancelled', variant: 'danger' },
};

/** Customer home dashboard with live data from job store. */
export default function CustomerHome() {
  const user = useAuthStore((s) => s.user);
  const jobs = useJobStore((s) => s.jobs);

  const activeCount = jobs.filter(j => j.status !== JobStatus.COMPLETED && j.status !== JobStatus.CANCELLED).length;
  const completedCount = jobs.filter(j => j.status === JobStatus.COMPLETED).length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#0F1535', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.bodySmall, styles.greeting]}>
              Good {getTimeOfDay()} 👋
            </Text>
            <Text style={[Typography.h1, styles.name]} numberOfLines={1}>
              {user?.name ?? 'Customer'}
            </Text>
          </Animated.View>

          {/* Quick Action */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <HapticPress
              onPress={() => router.push('/(customer)/booking')}
              testID="quick-book-repair"
            >
              <LinearGradient
                colors={Colors.customer.gradient as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={styles.heroText}>
                  <Text style={[Typography.h3, { color: Colors.white }]}>Book a Repair</Text>
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400Regular', marginTop: 4 }}>
                    Get your device fixed by certified pros
                  </Text>
                </View>
                <Text style={styles.heroArrow}>→</Text>
              </LinearGradient>
            </HapticPress>
          </Animated.View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <GlassView style={styles.statBox}>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </GlassView>
            <GlassView style={styles.statBox}>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </GlassView>
            <GlassView style={styles.statBox}>
              <Text style={styles.statValue}>{jobs.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </GlassView>
          </View>

          {/* Recent Repairs */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Recent Repairs</Text>
          </Animated.View>

          {jobs.length === 0 ? (
            <GlassView style={styles.emptyCard}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.s }}>📱</Text>
              <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
                No repairs yet.{'\n'}Tap "Book a Repair" to get started!
              </Text>
            </GlassView>
          ) : (
            jobs.slice(0, 10).map((job, index) => {
              const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE[JobStatus.PENDING];
              return (
                <Animated.View
                  key={job.id}
                  entering={FadeInRight.delay(500 + index * 80).springify()}
                >
                  <HapticPress
                    onPress={() => router.push(`/(customer)/track/${job.id}`)}
                    testID={`job-card-${job.id}`}
                  >
                    <GlassView style={styles.jobCard}>
                      <View style={styles.jobHeader}>
                        <View style={{ flex: 1, marginRight: Spacing.s }}>
                          <Text style={styles.jobDevice} numberOfLines={1}>
                            {job.device_brand} {job.device_model}
                          </Text>
                          <Text style={styles.jobIssue} numberOfLines={1}>
                            {job.issue_category.replace('_', ' ')}
                          </Text>
                        </View>
                        <Badge label={badge.label} variant={badge.variant} size="sm" />
                      </View>
                      <View style={styles.jobFooter}>
                        <Text style={styles.jobMeta} numberOfLines={1}>
                          {job.technician_id ? 'Technician assigned' : 'Awaiting assignment'}
                        </Text>
                        <Text style={styles.jobMeta}>
                          {new Date(job.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </GlassView>
                  </HapticPress>
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

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.m },
  greeting: { color: Colors.textSecondary, marginBottom: Spacing.xxs },
  name: { color: Colors.textPrimary, marginBottom: Spacing.l },
  heroCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.l, borderRadius: 16, marginBottom: Spacing.l,
  },
  heroText: { flex: 1 },
  heroArrow: { fontSize: 24, color: Colors.white, opacity: 0.7 },
  statsRow: { flexDirection: 'row', gap: Spacing.s, marginBottom: Spacing.l },
  statBox: { flex: 1, padding: Spacing.m, alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: 'Inter_700Bold', color: Colors.textPrimary },
  statLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textMuted, marginTop: 4 },
  sectionTitle: { color: Colors.textPrimary, marginBottom: Spacing.m },
  emptyCard: { padding: Spacing.xl, alignItems: 'center' },
  jobCard: { padding: Spacing.m, marginBottom: Spacing.s },
  jobHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: Spacing.s,
  },
  jobDevice: { fontSize: 15, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary },
  jobIssue: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  jobFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: Spacing.s,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  jobMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted },
});
