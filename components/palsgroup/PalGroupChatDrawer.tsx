import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  TextInput,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Platform,
  ScrollView,
  Modal,
  PanResponder,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { LiquidGlassPillBackground, LiquidGlassCapsule } from '../ui/LiquidGlassView';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { getLiveSandboxUri, formatExactTime } from '../../utils/mediaUtils';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { PalGroupMemeSoundsSheet, MemeSoundItem } from './PalGroupMemeSoundsSheet';
import { Audio } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { getPalzeeCycleInfo } from '../home/ChatDrawer';

export interface ChatMessage {
  id: string;
  sender: string;
  senderColor?: string;
  avatarText?: string;
  avatarUri?: string;
  text?: string;
  sound?: { name: string; soundUrl: string };
  timestamp: string;
  fullDateText?: string;
  isUser?: boolean;
  replyToPalId?: string;
}

export interface PalGroupChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera?: () => void;
  onOpenVlog?: (dayOffset?: number) => void;
  palName?: string;
  palCode?: string;
  user?: any;
  selectedThemeColor?: string;
  vlogList?: any[];
  activeVideoUri?: string | null;
  members?: string[];
  joinedMembers?: any[];
}

export const PalGroupChatDrawer: React.FC<PalGroupChatDrawerProps> = ({
  visible,
  onClose,
  onOpenCamera,
  onOpenVlog,
  palName = 'pals',
  palCode = 'palzee_space',
  user,
  selectedThemeColor = 'orange',
  vlogList = [],
  activeVideoUri,
  members = [],
  joinedMembers = [],
}) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const edgeColor = (Colors?.BorderGlow as any)?.[selectedThemeColor] || '#FE9068';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const screenBg = isDark ? '#000000' : '#F5F5F7';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  const [messageText, setMessageText] = useState('');
  const [showMemeSounds, setShowMemeSounds] = useState(false);
  const [playingMessageSoundId, setPlayingMessageSoundId] = useState<string | null>(null);
  const messageSoundObjectRef = useRef<Audio.Sound | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Tap Preview Modal
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedPreviewClip, setSelectedPreviewClip] = useState<any>(null);

  // Swipe Reply Modal
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReplyClip, setSelectedReplyClip] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const scrollViewRef = useRef<ScrollView>(null);
  const chatVideoRef = useRef<Video>(null);
  const replyVideoRef = useRef<Video>(null);

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

  // Load and save chat messages in AsyncStorage
  useEffect(() => {
    const loadSavedChat = async () => {
      try {
        const stored = await AsyncStorage.getItem(`@pal_group_chat_${palCode}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setChatMessages(parsed);
          }
        }
      } catch (e) {}
    };
    if (visible) {
      loadSavedChat();
    }
  }, [palCode, visible]);

  const persistMessages = async (msgs: ChatMessage[]) => {
    try {
      await AsyncStorage.setItem(`@pal_group_chat_${palCode}`, JSON.stringify(msgs));
    } catch (e) {}
  };

  const stopMessageAudio = async () => {
    try {
      if (messageSoundObjectRef.current) {
        await messageSoundObjectRef.current.stopAsync();
        await messageSoundObjectRef.current.unloadAsync();
        messageSoundObjectRef.current = null;
      }
    } catch (e) {}
    setPlayingMessageSoundId(null);
  };

  const handlePlayMessageSound = async (msgId: string, soundUrl: string) => {
    if (playingMessageSoundId === msgId) {
      await stopMessageAudio();
      return;
    }
    await stopMessageAudio();
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      const { sound } = await Audio.Sound.createAsync({ uri: soundUrl }, { shouldPlay: true });
      messageSoundObjectRef.current = sound;
      setPlayingMessageSoundId(msgId);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingMessageSoundId(null);
        }
      });
    } catch (e) {
      setPlayingMessageSoundId(null);
    }
  };

  // Send normal message (displayed as Apple message bubble)
  const handleSendMessage = () => {
    if (messageText.trim().length === 0) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: username,
      text: messageText.trim(),
      timestamp: timeStr,
      fullDateText: `Today ${timeStr}`,
      isUser: true,
    };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    persistMessages(updated);
    setMessageText('');
  };

  // Send swipe reply to a specific pal
  const handleSendSwipeReply = () => {
    if (replyText.trim().length === 0 || !selectedReplyClip) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: username,
      text: replyText.trim(),
      timestamp: timeStr,
      fullDateText: `Today ${timeStr}`,
      replyToPalId: selectedReplyClip.id,
      isUser: true,
    };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    persistMessages(updated);
    setReplyText('');
    setReplyModalVisible(false);
  };

  if (!visible) return null;

  const rawActiveList = Array.isArray(localVlogList) && localVlogList.length > 0 ? localVlogList : vlogList;

  // Filter clips to 7-day 4 AM - 4 AM Palzee cycles (flush clips older than 7 days)
  const valid7DayClips = (Array.isArray(rawActiveList) ? rawActiveList : []).filter((clip) => {
    return getPalzeeCycleInfo(clip.timestamp).isWithin7Days;
  });

  // Direct active item resolution
  const activePal = (valid7DayClips.length > 0)
    ? valid7DayClips.find((v) => Boolean(v?.thumbnailUri || v?.uri)) || valid7DayClips[0]
    : activeVideoUri
    ? { id: 'default', uri: activeVideoUri, thumbnailUri: '', timestamp: new Date().toISOString() }
    : null;

  const activePreviewClip = selectedPreviewClip || activePal;
  const currentVideoUri = getLiveSandboxUri(activePreviewClip?.uri || activeVideoUri || '');

  const isVertical = Boolean(
    activePreviewClip?.needsRotation ||
    activePreviewClip?.mode === 'portrait' ||
    activePreviewClip?.mode === 'vertical' ||
    activePreviewClip?.mode === 'off'
  );

  const isReplyClipVertical = Boolean(
    selectedReplyClip?.needsRotation ||
    selectedReplyClip?.mode === 'portrait' ||
    selectedReplyClip?.mode === 'vertical' ||
    selectedReplyClip?.mode === 'off'
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
              {/* 1. TOP HEADER (Back Chevron + Center Group Name Capsule) */}
              <View
                style={[styles.headerRow, { paddingTop: Math.max(insets.top - 1, 7) }]}
                pointerEvents="box-none"
              >
                <LiquidGlassIconButton idPrefix="btnPalChatBack" isDark={isDark} onPress={onClose}>
                  <Ionicons name="chevron-back" size={30} color={textColor} style={{ marginLeft: -1.5 }} />
                </LiquidGlassIconButton>

                <View style={styles.vlogPillWrapper} pointerEvents="box-none">
                  <LiquidGlassCapsule
                    idPrefix="palChatHeaderPill"
                    isDark={isDark}
                    width={118}
                    height={45}
                  >
                    <Text
                      style={[
                        styles.vlogPillText,
                        { color: textColor, textAlign: 'center', zIndex: 10, paddingHorizontal: 8 },
                      ]}
                      numberOfLines={1}
                    >
                      {palName}
                    </Text>
                  </LiquidGlassCapsule>
                </View>

                <View style={{ width: 44 }} />
              </View>

              {/* 2. CHAT FEED & THUMBNAILS SECTION */}
              <View style={styles.feedContainer}>
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
                  {/* RENDER CLIPS GROUPED BY 4 AM - 4 AM DAY CYCLES */}
                  {(() => {
                    const dayGroupsMap = new Map<number, { dayOffset: number; dayLabel: string; clips: any[] }>();
                    valid7DayClips.forEach((clip) => {
                      const info = getPalzeeCycleInfo(clip.timestamp);
                      if (!dayGroupsMap.has(info.diffDays)) {
                        dayGroupsMap.set(info.diffDays, {
                          dayOffset: info.diffDays,
                          dayLabel: info.dayLabel,
                          clips: [],
                        });
                      }
                      dayGroupsMap.get(info.diffDays)!.clips.push(clip);
                    });

                    const sortedDayGroups = Array.from(dayGroupsMap.values()).sort((a, b) => b.dayOffset - a.dayOffset);

                    return sortedDayGroups.map((group) => {
                      return (
                        <View key={`day_group_${group.dayOffset}`} style={{ width: '100%', marginBottom: 16 }}>
                          {/* All sent pals for this day */}
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

                            const palReplies = chatMessages.filter((m) => m.replyToPalId === clip.id);
                            const isUserClip =
                              clip.isUser !== false &&
                              (clip.isUser === true ||
                                !clip.sender ||
                                clip.sender === username ||
                                clip.sender === 'apple_user' ||
                                clip.sender === 'user_self');

                            return (
                              <View
                                key={clip.id || `pal_clip_${group.dayOffset}_${idx}`}
                                style={{
                                  width: '100%',
                                  alignItems: isUserClip ? 'flex-end' : 'flex-start',
                                  marginBottom: 14,
                                }}
                              >
                                {/* Sender Name above Thumbnail for other members */}
                                {!isUserClip && (
                                  <Text
                                    style={[
                                      styles.messageSenderHeader,
                                      { alignSelf: 'flex-start', marginLeft: 4, marginBottom: 2 },
                                    ]}
                                  >
                                    {clip.sender}
                                  </Text>
                                )}

                                {/* Timestamp Header Above Thumbnail: Day Text BOLD, Time Text REGULAR */}
                                <Text
                                  style={{
                                    alignSelf: isUserClip ? 'flex-end' : 'flex-start',
                                    marginBottom: 6,
                                    marginHorizontal: 4,
                                  }}
                                >
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

                                {/* SWIPEABLE THUMBNAIL (Right-aligned for user, Left-aligned for members) */}
                                <SwipeablePalThumbnailItem
                                  clip={clip}
                                  isUserClip={isUserClip}
                                  onTap={() => {
                                    setSelectedPreviewClip(clip);
                                    setPreviewVisible(true);
                                  }}
                                  onSwipeReply={() => {
                                    setSelectedReplyClip(clip);
                                    setReplyModalVisible(true);
                                  }}
                                >
                                  <View
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
                                  </View>
                                </SwipeablePalThumbnailItem>

                                {/* REACTION REPLIES DIRECTLY BELOW THIS PAL THUMBNAIL IN APPLE MESSAGE STYLE */}
                                {palReplies.map((reply) => {
                                  const isReplyUser =
                                    reply.isUser !== false &&
                                    (reply.isUser === true ||
                                      !reply.sender ||
                                      reply.sender === username ||
                                      reply.sender === 'apple_user');

                                  return (
                                    <View
                                      key={reply.id}
                                      style={{
                                        width: '100%',
                                        alignItems: isReplyUser ? 'flex-end' : 'flex-start',
                                        marginTop: 6,
                                      }}
                                    >
                                      {!isReplyUser && (
                                        <Text
                                          style={[
                                            styles.messageSenderHeader,
                                            { alignSelf: 'flex-start', marginLeft: 14, marginBottom: 2 },
                                          ]}
                                        >
                                          {reply.sender}
                                        </Text>
                                      )}
                                      <AppleMessageBubble
                                        isUser={isReplyUser}
                                        edgeColor={edgeColor}
                                        isDark={isDark}
                                        textColor={textColor}
                                        text={reply.text}
                                      />
                                    </View>
                                  );
                                })}
                              </View>
                            );
                          })}

                          {/* DISPLAY VIEW PAL PILL ONLY AFTER 4 AM - 4 AM DAY CYCLE COMPLETES (PAST DAYS) */}
                          {group.dayOffset >= 1 && (
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
                          )}
                        </View>
                      );
                    });
                  })()}

                  {/* DIRECT APPLE MESSAGES IN FEED (IMAGE 1 SPECIFICATION) */}
                  {chatMessages
                    .filter((m) => !m.replyToPalId)
                    .map((msg, index) => {
                      const isUser =
                        msg.isUser !== false &&
                        (msg.isUser === true ||
                          !msg.sender ||
                          msg.sender === username ||
                          msg.sender === 'apple_user' ||
                          msg.sender === 'user_self');

                      // Meme Sound Box
                      if (msg.sound) {
                        const isPlaying = playingMessageSoundId === msg.id;
                        return (
                          <TouchableOpacity
                            key={msg.id}
                            activeOpacity={0.8}
                            onPress={() => handlePlayMessageSound(msg.id, msg.sound!.soundUrl)}
                            style={[
                              styles.memeMsgBubble,
                              {
                                alignSelf: isUser ? 'flex-end' : 'flex-start',
                                overflow: 'hidden',
                                borderColor: isPlaying ? edgeColor : 'transparent',
                                borderWidth: isPlaying ? 1.5 : 0,
                                marginVertical: 4,
                              },
                            ]}
                          >
                            <LiquidGlassPillBackground
                              idPrefix={`msg_sound_${msg.id}`}
                              isDark={isDark}
                              borderRadius={24}
                              backgroundColor={
                                isPlaying
                                  ? isDark
                                    ? 'rgba(32, 28, 44, 0.90)'
                                    : 'rgba(255, 255, 255, 0.15)'
                                  : undefined
                              }
                            />
                            <View
                              style={[
                                styles.playMemeMsgBtn,
                                {
                                  backgroundColor: isPlaying
                                    ? edgeColor
                                    : isDark
                                    ? 'rgba(255, 255, 255, 0.15)'
                                    : 'rgba(0, 0, 0, 0.08)',
                                  zIndex: 10,
                                },
                              ]}
                            >
                              <Ionicons
                                name={isPlaying ? 'pause' : 'play'}
                                size={18}
                                color={isPlaying ? '#000000' : isDark ? '#FFFFFF' : '#000000'}
                                style={{ marginLeft: isPlaying ? 0 : 2 }}
                              />
                            </View>
                            <View style={{ flex: 1, zIndex: 10, marginRight: 8 }}>
                              <Text style={[styles.memeMsgTitle, { color: textColor }]} numberOfLines={1}>
                                {msg.sound.name}
                              </Text>
                              <Text style={[styles.memeMsgMeta, { color: isDark ? '#8E8E93' : '#636366' }]}>
                                meme • {msg.timestamp}
                              </Text>
                            </View>
                            <Image
                              source={require('../../assets/images/troll_face_clean.svg')}
                              style={{ width: 24, height: 24, opacity: 0.85, zIndex: 10 }}
                              contentFit="contain"
                            />
                          </TouchableOpacity>
                        );
                      }

                      // Apple Messages Text Bubble (Image 1 Exact Layout)
                      const showDateHeader =
                        index === 0 ||
                        chatMessages[index - 1]?.fullDateText !== msg.fullDateText;

                      return (
                        <View key={msg.id} style={{ width: '100%', marginVertical: 4 }}>
                          {/* Centered Timestamp Header (e.g. "Today 2:52 PM") */}
                          {showDateHeader && (
                            <Text style={styles.appleDateHeader}>
                              {msg.fullDateText || `Today ${msg.timestamp}`}
                            </Text>
                          )}

                          {/* Sender Name above bubble */}
                          <Text
                            style={[
                              styles.messageSenderHeader,
                              isUser
                                ? { alignSelf: 'flex-end', marginRight: 14 }
                                : { alignSelf: 'flex-start', marginLeft: 14 },
                            ]}
                          >
                            {msg.sender}
                          </Text>

                          {/* Apple Message Bubble with Authentic iMessage Tail */}
                          <AppleMessageBubble
                            isUser={isUser}
                            edgeColor={edgeColor}
                            isDark={isDark}
                            textColor={textColor}
                            text={msg.text}
                          />
                        </View>
                      );
                    })}
                </ScrollView>
              </View>

              {/* 3. BOTTOM INPUT BAR (Previous Vlog Smiley Pill + Message Box) */}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.inputRow}>
                  {/* Previous Vlog Smiley Pill */}
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
                      idPrefix="palChatSmileyPill"
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

                  {/* Apple Liquid Glass Message Box */}
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
                      idPrefix="palChatInputMsg"
                      isDark={isDark}
                      borderRadius={26}
                    />
                    <TextInput
                      style={[styles.input, { color: textColor, zIndex: 5 }]}
                      placeholder="message"
                      placeholderTextColor={isDark ? '#8E8E93' : '#636366'}
                      value={messageText}
                      onChangeText={setMessageText}
                      onSubmitEditing={handleSendMessage}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendBtn,
                        {
                          zIndex: 5,
                          overflow: 'hidden',
                        },
                      ]}
                      activeOpacity={0.75}
                      onPress={handleSendMessage}
                    >
                      <LiquidGlassPillBackground
                        idPrefix="palChatSendArrow"
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

              {/* 4. TAP PREVIEW VIDEO MODAL OVERLAY */}
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
                  <View
                    style={[styles.headerRow, { paddingTop: Math.max(insets.top - 1, 7) }]}
                    pointerEvents="box-none"
                  >
                    <LiquidGlassIconButton
                      idPrefix="btnClosePalChatPreview"
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

                      {/* Center Rounded Dela Gothic Hour & Caption */}
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

        {/* 5. SWIPE REPLY MODAL: FULL VIDEO PREVIEW WITH ELEVATED INPUT BAR */}
        <Modal
          visible={replyModalVisible}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setReplyModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: screenBg,
              paddingTop: Math.max(insets.top - 1, 7),
              paddingBottom: Math.max(insets.bottom, 12),
            }}
          >
            {/* Header: Chevron Back + Group Name Capsule */}
            <View
              style={[styles.headerRow, { paddingTop: Math.max(insets.top - 1, 7) }]}
              pointerEvents="box-none"
            >
              <LiquidGlassIconButton
                idPrefix="btnCloseReplyModal"
                isDark={isDark}
                onPress={() => setReplyModalVisible(false)}
              >
                <Ionicons name="chevron-back" size={30} color={textColor} style={{ marginLeft: -1.5 }} />
              </LiquidGlassIconButton>

              <View style={styles.vlogPillWrapper}>
                <LiquidGlassCapsule
                  idPrefix="replyHeaderPill"
                  isDark={isDark}
                  width={118}
                  height={45}
                >
                  <Text
                    style={[
                      styles.vlogPillText,
                      { color: textColor, textAlign: 'center', zIndex: 10, paddingHorizontal: 8 },
                    ]}
                    numberOfLines={1}
                  >
                    {palName}
                  </Text>
                </LiquidGlassCapsule>
              </View>

              <View style={{ width: 44 }} />
            </View>

            {/* Center: Full 16:9 Video Preview Card */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
              <View
                style={{
                  width: screenWidth - 36,
                  height: (screenWidth - 36) * (9.5 / 16),
                  borderRadius: 28,
                  overflow: 'hidden',
                  backgroundColor: '#000000',
                  shadowColor: '#000000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.20,
                  shadowRadius: 14,
                  elevation: 6,
                }}
              >
                {selectedReplyClip?.uri ? (
                  <Video
                    ref={replyVideoRef}
                    source={{ uri: getLiveSandboxUri(selectedReplyClip.uri) }}
                    style={
                      isReplyClipVertical
                        ? {
                            position: 'absolute' as const,
                            top: ((screenWidth - 36) * (9.5 / 16) - (screenWidth - 36)) / 2,
                            left: ((screenWidth - 36) - (screenWidth - 36) * (9.5 / 16)) / 2,
                            width: (screenWidth - 36) * (9.5 / 16),
                            height: screenWidth - 36,
                            transform: [{ rotate: '270deg' }],
                          }
                        : StyleSheet.absoluteFill
                    }
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping={true}
                    isMuted={false}
                  />
                ) : (
                  <Image
                    source={{ uri: selectedReplyClip?.thumbnailUri }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                  />
                )}
              </View>
            </View>

            {/* Bottom: Elevated Reply Message Input Bar with Meme Icon */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={styles.inputRow}>
                <LiquidGlassIconButton
                  idPrefix="btnSwipeReplyTroll"
                  isDark={isDark}
                  size={48}
                  onPress={() => setShowMemeSounds(true)}
                >
                  <Image
                    source={require('../../assets/images/troll_face_clean.svg')}
                    style={{ width: 36.5, height: 36.5 }}
                    contentFit="contain"
                  />
                </LiquidGlassIconButton>

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
                    idPrefix="swipeReplyInputMsg"
                    isDark={isDark}
                    borderRadius={26}
                  />
                  <TextInput
                    style={[styles.input, { color: textColor, zIndex: 5 }]}
                    placeholder="message"
                    placeholderTextColor={isDark ? '#8E8E93' : '#636366'}
                    value={replyText}
                    onChangeText={setReplyText}
                    autoFocus={true}
                    onSubmitEditing={handleSendSwipeReply}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      {
                        zIndex: 5,
                        overflow: 'hidden',
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={handleSendSwipeReply}
                  >
                    <LiquidGlassPillBackground
                      idPrefix="swipeReplySendArrow"
                      isDark={isDark}
                      borderRadius={19}
                      backgroundColor={
                        replyText.trim().length > 0
                          ? edgeColor
                          : isDark
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(0, 0, 0, 0.06)'
                      }
                    />
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={replyText.trim().length > 0 ? '#000000' : isDark ? '#FFFFFF' : '#000000'}
                      style={{ zIndex: 10 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* NATIVE MYINSTANTS MEME SOUNDS SHEET */}
        <PalGroupMemeSoundsSheet
          visible={showMemeSounds}
          onClose={() => setShowMemeSounds(false)}
          selectedThemeColor={selectedThemeColor}
          isDark={isDark}
          onSendSound={(sound) => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            const newMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: username,
              sound: { name: sound.name, soundUrl: sound.sound },
              timestamp: timeStr,
              fullDateText: `Today ${timeStr}`,
              isUser: true,
            };
            const updated = [...chatMessages, newMsg];
            setChatMessages(updated);
            persistMessages(updated);
          }}
        />
      </Animated.View>
    </View>
  );
};

// Apple iMessage Bubble Component with exact tail and theme styling
const AppleMessageBubble: React.FC<{
  isUser: boolean;
  edgeColor: string;
  isDark: boolean;
  textColor: string;
  text?: string;
  children?: React.ReactNode;
}> = ({ isUser, edgeColor, isDark, textColor, text, children }) => {
  const bubbleBg = isUser
    ? edgeColor
    : isDark
    ? '#26252A'
    : '#E9E9EB';

  const contentColor = isUser
    ? '#000000'
    : textColor;

  return (
    <View
      style={{
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        position: 'relative',
        maxWidth: '78%',
        marginRight: isUser ? 10 : 0,
        marginLeft: isUser ? 0 : 10,
        marginVertical: 2,
      }}
    >
      <View
        style={{
          backgroundColor: bubbleBg,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          borderBottomRightRadius: isUser ? 4 : 20,
          borderBottomLeftRadius: isUser ? 20 : 4,
          overflow: 'hidden',
        }}
      >
        {children ? (
          children
        ) : (
          <Text
            style={{
              fontSize: 17,
              fontFamily: Fonts.SystemRoundedMedium,
              lineHeight: 22,
              color: contentColor,
            }}
          >
            {text}
          </Text>
        )}
      </View>
      {/* Authentic iMessage Tail */}
      {isUser ? (
        <Svg
          width={14}
          height={18}
          viewBox="0 0 14 18"
          style={{ position: 'absolute', right: -6, bottom: 0 }}
        >
          <Path
            d="M0 0 C0 10.5 4.5 17.5 14 18 C6.5 17.5 0 14 0 0 Z"
            fill={bubbleBg}
          />
        </Svg>
      ) : (
        <Svg
          width={14}
          height={18}
          viewBox="0 0 14 18"
          style={{ position: 'absolute', left: -6, bottom: 0, transform: [{ scaleX: -1 }] }}
        >
          <Path
            d="M0 0 C0 10.5 4.5 17.5 14 18 C6.5 17.5 0 14 0 0 Z"
            fill={bubbleBg}
          />
        </Svg>
      )}
    </View>
  );
};

// Swipeable Thumbnail Wrapper (Left swipe on user pal, Right swipe on member pal)
const SwipeablePalThumbnailItem: React.FC<{
  clip: any;
  isUserClip: boolean;
  onTap: () => void;
  onSwipeReply: () => void;
  children: React.ReactNode;
}> = ({ isUserClip, onTap, onSwipeReply, children }) => {
  const panX = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;
        if (isUserClip) {
          if (dx < 0) panX.setValue(Math.max(dx, -80));
        } else {
          if (dx > 0) panX.setValue(Math.min(dx, 80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx } = gestureState;
        if (isUserClip && dx < -25) {
          onSwipeReply();
        } else if (!isUserClip && dx > 25) {
          onSwipeReply();
        }
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
        setTimeout(() => {
          isSwiping.current = false;
        }, 150);
      },
      onPanResponderTerminate: () => {
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
        isSwiping.current = false;
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  return (
    <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX: panX }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          if (!isSwiping.current) {
            onTap();
          }
        }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
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
  vlogPillText: {
    fontSize: 22,
    fontFamily: Fonts.SystemRoundedBold,
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  thumbnailCard: {
    width: 146,
    height: 86,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginLeft: 4,
  },
  replyBubble: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
  },
  replyText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedMedium,
  },
  appleDateHeader: {
    alignSelf: 'center',
    fontSize: 12,
    fontFamily: Fonts.SystemRoundedMedium,
    color: '#8E8E93',
    marginBottom: 6,
    marginTop: 10,
  },
  messageSenderHeader: {
    fontSize: 12,
    fontFamily: Fonts.SystemRoundedMedium,
    color: '#8E8E93',
    marginBottom: 3,
  },
  appleMessageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '78%',
    overflow: 'hidden',
  },
  appleMessageText: {
    fontSize: 17,
    fontFamily: Fonts.SystemRoundedMedium,
    lineHeight: 22,
  },
  viewPalBtn: {
    width: '100%',
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
  memeMsgBubble: {
    maxWidth: '85%',
    minWidth: 220,
    height: 60,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  playMemeMsgBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  memeMsgTitle: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedBold,
  },
  memeMsgMeta: {
    fontSize: 11,
    fontFamily: Fonts.SystemRoundedMedium,
    marginTop: 1,
  },
  textMsgBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textMsgContent: {
    fontSize: 17,
    fontFamily: Fonts.SystemRoundedMedium,
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


