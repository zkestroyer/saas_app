import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius } from '../../theme';

interface GlassViewProps extends ViewProps {
  /** Blur intensity 1-100. Default 40. */
  intensity?: number;
  /** Border color override. */
  borderColor?: string;
  /** Border radius. Default Radius.l (16). */
  radius?: number;
}

/** A reusable glassmorphism container with blur, border, and translucent fill. */
export const GlassView: React.FC<GlassViewProps> = ({
  children,
  intensity = 40,
  borderColor = Colors.borderLight,
  radius = Radius.l,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.wrapper,
        { borderRadius: radius, borderColor },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: Colors.surfaceGlass,
  },
  inner: {
    position: 'relative',
    zIndex: 1,
  },
});
