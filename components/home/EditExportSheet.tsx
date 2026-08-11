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
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
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

          {/* CENTER: VLOG DROPDOWN PILL */}
          <View style={styles.centerHeaderGroup}>
            <TouchableOpacity
              style={[
                styles.vlogPillBtn,
                { backgroundColor: isDark ? '#1C1C1E' : '#EFEFF4' },
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

            {/* CAMERA LENS INDICATOR DOT BELOW PILL */}
            <View style={styles.cameraDotRing}>
              <View style={styles.cameraDotInner} />
            </View>
          </View>

          {/* RIGHT: SHARE & CHAT BUTTONS */}
          <View style={styles.headerRightIcons}>
            <LiquidGlassIconButton idPrefix="btnVlogShare" isDark={isDark} onPress={() => {}}>
              <Ionicons name="share-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            </LiquidGlassIconButton>

            <LiquidGlassIconButton
              idPrefix="btnVlogChat"
              isDark={isDark}
              onPress={() => {
                onClose();
                if (onOpenChat) onOpenChat();
              }}
            >
              <Ionicons name="chatbubble-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
            </LiquidGlassIconButton>
          </View>
        </View>

        {/* 2. CENTER CONTENT SECTION */}
        <View style={styles.centerContent}>
          {/* TV GLITCH / NOISE PREVIEW CARD */}
          <View
            style={[
              styles.glitchCard,
              { backgroundColor: isDark ? '#1C1C1E' : '#DCDCDC' },
            ]}
          >
            {/* TV STATIC NOISE OVERLAY PATTERN */}
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="tvNoiseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.15} />
                  <Stop offset="50%" stopColor="#000000" stopOpacity={0.08} />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.12} />
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

            {/* MIDDLE ROW: VLOG BOLD TEXT | TAP TO CAPTURE PILL | 0:00 */}
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
                <Text style={styles.tapToCaptureText}>tap to capture</Text>
              </TouchableOpacity>

              <Text style={styles.timestampText}>0:00</Text>
            </View>

            {/* BOTTOM RIGHT FLOATING EDIT CAPTION PILL */}
            <View style={styles.cardBottomRow}>
              <TouchableOpacity style={styles.editCaptionBtn} activeOpacity={0.85}>
                <Text style={styles.captionIconText}>A|</Text>
                <Text style={styles.editCaptionText}>edit caption</Text>
              </TouchableOpacity>
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
    marginBottom: 20,
  },
  centerHeaderGroup: {
    alignItems: 'center',
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  cameraDotRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  cameraDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#8E8E93',
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  glitchCard: {
    width: '100%',
    height: 250,
    borderRadius: 28,
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
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  editCaptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export const EditExportSheet = VlogSheet;
