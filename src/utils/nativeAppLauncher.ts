import { Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

/**
 * Abre la aplicación nativa de Clima de Huawei (com.huawei.android.totemweather)
 * mediante un Intent nativo de Android.
 * Si no se encuentra la aplicación o se ejecuta en otra plataforma, invoca el fallback silencioso.
 */
export async function openHuaweiWeatherApp(fallbackCallback?: () => void): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName: 'com.huawei.android.totemweather',
        flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
      });
      return;
    } catch {
      // Bloque try/catch silencioso para evitar cierres inesperados
      fallbackCallback?.();
    }
  } else {
    fallbackCallback?.();
  }
}