import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Pattern, Rect, Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { LiquidGlassIconButton, DynamicGlowContainer } from '../ui';

import { CRTStaticCard } from './CRTStaticCard';

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
  selectedThemeColor = 'orange',
  onOpenCamera,
  onOpenChat,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const [showVlogDropdown, setShowVlogDropdown] = useState(false);
  const [cardLayout, setCardLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const noiseAnimX = useRef(new Animated.Value(0)).current;
  const noiseAnimY = useRef(new Animated.Value(0)).current;
  const scanlineAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (!visible) return;

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
      noiseLoop.stop();
      scanlineLoop.stop();
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true}>
        <View
          style={[
            styles.container,
            { backgroundColor: isDark ? '#000000' : '#F5F5F7', paddingTop: Math.max(insets.top, 12) },
          ]}
        >
          {/* 1. TOP NAVIGATION HEADER BAR */}
          <View style={styles.headerBar}>
            {/* LEFT: BACK BUTTON */}
            <LiquidGlassIconButton idPrefix="btnVlogBack" isDark={isDark} onPress={onClose}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </LiquidGlassIconButton>

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
              <LiquidGlassIconButton idPrefix="btnVlogShare" isDark={isDark} onPress={() => {}}>
                <Ionicons name="share-outline" size={24.5} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>

              <LiquidGlassIconButton
                idPrefix="btnVlogChat"
                isDark={isDark}
                onPress={() => {
                  onClose();
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

              {/* BOTTOM RIGHT THREE DOTS ICON AS PER DARK MODE IMAGE */}
              <View style={styles.cardBottomRightDots} pointerEvents="none">
                <Text style={[styles.dotsText, { color: isDark ? '#636366' : '#8E8E93' }]}>...</Text>
              </View>
            </View>
          </View>
        </View>
      </DynamicGlowContainer>
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timestampText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  cardBottomRightDots: {
    position: 'absolute',
    bottom: 14,
    right: 18,
  },
  dotsText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
});
