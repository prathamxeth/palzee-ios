import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Share,
  useWindowDimensions,
  Appearance,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { LiquidGlassIconButton, DynamicGlowContainer } from '../ui';
import { BouncingSmileyView, SmileyTouchInfo } from '../vlog/BouncingSmileyView';
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
  isDark?: boolean;
}

export const PalGroupDetailsSheet: React.FC<PalGroupDetailsSheetProps> = ({
  visible,
  onClose,
  group,
  user,
  selectedThemeColor = 'cyan',
  onOpenCamera,
  isDark: propIsDark,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useFastColorScheme();
  const [activeScheme, setActiveScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme: next }) => {
      if (next) setActiveScheme(next);
    });
    return () => sub.remove();
  }, []);

  const isDark =
    propIsDark !== undefined
      ? propIsDark
      : (activeScheme || colorScheme || Appearance.getColorScheme()) === 'dark';

  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [smileyTouch, setSmileyTouch] = useState<SmileyTouchInfo | null>(null);
  const rippleOpacityAnim = useRef(new Animated.Value(0)).current;

  const handleSmileyHover = useCallback((info: SmileyTouchInfo | null) => {
    if (info) {
      setSmileyTouch(info);
      Animated.timing(rippleOpacityAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(rippleOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        setSmileyTouch(null);
      });
    }
  }, [rippleOpacityAnim]);

  const cardWidth = screenWidth - 28;

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

  // EXACT CARD CONTAINER SIZING MATCHING VLOGSHEET (Up to 3 members: exact VlogSheet box height; 4+ adjusted cleanly)
  const cardHeight =
    maxSlots <= 3
      ? Math.round(cardWidth * (9.5 / 16) + 20)
      : maxSlots === 4
      ? Math.round(cardWidth * 0.38)
      : maxSlots === 5
      ? Math.round(cardWidth * 0.31)
      : Math.round(cardWidth * 0.26);

  const delaFontSize = maxSlots <= 3 ? 26 : maxSlots === 4 ? 20 : 16;
  const userNameFontSize = maxSlots <= 3 ? 22 : maxSlots === 4 ? 18 : 15;

  // Solid background shades adapting instantly to dark/light mode
  const solidCardBg = isDark ? '#161618' : '#EFEFF2';
  const solidCardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const themeFillColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const isSmallSlot = maxSlots >= 4;

  return (
    <View
      key={`pals_view_${isDark ? 'dark' : 'light'}`}
      style={[
        StyleSheet.absoluteFill,
        styles.fullScreenContainer,
        {
          backgroundColor: isDark ? '#000000' : '#F5F5F7',
          zIndex: 9999,
          elevation: 9999,
        },
      ]}
    >
      {/* TOP NAVIGATION HEADER (Exact matching VlogSheet positioning & dimensions) */}
        <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + 4, 12) }]}>
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

          {/* Top Center: Group Name Capsule & Page Dot (Moved below by 1.5dp -> marginTop: 49.0dp) */}
          <View style={[styles.centerHeaderGroup, { marginTop: 49.0 }]} pointerEvents="box-none">
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.vlogLiquidPillBtn, { width: 110 }]}
              onPress={handleShareInvite}
            >
              <BlurView
                key={`blur_group_${isDark ? 'dark' : 'light'}`}
                intensity={Platform.OS === 'ios' ? 40 : 30}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
              />
              <Svg width={110} height={45} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id={`groupPillRim_${isDark ? 'dark' : 'light'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                    <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                    <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                  </LinearGradient>
                </Defs>
                <Rect
                  x="0.75"
                  y="0.75"
                  width={108.5}
                  height={43.5}
                  rx={21.75}
                  fill="none"
                  stroke={`url(#groupPillRim_${isDark ? 'dark' : 'light'})`}
                  strokeWidth={1.2}
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

            {/* Center Page Dot Indicator exactly under the pill */}
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

        {/* BODY LIST OF PAL CARDS (Vertically Centered For 2 & 3 People On Screen) */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 16) + 14,
              gap: 0.5,
              justifyContent: maxSlots <= 3 ? 'center' : 'flex-start',
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={maxSlots > 3}
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
                    borderWidth: 0,
                    borderColor: 'transparent',
                  },
                ]}
              >
                {/* Top-Left: Member Profile Icon + Name (Exact VlogSheet Style) */}
                <View style={styles.memberHeaderRow} pointerEvents="none">
                  <View
                    style={[
                      styles.avatarCircle,
                      {
                        backgroundColor: (user?.photoURL && isCurrentUser) || member.avatarUri
                          ? 'transparent'
                          : themeFillColor,
                      },
                    ]}
                  >
                    {user?.photoURL && isCurrentUser ? (
                      <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                    ) : member.avatarUri ? (
                      <Image source={{ uri: member.avatarUri }} style={styles.avatarImage} />
                    ) : (
                      <Image
                        source={require('../../assets/images/capture_smile.png')}
                        style={styles.smileyIcon}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.memberNameText,
                      { color: '#636366', fontSize: userNameFontSize },
                    ]}
                  >
                    {member.name}
                  </Text>
                </View>

                {/* Bouncing / Floating Color-Changing Capture Smiley (Only on current user's active capture slot) */}
                {isCurrentUser && !member.hasCaptured && (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <BouncingSmileyView
                      cardWidth={cardWidth}
                      cardHeight={cardHeight}
                      onSmileyHover={handleSmileyHover}
                    />
                  </View>
                )}

                {/* Center: Time Text & Tap To Capture Pill (Exact VlogSheet tap to capture pill) */}
                <View style={styles.centerActionGroup} pointerEvents="box-none">
                  <Text
                    style={[
                      styles.delaTimeText,
                      {
                        fontSize: delaFontSize,
                        color: isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.16)',
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
                      style={{
                        paddingHorizontal: isSmallSlot ? 16 : 22,
                        paddingVertical: isSmallSlot ? 8 : 12,
                        borderRadius: isSmallSlot ? 18 : 22,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        zIndex: 35,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.12,
                        shadowRadius: 10,
                        elevation: 4,
                      }}
                    >
                      <View
                        style={{
                          ...StyleSheet.absoluteFillObject,
                          borderRadius: isSmallSlot ? 18 : 22,
                          overflow: 'hidden',
                          backgroundColor: isDark ? 'rgba(30, 30, 34, 0.65)' : 'rgba(255, 255, 255, 0.72)',
                        }}
                      >
                        <BlurView
                          key={`blur_grp_tap_${isDark ? 'dark' : 'light'}`}
                          intensity={Platform.OS === 'ios' ? 40 : 30}
                          tint={isDark ? 'dark' : 'light'}
                          style={StyleSheet.absoluteFill}
                        />

                        {/* LOCALIZED WATER RIPPLE ILLUMINATION AT EXACT POINT OF CONTACT */}
                        {smileyTouch && (
                          <Animated.View
                            style={[
                              StyleSheet.absoluteFillObject,
                              {
                                opacity: rippleOpacityAnim,
                              },
                            ]}
                            pointerEvents="none"
                          >
                            <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                              <Defs>
                                <RadialGradient
                                  id="grpSmileyRippleGlow"
                                  cx={`${smileyTouch.relX || 0}`}
                                  cy={`${smileyTouch.relY || 0}`}
                                  r={isSmallSlot ? "38" : "46"}
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <Stop offset="0%" stopColor={smileyTouch.color || '#FE75F5'} stopOpacity={isDark ? 0.70 : 0.60} />
                                  <Stop offset="45%" stopColor={smileyTouch.color || '#FE75F5'} stopOpacity={isDark ? 0.28 : 0.22} />
                                  <Stop offset="100%" stopColor={smileyTouch.color || '#FE75F5'} stopOpacity={0.0} />
                                </RadialGradient>
                              </Defs>
                              <Rect width="100%" height="100%" fill="url(#grpSmileyRippleGlow)" />
                            </Svg>
                          </Animated.View>
                        )}

                        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                          <Defs>
                            <LinearGradient id="grpTapCapRim" x1="0%" y1="0%" x2="0%" y2="100%">
                              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                              <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                            </LinearGradient>
                          </Defs>
                          <Rect
                            x="0.75"
                            y="0.75"
                            width="98.5%"
                            height="96.5%"
                            rx={isSmallSlot ? 17.25 : 21.25}
                            ry={isSmallSlot ? 17.25 : 21.25}
                            fill="none"
                            stroke="url(#grpTapCapRim)"
                            strokeWidth={1.2}
                          />
                        </Svg>
                      </View>
                      <Text
                        style={{
                          color: isDark ? '#FFFFFF' : '#000000',
                          fontSize: isSmallSlot ? 13 : 16,
                          fontFamily: Fonts.SystemRoundedSemibold,
                          zIndex: 10,
                        }}
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
                  borderWidth: 0,
                  borderColor: 'transparent',
                },
              ]}
            >
              <View
                style={[
                  styles.plusIconCircle,
                  {
                    backgroundColor: isDark ? '#242428' : '#FFFFFF',
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
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
    zIndex: 20,
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 25,
  },
  centerHeaderGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  vlogLiquidPillBtn: {
    width: 110,
    height: 45,
    borderRadius: 22.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vlogPillText: {
    fontSize: 22.5,
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
    zIndex: 25,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 0,
  },
  palCard: {
    borderRadius: 28,
    borderWidth: 0,
    padding: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  memberHeaderRow: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  avatarCircle: {
    width: 23.0,
    height: 23.0,
    borderRadius: 11.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  smileyIcon: {
    width: 23.0,
    height: 23.0,
  },
  memberNameText: {
    fontFamily: Fonts.SystemRoundedSemibold,
    fontWeight: '600',
  },
  centerActionGroup: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    zIndex: 30,
    elevation: 10,
  },
  delaTimeText: {
    fontFamily: Fonts.DelaGothicOne,
    letterSpacing: -0.5,
    zIndex: 30,
  },
  tapToCapturePill: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 35,
    elevation: 12,
  },
  tapToCaptureText: {
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
