import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { LiquidGlassPillBackground, LiquidGlassCapsule } from '../ui/LiquidGlassView';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { getLiveSandboxUri, formatExactTime } from '../../utils/mediaUtils';

/**
 * Calculates the Palzee 4 AM - 4 AM daily cycle for a timestamp.
 * A Palzee Day starts at 04:00:00 AM and ends at 03:59:59 AM the next morning.
 * Clips older than 7 Palzee cycles (8th day) are flushed out.
 */
export const getPalzeeCycleInfo = (ts?: string | Date | number, nowInput: Date = new Date()) => {
  const d = ts ? new Date(ts) : new Date();
  const validDate = isNaN(d.getTime()) ? new Date() : d;

  // Shift both dates back by 4 hours so 04:00:00 AM becomes 00:00:00 of that Palzee cycle
  const clipShifted = new Date(validDate.getTime() - 4 * 3600 * 1000);
  const nowShifted = new Date(nowInput.getTime() - 4 * 3600 * 1000);

  const clipDayStart = new Date(clipShifted.getFullYear(), clipShifted.getMonth(), clipShifted.getDate()).getTime();
  const nowDayStart = new Date(nowShifted.getFullYear(), nowShifted.getMonth(), nowShifted.getDate()).getTime();

  const diffDays = Math.floor((nowDayStart - clipDayStart) / (24 * 3600 * 1000));

  let dayLabel = 'Today';
  if (diffDays <= 0) {
    dayLabel = 'Today';
  } else if (diffDays === 1) {
    dayLabel = 'Yesterday';
  } else if (diffDays > 1 && diffDays < 7) {
    dayLabel = validDate.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    dayLabel = validDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return {
    diffDays,
    isWithin7Days: diffDays >= 0 && diffDays < 7,
    dayLabel,
  };
};

import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export const ChatDrawer = ({
  visible,
  onClose,
  onOpenCamera,
  onOpenVlog,
  palName,
  palCode = 'palzee_space',
  user,
  selectedThemeColor = 'orange',
  vlogList = [],
  activeVideoUri,
}: any) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const edgeColor = (Colors?.BorderGlow as any)?.[selectedThemeColor] || '#FE9068';
  const accentColor = edgeColor;
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const screenBg = isDark ? '#000000' : '#F5F5F7';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  const [messageText, setMessageText] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedPreviewClip, setSelectedPreviewClip] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatVideoRef = useRef<Video>(null);

  // Animations
  const expandAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(expandAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      friction: 9,
      tension: 65,
    }).start();
  }, [visible]);

  useEffect(() => {
    Animated.spring(previewAnim, {
      toValue: previewVisible ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 60,
    }).start();
  }, [previewVisible]);

  const [localVlogList, setLocalVlogList] = useState<any[]>(vlogList || []);

  useEffect(() => {
    if (Array.isArray(vlogList) && vlogList.length > 0) {
      setLocalVlogList(vlogList);
    } else {
      AsyncStorage.getItem('@palzee_vlog_list').then((cached) => {
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLocalVlogList(parsed);
            }
          } catch (e) {}
        }
      });
    }
  }, [vlogList, visible]);

  if (!visible) return null;

  const rawActiveList = Array.isArray(localVlogList) && localVlogList.length > 0 ? localVlogList : vlogList;

  // Filter clips to 7-day 4 AM - 4 AM Palzee cycles (flush clips older than 7 days)
  const valid7DayClips = (Array.isArray(rawActiveList) ? rawActiveList : []).filter((clip) => {
    return getPalzeeCycleInfo(clip.timestamp).isWithin7Days;
  });

  // Determine active cycle day label for the fixed bottom "view pal" box
  const latestClip = valid7DayClips.length > 0 ? valid7DayClips[valid7DayClips.length - 1] : null;
  const latestCycleInfo = latestClip ? getPalzeeCycleInfo(latestClip.timestamp) : null;
  const activeCycleDayLabel = (latestCycleInfo && latestCycleInfo.diffDays === 0)
    ? 'Today'
    : (latestCycleInfo && latestCycleInfo.diffDays === 1)
    ? 'Yesterday'
    : latestCycleInfo
    ? latestCycleInfo.dayLabel
    : 'Today';

  // Direct active item resolution
  const activePal = (valid7DayClips.length > 0)
    ? valid7DayClips.find((v) => Boolean(v?.thumbnailUri || v?.uri)) || valid7DayClips[0]
    : activeVideoUri
    ? { id: 'default', uri: activeVideoUri, thumbnailUri: '', timestamp: new Date().toISOString() }
    : null;

  const activePreviewClip = selectedPreviewClip || activePal;
  const currentVideoUri = getLiveSandboxUri(activePreviewClip?.uri || activeVideoUri || '');
  const currentThumbUri = getLiveSandboxUri(activePreviewClip?.thumbnailUri || '');

  const isVertical = Boolean(
    activePreviewClip?.needsRotation ||
    activePreviewClip?.mode === 'portrait' ||
    activePreviewClip?.mode === 'vertical' ||
    activePreviewClip?.mode === 'off'
  );

  // Preview Modal Rotation Math (cardWidth x cardHeight)
  const cardWidth = screenWidth - 20;
  const cardHeight = cardWidth * (9.5 / 16) + 20;
  const modalVideoWidth = cardHeight;
  const modalVideoHeight = cardWidth;
  const modalVideoTop = (cardHeight - modalVideoHeight) / 2;
  const modalVideoLeft = (cardWidth - modalVideoWidth) / 2;

  const modalRotatedStyle = isVertical
    ? {
        position: 'absolute' as const,
        top: modalVideoTop,
        left: modalVideoLeft,
        width: modalVideoWidth,
        height: modalVideoHeight,
        transform: [{ rotate: '270deg' }],
      }
    : StyleSheet.absoluteFillObject;

  // Clean pure time formatters
  const formatTime = (ts?: string) => {
    const d = ts ? new Date(ts) : new Date();
    const valid = isNaN(d.getTime()) ? new Date() : d;
    let h = valid.getHours();
    const m = valid.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const formatNearestHour = (ts?: string) => {
    const d = ts ? new Date(ts) : new Date();
    const valid = isNaN(d.getTime()) ? new Date() : d;
    let h = valid.getHours();
    if (valid.getMinutes() >= 30) h = (h + 1) % 24;
    return `${h.toString().padStart(2, '0')}:00`;
  };

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(0, 0, 0, 0.45)', opacity: expandAnim },
        ]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Main Animated Sheet Container */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: expandAnim,
            transform: [
              {
                translateY: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={false} showGlow={false}>
            <View
              style={[
                styles.container,
                {
                  backgroundColor: screenBg,
                  paddingBottom: 24,
                },
              ]}
            >
              {/* 1. TOP HEADER */}
              <View
                style={[styles.headerRow, { paddingTop: Math.max(insets.top - 1, 7) }]}
                pointerEvents="box-none"
              >
                <LiquidGlassIconButton idPrefix="btnChatBack" isDark={isDark} onPress={onClose}>
                  <Ionicons name="chevron-back" size={30} color={textColor} style={{ marginLeft: -1.5 }} />
                </LiquidGlassIconButton>

                <View style={styles.vlogPillWrapper} pointerEvents="box-none">
                  <LiquidGlassCapsule
                    idPrefix="chatVlogHeader"
                    isDark={isDark}
                    width={110}
                    height={45}
                  >
                    <Text
                      style={[
                        styles.vlogPillText,
                        { color: textColor, textAlign: 'center', zIndex: 10 },
                      ]}
                      numberOfLines={1}
                    >
                      {palName || 'vlog'}
                    </Text>
                  </LiquidGlassCapsule>
                </View>

                <View style={{ width: 44 }} />
              </View>

              {/* 2. CHAT FEED & THUMBNAILS SECTION */}
              <View style={styles.feedContainer}>
                {/* Scrollable Feed: Older days move up, Newer days (today) appear below */}
                <ScrollView
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'flex-end',
                    paddingTop: Math.max(insets.top - 1, 7) + 55,
                    paddingBottom: 8,
                  }}
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                  {(() => {
                    // Group clips by 4 AM daily cycle diffDays
                    const dayMap = new Map<number, { dayOffset: number; dayLabel: string; clips: any[] }>();

                    valid7DayClips.forEach((clip) => {
                      const cycle = getPalzeeCycleInfo(clip.timestamp);
                      if (!dayMap.has(cycle.diffDays)) {
                        dayMap.set(cycle.diffDays, {
                          dayOffset: cycle.diffDays,
                          dayLabel: cycle.dayLabel,
                          clips: [],
                        });
                      }
                      dayMap.get(cycle.diffDays)!.clips.push(clip);
                    });

                    // Sort chronologically from oldest (e.g. 6, 5, 4, 3, 2, 1) down to newest (0 = Today)
                    const sortedDayGroups = Array.from(dayMap.values()).sort((a, b) => b.dayOffset - a.dayOffset);

                    if (sortedDayGroups.length === 0) {
                      return <View style={{ flex: 1 }} />;
                    }

                    return sortedDayGroups.map((group) => {
                      return (
                        <View key={`day_group_${group.dayOffset}`} style={{ width: '100%', marginBottom: 16 }}>
                          {group.clips.map((clip, idx) => {
                            const isClipVertical = Boolean(
                              clip.needsRotation ||
                              clip.mode === 'portrait' ||
                              clip.mode === 'vertical' ||
                              clip.mode === 'off'
                            );

                            const clipThumbRotatedStyle = isClipVertical
                              ? {
                                  position: 'absolute' as const,
                                  top: (86 - 146) / 2,
                                  left: (146 - 86) / 2,
                                  width: 86,
                                  height: 146,
                                  transform: [{ rotate: '270deg' }],
                                }
                              : {
                                  width: 146,
                                  height: 86,
                                };

                            return (
                              <View key={clip.id || `vlog_clip_${group.dayOffset}_${idx}`} style={{ width: '100%', alignItems: 'flex-end', marginBottom: 14 }}>
                                {/* Timestamp Header Above Thumbnail: Day Text BOLD, Time Text REGULAR */}
                                <Text style={{ alignSelf: 'center', marginBottom: 10 }}>
                                  <Text
                                    style={{
                                      fontSize: 16.5,
                                      fontFamily: Fonts.SystemRoundedBold,
                                      fontWeight: '700',
                                      color: isDark ? '#8E8E93' : '#636366',
                                    }}
                                  >
                                    {group.dayLabel}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 16.5,
                                      fontFamily: Fonts.SystemRoundedRegular,
                                      fontWeight: '400',
                                      color: isDark ? '#8E8E93' : '#636366',
                                    }}
                                  >
                                    {` ${formatTime(clip.timestamp)}`}
                                  </Text>
                                </Text>

                                {/* Thumbnail Bubble (146 x 86px) */}
                                <TouchableOpacity
                                  activeOpacity={0.9}
                                  onPress={() => {
                                    setSelectedPreviewClip(clip);
                                    setPreviewVisible(true);
                                  }}
                                  style={[
                                    styles.thumbnailCard,
                                    { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)' },
                                  ]}
                                >
                                  {Boolean(clip.thumbnailUri) ? (
                                    <Image
                                      source={{ uri: clip.thumbnailUri }}
                                      style={clipThumbRotatedStyle}
                                      contentFit="cover"
                                    />
                                  ) : (
                                    <Video
                                      source={{ uri: clip.uri }}
                                      style={clipThumbRotatedStyle}
                                      videoStyle={isClipVertical ? { width: '100%', height: '100%' } : { width: 146, height: 86, borderRadius: 20 }}
                                      resizeMode={ResizeMode.COVER}
                                      shouldPlay={true}
                                      isLooping={true}
                                      isMuted={true}
                                    />
                                  )}
                                </TouchableOpacity>
                              </View>
                            );
                          })}

                          {/* THAT DAY'S VIEW PAL BOX ALIGNED IN STREAM */}
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              onClose();
                              if (onOpenVlog) onOpenVlog(group.dayOffset);
                            }}
                            style={[
                              styles.viewPalBtn,
                              {
                                marginTop: 6,
                                overflow: 'hidden',
                                backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                              },
                            ]}
                          >
                            <LiquidGlassPillBackground
                              idPrefix={`viewpal_${group.dayOffset}`}
                              isDark={isDark}
                              borderRadius={29}
                            />
                            <Text style={[styles.viewPalDayText, { color: textColor, zIndex: 5 }]}>
                              {group.dayLabel}
                            </Text>
                            <Text style={[styles.viewPalActionText, { color: edgeColor, zIndex: 5 }]}>
                              view pal
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    });
                  })()}
                </ScrollView>
              </View>

                {/* 3. BOTTOM INPUT BAR (Apple Liquid Glass Message Box + Previous Vlog Smiley Pill) */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                  <View style={styles.inputRow}>
                    <TouchableOpacity
                      style={[
                        styles.smileyBtn,
                        {
                          backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                          borderWidth: 0,
                          overflow: 'hidden',
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => {
                        onClose();
                        if (onOpenCamera) onOpenCamera();
                      }}
                    >
                      <LiquidGlassPillBackground
                        idPrefix="chatSmileyPill"
                        isDark={isDark}
                        borderRadius={21}
                      />
                      <View style={[styles.smileyCircle, { backgroundColor: edgeColor, zIndex: 5 }]}>
                        <Image
                          source={require('../../assets/images/custom_rotate_smiley.png')}
                          style={{ width: 25, height: 25 }}
                          contentFit="contain"
                        />
                      </View>
                    </TouchableOpacity>

                    {/* Apple Liquid Glass Message Box (Exact Edge-to-Edge Pill Geometry) */}
                    <View
                      style={[
                        styles.inputFieldContainer,
                        {
                          paddingLeft: 18,
                          paddingRight: 6,
                          overflow: 'hidden',
                          backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
                        },
                      ]}
                    >
                      <LiquidGlassPillBackground
                        idPrefix="chatInputMsg"
                        isDark={isDark}
                        borderRadius={26}
                      />
                      <TextInput
                        style={[styles.input, { color: textColor, zIndex: 5 }]}
                        placeholder="message"
                        placeholderTextColor={isDark ? '#8E8E93' : '#636366'}
                        value={messageText}
                        onChangeText={setMessageText}
                      />
                      {/* Apple Liquid Glass Upward Arrow Button */}
                      <TouchableOpacity
                        style={[
                          styles.sendBtn,
                          {
                            zIndex: 5,
                            overflow: 'hidden',
                          },
                        ]}
                        activeOpacity={0.75}
                        onPress={() => setMessageText('')}
                      >
                        <LiquidGlassPillBackground
                          idPrefix="chatSendArrow"
                          isDark={isDark}
                          borderRadius={19}
                          backgroundColor={
                            messageText.trim().length > 0
                              ? edgeColor
                              : isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(0, 0, 0, 0.06)'
                          }
                        />
                        <Ionicons
                          name="arrow-up"
                          size={20}
                          color={messageText.trim().length > 0 ? '#000000' : isDark ? '#FFFFFF' : '#000000'}
                          style={{ zIndex: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </KeyboardAvoidingView>

              {/* 4. PREVIEW VIDEO MODAL OVERLAY */}
              {previewVisible && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: isDark ? '#000000' : '#F5F5F7',
                      paddingTop: Math.max(insets.top, 12),
                      paddingBottom: Math.max(insets.bottom, 12),
                      zIndex: 200,
                      opacity: previewAnim,
                    },
                  ]}
                >
                  <View style={styles.headerRow}>
                    <LiquidGlassIconButton
                      idPrefix="btnClosePreview"
                      isDark={isDark}
                      onPress={() => setPreviewVisible(false)}
                    >
                      <Ionicons name="close" size={30} color={textColor} />
                    </LiquidGlassIconButton>
                    <View style={{ width: 44 }} />
                  </View>

                  <View style={styles.modalCenterContent}>
                    <View
                      style={{
                        width: screenWidth - 32,
                        height: (screenWidth - 32) * (9 / 16),
                        borderRadius: 28,
                        overflow: 'hidden',
                        backgroundColor: '#000000',
                      }}
                    >
                      <Video
                        key={currentVideoUri}
                        ref={chatVideoRef}
                        source={{ uri: currentVideoUri }}
                        style={modalRotatedStyle}
                        videoStyle={{ width: '100%', height: '100%', borderRadius: 28 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={false}
                        onPlaybackStatusUpdate={(status) => {
                          if (status.isLoaded && status.didJustFinish) {
                            chatVideoRef.current?.setPositionAsync(0).then(() => {
                              chatVideoRef.current?.playAsync();
                            }).catch(() => {});
                          }
                        }}
                      />

                      {/* Top-Left Avatar Badge */}
                      <View style={styles.modalBadge}>
                        <View style={[styles.avatarCircle, { backgroundColor: edgeColor }]}>
                          {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <Image
                              source={require('../../assets/images/capture_smile.png')}
                              style={{ width: 18, height: 18 }}
                              contentFit="contain"
                            />
                          )}
                        </View>
                        <Text style={styles.modalUserText}>{username}</Text>
                      </View>

                      {/* Center Rounded Hour & Caption */}
                      <View style={styles.modalCenterOverlay} pointerEvents="none">
                        <Text style={styles.modalHourText}>
                          {formatNearestHour(activePreviewClip?.timestamp)}
                        </Text>
                        {Boolean(activePreviewClip?.caption) && (
                          <Text style={styles.modalCaptionText}>{activePreviewClip?.caption}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          </DynamicGlowContainer>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    borderRadius: 36,
    overflow: 'hidden',
  },
  headerRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  vlogPillWrapper: {
    alignItems: 'center',
  },
  vlogPill: {
    width: 110,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vlogPillText: {
    fontSize: 22.5,
    fontFamily: Fonts.SystemRoundedBold,
  },
  feedContainer: {
    flex: 1,
    width: '100%',
  },
  timestampText: {
    fontSize: 16.5,
    fontFamily: Fonts.SystemRoundedMedium,
    marginBottom: 10,
  },
  thumbnailCard: {
    marginRight: 16,
    marginBottom: 14,
    width: 146,
    height: 86,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  viewPalBtn: {
    width: '92%',
    alignSelf: 'center',
    height: 58,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 8,
  },
  viewPalDayText: {
    fontSize: 22,
    fontFamily: Fonts.SystemRoundedBold,
  },
  viewPalActionText: {
    fontSize: 21,
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 10,
  },
  smileyBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  smileyCircle: {
    width: 26.5,
    height: 26.5,
    borderRadius: 13.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputFieldContainer: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 6,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 21,
    fontFamily: Fonts.SystemRoundedMedium,
    height: '100%',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCenterContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBadge: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  avatarCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalUserText: {
    fontSize: 18,
    fontFamily: Fonts.SystemRoundedSemibold,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalCenterOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modalHourText: {
    fontSize: 28,
    fontFamily: Fonts.DelaGothicOne,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  modalCaptionText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedSemibold,
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
