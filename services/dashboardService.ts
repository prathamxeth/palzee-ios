import { supabase } from './supabase';
import { PalItem } from '../types';

export const dashboardService = {
  async getCleanHomescreenDashboard(currentUserId: string): Promise<PalItem[]> {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentUserId);
      const validUserId = isUuid ? currentUserId : 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab';

      const { data, error } = await supabase.rpc('get_clean_homescreen_dashboard', {
        current_user_uuid: validUserId,
      });

      if (error || !data) {
        console.warn('RPC Error or null data, returning default vlog card', error);
        return [
          {
            name: 'vlog',
            size: '',
            code: 'vlog',
            isVlog: true,
            isCreator: false,
          },
        ];
      }

      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      const vlogBoxSize = parsed.vlog_box_size || '';
      const groupsArray = parsed.groups || [];

      const defaultVlog: PalItem = {
        name: 'vlog',
        size: vlogBoxSize,
        code: 'vlog',
        isVlog: true,
        isCreator: false,
      };

      const mappedPals: PalItem[] = groupsArray.map((obj: any) => {
        const rawSize = obj.size;
        const groupSize = !rawSize || rawSize === '1' ? '4' : String(rawSize);
        return {
          name: obj.name || '',
          size: groupSize,
          code: obj.code || '',
          isVlog: false,
          isCreator: Boolean(obj.is_creator),
        };
      });

      return [defaultVlog, ...mappedPals];
    } catch (e) {
      console.error('getCleanHomescreenDashboard exception', e);
      return [
        {
          name: 'vlog',
          size: '',
          code: 'vlog',
          isVlog: true,
          isCreator: false,
        },
      ];
    }
  },
};
