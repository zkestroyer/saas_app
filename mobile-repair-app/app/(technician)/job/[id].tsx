import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '../../../src/theme';
import { GlassView } from '../../../src/components/ui/glass-view';
import { Button } from '../../../src/components/ui/button';
import { Badge } from '../../../src/components/ui/badge';
import { Input } from '../../../src/components/ui/input';
import { HapticPress } from '../../../src/components/ui/haptic-press';

/** Job detail + assessment screen with on-spot vs shop branching logic. */
export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [diagnosis, setDiagnosis] = useState('');
  const [repairPath, setRepairPath] = useState<'onspot' | 'shop' | null>(null);

  const handlePathSelect = (path: 'onspot' | 'shop') => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRepairPath(path);
  };

  const handleStartRepair = () => {
    if (repairPath === 'onspot') {
      router.push(`/(technician)/invoice/${id}`);
    } else {
      /* Generate receiving note flow */
      Alert.alert(
        'Device Receiving Note',
        'Receiving note generated. Device taken to shop for repair.',
        [{ text: 'OK', onPress: () => router.push(`/(technician)/invoice/${id}`) }],
      );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0D0A05', '#1A1508']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <HapticPress onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </HapticPress>
          <Text style={[Typography.h3, styles.headerTitle]}>Job #{id}</Text>
          <Badge label="Assigned" variant="warning" />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Device Info */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassView style={styles.infoCard} borderColor={`${Colors.technician.primary}33`}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📱</Text>
                <View style={styles.infoText}>
                  <Text style={[Typography.h3, { color: Colors.textPrimary }]}>iPhone 15 Pro</Text>
                  <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                    Screen Crack • Sarah M.
                  </Text>
                  <Text style={[Typography.caption, { color: Colors.textMuted, marginTop: 4 }]}>
                    📍 12 Oak Avenue, Downtown
                  </Text>
                </View>
              </View>
              <View style={styles.infoMeta}>
                <View style={styles.metaItem}>
                  <Text style={[Typography.caption, { color: Colors.textMuted }]}>PRIORITY</Text>
                  <Badge label="High" variant="danger" size="sm" />
                </View>
                <View style={styles.metaItem}>
                  <Text style={[Typography.caption, { color: Colors.textMuted }]}>SERVICE</Text>
                  <Badge label="Home Visit" variant="info" size="sm" />
                </View>
              </View>
            </GlassView>
          </Animated.View>

          {/* Diagnosis */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Assessment</Text>
            <Input
              label="Diagnosis Notes"
              placeholder="Describe the issue after inspection..."
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: 'top' }}
              testID="diagnosis-notes"
            />
          </Animated.View>

          {/* Repair Path Selection */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Repair Path</Text>
            <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginBottom: Spacing.m }]}>
              Choose how to proceed with this repair
            </Text>

            {/* Path A: On-Spot Fix */}
            <HapticPress
              onPress={() => handlePathSelect('onspot')}
              testID="path-onspot"
            >
              <GlassView
                style={[styles.pathCard, repairPath === 'onspot' && styles.pathSelected]}
                borderColor={repairPath === 'onspot' ? Colors.success : Colors.border}
              >
                <Text style={styles.pathEmoji}>⚡</Text>
                <View style={styles.pathText}>
                  <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                    Path A: On-Spot Fix
                  </Text>
                  <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                    Complete repair at customer's location. Generate invoice immediately.
                  </Text>
                </View>
                {repairPath === 'onspot' && <Text style={styles.checkmark}>✓</Text>}
              </GlassView>
            </HapticPress>

            {/* Path B: Shop Repair */}
            <HapticPress
              onPress={() => handlePathSelect('shop')}
              testID="path-shop"
            >
              <GlassView
                style={[styles.pathCard, repairPath === 'shop' && styles.pathSelected]}
                borderColor={repairPath === 'shop' ? Colors.technician.primary : Colors.border}
              >
                <Text style={styles.pathEmoji}>🏪</Text>
                <View style={styles.pathText}>
                  <Text style={[Typography.h4, { color: Colors.textPrimary }]}>
                    Path B: Shop Repair
                  </Text>
                  <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                    Take device to shop. Generate receiving note + invoice later.
                  </Text>
                </View>
                {repairPath === 'shop' && <Text style={styles.checkmark}>✓</Text>}
              </GlassView>
            </HapticPress>
          </Animated.View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>

        {/* Bottom Action */}
        {repairPath && (
          <Animated.View entering={FadeInDown.springify()} style={styles.bottomBar}>
            <Button
              label={repairPath === 'onspot' ? 'Start Repair & Invoice ⚡' : 'Generate Receiving Note 📋'}
              onPress={handleStartRepair}
              fullWidth
              testID="start-repair"
            />
          </Animated.View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Spacing.m,
  },
  backBtn: { color: Colors.technician.accent, fontSize: 16, fontFamily: 'Inter_500Medium' },
  headerTitle: { color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.l },
  infoCard: { padding: Spacing.l, marginBottom: Spacing.l },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.m, marginBottom: Spacing.m },
  infoEmoji: { fontSize: 40 },
  infoText: { flex: 1 },
  infoMeta: { flexDirection: 'row', gap: Spacing.l },
  metaItem: { gap: Spacing.xs },
  sectionTitle: { color: Colors.textPrimary, marginTop: Spacing.m, marginBottom: Spacing.m },
  pathCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.l,
    gap: Spacing.m, marginBottom: Spacing.m,
  },
  pathSelected: { backgroundColor: 'rgba(47, 179, 68, 0.05)' },
  pathEmoji: { fontSize: 36 },
  pathText: { flex: 1 },
  checkmark: { fontSize: 20, color: Colors.success },
  bottomBar: {
    padding: Spacing.l, paddingBottom: Spacing.xl,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
});
