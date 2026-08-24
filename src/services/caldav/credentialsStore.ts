import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY_APPLE_ID = 'icloud_apple_id';
const KEY_APP_PASSWORD = 'icloud_app_password';
const KEY_CALDAV_URL = 'icloud_caldav_url';
const KEY_CALENDARS_HOME = 'icloud_calendars_home';

const webStorage: Record<string, string> = {};

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return await SecureStore.isAvailableAsync();
}

export const credentialsStore = {
  async saveCredentials(appleId: string, appPassword: string, caldavUrl: string = 'https://caldav.icloud.com'): Promise<void> {
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.setItemAsync(KEY_APPLE_ID, appleId);
      await SecureStore.setItemAsync(KEY_APP_PASSWORD, appPassword);
      await SecureStore.setItemAsync(KEY_CALDAV_URL, caldavUrl);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY_APPLE_ID, appleId);
      localStorage.setItem(KEY_APP_PASSWORD, appPassword);
      localStorage.setItem(KEY_CALDAV_URL, caldavUrl);
    } else {
      webStorage[KEY_APPLE_ID] = appleId;
      webStorage[KEY_APP_PASSWORD] = appPassword;
      webStorage[KEY_CALDAV_URL] = caldavUrl;
    }
  },

  async getCredentials(): Promise<{ appleId: string | null; appPassword: string | null; caldavUrl: string }> {
    const available = await isSecureStoreAvailable();
    let appleId: string | null = null;
    let appPassword: string | null = null;
    let caldavUrl: string | null = null;

    if (available) {
      appleId = await SecureStore.getItemAsync(KEY_APPLE_ID);
      appPassword = await SecureStore.getItemAsync(KEY_APP_PASSWORD);
      caldavUrl = await SecureStore.getItemAsync(KEY_CALDAV_URL);
    } else if (typeof localStorage !== 'undefined') {
      appleId = localStorage.getItem(KEY_APPLE_ID);
      appPassword = localStorage.getItem(KEY_APP_PASSWORD);
      caldavUrl = localStorage.getItem(KEY_CALDAV_URL);
    } else {
      appleId = webStorage[KEY_APPLE_ID] || null;
      appPassword = webStorage[KEY_APP_PASSWORD] || null;
      caldavUrl = webStorage[KEY_CALDAV_URL] || null;
    }

    return {
      appleId,
      appPassword,
      caldavUrl: caldavUrl || 'https://caldav.icloud.com',
    };
  },

  async clearCredentials(): Promise<void> {
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.deleteItemAsync(KEY_APPLE_ID);
      await SecureStore.deleteItemAsync(KEY_APP_PASSWORD);
      await SecureStore.deleteItemAsync(KEY_CALENDARS_HOME);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(KEY_APPLE_ID);
      localStorage.removeItem(KEY_APP_PASSWORD);
      localStorage.removeItem(KEY_CALENDARS_HOME);
    } else {
      delete webStorage[KEY_APPLE_ID];
      delete webStorage[KEY_APP_PASSWORD];
      delete webStorage[KEY_CALENDARS_HOME];
    }
  },

  async saveCalendarsHome(url: string): Promise<void> {
    const available = await isSecureStoreAvailable();
    if (available) {
      await SecureStore.setItemAsync(KEY_CALENDARS_HOME, url);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEY_CALENDARS_HOME, url);
    } else {
      webStorage[KEY_CALENDARS_HOME] = url;
    }
  },

  async getCalendarsHome(): Promise<string | null> {
    const available = await isSecureStoreAvailable();
    if (available) {
      return await SecureStore.getItemAsync(KEY_CALENDARS_HOME);
    } else if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(KEY_CALENDARS_HOME);
    }
    return webStorage[KEY_CALENDARS_HOME] || null;
  },
};
