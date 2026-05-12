import React, { useCallback } from 'react';
import {
  Pressable,
  type PressableProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HapticPressProps extends Omit<PressableProps, 'style'> {
  /** Haptic impact style. Default: Light. */
  impact?: Haptics.ImpactFeedbackStyle;
  /** Scale down factor on press. Default: 0.97. */
  scaleDown?: number;
  style?: StyleProp<ViewStyle>;
}

/** A pressable wrapper that triggers haptic feedback and a spring scale animation. */
export const HapticPress: React.FC<HapticPressProps> = ({
  children,
  impact = Haptics.ImpactFeedbackStyle.Light,
  scaleDown = 0.97,
  onPressIn,
  onPressOut,
  onPress,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      'worklet';
      scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
      onPressIn?.(e);
    },
    [scaleDown, onPressIn, scale],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      'worklet';
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  const handlePress = useCallback(
    (e: any) => {
      Haptics.impactAsync(impact);
      onPress?.(e);
    },
    [impact, onPress],
  );

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[animatedStyle, style]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};
