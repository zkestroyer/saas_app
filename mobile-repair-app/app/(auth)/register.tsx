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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { Input } from '../../src/components/ui/input';
import { Button } from '../../src/components/ui/button';
import { UserRole } from '../../src/types';
import * as authService from '../../src/services/auth-service';

/** Registration screen with real Supabase sign-up. */
export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async () => {
    /* Validate inputs */
    if (!name.trim()) { setErrorMsg('Name is required'); return; }
    if (!email.trim()) { setErrorMsg('Email is required'); return; }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await authService.signUp(
      email.trim(),
      password,
      name.trim(),
      phone.trim(),
      role,
    );

    setIsLoading(false);

    if (result.success) {
      setSuccessMsg('Account created! Please sign in.');
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    } else {
      setErrorMsg(result.message || 'Registration failed');
    }
  };

  const roles = [
    { value: UserRole.CUSTOMER, label: 'Customer', icon: '👤' },
    { value: UserRole.TECHNICIAN, label: 'Technician', icon: '🔧' },
    { value: UserRole.TENANT, label: 'Business', icon: '🏢' },
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
        <LinearGradient
          colors={['#0A0E27', '#111631', '#1A2234']}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={[Typography.overline, styles.brand]}>REVIVIX</Text>
          <Text style={[Typography.h1, styles.title]}>Create{'\n'}Account</Text>
          <Text style={[Typography.bodySmall, styles.subtitle]}>
            Join the premium repair network
          </Text>
        </Animated.View>

        {/* Role selection */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.roleRow}>
          {roles.map((r) => {
            const isActive = role === r.value;
            return (
              <Pressable
                key={r.value}
                onPress={() => setRole(r.value)}
                style={[styles.rolePill, isActive && styles.rolePillActive]}
                testID={`register-role-${r.value}`}
              >
                <Text style={{ fontSize: 14 }}>{r.icon}</Text>
                <Text style={[styles.rolePillText, isActive && { color: '#fff' }]} numberOfLines={1}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Status messages */}
        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
          </View>
        )}
        {successMsg && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {successMsg}</Text>
          </View>
        )}

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.form}
        >
          <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={(t) => { setName(t); setErrorMsg(null); }} testID="register-name" />
          <Input label="Email" placeholder="your@email.com" value={email} onChangeText={(t) => { setEmail(t); setErrorMsg(null); }} keyboardType="email-address" autoCapitalize="none" testID="register-email" />
          <Input label="Phone" placeholder="+1 234 567 890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="register-phone" />
          <Input label="Password" placeholder="Min. 6 characters" value={password} onChangeText={(t) => { setPassword(t); setErrorMsg(null); }} secureTextEntry testID="register-password" />

          <Button
            label={isLoading ? '' : 'Create Account'}
            onPress={handleRegister}
            fullWidth
            disabled={isLoading}
            style={styles.submit}
            testID="register-submit"
          />
          {isLoading && (
            <ActivityIndicator color={Colors.customer.primary} style={{ marginTop: -40, marginBottom: 8 }} />
          )}
          <Button label="Already have an account? Sign In" variant="ghost" onPress={() => router.back()} fullWidth testID="register-login-link" />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Spacing.l, paddingTop: 80, paddingBottom: Spacing.xl },
  brand: { color: Colors.customer.primary, marginBottom: Spacing.s },
  title: { color: Colors.textPrimary, marginBottom: Spacing.s },
  subtitle: { color: Colors.textSecondary, marginBottom: Spacing.l },
  roleRow: { flexDirection: 'row', gap: Spacing.s, marginBottom: Spacing.l },
  rolePill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 10, paddingHorizontal: 6, borderRadius: Radius.m,
    borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.surfaceElevated,
  },
  rolePillActive: { backgroundColor: Colors.customer.primary, borderColor: Colors.customer.primary },
  rolePillText: { fontSize: 12, fontFamily: 'Inter_500Medium', color: Colors.textSecondary },
  errorBox: {
    backgroundColor: 'rgba(214, 57, 57, 0.12)', borderRadius: Radius.s,
    padding: Spacing.m, marginBottom: Spacing.m, borderWidth: 1, borderColor: 'rgba(214, 57, 57, 0.3)',
  },
  errorText: { color: Colors.danger, fontSize: 13, fontFamily: 'Inter_500Medium' },
  successBox: {
    backgroundColor: 'rgba(47, 179, 68, 0.12)', borderRadius: Radius.s,
    padding: Spacing.m, marginBottom: Spacing.m, borderWidth: 1, borderColor: 'rgba(47, 179, 68, 0.3)',
  },
  successText: { color: Colors.success, fontSize: 13, fontFamily: 'Inter_500Medium' },
  form: { gap: Spacing.m },
  submit: { marginTop: Spacing.s },
});
