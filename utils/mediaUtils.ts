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
 * Safely parses Date from ISO string, Date object, or 12-hr time string (e.g. "7:26 PM")
 */
export const parseToDate = (timeInput?: string | number | Date): Date | null => {
  if (!timeInput) return null;
  if (timeInput instanceof Date) return isNaN(timeInput.getTime()) ? null : timeInput;

  // Try standard Date parsing (ISO strings, Unix timestamps)
  const parsed = new Date(timeInput);
  if (!isNaN(parsed.getTime())) return parsed;

  // Handle 12-hour string format e.g. "7:26 PM" or "07:26 AM"
  if (typeof timeInput === 'string') {
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = timeInput.trim().match(timeRegex);
    if (match) {
      const today = new Date();
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      today.setHours(hours, minutes, 0, 0);
      return today;
    }
  }

  return null;
};

/**
 * Calculates exact chat timestamp dynamically without hardcoded fallbacks
 */
export const getDisplayTimestamp = (item?: any): string => {
  if (!item) return '';
  const date = parseToDate(item.createdAt || item.timestamp || item.date);
  if (!date) {
    if (typeof item.timestamp === 'string' && item.timestamp.length > 0) {
      return item.timestamp;
    }
    return '';
  }
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

/**
 * Calculates dynamic day label ("Today", "Yesterday", or Date) without hardcoding
 */
export const getDayLabel = (item?: any): string => {
  if (!item) return '';
  const date = parseToDate(item.createdAt || item.timestamp || item.date);
  if (!date) return 'Today';

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 3600 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

/**
 * Calculates dynamic nearest hour (e.g., 18:33 / 7:26 PM -> "19:00")
 */
export const getNearestHourText = (timeInput?: string | number | Date): string => {
  const date = parseToDate(timeInput) || new Date();
  const minutes = date.getMinutes();
  let hours = date.getHours();

  if (minutes >= 30) {
    hours = (hours + 1) % 24;
  }

  return `${hours.toString().padStart(2, '0')}:00`;
};

/**
 * Formats exact dispatch time for chat headers
 */
export const formatExactTime = (dateInput?: Date | string | number): string => {
  return getDisplayTimestamp({ timestamp: dateInput });
};

/**
 * Formats relative day for chat headers
 */
export const formatRelativeDay = (dateInput?: Date | string | number): string => {
  return getDayLabel({ timestamp: dateInput });
};

/**
 * Rounds timestamp to nearest hour
 */
export const formatRoundedHour = (dateInput?: Date | string | number): string => {
  return getNearestHourText(dateInput);
};

export const getUserInitial = (name?: string): string => {
  if (!name || name.trim().length === 0) return 'P';
  return name.trim().charAt(0).toUpperCase();
};
