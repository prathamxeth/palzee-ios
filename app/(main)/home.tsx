import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { DynamicGlowContainer } from '../../components/ui/DynamicGlowContainer';
import { LiquidGlass } from '../../components/ui/LiquidGlassView';
import { CreatePalModal } from '../../components/home/CreatePalModal';
import { ChatDrawer } from '../../components/home/ChatDrawer';
import { EditExportSheet } from '../../components/home/EditExportSheet';
import CameraScreen from './camera';
import PalCameraPreview from '../../components/camera/PalCameraPreview';
import PalGroupGridScreen from './groups';
import { User } from '../../types';

const LucidePlus = ({
  size = 26,
  color = '#FFFFFF',
  strokeWidth = 2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) =>
  Platform.OS === 'ios' ? (
    <SymbolView name="plus" size={size} tintColor={color} />
  ) : (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 5v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

const LucideBell = ({
  size = 25,
  color = '#FFFFFF',
  strokeWidth = 2,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) =>
  Platform.OS === 'ios' ? (
    <SymbolView name="bell" size={size} tintColor={color} />
  ) : (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

const MaterialPersonIcon = ({ size = 25, color = '#FFFFFF' }) =>
  Platform.OS === 'ios' ? (
    <SymbolView name="person" size={size} tintColor={color} />
  ) : (
    <Svg width={size} height={size} viewBox="0 -960 960 960">
      <Path
        d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T225-378q62-31 126-46.5T480-440q64 0 128 15.5T735-378q30 16 47.5 44.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-54 0-109 13.5T260-306q-9 5-14.5 14t-5.5 20v32Z"
        fill={color}
      />
    </Svg>
  );

const LiquidGlassIconButton = ({
  onPress,
  children,
  isDark = true,
  idPrefix = 'btn',
}: {
  onPress: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  idPrefix?: string;
}) => (
  <TouchableOpacity style={styles.circleIconBtn} activeOpacity={0.8} onPress={onPress}>
    <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
    <Svg width={44} height={44} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={`${idPrefix}Grad`} x1="0%" y1="0%" x2="0%" y2="100%">
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
        <LinearGradient id={`${idPrefix}Bdr`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop
            offset="0%"
            stopColor="#FFFFFF"
            stopOpacity={isDark ? 0.35 : 0.95}
          />
          <Stop
            offset="100%"
            stopColor={isDark ? '#FFFFFF' : '#000000'}
            stopOpacity={isDark ? 0.08 : 0.08}
          />
        </LinearGradient>
      </Defs>
      <Rect
        x="0.75"
        y="0.75"
        width="42.5"
        height="42.5"
        rx="21.25"
        fill={`url(#${idPrefix}Grad)`}
        stroke={`url(#${idPrefix}Bdr)`}
        strokeWidth="1.5"
      />
    </Svg>
    {children}
  </TouchableOpacity>
);

const LiquidGlassPillButton = ({
  onPress,
  text,
  isDark = true,
  textColor,
  idPrefix = 'pill',
}: {
  onPress: () => void;
  text: string;
  isDark?: boolean;
  textColor: string;
  idPrefix?: string;
}) => (
  <TouchableOpacity style={styles.actionPillContainer} activeOpacity={0.8} onPress={onPress}>
    <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
    <Svg width={118} height={36} style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id={`${idPrefix}Grad`} x1="0%" y1="0%" x2="0%" y2="100%">
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
        <LinearGradient id={`${idPrefix}Bdr`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop
            offset="0%"
            stopColor="#FFFFFF"
            stopOpacity={isDark ? 0.35 : 0.95}
          />
          <Stop
            offset="100%"
            stopColor={isDark ? '#FFFFFF' : '#000000'}
            stopOpacity={isDark ? 0.08 : 0.08}
          />
        </LinearGradient>
      </Defs>
      <Rect
        x="0.75"
        y="0.75"
        width="116.5"
        height="34.5"
        rx="17.25"
        fill={`url(#${idPrefix}Grad)`}
        stroke={`url(#${idPrefix}Bdr)`}
        strokeWidth="1.5"
      />
    </Svg>
    <Text style={[styles.actionPillText, { color: textColor }]}>{text}</Text>
  </TouchableOpacity>
);

const LiquidGlassNavPillBar = ({
  activeTab,
  onSelectTab,
  isDark = true,
}: {
  activeTab: 'camera' | 'pals';
  onSelectTab: (tab: 'camera' | 'pals') => void;
  isDark?: boolean;
}) => (
  <View style={styles.bottomSwitcherContainer}>
    <View style={styles.liquidOuterCapsule}>
      <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <Svg width={167.5} height={50} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="capsuleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
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
          <LinearGradient id="capsuleBorder" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity={isDark ? 0.28 : 0.95}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#FFFFFF' : '#000000'}
              stopOpacity={isDark ? 0.05 : 0.08}
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="1"
          y="1"
          width="165.5"
          height="48"
          rx="24"
          fill="url(#capsuleGrad)"
          stroke="url(#capsuleBorder)"
          strokeWidth="1.5"
        />
      </Svg>

      <View style={styles.liquidCapsuleRow}>
        {/* CAMERA TAB */}
        <TouchableOpacity
          style={styles.liquidTabButton}
          activeOpacity={0.8}
          onPress={() => onSelectTab('camera')}
        >
          {activeTab === 'camera' && (
            <Svg width={82.25} height={48} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="actGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop
                    offset="0%"
                    stopColor={isDark ? '#4A4A54' : '#FFFFFF'}
                    stopOpacity={isDark ? 0.95 : 0.98}
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? '#24242A' : '#F2EFF4'}
                    stopOpacity={isDark ? 0.95 : 0.92}
                  />
                </LinearGradient>
                <LinearGradient id="actBdr1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop
                    offset="0%"
                    stopColor="#FFFFFF"
                    stopOpacity={isDark ? 0.45 : 1.0}
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? '#FFFFFF' : '#000000'}
                    stopOpacity={isDark ? 0.15 : 0.06}
                  />
                </LinearGradient>
              </Defs>
              <Rect
                x="0.5"
                y="0.5"
                width="81.25"
                height="47"
                rx="23.5"
                fill="url(#actGrad1)"
                stroke="url(#actBdr1)"
                strokeWidth="1"
              />
            </Svg>
          )}
          <Text
            style={[
              activeTab === 'camera'
                ? [styles.activeSegmentText, { color: isDark ? '#FFFFFF' : '#000000' }]
                : [styles.inactiveSegmentText, { color: isDark ? '#8E8E93' : '#666666' }],
            ]}
          >
            camera
          </Text>
        </TouchableOpacity>

        {/* PALS TAB */}
        <TouchableOpacity
          style={styles.liquidTabButton}
          activeOpacity={0.8}
          onPress={() => onSelectTab('pals')}
        >
          {activeTab === 'pals' && (
            <Svg width={82.25} height={48} style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="actGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop
                    offset="0%"
                    stopColor={isDark ? '#4A4A54' : '#FFFFFF'}
                    stopOpacity={isDark ? 0.95 : 0.98}
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? '#24242A' : '#F2EFF4'}
                    stopOpacity={isDark ? 0.95 : 0.92}
                  />
                </LinearGradient>
                <LinearGradient id="actBdr2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop
                    offset="0%"
                    stopColor="#FFFFFF"
                    stopOpacity={isDark ? 0.45 : 1.0}
                  />
                  <Stop
                    offset="100%"
                    stopColor={isDark ? '#FFFFFF' : '#000000'}
                    stopOpacity={isDark ? 0.15 : 0.06}
                  />
                </LinearGradient>
              </Defs>
              <Rect
                x="0.5"
                y="0.5"
                width="81.25"
                height="47"
                rx="23.5"
                fill="url(#actGrad2)"
                stroke="url(#actBdr2)"
                strokeWidth="1"
              />
            </Svg>
          )}
          <Text
            style={[
              activeTab === 'pals'
                ? [styles.activeSegmentText, { color: isDark ? '#FFFFFF' : '#000000' }]
                : [styles.inactiveSegmentText, { color: isDark ? '#8E8E93' : '#666666' }],
            ]}
          >
            pals
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

interface PalRoom {
  id: string;
  name: string;
  maxCount: number;
  code: string;
}

interface HomeScreenProps {
  user: User;
  selectedThemeColor: string;
  onSelectedThemeColorChange: (color: string) => void;
  onSignOut: () => void;
  autoOpenCreateModal?: boolean;
}

export default function HomeScreen({
  user,
  selectedThemeColor,
  onSelectedThemeColorChange,
  onSignOut,
  autoOpenCreateModal = false,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#11D5F3';
  const [showGroupsView, setShowGroupsView] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(autoOpenCreateModal);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [createModalInitialTab, setCreateModalInitialTab] = useState<'create' | 'join'>('create');
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileSubMenu, setProfileSubMenu] = useState<'main' | 'editProfile' | 'color'>('main');
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [editFirstName, setEditFirstName] = useState(() => {
    const name = user?.displayName || 'apple_user';
    return name.includes('_') ? name.split('_')[0] : name.split(' ')[0] || 'apple';
  });
  const [editLastName, setEditLastName] = useState(() => {
    const name = user?.displayName || 'apple_user';
    return name.includes('_') ? name.split('_').slice(1).join(' ') : name.split(' ').slice(1).join(' ') || 'user';
  });
  const [activeTab, setActiveTab] = useState<'camera' | 'pals'>('pals');
  const [userPalRooms, setUserPalRooms] = useState<PalRoom[]>([]);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);

  const handleChoosePhoto = async () => {
    try {
      setShowProfileMenu(false);
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access photos is required to update profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfilePhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting profile photo:', error);
    }
  };

  useEffect(() => {
    if (autoOpenCreateModal) {
      setShowCreateModal(true);
    }
  }, [autoOpenCreateModal]);

  const handleCreateRoom = async (name: string, maxCount: number) => {
    const newRoom: PalRoom = {
      id: Date.now().toString(),
      name,
      maxCount,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    };
    setUserPalRooms((prev) => [...prev, newRoom]);
    setShowCreateModal(false);
  };

  const handleJoinRoom = async (code: string) => {
    const joinedRoom: PalRoom = {
      id: Date.now().toString(),
      name: `Pal ${code}`,
      maxCount: 10,
      code,
    };
    setUserPalRooms((prev) => [...prev, joinedRoom]);
    setShowCreateModal(false);
  };

  const screenBg = isDark ? '#000000' : Colors.PalBackground;
  const iconColor = isDark ? '#FFFFFF' : Colors.PalTextDark;
  const mainTextColor = isDark ? '#FFFFFF' : Colors.PalTextDark;
  const subtextColor = isDark ? '#8E8E93' : Colors.PalTextMuted;
  const cardBg = isDark ? '#161616' : '#FFFFFF';
  const pillBg = isDark ? '#262626' : 'rgba(255, 255, 255, 0.65)';
  const pillBorder = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.85)';
  const logoTextColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] ||
    '#310BED';

  const [cameraTimerMode, setCameraTimerMode] = useState<'off' | '3s' | '5s' | 'timelapse' | 'jump_cut'>('off');
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');

  const toggleTimerMode = () => {
    setCameraTimerMode((current) => {
      if (current === 'off') return '3s';
      if (current === '3s') return '5s';
      if (current === '5s') return 'timelapse';
      if (current === 'timelapse') return 'jump_cut';
      return 'off';
    });
  };

  const toggleFacing = () => {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (showGroupsView) {
    return (
      <PalGroupGridScreen
        groups={[]}
        onSelectGroup={() => setShowGroupsView(false)}
        onOpenCreateModal={() => setShowCreateModal(true)}
        onBackToFeed={() => setShowGroupsView(false)}
      />
    );
  }

  if (showCamera) {
    return <CameraScreen onCapture={() => setShowCamera(false)} onClose={() => setShowCamera(false)} />;
  }

  return (
    <DynamicGlowContainer selectedThemeColor={selectedThemeColor || 'cyan'} showBorder={true}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: screenBg,
            paddingTop: activeTab === 'camera' ? Math.max(insets.top, 8) : Math.max(insets.top, 20) + 8,
            paddingBottom: Math.max(insets.bottom, 8) + 4,
          },
        ]}
      >
        {/* 1. TOP HEADER: PALZEE LOGO & RIGHT CIRCLE ICONS (ONLY SHOWN IN PALS FEED TAB) */}
        {activeTab !== 'camera' && (
          <View style={styles.topHeader}>
            <Text
              style={[
                styles.palzeeLogoText,
                {
                  color: logoTextColor,
                },
              ]}
            >
              PALZEE
            </Text>

            <View style={styles.headerRightIcons}>
              {/* 1. PLUS BUTTON (+ Icon) */}
              <LiquidGlassIconButton idPrefix="btnPlus" isDark={isDark} onPress={() => setShowAddMenu(true)}>
                <LucidePlus size={26} color={iconColor} strokeWidth={1.8} />
              </LiquidGlassIconButton>

              {/* 2. NOTIFICATION BELL ICON */}
              <LiquidGlassIconButton idPrefix="btnBell" isDark={isDark} onPress={() => setShowChatDrawer(true)}>
                <LucideBell size={24} color={iconColor} strokeWidth={1.8} />
              </LiquidGlassIconButton>

              {/* 3. USER PROFILE PERSON ICON OR CHOSEN PFP (FILLS COMPLETELY IN CIRCLE, ZERO SPACING) */}
              <LiquidGlassIconButton idPrefix="btnUser" isDark={isDark} onPress={() => setShowProfileMenu(true)}>
                {profilePhotoUri ? (
                  <Image
                    source={{ uri: profilePhotoUri }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    resizeMode="cover"
                  />
                ) : (
                  <MaterialPersonIcon size={24} color={iconColor} />
                )}
              </LiquidGlassIconButton>
            </View>
          </View>
        )}

        {/* 2. MAIN FEED OR CAMERA PREVIEW SECTION */}
        {activeTab === 'camera' ? (
          <PalCameraPreview
            selectedThemeColor={selectedThemeColor}
            timerMode={cameraTimerMode}
            onToggleTimerMode={toggleTimerMode}
            facing={cameraFacing}
            onToggleFacing={toggleFacing}
          />
        ) : (
          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {userPalRooms.length > 0 ? (
              /* HAS PAL ROOMS: SHOW VIDEO VLOG FEED CARD */
              <View style={styles.vlogFeedSection}>
                {userPalRooms.map((room) => (
                  <TouchableOpacity
                    key={room.id}
                    style={[styles.vlogCard, { backgroundColor: cardBg }]}
                    activeOpacity={0.9}
                    onPress={() => setShowExportSheet(true)}
                  >
                    <View style={styles.vlogTextSection}>
                      <Text style={[styles.vlogTitle, { color: mainTextColor }]}>
                        {room.name.toLowerCase()}
                      </Text>
                      <Text style={[styles.vlogSubtext, { color: subtextColor }]}>
                        your space. Each day runs 4am{'\n'}to 4am. max {room.maxCount} pals.
                      </Text>
                    </View>

                    <Image
                      source={require('../../assets/images/dm_star_2.png')}
                      style={styles.starDoodleImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              /* EMPTY FEED SCREEN */
              <View style={styles.emptyFeedContainer}>
                {/* INSTRUCTION STEPS */}
                <View style={styles.instructionsContainer}>
                  <Text style={[styles.sideBySideHeader, { color: mainTextColor }]}>
                    your day, side by side.
                  </Text>

                  {/* STEP 1 */}
                  <View style={styles.stepRow}>
                    <View
                      style={[
                        styles.stepBadge,
                        { backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepBadgeText,
                          { color: isDark ? '#000000' : '#FFFFFF' },
                        ]}
                      >
                        1
                      </Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: mainTextColor }]}>
                        tap <Text style={styles.plusSymbolText}>⊕</Text> to start
                      </Text>

                      <View style={styles.pillActionRow}>
                        <LiquidGlassPillButton
                          idPrefix="pillCreate"
                          text="create pal"
                          isDark={isDark}
                          textColor={mainTextColor}
                          onPress={() => setShowCreateModal(true)}
                        />
                        <Text style={[styles.actionHintText, { color: mainTextColor }]}>
                          (new group)
                        </Text>
                      </View>

                      <View style={[styles.pillActionRow, { marginTop: 8 }]}>
                        <LiquidGlassPillButton
                          idPrefix="pillJoin"
                          text="join pal"
                          isDark={isDark}
                          textColor={mainTextColor}
                          onPress={() => setShowCreateModal(true)}
                        />
                        <Text style={[styles.actionHintText, { color: mainTextColor }]}>
                          (with a code)
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* STEP 2 */}
                  <View style={[styles.stepRow, { marginTop: 24 }]}>
                    <View
                      style={[
                        styles.stepBadge,
                        { backgroundColor: isDark ? '#FFFFFF' : '#1A1A1A' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepBadgeText,
                          { color: isDark ? '#000000' : '#FFFFFF' },
                        ]}
                      >
                        2
                      </Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepTitle, { color: mainTextColor }]}>
                        add a 2s clip every hour.
                      </Text>
                      <Text style={[styles.stepSubtext, { color: mainTextColor }]}>
                        see everyone's day come together.
                      </Text>
                      <Text style={[styles.stepSubtext, { color: mainTextColor }]}>
                        solo pals don't have limits.
                      </Text>
                    </View>
                  </View>
                </View>

                {/* DAY RESET PAINTED BLOB CONTAINER */}
                <ImageBackground
                  source={
                    isDark
                      ? require('../../assets/images/blob_dark.png')
                      : require('../../assets/images/blob_light.png')
                  }
                  style={styles.blobContainer}
                  resizeMode="contain"
                >
                  <Text style={[styles.resetTitle, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    day resets at{' '}
                    <Text style={{ fontFamily: Fonts.DelaGothicOne, fontSize: 20 }}>4</Text>
                    AM.
                  </Text>
                  <Text style={[styles.resetSubtext, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                    find past days in history.
                  </Text>
                </ImageBackground>

                {/* BOTTOM UFO & TURTLE DOODLE */}
                <View style={styles.doodleFooter}>
                  <Image
                    source={require('../../assets/images/ufo_turtle.png')}
                    style={styles.ufoTurtleImage}
                    resizeMode="contain"
                  />
                  <View style={styles.groundLine} />
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* 3. UNIFIED BOTTOM LIQUID GLASS NAVIGATION BAR */}
        <View style={styles.unifiedBottomRow}>
          {/* LEFT TIMER BUTTON (CAMERA TAB ONLY) */}
          {activeTab === 'camera' ? (
            <LiquidGlassIconButton
              idPrefix="btnCameraTimer"
              isDark={isDark}
              onPress={toggleTimerMode}
            >
              {cameraTimerMode === '3s' ? (
                <Svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: [{ rotate: '90deg' }] }}>
                  <Circle cx="12" cy="12" r="9.5" stroke={iconColor} strokeWidth="1.8" fill="none" />
                  <SvgText
                    x="12"
                    y="15.8"
                    fontSize="11"
                    fontWeight="bold"
                    fill={iconColor}
                    textAnchor="middle"
                    fontFamily={Platform.OS === 'ios' ? 'System' : 'sans-serif'}
                  >
                    3
                  </SvgText>
                </Svg>
              ) : cameraTimerMode === '5s' ? (
                <Svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: [{ rotate: '90deg' }] }}>
                  <Circle cx="12" cy="12" r="9.5" stroke={iconColor} strokeWidth="1.8" fill="none" />
                  <SvgText
                    x="12"
                    y="15.8"
                    fontSize="11"
                    fontWeight="bold"
                    fill={iconColor}
                    textAnchor="middle"
                    fontFamily={Platform.OS === 'ios' ? 'System' : 'sans-serif'}
                  >
                    5
                  </SvgText>
                </Svg>
              ) : cameraTimerMode === 'timelapse' ? (
                <Svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: [{ rotate: '90deg' }] }}>
                  {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
                    const rad = (deg * Math.PI) / 180;
                    const x1 = 12 + 5.5 * Math.cos(rad);
                    const y1 = 12 + 5.5 * Math.sin(rad);
                    const x2 = 12 + 9 * Math.cos(rad);
                    const y2 = 12 + 9 * Math.sin(rad);
                    return (
                      <Path
                        key={i}
                        d={`M${x1},${y1} L${x2},${y2}`}
                        stroke={iconColor}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </Svg>
              ) : cameraTimerMode === 'jump_cut' ? (
                <Ionicons name="cut-outline" size={22} color={iconColor} style={{ transform: [{ rotate: '90deg' }] }} />
              ) : (
                <Image
                  source={require('../../assets/images/custom_timer_icon.png')}
                  style={{ width: 28, height: 28, tintColor: iconColor, transform: [{ rotate: '90deg' }] }}
                  resizeMode="contain"
                />
              )}
            </LiquidGlassIconButton>
          ) : (
            <View style={{ width: 44 }} />
          )}

          {/* CENTER TAB SWITCHER (CAMERA / PALS) */}
          <LiquidGlassNavPillBar
            activeTab={activeTab}
            onSelectTab={(t) => {
              setActiveTab(t);
            }}
            isDark={isDark}
          />

          {/* RIGHT CAMERA ROTATE BUTTON (CAMERA TAB ONLY) */}
          {activeTab === 'camera' ? (
            <LiquidGlassIconButton
              idPrefix="btnCameraFlip"
              isDark={isDark}
              onPress={toggleFacing}
            >
              <Image
                source={require('../../assets/images/custom_flip_icon.png')}
                style={{ width: 30, height: 30, tintColor: iconColor }}
                resizeMode="contain"
              />
            </LiquidGlassIconButton>
          ) : (
            <View style={{ width: 44 }} />
          )}
        </View>

        {/* EXACT LIQUID GLASS ADD DROPDOWN MENU MATCHING ATTACHED REFERENCE IMAGE */}
        <Modal
          visible={showAddMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddMenu(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModalOverlay}
            activeOpacity={1}
            onPress={() => setShowAddMenu(false)}
          >
            <TouchableWithoutFeedback>
              <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                <LiquidGlass
                  style={styles.addDropdownCard}
                  isDark={isDark}
                  accentColor={accentColor}
                  borderRadius={26}
                >
                  {/* ADD MENU ITEMS LIST */}
                  <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                    {/* Option 1: create a log */}
                    <TouchableOpacity
                      style={{ paddingVertical: 8 }}
                      activeOpacity={0.7}
                      onPress={() => {
                        setShowAddMenu(false);
                        setCreateModalInitialTab('create');
                        setShowCreateModal(true);
                      }}
                    >
                      <Text style={[styles.addMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        create a log
                      </Text>
                    </TouchableOpacity>

                    {/* Option 2: join a log */}
                    <TouchableOpacity
                      style={{ paddingVertical: 8 }}
                      activeOpacity={0.7}
                      onPress={() => {
                        setShowAddMenu(false);
                        setCreateModalInitialTab('join');
                        setShowCreateModal(true);
                      }}
                    >
                      <Text style={[styles.addMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        join a log
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LiquidGlass>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

        {/* EXACT LIQUID GLASS PROFILE DROPDOWN MENU MATCHING REFERENCE IMAGES */}
        <Modal
          visible={showProfileMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModalOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileMenu(false)}
          >
            <TouchableWithoutFeedback>
              <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
                <View
                  style={[
                    styles.profileDropdownCard,
                    {
                      backgroundColor: isDark ? 'rgba(24, 18, 42, 0.90)' : 'rgba(250, 244, 252, 0.93)',
                      shadowColor: isDark ? accentColor : '#000000',
                    },
                  ]}
                >
                {/* INNER DIAGONAL GLOW FILL: CREATES NATURAL GLOWING EDGE (TOP-RIGHT) & DIMMED GLOW (BOTTOM-LEFT) */}
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                  <Defs>
                    <LinearGradient
                      id="dropdownDiagonalGlow"
                      x1="100%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor={accentColor} stopOpacity={1.0} />
                      <Stop offset="45%" stopColor={accentColor} stopOpacity={isDark ? 0.70 : 0.85} />
                      <Stop offset="100%" stopColor={accentColor} stopOpacity={isDark ? 0.28 : 0.45} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#dropdownDiagonalGlow)" />
                </Svg>

                <BlurView
                  intensity={Platform.OS === 'ios' ? 70 : 95}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />

                {/* SOFT GLASS SPECULAR EDGE HIGHLIGHT (NO HARSH BRIGHT BOUNDARY STROKE) */}
                <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <Defs>
                    <LinearGradient
                      id="cardBorderGradient"
                      x1="100%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <Stop offset="0%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.35 : 0.40} />
                      <Stop offset="50%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.15 : 0.20} />
                      <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#FFFFFF'} stopOpacity={isDark ? 0.05 : 0.08} />
                    </LinearGradient>
                  </Defs>
                  <Rect
                    x="1"
                    y="1"
                    width="99.1%"
                    height="99.1%"
                    rx="23"
                    ry="23"
                    fill="none"
                    stroke="url(#cardBorderGradient)"
                    strokeWidth="0.8"
                  />
                </Svg>

                {/* BASE CARD HEADER: UPRIGHT SMILEY AVATAR OR CHOSEN PFP + USERNAME (DIMMED FOR EDIT PROFILE, HIDDEN FOR COLOR) */}
                <View
                  style={[
                    styles.dropdownHeaderRow,
                    {
                      opacity: profileSubMenu === 'color' ? 0.0 : profileSubMenu === 'editProfile' ? 0.40 : 1.0,
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: accentColor,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 12,
                      overflow: 'hidden',
                    }}
                  >
                    {profilePhotoUri ? (
                      <Image
                        source={{ uri: profilePhotoUri }}
                        style={{ width: 31.6, height: 31.6, borderRadius: 15.8 }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require('../../assets/images/capture_smile.png')}
                        style={{ width: 31.8, height: 31.8 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>

                  <Text style={[styles.dropdownUsernameText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    {user?.authProvider === 'apple' || user?.displayName === 'apple_user'
                      ? 'apple_user'
                      : user?.displayName || 'apple_user'}
                  </Text>
                </View>

                {/* MAIN MENU OPTIONS (DIMMED FOR EDIT PROFILE, HIDDEN FOR COLOR) */}
                <View
                  style={[
                    styles.dropdownMenuList,
                    {
                      opacity: profileSubMenu === 'color' ? 0.0 : profileSubMenu === 'editProfile' ? 0.40 : 1.0,
                    },
                  ]}
                >
                  {/* Option 1: edit profile */}
                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    activeOpacity={0.7}
                    onPress={() => setProfileSubMenu('editProfile')}
                  >
                    <View style={styles.dropdownMenuLeft}>
                      <Ionicons name="person-outline" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        edit profile
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'} />
                  </TouchableOpacity>

                  {/* Option 2: log notifications */}
                  <TouchableOpacity
                    style={styles.dropdownMenuItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      setShowProfileMenu(false);
                      setShowChatDrawer(true);
                    }}
                  >
                    <View style={styles.dropdownMenuLeft}>
                      <Ionicons name="notifications-outline" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        log notifications
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'} />
                  </TouchableOpacity>

                  {/* Option 3: account */}
                  <TouchableOpacity style={styles.dropdownMenuItem} activeOpacity={0.7} onPress={() => setShowProfileMenu(false)}>
                    <View style={styles.dropdownMenuLeft}>
                      <Ionicons name="person-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        account
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'} />
                  </TouchableOpacity>

                  {/* Option 4: feedback */}
                  <TouchableOpacity style={styles.dropdownMenuItem} activeOpacity={0.7} onPress={() => setShowProfileMenu(false)}>
                    <View style={styles.dropdownMenuLeft}>
                      <Ionicons name="add-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        feedback
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Option 5: guide */}
                  <TouchableOpacity style={styles.dropdownMenuItem} activeOpacity={0.7} onPress={() => setShowProfileMenu(false)}>
                    <View style={styles.dropdownMenuLeft}>
                      <Ionicons name="help-circle-outline" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                        guide
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* OVERLAPPING SUB-DROPDOWN CARD ("DROPDOWN IN DROPDOWN") */}
              {(profileSubMenu === 'editProfile' || profileSubMenu === 'color') && (
                <View
                  style={[
                    styles.profileSubDropdownCard,
                    {
                      backgroundColor: isDark ? 'rgba(24, 18, 42, 0.95)' : 'rgba(250, 244, 252, 0.96)',
                      shadowColor: isDark ? accentColor : '#000000',
                    },
                  ]}
                >
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                    <Defs>
                      <LinearGradient id="subDropdownDiagonalGlow" x1="100%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={accentColor} stopOpacity={1.0} />
                        <Stop offset="45%" stopColor={accentColor} stopOpacity={isDark ? 0.70 : 0.85} />
                        <Stop offset="100%" stopColor={accentColor} stopOpacity={isDark ? 0.28 : 0.45} />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#subDropdownDiagonalGlow)" />
                  </Svg>

                  <BlurView intensity={Platform.OS === 'ios' ? 75 : 95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                  {/* SOFT SPECULAR HIGHLIGHT (NO HARD BRIGHT BORDER STROKE) */}
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <Defs>
                      <LinearGradient id="subCardBorderGradient" x1="100%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.35 : 0.40} />
                        <Stop offset="50%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.15 : 0.20} />
                        <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#FFFFFF'} stopOpacity={isDark ? 0.05 : 0.08} />
                      </LinearGradient>
                    </Defs>
                    <Rect x="1" y="1" width="99.1%" height="99.1%" rx="23" ry="23" fill="none" stroke="url(#subCardBorderGradient)" strokeWidth="0.8" />
                  </Svg>

                  {/* Sub-Card Header Row: edit profile + down chevron v (DIMMED WHEN COLOR MENU IS ACTIVE) */}
                  <TouchableOpacity
                    style={[styles.dropdownHeaderRow, { opacity: profileSubMenu === 'color' ? 0.35 : 1.0 }]}
                    activeOpacity={0.7}
                    onPress={() => setProfileSubMenu('main')}
                  >
                    <View style={styles.dropdownMenuLeft}>
                      <Ionicons name="person-outline" size={20} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                      <Text style={[styles.dropdownUsernameText, { color: isDark ? '#FFFFFF' : '#1C1C1E', marginLeft: 10 }]}>
                        edit profile
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={17} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  </TouchableOpacity>

                  {/* Hairline Separator Line */}
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
                      marginHorizontal: 16,
                      marginTop: 4,
                      marginBottom: 12,
                      opacity: profileSubMenu === 'color' ? 0.35 : 1.0,
                    }}
                  />

                  {/* Edit Profile Sub-Menu Items List (DIMMED WHEN COLOR MENU IS ACTIVE) */}
                  <View style={[styles.dropdownMenuList, { paddingTop: 4, paddingBottom: 16, opacity: profileSubMenu === 'color' ? 0.35 : 1.0 }]}>
                    {/* Sub-Option 1: display name */}
                    <TouchableOpacity
                      style={styles.dropdownMenuItem}
                      activeOpacity={0.7}
                      onPress={() => {
                        const currentName = user?.displayName || 'apple_user';
                        if (currentName.includes('_')) {
                          const parts = currentName.split('_');
                          setEditFirstName(parts[0] || 'apple');
                          setEditLastName(parts.slice(1).join('_') || 'user');
                        } else if (currentName.includes(' ')) {
                          const parts = currentName.split(' ');
                          setEditFirstName(parts[0] || 'apple');
                          setEditLastName(parts.slice(1).join(' ') || 'user');
                        } else {
                          setEditFirstName(currentName);
                          setEditLastName('');
                        }
                        setShowProfileMenu(false);
                        setShowEditNameModal(true);
                      }}
                    >
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E', marginLeft: 4 }]}>
                        display name
                      </Text>
                    </TouchableOpacity>

                    {/* Sub-Option 2: choose photo */}
                    <TouchableOpacity style={styles.dropdownMenuItem} activeOpacity={0.7} onPress={handleChoosePhoto}>
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E', marginLeft: 4 }]}>
                        choose photo
                      </Text>
                    </TouchableOpacity>

                    {/* Sub-Option 3: color -> opens color palette dropdown */}
                    <TouchableOpacity
                      style={styles.dropdownMenuItem}
                      activeOpacity={0.7}
                      onPress={() => setProfileSubMenu('color')}
                    >
                      <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E', marginLeft: 4 }]}>
                        color
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)'} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* 3RD LEVEL OVERLAPPING COLOR PALETTE SUB-DROPDOWN CARD (EXACTLY MATCHING ATTACHED SCREENSHOT) */}
              {profileSubMenu === 'color' && (
                <View
                  style={[
                    styles.profileColorDropdownCard,
                    {
                      backgroundColor: isDark ? 'rgba(24, 18, 42, 0.96)' : 'rgba(250, 244, 252, 0.97)',
                      shadowColor: isDark ? accentColor : '#000000',
                    },
                  ]}
                >
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                    <Defs>
                      <LinearGradient id="colorSubDiagonalGlow" x1="100%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={accentColor} stopOpacity={1.0} />
                        <Stop offset="45%" stopColor={accentColor} stopOpacity={isDark ? 0.70 : 0.85} />
                        <Stop offset="100%" stopColor={accentColor} stopOpacity={isDark ? 0.28 : 0.45} />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#colorSubDiagonalGlow)" />
                  </Svg>

                  <BlurView intensity={Platform.OS === 'ios' ? 75 : 95} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <Defs>
                      <LinearGradient id="colorSubCardBorder" x1="100%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.35 : 0.40} />
                        <Stop offset="50%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.15 : 0.20} />
                        <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#FFFFFF'} stopOpacity={isDark ? 0.05 : 0.08} />
                      </LinearGradient>
                    </Defs>
                    <Rect x="1" y="1" width="99.1%" height="99.1%" rx="23" ry="23" fill="none" stroke="url(#colorSubCardBorder)" strokeWidth="0.8" />
                  </Svg>

                  {/* Header Row: color title + down chevron v */}
                  <TouchableOpacity
                    style={styles.dropdownHeaderRow}
                    activeOpacity={0.7}
                    onPress={() => setProfileSubMenu('editProfile')}
                  >
                    <View style={styles.dropdownMenuLeft}>
                      <Text style={[styles.dropdownUsernameText, { color: isDark ? '#FFFFFF' : '#1C1C1E', marginLeft: 4 }]}>
                        color
                      </Text>
                    </View>
                    <Ionicons name="chevron-down" size={17} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                  </TouchableOpacity>

                  {/* Hairline Separator Line */}
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.12)',
                      marginHorizontal: 16,
                      marginTop: 4,
                      marginBottom: 10,
                    }}
                  />

                  {/* 6 Color Palette Options List (Exact colors from reference screenshot) */}
                  <View style={[styles.dropdownMenuList, { paddingTop: 2, paddingBottom: 14 }]}>
                    {[
                      { key: 'blue', name: 'blue', hex: Colors.BorderGlow.blue },
                      { key: 'orange', name: 'orange', hex: Colors.BorderGlow.orange },
                      { key: 'purple', name: 'purple', hex: Colors.BorderGlow.purple },
                      { key: 'green', name: 'green', hex: Colors.BorderGlow.green },
                      { key: 'cyan', name: 'ocean', hex: Colors.BorderGlow.cyan },
                      { key: 'pink', name: 'pink', hex: Colors.BorderGlow.pink },
                    ].map((opt) => {
                      const isSelected = selectedThemeColor === opt.key;
                      return (
                        <TouchableOpacity
                          key={opt.key}
                          style={styles.dropdownMenuItem}
                          activeOpacity={0.7}
                          onPress={() => onSelectedThemeColorChange(opt.key)}
                        >
                          <View style={styles.dropdownMenuLeft}>
                            {/* Checkmark Indicator Column */}
                            <View style={{ width: 20, alignItems: 'center', justifyContent: 'center' }}>
                              {isSelected && (
                                <Ionicons name="checkmark" size={16} color={isDark ? '#FFFFFF' : '#1C1C1E'} />
                              )}
                            </View>

                            {/* Color Dot Swatch Circle */}
                            <View
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: opt.hex,
                                marginRight: 14,
                                marginLeft: 4,
                              }}
                            />

                            {/* Color Name */}
                            <Text style={[styles.dropdownMenuText, { color: isDark ? '#FFFFFF' : '#1C1C1E', marginLeft: 0 }]}>
                              {opt.name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

        {/* EXACT EDIT NAME MODAL MATCHING ATTACHED SCREENSHOT */}
        <Modal
          visible={showEditNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditNameModal(false)}
        >
          <TouchableOpacity
            style={styles.dropdownModalOverlay}
            activeOpacity={1}
            onPress={() => setShowEditNameModal(false)}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                  style={{
                    width: '86%',
                    maxWidth: 340,
                    borderRadius: 28,
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    padding: 22,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: isDark ? 0.35 : 0.15,
                    shadowRadius: 20,
                    elevation: 16,
                    borderWidth: 0,
                    overflow: 'hidden',
                  }}
                >

                  {/* Header Title */}
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: isDark ? '#FFFFFF' : '#1C1C1E',
                      marginBottom: 4,
                      letterSpacing: -0.2,
                      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                    }}
                  >
                    edit name
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '400',
                      color: isDark ? 'rgba(255, 255, 255, 0.60)' : 'rgba(0, 0, 0, 0.55)',
                      marginBottom: 16,
                      letterSpacing: -0.1,
                      fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                    }}
                  >
                    enter your name
                  </Text>

                  {/* Input Box Container */}
                  <View
                    style={{
                      borderRadius: 20,
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      marginBottom: 18,
                    }}
                  >
                    <TextInput
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: isDark ? '#FFFFFF' : '#1C1C1E',
                        paddingVertical: 7,
                        letterSpacing: -0.1,
                        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                      }}
                      value={editFirstName}
                      onChangeText={setEditFirstName}
                      placeholder="First name"
                      placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'}
                      autoFocus
                      autoCorrect={false}
                    />

                    <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)', marginVertical: 4 }} />

                    <TextInput
                      style={{
                        fontSize: 15,
                        fontWeight: '500',
                        color: isDark ? '#FFFFFF' : '#1C1C1E',
                        paddingVertical: 7,
                        letterSpacing: -0.1,
                        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                      }}
                      value={editLastName}
                      onChangeText={setEditLastName}
                      placeholder="Last"
                      placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.35)'}
                      autoCorrect={false}
                    />
                  </View>

                  {/* Action Buttons Row */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      onPress={() => setShowEditNameModal(false)}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: isDark ? '#FFFFFF' : '#1C1C1E',
                          letterSpacing: -0.1,
                          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                        }}
                      >
                        cancel
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 23,
                        backgroundColor: accentColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      activeOpacity={0.8}
                      onPress={() => {
                        const updatedDisplayName = editLastName.trim()
                          ? `${editFirstName.trim()} ${editLastName.trim()}`
                          : editFirstName.trim();
                        if (user) {
                          user.displayName = updatedDisplayName;
                        }
                        setShowEditNameModal(false);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: '600',
                          color: '#FFFFFF',
                          letterSpacing: -0.1,
                          fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
                        }}
                      >
                        save
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </TouchableOpacity>
        </Modal>

        {/* OVERLAY MODALS */}
        <CreatePalModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
          onJoin={handleJoinRoom}
          themeColor={selectedThemeColor}
          initialTab={createModalInitialTab}
        />

        <ChatDrawer
          visible={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          palCode="palzee_space"
          user={user}
          isDark={isDark}
          selectedThemeColor={selectedThemeColor}
        />

        <EditExportSheet
          visible={showExportSheet}
          onClose={() => setShowExportSheet(false)}
        />
      </View>
    </DynamicGlowContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  palzeeLogoText: {
    fontFamily: Fonts.Unpack,
    fontSize: 47,
    fontWeight: 'bold',
    color: '#4FFFB0',
    letterSpacing: 1.5,
    marginLeft: 5,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleIconBtnWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  circleIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  plusIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '400',
    marginTop: -2,
  },
  scrollBody: {
    flex: 1,
  },
  vlogFeedSection: {
    gap: 16,
    paddingVertical: 10,
  },
  vlogCard: {
    backgroundColor: '#161616',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vlogTextSection: {
    flex: 1,
    paddingRight: 10,
  },
  vlogTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  vlogSubtext: {
    color: '#8E8E93',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 15,
    lineHeight: 22,
  },
  starDoodleImage: {
    width: 60,
    height: 60,
  },
  /* EMPTY FEED STYLES */
  emptyFeedContainer: {
    alignItems: 'center',
    paddingTop: 51,
    paddingBottom: 20,
  },
  instructionsContainer: {
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  sideBySideHeader: {
    fontFamily: Fonts.Ownglyph,
    color: '#FFFFFF',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 29,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 5,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  plusSymbolText: {
    fontSize: 18,
  },
  pillActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionPillContainer: {
    width: 118,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actionPillText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  actionHintText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  stepSubtext: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 2,
  },
  blobContainer: {
    width: '100%',
    height: 86,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetTitle: {
    fontFamily: Fonts.Ownglyph,
    color: '#FFFFFF',
    fontSize: 20,
  },
  resetSubtext: {
    fontFamily: Fonts.Ownglyph,
    color: '#FFFFFF',
    fontSize: 19,
    marginTop: 2,
  },
  doodleFooter: {
    width: '100%',
    alignItems: 'center',
    marginTop: 6,
  },
  ufoTurtleImage: {
    width: '100%',
    height: 90,
    opacity: 0.65,
  },
  groundLine: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#2C2C2E',
    marginTop: -6,
  },
  /* 3. BOTTOM LIQUID GLASS TAB SWITCHER */
  unifiedBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 0,
    marginTop: 10,
    marginBottom: -10,
  },
  extControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSwitcherContainer: {
    alignItems: 'center',
  },
  liquidOuterCapsule: {
    width: 167.5,
    height: 50,
    position: 'relative',
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  liquidCapsuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 1,
    height: 50,
  },
  liquidTabButton: {
    width: 82.25,
    height: 48,
    borderRadius: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveSegmentText: {
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    fontWeight: '400',
  },
  activeSegmentText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  profileNameText: {
    color: '#FFFFFF',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmailText: {
    color: '#8E8E93',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 14,
    marginBottom: 16,
  },
  themeSectionLabel: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  themeGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 24,
  },
  profileThemeSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeProfileThemeSwatch: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  themeSelectBtn: {
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuBtnText: {
    color: '#FFFFFF',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 16,
    fontWeight: '500',
  },
  signOutBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  signOutBtnText: {
    color: '#FFFFFF',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 16,
    fontWeight: '600',
  },
  themeCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  themeModalTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  themeSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThemeSwatch: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.1 }],
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  profileDropdownCard: {
    position: 'absolute',
    top: 60,
    right: 13,
    width: 246.75,
    borderRadius: 24,
    borderWidth: 0,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarSmileyImage: {
    width: 22,
    height: 22,
    transform: [{ rotate: '90deg' }],
  },
  dropdownUsernameText: {
    fontSize: 19.0,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  dropdownMenuList: {
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9.0,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  dropdownMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownMenuText: {
    fontSize: 18.0,
    fontWeight: '400',
    marginLeft: 13,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  profileSubDropdownCard: {
    position: 'absolute',
    top: 104,
    right: 10,
    width: 253,
    borderRadius: 24,
    borderWidth: 0,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  profileColorDropdownCard: {
    position: 'absolute',
    top: 236,
    right: 7,
    width: 259.5,
    borderRadius: 24,
    borderWidth: 0,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 14,
  },
  addDropdownCard: {
    position: 'absolute',
    top: 60,
    left: 46.5,
    width: 215,
    borderRadius: 26,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 10,
  },
  addMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  addMenuText: {
    fontSize: 18.0,
    fontWeight: '400',
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
