import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { Input } from '../../src/components/ui/input';
import { Button } from '../../src/components/ui/button';
import { useAuthStore } from '../../src/stores/auth-store';
import { useThemeStore } from '../../src/stores/theme-store';
import { UserRole } from '../../src/types';
import * as authService from '../../src/services/auth-service';

/** Login screen with real Supabase authentication. */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const setRole = useThemeStore((s) => s.setRole);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const result = await authService.signIn(email.trim(), password);

    if (result.success && result.data) {
      const { user } = result.data;

      /* Set theme based on user role from database */
      const themeRole = user.role === UserRole.TECHNICIAN
        ? 'technician'
        : user.role === UserRole.TENANT
          ? 'tenant'
          : 'customer';

      setRole(themeRole);
      setUser(user);
      router.replace('/');
    } else {
      setErrorMsg(result.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  /** Demo login — for presentations when Supabase is not configured. */
  const handleDemoLogin = () => {
    const themeRole = selectedRole === UserRole.TECHNICIAN
      ? 'technician'
      : selectedRole === UserRole.TENANT
        ? 'tenant'
        : 'customer';

    setRole(themeRole);
    setUser({
      id: 'demo-user-001',
      tenant_id: 'demo-tenant-001',
      role: selectedRole,
      name: selectedRole === UserRole.TECHNICIAN
        ? 'Alex Technician'
        : selectedRole === UserRole.TENANT
          ? 'Sarah Owner'
          : 'Demo Customer',
      email: email || 'demo@revivix.app',
      avatar_url: null,
      phone: '+1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    });

    router.replace('/');
  };

  const roles = [
    { role: UserRole.CUSTOMER, label: 'Customer', icon: '👤', color: '#206BC4' },
    { role: UserRole.TECHNICIAN, label: 'Technician', icon: '🔧', color: '#F59E0B' },
    { role: UserRole.TENANT, label: 'Business', icon: '🏢', color: '#8B5CF6' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Background gradient */}
        <LinearGradient
          colors={['#0A0E27', '#111631', '#1A2234']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={styles.header}
        >
          <Text style={[Typography.overline, styles.brand]}>REVIVIX</Text>
          <Text style={[Typography.h1, styles.title]}>Welcome{'\n'}Back</Text>
          <Text style={[Typography.bodySmall, styles.subtitle]}>
            Sign in to manage your repairs
          </Text>
        </Animated.View>

        {/* Role Selector — for demo mode */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.roleSelector}
        >
          <Text style={[Typography.caption, styles.roleLabel]}>
            SELECT YOUR ROLE
          </Text>
          <View style={styles.roleRow}>
            {roles.map(({ role, label, icon, color }) => {
              const isSelected = selectedRole === role;
              return (
                <Pressable
                  key={role}
                  onPress={() => setSelectedRole(role)}
                  style={[
                    styles.rolePill,
                    isSelected && { backgroundColor: color, borderColor: color },
                  ]}
                  testID={`role-${role}`}
                >
                  <Text style={styles.roleIcon}>{icon}</Text>
                  <Text
                    style={[
                      styles.rolePillText,
                      isSelected && { color: '#FFFFFF' },
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* Error Message */}
        {errorMsg && (
          <Animated.View entering={FadeInDown.springify()} style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </Animated.View>
        )}

        {/* Form */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={styles.form}
        >
          <Input
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMsg(null); }}
            keyboardType="email-address"
            autoCapitalize="none"
            testID="login-email"
          />
          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={(text) => { setPassword(text); setErrorMsg(null); }}
            secureTextEntry
            containerStyle={styles.inputGap}
            testID="login-password"
          />

          <Button
            label={isLoading ? '' : 'Sign In'}
            onPress={handleLogin}
            fullWidth
            disabled={isLoading}
            style={styles.submitButton}
            testID="login-submit"
          />

          {isLoading && (
            <ActivityIndicator
              color={Colors.customer.primary}
              style={{ position: 'absolute', bottom: 130, alignSelf: 'center' }}
            />
          )}

          <Button
            label="Demo Mode (No Account)"
            variant="ghost"
            onPress={handleDemoLogin}
            fullWidth
            testID="login-demo"
          />

          <Button
            label="Create Account"
            variant="ghost"
            onPress={() => router.push('/(auth)/register')}
            fullWidth
            testID="login-register-link"
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.l,
    paddingTop: 80,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  brand: {
    color: Colors.customer.primary,
    marginBottom: Spacing.s,
  },
  title: {
    color: Colors.textPrimary,
    marginBottom: Spacing.s,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  roleSelector: {
    marginBottom: Spacing.l,
  },
  roleLabel: {
    color: Colors.textMuted,
    marginBottom: Spacing.s,
  },
  roleRow: {
    flexDirection: 'row',
    gap: Spacing.s,
  },
  rolePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: Radius.m,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceElevated,
  },
  roleIcon: {
    fontSize: 16,
  },
  rolePillText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.textSecondary,
  },
  errorBox: {
    backgroundColor: 'rgba(214, 57, 57, 0.12)',
    borderRadius: Radius.s,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(214, 57, 57, 0.3)',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  form: {
    gap: Spacing.m,
  },
  inputGap: {
    marginTop: 0,
  },
  submitButton: {
    marginTop: Spacing.s,
  },
});
