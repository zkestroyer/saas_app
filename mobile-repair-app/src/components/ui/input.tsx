import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import { useThemeStore } from '../../stores/theme-store';
import { getRoleColors } from '../../theme/colors';

interface InputProps extends TextInputProps {
  /** Field label shown above the input. */
  label?: string;
  /** Error message shown below the input. */
  error?: string;
  /** Left icon. */
  icon?: React.ReactNode;
  /** Container style. */
  containerStyle?: StyleProp<ViewStyle>;
}

/** Styled text input with neumorphism-lite inner shadow and focus glow. */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const role = useThemeStore((s) => s.role);
  const roleColors = getRoleColors(role);

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            Typography.caption,
            styles.label,
            error ? { color: Colors.danger } : null,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.wrapper,
          isFocused && { borderColor: roleColors.primary },
          error && styles.errorBorder,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[Typography.body, styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          selectionColor={roleColors.primary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text style={[Typography.caption, styles.error]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.m,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.m,
    /* Neumorphism-lite inner shadow feel */
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 1,
  },
  errorBorder: {
    borderColor: Colors.danger,
  },
  icon: {
    marginRight: Spacing.s,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    paddingVertical: 14,
  },
  error: {
    color: Colors.danger,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
