declare module 'expo-video-thumbnails' {
  export interface VideoThumbnailResult {
    uri: string;
    width: number;
    height: number;
  }

  export interface VideoThumbnailOptions {
    time?: number;
    quality?: number;
    headers?: Record<string, string>;
  }

  export function getThumbnailAsync(
    sourceFilename: string,
    options?: VideoThumbnailOptions
  ): Promise<VideoThumbnailResult>;
}
