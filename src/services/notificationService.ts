import { Platform } from 'react-native';

let Notifications: any = null;

try {
  Notifications = require('expo-notifications');
  if (Notifications && Notifications.setNotificationHandler) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
} catch {
  // Expo notifications no disponible en web
}

export const notificationService = {
  /**
   * Programa una notificación local para una tarea con fecha y hora
   */
  async scheduleTaskAlarm(
    taskId: string,
    title: string,
    dueDate: string, // YYYY-MM-DD
    dueTime?: string | null, // HH:mm
    notes?: string | null
  ): Promise<string | null> {
    if (!Notifications || Platform.OS === 'web') return null;

    try {
      const [y, m, d] = dueDate.split('-').map(Number);
      let hour = 9;
      let minute = 0;

      if (dueTime) {
        const [h, min] = dueTime.split(':').map(Number);
        hour = h || 0;
        minute = min || 0;
      }

      const triggerDate = new Date(y, (m || 1) - 1, d || 1, hour, minute, 0);

      // Si la fecha ya pasó, no programar
      if (triggerDate.getTime() <= Date.now()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 Recordatorio: ${title}`,
          body: notes || 'Vence ahora',
          data: { taskId },
          sound: 'default',
        },
        trigger: {
          date: triggerDate,
        },
      });

      return notificationId;
    } catch (e) {
      console.warn('No se pudo programar la notificación de la tarea:', e);
      return null;
    }
  },

  /**
   * Cancela una notificación programada
   */
  async cancelNotification(notificationId?: string | null): Promise<void> {
    if (!Notifications || !notificationId || Platform.OS === 'web') return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (e) {
      console.warn('Error cancelando notificación:', e);
    }
  },
};
