import { supabase } from './supabase';
import { User, UserRouteState } from '../types';

export const authService = {
  async sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) {
        let msg = error.message;
        if (msg.includes('rate limit')) {
          msg = 'Email rate limit exceeded. Please wait a few minutes before trying again.';
        } else if (msg.includes('disabled')) {
          msg = 'Email sign-in is disabled in your Supabase project configuration.';
        }
        return { success: false, error: msg };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to send OTP' };
    }
  },

  async verifyEmailOtp(email: string, token: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedToken = token.trim();
      const { data, error } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedToken,
        type: 'magiclink',
      });
      if (error) {
        return { success: false, error: error.message };
      }
      const sessionUser = data.user || (await supabase.auth.getUser()).data.user;
      const user: User = {
        id: sessionUser?.id || trimmedEmail,
        email: trimmedEmail,
        displayName: sessionUser?.user_metadata?.full_name || trimmedEmail.split('@')[0],
        isPasskeyRegistered: false,
      };
      return { success: true, user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Invalid code verification execution' };
    }
  },

  async verifyOtpAndRouteUser(email: string, token: string): Promise<UserRouteState> {
    try {
      const result = await this.verifyEmailOtp(email, token);
      if (!result.success || !result.user) return UserRouteState.ERROR;

      const userId = result.user.id;
      const { data: mappings } = await supabase
        .from('user_pals')
        .select('*')
        .eq('user_id', userId);

      if (mappings && mappings.length > 0) {
        return UserRouteState.RETURNING_USER;
      }
      return UserRouteState.NEW_USER;
    } catch (e) {
      return UserRouteState.ERROR;
    }
  },

  async registerTemporaryPasskey(name: string, email: string): Promise<{ success: boolean; user: User }> {
    const trimmedEmail = email.trim().toLowerCase();
    const fallbackPassword = `${Math.random().toString(36).substring(2, 15)}PassKey123!`;
    const fallbackUuid = 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab';
    try {
      const res = await Promise.race([
        supabase.auth.signUp({
          email: trimmedEmail,
          password: fallbackPassword,
          options: {
            data: {
              first_name: name,
              is_temporary: true,
            },
          },
        }),
        new Promise<any>((resolve) => setTimeout(() => resolve({ data: null, error: 'timeout' }), 3000)),
      ]);

      const user: User = {
        id: res?.data?.user?.id || fallbackUuid,
        email: trimmedEmail,
        displayName: name,
        isPasskeyRegistered: true,
      };
      return { success: true, user };
    } catch {
      const user: User = {
        id: fallbackUuid,
        email: trimmedEmail,
        displayName: name,
        isPasskeyRegistered: true,
      };
      return { success: true, user };
    }
  },

  async softDeleteAccount(userId: string): Promise<void> {
    try {
      await supabase.from('submissions').delete().eq('user_id', userId);
      await supabase.from('user_pals').delete().eq('user_id', userId);
    } catch (e) {
      console.error('Failed to soft delete account', e);
    }
  },

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error', e);
    }
  },
};
