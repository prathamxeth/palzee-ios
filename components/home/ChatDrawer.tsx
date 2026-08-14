import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  TextInput,
  Animated,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';

export const ChatDrawer = ({
  visible,
  onClose,
  onOpenCamera,
  onOpenVlog,
  palCode = 'palzee_space',
  user,
  isDark = true,
  selectedThemeColor = 'orange',
  vlogList = [],
  activeVideoUri,
}: any) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const edgeColor = (Colors?.BorderGlow as any)?.[selectedThemeColor] || '#FE9068';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const screenBg = isDark ? '#09090B' : '#F2F2F7';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  const [messageText, setMessageText] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

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

  // Direct active item resolution
  const activePal = Array.isArray(vlogList) && vlogList.length > 0 ? vlogList[0] : null;
  const currentVideoUri = activePal?.uri || activeVideoUri || '';
  const currentThumbUri = activePal?.thumbnailUri || '';

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

  const formatDay = (ts?: string) => {
    const d = ts ? new Date(ts) : new Date();
    const valid = isNaN(d.getTime()) ? new Date() : d;
    const now = new Date();
    return now.toDateString() === valid.toDateString()
      ? 'Today'
      : valid.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        {/* CRITICAL FIX: Ensure DynamicGlowContainer fills 100% height */}
        <View style={{ flex: 1 }}>
          <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
            <View
              style={[
                styles.container,
                {
                  backgroundColor: screenBg,
                  paddingTop: Math.max(insets.top, 12),
                  paddingBottom: Math.max(insets.bottom, 12),
                },
              ]}
            >
              {/* 1. TOP HEADER */}
              <View style={styles.headerRow}>
                <LiquidGlassIconButton idPrefix="btnChatBack" isDark={isDark} onPress={onClose}>
                  <Ionicons name="chevron-back" size={24} color={textColor} />
                </LiquidGlassIconButton>

                <View style={styles.vlogPillWrapper} pointerEvents="box-none">
                  <View style={styles.vlogPill}>
                    <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <Svg width={96} height={44} style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="vlogHeaderPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={isDark ? '#28282E' : '#FFFFFF'} stopOpacity={isDark ? 0.75 : 0.88} />
                          <Stop offset="50%" stopColor={isDark ? '#18181B' : '#F7F6F3'} stopOpacity={isDark ? 0.6 : 0.75} />
                          <Stop offset="100%" stopColor={isDark ? '#0E0E10' : '#EAE8E3'} stopOpacity={isDark ? 0.85 : 0.65} />
                        </LinearGradient>
                        <LinearGradient id="vlogHeaderPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.35 : 0.95} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.08 : 0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect x="0.75" y="0.75" width="94.5" height="42.5" rx="21.25" fill="url(#vlogHeaderPillGrad)" stroke="url(#vlogHeaderPillBdr)" strokeWidth="1.5" />
                    </Svg>
                    <Text style={[styles.vlogPillText, { color: textColor }]}>Vlog</Text>
                  </View>
                </View>

                <View style={{ width: 44 }} />
              </View>

              {/* 2. CHAT FEED & THUMBNAIL SECTION */}
              <View style={styles.feedContainer}>
                {Boolean(currentVideoUri || currentThumbUri) ? (
                  <View style={{ width: '100%', alignItems: 'flex-end', paddingBottom: 8 }}>
                    {/* Timestamp Header */}
                    <Text
                      style={[
                        styles.timestampText,
                        { color: isDark ? '#8E8E93' : '#636366', alignSelf: 'center' },
                      ]}
                    >
                      {`${formatDay(activePal?.timestamp)} ${formatTime(activePal?.timestamp)}`}
                    </Text>

                    {/* Thumbnail Bubble (146 x 86px) */}
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => setPreviewVisible(true)}
                      style={[
                        styles.thumbnailCard,
                        { borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)' },
                      ]}
                    >
                      {Boolean(currentThumbUri) ? (
                        <Image
                          source={{ uri: currentThumbUri }}
                          style={{ width: 146, height: 86 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <Video
                          source={{ uri: currentVideoUri }}
                          style={{ width: 146, height: 86 }}
                          videoStyle={{ width: 146, height: 86, borderRadius: 20 }}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={true}
                          isLooping={true}
                          isMuted={true}
                        />
                      )}
                    </TouchableOpacity>

                    {/* View Pal Action Bar */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        onClose();
                        if (onOpenVlog) onOpenVlog();
                      }}
                      style={[
                        styles.viewPalBtn,
                        { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' },
                      ]}
                    >
                      <Text style={[styles.viewPalDayText, { color: textColor }]}>
                        {formatDay(activePal?.timestamp)}
                      </Text>
                      <Text style={[styles.viewPalActionText, { color: edgeColor }]}>
                        view pal
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>

              {/* 3. BOTTOM INPUT BAR */}
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={styles.inputRow}>
                  <TouchableOpacity
                    style={[
                      styles.smileyBtn,
                      {
                        backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      onClose();
                      if (onOpenCamera) onOpenCamera();
                    }}
                  >
                    <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <View style={[styles.smileyCircle, { backgroundColor: edgeColor }]}>
                      <Image
                        source={require('../../assets/images/custom_rotate_smiley.png')}
                        style={{ width: 30.5, height: 30.5 }}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.inputFieldContainer,
                      {
                        backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <TextInput
                      style={[styles.input, { color: textColor }]}
                      placeholder="message"
                      placeholderTextColor="#8E8E93"
                      value={messageText}
                      onChangeText={setMessageText}
                    />
                    <TouchableOpacity
                      style={[
                        styles.sendBtn,
                        {
                          backgroundColor:
                            messageText.trim().length > 0
                              ? edgeColor
                              : isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(0, 0, 0, 0.08)',
                        },
                      ]}
                      activeOpacity={0.75}
                      onPress={() => setMessageText('')}
                    >
                      <Ionicons
                        name="arrow-up"
                        size={18}
                        color={messageText.trim().length > 0 ? '#000000' : isDark ? '#8E8E93' : '#666666'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>

              {/* 4. PREVIEW VIDEO MODAL */}
              {previewVisible && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFillObject,
                    {
                      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(242, 242, 247, 0.95)',
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
                      <Ionicons name="close" size={24} color={textColor} />
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
                        source={{ uri: currentVideoUri }}
                        style={StyleSheet.absoluteFillObject}
                        videoStyle={{ width: '100%', height: '100%', borderRadius: 28 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={false}
                      />

                      {/* Top-Left Avatar Badge */}
                      <View style={styles.modalBadge}>
                        <View style={[styles.avatarCircle, { backgroundColor: edgeColor }]}>
                          {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={{ width: '100%', height: '100%' }} />
                          ) : (
                            <Image
                              source={require('../../assets/images/capture_smile.png')}
                              style={{ width: 23, height: 23 }}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        <Text style={styles.modalUserText}>{username}</Text>
                      </View>

                      {/* Center Rounded Hour & Caption */}
                      <View style={styles.modalCenterOverlay} pointerEvents="none">
                        <Text style={styles.modalHourText}>
                          {formatNearestHour(activePal?.timestamp)}
                        </Text>
                        {Boolean(activePal?.caption) && (
                          <Text style={styles.modalCaptionText}>{activePal?.caption}</Text>
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
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  vlogPillWrapper: {
    alignItems: 'center',
  },
  vlogPill: {
    width: 96,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vlogPillText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedBold,
  },
  feedContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  timestampText: {
    fontSize: 14,
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
    fontSize: 17,
    fontFamily: Fonts.SystemRoundedBold,
  },
  viewPalActionText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 10,
  },
  smileyBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  smileyCircle: {
    width: 31.5,
    height: 31.5,
    borderRadius: 15.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputFieldContainer: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedMedium,
    height: '100%',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    top: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalUserText: {
    fontSize: 15,
    fontFamily: Fonts.SystemRoundedMedium,
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
