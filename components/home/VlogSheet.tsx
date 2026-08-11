import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassIconButton } from '../ui';

export interface VlogSheetProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  onOpenCamera?: () => void;
  onOpenChat?: () => void;
}

export const VlogSheet: React.FC<VlogSheetProps> = ({
  visible,
  onClose,
  user,
  onOpenCamera,
  onOpenChat,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  const [showVlogDropdown, setShowVlogDropdown] = useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
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
            <View style={styles.cameraDotRing}>
              <View style={styles.cameraDotInner} />
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

        {/* 2. CENTER CONTENT SECTION (PERFECTLY CENTERED FROM ALL SIDES) */}
        <View style={styles.centerContent}>
          {/* TV GLITCH / NOISE PREVIEW CARD (EXACT 16:9 DIMENSIONS) */}
          <View
            style={[
              styles.glitchCard,
              { backgroundColor: isDark ? '#1C1C1E' : '#D6D6D6' },
            ]}
          >
            {/* TV STATIC NOISE OVERLAY PATTERN */}
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="tvNoiseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.18} />
                  <Stop offset="25%" stopColor="#000000" stopOpacity={0.10} />
                  <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.15} />
                  <Stop offset="75%" stopColor="#000000" stopOpacity={0.08} />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.14} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#tvNoiseGrad)" />
            </Svg>

            {/* TOP LEFT USER ROW INSIDE CARD */}
            <View style={styles.cardUserRow}>
              <View style={styles.avatarCircle}>
                <Ionicons name="happy" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.usernameText}>{username}</Text>
            </View>

            {/* MIDDLE ROW: VLOG BOLD TEXT | LIQUID GLASS TAP TO CAPTURE PILL | 0:00 */}
            <View style={styles.cardMiddleRow}>
              <Text style={styles.cardVlogTitle}>Vlog</Text>

              <TouchableOpacity
                style={styles.tapToCaptureBtn}
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

              <Text style={styles.timestampText}>0:00</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const EditExportSheet = VlogSheet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  cameraDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#636366',
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
    paddingBottom: 20,
  },
  glitchCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555555',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardVlogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A4A4A',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Rounded' : 'sans-serif',
  },
  tapToCaptureBtn: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tapToCaptureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  timestampText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
