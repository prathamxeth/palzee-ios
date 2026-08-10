import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { DynamicGlowContainer } from '../../components/ui/DynamicGlowContainer';
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
  const [showGroupsView, setShowGroupsView] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(autoOpenCreateModal);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showExportSheet, setShowExportSheet] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'pals'>('pals');
  const [userPalRooms, setUserPalRooms] = useState<PalRoom[]>([]);

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

  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
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
              <LiquidGlassIconButton idPrefix="btnPlus" isDark={isDark} onPress={() => setShowCreateModal(true)}>
                <LucidePlus size={26} color={iconColor} strokeWidth={1.8} />
              </LiquidGlassIconButton>

              {/* 2. NOTIFICATION BELL ICON */}
              <LiquidGlassIconButton idPrefix="btnBell" isDark={isDark} onPress={() => setShowChatDrawer(true)}>
                <LucideBell size={24} color={iconColor} strokeWidth={1.8} />
              </LiquidGlassIconButton>

              {/* 3. USER PROFILE PERSON ICON */}
              <LiquidGlassIconButton idPrefix="btnUser" isDark={isDark} onPress={() => setShowProfileMenu(true)}>
                <MaterialPersonIcon size={24} color={iconColor} />
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
                <Svg width={30} height={30} viewBox="0 0 24 24">
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
                <Svg width={30} height={30} viewBox="0 0 24 24">
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
                <Svg width={30} height={30} viewBox="0 0 24 24">
                  <Circle cx="12" cy="12" r="9.5" stroke={iconColor} strokeWidth="1.8" strokeDasharray="2, 2" fill="none" />
                </Svg>
              ) : cameraTimerMode === 'jump_cut' ? (
                <Ionicons name="cut-outline" size={22} color={iconColor} />
              ) : (
                <Image
                  source={require('../../assets/images/custom_timer_icon.png')}
                  style={{ width: 28, height: 28, tintColor: iconColor }}
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

        {/* PROFILE / SIGN OUT MENU MODAL */}
        <Modal
          visible={showProfileMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProfileMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowProfileMenu(false)}
          >
            <View
              style={[
                styles.profileCard,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              <Text style={[styles.profileNameText, { color: isDark ? '#FFFFFF' : '#1A1A1A' }]}>
                {user.displayName}
              </Text>
              <Text style={[styles.profileEmailText, { color: isDark ? '#8E8E93' : '#666666' }]}>
                {user.email}
              </Text>

              {/* BORDER GLOW THEME COLOR SELECTOR */}
              <Text
                style={[
                  styles.themeSectionLabel,
                  { color: isDark ? '#8E8E93' : '#666666' },
                ]}
              >
                theme accent
              </Text>

              <View style={styles.themeGridRow}>
                {Object.keys(Colors.BorderGlow).map((colorKey) => {
                  const isSelected = selectedThemeColor === colorKey;
                  const swatchColor =
                    Colors.BorderGlow[colorKey as keyof typeof Colors.BorderGlow];
                  return (
                    <TouchableOpacity
                      key={colorKey}
                      activeOpacity={0.8}
                      style={[
                        styles.profileThemeSwatch,
                        { backgroundColor: swatchColor },
                        isSelected && styles.activeProfileThemeSwatch,
                      ]}
                      onPress={() => onSelectedThemeColorChange(colorKey)}
                    />
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={() => {
                  setShowProfileMenu(false);
                  onSignOut();
                }}
              >
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* OVERLAY MODALS */}
        <CreatePalModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
          onJoin={handleJoinRoom}
          themeColor={selectedThemeColor}
        />

        <ChatDrawer
          visible={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          palCode="palzee_space"
          user={user}
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
    paddingTop: 2,
    paddingBottom: 4,
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
});
