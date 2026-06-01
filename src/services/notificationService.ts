import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { addDays, parseISO, format, setHours, setMinutes } from 'date-fns';
import { CyclePrediction, NotificationSettings } from '../types';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async schedulePeriodReminder(prediction: CyclePrediction, daysBefore: number): Promise<void> {
    const periodDate = parseISO(prediction.next_period_start);
    const reminderDate = addDays(periodDate, -daysBefore);

    if (reminderDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Luna',
        body: daysBefore === 1
          ? 'Your period may start tomorrow. Take care of yourself.'
          : `Your period is expected in ${daysBefore} days.`,
        data: { type: 'period_reminder' },
      },
      trigger: {
        date: reminderDate,
      },
    });
  },

  async scheduleOvulationReminder(prediction: CyclePrediction): Promise<void> {
    const ovulationDate = parseISO(prediction.ovulation_date);
    const reminderDate = addDays(ovulationDate, -1);

    if (reminderDate <= new Date()) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Luna',
        body: 'Your fertile window begins tomorrow.',
        data: { type: 'ovulation_reminder' },
      },
      trigger: {
        date: reminderDate,
      },
    });
  },

  async scheduleDailyLogReminder(timeStr: string): Promise<void> {
    const [hours, minutes] = timeStr.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Luna',
        body: 'How are you feeling today? Take a moment to log.',
        data: { type: 'daily_log' },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      } as any,
    });
  },

  async scheduleMedicationReminder(name: string, timeStr: string): Promise<void> {
    const [hours, minutes] = timeStr.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Luna reminder',
        body: `Time for ${name}`,
        data: { type: 'medication', name },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
      } as any,
    });
  },

  async setupAllNotifications(
    settings: NotificationSettings,
    prediction?: CyclePrediction
  ): Promise<void> {
    await this.cancelAllNotifications();

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    if (prediction) {
      if (settings.period_reminder) {
        await this.schedulePeriodReminder(prediction, settings.period_reminder_days);
      }
      if (settings.ovulation_reminder) {
        await this.scheduleOvulationReminder(prediction);
      }
    }

    if (settings.daily_log_reminder) {
      await this.scheduleDailyLogReminder(settings.daily_log_time || '20:00');
    }

    for (const med of settings.medication_reminders || []) {
      if (med.enabled) {
        await this.scheduleMedicationReminder(med.name, med.time);
      }
    }
  },
};