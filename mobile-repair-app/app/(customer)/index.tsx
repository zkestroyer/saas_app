import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Button } from '../../src/components/ui/button';
import { StatCard } from '../../src/components/ui/stat-card';
import { Badge } from '../../src/components/ui/badge';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { useAuthStore } from '../../src/stores/auth-store';
import { JobStatus } from '../../src/types';

/** Mock data for recent jobs. */
const MOCK_JOBS = [
  {
    id: '1',
    device: 'iPhone 15 Pro',
    issue: 'Screen Replacement',
    status: JobStatus.REPAIRING,
    date: '2 hours ago',
    technician: 'Alex K.',
  },
  {
    id: '2',
    device: 'Samsung Galaxy S24',
    issue: 'Battery Swap',
    status: JobStatus.COMPLETED,
    date: 'Yesterday',
    technician: 'Maria S.',
  },
  {
    id: '3',
    device: 'iPad Air',
    issue: 'Charging Port',
    status: JobStatus.PENDING,
    date: '3 days ago',
    technician: null,
  },
];

const STATUS_BADGE: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  [JobStatus.PENDING]: { label: 'Pending', variant: 'warning' },
  [JobStatus.ASSIGNED]: { label: 'Assigned', variant: 'info' },
  [JobStatus.EN_ROUTE]: { label: 'En Route', variant: 'info' },
  [JobStatus.DIAGNOSING]: { label: 'Diagnosing', variant: 'warning' },
  [JobStatus.REPAIRING]: { label: 'Repairing', variant: 'info' },
  [JobStatus.COMPLETED]: { label: 'Completed', variant: 'success' },
  [JobStatus.CANCELLED]: { label: 'Cancelled', variant: 'danger' },
};

/** Customer home dashboard with stats and recent repairs. */
export default function CustomerHome() {
  const user = useAuthStore((s) => s.user);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0E27', '#0F1535', '#111631']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.bodySmall, styles.greeting]}>
              Good {getTimeOfDay()} 👋
            </Text>
            <Text style={[Typography.h1, styles.name]}>
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
                <Text style={styles.heroEmoji}>🛠️</Text>
                <View style={styles.heroText}>
                  <Text style={[Typography.h3, { color: Colors.white }]}>
                    Book a Repair
                  </Text>
                  <Text style={[Typography.bodySmall, { color: 'rgba(255,255,255,0.8)' }]}>
                    Get your device fixed by certified pros
                  </Text>
                </View>
                <Text style={styles.heroArrow}>→</Text>
              </LinearGradient>
            </HapticPress>
          </Animated.View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatCard
              title="Active Repairs"
              value="1"
              icon={<Text style={{ fontSize: 18 }}>🔧</Text>}
              delay={300}
              testID="stat-active"
            />
            <StatCard
              title="Completed"
              value="12"
              icon={<Text style={{ fontSize: 18 }}>✅</Text>}
              change={8.3}
              delay={400}
              testID="stat-completed"
            />
          </View>

          {/* Recent Repairs */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Text style={[Typography.h3, styles.sectionTitle]}>
              Recent Repairs
            </Text>
          </Animated.View>

          {MOCK_JOBS.map((job, index) => {
            const badge = STATUS_BADGE[job.status] ?? STATUS_BADGE[JobStatus.PENDING];
            return (
              <Animated.View
                key={job.id}
                entering={FadeInRight.delay(600 + index * 100).springify()}
              >
                <HapticPress
                  onPress={() => router.push(`/(customer)/track/${job.id}`)}
                  testID={`job-card-${job.id}`}
                >
                  <GlassView style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <View>
                        <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                          {job.device}
                        </Text>
                        <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                          {job.issue}
                        </Text>
                      </View>
                      <Badge label={badge.label} variant={badge.variant} size="sm" />
                    </View>
                    <View style={styles.jobFooter}>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                        {job.technician ? `🔧 ${job.technician}` : '⏳ Awaiting assignment'}
                      </Text>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                        {job.date}
                      </Text>
                    </View>
                  </GlassView>
                </HapticPress>
              </Animated.View>
            );
          })}

          {/* Bottom spacer for floating tab bar */}
          <View style={{ height: 100 }} />
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
  scroll: { padding: Spacing.l },
  greeting: { color: Colors.textSecondary, marginBottom: Spacing.xxs },
  name: { color: Colors.textPrimary, marginBottom: Spacing.l },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.l,
    borderRadius: 20,
    marginBottom: Spacing.l,
  },
  heroEmoji: { fontSize: 36, marginRight: Spacing.m },
  heroText: { flex: 1 },
  heroArrow: { fontSize: 24, color: Colors.white, opacity: 0.7 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    marginBottom: Spacing.m,
  },
  jobCard: {
    padding: Spacing.m,
    marginBottom: Spacing.m,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.s,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.s,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
