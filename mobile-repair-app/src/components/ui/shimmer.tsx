import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Colors, Radius } from '../../theme';

interface ShimmerProps {
  /** Width of the shimmer block. */
  width: number | string;
  /** Height of the shimmer block. */
  height: number;
  /** Border radius. Default Radius.m. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Premium shimmer loading placeholder — replaces spinners everywhere. */
export const Shimmer: React.FC<ShimmerProps> = ({
  width,
  height,
  radius = Radius.m,
  style,
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.5, 1], [0.3, 0.7, 0.3]);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as any, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
    />
  );
};

/** Multiple shimmer lines mimicking text content. */
export const ShimmerLines: React.FC<{
  lines?: number;
  lineHeight?: number;
  spacing?: number;
}> = ({ lines = 3, lineHeight = 14, spacing = 8 }) => (
  <View>
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer
        key={i}
        width={i === lines - 1 ? '60%' : '100%'}
        height={lineHeight}
        radius={Radius.xs}
        style={i > 0 ? { marginTop: spacing } : undefined}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surfaceElevated,
  },
});
