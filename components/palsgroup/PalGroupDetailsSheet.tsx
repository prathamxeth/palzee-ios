import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Share,
  useWindowDimensions,
  Appearance,
  Animated,
  Easing,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { LiquidGlassIconButton, LiquidGlassCapsule } from '../ui';
import { BouncingSmileyView, SmileyTouchInfo } from '../vlog/BouncingSmileyView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PalGroupExportSheet } from './PalGroupExportSheet';
import { PalGroupChatDrawer } from './PalGroupChatDrawer';
import { EditPalModal } from './EditPalModal';

const VerticalBarcodeIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="2" height="18" fill={color} rx="1" />
    <Rect x="6" y="3" width="1.2" height="18" fill={color} rx="0.6" />
    <Rect x="9" y="3" width="3" height="18" fill={color} rx="1" />
    <Rect x="14" y="3" width="1.2" height="18" fill={color} rx="0.6" />
    <Rect x="17" y="3" width="2" height="18" fill={color} rx="1" />
    <Rect x="21" y="3" width="1.2" height="18" fill={color} rx="0.6" />
  </Svg>
);

export interface PalGroupMember {
  id: string;
  name: string;
  avatarUri?: string;
  isCreator?: boolean;
  captureTime?: string;
  hasCaptured?: boolean;
  smileyColor?: string;
  caption?: string;
  videoUri?: string;
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
  onOpenCamera?: () => void;
  isDark?: boolean;
  onDeleteGroup?: (groupCode: string) => void;
  onLeaveGroup?: (groupCode: string) => void;
  onUpdateGroup?: (groupCode: string, newName: string, newSize: number) => void;
  vlogList?: any[];
  activeVideoUri?: string | null;
}

export const PalGroupDetailsSheet: React.FC<PalGroupDetailsSheetProps> = ({
  visible,
  onClose,
  group,
  user,
  selectedThemeColor = 'cyan',
  onOpenCamera,
  isDark: propIsDark,
  onDeleteGroup,
  onLeaveGroup,
  onUpdateGroup,
  vlogList = [],
  activeVideoUri = null,
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
  const [show0Pals, setShow0Pals] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [groupSubMenu, setGroupSubMenu] = useState<'main' | 'members' | 'settings'>('main');
  const [showDeleteGroupDialog, setShowDeleteGroupDialog] = useState(false);
  const [showLeaveGroupDialog, setShowLeaveGroupDialog] = useState(false);
  const [showEditGroupNameModal, setShowEditGroupNameModal] = useState(false);
  const [currentGroupName, setCurrentGroupName] = useState(group?.name || '');
  const [currentGroupSize, setCurrentGroupSize] = useState(group?.size || group?.maxCount || 3);

  useEffect(() => {
    if (group) {
      setCurrentGroupName(group.name);
      setCurrentGroupSize(group.size || group.maxCount || 3);
    }
  }, [group]);
  const [dropdownLayout, setDropdownLayout] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [smileyTouch, setSmileyTouch] = useState<SmileyTouchInfo | null>(null);
  const rippleOpacityAnim = useRef(new Animated.Value(0)).current;

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [selectedMemberForOptions, setSelectedMemberForOptions] = useState<PalGroupMember | null>(null);
  const [showEditCaptionBox, setShowEditCaptionBox] = useState(false);
  const [editingCaptionText, setEditingCaptionText] = useState('');
  const [memberCaptions, setMemberCaptions] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveCaption = () => {
    if (selectedMemberForOptions) {
      setMemberCaptions((prev) => ({
        ...prev,
        [selectedMemberForOptions.id]: editingCaptionText,
      }));
    }
    setShowEditCaptionBox(false);
  };

  const logsRotateAnim = useRef(new Animated.Value(0)).current;
  const logsOpacityAnim = useRef(new Animated.Value(1)).current;
  const rotateLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trigger0PalsEffect = () => {
    if (rotateLoopRef.current) rotateLoopRef.current.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    setShow0Pals(true);
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
        setShow0Pals(false);
        if (rotateLoopRef.current) rotateLoopRef.current.stop();
      });
    }, 3000);
  };

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

  const themeFillColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const renderCalendarGridDays = () => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = today.getDate();

    const gridCells = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      gridCells.push(<View key={`empty-${i}`} style={{ width: `${100 / 7}%`, height: 56 }} />);
    }

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const isToday = isCurrentMonth && day === todayDate;

      gridCells.push(
        <TouchableOpacity
          key={`day-${day}`}
          activeOpacity={0.7}
          onPress={() => {
            setShowCalendarModal(false);
          }}
          style={{
            width: `${100 / 7}%`,
            height: 58,
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: 3,
          }}
        >
          <View
            style={[
              {
                width: 32,
                height: 32,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
              },
              isToday && { backgroundColor: themeFillColor },
            ]}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: isToday ? Fonts.SystemRoundedBold : Fonts.SystemRoundedMedium,
                fontWeight: isToday ? '700' : '500',
                color: isToday
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : (isDark ? '#FFFFFF' : '#000000'),
              }}
            >
              {day}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return gridCells;
  };

  if (!visible || !group) return null;

  const isCreator = Boolean(
    group?.isCreator ||
    (group?.members && group.members.find(m => m.id === user?.uid || m.name === currentUserName)?.isCreator) ||
    (!group?.members || group.members.length === 0)
  );

  const handleExportFromDropdown = () => {
    setShowGroupDropdown(false);
    const hasCapturedLogs = joinedMembers.some((m) => m.hasCaptured);
    if (hasCapturedLogs) {
      setShowExportSheet(true);
    } else {
      trigger0PalsEffect();
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!group) return;
    try {
      const stored = await AsyncStorage.getItem('pal_rooms_key');
      if (stored) {
        const rooms = JSON.parse(stored);
        const updated = rooms.filter((r: any) => r.code !== group.code);
        await AsyncStorage.setItem('pal_rooms_key', JSON.stringify(updated));
      }
    } catch (e) {}
    setShowDeleteGroupDialog(false);
    onDeleteGroup?.(group.code);
    onClose();
  };

  const handleConfirmLeaveGroup = async () => {
    if (!group) return;
    try {
      const stored = await AsyncStorage.getItem('pal_rooms_key');
      if (stored) {
        const rooms = JSON.parse(stored);
        const updated = rooms.filter((r: any) => r.code !== group.code);
        await AsyncStorage.setItem('pal_rooms_key', JSON.stringify(updated));
      }
    } catch (e) {}
    setShowLeaveGroupDialog(false);
    onLeaveGroup?.(group.code);
    onClose();
  };

  const maxSlots = currentGroupSize || group.maxCount || group.size || 5;
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

  // EXACT CARD CONTAINER SIZING MATCHING VLOGSHEET (-2.5dp top & bottom = -5dp for 3 members; 4+ scaled cleanly)
  const cardHeight =
    maxSlots <= 3
      ? Math.round(cardWidth * (9.5 / 16) + 15)
      : maxSlots === 4
      ? Math.round(cardWidth * 0.38)
      : maxSlots === 5
      ? Math.round(cardWidth * 0.31)
      : Math.round(cardWidth * 0.26);

  const delaFontSize = maxSlots <= 3 ? 26 : maxSlots === 4 ? 20 : 16;
  const userNameFontSize = maxSlots <= 3 ? 22 : maxSlots === 4 ? 18 : 15;

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

  // Solid background shades adapting instantly to dark/light mode
  const solidCardBg = isDark ? '#161618' : '#EFEFF2';
  const solidCardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

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
      <View
        style={[styles.headerBar, { paddingTop: Math.max(insets.top - 1, 7) }]}
        pointerEvents="box-none"
      >
          {/* Top Left: Back button & Calendar Archive button or 0 pals pill */}
          <View style={styles.headerLeftCluster}>
            {show0Pals ? (
              <Animated.View style={{ opacity: logsOpacityAnim }}>
                <TouchableOpacity
                  style={styles.zeroLogsPillBtn}
                  activeOpacity={0.8}
                  onPress={onClose}
                >
                  <BlurView
                    key={`blur_logs_${isDark ? 'dark' : 'systemMaterialLight'}`}
                    intensity={Platform.OS === 'ios' ? 40 : 30}
                    tint={isDark ? 'dark' : 'systemMaterialLight'}
                    style={StyleSheet.absoluteFill}
                  />
                  <Svg width={96} height={42} style={StyleSheet.absoluteFill}>
                    <Defs>
                      <LinearGradient id="logsPillRim" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                        <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                        <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x="0.75"
                      y="0.75"
                      width="94.5"
                      height="40.5"
                      rx="20.25"
                      fill="none"
                      stroke="url(#logsPillRim)"
                      strokeWidth={1.2}
                    />
                  </Svg>
                  <View style={[styles.logsSmileyCircle, { backgroundColor: '#FF3B30' }]}>
                    <Animated.View
                      style={{
                        transform: [
                          { scale: 1.22 },
                          {
                            rotate: logsRotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <Image
                        source={require('../../assets/images/custom_rotate_smiley.png')}
                        style={[
                          styles.logsSmileyImg,
                          {
                            tintColor: '#000000',
                          },
                        ]}
                        contentFit="contain"
                      />
                    </Animated.View>
                  </View>
                  <Text
                    style={[
                      styles.zeroLogsText,
                      { color: isDark ? '#FFFFFF' : '#000000' },
                    ]}
                  >
                    0 pals
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <>
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
              </>
            )}
          </View>

          {/* Top Center: Group Name Capsule & Page Dot */}
          <View style={[styles.centerHeaderGroup, { top: Math.max(insets.top - 1, 7) }]} pointerEvents="box-none">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowGroupDropdown(!showGroupDropdown)}
            >
              <LiquidGlassCapsule
                idPrefix="groupDetailsHeader"
                isDark={isDark}
                width={110}
                height={45}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 6 }}>
                  <Text
                    style={[
                      styles.vlogPillText,
                      { color: isDark ? '#FFFFFF' : '#000000', textAlign: 'center', maxWidth: 74 },
                    ]}
                    numberOfLines={1}
                  >
                    {currentGroupName || group.name}
                  </Text>
                  <Ionicons
                    name={showGroupDropdown ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={isDark ? '#FFFFFF' : '#000000'}
                    style={{ marginTop: 1 }}
                  />
                </View>
              </LiquidGlassCapsule>
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
              onPress={() => {
                const hasCapturedLogs = joinedMembers.some(m => m.hasCaptured);
                if (hasCapturedLogs) {
                  setShowExportSheet(true);
                } else {
                  trigger0PalsEffect();
                }
              }}
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

        {/* BODY LIST OF PAL CARDS (Scrolls underneath floating glass header) */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top - 1, 7) + 55 + (maxSlots <= 3 ? 19 : 8),
              paddingBottom: Math.max(insets.bottom, 24) + 32,
              gap: 2,
              justifyContent: 'flex-start',
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* 1. JOINED MEMBER / CREATOR CARDS */}
          {joinedMembers.map((member, idx) => {
            const isCurrentUser = member.isCreator || member.id === 'user_self' || member.name === currentUserName;
            const memberVideoUri = isCurrentUser
              ? (activeVideoUri || (vlogList && vlogList.length > 0 ? vlogList[0]?.uri : null) || member.videoUri)
              : member.videoUri;
            const hasVideo = !!memberVideoUri;

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
                    overflow: 'hidden',
                  },
                ]}
              >
                {/* VIDEO PLAYBACK WHEN VIDEO PAL EXISTS */}
                {hasVideo && (
                  <Video
                    source={{ uri: memberVideoUri }}
                    style={
                      (member as any)?.needsRotation !== false
                        ? rotatedStyle
                        : [StyleSheet.absoluteFill, { borderRadius: isSmallSlot ? 18 : 22 }]
                    }
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={visible && !showEditCaptionBox && !showOptionsMenu && !showChatDrawer && !showExportSheet}
                    isLooping={true}
                    isMuted={false}
                    useNativeControls={false}
                  />
                )}

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
                        contentFit="contain"
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.memberNameText,
                      { color: hasVideo ? '#FFFFFF' : '#636366', fontSize: userNameFontSize },
                    ]}
                  >
                    {member.name}
                  </Text>
                </View>

                {/* Bouncing / Floating Color-Changing Capture Smiley (Only on current user's uncaptured slot) */}
                {isCurrentUser && !hasVideo && !member.hasCaptured && (
                  <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <BouncingSmileyView
                      cardWidth={cardWidth}
                      cardHeight={cardHeight}
                      onSmileyHover={handleSmileyHover}
                    />
                  </View>
                )}

                {/* Center: When Video is present -> ONLY Time in Dela Gothic font in center */}
                {hasVideo ? (
                  <View style={styles.centerActionGroup} pointerEvents="none">
                    <Text
                      style={[
                        styles.delaTimeText,
                        {
                          fontSize: isSmallSlot ? 20 : 26,
                          color: '#FFFFFF',
                          fontFamily: Fonts.DelaGothicOne,
                        },
                      ]}
                    >
                      {member.captureTime || getCurrentHourText()}
                    </Text>
                  </View>
                ) : (
                  /* Center: When NO Video -> Dela Time + Tap To Capture Pill */
                  <View style={styles.centerActionGroup} pointerEvents={showGroupDropdown ? 'none' : 'box-none'}>
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
                    {isCurrentUser && !showGroupDropdown && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          onClose();
                          if (onOpenCamera) onOpenCamera();
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
                )}

                {/* Caption Display if set */}
                {!!memberCaptions[member.id] && (
                  <View style={{ position: 'absolute', left: 20, right: 20, bottom: 48, zIndex: 32, alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: Fonts.SystemRoundedSemibold, textAlign: 'center' }}>
                      {memberCaptions[member.id]}
                    </Text>
                  </View>
                )}

                {/* Bottom Right: Options Triple Dots (ONLY on current user's card) */}
                {isCurrentUser && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.cardOptionsBtn}
                    onPress={() => {
                      setSelectedMemberForOptions(member);
                      setEditingCaptionText(memberCaptions[member.id] || member.caption || '');
                      setShowOptionsMenu(true);
                    }}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={22}
                      color={hasVideo || member.hasCaptured ? '#FFFFFF' : (isDark ? 'rgba(255, 255, 255, 0.40)' : 'rgba(0, 0, 0, 0.35)')}
                    />
                  </TouchableOpacity>
                )}

                {/* IN-CARD EDIT CAPTION OVERLAY WITH CENTER BLINKING CURSOR & TOP CONTROLS (ONLY on current user) */}
                {isCurrentUser && showEditCaptionBox && selectedMemberForOptions?.id === member.id && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 100, justifyContent: 'center', alignItems: 'center', borderRadius: 24, overflow: 'hidden' }]}>
                    {/* TOP LEFT CROSS BUTTON */}
                    <View style={{ position: 'absolute', top: 9.5, left: 11.5, zIndex: 110 }}>
                      <LiquidGlassIconButton
                        idPrefix="btnGrpCaptionClose"
                        isDark={isDark}
                        size={45}
                        onPress={() => {
                          Keyboard.dismiss();
                          setShowEditCaptionBox(false);
                        }}
                      >
                        <Ionicons name="close-sharp" size={25} color={isDark ? '#FFFFFF' : '#000000'} />
                      </LiquidGlassIconButton>
                    </View>

                    {/* TOP RIGHT TICK BUTTON */}
                    <View style={{ position: 'absolute', top: 9.5, right: 11.5, zIndex: 110 }}>
                      <LiquidGlassIconButton
                        idPrefix="btnGrpCaptionSave"
                        isDark={isDark}
                        size={45}
                        onPress={() => {
                          Keyboard.dismiss();
                          handleSaveCaption();
                        }}
                      >
                        <Ionicons name="checkmark-sharp" size={25} color={isDark ? '#FFFFFF' : '#000000'} />
                      </LiquidGlassIconButton>
                    </View>

                    {/* CENTER BLINKING CURSOR CAPTION INPUT */}
                    <TextInput
                      style={{
                        width: '85%',
                        textAlign: 'center',
                        color: '#FFFFFF',
                        fontSize: 22,
                        fontFamily: Fonts.SystemRoundedBold,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                      value={editingCaptionText}
                      onChangeText={setEditingCaptionText}
                      placeholder=""
                      placeholderTextColor="transparent"
                      autoFocus={true}
                      selectionColor="#4FFFB0"
                    />
                  </View>
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

        {/* EMBEDDED CALENDAR ARCHIVE MODAL (Exact Matching VlogSheet Calendar Bottom Sheet) */}
        <Modal
          visible={showCalendarModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCalendarModal(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'flex-end',
              paddingHorizontal: 8,
              paddingBottom: Math.max(insets.bottom - 26.5, 0),
            }}
            activeOpacity={1}
            onPress={() => setShowCalendarModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: isDark ? '#1C1C20' : '#F7F6F3',
                borderRadius: 36,
                borderWidth: 1.2,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.10)',
                paddingTop: 14,
                paddingBottom: 18,
                paddingHorizontal: 16,
                overflow: 'hidden',
              }}
            >
              <BlurView key={isDark ? 'dark' : 'light'} intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

              {/* Drag Handle */}
              <View
                style={{
                  width: 36,
                  height: 4.5,
                  borderRadius: 2.25,
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)',
                  alignSelf: 'center',
                  marginBottom: 16,
                }}
              />

              {/* Calendar Header Row: Month Title & Nav Arrows */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 18,
                  paddingHorizontal: 4,
                }}
              >
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontFamily: Fonts.SystemRoundedBold,
                      fontWeight: '700',
                      color: isDark ? '#FFFFFF' : '#000000',
                    }}
                  >
                    {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={isDark ? '#8E8E93' : '#636366'} />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const newD = new Date(calendarDate);
                      newD.setMonth(newD.getMonth() - 1);
                      setCalendarDate(newD);
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="chevron-back" size={22} color={isDark ? '#D1D1D6' : '#636366'} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      const newD = new Date(calendarDate);
                      newD.setMonth(newD.getMonth() + 1);
                      setCalendarDate(newD);
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="chevron-forward" size={22} color={isDark ? '#D1D1D6' : '#636366'} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weekday Headers */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  marginBottom: 14,
                }}
              >
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                  <Text
                    key={day}
                    style={{
                      width: 40,
                      textAlign: 'center',
                      fontSize: 13,
                      fontFamily: Fonts.SystemRoundedBold,
                      fontWeight: '600',
                      color: isDark ? '#8E8E93' : '#636366',
                    }}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {renderCalendarGridDays()}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* EMBEDDED PAL GROUP EXPORT SHEET */}
        <PalGroupExportSheet
          visible={showExportSheet}
          onClose={() => setShowExportSheet(false)}
          vlogList={[]}
          selectedThemeColor={selectedThemeColor}
        />

        {/* PALS GROUP LIQUID GLASS DROPDOWN MENU (LAYER-BY-LAYER NAVIGATION) */}
        <Modal
          visible={showGroupDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowGroupDropdown(false);
            setGroupSubMenu('main');
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              alignItems: 'center',
              paddingTop: Math.max(insets.top - 1, 7) + 52,
            }}
            activeOpacity={1}
            onPress={() => {
              setShowGroupDropdown(false);
              setGroupSubMenu('main');
            }}
          >
            {/* SINGLE UNIFIED LIQUID GLASS DROPDOWN BOX (1 OUTLINE / 1 BOUNDARY) */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                alignSelf: 'center',
                minWidth: 187.5,
                maxWidth: 247.5,
                borderRadius: 24,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16,
                shadowRadius: 16,
                elevation: 8,
                backgroundColor: 'transparent',
              }}
            >
              <View
                onLayout={(e) => {
                  const { width, height } = e.nativeEvent.layout;
                  if (width > 0 && height > 0) {
                    setDropdownLayout({ width, height });
                  }
                }}
                style={{
                  borderRadius: 24,
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: isDark ? 'rgba(28, 28, 32, 0.65)' : 'rgba(255, 255, 255, 0.65)',
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                }}
              >
                {/* 1. Frosted Backdrop Blur covering 100% of the entire card */}
                <BlurView
                  key={`blur_pals_dropdown_${isDark ? 'dark' : 'light'}`}
                  intensity={Platform.OS === 'ios' ? 75 : 50}
                  tint={isDark ? 'dark' : 'light'}
                  style={[StyleSheet.absoluteFillObject, { borderRadius: 24 }]}
                />

                {/* 2. Specular Rim Highlight precisely covering full width and height */}
                {dropdownLayout.width > 0 && dropdownLayout.height > 0 && (
                  <Svg
                    width={dropdownLayout.width}
                    height={dropdownLayout.height}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                  >
                    <Defs>
                      <LinearGradient
                        id="palsDropdownRim"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                      >
                        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                        <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                      </LinearGradient>
                    </Defs>
                    <Rect
                      x="0.75"
                      y="0.75"
                      width={dropdownLayout.width - 1.5}
                      height={dropdownLayout.height - 1.5}
                      rx={23}
                      ry={23}
                      fill="none"
                      stroke="url(#palsDropdownRim)"
                      strokeWidth={1.0}
                    />
                  </Svg>
                )}

                {/* LAYER 1: MAIN MENU */}
                {groupSubMenu === 'main' && (
                  <>
                    {/* Group Title Section Label (+2.5dp -> 16.5) */}
                    <Text
                      style={{
                        fontSize: 16.5,
                        fontFamily: Fonts.SystemRoundedSemibold,
                        color: isDark ? '#8E8E93' : '#636366',
                        paddingHorizontal: 6,
                        paddingTop: 2,
                        marginBottom: 8,
                      }}
                      numberOfLines={1}
                    >
                      {currentGroupName || group.name}
                    </Text>

                    {/* Code Item with Vertical Barcode Stripes (+2.5dp -> 17) */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={handleShareInvite}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 6,
                        paddingHorizontal: 6,
                        gap: 10,
                        zIndex: 10,
                      }}
                    >
                      <VerticalBarcodeIcon size={19} color={isDark ? '#FFFFFF' : '#000000'} />
                      <Text
                        style={{
                          fontSize: 17,
                          fontFamily: Fonts.IBMPlexMono,
                          color: isDark ? '#FFFFFF' : '#000000',
                        }}
                      >
                        code: {group.code}
                      </Text>
                    </TouchableOpacity>

                    {/* Members Navigation Item -> switches to 'members' layer (+2.5dp -> 18) */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setGroupSubMenu('members')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 6,
                        paddingHorizontal: 6,
                        zIndex: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="people-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: Fonts.SystemRoundedMedium,
                            color: isDark ? '#FFFFFF' : '#000000',
                          }}
                        >
                          members
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={isDark ? '#8E8E93' : '#636366'}
                        style={{ marginLeft: 10 }}
                      />
                    </TouchableOpacity>

                    {/* Settings Navigation Item -> switches to 'settings' layer (+2.5dp -> 18) */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setGroupSubMenu('settings')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 6,
                        paddingHorizontal: 6,
                        zIndex: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="settings-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
                        <Text
                          style={{
                            fontSize: 18,
                            fontFamily: Fonts.SystemRoundedMedium,
                            color: isDark ? '#FFFFFF' : '#000000',
                          }}
                        >
                          settings
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={isDark ? '#8E8E93' : '#636366'}
                        style={{ marginLeft: 10 }}
                      />
                    </TouchableOpacity>
                  </>
                )}

                {/* LAYER 2: MEMBERS SUB-LAYER */}
                {groupSubMenu === 'members' && (
                  <>
                    {/* Bolder Header Row with Chevron-Down to go back (+2.5dp -> 18.5) */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setGroupSubMenu('main')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                        zIndex: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="people-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
                        <Text
                          style={{
                            fontSize: 18.5,
                            fontFamily: Fonts.SystemRoundedBold,
                            fontWeight: '700',
                            color: isDark ? '#FFFFFF' : '#000000',
                          }}
                        >
                          members
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={isDark ? '#FFFFFF' : '#000000'}
                        style={{ marginLeft: 10 }}
                      />
                    </TouchableOpacity>

                    {/* Hairline Divider */}
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
                        marginHorizontal: 4,
                        marginTop: 6,
                        marginBottom: 8,
                      }}
                    />

                    {/* Members List (+2.5dp -> 17.5) */}
                    <View style={{ paddingHorizontal: 6, gap: 8, paddingBottom: 2 }}>
                      {joinedMembers.map((member) => (
                        <View
                          key={member.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 1,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 17.5,
                              fontFamily: Fonts.SystemRoundedMedium,
                              color: isDark ? '#FFFFFF' : '#000000',
                            }}
                            numberOfLines={1}
                          >
                            {member.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                )}

                {/* LAYER 3: SETTINGS SUB-LAYER */}
                {groupSubMenu === 'settings' && (
                  <>
                    {/* Bolder Header Row with Chevron-Down to go back (+2.5dp -> 18.5) */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setGroupSubMenu('main')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 6,
                        paddingVertical: 4,
                        zIndex: 10,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Ionicons name="settings-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
                        <Text
                          style={{
                            fontSize: 18.5,
                            fontFamily: Fonts.SystemRoundedBold,
                            fontWeight: '700',
                            color: isDark ? '#FFFFFF' : '#000000',
                          }}
                        >
                          settings
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={isDark ? '#FFFFFF' : '#000000'}
                        style={{ marginLeft: 10 }}
                      />
                    </TouchableOpacity>

                    {/* Hairline Divider */}
                    <View
                      style={{
                        height: StyleSheet.hairlineWidth,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
                        marginHorizontal: 4,
                        marginTop: 6,
                        marginBottom: 8,
                      }}
                    />

                    {/* Settings Options (+2.5dp -> 17.5) */}
                    <View style={{ gap: 2, paddingBottom: 2 }}>
                      {/* edit pal */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                          setShowGroupDropdown(false);
                          setGroupSubMenu('main');
                          setShowEditGroupNameModal(true);
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingHorizontal: 6,
                          paddingVertical: 6,
                          zIndex: 10,
                        }}
                      >
                        <Ionicons name="options-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                        <Text
                          style={{
                            fontSize: 17.5,
                            fontFamily: Fonts.SystemRoundedMedium,
                            color: isDark ? '#FFFFFF' : '#000000',
                          }}
                        >
                          edit pal
                        </Text>
                      </TouchableOpacity>

                      {/* delete pal (for creator) or leave pal (for member) */}
                      {isCreator ? (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setShowGroupDropdown(false);
                            setGroupSubMenu('main');
                            setShowDeleteGroupDialog(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            paddingHorizontal: 6,
                            paddingVertical: 6,
                            zIndex: 10,
                          }}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                          <Text
                            style={{
                              fontSize: 17.5,
                              fontFamily: Fonts.SystemRoundedMedium,
                              color: '#FF3B30',
                            }}
                          >
                            delete pal
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setShowGroupDropdown(false);
                            setGroupSubMenu('main');
                            setShowLeaveGroupDialog(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            paddingHorizontal: 6,
                            paddingVertical: 6,
                            zIndex: 10,
                          }}
                        >
                          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                          <Text
                            style={{
                              fontSize: 17.5,
                              fontFamily: Fonts.SystemRoundedMedium,
                              color: '#FF3B30',
                            }}
                          >
                            leave pal
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* EDIT PALS GROUP MODAL (MATCHING EXACT CREATE PAL MODAL DESIGN & CONTROLS UP TO 10) */}
        <EditPalModal
          visible={showEditGroupNameModal}
          onClose={() => setShowEditGroupNameModal(false)}
          initialName={currentGroupName || group?.name || ''}
          initialSize={currentGroupSize || group?.size || 3}
          minSize={Math.max(joinedMembers.length, 2)}
          themeColor={selectedThemeColor}
          onSave={async (newName, newSize) => {
            if (group) {
              group.name = newName;
              group.size = newSize;
              setCurrentGroupName(newName);
              setCurrentGroupSize(newSize);
              try {
                const stored = await AsyncStorage.getItem('pal_rooms_key');
                if (stored) {
                  const rooms = JSON.parse(stored);
                  const updated = rooms.map((r: any) =>
                    r.code === group.code ? { ...r, name: newName, size: newSize, maxCount: newSize } : r
                  );
                  await AsyncStorage.setItem('pal_rooms_key', JSON.stringify(updated));
                }
              } catch (e) {}

              if (onUpdateGroup) {
                onUpdateGroup(group.code, newName, newSize);
              }
            }
          }}
        />

        {/* DELETE PALS GROUP DIALOG MODAL (IMAGE 4) */}
        <Modal
          visible={showDeleteGroupDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDeleteGroupDialog(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
            activeOpacity={1}
            onPress={() => setShowDeleteGroupDialog(false)}
          >
            <TouchableOpacity
              style={{
                width: Math.min(cardWidth * 0.88, 290),
                borderRadius: 24,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16,
                shadowRadius: 16,
                elevation: 8,
                backgroundColor: 'transparent',
                position: 'relative',
              }}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: isDark ? 'rgba(28, 28, 30, 0.88)' : 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <BlurView
                  key={`blur_del_pals_${isDark ? 'dark' : 'light'}`}
                  intensity={Platform.OS === 'ios' ? 40 : 30}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <Defs>
                    <LinearGradient id="delPalsRim" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                      <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                      <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0.75"
                    y="0.75"
                    width="99.2%"
                    height="98.5%"
                    rx={23.25}
                    ry={23.25}
                    fill="none"
                    stroke="url(#delPalsRim)"
                    strokeWidth={1.2}
                  />
                </Svg>
              </View>

              <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, alignItems: 'center', zIndex: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.SystemRoundedMedium,
                    color: isDark ? '#FFFFFF' : '#000000',
                    textAlign: 'center',
                    lineHeight: 22,
                    marginBottom: 18,
                  }}
                >
                  are you sure you want to delete this pals group permanently?
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
                    }}
                    activeOpacity={0.7}
                    onPress={() => setShowDeleteGroupDialog(false)}
                  >
                    <BlurView
                      key={`blur_cancel_del_grp_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 40 : 30}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="cancelDelPalsRim" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                          <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect x="0.75" y="0.75" width="99%" height="42.5" rx={21.25} fill="none" stroke="url(#cancelDelPalsRim)" strokeWidth={1.2} />
                    </Svg>
                    <Text style={{ fontSize: 14.5, fontFamily: Fonts.SystemRoundedBold, fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#000000', zIndex: 10 }}>
                      cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Pals Group Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
                    }}
                    activeOpacity={0.7}
                    onPress={handleConfirmDeleteGroup}
                  >
                    <BlurView
                      key={`blur_del_pals_btn_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 40 : 30}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="delPalsBtnRim" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FF3B30" stopOpacity={isDark ? 0.6 : 0.8} />
                          <Stop offset="100%" stopColor="#FF3B30" stopOpacity={0.15} />
                        </LinearGradient>
                      </Defs>
                      <Rect x="0.75" y="0.75" width="99%" height="42.5" rx={21.25} fill="none" stroke="url(#delPalsBtnRim)" strokeWidth={1.2} />
                    </Svg>
                    <Text style={{ fontSize: 15, fontFamily: Fonts.SystemRoundedBold, fontWeight: 'bold', color: '#FF3B30', zIndex: 10 }}>
                      delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* LEAVE PALS GROUP DIALOG MODAL (IMAGE 5) */}
        <Modal
          visible={showLeaveGroupDialog}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLeaveGroupDialog(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 20,
            }}
            activeOpacity={1}
            onPress={() => setShowLeaveGroupDialog(false)}
          >
            <TouchableOpacity
              style={{
                width: Math.min(cardWidth * 0.88, 290),
                borderRadius: 24,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.16,
                shadowRadius: 16,
                elevation: 8,
                backgroundColor: 'transparent',
                position: 'relative',
              }}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: isDark ? 'rgba(28, 28, 30, 0.88)' : 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <BlurView
                  key={`blur_leave_pals_${isDark ? 'dark' : 'light'}`}
                  intensity={Platform.OS === 'ios' ? 40 : 30}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <Defs>
                    <LinearGradient id="leavePalsRim" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                      <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                      <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0.75"
                    y="0.75"
                    width="99.2%"
                    height="98.5%"
                    rx={23.25}
                    ry={23.25}
                    fill="none"
                    stroke="url(#leavePalsRim)"
                    strokeWidth={1.2}
                  />
                </Svg>
              </View>

              <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, alignItems: 'center', zIndex: 10 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.SystemRoundedMedium,
                    color: isDark ? '#FFFFFF' : '#000000',
                    textAlign: 'center',
                    lineHeight: 22,
                    marginBottom: 18,
                  }}
                >
                  are you sure you want to leave this pals group?
                </Text>

                <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                  {/* Cancel Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
                    }}
                    activeOpacity={0.7}
                    onPress={() => setShowLeaveGroupDialog(false)}
                  >
                    <BlurView
                      key={`blur_cancel_leave_grp_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 40 : 30}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="cancelLeavePalsRim" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                          <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect x="0.75" y="0.75" width="99%" height="42.5" rx={21.25} fill="none" stroke="url(#cancelLeavePalsRim)" strokeWidth={1.2} />
                    </Svg>
                    <Text style={{ fontSize: 14.5, fontFamily: Fonts.SystemRoundedBold, fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#000000', zIndex: 10 }}>
                      cancel
                    </Text>
                  </TouchableOpacity>

                  {/* Leave Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      height: 44,
                      borderRadius: 22,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
                    }}
                    activeOpacity={0.7}
                    onPress={handleConfirmLeaveGroup}
                  >
                    <BlurView
                      key={`blur_leave_pals_btn_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 40 : 30}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="leavePalsBtnRim" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FF3B30" stopOpacity={isDark ? 0.6 : 0.8} />
                          <Stop offset="100%" stopColor="#FF3B30" stopOpacity={0.15} />
                        </LinearGradient>
                      </Defs>
                      <Rect x="0.75" y="0.75" width="99%" height="42.5" rx={21.25} fill="none" stroke="url(#leavePalsBtnRim)" strokeWidth={1.2} />
                    </Svg>
                    <Text style={{ fontSize: 15, fontFamily: Fonts.SystemRoundedBold, fontWeight: 'bold', color: '#FF3B30', zIndex: 10 }}>
                      leave
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* TRIPLE DOT 3-OPTIONS MENU POPUP MODAL (MATCHING VLOGSHEET) */}
        <Modal
          visible={showOptionsMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              paddingBottom: 302.6,
              paddingRight: 10.0,
            }}
            activeOpacity={1}
            onPress={() => setShowOptionsMenu(false)}
          >
            <View
              style={{
                width: 155,
                borderRadius: 20,
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.12,
                shadowRadius: 14,
                elevation: 6,
                backgroundColor: 'transparent',
                position: 'relative',
              }}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 20,
                  overflow: 'hidden',
                  backgroundColor: isDark ? 'rgba(28, 28, 30, 0.88)' : 'rgba(255, 255, 255, 0.94)',
                }}
              >
                <BlurView
                  key={`blur_grp_opts_${isDark ? 'dark' : 'light'}`}
                  intensity={Platform.OS === 'ios' ? 40 : 30}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <Defs>
                    <LinearGradient id="grpOptsRim" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                      <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                      <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="0.75"
                    y="0.75"
                    width="99%"
                    height="98.5%"
                    rx={19.25}
                    ry={19.25}
                    fill="none"
                    stroke="url(#grpOptsRim)"
                    strokeWidth={1.2}
                  />
                </Svg>
              </View>

              {/* 1. Edit Caption */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingLeft: 18.5,
                  paddingRight: 12,
                  gap: 10,
                  zIndex: 10,
                }}
                activeOpacity={0.7}
                onPress={() => {
                  setShowOptionsMenu(false);
                  setShowEditCaptionBox(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                <Text style={{ fontSize: 16.5, fontFamily: Fonts.SystemRoundedSemibold, color: isDark ? '#FFFFFF' : '#000000' }}>
                  edit caption
                </Text>
              </TouchableOpacity>

              {!!selectedMemberForOptions?.hasCaptured && (
                <>
                  {/* 2. Save */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingLeft: 18.5,
                      paddingRight: 12,
                      gap: 10,
                      zIndex: 10,
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSaveState('saving');
                      setTimeout(() => {
                        setSaveState('saved');
                        setTimeout(() => setSaveState('idle'), 2000);
                      }, 1000);
                    }}
                  >
                    {saveState === 'saving' ? (
                      <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} style={{ width: 20, height: 20 }} />
                    ) : (
                      <Ionicons name={saveState === 'saved' ? "checkmark" : "download-outline"} size={20} color={isDark ? '#FFFFFF' : '#000000'} />
                    )}
                    <Text style={{ fontSize: 16.5, fontFamily: Fonts.SystemRoundedSemibold, color: isDark ? '#FFFFFF' : '#000000' }}>
                      {saveState === 'saved' ? 'saved' : 'save'}
                    </Text>
                  </TouchableOpacity>

                  {/* 3. Delete */}
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingLeft: 18.5,
                      paddingRight: 12,
                      gap: 10,
                      zIndex: 10,
                    }}
                    activeOpacity={0.7}
                    onPress={() => {
                      setShowOptionsMenu(false);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    <Text style={{ fontSize: 16.5, fontFamily: Fonts.SystemRoundedSemibold, color: '#FF3B30' }}>
                      delete
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* PAL GROUP CHAT DRAWER WITH MEME EMOJI BUTTON */}
        <PalGroupChatDrawer
          visible={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          palName={currentGroupName || group?.name || 'pals'}
          selectedThemeColor={selectedThemeColor}
          members={joinedMembers.map(m => m.name)}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  headerLeftCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 25,
  },
  zeroLogsPillBtn: {
    width: 96,
    height: 42,
    borderRadius: 21,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    overflow: 'hidden',
  },
  logsSmileyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logsSmileyImg: {
    width: 27,
    height: 27,
  },
  zeroLogsText: {
    fontSize: 14,
    fontFamily: Fonts.SystemRoundedBold,
    marginLeft: 6,
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
