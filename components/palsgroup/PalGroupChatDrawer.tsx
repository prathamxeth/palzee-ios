import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Image } from 'expo-image';
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
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { PalGroupMemeSoundsSheet, MemeSoundItem } from './PalGroupMemeSoundsSheet';
import { Audio } from 'expo-av';

export interface PalGroupChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera?: () => void;
  palName: string;
  palCode?: string;
  user: any;
  selectedThemeColor?: string;
  vlogList?: any[];
  isDark?: boolean;
}

export const PalGroupChatDrawer: React.FC<PalGroupChatDrawerProps> = ({
  visible,
  onClose,
  onOpenCamera,
  palName,
  palCode = 'palzee_space',
  user,
  selectedThemeColor = 'orange',
  vlogList = [],
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
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      sender: string;
      text?: string;
      sound?: { name: string; soundUrl: string };
      timestamp: string;
    }>
  >([]);

  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedPreviewClip, setSelectedPreviewClip] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const chatVideoRef = useRef<Video>(null);

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

  const handleSendMessage = () => {
    if (messageText.trim().length === 0) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: username,
        text: messageText.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setMessageText('');
  };

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

  if (!visible) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          zIndex: 99999,
          elevation: 99999,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: screenBg,
            transform: [
              {
                translateY: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenHeight, 0],
                }),
              },
            ],
            paddingTop: Math.max(insets.top - 1, 7),
            paddingBottom: 24,
          },
        ]}
      >
        {/* 1. TOP HEADER (Pal Group Name Capsule) */}
        <View style={styles.headerRow}>
          <LiquidGlassIconButton idPrefix="btnGroupChatBack" isDark={isDark} onPress={onClose}>
            <Ionicons name="chevron-back" size={30} color={textColor} style={{ marginLeft: -1.5 }} />
          </LiquidGlassIconButton>

          <View style={styles.vlogPillWrapper} pointerEvents="box-none">
            <LiquidGlassCapsule
              idPrefix="groupChatHeaderPill"
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
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 8, gap: 10 }}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {chatMessages.map((msg) => {
              if (msg.sound) {
                const isPlaying = playingMessageSoundId === msg.id;
                return (
                  <View
                    key={msg.id}
                    style={[
                      styles.memeMsgBubble,
                      {
                        alignSelf: 'flex-end',
                        overflow: 'hidden',
                        borderColor: isPlaying ? edgeColor : 'transparent',
                        borderWidth: isPlaying ? 1.5 : 0,
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
                            : 'rgba(255, 255, 255, 0.94)'
                          : undefined
                      }
                    />
                    <TouchableOpacity
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
                      activeOpacity={0.75}
                      onPress={() => handlePlayMessageSound(msg.id, msg.sound!.soundUrl)}
                    >
                      <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={18}
                        color={isPlaying ? '#000000' : isDark ? '#FFFFFF' : '#000000'}
                        style={{ marginLeft: isPlaying ? 0 : 2 }}
                      />
                    </TouchableOpacity>
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
                  </View>
                );
              }

              return (
                <View
                  key={msg.id}
                  style={[
                    styles.textMsgBubble,
                    {
                      alignSelf: 'flex-end',
                      overflow: 'hidden',
                    },
                  ]}
                >
                  <LiquidGlassPillBackground
                    idPrefix={`msg_txt_${msg.id}`}
                    isDark={isDark}
                    borderRadius={20}
                  />
                  <Text style={[styles.textMsgContent, { color: textColor, zIndex: 10 }]}>
                    {msg.text}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 3. BOTTOM INPUT BAR (Apple Liquid Glass Troll Meme Face + Message Box) */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputRow}>
            {/* Full Circular Liquid Glass Troll Meme Face Button for Pal Group -> OPENS MEME SOUNDS SHEET */}
            <LiquidGlassIconButton
              idPrefix="btnPalChatTroll"
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

            {/* Apple Liquid Glass Message Box (Exact Edge-to-Edge Pill Geometry) */}
            <View
              style={[
                styles.inputFieldContainer,
                {
                  paddingLeft: 18,
                  paddingRight: 6,
                  overflow: 'hidden',
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

        {/* NATIVE MYINSTANTS MEME SOUNDS SHEET */}
        <PalGroupMemeSoundsSheet
          visible={showMemeSounds}
          onClose={() => setShowMemeSounds(false)}
          selectedThemeColor={selectedThemeColor}
          isDark={isDark}
          onSendSound={(sound) => {
            setChatMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                sender: username,
                sound: { name: sound.name, soundUrl: sound.sound },
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
        />
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
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    fontSize: 22,
    fontFamily: Fonts.SystemRoundedBold,
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 10,
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
});
