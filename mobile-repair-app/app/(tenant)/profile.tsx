import React from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Button } from '../../src/components/ui/button';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { useAuthStore } from '../../src/stores/auth-store';
import { useThemeStore } from '../../src/stores/theme-store';

/** Profile & Settings screen — accessible from all roles. */
export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const role = useThemeStore((s) => s.role);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/');
          },
        },
      ],
    );
  };

  const roleLabel = role === 'technician' ? 'Technician' : role === 'tenant' ? 'Business Owner' : 'Customer';
  const roleColor = role === 'technician' ? Colors.technician.primary : role === 'tenant' ? Colors.tenant.primary : Colors.customer.primary;

  const menuItems = [
    { icon: '👤', label: 'Edit Profile', action: () => {} },
    { icon: '🔔', label: 'Notifications', action: () => {} },
    { icon: '🔒', label: 'Privacy & Security', action: () => {} },
    { icon: '💳', label: 'Payment Methods', action: () => {} },
    { icon: '❓', label: 'Help & Support', action: () => {} },
    { icon: '📄', label: 'Terms of Service', action: () => {} },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileHeader}>
            <View style={[styles.avatar, { borderColor: roleColor }]}>
              <Text style={styles.avatarText}>
                {(user?.name ?? 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[Typography.h2, styles.name]} numberOfLines={1}>
              {user?.name ?? 'User'}
            </Text>
            <Text style={[Typography.bodySmall, styles.email]} numberOfLines={1}>
              {user?.email ?? 'user@repairpro.app'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20`, borderColor: `${roleColor}40` }]}>
              <Text style={[Typography.caption, { color: roleColor }]}>{roleLabel}</Text>
            </View>
          </Animated.View>

          {/* Menu Items */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassView style={styles.menuCard}>
              {menuItems.map((item, i) => (
                <HapticPress key={item.label} onPress={item.action} testID={`menu-${item.label}`}>
                  <View style={[styles.menuItem, i < menuItems.length - 1 && styles.menuBorder]}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={[Typography.body, styles.menuLabel]}>{item.label}</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>
              ))}
            </GlassView>
          </Animated.View>

          {/* Logout */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.logoutWrap}>
            <Button
              label="Sign Out"
              variant="danger"
              onPress={handleLogout}
              fullWidth
              testID="logout-btn"
            />
          </Animated.View>

          {/* App Version */}
          <Text style={[Typography.caption, styles.version]}>RepairPro v1.0.0</Text>

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
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingTop: Spacing.l,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.m,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
  },
  name: { color: Colors.textPrimary, marginBottom: Spacing.xxs },
  email: { color: Colors.textSecondary, marginBottom: Spacing.m },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.m,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: { fontSize: 20, marginRight: Spacing.m },
  menuLabel: { flex: 1, color: Colors.textPrimary },
  menuChevron: { fontSize: 20, color: Colors.textMuted },
  logoutWrap: { marginTop: Spacing.l },
  version: {
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.l,
  },
});
