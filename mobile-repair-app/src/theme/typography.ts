import { StyleSheet } from 'react-native';

/** Typography scale using Inter font family. */
export const Typography = StyleSheet.create({
  /** 32px bold — hero headlines */
  h1: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  /** 24px semi-bold — section headings */
  h2: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  /** 20px semi-bold — card headings */
  h3: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  /** 17px medium — sub-headings */
  h4: {
    fontFamily: 'Inter_500Medium',
    fontSize: 17,
    lineHeight: 24,
  },
  /** 16px regular — body text */
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  /** 14px regular — secondary body */
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  /** 12px medium — captions, labels */
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  /** 11px semi-bold uppercase — overline labels */
  overline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  /** 16px semi-bold — button labels */
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  /** 28px bold — large stat numbers */
  stat: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
});
