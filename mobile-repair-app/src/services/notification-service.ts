/** Push Notification Service — Expo Notifications integration.
 * Handles registration, permission management, and local/remote notifications.
 *
 * Per completeapp.md §2 (Product Requirements → Notifications).
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { NOTIFICATION_CHANNELS } from '../constants/app';

/** Configure default notification behavior (show when app is in foreground). */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Registers the device for push notifications and returns the Expo push token.
 * Returns null if running on a simulator or if permission is denied.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  /* Push notifications only work on physical devices */
  if (!Device.isDevice) {
    console.warn('[Notifications] Push notifications require a physical device.');
    return null;
  }

  /* Check / request permission */
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Notifications] Permission not granted.');
    return null;
  }

  /* Android: Create notification channels */
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.JOB_UPDATES, {
      name: 'Job Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F59E0B',
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.INVOICES, {
      name: 'Invoice Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });

    await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNELS.PROMOTIONS, {
      name: 'Promotions',
      importance: Notifications.AndroidImportance.LOW,
    });
  }

  /* Get Expo push token */
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId ?? undefined,
    });
    return tokenData.data;
  } catch (error) {
    console.error('[Notifications] Failed to get push token:', error);
    return null;
  }
}

/**
 * Schedules a local notification (for testing or offline use).
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>,
  channelId?: string,
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: 'default',
      ...(Platform.OS === 'android' && channelId ? { channelId } : {}),
    },
    trigger: null, /* Immediately */
  });

  return id;
}

/**
 * Sends a notification for a job status change.
 */
export async function notifyJobStatusChange(
  jobId: string,
  device: string,
  newStatus: string,
): Promise<void> {
  const statusMessages: Record<string, string> = {
    assigned: `A technician has been assigned to your ${device} repair.`,
    en_route: `Your technician is on the way for your ${device} repair.`,
    diagnosing: `Your ${device} is being diagnosed.`,
    repairing: `Your ${device} repair is in progress.`,
    completed: `Great news! Your ${device} repair is complete. 🎉`,
  };

  const message = statusMessages[newStatus] ?? `Your ${device} repair status has been updated.`;

  await sendLocalNotification(
    'Repair Update',
    message,
    { jobId, status: newStatus },
    NOTIFICATION_CHANNELS.JOB_UPDATES,
  );
}

/**
 * Sends a notification for invoice events.
 */
export async function notifyInvoiceEvent(
  invoiceId: string,
  event: 'created' | 'locked',
  total?: number,
): Promise<void> {
  const messages = {
    created: 'A new invoice has been generated for your repair.',
    locked: `Payment of $${total?.toFixed(2) ?? '0.00'} has been recorded. Thank you! 💳`,
  };

  await sendLocalNotification(
    event === 'locked' ? 'Payment Confirmed' : 'New Invoice',
    messages[event],
    { invoiceId, event },
    NOTIFICATION_CHANNELS.INVOICES,
  );
}

/**
 * Cancels all pending notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Gets the current badge count.
 */
export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

/**
 * Sets the badge count (iOS only).
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}
