import { supabase } from './supabase';

export const storageService = {
  async uploadMedia(uri: string, palCode: string, userId: string): Promise<string | null> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const ext = uri.endsWith('.mp4') || uri.endsWith('.mov') ? 'mp4' : 'jpg';
      const fileName = `${palCode}/${userId}_${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from('palzee-media')
        .upload(fileName, blob, {
          contentType: ext === 'mp4' ? 'video/mp4' : 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Storage upload error', error);
        return null;
      }

      const { data } = supabase.storage.from('palzee-media').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      console.error('Upload media exception', e);
      return null;
    }
  },
};
