import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const KEYS = {
  USER: 'palzee_user',
  THEME_COLOR: 'palzee_theme_color',
  NOTIFICATION_INTERVAL: 'palzee_notification_interval',
  ONBOARDING_COMPLETED: 'palzee_onboarding_completed',
};

export const sessionStore = {
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  async clearUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (e) {
      console.error('Failed to clear user', e);
    }
  },

  async getThemeColor(): Promise<string> {
    try {
      return (await AsyncStorage.getItem(KEYS.THEME_COLOR)) || this.getRandomThemeColor();
    } catch {
      return this.getRandomThemeColor();
    }
  },

  getRandomThemeColor(): string {
    const themeKeys = ['blue', 'green', 'orange', 'pink', 'purple', 'cyan'];
    const randomIndex = Math.floor(Math.random() * themeKeys.length);
    return themeKeys[randomIndex];
  },

  async saveThemeColor(color: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.THEME_COLOR, color);
    } catch (e) {
      console.error('Failed to save theme color', e);
    }
  },

  async getNotificationInterval(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(KEYS.NOTIFICATION_INTERVAL);
      return val ? parseInt(val, 10) : 60;
    } catch {
      return 60;
    }
  },

  async saveNotificationInterval(minutes: number): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATION_INTERVAL, minutes.toString());
    } catch (e) {
      console.error('Failed to save notification interval', e);
    }
  },

  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set onboarding completed', e);
    }
  },
};
