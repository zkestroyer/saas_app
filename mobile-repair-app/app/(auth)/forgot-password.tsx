import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform,
  Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../../src/theme';
import { Input } from '../../src/components/ui/input';
import { Button } from '../../src/components/ui/button';
import { supabase } from '../../src/services/supabase';

/** Forgot Password screen — sends a password reset email via Supabase. */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'revivix://reset-password',
    });

    setIsLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#0A0E27', '#111631', '#1A2234']} style={StyleSheet.absoluteFill} />

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.content}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.m }}>🔐</Text>
          <Text style={[Typography.h1, styles.title]}>Reset Password</Text>
          <Text style={[Typography.bodySmall, styles.sub]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {sent ? (
            <Animated.View entering={FadeInDown.springify()} style={styles.successBox}>
              <Text style={{ fontSize: 40, marginBottom: Spacing.s }}>✅</Text>
              <Text style={[Typography.h3, { color: Colors.textPrimary, textAlign: 'center' }]}>
                Check Your Email
              </Text>
              <Text style={[Typography.bodySmall, { color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.s }]}>
                We've sent a password reset link to {email}. Please check your inbox and spam folder.
              </Text>
              <Button
                label="Back to Login"
                variant="ghost"
                onPress={() => router.replace('/(auth)/login')}
                fullWidth
                style={{ marginTop: Spacing.l }}
                testID="forgot-back-to-login"
              />
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
              <Input
                label="Email Address"
                placeholder="your@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="forgot-email"
              />

              <Button
                label={isLoading ? '' : 'Send Reset Link'}
                onPress={handleResetPassword}
                fullWidth
                disabled={isLoading}
                style={{ marginTop: Spacing.m }}
                testID="forgot-submit"
              />
              {isLoading && <ActivityIndicator color={Colors.customer.primary} style={{ marginTop: -40 }} />}

              <Button
                label="← Back to Login"
                variant="ghost"
                onPress={() => router.back()}
                fullWidth
                testID="forgot-back"
              />
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: Spacing.l, justifyContent: 'center' },
  content: { alignItems: 'center' },
  title: { color: Colors.textPrimary, textAlign: 'center' },
  sub: { color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.m, paddingHorizontal: Spacing.m },
  form: { width: '100%', gap: Spacing.m },
  successBox: { alignItems: 'center', paddingVertical: Spacing.xl },
});
