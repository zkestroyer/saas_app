import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '../../src/theme';

const TabIcon = ({ icon, label, focused }: { icon: string; label: string; focused: boolean }) => (
  <View style={styles.tabItem}>
    <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
    <Text
      style={[styles.tabLabel, focused && styles.tabLabelActive]}
      numberOfLines={1}
    >
      {label}
    </Text>
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
          tabBarIcon: ({ focused }) => <TabIcon icon="◉" label="HUD" focused={focused} />,
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
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="○" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    height: 64, borderTopWidth: 0,
    backgroundColor: 'rgba(10, 14, 39, 0.92)',
    borderWidth: 0,
    paddingTop: 6, paddingBottom: 0, elevation: 10,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', minWidth: 56, paddingTop: 2 },
  icon: { fontSize: 22, color: Colors.textMuted, fontWeight: '700', lineHeight: 26 },
  iconActive: { color: Colors.technician.accent, fontSize: 24 },
  tabLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 1, fontFamily: 'Inter_500Medium' },
  tabLabelActive: { color: Colors.technician.accent, fontFamily: 'Inter_600SemiBold' },
  glowDot: {
    width: 4, height: 4, borderRadius: 2, marginTop: 2,
    shadowColor: Colors.technician.accent,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 4,
  },
});
