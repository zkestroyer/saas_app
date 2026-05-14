import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../src/theme';
import AnimatedSplashScreen from '../src/components/splash-screen';
import { useAuthStore } from '../src/stores/auth-store';
import { supabase } from '../src/services/supabase';
import { registerForPushNotifications } from '../src/services/notification-service';

// Keep the native splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
});

/** Root layout — loads fonts, shows animated splash, wraps providers.
 * Handles Supabase auth state changes and push notification registration.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [showSplash, setShowSplash] = useState(true);
  const { setUser, setLoading } = useAuthStore();
  const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);

  /* Listen for Supabase auth state changes (session restore on app restart). */
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          /* Fetch full user profile from our users table */
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .is('deleted_at', null)
            .single();

          if (profile) {
            setUser(profile as any);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => { subscription.unsubscribe(); };
  }, [setUser, setLoading]);

  /* Register push notifications and handle notification taps. */
  useEffect(() => {
    registerForPushNotifications();

    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        /* Navigate to relevant screen based on notification data */
        if (data?.jobId) {
          router.push(`/(customer)/track/${data.jobId}` as any);
        } else if (data?.invoiceId) {
          router.push('/(customer)/invoices');
        }
      });

    return () => {
      if (notificationResponseListener.current) {
        notificationResponseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide the native splash once fonts are ready;
      // our custom animated splash takes over.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors.background }]} />
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'slide_from_right',
          }}
        />
        {showSplash && <AnimatedSplashScreen onFinish={handleSplashFinish} />}
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { flex: 1 },
});
