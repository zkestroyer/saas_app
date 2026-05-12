import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../../src/theme';
import { GlassView } from '../../../src/components/ui/glass-view';
import { Badge } from '../../../src/components/ui/badge';

const TIMELINE = [
  { step: 'Booking Received', time: '2:00 PM', done: true, emoji: '📋' },
  { step: 'Technician Assigned', time: '2:15 PM', done: true, emoji: '🔧' },
  { step: 'En Route to You', time: '2:30 PM', done: true, emoji: '🚗' },
  { step: 'Diagnosing Device', time: '3:00 PM', done: true, emoji: '🔍' },
  { step: 'Repairing', time: '3:30 PM', done: false, active: true, emoji: '⚡' },
  { step: 'Completed', time: '—', done: false, emoji: '✅' },
];

/** Live repair tracking screen with pulse animation and progress timeline. */
export default function TrackRepair() {
  const { id } = useLocalSearchParams<{ id: string }>();

  /* Pulse animation for the active step's location dot. */
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) }),
      ),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1000 }),
        withTiming(0.6, { duration: 1000 }),
      ),
      -1,
    );
  }, [pulseScale, pulseOpacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.overline, { color: Colors.customer.accent }]}>
              TRACKING • #{id ?? '001'}
            </Text>
            <Text style={[Typography.h1, styles.title]}>iPhone 15 Pro</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>Screen Replacement</Text>
          </Animated.View>

          {/* Status Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassView style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <Badge label="In Progress" variant="info" />
                <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                  Est. 45 min remaining
                </Text>
              </View>

              {/* Live Indicator */}
              <View style={styles.liveRow}>
                <View style={styles.liveDotWrap}>
                  <Animated.View style={[styles.pulseBg, pulseStyle]} />
                  <View style={styles.liveDot} />
                </View>
                <Text style={[Typography.bodySmall, { color: Colors.textPrimary }]}>
                  Technician Alex K. is repairing your device
                </Text>
              </View>
            </GlassView>
          </Animated.View>

          {/* Timeline */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Repair Progress</Text>

            {TIMELINE.map((item, i) => (
              <View key={item.step} style={styles.timelineItem}>
                {/* Vertical line */}
                {i < TIMELINE.length - 1 && (
                  <View style={[styles.timelineLine, item.done && styles.timelineLineDone]} />
                )}
                {/* Dot */}
                <View style={[
                  styles.timelineDot,
                  item.done && styles.timelineDotDone,
                  (item as any).active && styles.timelineDotActive,
                ]}>
                  <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
                </View>
                {/* Content */}
                <View style={styles.timelineContent}>
                  <Text style={[
                    Typography.body,
                    { color: item.done || (item as any).active ? Colors.textPrimary : Colors.textMuted },
                  ]}>
                    {item.step}
                  </Text>
                  <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                    {item.time}
                  </Text>
                </View>
              </View>
            ))}
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
  title: { color: Colors.textPrimary, marginTop: Spacing.s },
  sub: { color: Colors.textSecondary, marginBottom: Spacing.l },
  statusCard: { padding: Spacing.l, marginBottom: Spacing.l },
  statusHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.m,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m },
  liveDotWrap: {
    width: 24, height: 24, alignItems: 'center', justifyContent: 'center',
  },
  pulseBg: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.success,
  },
  liveDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success,
  },
  sectionTitle: { color: Colors.textPrimary, marginBottom: Spacing.l },
  timelineItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.m, marginBottom: Spacing.l, position: 'relative',
  },
  timelineLine: {
    position: 'absolute', left: 17, top: 36, width: 2,
    height: 32, backgroundColor: Colors.border,
  },
  timelineLineDone: { backgroundColor: Colors.success },
  timelineDot: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center',
    justifyContent: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  timelineDotDone: { borderColor: Colors.success, backgroundColor: Colors.successLight },
  timelineDotActive: {
    borderColor: Colors.customer.primary, backgroundColor: Colors.customer.surface,
    shadowColor: Colors.customer.accent, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8, elevation: 4,
  },
  timelineContent: { flex: 1 },
});
