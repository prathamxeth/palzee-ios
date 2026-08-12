import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Svg, { Defs, LinearGradient, Stop, Pattern, Rect, Circle, Path, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { LiquidGlassIconButton, DynamicGlowContainer } from '../ui';

import { CRTStaticCard } from './CRTStaticCard';
import { ChatDrawer } from './ChatDrawer';

export interface VlogSheetProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  selectedThemeColor?: string;
  onOpenCamera?: () => void;
  onOpenChat?: () => void;
  activeVideoUri?: string | null;
  caption?: string;
  timestamp?: string;
  isVertical?: boolean;
  isMuted?: boolean;
}

export const VlogSheet: React.FC<VlogSheetProps> = ({
  visible,
  onClose,
  user,
  selectedThemeColor = 'cyan',
  onOpenCamera,
  onOpenChat,
  activeVideoUri,
  caption = 'Hi',
  timestamp = '18:33',
  isVertical = true,
  isMuted = false,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 20;
  const cardHeight = cardWidth * (9 / 16);
  const isDark = colorScheme === 'dark';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  // Exact 90°/270° Rotated Dimensions for Vertical Captures to Fill 16:9 Frame
  const videoWidth = cardHeight;
  const videoHeight = cardWidth;
  const videoTop = (cardHeight - videoHeight) / 2;
  const videoLeft = (cardWidth - videoWidth) / 2;

  const rotatedStyle = {
    position: 'absolute' as const,
    top: videoTop,
    left: videoLeft,
    width: videoWidth,
    height: videoHeight,
    transform: [{ rotate: '270deg' }],
  };

  const [showVlogDropdown, setShowVlogDropdown] = useState(false);
  const [showEditCaptionBox, setShowEditCaptionBox] = useState(false);
  const [show0Logs, setShow0Logs] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  const logsRotateAnim = useRef(new Animated.Value(0)).current;
  const logsOpacityAnim = useRef(new Animated.Value(1)).current;

  const rotateLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trigger0PalsEffect = () => {
    if (rotateLoopRef.current) rotateLoopRef.current.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    setShow0Logs(true);
    logsOpacityAnim.setValue(1);
    logsRotateAnim.setValue(0);

    rotateLoopRef.current = Animated.loop(
      Animated.timing(logsRotateAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoopRef.current.start();

    timerRef.current = setTimeout(() => {
      Animated.timing(logsOpacityAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        setShow0Logs(false);
        if (rotateLoopRef.current) rotateLoopRef.current.stop();
      });
    }, 3000);
  };

  useEffect(() => {
    if (!visible) return;

    // Reset 0 pals to hidden on initial Vlog screen open
    setShow0Logs(false);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rotateLoopRef.current) rotateLoopRef.current.stop();
    };
  }, [visible]);

  // Demo fallback video URI if no live capture URI is passed
  const videoSourceUri = activeVideoUri || 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4';

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F5F5F7' }]}>
          {/* 1. TOP NAVIGATION HEADER BAR */}
          <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 12) }]}>
            {/* LEFT: ROTATING 0 LOGS PILL (DISAPPEARS AFTER 2S) OR BACK CHEVRON */}
            <View style={{ width: 100, height: 44, justifyContent: 'center' }}>
              {show0Logs ? (
                <Animated.View style={{ opacity: logsOpacityAnim }}>
                  <TouchableOpacity
                    style={styles.zeroLogsPillBtn}
                    activeOpacity={0.8}
                    onPress={onClose}
                  >
                    <BlurView
                      intensity={35}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width={96} height={42} style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="logsPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={isDark ? '#28282E' : '#FFFFFF'} stopOpacity={isDark ? 0.75 : 0.90} />
                          <Stop offset="100%" stopColor={isDark ? '#0E0E10' : '#EAE8E3'} stopOpacity={isDark ? 0.85 : 0.70} />
                        </LinearGradient>
                        <LinearGradient id="logsPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.35 : 0.95} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0.75"
                        y="0.75"
                        width="94.5"
                        height="40.5"
                        rx="20.25"
                        fill="url(#logsPillGrad)"
                        stroke="url(#logsPillBdr)"
                        strokeWidth="1.5"
                      />
                    </Svg>
                    <View style={[styles.logsSmileyCircle, { backgroundColor: '#FF3B30' }]}>
                      <Animated.Image
                        source={require('../../assets/images/custom_rotate_smiley.png')}
                        style={[
                          styles.logsSmileyImg,
                          {
                            tintColor: '#000000',
                            transform: [
                              {
                                rotate: logsRotateAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['180deg', '540deg'],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.zeroLogsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      0 pals
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <LiquidGlassIconButton idPrefix="btnVlogBack" isDark={isDark} onPress={onClose}>
                  <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                </LiquidGlassIconButton>
              )}
            </View>

            {/* CENTER: VLOG DROPDOWN PILL */}
            <View style={styles.centerHeaderGroup} pointerEvents="box-none">
              <TouchableOpacity
                style={styles.vlogLiquidPillBtn}
                activeOpacity={0.8}
                onPress={() => setShowVlogDropdown(!showVlogDropdown)}
              >
                <BlurView
                  intensity={35}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
                <Svg width={96} height={44} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="vlogPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
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
                    <LinearGradient id="vlogPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.35 : 0.95} />
                      <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={0.08} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0.75"
                    y="0.75"
                    width="94.5"
                    height="42.5"
                    rx="21.25"
                    fill="url(#vlogPillGrad)"
                    stroke="url(#vlogPillBdr)"
                    strokeWidth="1.5"
                  />
                </Svg>
                <Text style={[styles.vlogPillText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Vlog
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={isDark ? '#FFFFFF' : '#000000'}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>

              {/* CAMERA LENS INDICATOR DOT BELOW VLOG PILL */}
              <View
                style={[
                  styles.cameraDotRing,
                  { backgroundColor: isDark ? '#2C2C2E' : '#D6D6D8' },
                ]}
              >
                <View
                  style={[
                    styles.cameraDotInner,
                    { backgroundColor: isDark ? '#FFFFFF' : '#000000' },
                  ]}
                />
              </View>
            </View>

            {/* RIGHT: SHARE & CHAT BUTTONS */}
            <View style={styles.headerRightIcons}>
              <LiquidGlassIconButton
                idPrefix="btnVlogShare"
                isDark={isDark}
                onPress={trigger0PalsEffect}
              >
                <Ionicons name="share-outline" size={24.5} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>

              <LiquidGlassIconButton
                idPrefix="btnVlogChat"
                isDark={isDark}
                onPress={() => {
                  setShowChatDrawer(true);
                  if (onOpenChat) onOpenChat();
                }}
              >
                <Ionicons name="chatbubble-outline" size={24.5} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>
            </View>
          </View>

          {/* 2. CENTER CONTENT SECTION (EXACT GEOMETRIC CENTER OF SCREEN) */}
          <View style={styles.centerContent}>
            {/* TV GLITCH / NOISE PREVIEW CARD */}
            <View
              style={[
                styles.glitchCard,
                { backgroundColor: isDark ? '#0A0A0C' : '#D2D2D8', overflow: 'hidden' },
              ]}
            >
              {/* VIDEO PLAYER WHEN VIDEO SENT, ELSE CRT STATIC CARD */}
              {!!activeVideoUri ? (
                <Video
                  source={{ uri: activeVideoUri }}
                  style={isVertical ? rotatedStyle : StyleSheet.absoluteFill}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={visible && !showChatDrawer}
                  isLooping
                  isMuted={!visible || showChatDrawer || !!isMuted}
                />
              ) : (
                <CRTStaticCard
                  isDark={isDark}
                  width={cardWidth}
                  height={cardHeight}
                  borderRadius={24}
                />
              )}

              {/* FROSTED GLASS BLUR LAYER WHEN NO VIDEO */}
              {!activeVideoUri && (
                <BlurView
                  intensity={12}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              )}

              {/* TOP LEFT USER ROW INSIDE CARD */}
              <View style={styles.cardUserRow}>
                <View style={[styles.avatarCircleFilled, { backgroundColor: edgeColor }]}>
                  <Image
                    source={require('../../assets/images/capture_smile.png')}
                    style={styles.avatarSmileImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.usernameText, { color: activeVideoUri ? '#FFFFFF' : isDark ? '#8E8E93' : '#636366' }]}>{username}</Text>
              </View>

              {/* MIDDLE ROW: TAP TO CAPTURE ONLY WHEN NO VIDEO, ELSE VLOG TEXT (LEFT) | CAPTION (CENTER) | TIMESTAMP (RIGHT) */}
              <View style={styles.cardMiddleRow} pointerEvents="box-none">
                {!!activeVideoUri ? (
                  <>
                    <Text style={[styles.cardVlogTitle, { color: '#FFFFFF' }]}>Vlog</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: Fonts.SystemRoundedSemibold }}>{caption}</Text>
                    <Text style={[styles.timestampText, { color: '#FFFFFF' }]}>{timestamp}</Text>
                  </>
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity
                      style={styles.tapToCaptureBtnCenter}
                      activeOpacity={0.85}
                      onPress={() => {
                        onClose();
                        if (onOpenCamera) onOpenCamera();
                      }}
                    >
                      <BlurView
                        intensity={35}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                      />
                      <Svg width="100%" height={40} style={StyleSheet.absoluteFill}>
                        <Defs>
                          <LinearGradient id="tapPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop
                              offset="0%"
                              stopColor={isDark ? '#28282E' : '#FFFFFF'}
                              stopOpacity={isDark ? 0.85 : 0.95}
                            />
                            <Stop
                              offset="100%"
                              stopColor={isDark ? '#141416' : '#F2EFF4'}
                              stopOpacity={isDark ? 0.75 : 0.90}
                            />
                          </LinearGradient>
                          <LinearGradient id="tapPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.95} />
                            <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={0.1} />
                          </LinearGradient>
                        </Defs>
                        <Rect
                          x="0.75"
                          y="0.75"
                          width="100%"
                          height="38.5"
                          rx="19.25"
                          fill="url(#tapPillGrad)"
                          stroke="url(#tapPillBdr)"
                          strokeWidth="1.5"
                        />
                      </Svg>
                      <Text style={[styles.tapToCaptureText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        tap to capture
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* BOTTOM RIGHT: THREE DOTS BUTTON */}
              <TouchableOpacity
                style={styles.cardBottomRightDotsBtn}
                activeOpacity={0.7}
                onPress={() => setShowEditCaptionBox(!showEditCaptionBox)}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={activeVideoUri ? '#FFFFFF' : isDark ? '#636366' : '#8E8E93'} />
              </TouchableOpacity>

              {/* TRIPLE DOTS POPOVER / PILL RENDERING */}
              {showEditCaptionBox && (
                !!activeVideoUri ? (
                  /* FULL 3-OPTION MENU BOX WHEN VIDEO IS PRESENT */
                  <View style={styles.tripleDotPopoverMenu}>
                    <BlurView
                      intensity={40}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="popoverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={isDark ? '#28282E' : '#FFFFFF'} stopOpacity={isDark ? 0.95 : 0.98} />
                          <Stop offset="100%" stopColor={isDark ? '#1C1C1E' : '#F7F7F8'} stopOpacity={isDark ? 0.92 : 0.95} />
                        </LinearGradient>
                        <LinearGradient id="popoverBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.35 : 0.95} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.1 : 0.12} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0.75"
                        y="0.75"
                        width="99%"
                        height="99%"
                        rx="21.25"
                        fill="url(#popoverGrad)"
                        stroke="url(#popoverBdr)"
                        strokeWidth="1.5"
                      />
                    </Svg>

                    <View style={styles.popoverContentColumn}>
                      {/* 1. DELETE OPTION (RED TRASH ICON & RED TEXT) */}
                      <TouchableOpacity
                        style={styles.popoverOptionRow}
                        activeOpacity={0.7}
                        onPress={() => {
                          setShowEditCaptionBox(false);
                        }}
                      >
                        <Ionicons name="trash-outline" size={21} color="#FF3B30" />
                        <Text style={styles.popoverDeleteText}>delete</Text>
                      </TouchableOpacity>

                      {/* 2. EDIT CAPTION OPTION (A| SELECTION CURSOR ICON & TEXT) */}
                      <TouchableOpacity
                        style={styles.popoverOptionRow}
                        activeOpacity={0.7}
                        onPress={() => {
                          setShowEditCaptionBox(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', width: 22, justifyContent: 'center' }}>
                          <Text style={[styles.editCaptionIconLetter, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            A
                          </Text>
                          <Svg width={6} height={14} viewBox="0 0 6 14" style={{ marginLeft: 2 }}>
                            <Line x1={0.5} y1={0.75} x2={5.5} y2={0.75} stroke={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} strokeLinecap="round" />
                            <Line x1={3} y1={0.75} x2={3} y2={13.25} stroke={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                            <Line x1={0.5} y1={13.25} x2={5.5} y2={13.25} stroke={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} strokeLinecap="round" />
                          </Svg>
                        </View>
                        <Text style={[styles.popoverOptionText, { color: isDark ? '#FFFFFF' : '#000000' }]}>edit caption</Text>
                      </TouchableOpacity>

                      {/* 3. SAVE OPTION (SAVE SHARE ICON & TEXT) */}
                      <TouchableOpacity
                        style={styles.popoverOptionRow}
                        activeOpacity={0.7}
                        onPress={() => {
                          setShowEditCaptionBox(false);
                        }}
                      >
                        <Ionicons name="share-outline" size={21} color={isDark ? '#FFFFFF' : '#000000'} />
                        <Text style={[styles.popoverOptionText, { color: isDark ? '#FFFFFF' : '#000000' }]}>save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  /* SINGLE EDIT CAPTION PILL WHEN NO VIDEO IS PRESENT */
                  <TouchableOpacity
                    style={styles.cardBottomRightPill}
                    activeOpacity={0.85}
                    onPress={() => setShowEditCaptionBox(false)}
                  >
                    <BlurView
                      intensity={35}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width={180} height={48} style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="captionPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={isDark ? '#28282E' : '#FFFFFF'} stopOpacity={isDark ? 0.88 : 0.95} />
                          <Stop offset="100%" stopColor={isDark ? '#141416' : '#F2EFF4'} stopOpacity={isDark ? 0.80 : 0.90} />
                        </LinearGradient>
                        <LinearGradient id="captionPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.95} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={0.1} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0.75"
                        y="0.75"
                        width="178.5"
                        height="46.5"
                        rx="23.25"
                        fill="url(#captionPillGrad)"
                        stroke="url(#captionPillBdr)"
                        strokeWidth="1.5"
                      />
                    </Svg>
                    <View style={styles.editCaptionInnerRow}>
                      <View style={styles.aCursorGroup}>
                        <Text style={[styles.editCaptionIconText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                          A
                        </Text>
                        <Svg width={7} height={14} viewBox="0 0 7 14" style={{ marginLeft: 2.5 }}>
                          <Line x1={0.5} y1={0.75} x2={6.5} y2={0.75} stroke={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} strokeLinecap="round" />
                          <Line x1={3.5} y1={0.75} x2={3.5} y2={13.25} stroke={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} />
                          <Line x1={0.5} y1={13.25} x2={6.5} y2={13.25} stroke={isDark ? '#FFFFFF' : '#000000'} strokeWidth={1.5} strokeLinecap="round" />
                        </Svg>
                      </View>
                      <Text style={[styles.editCaptionLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        edit caption
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </DynamicGlowContainer>

      <ChatDrawer
        visible={showChatDrawer}
        onClose={() => setShowChatDrawer(false)}
        onOpenCamera={() => {
          setShowChatDrawer(false);
          onClose();
          if (onOpenCamera) onOpenCamera();
        }}
        user={user}
        isDark={isDark}
        selectedThemeColor={selectedThemeColor}
      />
    </Modal>
  );
};

export const EditExportSheet = VlogSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 8.5,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
    position: 'relative',
    zIndex: 10,
  },
  centerHeaderGroup: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  vlogLiquidPillBtn: {
    width: 96,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  vlogPillText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  cameraDotRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  cameraDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 80,
  },
  glitchCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 32,
    marginVertical: -15,
    transform: [{ translateY: -15 }],
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
  },
  cardUserRow: {
    position: 'absolute',
    top: 10,
    left: 14.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 5,
  },
  avatarCircleFilled: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarSmileImage: {
    width: 28,
    height: 28,
  },
  usernameText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#636366',
    fontFamily: Fonts.SystemRoundedMedium,
  },
  cardMiddleRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: '50%',
    transform: [{ translateY: 12.5 }],
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 5,
  },
  cardVlogTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3A3A3C',
    fontFamily: Fonts.SystemRoundedBold,
    marginTop: -2,
  },
  tapToCaptureBtnCenter: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -70 }],
    width: 140,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tapToCaptureText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Fonts.SystemRounded,
  },
  timestampText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Fonts.SystemRoundedMedium,
  },
  cardBottomRightDotsBtn: {
    position: 'absolute',
    bottom: 12,
    right: 18,
    padding: 6,
    zIndex: 10,
  },
  dotsText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  zeroLogsPillBtn: {
    width: 96,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 6,
  },
  logsSmileyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logsSmileyImg: {
    width: 23.7,
    height: 23.7,
    resizeMode: 'contain',
  },
  zeroLogsText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  cardBottomRightPill: {
    position: 'absolute',
    bottom: 2,
    right: 1.5,
    width: 176,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  editCaptionInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aCursorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 2,
  },
  editCaptionIconText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  textCursorIBar: {
    width: 2,
    height: 16,
    borderRadius: 1,
    marginLeft: 2.5,
  },
  editCaptionLabel: {
    fontSize: 15,
    fontWeight: '400',
    fontFamily: Fonts.SystemRounded,
  },
  tripleDotPopoverMenu: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 200,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 100,
  },
  popoverContentColumn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  popoverOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  popoverDeleteText: {
    fontSize: 16,
    color: '#FF3B30',
    fontFamily: Fonts.SystemRoundedMedium,
  },
  popoverOptionText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedMedium,
  },
  editCaptionIconLetter: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedMedium,
  },
});
