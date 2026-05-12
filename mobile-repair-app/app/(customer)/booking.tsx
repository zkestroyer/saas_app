import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Input } from '../../src/components/ui/input';
import { Button } from '../../src/components/ui/button';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { IssueCategory, ServiceType } from '../../src/types';

const STEPS = ['Device', 'Issue', 'Details', 'Service'] as const;

const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Other'];
const BRAND_INITIALS: Record<string, { letter: string; bg: string }> = {
  Apple: { letter: 'A', bg: '#333' },
  Samsung: { letter: 'S', bg: '#1428A0' },
  Google: { letter: 'G', bg: '#4285F4' },
  OnePlus: { letter: '1+', bg: '#F5010C' },
  Xiaomi: { letter: 'Mi', bg: '#FF6900' },
  Huawei: { letter: 'Hw', bg: '#CF0A2C' },
  Other: { letter: '?', bg: '#555' },
};

const ISSUE_CATEGORIES = [
  { key: IssueCategory.SCREEN, label: 'Cracked Screen', emoji: '💔' },
  { key: IssueCategory.BATTERY, label: 'Battery Issue', emoji: '🔋' },
  { key: IssueCategory.SOFTWARE, label: 'Software Bug', emoji: '🐛' },
  { key: IssueCategory.CHARGING, label: 'Charging Port', emoji: '🔌' },
  { key: IssueCategory.CAMERA, label: 'Camera Problem', emoji: '📷' },
  { key: IssueCategory.SPEAKER, label: 'Speaker/Mic', emoji: '🔊' },
  { key: IssueCategory.WATER_DAMAGE, label: 'Water Damage', emoji: '💧' },
  { key: IssueCategory.OTHER, label: 'Other', emoji: '❓' },
];

/** Multi-step booking form with layout transitions. */
export default function BookingScreen() {
  const [step, setStep] = useState(0);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState<IssueCategory | null>(null);
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const canNext = () => {
    switch (step) {
      case 0: return brand !== '' && model !== '';
      case 1: return issue !== null;
      case 2: return description.length > 10;
      case 3: return serviceType !== null && (serviceType === ServiceType.STORE_DROPOFF || address.length > 5);
      default: return false;
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      /* Submit booking — in production: insert into Supabase jobs table. */
      router.replace('/(customer)');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <HapticPress onPress={() => step > 0 ? setStep(step - 1) : router.back()}>
            <Text style={styles.backBtn}>← Back</Text>
          </HapticPress>
          <Text style={[Typography.h3, styles.headerTitle]}>Book Repair</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Step Indicator */}
        <View style={styles.stepRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  i <= step && { backgroundColor: Colors.customer.primary },
                  i < step && { backgroundColor: Colors.success },
                ]}
              >
                <Text style={styles.stepNum}>
                  {i < step ? '✓' : i + 1}
                </Text>
              </View>
              <Text style={[Typography.caption, { color: i <= step ? Colors.textPrimary : Colors.textMuted }]}>
                {s}
              </Text>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, i < step && { backgroundColor: Colors.success }]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Step 0: Device */}
          {step === 0 && (
            <Animated.View entering={FadeInDown.springify()} layout={Layout.springify()} key="step0">
              <Text style={[Typography.h2, styles.stepTitle]}>What device?</Text>
              <Text style={[Typography.bodySmall, styles.stepSub]}>Select brand & enter model</Text>

              <View style={styles.brandGrid}>
                {BRANDS.map((b) => (
                  <HapticPress key={b} onPress={() => setBrand(b)} testID={`brand-${b}`}>
                    <GlassView
                      style={[styles.brandCard, brand === b && styles.brandSelected]}
                      borderColor={brand === b ? Colors.customer.primary : Colors.border}
                    >
                      <View style={[styles.brandIcon, { backgroundColor: BRAND_INITIALS[b]?.bg ?? '#555' }]}>
                        <Text style={styles.brandInitial}>{BRAND_INITIALS[b]?.letter ?? b[0]}</Text>
                      </View>
                      <Text style={[Typography.caption, { color: brand === b ? Colors.customer.accent : Colors.textSecondary }]}>
                        {b}
                      </Text>
                    </GlassView>
                  </HapticPress>
                ))}
              </View>

              {brand !== '' && (
                <Animated.View entering={FadeInUp.springify()}>
                  <Input
                    label="Device Model"
                    placeholder={`e.g. ${brand === 'Apple' ? 'iPhone 15 Pro' : 'Galaxy S24'}`}
                    value={model}
                    onChangeText={setModel}
                    testID="device-model"
                    containerStyle={{ marginTop: Spacing.m }}
                  />
                </Animated.View>
              )}
            </Animated.View>
          )}

          {/* Step 1: Issue */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} key="step1">
              <Text style={[Typography.h2, styles.stepTitle]}>What's the issue?</Text>
              <Text style={[Typography.bodySmall, styles.stepSub]}>Select the problem category</Text>

              <View style={styles.issueGrid}>
                {ISSUE_CATEGORIES.map((cat) => (
                  <HapticPress key={cat.key} onPress={() => setIssue(cat.key)} testID={`issue-${cat.key}`}>
                    <GlassView
                      style={[styles.issueCard, issue === cat.key && styles.issueSelected]}
                      borderColor={issue === cat.key ? Colors.customer.primary : Colors.border}
                    >
                      <Text style={styles.issueEmoji}>{cat.emoji}</Text>
                      <Text style={[Typography.caption, {
                        color: issue === cat.key ? Colors.customer.accent : Colors.textSecondary,
                        textAlign: 'center',
                      }]}>
                        {cat.label}
                      </Text>
                    </GlassView>
                  </HapticPress>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <Animated.View entering={FadeInDown.springify()} key="step2">
              <Text style={[Typography.h2, styles.stepTitle]}>Describe the problem</Text>
              <Text style={[Typography.bodySmall, styles.stepSub]}>Help our technician prepare</Text>

              <Input
                label="Description"
                placeholder="Tell us what happened..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
                style={{ minHeight: 120, textAlignVertical: 'top' }}
                testID="issue-description"
              />

              <HapticPress style={styles.photoButton} onPress={async () => {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Permission needed', 'Please allow photo access to upload damage images.');
                  return;
                }
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ['images'],
                  allowsMultipleSelection: true,
                  quality: 0.7,
                  selectionLimit: 4,
                });
                if (!result.canceled && result.assets) {
                  setPhotos(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 4));
                }
              }}>
                <GlassView style={styles.photoCard}>
                  <Text style={{ fontSize: 28 }}>📷</Text>
                  <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                    {photos.length > 0 ? `${photos.length} photo(s) added — tap to add more` : 'Tap to add photos of damage'}
                  </Text>
                </GlassView>
              </HapticPress>

              {photos.length > 0 && (
                <View style={styles.photoRow}>
                  {photos.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumb}>
                      <Image source={{ uri }} style={styles.photoImg} />
                      <Pressable
                        style={styles.photoRemove}
                        onPress={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                      >
                        <Text style={{ color: '#fff', fontSize: 12 }}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </Animated.View>
          )}

          {/* Step 3: Service Type */}
          {step === 3 && (
            <Animated.View entering={FadeInDown.springify()} key="step3">
              <Text style={[Typography.h2, styles.stepTitle]}>How should we fix it?</Text>
              <Text style={[Typography.bodySmall, styles.stepSub]}>Choose your service type</Text>

              <HapticPress onPress={() => setServiceType(ServiceType.HOME_VISIT)} testID="service-home-visit">
                <GlassView
                  style={[styles.serviceCard, serviceType === ServiceType.HOME_VISIT && styles.serviceSelected]}
                  borderColor={serviceType === ServiceType.HOME_VISIT ? Colors.customer.primary : Colors.border}
                >
                  <Text style={{ fontSize: 36 }}>🏠</Text>
                  <View style={styles.serviceText}>
                    <Text style={[Typography.h4, { color: Colors.textPrimary }]}>Home Visit</Text>
                    <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                      Technician comes to your location
                    </Text>
                  </View>
                </GlassView>
              </HapticPress>

              <HapticPress onPress={() => setServiceType(ServiceType.STORE_DROPOFF)} testID="service-store-dropoff">
                <GlassView
                  style={[styles.serviceCard, serviceType === ServiceType.STORE_DROPOFF && styles.serviceSelected]}
                  borderColor={serviceType === ServiceType.STORE_DROPOFF ? Colors.customer.primary : Colors.border}
                >
                  <Text style={{ fontSize: 36 }}>🏪</Text>
                  <View style={styles.serviceText}>
                    <Text style={[Typography.h4, { color: Colors.textPrimary }]}>Store Drop-off</Text>
                    <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                      Drop your device at our repair center
                    </Text>
                  </View>
                </GlassView>
              </HapticPress>

              {serviceType === ServiceType.HOME_VISIT && (
                <Animated.View entering={FadeInUp.springify()}>
                  <Input
                    label="Your Address"
                    placeholder="123 Main St, City, Country"
                    value={address}
                    onChangeText={setAddress}
                    containerStyle={{ marginTop: Spacing.m }}
                    testID="home-visit-address"
                  />
                </Animated.View>
              )}
            </Animated.View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <Button
            label={step === STEPS.length - 1 ? 'Submit Booking ✨' : 'Continue'}
            onPress={handleNext}
            fullWidth
            disabled={!canNext()}
            testID="booking-next"
          />
        </View>
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
  backBtn: { color: Colors.customer.accent, fontSize: 16, fontFamily: 'Inter_500Medium' },
  headerTitle: { color: Colors.textPrimary },
  stepRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: Spacing.l, paddingBottom: Spacing.m,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center',
    justifyContent: 'center', marginBottom: 4,
  },
  stepNum: { color: Colors.white, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  stepLine: {
    position: 'absolute', top: 14, left: '60%', right: '-40%',
    height: 2, backgroundColor: Colors.border,
  },
  scroll: { paddingHorizontal: Spacing.l },
  stepTitle: { color: Colors.textPrimary, marginBottom: Spacing.xxs },
  stepSub: { color: Colors.textSecondary, marginBottom: Spacing.l },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s },
  brandCard: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', padding: Spacing.s },
  brandSelected: { backgroundColor: Colors.customer.surface },
  brandIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  brandInitial: { fontSize: 14, fontFamily: 'Inter_700Bold', color: '#FFFFFF' },
  issueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s },
  issueCard: { width: '47%' as any, padding: Spacing.m, alignItems: 'center', gap: Spacing.s },
  issueSelected: { backgroundColor: Colors.customer.surface },
  issueEmoji: { fontSize: 32 },
  photoButton: { marginTop: Spacing.l },
  photoCard: { padding: Spacing.l, alignItems: 'center', gap: Spacing.s },
  serviceCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.l,
    gap: Spacing.m, marginBottom: Spacing.m,
  },
  serviceSelected: { backgroundColor: Colors.customer.surface },
  serviceText: { flex: 1 },
  bottomBar: {
    padding: Spacing.l, paddingBottom: 90,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  photoRow: {
    flexDirection: 'row', gap: Spacing.s, marginTop: Spacing.m, flexWrap: 'wrap',
  },
  photoThumb: {
    width: 72, height: 72, borderRadius: Radius.s, overflow: 'hidden', position: 'relative',
  },
  photoImg: {
    width: '100%', height: '100%',
  },
  photoRemove: {
    position: 'absolute', top: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
});
