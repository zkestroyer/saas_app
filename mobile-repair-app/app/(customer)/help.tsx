import React from 'react';
import { StyleSheet, Text, View, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { APP } from '../../src/constants/app';

const FAQ_ITEMS = [
  {
    q: 'How do I book a repair?',
    a: 'Go to the Home screen and tap "Book a Repair". Follow the 4-step wizard to select your device, issue, and preferred service type.',
  },
  {
    q: 'Can I track my repair in real-time?',
    a: 'Yes! Once a technician is assigned, you can track the status from your dashboard. You\'ll also receive push notifications for every status change.',
  },
  {
    q: 'What is a receiving note?',
    a: 'When your device is taken to the shop for repair (Path B), the technician generates a receiving note documenting the device condition. This serves as proof of custody.',
  },
  {
    q: 'How does invoicing work?',
    a: 'Your technician builds a dynamic invoice with parts, labor, and dispatch charges. The invoice remains editable until payment, after which it\'s permanently locked.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Currently we support cash payments. Card and digital wallet payments are coming in the next update.',
  },
  {
    q: 'How do I cancel a booking?',
    a: 'Contact your assigned technician or reach out to support. Bookings in "pending" status can be cancelled at no charge.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use bank-grade encryption, Row-Level Security policies, and JWT authentication. Your data is isolated per tenant and never shared.',
  },
];

/** Help & support screen with FAQ, contact options, and app info. */
export default function HelpScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <HapticPress onPress={() => router.back()}>
              <Text style={styles.backBtn}>← Back</Text>
            </HapticPress>
            <Text style={[Typography.h1, styles.title]}>Help & Support</Text>
            <Text style={[Typography.bodySmall, styles.sub]}>
              Find answers to common questions or contact our team
            </Text>
          </Animated.View>

          {/* Contact Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassView style={styles.contactCard}>
              <Text style={{ fontSize: 32, marginBottom: Spacing.s }}>💬</Text>
              <Text style={[Typography.h3, { color: Colors.textPrimary, textAlign: 'center' }]}>
                Need Help?
              </Text>
              <Text style={[Typography.bodySmall, { color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.s }]}>
                Our support team is available Monday–Saturday, 9AM–6PM
              </Text>
              <View style={styles.contactRow}>
                <HapticPress
                  onPress={() => Linking.openURL(`mailto:${APP.SUPPORT_EMAIL}`)}
                  testID="help-email"
                >
                  <View style={styles.contactBtn}>
                    <Text style={{ fontSize: 18 }}>✉️</Text>
                    <Text style={styles.contactBtnText}>Email Us</Text>
                  </View>
                </HapticPress>
                <HapticPress
                  onPress={() => Linking.openURL('tel:+18001234567')}
                  testID="help-phone"
                >
                  <View style={styles.contactBtn}>
                    <Text style={{ fontSize: 18 }}>📞</Text>
                    <Text style={styles.contactBtnText}>Call Us</Text>
                  </View>
                </HapticPress>
              </View>
            </GlassView>
          </Animated.View>

          {/* FAQ */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={[Typography.h3, styles.faqTitle]}>Frequently Asked Questions</Text>
          </Animated.View>

          {FAQ_ITEMS.map((item, i) => (
            <Animated.View key={i} entering={FadeInDown.delay(350 + i * 60).springify()}>
              <GlassView style={styles.faqCard}>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Text style={styles.faqAnswer}>{item.a}</Text>
              </GlassView>
            </Animated.View>
          ))}

          {/* App version */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{APP.NAME} v{APP.VERSION}</Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.l },
  backBtn: { fontSize: 15, color: Colors.customer.primary, fontFamily: 'Inter_500Medium', marginBottom: Spacing.m },
  title: { color: Colors.textPrimary },
  sub: { color: Colors.textSecondary, marginBottom: Spacing.l },
  contactCard: { padding: Spacing.l, alignItems: 'center', marginBottom: Spacing.l },
  contactRow: { flexDirection: 'row', gap: Spacing.m, marginTop: Spacing.s },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.l, paddingVertical: Spacing.s,
    borderRadius: Radius.m, backgroundColor: 'rgba(32, 107, 196, 0.15)',
    borderWidth: 1, borderColor: 'rgba(32, 107, 196, 0.3)',
  },
  contactBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.customer.primary },
  faqTitle: { color: Colors.textPrimary, marginBottom: Spacing.m },
  faqCard: { padding: Spacing.m, marginBottom: Spacing.s },
  faqQuestion: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: Colors.textPrimary, marginBottom: 6 },
  faqAnswer: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  footer: { alignItems: 'center', marginTop: Spacing.xl },
  footerText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted },
});
