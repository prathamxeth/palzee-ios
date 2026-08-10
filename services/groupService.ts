import { supabase } from './supabase';

export const groupService = {
  async leaveGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_pals')
        .delete()
        .eq('user_id', userId)
        .eq('pal_code', groupId);
      return !error;
    } catch {
      return false;
    }
  },

  async deleteGroup(groupId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pals')
        .delete()
        .eq('pal_code', groupId);
      return !error;
    } catch {
      return false;
    }
  },

  async joinGroupByCode(userId: string, palCode: string, userDisplayName: string): Promise<boolean> {
    try {
      const { data: pal } = await supabase
        .from('pals')
        .select('*')
        .eq('pal_code', palCode)
        .maybeSingle();

      if (!pal) return false;

      const { error } = await supabase.from('user_pals').insert({
        user_id: userId,
        pal_code: palCode,
        user_display_name: userDisplayName,
      });

      return !error;
    } catch {
      return false;
    }
  },

  async createGroup(userId: string, groupName: string, userDisplayName: string): Promise<{ success: boolean; palCode?: string }> {
    try {
      const palCode = Math.floor(100000 + Math.random() * 900000).toString();
      const { error: palErr } = await supabase.from('pals').insert({
        pal_code: palCode,
        name: groupName,
      });

      if (palErr) return { success: false };

      const { error: userPalErr } = await supabase.from('user_pals').insert({
        user_id: userId,
        pal_code: palCode,
        user_display_name: userDisplayName,
        is_creator: true,
      });

      if (userPalErr) return { success: false };

      return { success: true, palCode };
    } catch {
      return { success: false };
    }
  },
};
