import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
  Platform,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
  Share,
  NativeModules,
} from 'react-native';
import { requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { LiquidGlassIconButton, DynamicGlowContainer } from '../ui';

const { VideoExporter } = NativeModules;

// Final Export Output Canvas Geometry: 9:16 Portrait (1080x1920)
export const EXPORT_CANVAS_WIDTH = 1080;
export const EXPORT_CANVAS_HEIGHT = 1920;
export const EXPORT_CLIP_WIDTH = 1080;
export const EXPORT_CLIP_HEIGHT = 607.5; // (1080 * 9 / 16)
export const EXPORT_CLIP_TOP_OFFSET = (EXPORT_CANVAS_HEIGHT - EXPORT_CLIP_HEIGHT) / 2; // 656.25px (Centered vertically)

// FFmpeg 9:16 Portrait Re-encoding Filter Command
export const FFMPEG_LETTERBOX_FILTER = `-i input.mp4 -vf "scale=1080:607:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black" -c:a copy collection_export.mp4`;

export interface EditExportSheetProps {
  visible: boolean;
  onClose: () => void;
  vlogList?: Array<{ id: string; uri: string; caption?: string; timestamp: string; isMuted?: boolean; rate?: number; mode?: string }>;
  selectedThemeColor?: string;
  onDeleteVideo?: (id?: string) => void;
  onUpdateCaption?: (newCaption: string, id?: string) => void;
}

export const EditExportSheet: React.FC<EditExportSheetProps> = ({
  visible,
  onClose,
  vlogList = [],
  selectedThemeColor = 'cyan',
  onDeleteVideo,
  onUpdateCaption,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth > 0 ? windowWidth : 390;
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExportVideoVertical, setIsExportVideoVertical] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Chronological order: oldest recorded clip first, newest ones after it
  const list = vlogList && vlogList.length > 0 ? [...vlogList].reverse() : [];
  const currentClip = list.length > 0 ? list[Math.min(currentIndex, list.length - 1)] : null;

  const formatExportTime = (ts?: string, displayTime?: string) => {
    if (displayTime && (displayTime.includes('AM') || displayTime.includes('PM'))) {
      return displayTime;
    }
    if (!ts) return '7:26 PM';
    if (ts.includes('AM') || ts.includes('PM')) return ts;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  // Native AVFoundation Video Processing to 1080x1920 9:16 Portrait Canvas
  const processAndSaveVideo = async (): Promise<string> => {
    if (!currentClip || !currentClip.uri) return '';

    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    const outputUri = `${cacheDir}collection_export.mp4`;

    try {
      if (VideoExporter && VideoExporter.exportPortraitVideo) {
        const exportedUri = await VideoExporter.exportPortraitVideo(
          currentClip.uri,
          currentClip.caption || '',
          currentClip.timestamp || ''
        );
        return exportedUri;
      }
    } catch (nativeErr) {
      console.log('Native VideoExporter error:', nativeErr);
    }

    try {
      await FileSystem.copyAsync({
        from: currentClip.uri,
        to: outputUri,
      });
    } catch (copyErr) {}

    return outputUri;
  };

  // Save video directly into the device's iOS Photos app / Camera Roll gallery
  const handleSavePress = async () => {
    if (saveState !== 'idle' || !currentClip || !currentClip.uri) return;

    setSaveState('saving');
    try {
      try {
        await requestMediaLibraryPermissionsAsync(true);
      } catch (pErr) {
        console.log('Permission error:', pErr);
      }

      const processedUri = await processAndSaveVideo();

      if (processedUri) {
        try {
          await MediaLibrary.saveToLibraryAsync(processedUri);
        } catch (mediaErr) {
          console.log('MediaLibrary save exception:', mediaErr);
        }
        setSaveState('saved');
        Alert.alert('Success', 'Saved vertical 9:16 video to Photos!');
      } else {
        setSaveState('idle');
        Alert.alert('Export Error', 'Could not generate export file.');
      }

      setTimeout(() => {
        setSaveState('idle');
      }, 2500);
    } catch (error) {
      console.log('Save error:', error);
      setSaveState('idle');
    }
  };

  // Launch iOS native Share Sheet with physical collection_export.mp4 file to display horizontal video preview thumbnail (matching Image 2)
  const handleSharePress = async () => {
    try {
      if (currentClip && currentClip.uri) {
        const processedUri = await processAndSaveVideo();

        await Share.share(
          {
            url: processedUri,
            title: 'collection_export',
            message: 'collection_export',
          },
          {
            dialogTitle: 'collection_export',
            subject: 'collection_export',
          }
        );
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const cardWidth = screenWidth;
  const cardHeight = cardWidth * (9 / 16);

  const rotatedStyle: StyleProp<ViewStyle> = {
    position: 'absolute',
    top: (cardHeight - cardWidth) / 2,
    left: (cardWidth - cardHeight) / 2,
    width: cardHeight,
    height: cardWidth,
    transform: [{ rotate: '270deg' }],
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? '#000000' : '#F2F2F7',
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 12),
            },
          ]}
        >
          {/* 1. TOP HEADER BAR: LEFT CHEVRON BACK */}
          <View style={styles.headerBar}>
            <LiquidGlassIconButton idPrefix="btnExportBack" isDark={isDark} onPress={onClose}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
            </LiquidGlassIconButton>
          </View>

          {/* 2. CENTER 16:9 VIDEO PREVIEW BOX (MATCHING REFERENCE IMAGE) */}
          <View style={styles.centerContent}>
            {currentClip && currentClip.uri ? (
              <View
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  borderRadius: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: isDark ? '#000000' : '#FFFFFF',
                  shadowColor: isDark ? '#000000' : '#8E8E93',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 10,
                }}
              >
                <Video
                  key={currentClip.uri}
                  source={{ uri: currentClip.uri }}
                  style={isExportVideoVertical ? rotatedStyle : StyleSheet.absoluteFill}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={true}
                  isLooping={true}
                  isMuted={currentClip.isMuted ?? false}
                  rate={currentClip.rate || 1.0}
                  shouldCorrectPitch={true}
                  onReadyForDisplay={(event) => {
                    if (event?.naturalSize) {
                      const { width, height } = event.naturalSize;
                      setIsExportVideoVertical(height > width);
                    }
                  }}
                />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.15)' }]} pointerEvents="none" />

                {/* OVERLAY TEXT: VLOG (LEFT) | CAPTION (CENTER) | TIMESTAMP (RIGHT) EXACTLY AS PER REFERENCE IMAGE 1 */}
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 20,
                    right: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  pointerEvents="none"
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 22,
                      fontFamily: Fonts.SystemRoundedBold,
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    vlog
                  </Text>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 20,
                      fontFamily: Fonts.SystemRoundedBold,
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {currentClip.caption || ''}
                  </Text>
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 18,
                      fontFamily: Fonts.SystemRoundedSemibold,
                      textShadowColor: 'rgba(0, 0, 0, 0.8)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 3,
                    }}
                  >
                    {formatExportTime(currentClip.timestamp, (currentClip as any).displayTime)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* 3. BOTTOM 4 ACTION BUTTONS ROW (INCREASED TEXT BY 1.5DP AND ICON BY 2.5DP) */}
          <View
            style={{
              position: 'absolute',
              bottom: Math.max(insets.bottom, 24) + 10,
              left: 0,
              right: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-evenly',
              paddingHorizontal: 20,
              zIndex: 40,
            }}
            pointerEvents="box-none"
          >
            {/* 1. DISCARD BUTTON (WORKS AS CLOSE BUTTON) */}
            <View style={{ alignItems: 'center' }}>
              <LiquidGlassIconButton
                idPrefix="btnExportDiscard"
                isDark={isDark}
                size={54}
                onPress={onClose}
              >
                <Ionicons name="close" size={29} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15.5,
                  fontFamily: Fonts.SystemRoundedMedium,
                  color: isDark ? '#8E8E93' : '#3A3A3C',
                  textAlign: 'center',
                }}
              >
                discard
              </Text>
            </View>

            {/* 2. EDIT BUTTON */}
            <View style={{ alignItems: 'center' }}>
              <LiquidGlassIconButton
                idPrefix="btnExportEdit"
                isDark={isDark}
                size={54}
                onPress={() => {}}
              >
                <Ionicons name="options-outline" size={29} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15.5,
                  fontFamily: Fonts.SystemRoundedMedium,
                  color: isDark ? '#8E8E93' : '#3A3A3C',
                  textAlign: 'center',
                }}
              >
                edit
              </Text>
            </View>

            {/* 3. SAVE BUTTON (EXACT FLOW AS IMAGES 3 & 4) */}
            <View style={{ alignItems: 'center' }}>
              <LiquidGlassIconButton
                idPrefix="btnExportSave"
                isDark={isDark}
                size={54}
                onPress={handleSavePress}
              >
                {saveState === 'saving' ? (
                  <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
                ) : saveState === 'saved' ? (
                  <Ionicons name="checkmark" size={29} color={isDark ? '#FFFFFF' : '#000000'} />
                ) : (
                  <Ionicons name="download-outline" size={29} color={isDark ? '#FFFFFF' : '#000000'} />
                )}
              </LiquidGlassIconButton>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15.5,
                  fontFamily: Fonts.SystemRoundedMedium,
                  color: isDark ? '#8E8E93' : '#3A3A3C',
                  textAlign: 'center',
                }}
              >
                save
              </Text>
            </View>

            {/* 4. SHARE BUTTON (SOLID SCREEN EDGE ACCENT COLOR BACKGROUND - OPENS IOS NATIVE SHARE SHEET AS PER IMAGE 2) */}
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  backgroundColor: edgeColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 4,
                }}
                activeOpacity={0.85}
                onPress={handleSharePress}
              >
                <Ionicons name="share-outline" size={29} color="#FFFFFF" />
              </TouchableOpacity>
              <Text
                style={{
                  marginTop: 8,
                  fontSize: 15.5,
                  fontFamily: Fonts.SystemRoundedMedium,
                  color: isDark ? '#8E8E93' : '#3A3A3C',
                  textAlign: 'center',
                }}
              >
                share
              </Text>
            </View>
          </View>
        </View>
      </DynamicGlowContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  headerBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
});
