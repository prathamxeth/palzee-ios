import { supabase } from './supabase';
import { MessageDbItem } from '../types';

export const chatService = {
  async getMessages(palCode: string): Promise<MessageDbItem[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('pal_code', palCode)
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        palCode: item.pal_code,
        senderId: item.user_id || item.sender_id || '',
        senderDisplayName: item.sender_display_name || item.user_display_name || 'Pal',
        content: item.content || item.message || '',
        createdAt: item.created_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async postMessage(palCode: string, senderId: string, senderDisplayName: string, content: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('messages').insert({
        pal_code: palCode,
        user_id: senderId,
        sender_display_name: senderDisplayName,
        content: content,
      });
      return !error;
    } catch {
      return false;
    }
  },

  subscribeToMessages(palCode: string, onNewMessage: (msg: MessageDbItem) => void) {
    return supabase
      .channel(`chat:${palCode}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `pal_code=eq.${palCode}` },
        (payload) => {
          const item = payload.new;
          onNewMessage({
            id: item.id,
            palCode: item.pal_code,
            senderId: item.user_id || item.sender_id || '',
            senderDisplayName: item.sender_display_name || item.user_display_name || 'Pal',
            content: item.content || item.message || '',
            createdAt: item.created_at || new Date().toISOString(),
          });
        }
      )
      .subscribe();
  },
};
