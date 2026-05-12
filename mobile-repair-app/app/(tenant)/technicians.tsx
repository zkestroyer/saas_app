import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Badge } from '../../src/components/ui/badge';

const TECHNICIANS = [
  { id: '1', name: 'Alex K.', specialty: 'Screen & Display', rating: 4.9, jobs: 156, status: 'online' },
  { id: '2', name: 'Maria S.', specialty: 'Battery & Charging', rating: 4.7, jobs: 134, status: 'online' },
  { id: '3', name: 'James R.', specialty: 'Software & OS', rating: 4.8, jobs: 98, status: 'busy' },
  { id: '4', name: 'Priya M.', specialty: 'Water Damage', rating: 4.6, jobs: 87, status: 'offline' },
];

/** Technician management screen for tenant/owner. */
export default function TechniciansScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0515', '#12082A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.h1, styles.title]}>Technicians</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>Manage your repair team</Text>
          </Animated.View>

          {TECHNICIANS.map((tech, i) => (
            <Animated.View key={tech.id} entering={FadeInDown.delay(200 + i * 100).springify()}>
              <GlassView style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.avatar}>
                    <Text style={{ fontSize: 24 }}>👤</Text>
                  </View>
                  <View style={styles.info}>
                    <Text style={[Typography.h4, { color: Colors.textPrimary }]}>{tech.name}</Text>
                    <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>{tech.specialty}</Text>
                  </View>
                  <Badge
                    label={tech.status}
                    variant={tech.status === 'online' ? 'success' : tech.status === 'busy' ? 'warning' : 'neutral'}
                    size="sm"
                  />
                </View>
                <View style={styles.cardBottom}>
                  <View style={styles.statItem}>
                    <Text style={[Typography.caption, { color: Colors.textMuted }]}>Rating</Text>
                    <Text style={[Typography.h4, { color: Colors.tenant.accent }]}>⭐ {tech.rating}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[Typography.caption, { color: Colors.textMuted }]}>Total Jobs</Text>
                    <Text style={[Typography.h4, { color: Colors.textPrimary }]}>{tech.jobs}</Text>
                  </View>
                </View>
              </GlassView>
            </Animated.View>
          ))}

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
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m, marginBottom: Spacing.m },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  cardBottom: {
    flexDirection: 'row', gap: Spacing.xl,
    paddingTop: Spacing.s, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  statItem: { gap: 2 },
});
