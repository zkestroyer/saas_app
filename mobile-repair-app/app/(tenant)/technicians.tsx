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
import * as analyticsService from '../../src/services/analytics-service';

/** Technician management screen — fetches real data from Supabase. */
export default function TechniciansScreen() {
  const user = useAuthStore((s) => s.user);

  const { data: result, isLoading } = useQuery({
    queryKey: ['tenantTechnicians', user?.tenant_id],
    queryFn: () => analyticsService.getTenantTechnicians(user?.tenant_id ?? ''),
    enabled: !!user?.tenant_id,
  });

  const technicians = result?.data ?? [];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0515', '#12082A']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.h1, styles.title]}>Technicians</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>
              {technicians.length} team member{technicians.length !== 1 ? 's' : ''}
            </Text>
          </Animated.View>

          {isLoading ? (
            <ActivityIndicator color={Colors.tenant.primary} style={{ marginTop: 40 }} />
          ) : technicians.length === 0 ? (
            <GlassView style={styles.emptyCard}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.s }}>👥</Text>
              <Text style={[Typography.body, { color: Colors.textSecondary, textAlign: 'center' }]}>
                No technicians yet.{'\n'}Add team members to get started.
              </Text>
            </GlassView>
          ) : (
            technicians.map((tech: any, i: number) => (
              <Animated.View key={tech.id} entering={FadeInDown.delay(200 + i * 100).springify()}>
                <GlassView style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Text style={{ fontSize: 24 }}>
                        {tech.name?.charAt(0)?.toUpperCase() ?? '👤'}
                      </Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={[Typography.h4, { color: Colors.textPrimary }]}>{tech.name}</Text>
                      <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                        {tech.email}
                      </Text>
                    </View>
                    <Badge label="Active" variant="success" size="sm" />
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.statItem}>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>Phone</Text>
                      <Text style={[Typography.h4, { color: Colors.tenant.accent }]}>
                        {tech.phone || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[Typography.caption, { color: Colors.textMuted }]}>Joined</Text>
                      <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                        {new Date(tech.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </GlassView>
              </Animated.View>
            ))
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
