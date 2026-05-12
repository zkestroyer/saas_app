import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Input } from '../../src/components/ui/input';
import { Button } from '../../src/components/ui/button';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { IssueCategory, ServiceType, JobStatus } from '../../src/types';
import { useAuthStore } from '../../src/stores/auth-store';
import { useJobStore } from '../../src/stores/job-store';

const STEPS = ['Device', 'Issue', 'Details', 'Service'] as const;

const BRANDS = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi', 'Huawei', 'Other'];

const ISSUE_CATEGORIES = [
  { key: IssueCategory.SCREEN, label: 'Cracked Screen', icon: 'SC' },
  { key: IssueCategory.BATTERY, label: 'Battery Issue', icon: 'BA' },
  { key: IssueCategory.SOFTWARE, label: 'Software Bug', icon: 'SW' },
  { key: IssueCategory.CHARGING, label: 'Charging Port', icon: 'CH' },
  { key: IssueCategory.CAMERA, label: 'Camera Problem', icon: 'CA' },
  { key: IssueCategory.SPEAKER, label: 'Speaker / Mic', icon: 'SP' },
  { key: IssueCategory.WATER_DAMAGE, label: 'Water Damage', icon: 'WD' },
  { key: IssueCategory.OTHER, label: 'Other Issue', icon: '??' },
];

const ISSUE_COLORS: Record<string, string> = {
  [IssueCategory.SCREEN]: '#EF4444',
  [IssueCategory.BATTERY]: '#22C55E',
  [IssueCategory.SOFTWARE]: '#A855F7',
  [IssueCategory.CHARGING]: '#F59E0B',
  [IssueCategory.CAMERA]: '#3B82F6',
  [IssueCategory.SPEAKER]: '#06B6D4',
  [IssueCategory.WATER_DAMAGE]: '#6366F1',
  [IssueCategory.OTHER]: '#6B7280',
};

/** Multi-step booking form. */
export default function BookingScreen() {
  const user = useAuthStore((s) => s.user);
  const addJob = useJobStore((s) => s.addJob);

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
      /* Submit booking — create job in store */
      const newJob = {
        id: `job-${Date.now()}`,
        customer_id: user?.id ?? 'demo-user-001',
        technician_id: null,
        tenant_id: user?.tenant_id ?? 'demo-tenant-001',
        device_brand: brand,
        device_model: model,
        issue_category: issue!,
        description,
        photos,
        service_type: serviceType!,
        status: JobStatus.PENDING,
        location: { address: address || 'Store Drop-off' },
        scheduled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };
      addJob(newJob);
      Alert.alert(
        'Booking Submitted!',
        `Your ${brand} ${model} repair has been booked. A technician will be assigned shortly.`,
        [{ text: 'OK', onPress: () => router.replace('/(customer)') }],
      );
    }
  };

  const pickPhotos = async () => {
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
              <Text style={[styles.stepLabel, { color: i <= step ? Colors.textPrimary : Colors.textMuted }]}>
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
            <Animated.View entering={FadeInDown.springify()} key="step0">
              <Text style={[Typography.h2, styles.stepTitle]}>What device?</Text>
              <Text style={[Typography.bodySmall, styles.stepSub]}>Select brand & enter model</Text>

              <View style={styles.brandGrid}>
                {BRANDS.map((b) => {
                  const isActive = brand === b;
                  return (
                    <HapticPress key={b} onPress={() => setBrand(b)} testID={`brand-${b}`}>
                      <View style={[styles.brandCard, isActive && styles.brandActive]}>
                        <Text style={[styles.brandLetter, isActive && styles.brandLetterActive]}>
                          {b[0]}
                        </Text>
                        <Text style={[styles.brandName, isActive && styles.brandNameActive]} numberOfLines={1}>
                          {b}
                        </Text>
                      </View>
                    </HapticPress>
                  );
                })}
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

          {/* Step 1: Issue — FULL WIDTH ROW CARDS */}
          {step === 1 && (
            <Animated.View entering={FadeInDown.springify()} key="step1">
              <Text style={[Typography.h2, styles.stepTitle]}>What's the issue?</Text>
              <Text style={[Typography.bodySmall, styles.stepSub]}>Select the problem category</Text>

              {ISSUE_CATEGORIES.map((cat) => {
                const isActive = issue === cat.key;
                const color = ISSUE_COLORS[cat.key];
                return (
                  <HapticPress key={cat.key} onPress={() => setIssue(cat.key)} testID={`issue-${cat.key}`}>
                    <View style={[styles.issueRow, isActive && { borderColor: color, backgroundColor: `${color}10` }]}>
                      <View style={[styles.issueIconCircle, { backgroundColor: `${color}20` }]}>
                        <Text style={[styles.issueIconText, { color }]}>{cat.icon}</Text>
                      </View>
                      <Text style={[styles.issueLabel, isActive && { color: Colors.textPrimary }]} numberOfLines={1}>
                        {cat.label}
                      </Text>
                      {isActive && (
                        <View style={[styles.issueCheck, { backgroundColor: color }]}>
                          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                        </View>
                      )}
                    </View>
                  </HapticPress>
                );
              })}
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

              <HapticPress style={styles.photoButton} onPress={pickPhotos}>
                <GlassView style={styles.photoCard}>
                  <Text style={{ fontSize: 24 }}>📷</Text>
                  <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                    {photos.length > 0 ? `${photos.length} photo(s) — tap for more` : 'Tap to add photos'}
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
                <View style={[styles.serviceRow, serviceType === ServiceType.HOME_VISIT && styles.serviceActive]}>
                  <View style={[styles.serviceIcon, { backgroundColor: '#3B82F620' }]}>
                    <Text style={{ fontSize: 22 }}>🏠</Text>
                  </View>
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceTitle}>Home Visit</Text>
                    <Text style={styles.serviceSub}>Technician comes to you</Text>
                  </View>
                  {serviceType === ServiceType.HOME_VISIT && (
                    <View style={styles.serviceCheck}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </View>
              </HapticPress>

              <HapticPress onPress={() => setServiceType(ServiceType.STORE_DROPOFF)} testID="service-store-dropoff">
                <View style={[styles.serviceRow, serviceType === ServiceType.STORE_DROPOFF && styles.serviceActive]}>
                  <View style={[styles.serviceIcon, { backgroundColor: '#A855F720' }]}>
                    <Text style={{ fontSize: 22 }}>🏪</Text>
                  </View>
                  <View style={styles.serviceText}>
                    <Text style={styles.serviceTitle}>Store Drop-off</Text>
                    <Text style={styles.serviceSub}>Drop at repair center</Text>
                  </View>
                  {serviceType === ServiceType.STORE_DROPOFF && (
                    <View style={styles.serviceCheck}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </View>
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

          <View style={{ height: 60 }} />
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <Button
            label={step === STEPS.length - 1 ? 'Submit Booking' : 'Continue'}
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
    alignItems: 'center', paddingHorizontal: Spacing.m, paddingVertical: Spacing.s,
  },
  backBtn: { color: Colors.customer.accent, fontSize: 16, fontFamily: 'Inter_500Medium' },
  headerTitle: { color: Colors.textPrimary },
  stepRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', paddingHorizontal: Spacing.l, paddingBottom: Spacing.s,
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.surfaceElevated, alignItems: 'center',
    justifyContent: 'center', marginBottom: 4,
  },
  stepNum: { color: Colors.white, fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  stepLabel: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  stepLine: {
    position: 'absolute', top: 14, left: '60%', right: '-40%',
    height: 2, backgroundColor: Colors.border,
  },
  scroll: { paddingHorizontal: Spacing.m },
  stepTitle: { color: Colors.textPrimary, marginBottom: Spacing.xxs },
  stepSub: { color: Colors.textSecondary, marginBottom: Spacing.l },

  /* Brand grid */
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.s },
  brandCard: {
    width: 76, height: 76, borderRadius: Radius.m,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  brandActive: {
    borderColor: Colors.customer.primary,
    backgroundColor: Colors.customer.surface,
  },
  brandLetter: {
    fontSize: 22, fontFamily: 'Inter_700Bold', color: Colors.textMuted, marginBottom: 2,
  },
  brandLetterActive: { color: Colors.customer.accent },
  brandName: { fontSize: 10, fontFamily: 'Inter_500Medium', color: Colors.textMuted },
  brandNameActive: { color: Colors.customer.accent },

  /* Issue list — FULL WIDTH HORIZONTAL ROWS */
  issueRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, paddingHorizontal: Spacing.m,
    borderRadius: Radius.m, marginBottom: Spacing.s,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  issueIconCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.m,
  },
  issueIconText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  issueLabel: {
    flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.textSecondary,
  },
  issueCheck: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Photos */
  photoButton: { marginTop: Spacing.l },
  photoCard: { padding: Spacing.l, alignItems: 'center', gap: Spacing.s },
  photoRow: { flexDirection: 'row', gap: Spacing.s, marginTop: Spacing.m, flexWrap: 'wrap' },
  photoThumb: {
    width: 72, height: 72, borderRadius: Radius.s, overflow: 'hidden', position: 'relative',
  },
  photoImg: { width: '100%', height: '100%' },
  photoRemove: {
    position: 'absolute', top: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },

  /* Service cards */
  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: Spacing.m,
    borderRadius: Radius.m, marginBottom: Spacing.m,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  serviceActive: {
    borderColor: Colors.customer.primary,
    backgroundColor: Colors.customer.surface,
  },
  serviceIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.m,
  },
  serviceText: { flex: 1 },
  serviceTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary },
  serviceSub: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginTop: 2 },
  serviceCheck: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.customer.primary,
    alignItems: 'center', justifyContent: 'center',
  },

  /* Bottom CTA */
  bottomBar: {
    paddingHorizontal: Spacing.m, paddingTop: Spacing.m, paddingBottom: 88,
    borderTopWidth: 1, borderTopColor: Colors.border,
    backgroundColor: '#0A0E27',
  },
});
