import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { StatCard } from '../../src/components/ui/stat-card';
import { useAuthStore } from '../../src/stores/auth-store';

/** Tenant business analytics dashboard. */
export default function TenantDashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0515', '#12082A', '#1A2234']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.overline, { color: Colors.tenant.accent }]}>
              BUSINESS DASHBOARD
            </Text>
            <Text style={[Typography.h1, styles.name]}>
              {user?.name ?? 'Business Owner'}
            </Text>
          </Animated.View>

          {/* Revenue Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <LinearGradient
              colors={Colors.tenant.gradient as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.revenueCard}
            >
              <Text style={[Typography.overline, { color: 'rgba(255,255,255,0.7)' }]}>
                MONTHLY REVENUE
              </Text>
              <Text style={[Typography.h1, { color: Colors.white, fontSize: 40 }]}>
                $12,847
              </Text>
              <Text style={[Typography.bodySmall, { color: 'rgba(255,255,255,0.7)' }]}>
                ↑ 18.5% from last month
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Active Jobs"
              value="23"
              icon={<Text style={{ fontSize: 18 }}>🔧</Text>}
              change={5.2}
              delay={300}
            />
            <StatCard
              title="Technicians"
              value="8"
              icon={<Text style={{ fontSize: 18 }}>👥</Text>}
              delay={400}
            />
            <StatCard
              title="Avg. Rating"
              value="4.8"
              icon={<Text style={{ fontSize: 18 }}>⭐</Text>}
              change={2.1}
              delay={500}
            />
            <StatCard
              title="Completion"
              value="94%"
              icon={<Text style={{ fontSize: 18 }}>✅</Text>}
              change={3.7}
              delay={600}
            />
          </View>

          {/* Revenue Breakdown */}
          <Animated.View entering={FadeInDown.delay(700).springify()}>
            <GlassView style={styles.breakdownCard} borderColor={`${Colors.tenant.primary}33`}>
              <Text style={[Typography.h4, { color: Colors.textPrimary, marginBottom: Spacing.m }]}>
                Revenue Breakdown
              </Text>
              {[
                { label: 'Screen Repairs', value: '$5,420', pct: 42 },
                { label: 'Battery Services', value: '$3,210', pct: 25 },
                { label: 'Software Fixes', value: '$2,160', pct: 17 },
                { label: 'Other Repairs', value: '$2,057', pct: 16 },
              ].map((item, i) => (
                <View key={item.label} style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <Text style={[Typography.bodySmall, { color: Colors.textPrimary }]}>
                      {item.label}
                    </Text>
                    <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                      {item.value}
                    </Text>
                  </View>
                  <View style={styles.barBg}>
                    <Animated.View
                      entering={FadeInDown.delay(800 + i * 100).springify()}
                      style={[styles.barFill, { width: `${item.pct}%` }]}
                    />
                  </View>
                  <Text style={[Typography.caption, { color: Colors.tenant.accent, width: 35 }]}>
                    {item.pct}%
                  </Text>
                </View>
              ))}
            </GlassView>
          </Animated.View>

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
  name: { color: Colors.textPrimary, marginBottom: Spacing.l },
  revenueCard: {
    padding: Spacing.l, borderRadius: 20, marginBottom: Spacing.l,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.m,
    marginBottom: Spacing.l,
  },
  breakdownCard: { padding: Spacing.l },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.m, marginBottom: Spacing.m,
  },
  breakdownLabel: { width: 120 },
  barBg: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: Colors.surfaceElevated,
  },
  barFill: {
    height: 6, borderRadius: 3,
    backgroundColor: Colors.tenant.primary,
  },
});
