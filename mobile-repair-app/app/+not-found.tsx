import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Spacing, Typography } from '../src/theme';
import { Button } from '../src/components/ui/button';

/** 404 Not Found screen — shown for invalid routes. */
export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0A0E27', '#111631']} style={StyleSheet.absoluteFill} />
      <Animated.View entering={FadeInDown.springify()} style={styles.content}>
        <Text style={styles.emoji}>🔍</Text>
        <Text style={[Typography.h1, styles.title]}>404</Text>
        <Text style={[Typography.h3, styles.subtitle]}>Page Not Found</Text>
        <Text style={[Typography.bodySmall, styles.body]}>
          The screen you're looking for doesn't exist or has been moved.
        </Text>
        <Button
          label="Go Home"
          onPress={() => router.replace('/')}
          fullWidth
          style={{ marginTop: Spacing.l }}
          testID="not-found-home"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: Spacing.xl },
  emoji: { fontSize: 64, marginBottom: Spacing.m },
  title: { color: Colors.textPrimary, fontSize: 64, marginBottom: Spacing.xxs },
  subtitle: { color: Colors.textSecondary },
  body: { color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.s },
});
