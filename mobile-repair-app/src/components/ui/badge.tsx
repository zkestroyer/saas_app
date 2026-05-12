import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../theme';

interface BadgeProps {
  /** Badge text label. */
  label: string;
  /** Color variant. */
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  /** Small size for compact layouts. */
  size?: 'sm' | 'md';
}

const VARIANT_MAP = {
  success: { bg: Colors.successLight, text: Colors.success },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  danger: { bg: Colors.dangerLight, text: Colors.danger },
  info: { bg: Colors.infoLight, text: Colors.info },
  neutral: { bg: Colors.surfaceElevated, text: Colors.textSecondary },
};

/** Status badge with semantic coloring. */
export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const colors = VARIANT_MAP[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: colors.bg },
        isSmall && styles.small,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text
        style={[
          isSmall ? Typography.caption : Typography.caption,
          { color: colors.text, fontSize: isSmall ? 10 : 12 },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.s,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
