import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Switch, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { Button } from '../../src/components/ui/button';
import { useAuthStore } from '../../src/stores/auth-store';
import { useThemeStore } from '../../src/stores/theme-store';
import * as authService from '../../src/services/auth-service';
import * as notificationService from '../../src/services/notification-service';
import { APP } from '../../src/constants/app';

/** Settings screen — notification preferences, theme, account, app info. */
export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);
  const [invoiceAlerts, setInvoiceAlerts] = useState(true);

  const handleTogglePush = async (value: boolean) => {
    setPushEnabled(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (value) {
      const token = await notificationService.registerForPushNotifications();
      if (!token) {
        Alert.alert('Notifications', 'Please enable notifications in your device settings.');
        setPushEnabled(false);
      }
    } else {
      await notificationService.cancelAllNotifications();
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your data will be permanently deleted. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact support@revivix.app to complete account deletion.');
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await authService.signOut(user?.id);
          logout();
          setTimeout(() => router.replace('/(auth)/login'), 100);
        },
      },
    ]);
  };

  interface SettingItem {
    label: string;
    icon?: string;
    toggle?: boolean;
    value?: boolean;
    onToggle?: (v: boolean) => void;
    onPress?: () => void;
  }

  const settingsSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'NOTIFICATIONS',
      items: [
        { label: 'Push Notifications', toggle: true, value: pushEnabled, onToggle: handleTogglePush },
        { label: 'Job Status Alerts', toggle: true, value: jobAlerts, onToggle: setJobAlerts },
        { label: 'Invoice Alerts', toggle: true, value: invoiceAlerts, onToggle: setInvoiceAlerts },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Edit Profile', onPress: () => router.push('/(customer)/profile'), icon: '👤' },
        { label: 'Change Password', onPress: () => Alert.alert('Coming Soon', 'Password change will be available in the next update.'), icon: '🔒' },
        { label: 'Privacy Policy', onPress: () => Linking.openURL(`${APP.WEBSITE}/privacy`), icon: '🛡️' },
        { label: 'Terms of Service', onPress: () => Linking.openURL(`${APP.WEBSITE}/terms`), icon: '📜' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'Help & FAQ', onPress: () => router.push('/(customer)/help' as any), icon: '❓' },
        { label: 'Contact Support', onPress: () => Linking.openURL(`mailto:${APP.SUPPORT_EMAIL}`), icon: '✉️' },
        { label: 'Rate the App', onPress: () => Alert.alert('Thank You!', 'Rating coming soon.'), icon: '⭐' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[Typography.h1, styles.title]}>Settings</Text>
          </Animated.View>

          {settingsSections.map((section, si) => (
            <Animated.View key={section.title} entering={FadeInDown.delay(150 + si * 80).springify()}>
              <Text style={[Typography.overline, styles.sectionTitle]}>{section.title}</Text>
              <GlassView style={styles.sectionCard}>
                {section.items.map((item, ii) => (
                  <View key={item.label}>
                    {ii > 0 && <View style={styles.divider} />}
                    <HapticPress
                      onPress={item.onPress ?? (() => {})}
                      disabled={!!item.toggle}
                      testID={`setting-${item.label.toLowerCase().replace(/\s/g, '-')}`}
                    >
                      <View style={styles.settingRow}>
                        {item.icon && <Text style={styles.settingIcon}>{item.icon}</Text>}
                        <Text style={styles.settingLabel}>{item.label}</Text>
                        {item.toggle ? (
                          <Switch
                            value={item.value}
                            onValueChange={item.onToggle}
                            trackColor={{ false: Colors.border, true: Colors.customer.primary }}
                            thumbColor="#FFFFFF"
                          />
                        ) : (
                          <Text style={styles.chevron}>›</Text>
                        )}
                      </View>
                    </HapticPress>
                  </View>
                ))}
              </GlassView>
            </Animated.View>
          ))}

          {/* Danger zone */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Text style={[Typography.overline, styles.sectionTitle]}>DANGER ZONE</Text>
            <GlassView style={styles.sectionCard}>
              <HapticPress onPress={handleLogout} testID="setting-sign-out">
                <View style={styles.settingRow}>
                  <Text style={styles.settingIcon}>🚪</Text>
                  <Text style={[styles.settingLabel, { color: Colors.warning }]}>Sign Out</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </HapticPress>
              <View style={styles.divider} />
              <HapticPress onPress={handleDeleteAccount} testID="setting-delete-account">
                <View style={styles.settingRow}>
                  <Text style={styles.settingIcon}>🗑️</Text>
                  <Text style={[styles.settingLabel, { color: Colors.danger }]}>Delete Account</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
              </HapticPress>
            </GlassView>
          </Animated.View>

          {/* App info footer */}
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.footer}>
            <Text style={styles.footerText}>{APP.NAME} v{APP.VERSION}</Text>
            <Text style={styles.footerText}>Made with ❤️ for repair professionals</Text>
          </Animated.View>

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
  title: { color: Colors.textPrimary, marginBottom: Spacing.l },
  sectionTitle: { color: Colors.textMuted, marginBottom: Spacing.s, marginTop: Spacing.m },
  sectionCard: { padding: 0, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.m, paddingVertical: 14, gap: Spacing.s,
  },
  settingIcon: { fontSize: 18, width: 28, textAlign: 'center' },
  settingLabel: {
    flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.textPrimary,
  },
  chevron: { fontSize: 20, color: Colors.textMuted, fontWeight: '300' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.m },
  footer: { alignItems: 'center', marginTop: Spacing.xl, gap: 4 },
  footerText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted },
});
