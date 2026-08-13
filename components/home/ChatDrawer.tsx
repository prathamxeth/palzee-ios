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
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
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

  const displayList = vlogList && vlogList.length > 0 
    ? vlogList 
    : activeVideoUri 
      ? [{ id: 'active_default', uri: activeVideoUri, caption: '', timestamp: new Date().toISOString() }] 
      : [];

  const activePal = displayList?.[0];
  const resolvedActiveVideoUri = 
    activePal?.uri || 
    activePal?.videoUri || 
    (activePal as any)?.video_url || 
    (activePal as any)?.mediaUrl || 
    (activePal as any)?.path || 
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

  const getDisplayTimestamp = (item?: any) => {
    if (!item) return '7:26 PM';
    return formatExactTime(item.timestamp || item.date);
  };

  const getDayLabel = (item?: any) => {
    if (!item) return 'Yesterday';
    return formatRelativeDay(item.date || item.createdAt || item.timestamp);
  };

  const [messageText, setMessageText] = useState('');
  const [modalVisible, setModalVisible] = useState(visible);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);

  const getNearestHourText = (rawTimestamp?: string) => {
    return formatRoundedHour(rawTimestamp);
  };

  const expandAnim = useRef(new Animated.Value(0)).current;
  const smileyRotateAnim = useRef(new Animated.Value(0)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;

  const openPreviewModal = () => {
    setPreviewVideoModal(true);
    previewAnim.setValue(0);
    Animated.spring(previewAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closePreviewModal = () => {
    Animated.timing(previewAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setPreviewVideoModal(false));
  };

  useEffect(() => {
    smileyRotateAnim.setValue(0);
    const rotateLoop = Animated.loop(
      Animated.timing(smileyRotateAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();
    return () => rotateLoop.stop();
  }, [modalVisible]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      expandAnim.setValue(0);

      Animated.spring(expandAnim, {
        toValue: 1,
        mass: 0.7,
        damping: 17,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
    } else if (modalVisible) {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const screenBg = isDark ? '#000000' : '#F5F5F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  if (!modalVisible) return null;

  // iOS App Open / Close Hover Expand Interpolations (Origin from Top Right Chat Icon)
  const scale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 1],
  });

  const opacity = expandAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.9, 1],
  });

  const translateX = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 0],
  });

  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity,
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
              {/* 1. TOP NAVIGATION HEADER BAR (MATCHING IMAGE 1 & IMAGE 2) */}
              <View style={styles.headerRow}>
                {/* LEFT: BACK CHEVRON BUTTON */}
                <LiquidGlassIconButton idPrefix="btnChatBack" isDark={isDark} onPress={handleClose}>
                  <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                </LiquidGlassIconButton>

                {/* CENTER: VLOG LIQUID GLASS PILL BUTTON */}
                <View style={styles.vlogCenterPillWrapper} pointerEvents="box-none">
                  <View
                    style={[
                      styles.vlogLiquidPillBtn,
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
                    <Text style={[styles.vlogPillText, { color: textColor }]}>Vlog</Text>
                  </View>
                </View>

                {/* BALANCING SPACER */}
                <View style={{ width: 44 }} />
              </View>

              {/* 2. FLEXIBLE CHAT CONTENT AREA (DISMISS KEYBOARD ON TOUCH) */}
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.bodyContainer, { justifyContent: 'flex-end', paddingBottom: 8 }]}>
                  {/* STRICT GUARD: Only render thumbnail & log card if a valid Pal item and resolved video URI exists */}
                  {activePal && resolvedActiveVideoUri ? (
                    <>
                      {/* DYNAMIC TIMESTAMP ABOVE THUMBNAIL */}
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

                      {/* DYNAMIC 1ST FRAME THUMBNAIL BUBBLE */}
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
                        }}
                      >
                        {activeThumbUri ? (
                          <Image
                            source={{ uri: activeThumbUri }}
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
                            source={{ uri: resolvedActiveVideoUri }}
                            style={StyleSheet.absoluteFill}
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

                      {/* ACTION CARD BAR */}
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
                    /* OPTIONAL EMPTY STATE: Render nothing when no Pal is sent */
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
                  {/* LEFT: LIQUID GLASS PILL BUTTON WITH ROTATING SMILEY AVATAR (OPENS CAMERA INSTANTLY) */}
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

                  {/* CENTER/RIGHT: LIQUID GLASS MESSAGE INPUT PILL WITH INTEGRATED SEND BUTTON */}
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

                    {/* RIGHT SEND ARROW BUTTON INSIDE INPUT PILL */}
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
              {/* FULL-SCREEN VIDEO PREVIEW OVERLAY (INSIDE CONTAINER FOR 1:1 ZERO-OFFSET HEADER OVERLAP & SPRING SLIDE-UP ANIMATION) */}
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
                  {/* TOP HEADER BAR INSIDE OVERLAY: EXACT 1:1 OVERLAP WITH CHAT DRAWER HEADER ROW */}
                  <View style={styles.headerRow}>
                    {/* LEFT CLOSE CROSS BUTTON (EXACT MATCH FOR BACK CHEVRON BUTTON POSITION) */}
                    <LiquidGlassIconButton
                      idPrefix="btnClosePreviewOverlay"
                      isDark={isDark}
                      onPress={closePreviewModal}
                    >
                      <Ionicons name="close" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                    </LiquidGlassIconButton>

                    {/* CENTER VLOG PILL (EXACT MATCH FOR CHAT DRAWER CENTER VLOG PILL) */}
                    <View style={styles.vlogCenterPillWrapper} pointerEvents="box-none">
                      <View
                        style={[
                          styles.vlogLiquidPillBtn,
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
                        <Text style={[styles.vlogPillText, { color: isDark ? '#FFFFFF' : '#000000' }]}>Vlog</Text>
                      </View>
                    </View>

                    {/* BALANCING SPACER */}
                    <View style={{ width: 44 }} />
                  </View>

                  {/* CENTER 16:9 VIDEO PREVIEW CARD BOX (STRICT GUARDED) */}
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

                        {/* TOP-LEFT USER BADGE (EXACT MATCH FOR VLOGSHEET POSITION & SIZE) */}
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

                        {/* CENTER TIME & CAPTION OVERLAY (REDUCED TIME TEXT BY 5DP: 28 -> 23) */}
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'relative',
  },
  vlogCenterPillWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  vlogLiquidPillBtn: {
    width: 80,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vlogPillText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Fonts.SystemRoundedSemibold,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerSmileyCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  smileyAvatarImg: {
    width: 30.8,
    height: 30.8,
    tintColor: '#000000',
    resizeMode: 'contain',
  },
  messageInputPillContainer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    position: 'relative',
  },
  textInputStyle: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.SystemRounded,
    paddingVertical: 0,
    paddingRight: 8,
  },
  sendArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
