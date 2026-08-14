import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { User } from '../../types';
import { generateVideoThumbnail, formatExactTime, formatRoundedHour, formatRelativeDay } from '../../utils/mediaUtils';

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera?: () => void;
  onOpenVlog?: () => void;
  palCode?: string;
  user: User | null;
  isDark?: boolean;
  selectedThemeColor?: string;
  vlogList?: Array<{
    id: string;
    uri: string;
    videoUri?: string;
    thumbnailUri?: string;
    needsRotation?: boolean;
    caption?: string;
    timestamp: string;
    date?: string;
    createdAt?: string;
    isMuted?: boolean;
    rate?: number;
    mode?: string;
    sender?: { username?: string; avatarUri?: string; themeColor?: string };
  }>;
  activeVideoUri?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  visible,
  onClose,
  onOpenCamera,
  onOpenVlog,
  palCode = 'palzee_space',
  user,
  isDark: isDarkProp,
  selectedThemeColor = 'orange',
  vlogList = [],
  activeVideoUri,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const systemScheme = useColorScheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : systemScheme === 'dark';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  const displayList = Array.isArray(vlogList) && vlogList.length > 0
    ? vlogList
    : activeVideoUri
    ? [{ id: 'active_default', uri: activeVideoUri, thumbnailUri: '', timestamp: new Date().toISOString() }]
    : [];

  const activePal = displayList[0] || null;
  const resolvedActiveVideoUri =
    activePal?.uri ||
    activePal?.videoUri ||
    (activePal as any)?.video_url ||
    (activePal as any)?.mediaUrl ||
    (activePal as any)?.path ||
    activeVideoUri ||
    '';

  const [extractedThumbnail, setExtractedThumbnail] = useState<string | null>(null);
  const [isSideways, setIsSideways] = useState(false);
  const activeThumbUri = activePal?.thumbnailUri || extractedThumbnail;

  useEffect(() => {
    let isMounted = true;
    if (resolvedActiveVideoUri) {
      generateVideoThumbnail(resolvedActiveVideoUri).then((uri) => {
        if (isMounted && uri) setExtractedThumbnail(uri);
      });
    } else {
      setExtractedThumbnail(null);
    }
    return () => { isMounted = false; };
  }, [resolvedActiveVideoUri]);

  useEffect(() => {
    if (activeThumbUri) {
      Image.getSize(
        activeThumbUri,
        (w, h) => {
          const isRawSideways = w > h;
          setIsSideways(isRawSideways);
        },
        (err) => {
          console.warn('Failed to inspect thumbnail dimensions:', err);
        }
      );
    } else {
      setIsSideways(false);
    }
  }, [activeThumbUri]);

  const parseDateSafe = (timeInput?: any): Date => {
    if (!timeInput) return new Date();
    if (timeInput instanceof Date) return isNaN(timeInput.getTime()) ? new Date() : timeInput;
    const parsed = new Date(timeInput);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const getDisplayTimestamp = (item?: any): string => {
    const date = parseDateSafe(item?.timestamp || item?.createdAt || item?.date);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDayLabel = (item?: any): string => {
    const date = parseDateSafe(item?.timestamp || item?.createdAt || item?.date);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.round((startOfToday.getTime() - startOfTarget.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const [messageText, setMessageText] = useState('');
  const [modalVisible, setModalVisible] = useState(visible);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);
  const thumbnailVideoRef = useRef<Video>(null);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded && status.isPlaying && status.positionMillis > 0) {
      thumbnailVideoRef.current?.pauseAsync();
    }
  };

  const getNearestHourText = (rawTimestamp?: string) => {
    return formatRoundedHour(rawTimestamp);
  };

  const expandAnim = useRef(new Animated.Value(0)).current;
  const smileyRotateAnim = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;

  const openPreviewModal = () => {
    setPreviewVideoModal(true);
    Animated.spring(previewAnim, {
      toValue: 1,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  };

  const closePreviewModal = () => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setPreviewVideoModal(false);
    });
  };

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.spring(expandAnim, {
        toValue: 1,
        tension: 60,
        friction: 9,
        useNativeDriver: true,
      }).start();

      smileyRotateAnim.setValue(0);
      Animated.loop(
        Animated.timing(smileyRotateAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  if (!modalVisible) return null;

  const screenBg = isDark ? '#000000' : '#F2F2F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  const translateX = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
  });

  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const scale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.85, 1],
  });

  return (
    <View style={[StyleSheet.absoluteFillObject, { zIndex: 100 }]} pointerEvents="box-none">
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            opacity: expandAnim,
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity: expandAnim,
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
          },
        ]}
      >
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
            {/* 1. TOP NAVIGATION HEADER BAR */}
            <View style={styles.headerRow}>
              <LiquidGlassIconButton idPrefix="btnChatBack" isDark={isDark} onPress={handleClose}>
                <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>

              <View style={styles.vlogCenterPillWrapper} pointerEvents="box-none">
                <View style={styles.vlogLiquidPillBtn}>
                  <BlurView
                    intensity={35}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />
                  <Svg width={96} height={44} style={StyleSheet.absoluteFill}>
                    <Defs>
                      <LinearGradient id="vlogHeaderPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop
                          offset="0%"
                          stopColor={isDark ? '#28282E' : '#FFFFFF'}
                          stopOpacity={isDark ? 0.75 : 0.88}
                        />
                        <Stop
                          offset="50%"
                          stopColor={isDark ? '#18181B' : '#F7F6F3'}
                          stopOpacity={isDark ? 0.6 : 0.75}
                        />
                        <Stop
                          offset="100%"
                          stopColor={isDark ? '#0E0E10' : '#EAE8E3'}
                          stopOpacity={isDark ? 0.85 : 0.65}
                        />
                      </LinearGradient>
                      <LinearGradient id="vlogHeaderPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop
                          offset="0%"
                          stopColor="#FFFFFF"
                          stopOpacity={isDark ? 0.35 : 0.95}
                        />
                        <Stop
                          offset="100%"
                          stopColor={isDark ? '#FFFFFF' : '#000000'}
                          stopOpacity={isDark ? 0.08 : 0.08}
                        />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x="0.75"
                      y="0.75"
                      width="94.5"
                      height="42.5"
                      rx="21.25"
                      fill="url(#vlogHeaderPillGrad)"
                      stroke="url(#vlogHeaderPillBdr)"
                      strokeWidth="1.5"
                    />
                  </Svg>
                  <Text style={[styles.vlogPillText, { color: textColor }]}>Vlog</Text>
                </View>
              </View>

              <View style={{ width: 44 }} />
            </View>

            {/* 2. FLEXIBLE CHAT CONTENT AREA */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={[styles.bodyContainer, { justifyContent: 'flex-end', paddingBottom: 8 }]}>
                {Boolean(resolvedActiveVideoUri) ? (
                  <>
                    <Text
                      style={{
                        textAlign: 'center',
                        fontSize: 14,
                        fontFamily: Fonts.SystemRoundedMedium,
                        color: isDark ? '#8E8E93' : '#636366',
                        marginBottom: 10,
                      }}
                    >
                      {`${getDayLabel(activePal)} ${getDisplayTimestamp(activePal)}`}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        if (activePal) openPreviewModal();
                      }}
                      style={{
                        alignSelf: 'flex-end',
                        marginRight: 16,
                        marginBottom: 14,
                        width: 146,
                        height: 86,
                        borderRadius: 20,
                        overflow: 'hidden',
                        backgroundColor: '#1C1C1E',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {Boolean(activeThumbUri) ? (
                        <Image
                          source={{ uri: activeThumbUri! }}
                          style={
                            activePal?.needsRotation || isSideways
                              ? {
                                  width: 86,
                                  height: 146,
                                  transform: [{ rotate: '90deg' }],
                                }
                              : StyleSheet.absoluteFill
                          }
                          resizeMode="cover"
                        />
                      ) : (
                        <Video
                          ref={thumbnailVideoRef}
                          source={{ uri: resolvedActiveVideoUri }}
                          style={
                            activePal?.needsRotation || isSideways
                              ? { width: 86, height: 146, transform: [{ rotate: '90deg' }] }
                              : StyleSheet.absoluteFill
                          }
                          videoStyle={{ width: '100%', height: '100%', borderRadius: 20 }}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={true}
                          isLooping={true}
                          isMuted={true}
                          rate={activePal?.rate || 1.0}
                          shouldCorrectPitch={true}
                        />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setModalVisible(false);
                        onClose();
                        if (onOpenVlog) onOpenVlog();
                      }}
                      style={{
                        marginHorizontal: 16,
                        height: 58,
                        borderRadius: 24,
                        backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 22,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 17, fontFamily: Fonts.SystemRoundedBold, color: isDark ? '#FFFFFF' : '#000000' }}>
                        {getDayLabel(activePal)}
                      </Text>
                      <Text style={{ fontSize: 16, fontFamily: Fonts.SystemRoundedSemibold, color: edgeColor }}>
                        view pal
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            </TouchableWithoutFeedback>

            {/* 3. BOTTOM FLOATING MESSAGE INPUT BAR WITH KEYBOARD AVOIDING */}
            <KeyboardAvoidingView
              behavior="padding"
              keyboardVerticalOffset={8}
            >
              <View style={styles.bottomInputBarRow}>
                <TouchableOpacity
                  style={[
                    styles.smileyGlassPillBtn,
                    {
                      backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => {
                    setModalVisible(false);
                    onClose();
                    if (onOpenCamera) onOpenCamera();
                  }}
                >
                  <BlurView
                    intensity={35}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={[styles.innerSmileyCircle, { backgroundColor: edgeColor }]}>
                    <Animated.Image
                      source={require('../../assets/images/custom_rotate_smiley.png')}
                      style={[
                        styles.smileyAvatarImg,
                        {
                          transform: [
                            {
                              rotate: smileyRotateAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>

                <View
                  style={[
                    styles.messageInputPillContainer,
                    {
                      backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                      borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                    },
                  ]}
                >
                  <BlurView
                    intensity={35}
                    tint={isDark ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />

                  <TextInput
                    style={[styles.textInputStyle, { color: textColor }]}
                    placeholder="message"
                    placeholderTextColor="#8E8E93"
                    value={messageText}
                    onChangeText={setMessageText}
                  />

                  <TouchableOpacity
                    style={[
                      styles.sendArrowBtn,
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

            {/* FULL-SCREEN VIDEO PREVIEW OVERLAY */}
            {previewVideoModal && (
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.92)' : 'rgba(242, 242, 247, 0.95)',
                    paddingTop: Math.max(insets.top, 12),
                    paddingBottom: Math.max(insets.bottom, 12),
                    borderRadius: 36,
                    overflow: 'hidden',
                    zIndex: 200,
                    opacity: previewAnim,
                    transform: [
                      {
                        translateY: previewAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [150, 0],
                        }),
                      },
                      {
                        scale: previewAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.94, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.headerRow}>
                  <LiquidGlassIconButton
                    idPrefix="btnClosePreviewOverlay"
                    isDark={isDark}
                    onPress={closePreviewModal}
                  >
                    <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                  </LiquidGlassIconButton>

                  <View style={styles.vlogCenterPillWrapper} pointerEvents="box-none">
                    <View style={styles.vlogLiquidPillBtn}>
                      <BlurView
                        intensity={35}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                      />
                      <Svg width={96} height={44} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id="vlogOverlayPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop
                              offset="0%"
                              stopColor={isDark ? '#28282E' : '#FFFFFF'}
                              stopOpacity={isDark ? 0.75 : 0.88}
                            />
                            <Stop
                              offset="50%"
                              stopColor={isDark ? '#18181B' : '#F7F6F3'}
                              stopOpacity={isDark ? 0.6 : 0.75}
                            />
                            <Stop
                              offset="100%"
                              stopColor={isDark ? '#0E0E10' : '#EAE8E3'}
                              stopOpacity={isDark ? 0.85 : 0.65}
                            />
                          </LinearGradient>
                          <LinearGradient id="vlogOverlayPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop
                              offset="0%"
                              stopColor="#FFFFFF"
                              stopOpacity={isDark ? 0.35 : 0.95}
                            />
                            <Stop
                              offset="100%"
                              stopColor={isDark ? '#FFFFFF' : '#000000'}
                              stopOpacity={isDark ? 0.08 : 0.08}
                            />
                          </LinearGradient>
                        </Defs>
                        <Rect
                          x="0.75"
                          y="0.75"
                          width="94.5"
                          height="42.5"
                          rx="21.25"
                          fill="url(#vlogOverlayPillGrad)"
                          stroke="url(#vlogOverlayPillBdr)"
                          strokeWidth="1.5"
                        />
                      </Svg>
                      <Text style={[styles.vlogPillText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Vlog</Text>
                    </View>
                  </View>

                  <View style={{ width: 44 }} />
                </View>

                {activePal && resolvedActiveVideoUri ? (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <View
                      style={{
                        width: screenWidth - 32,
                        height: (screenWidth - 32) * (9 / 16),
                        borderRadius: 28,
                        overflow: 'hidden',
                        position: 'relative',
                        backgroundColor: '#000000',
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 16,
                        elevation: 8,
                      }}
                    >
                      <Video
                        source={{ uri: resolvedActiveVideoUri }}
                        style={StyleSheet.absoluteFill}
                        videoStyle={{ width: '100%', height: '100%', borderRadius: 28 }}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={false}
                      />
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.20)' }]} pointerEvents="none" />

                      <View style={{ position: 'absolute', top: 10, left: 14.5, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 20 }}>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: activePal?.sender?.themeColor || edgeColor,
                            justifyContent: 'center',
                            alignItems: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {activePal?.sender?.avatarUri ? (
                            <Image
                              source={{ uri: activePal?.sender?.avatarUri }}
                              style={{ width: '100%', height: '100%' }}
                              resizeMode="cover"
                            />
                          ) : (
                            <Image
                              source={require('../../assets/images/capture_smile.png')}
                              style={{ width: 23, height: 23 }}
                              resizeMode="contain"
                            />
                          )}
                        </View>
                        
                        <Text style={{ fontSize: 15, fontFamily: Fonts.SystemRoundedMedium, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
                          {activePal?.sender?.username || username}
                        </Text>
                      </View>

                      <View
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 20,
                        }}
                        pointerEvents="none"
                      >
                        <Text style={{ fontSize: 23, fontFamily: Fonts.DelaGothicOne, color: '#FFFFFF', textAlign: 'center', textShadowColor: 'rgba(0, 0, 0, 0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 }}>
                          {getNearestHourText(activePal?.timestamp || activePal?.createdAt)}
                        </Text>

                        {Boolean(activePal?.caption) && (
                          <Text style={{ fontSize: 18, fontFamily: Fonts.SystemRoundedSemibold, color: '#FFFFFF', textAlign: 'center', marginTop: 4, textShadowColor: 'rgba(0, 0, 0, 0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }}>
                            {activePal?.caption}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ) : null}
              </Animated.View>
            )}
          </View>
        </DynamicGlowContainer>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  vlogCenterPillWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vlogLiquidPillBtn: {
    width: 96,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  vlogPillText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedBold,
  },
  bodyContainer: {
    flex: 1,
  },
  bottomInputBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  smileyGlassPillBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  innerSmileyCircle: {
    width: 31.5,
    height: 31.5,
    borderRadius: 15.75,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  smileyAvatarImg: {
    width: 30.5,
    height: 30.5,
    resizeMode: 'contain',
  },
  messageInputPillContainer: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 6,
    overflow: 'hidden',
  },
  textInputStyle: {
    flex: 1,
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedMedium,
    paddingVertical: 0,
  },
  sendArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
