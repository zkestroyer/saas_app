import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * Revivix animated splash screen.
 * Features: pulsing glow ring, icon zoom-in, animated tagline,
 * particle orbs, and a smooth fade-out transition.
 */
export default function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.5)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;
  const shimmerPosition = useRef(new Animated.Value(-width)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.8)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  // Particle orbs
  const orb1Opacity = useRef(new Animated.Value(0)).current;
  const orb1TranslateY = useRef(new Animated.Value(0)).current;
  const orb1TranslateX = useRef(new Animated.Value(0)).current;
  const orb2Opacity = useRef(new Animated.Value(0)).current;
  const orb2TranslateY = useRef(new Animated.Value(0)).current;
  const orb2TranslateX = useRef(new Animated.Value(0)).current;
  const orb3Opacity = useRef(new Animated.Value(0)).current;
  const orb3TranslateY = useRef(new Animated.Value(0)).current;
  const orb3TranslateX = useRef(new Animated.Value(0)).current;

  // Loading bar
  const loadingBarWidth = useRef(new Animated.Value(0)).current;
  const loadingBarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Phase 1: Glow + Logo entrance (0ms)
    Animated.parallel([
      // Glow pulse in
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(glowScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      // Logo scale in with spring
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Phase 2: Expanding rings (400ms)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(ringScale, {
              toValue: 2.2,
              duration: 1800,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0.6,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Second ring with offset
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.parallel([
              Animated.timing(ring2Scale, {
                toValue: 2.5,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(ring2Opacity, {
                toValue: 0.4,
                duration: 300,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(ring2Opacity, {
              toValue: 0,
              duration: 1700,
              useNativeDriver: true,
            }),
            Animated.timing(ring2Scale, {
              toValue: 0.8,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }, 600);
    }, 400);

    // Phase 3: Floating orbs (600ms)
    setTimeout(() => {
      // Orb 1
      Animated.parallel([
        Animated.timing(orb1Opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb1TranslateY, { toValue: -30, duration: 2000, useNativeDriver: true }),
            Animated.timing(orb1TranslateY, { toValue: 0, duration: 2000, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb1TranslateX, { toValue: 15, duration: 3000, useNativeDriver: true }),
            Animated.timing(orb1TranslateX, { toValue: -15, duration: 3000, useNativeDriver: true }),
          ])
        ),
      ]).start();

      // Orb 2
      Animated.parallel([
        Animated.timing(orb2Opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb2TranslateY, { toValue: 25, duration: 2500, useNativeDriver: true }),
            Animated.timing(orb2TranslateY, { toValue: -25, duration: 2500, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb2TranslateX, { toValue: -20, duration: 2800, useNativeDriver: true }),
            Animated.timing(orb2TranslateX, { toValue: 20, duration: 2800, useNativeDriver: true }),
          ])
        ),
      ]).start();

      // Orb 3
      Animated.parallel([
        Animated.timing(orb3Opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb3TranslateY, { toValue: -20, duration: 1800, useNativeDriver: true }),
            Animated.timing(orb3TranslateY, { toValue: 20, duration: 1800, useNativeDriver: true }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(orb3TranslateX, { toValue: 10, duration: 2200, useNativeDriver: true }),
            Animated.timing(orb3TranslateX, { toValue: -10, duration: 2200, useNativeDriver: true }),
          ])
        ),
      ]).start();
    }, 600);

    // Phase 4: Brand text (800ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(taglineTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);

    // Phase 5: Subtitle (1100ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1100);

    // Phase 6: Loading bar (1300ms)
    setTimeout(() => {
      Animated.timing(loadingBarOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();

      Animated.timing(loadingBarWidth, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: false,
      }).start();
    }, 1300);

    // Phase 7: Shimmer sweep (1600ms)
    setTimeout(() => {
      Animated.timing(shimmerPosition, {
        toValue: width,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }, 1600);

    // Phase 8: Fade out & finish (3300ms)
    setTimeout(() => {
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3300);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <LinearGradient
        colors={['#060A1E', '#0A0E27', '#0D1535', '#0A0E27', '#060A1E']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient background glow */}
      <View style={styles.ambientGlowContainer}>
        <Animated.View
          style={[
            styles.ambientGlow,
            styles.ambientGlowCyan,
            { opacity: glowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.ambientGlow,
            styles.ambientGlowBlue,
            { opacity: glowOpacity },
          ]}
        />
      </View>

      {/* Floating orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            opacity: orb1Opacity,
            transform: [
              { translateY: orb1TranslateY },
              { translateX: orb1TranslateX },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            opacity: orb2Opacity,
            transform: [
              { translateY: orb2TranslateY },
              { translateX: orb2TranslateX },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            opacity: orb3Opacity,
            transform: [
              { translateY: orb3TranslateY },
              { translateX: orb3TranslateX },
            ],
          },
        ]}
      />

      {/* Center content */}
      <View style={styles.centerContent}>
        {/* Expanding rings */}
        <View style={styles.ringContainer}>
          <Animated.View
            style={[
              styles.ring,
              {
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              {
                opacity: ring2Opacity,
                transform: [{ scale: ring2Scale }],
              },
            ]}
          />
        </View>

        {/* Glow behind logo */}
        <Animated.View
          style={[
            styles.logoGlow,
            {
              opacity: glowOpacity,
              transform: [{ scale: glowScale }],
            },
          ]}
        />

        {/* App Icon */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Shimmer sweep over logo */}
          <Animated.View
            style={[
              styles.shimmer,
              {
                transform: [{ translateX: shimmerPosition }],
              },
            ]}
          >
            <LinearGradient
              colors={[
                'transparent',
                'rgba(56, 189, 248, 0.15)',
                'rgba(255, 255, 255, 0.25)',
                'rgba(56, 189, 248, 0.15)',
                'transparent',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </Animated.View>

        {/* Brand name */}
        <Animated.View
          style={{
            opacity: taglineOpacity,
            transform: [{ translateY: taglineTranslateY }],
          }}
        >
          <Text style={styles.brandName}>REVIVIX</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={{
            opacity: subtitleOpacity,
            transform: [{ translateY: subtitleTranslateY }],
          }}
        >
          <Text style={styles.tagline}>Repair. Restore. Revive.</Text>
        </Animated.View>
      </View>

      {/* Bottom loading bar */}
      <View style={styles.bottomSection}>
        <Animated.View style={[styles.loadingBarContainer, { opacity: loadingBarOpacity }]}>
          <Animated.View style={styles.loadingBarTrack}>
            <Animated.View
              style={[
                styles.loadingBarFill,
                {
                  width: loadingBarWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            >
              <LinearGradient
                colors={['#206BC4', '#38BDF8', '#206BC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.versionText, { opacity: subtitleOpacity }]}>
          v1.0.0
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const LOGO_SIZE = 140;
const RING_SIZE = LOGO_SIZE + 40;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlowContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
  },
  ambientGlowCyan: {
    top: height * 0.15,
    right: -width * 0.2,
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
  },
  ambientGlowBlue: {
    bottom: height * 0.15,
    left: -width * 0.2,
    backgroundColor: 'rgba(32, 107, 196, 0.06)',
  },
  orb: {
    position: 'absolute',
    borderRadius: 50,
  },
  orb1: {
    width: 8,
    height: 8,
    backgroundColor: '#38BDF8',
    top: height * 0.25,
    left: width * 0.2,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  orb2: {
    width: 6,
    height: 6,
    backgroundColor: '#206BC4',
    top: height * 0.35,
    right: width * 0.15,
    shadowColor: '#206BC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 5,
  },
  orb3: {
    width: 10,
    height: 10,
    backgroundColor: '#4A8EEC',
    bottom: height * 0.3,
    left: width * 0.3,
    shadowColor: '#4A8EEC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  ring2: {
    borderColor: 'rgba(32, 107, 196, 0.25)',
  },
  logoGlow: {
    position: 'absolute',
    width: LOGO_SIZE + 60,
    height: LOGO_SIZE + 60,
    borderRadius: (LOGO_SIZE + 60) / 2,
    backgroundColor: 'rgba(32, 107, 196, 0.15)',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 10,
  },
  logoContainer: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: 32,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: LOGO_SIZE,
  },
  shimmerGradient: {
    flex: 1,
  },
  brandName: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: Colors.textPrimary,
    letterSpacing: 8,
    marginTop: 32,
    textShadowColor: 'rgba(56, 189, 248, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.textSecondary,
    letterSpacing: 3,
    marginTop: 10,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 60,
  },
  loadingBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingBarTrack: {
    width: 200,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.textMuted,
    marginTop: 16,
    letterSpacing: 1,
  },
});
