import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Share,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { LiquidGlassIconButton, DynamicGlowContainer } from '../ui';
import { BouncingSmileyView } from '../vlog/BouncingSmileyView';
import { VlogSheet } from '../vlog/VlogSheet';
import { EditExportSheet } from '../vlog/EditExportSheet';
import { ChatDrawer } from '../home/ChatDrawer';

export interface PalGroupMember {
  id: string;
  name: string;
  avatarUri?: string;
  isCreator?: boolean;
  captureTime?: string;
  hasCaptured?: boolean;
  smileyColor?: string;
}

export interface PalGroupDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  group: {
    code: string;
    name: string;
    size: number;
    maxCount?: number;
    isCreator?: boolean;
    members?: PalGroupMember[];
  } | null;
  user: any;
  selectedThemeColor?: string;
  onOpenCamera: () => void;
}

export const PalGroupDetailsSheet: React.FC<PalGroupDetailsSheetProps> = ({
  visible,
  onClose,
  group,
  user,
  selectedThemeColor = 'cyan',
  onOpenCamera,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useFastColorScheme();
  const isDark = colorScheme === 'dark';

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);

  const cardWidth = screenWidth - 28;
  const cardHeight = 154;

  const currentUserName = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  // Format time text for display e.g. "3:00 PM"
  const getCurrentHourText = () => {
    const d = new Date();
    let h = d.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:00 ${ampm}`;
  };

  const handleShareInvite = async () => {
    if (!group) return;
    try {
      await Share.share({
        message: `Join my Palzee group "${group.name}" with code: ${group.code}`,
      });
    } catch (e) {
      console.log('Share invite error:', e);
    }
  };

  if (!visible || !group) return null;

  const maxSlots = group.maxCount || group.size || 5;
  const joinedMembers: PalGroupMember[] = group.members && group.members.length > 0
    ? group.members
    : [
        {
          id: 'user_self',
          name: currentUserName,
          isCreator: true,
          captureTime: getCurrentHourText(),
        },
      ];

  const emptySlotsCount = Math.max(0, maxSlots - joinedMembers.length);

  // Solid background shades matching CRT static card solid tone without animation
  const solidCardBg = isDark ? '#161618' : '#EFEFF2';
  const solidCardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <DynamicGlowContainer
        selectedThemeColor={selectedThemeColor}
        showBorder={true}
        showGlow={true}
        style={styles.fullScreenContainer}
      >
        {/* TOP NAVIGATION HEADER (Matching VlogSheet & Images) */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top, 14) }]}>
          {/* Top Left: Back button & Calendar Archive button */}
          <View style={styles.headerLeftCluster}>
            <LiquidGlassIconButton
              idPrefix="groupBackBtn"
              isDark={isDark}
              size={45}
              onPress={onClose}
            >
              <Ionicons name="chevron-back" size={30} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginLeft: -1.5 }} />
            </LiquidGlassIconButton>

            <LiquidGlassIconButton
              idPrefix="groupCalendarBtn"
              isDark={isDark}
              size={45}
              onPress={() => setShowCalendarModal(true)}
            >
              <Ionicons name="calendar-outline" size={30} color={isDark ? '#FFFFFF' : '#000000'} />
            </LiquidGlassIconButton>
          </View>

          {/* Top Center: Group Name Capsule & Page Dot (Exact VlogSheet Liquid Style) */}
          <View style={styles.headerCenterCluster}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.vlogLiquidPillBtn, { width: 110 }]}
              onPress={handleShareInvite}
            >
              <BlurView
                key={isDark ? 'dark' : 'light'}
                intensity={35}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <Svg width={110} height={45} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="groupPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
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
                  <LinearGradient id="groupPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.35 : 0.95} />
                    <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={0.08} />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0.75"
                  y="0.75"
                  width={108.5}
                  height={43.5}
                  rx={21.75}
                  fill="url(#groupPillGrad)"
                  stroke="url(#groupPillBdr)"
                  strokeWidth={1.5}
                />
              </Svg>
              <Text
                style={[
                  styles.vlogPillText,
                  { color: isDark ? '#FFFFFF' : '#000000', textAlign: 'center', zIndex: 10 },
                ]}
                numberOfLines={1}
              >
                {group.name} &gt;
              </Text>
            </TouchableOpacity>
            {/* Center Page Dot Indicator */}
            <View
              style={[
                styles.headerPageDot,
                { backgroundColor: isDark ? '#FFFFFF' : '#000000' },
              ]}
            />
          </View>

          {/* Top Right: Native Export & Chat buttons */}
          <View style={styles.headerRightCluster}>
            <LiquidGlassIconButton
              idPrefix="groupExportBtn"
              isDark={isDark}
              size={45}
              onPress={() => setShowExportSheet(true)}
            >
              <Ionicons name="share-outline" size={30} color={isDark ? '#FFFFFF' : '#000000'} />
            </LiquidGlassIconButton>

            <LiquidGlassIconButton
              idPrefix="groupChatBtn"
              isDark={isDark}
              size={45}
              onPress={() => setShowChatDrawer(true)}
            >
              <Ionicons name="chatbubble-outline" size={30} color={isDark ? '#FFFFFF' : '#000000'} />
            </LiquidGlassIconButton>
          </View>
        </View>

        {/* BODY LIST OF PAL CARDS (Matching Images 1 to 5) */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 16 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* 1. JOINED MEMBER / CREATOR CARDS */}
          {joinedMembers.map((member, idx) => {
            const isCurrentUser = member.isCreator || member.id === 'user_self' || member.name === currentUserName;

            return (
              <View
                key={member.id || idx}
                style={[
                  styles.palCard,
                  {
                    width: cardWidth,
                    height: cardHeight,
                    backgroundColor: solidCardBg,
                    borderColor: solidCardBorder,
                  },
                ]}
              >
                {/* Top-Left: Member Profile Icon + Name */}
                <View style={styles.memberHeaderRow}>
                  <View
                    style={[
                      styles.memberAvatarContainer,
                      { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'transparent' },
                    ]}
                  >
                    <Image
                      source={require('../../assets/images/custom_rotate_smiley.png')}
                      style={[
                        styles.memberAvatarSmiley,
                        { tintColor: isDark ? '#FFFFFF' : '#000000' },
                      ]}
                      contentFit="contain"
                    />
                  </View>
                  <Text
                    style={[
                      styles.memberNameText,
                      { color: isDark ? '#FFFFFF' : '#1C1C1E' },
                    ]}
                  >
                    {member.name}
                  </Text>
                </View>

                {/* Bouncing / Floating Color-Changing Capture Smiley */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                  <BouncingSmileyView
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                  />
                </View>

                {/* Center: Time Text & Tap To Capture Pill (Dead Center of Card) */}
                <View style={styles.centerActionGroup} pointerEvents="box-none">
                  <Text
                    style={[
                      styles.delaTimeText,
                      {
                        color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                      },
                    ]}
                  >
                    {member.captureTime || getCurrentHourText()}
                  </Text>
                  {isCurrentUser && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        onClose();
                        onOpenCamera();
                      }}
                      style={[
                        styles.tapToCapturePill,
                        {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.20)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.24)' : 'rgba(0, 0, 0, 0.12)',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tapToCaptureText,
                          { color: isDark ? '#FFFFFF' : '#000000' },
                        ]}
                      >
                        tap to capture
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Bottom Right: Options Triple Dots */}
                {isCurrentUser && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.cardOptionsBtn}
                    onPress={handleShareInvite}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={isDark ? '#8E8E93' : '#636366'}
                    />
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          {/* 2. REMAINING EMPTY / INVITE A FRIEND SLOTS (Images 1, 2, 3, 4, 5) */}
          {Array.from({ length: emptySlotsCount }).map((_, slotIdx) => (
            <TouchableOpacity
              key={`empty_slot_${slotIdx}`}
              activeOpacity={0.8}
              onPress={handleShareInvite}
              style={[
                styles.palCard,
                styles.inviteCard,
                {
                  width: cardWidth,
                  height: cardHeight,
                  backgroundColor: solidCardBg,
                  borderColor: solidCardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.plusIconCircle,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                  },
                ]}
              >
                <Ionicons
                  name="add"
                  size={26}
                  color={isDark ? '#FFFFFF' : '#000000'}
                />
              </View>
              <Text
                style={[
                  styles.inviteText,
                  { color: isDark ? '#8E8E93' : '#636366' },
                ]}
              >
                invite
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* EMBEDDED CALENDAR ARCHIVE MODAL */}
        <VlogSheet
          visible={showCalendarModal}
          onClose={() => setShowCalendarModal(false)}
          selectedThemeColor={selectedThemeColor}
          vlogList={[]}
          user={user}
          selectedDayOffset={0}
          onOpenCamera={() => {
            setShowCalendarModal(false);
            onClose();
            onOpenCamera();
          }}
          onOpenChat={() => setShowChatDrawer(true)}
        />

        {/* EMBEDDED EDIT & EXPORT SLIDESHOW SHEET */}
        <EditExportSheet
          visible={showExportSheet}
          onClose={() => setShowExportSheet(false)}
          vlogList={[]}
          selectedThemeColor={selectedThemeColor}
        />

        {/* EMBEDDED ROOM CHAT DRAWER */}
        <ChatDrawer
          visible={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          palName={group.name}
          palCode={group.code}
          user={user}
          isDark={isDark}
          selectedThemeColor={selectedThemeColor}
        />
      </DynamicGlowContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerCenterCluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vlogLiquidPillBtn: {
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  vlogPillText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Fonts.SystemRoundedBold,
  },
  headerPageDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  headerRightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 8,
    gap: 12,
  },
  palCard: {
    borderRadius: 24,
    borderWidth: 1.2,
    padding: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  memberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  memberAvatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarSmiley: {
    width: 20,
    height: 20,
    tintColor: '#000000',
  },
  memberNameText: {
    fontSize: 15,
    fontFamily: Fonts.SystemRoundedSemibold,
    fontWeight: '600',
  },
  centerActionGroup: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 10,
  },
  delaTimeText: {
    fontFamily: Fonts.DelaGothicOne,
    fontSize: 22,
    letterSpacing: -0.5,
  },
  tapToCapturePill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapToCaptureText: {
    fontSize: 13,
    fontFamily: Fonts.SystemRoundedSemibold,
    fontWeight: '600',
  },
  cardOptionsBtn: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    padding: 6,
    zIndex: 20,
  },
  inviteCard: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  plusIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteText: {
    fontSize: 14,
    fontFamily: Fonts.SystemRoundedMedium,
    fontWeight: '500',
  },
});
