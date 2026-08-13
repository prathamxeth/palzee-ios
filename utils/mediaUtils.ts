let VideoThumbnails: any = null;
try {
  VideoThumbnails = require('expo-video-thumbnails');
} catch (e) {
  VideoThumbnails = null;
}

// In-memory cache for extracted thumbnails
const thumbnailCache = new Map<string, string>();

/**
 * Extracts the 1st frame (time: 0) from a video URI with caching.
 */
export const generateVideoThumbnail = async (videoUri: string): Promise<string | null> => {
  if (!videoUri) return null;
  if (thumbnailCache.has(videoUri)) {
    return thumbnailCache.get(videoUri)!;
  }

  try {
    if (VideoThumbnails && VideoThumbnails.getThumbnailAsync) {
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 0, // True 1st frame
        quality: 0.8,
      });
      thumbnailCache.set(videoUri, uri);
      return uri;
    }
  } catch (e) {
    console.warn("Error generating video thumbnail:", e);
  }
  return videoUri;
};

/**
 * Formats exact dispatch time for chat headers (e.g., "7:26 PM").
 */
export const formatExactTime = (dateInput?: Date | string | number): string => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string' && (dateInput.includes('AM') || dateInput.includes('PM'))) {
    return dateInput;
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * Dynamically calculates "Today", "Yesterday", or formatted date.
 */
export const formatRelativeDay = (dateInput?: Date | string | number): string => {
  if (!dateInput) return 'Yesterday';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Yesterday';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 3600 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Rounds timestamp to nearest hour for thumbnail preview overlay (e.g., 18:33 -> "19:00", 18:20 -> "18:00").
 */
export const formatRoundedHour = (dateInput?: Date | string | number): string => {
  if (!dateInput) return '19:00';
  let date: Date;

  if (typeof dateInput === 'string') {
    const isPM = dateInput.toUpperCase().includes('PM');
    const isAM = dateInput.toUpperCase().includes('AM');
    const clean = dateInput.replace(/(AM|PM)/i, '').trim();
    const parts = clean.split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h)) {
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        if (!isNaN(m) && m >= 30) h = (h + 1) % 24;
        return `${String(h).padStart(2, '0')}:00`;
      }
    }
    date = new Date(dateInput);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return '19:00';
  const minutes = date.getMinutes();
  let hours = date.getHours();

  if (minutes >= 30) {
    hours = (hours + 1) % 24;
  }

  const paddedHours = hours.toString().padStart(2, '0');
  return `${paddedHours}:00`;
};

export const getNearestHourText = (timestamp?: string | number | Date): string => {
  return formatRoundedHour(timestamp);
};

export const getUserInitial = (name?: string): string => {
  if (!name || name.trim().length === 0) return 'P';
  return name.trim().charAt(0).toUpperCase();
};
