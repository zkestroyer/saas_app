import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { GlassView } from './glass-view';
import { Colors, Spacing, Typography } from '../../theme';
import { useThemeStore } from '../../stores/theme-store';
import { getRoleColors } from '../../theme/colors';

interface StatCardProps {
  /** Stat title (e.g. "Active Jobs"). */
  title: string;
  /** Stat value (e.g. "42"). */
  value: string;
  /** Icon node. */
  icon: React.ReactNode;
  /** Percentage change (e.g. +12.5). */
  change?: number;
  /** Animation delay for stagger effect. */
  delay?: number;
  testID?: string;
}

/** Analytics stat card with glassmorphism, glow accent, and animated entry. */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  delay = 0,
  testID,
}) => {
  const role = useThemeStore((s) => s.role);
  const roleColors = getRoleColors(role);

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} testID={testID}>
      <GlassView
        style={styles.card}
        borderColor={`${roleColors.primary}33`}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: roleColors.surface },
            ]}
          >
            {icon}
          </View>
          {change !== undefined && (
            <View
              style={[
                styles.changeBadge,
                {
                  backgroundColor:
                    change >= 0 ? Colors.successLight : Colors.dangerLight,
                },
              ]}
            >
              <Text
                style={[
                  Typography.caption,
                  {
                    color: change >= 0 ? Colors.success : Colors.danger,
                    fontSize: 11,
                  },
                ]}
              >
                {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[Typography.stat, styles.value]}>{value}</Text>
        <Text style={[Typography.caption, styles.title]}>{title}</Text>
      </GlassView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.m,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  value: {
    color: Colors.textPrimary,
    marginBottom: Spacing.xxs,
  },
  title: {
    color: Colors.textSecondary,
  },
});
