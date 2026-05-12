import React from 'react';
import { StyleSheet, Text, type ViewStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HapticPress } from './haptic-press';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { useThemeStore } from '../../stores/theme-store';
import { getRoleColors } from '../../theme/colors';

interface ButtonProps {
  /** Button label text. */
  label: string;
  /** Press handler. */
  onPress: () => void;
  /** Visual variant. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Full-width. Default false. */
  fullWidth?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Left icon render function. */
  icon?: React.ReactNode;
  /** Test ID for automation. */
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Premium gradient button with haptic feedback. */
export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  icon,
  testID,
  style,
}) => {
  const role = useThemeStore((s) => s.role);
  const roleColors = getRoleColors(role);

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const gradientColors = isDanger
    ? [Colors.danger, '#B91C1C'] as const
    : isPrimary
      ? roleColors.gradient
      : [Colors.transparent, Colors.transparent] as const;

  return (
    <HapticPress
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={[fullWidth && styles.fullWidth, style]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <LinearGradient
        colors={gradientColors as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.base,
          isGhost && styles.ghost,
          !isPrimary && !isDanger && styles.secondary,
          disabled && styles.disabled,
        ]}
      >
        {icon && <>{icon}</>}
        <Text
          style={[
            Typography.button,
            styles.label,
            isPrimary || isDanger
              ? styles.labelPrimary
              : { color: roleColors.primary },
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    </HapticPress>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.s,
    paddingVertical: 14,
    paddingHorizontal: Spacing.l,
    borderRadius: Radius.m,
  },
  fullWidth: {
    width: '100%',
  },
  secondary: {
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ghost: {
    backgroundColor: Colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    textAlign: 'center',
  },
  labelPrimary: {
    color: Colors.white,
  },
});
