import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { LiquidGlassIconButton } from '../ui';
import { CRTStaticCard } from './CRTStaticCard';

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

          {/* CENTER: VLOG DROPDOWN PILL (IN-LINE WITH LEFT & RIGHT ICONS) */}
          <TouchableOpacity
            style={[
              styles.vlogPillBtn,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowVlogDropdown(!showVlogDropdown)}
          >
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

        {/* CAMERA LENS DOT DIRECTLY UNDERNEATH VLOG PILL */}
        <View style={styles.cameraDotWrapper}>
          <View style={styles.cameraLensDotOuter}>
            <View style={styles.cameraLensDotInner} />
          </View>
        </View>

        {/* 2. CENTER CONTENT SECTION */}
        <View style={styles.centerContent}>
          <View
            style={[
              styles.glitchCard,
              { backgroundColor: isDark ? '#141416' : '#EBEBEF' },
            ]}
          >
            {/* 1. INSTANT CAMERA LOW-LIGHT ISO NOISE GLITCH CARD (MOUNTS DIRECTLY ON FRAME 0 WITH NO WHITE/BLACK FLASH) */}
            <CRTStaticCard
              isDark={isDark}
              width={340}
              height={240}
              borderRadius={24}
            />

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
    marginBottom: 4,
  },
  vlogPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  vlogPillText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  cameraDotWrapper: {
    alignItems: 'center',
    marginTop: -6,
    marginBottom: 16,
  },
  cameraLensDotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLensDotInner: {
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
    paddingBottom: 20,
  },
  glitchCard: {
    width: '100%',
    height: 240,
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
    fontFamily: Fonts.SystemRoundedMedium,
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
    fontFamily: Fonts.SystemRoundedBold,
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
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  timestampText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Fonts.SystemRoundedMedium,
  },
  cardBottomRow: {
    alignItems: 'flex-end',
  },
  editCaptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBEBEF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  captionIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3A3A3C',
    fontFamily: Fonts.SystemRoundedBold,
  },
  editCaptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    fontFamily: Fonts.SystemRoundedMedium,
  },
});

export const EditExportSheet = VlogSheet;
