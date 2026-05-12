import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../src/theme';

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={[styles.tabItem, focused && styles.tabItemActive]}>
    <Text style={[styles.emoji, focused && styles.emojiActive]}>{emoji}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    {focused && <View style={[styles.glowDot, { backgroundColor: Colors.technician.accent }]} />}
  </View>
);

/** Technician tab layout with amber/orange "Industrial Pro" theme. */
export default function TechnicianLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="HUD" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="job/[id]"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="invoice/[id]"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    borderRadius: 20, height: 70, borderTopWidth: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.85)',
    borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)',
    paddingTop: 8, elevation: 8,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  tabItemActive: { transform: [{ scale: 1.1 }] },
  emoji: { fontSize: 22, opacity: 0.5 },
  emojiActive: { opacity: 1, fontSize: 24 },
  tabLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2 },
  tabLabelActive: { color: Colors.technician.accent, fontFamily: 'Inter_600SemiBold' },
  glowDot: {
    width: 4, height: 4, borderRadius: 2, marginTop: 3,
    shadowColor: Colors.technician.accent,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6,
  },
});
