import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  Animated,
  Easing,
} from 'react-native';
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
}

export const VlogSheet: React.FC<VlogSheetProps> = ({
  visible,
  onClose,
  user,
  selectedThemeColor = 'cyan',
  onOpenCamera,
  onOpenChat,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const [showVlogDropdown, setShowVlogDropdown] = useState(false);
  const [showEditCaptionBox, setShowEditCaptionBox] = useState(false);
  const [show0Logs, setShow0Logs] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [cardLayout, setCardLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const noiseAnimX = useRef(new Animated.Value(0)).current;
  const noiseAnimY = useRef(new Animated.Value(0)).current;
  const scanlineAnim = useRef(new Animated.Value(-50)).current;

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

    const noiseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(noiseAnimX, { toValue: -8, duration: 80, useNativeDriver: true }),
        Animated.timing(noiseAnimX, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(noiseAnimY, { toValue: -6, duration: 70, useNativeDriver: true }),
        Animated.timing(noiseAnimY, { toValue: 4, duration: 90, useNativeDriver: true }),
      ])
    );

    const scanlineLoop = Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 250,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    noiseLoop.start();
    scanlineLoop.start();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rotateLoopRef.current) rotateLoopRef.current.stop();
      noiseLoop.stop();
      scanlineLoop.stop();
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? '#000000' : '#F5F5F7', paddingTop: Math.max(insets.top, 12) },
          ]}
        >
          {/* 1. TOP NAVIGATION HEADER BAR */}
          <View style={styles.headerBar}>
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

            {/* CENTER: VLOG DROPDOWN PILL (EXACT HORIZONTAL CENTER & INLINE WITH ICONS) */}
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
            {/* TV GLITCH / NOISE PREVIEW CARD (SKIA GPU CANVAS CRT STATIC NOISE) */}
            <View
              style={[
                styles.glitchCard,
                { backgroundColor: isDark ? '#161616' : '#E2E2E4' },
              ]}
              onLayout={(e) => {
                const { width, height } = e.nativeEvent.layout;
                if (width > 0 && height > 0) {
                  setCardLayout({ width, height });
                }
              }}
            >
              {/* 1. SKIA GPU PROCEDURAL SHADER CRT STATIC CANVAS */}
              {cardLayout.width > 0 && cardLayout.height > 0 && (
                <CRTStaticCard
                  isDark={isDark}
                  width={cardLayout.width}
                  height={cardLayout.height}
                  borderRadius={24}
                />
              )}

              {/* 2. FROSTED GLASS BLUR LAYER */}
              <BlurView
                intensity={12}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />

              {/* TOP LEFT USER ROW INSIDE CARD */}
              <View style={styles.cardUserRow}>
                <View style={[styles.avatarCircleFilled, { backgroundColor: edgeColor }]}>
                  <Image
                    source={require('../../assets/images/capture_smile.png')}
                    style={styles.avatarSmileImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.usernameText, { color: isDark ? '#8E8E93' : '#636366' }]}>{username}</Text>
              </View>

              {/* MIDDLE ROW: VLOG TEXT (LEFT) | TAP TO CAPTURE (CENTER) | 0:00 (RIGHT) */}
              <View style={styles.cardMiddleRow} pointerEvents="box-none">
                <Text style={[styles.cardVlogTitle, { color: isDark ? '#8E8E93' : '#5C5C60' }]}>Vlog</Text>

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

                <Text style={[styles.timestampText, { color: isDark ? '#48484A' : '#BEBEC2' }]}>0:00</Text>
              </View>

              {/* BOTTOM RIGHT: TRIPLE DOTS BUTTON OR TOGGLED EDIT CAPTION BOX */}
              {showEditCaptionBox ? (
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
                      {/* EXACT I-BEAM TEXT SELECTION CURSOR ICON WITH SERIFS */}
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
              ) : (
                <TouchableOpacity
                  style={styles.cardBottomRightDotsBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowEditCaptionBox(true)}
                >
                  <Text style={[styles.dotsText, { color: isDark ? '#636366' : '#8E8E93' }]}>...</Text>
                </TouchableOpacity>
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
    top: 0,
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
    fontFamily: 'System',
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
    fontFamily: 'System',
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
    fontFamily: 'SF Pro Rounded',
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
    fontFamily: 'System',
  },
  timestampText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: 'System',
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
    fontFamily: 'System',
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
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
});
