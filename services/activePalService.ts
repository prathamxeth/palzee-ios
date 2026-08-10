import { supabase } from './supabase';
import { ActivePalState, MessageDbItem, SubmissionDbItem, UserPalMapping } from '../types';

export const activePalService = {
  async getActivePalDetails(
    palCode: string,
    currentUserId: string,
    currentDisplayName: string,
    firstName: string,
    currentAvatarUrl?: string | null,
    locallyDeletedSubmissions: Set<string> = new Set()
  ): Promise<ActivePalState> {
    const now = new Date();
    const currentSystemHour = now.getHours();

    // 1. Fetch submissions for palCode
    const { data: dbSubmissionsRaw } = await supabase
      .from('submissions')
      .select('*')
      .eq('pal_code', palCode);

    const dbSubmissions: SubmissionDbItem[] = (dbSubmissionsRaw || []).map((item: any) => ({
      id: item.id,
      palCode: item.pal_code,
      userId: item.user_id,
      userDisplayName: item.user_display_name || '',
      imageUrl: item.image_url || '',
      createdAt: item.created_at || new Date().toISOString(),
    }));

    // 2. Fetch messages for palCode
    const { data: dbMessagesRaw } = await supabase
      .from('messages')
      .select('*')
      .eq('pal_code', palCode)
      .order('created_at', { ascending: true });

    const dbMessages: MessageDbItem[] = (dbMessagesRaw || []).map((item: any) => ({
      id: item.id,
      palCode: item.pal_code,
      senderId: item.user_id || item.sender_id || '',
      senderDisplayName: item.sender_display_name || item.user_display_name || '',
      content: item.content || item.message || '',
      createdAt: item.created_at || new Date().toISOString(),
    }));

    // Filter submissions
    const filteredSubmissions = dbSubmissions.filter((sub) => {
      if (sub.imageUrl === 'PROFILE_AVATAR' || sub.imageUrl.startsWith('PROFILE_AVATAR')) return false;
      const cleanImg = sub.imageUrl.split('|||')[0];
      if (locallyDeletedSubmissions.has(cleanImg)) return false;
      if (sub.id && locallyDeletedSubmissions.has(String(sub.id))) return false;
      return true;
    });

    // 3. Fetch user_pals mappings
    const { data: mappingsRaw } = await supabase
      .from('user_pals')
      .select('*')
      .eq('pal_code', palCode);

    const mappings: UserPalMapping[] = (mappingsRaw || []).map((m: any) => ({
      id: m.id,
      palCode: m.pal_code,
      userId: m.user_id,
      userDisplayName: m.user_display_name,
      userAvatarUrl: m.user_avatar_url,
      createdAt: m.created_at,
    }));

    const memberList: string[] = [];
    const addedUserIds = new Set<string>();
    const userFirstName = currentDisplayName.split(' ')[0].split('_')[0].split('.')[0];

    mappings.forEach((mapping) => {
      if (mapping.userId && !addedUserIds.has(mapping.userId)) {
        const sub = dbSubmissions.find((s) => s.userId === mapping.userId);
        let displayName = userFirstName;
        let avatarUrl: string | null = null;

        if (sub) {
          const parts = sub.userDisplayName.split('|||');
          displayName = parts[0]?.split(' ')[0] || userFirstName;
          avatarUrl = parts[1] || null;
        } else if (mapping.userId === currentUserId) {
          displayName = userFirstName;
          avatarUrl = currentAvatarUrl?.startsWith('http') ? currentAvatarUrl : null;
        } else if (mapping.userDisplayName) {
          const parts = mapping.userDisplayName.split('|||');
          displayName = parts[0]?.split(' ')[0] || 'Pal';
          avatarUrl = parts[1] || mapping.userAvatarUrl || null;
        } else {
          displayName = 'Pal';
        }

        memberList.push(`${mapping.userId}|||${displayName}|||${avatarUrl || ''}`);
        addedUserIds.add(mapping.userId);
      }
    });

    dbSubmissions.forEach((sub) => {
      if (sub.userId && !addedUserIds.has(sub.userId)) {
        const parts = sub.userDisplayName.split('|||');
        const displayName = parts[0]?.split(' ')[0] || 'Pal';
        const avatarUrl = parts[1] || null;
        memberList.push(`${sub.userId}|||${displayName}|||${avatarUrl || ''}`);
        addedUserIds.add(sub.userId);
      }
    });

    // Group submissions by hour bucket
    const dailyHourHistoryMap: Record<number, SubmissionDbItem[]> = {};
    filteredSubmissions.forEach((sub) => {
      const date = new Date(sub.createdAt);
      const hour = date.getHours();
      if (!dailyHourHistoryMap[hour]) dailyHourHistoryMap[hour] = [];
      dailyHourHistoryMap[hour].push(sub);
    });

    const itemsInThisHour = dailyHourHistoryMap[currentSystemHour] || [];
    const activeHourSubmissions: Record<string, SubmissionDbItem> = {};
    itemsInThisHour.forEach((sub) => {
      activeHourSubmissions[sub.userId] = sub;
    });

    const memberCount = new Set(filteredSubmissions.map((s) => s.userId)).size;

    return {
      palCode,
      submissions: filteredSubmissions,
      messages: dbMessages,
      members: memberList,
      dailyHourHistory: dailyHourHistoryMap,
      activeHourSubmissions,
      exportData: dailyHourHistoryMap,
      memberCount,
    };
  },
};
