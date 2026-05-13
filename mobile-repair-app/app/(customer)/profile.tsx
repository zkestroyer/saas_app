import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { GlassView } from '../../src/components/ui/glass-view';
import { Button } from '../../src/components/ui/button';
import { HapticPress } from '../../src/components/ui/haptic-press';
import { useAuthStore } from '../../src/stores/auth-store';
import { useThemeStore } from '../../src/stores/theme-store';

/** Profile & Settings screen with editable fields and working logout. */
export default function ProfileScreen() {
  const { user, setUser, logout } = useAuthStore();
  const role = useThemeStore((s) => s.role);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editPhone, setEditPhone] = useState(user?.phone ?? '');
  const [editEmail, setEditEmail] = useState(user?.email ?? '');

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
            /* Navigate to login — use setTimeout to allow state to clear first */
            setTimeout(() => {
              router.replace('/(auth)/login');
            }, 100);
          },
        },
      ],
    );
  };

  const handleSaveProfile = () => {
    if (!user) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setUser({
      ...user,
      name: editName.trim() || user.name,
      phone: editPhone.trim() || user.phone,
      email: editEmail.trim() || user.email,
      updated_at: new Date().toISOString(),
    });
    setIsEditing(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const roleLabel = role === 'technician' ? 'Technician' : role === 'tenant' ? 'Business Owner' : 'Customer';
  const roleColor = role === 'technician' ? Colors.technician.primary : role === 'tenant' ? Colors.tenant.primary : Colors.customer.primary;

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

            {!isEditing ? (
              <>
                <Text style={[Typography.h2, styles.headerName]} numberOfLines={1}>
                  {user?.name ?? 'User'}
                </Text>
                <Text style={styles.headerEmail} numberOfLines={1}>
                  {user?.email ?? 'user@revivix.app'}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: `${roleColor}20`, borderColor: `${roleColor}40` }]}>
                  <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: roleColor }}>{roleLabel}</Text>
                </View>
              </>
            ) : (
              <View style={styles.editHeader}>
                <Text style={styles.editHint}>Editing Profile</Text>
              </View>
            )}
          </Animated.View>

          {/* Edit Profile Section */}
          {isEditing ? (
            <Animated.View entering={FadeInDown.springify()}>
              <GlassView style={styles.editCard}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor={Colors.textMuted}
                />

                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="+1 234 567 890"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="phone-pad"
                />

                <View style={styles.editActions}>
                  <Button label="Save Changes" onPress={handleSaveProfile} fullWidth testID="save-profile" />
                  <Button label="Cancel" variant="ghost" onPress={() => setIsEditing(false)} fullWidth testID="cancel-edit" />
                </View>
              </GlassView>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <GlassView style={styles.menuCard}>
                {/* Edit Profile */}
                <HapticPress onPress={() => setIsEditing(true)} testID="menu-edit-profile">
                  <View style={[styles.menuItem, styles.menuBorder]}>
                    <Text style={styles.menuIcon}>👤</Text>
                    <Text style={styles.menuLabel}>Edit Profile</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>

                {/* Notifications */}
                <HapticPress onPress={() => Alert.alert('Notifications', 'Push notifications are enabled. You will be notified when your repair status changes.')} testID="menu-notifications">
                  <View style={[styles.menuItem, styles.menuBorder]}>
                    <Text style={styles.menuIcon}>🔔</Text>
                    <Text style={styles.menuLabel}>Notifications</Text>
                    <Text style={styles.menuValue}>On</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>

                {/* Privacy */}
                <HapticPress onPress={() => Alert.alert('Privacy & Security', 'Your data is encrypted end-to-end. We never share your personal information with third parties.')} testID="menu-privacy">
                  <View style={[styles.menuItem, styles.menuBorder]}>
                    <Text style={styles.menuIcon}>🔒</Text>
                    <Text style={styles.menuLabel}>Privacy & Security</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>

                {/* Payment */}
                <HapticPress onPress={() => Alert.alert('Payment Methods', 'Payment integration will be available in a future update. Currently, payments are handled at the point of service.')} testID="menu-payment">
                  <View style={[styles.menuItem, styles.menuBorder]}>
                    <Text style={styles.menuIcon}>💳</Text>
                    <Text style={styles.menuLabel}>Payment Methods</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>

                {/* Help */}
                <HapticPress onPress={() => Alert.alert('Help & Support', 'Email: support@revivix.app\nPhone: +1 800 FIX PHONE\n\nOur team is available Mon-Sat, 9AM-6PM.')} testID="menu-help">
                  <View style={[styles.menuItem, styles.menuBorder]}>
                    <Text style={styles.menuIcon}>❓</Text>
                    <Text style={styles.menuLabel}>Help & Support</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>

                {/* Terms */}
                <HapticPress onPress={() => Alert.alert('Terms of Service', 'By using Revivix, you agree to our Terms of Service and Privacy Policy. Full terms available at revivix.app/terms')} testID="menu-terms">
                  <View style={styles.menuItem}>
                    <Text style={styles.menuIcon}>📄</Text>
                    <Text style={styles.menuLabel}>Terms of Service</Text>
                    <Text style={styles.menuChevron}>›</Text>
                  </View>
                </HapticPress>
              </GlassView>
            </Animated.View>
          )}

          {/* Logout */}
          {!isEditing && (
            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.logoutWrap}>
              <Button
                label="Sign Out"
                variant="danger"
                onPress={handleLogout}
                fullWidth
                testID="logout-btn"
              />
            </Animated.View>
          )}

          <Text style={styles.version}>Revivix v1.0.0</Text>
          <View style={{ height: 80 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: Spacing.m },
  profileHeader: {
    alignItems: 'center', marginBottom: Spacing.xl, paddingTop: Spacing.l,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surfaceElevated, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.m,
  },
  avatarText: {
    fontSize: 32, fontFamily: 'Inter_700Bold', color: Colors.textPrimary,
  },
  headerName: { color: Colors.textPrimary, marginBottom: Spacing.xxs },
  headerEmail: { fontSize: 14, fontFamily: 'Inter_400Regular', color: Colors.textSecondary, marginBottom: Spacing.m },
  roleBadge: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1,
  },
  editHeader: { alignItems: 'center' },
  editHint: { fontSize: 14, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },

  /* Edit Form */
  editCard: { padding: Spacing.m },
  fieldLabel: {
    fontSize: 12, fontFamily: 'Inter_600SemiBold', color: Colors.textMuted,
    marginBottom: 6, marginTop: Spacing.m,
  },
  fieldInput: {
    backgroundColor: Colors.surfaceElevated, borderRadius: Radius.s,
    paddingHorizontal: Spacing.m, paddingVertical: 12,
    fontSize: 15, fontFamily: 'Inter_400Regular', color: Colors.textPrimary,
    borderWidth: 1, borderColor: Colors.border,
  },
  editActions: { marginTop: Spacing.l, gap: Spacing.s },

  /* Menu */
  menuCard: { padding: 0, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: Spacing.m,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  menuIcon: { fontSize: 20, marginRight: Spacing.m, width: 28 },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: Colors.textPrimary },
  menuValue: { fontSize: 13, fontFamily: 'Inter_400Regular', color: Colors.success, marginRight: 8 },
  menuChevron: { fontSize: 20, color: Colors.textMuted },
  logoutWrap: { marginTop: Spacing.l },
  version: {
    fontSize: 12, fontFamily: 'Inter_400Regular', color: Colors.textMuted,
    textAlign: 'center', marginTop: Spacing.l,
  },
});
