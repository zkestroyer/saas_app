import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../../src/theme';
import { Input } from '../../src/components/ui/input';
import { Button } from '../../src/components/ui/button';

/** Registration screen with premium design. */
export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    /* In production: supabase.auth.signUp() + insert into users table. */
    router.replace('/(auth)/login');
  };

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

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.form}
        >
          <Input label="Full Name" placeholder="John Doe" value={name} onChangeText={setName} testID="register-name" />
          <Input label="Email" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" testID="register-email" />
          <Input label="Phone" placeholder="+1 234 567 890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" testID="register-phone" />
          <Input label="Password" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry testID="register-password" />

          <Button label="Create Account" onPress={handleRegister} fullWidth style={styles.submit} testID="register-submit" />
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
  subtitle: { color: Colors.textSecondary, marginBottom: Spacing.xl },
  form: { gap: Spacing.m },
  submit: { marginTop: Spacing.s },
});
