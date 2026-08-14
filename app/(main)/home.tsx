import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  AppState,
  DeviceEventEmitter,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { getNearestHourText, generateVideoThumbnail } from '../../utils/mediaUtils';
import { DynamicGlowContainer } from '../../components/ui/DynamicGlowContainer';
import { LiquidGlass } from '../../components/ui/LiquidGlassView';
import { CreatePalModal } from '../../components/home/CreatePalModal';
import { ChatDrawer } from '../../components/home/ChatDrawer';
import { ActivityDrawer } from '../../components/home/ActivityDrawer';
import { VlogSheet } from '../../components/home/VlogSheet';
import { Video, ResizeMode } from 'expo-av';
import { CRTStaticCard } from '../../components/home/CRTStaticCard';
import { LiquidGlassIconButton } from '../../components/ui/LiquidGlassIconButton';
import CameraScreen from './camera';
import PalCameraPreview from '../../components/camera/PalCameraPreview';
import { CameraPrewarmer } from '../../components/camera/CameraPrewarmer';
import PalGroupGridScreen from './groups';
import { User } from '../../types';

const LucidePlus = ({
  size = 26,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => <SymbolView name="plus" size={size} tintColor={color} />;

const LucideBell = ({
  size = 25,
  color = '#FFFFFF',
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) => <SymbolView name="bell" size={size} tintColor={color} />;

const MaterialPersonIcon = ({ size = 25, color = '#FFFFFF' }) => (
  <SymbolView name="person" size={size} tintColor={color} />
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
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
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

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenWidth = windowWidth > 0 ? windowWidth : 390;
  const screenHeight = windowHeight > 0 ? windowHeight : 844;

  const [cameraTimerMode, setCameraTimerMode] = useState<'off' | '3s' | '5s' | 'timelapse' | 'jump_cut'>('off');
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');

  const tabTransitionAnim = useRef(new Animated.Value(activeTab === 'camera' ? 0 : 1)).current;

  // DEVICE TILT / ORIENTATION SENSOR: SLIGHT TILT OPENS CAMERA, UPRIGHT SWITCHES TO PALS
  useEffect(() => {
    const isTilted = insets.left > 0 || insets.right > 0 || windowWidth > windowHeight;
    if (isTilted) {
      setActiveTab((prev) => (prev !== 'camera' ? 'camera' : prev));
    } else {
      setActiveTab((prev) => (prev !== 'pals' ? 'pals' : prev));
    }

    const handleOrientation = (orientation: string) => {
      const o = (orientation || '').toUpperCase();
      if (o.includes('LANDSCAPE')) {
        setActiveTab((prev) => (prev !== 'camera' ? 'camera' : prev));
      } else if (o.includes('PORTRAIT')) {
        setActiveTab((prev) => (prev !== 'pals' ? 'pals' : prev));
      }
    };

    const handleDimensions = (data: any) => {
      const win = data?.window || data;
      const scr = data?.screen;
      const w = win?.width || scr?.width || 0;
      const h = win?.height || scr?.height || 0;
      if (w > 0 && h > 0) {
        if (w > h) {
          setActiveTab((prev) => (prev !== 'camera' ? 'camera' : prev));
        } else {
          setActiveTab((prev) => (prev !== 'pals' ? 'pals' : prev));
        }
      }
    };

    const sub1 = Dimensions.addEventListener('change', handleDimensions);
    const sub2 = DeviceEventEmitter.addListener('namedOrientationDidChange', (data) => {
      if (data && data.orientation) handleOrientation(data.orientation);
    });
    const sub3 = DeviceEventEmitter.addListener('orientationDidChange', (data) => {
      if (typeof data === 'string') handleOrientation(data);
      else if (data && data.orientation) handleOrientation(data.orientation);
    });

    return () => {
      sub1?.remove();
      sub2?.remove();
      sub3?.remove();
    };
  }, [insets.left, insets.right, windowWidth, windowHeight]);

  useEffect(() => {
    Animated.timing(tabTransitionAnim, {
      toValue: activeTab === 'camera' ? 0 : 1,
      duration: 340,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
      useNativeDriver: true,
    }).start();
  }, [activeTab]);

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

  const [vlogList, setVlogList] = useState<
    Array<{
      id: string;
      uri: string;
      thumbnailUri?: string;
      needsRotation?: boolean;
      caption?: string;
      timestamp: string;
      displayTime?: string;
      isMuted?: boolean;
      rate?: number;
      mode?: string;
    }>
  >([]);

  useEffect(() => {
    AsyncStorage.getItem('@palzee_vlog_list').then((cached) => {
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVlogList(parsed);
          }
        } catch (e) {}
      }
    });
  }, []);
  const [homeVlogIndex, setHomeVlogIndex] = useState(0);
  const [homeVlogProgress, setHomeVlogProgress] = useState(0);
  const homeProgressAnim = useRef(new Animated.Value(0)).current;
  const [isHomeVlogVertical, setIsHomeVlogVertical] = useState(true);

  useEffect(() => {
    Animated.timing(homeProgressAnim, {
      toValue: homeVlogProgress,
      duration: 60,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [homeVlogProgress]);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    rotateAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2333,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    );
    loop.start();
  }, []);

  const handleVideoSent = async (uri: string, caption?: string, isMuted?: boolean, rate?: number, mode?: string) => {
    console.log('🎥 [handleVideoSent] Processing video:', uri);

    let permanentUri = uri;
    let thumbnailUri = '';

    try {
      // 1. Copy video to permanent Documents directory
      const fileName = `vlog_${Date.now()}.mov`;
      const destPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: destPath });
      permanentUri = destPath;
      console.log('💾 Permanent Video Saved:', permanentUri);

      // 2. Extract thumbnail using the newly installed package
      const thumbResult = await VideoThumbnails.getThumbnailAsync(permanentUri, {
        time: 100,
        quality: 0.85,
      });

      if (thumbResult?.uri) {
        thumbnailUri = thumbResult.uri;
        console.log('✅ THUMBNAIL CREATED:', thumbnailUri);
      }
    } catch (err) {
      console.error('Thumbnail generation error:', err);
    }

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;

    const isPortrait = mode === 'portrait' || mode === 'vertical' || mode === 'off';

    // 3. Payload with guaranteed thumbnailUri
    const newLog = {
      id: Date.now().toString(),
      uri: permanentUri,
      thumbnailUri: thumbnailUri || '',
      needsRotation: isPortrait,
      caption: caption || '',
      timestamp: now.toISOString(),
      displayTime: formattedTime,
      isMuted: isMuted ?? false,
      rate: rate || 1.0,
      mode: mode || 'off',
    };

    console.log('📦 Vlog State Saved:', newLog);

    setVlogList((prev) => {
      const updated = [newLog, ...prev];
      AsyncStorage.setItem('@palzee_vlog_list', JSON.stringify(updated));
      return updated;
    });
    setHomeVlogIndex(0);
    setHomeVlogProgress(0);
    setShowCamera(false);
    setShowExportSheet(false);
    setShowChatDrawer(false);
    setActiveTab('pals');
  };

  const handleDeleteVideo = (targetId?: string) => {
    if (targetId) {
      setVlogList((prev) => prev.filter((item) => item.id !== targetId));
    } else {
      setVlogList([]);
    }
    setHomeVlogIndex(0);
    setHomeVlogProgress(0);
    setShowExportSheet(false);
  };

  const handleUpdateCaption = (newCaption: string, targetId?: string) => {
    setVlogList((prev) =>
      prev.map((item, idx) =>
        (targetId ? item.id === targetId : idx === homeVlogIndex)
          ? { ...item, caption: newCaption }
          : item
      )
    );
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
    return (
      <CameraScreen
        selectedThemeColor={selectedThemeColor}
        onCapture={(uri, caption, isMuted) => handleVideoSent(uri, caption, isMuted)}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <DynamicGlowContainer selectedThemeColor={selectedThemeColor || 'cyan'} showBorder={true}>
      <CameraPrewarmer />
      <View
        style={[
          styles.container,
          {
            backgroundColor: screenBg,
            paddingTop: activeTab === 'camera' ? Math.max(insets.top, 8) : insets.top,
            paddingBottom: 0,
          },
        ]}
      >
        {/* 1. PERSISTENT LIVE CAMERA PREVIEW LAYER (ALWAYS MOUNTED & READY) */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              paddingTop: Math.max(insets.top, 8),
              paddingBottom: Math.max(insets.bottom, 8) + 60,
              opacity: tabTransitionAnim.interpolate({
                inputRange: [0, 0.8, 1],
                outputRange: [1, 0.2, 0],
              }),
              transform: [
                {
                  scale: tabTransitionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.94],
                  }),
                },
              ],
            },
          ]}
          pointerEvents={activeTab === 'camera' ? 'auto' : 'none'}
        >
          <PalCameraPreview
            selectedThemeColor={selectedThemeColor}
            timerMode={cameraTimerMode}
            onToggleTimerMode={toggleTimerMode}
            facing={cameraFacing}
            onToggleFacing={toggleFacing}
            autoTickVlog={false}
            onCaptureSuccess={(uri, caption, isMuted) => handleVideoSent(uri, caption, isMuted)}
          />
        </Animated.View>

        {/* 2. PALS MENU / FEED SLIDING OVERLAY LAYER */}
        <Animated.View
          style={{
            flex: 1,
            opacity: tabTransitionAnim.interpolate({
              inputRange: [0, 0.25, 1],
              outputRange: [0, 0.5, 1],
            }),
            transform: [
              {
                translateX: tabTransitionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [screenWidth, 0],
                }),
              },
            ],
          }}
          pointerEvents={activeTab === 'pals' ? 'auto' : 'none'}
        >
          {/* TOP HEADER: PALZEE LOGO & RIGHT CIRCLE ICONS */}
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
              <LiquidGlassIconButton idPrefix="btnBell" isDark={isDark} onPress={() => setShowActivityDrawer(true)}>
                <LucideBell size={24} color={iconColor} strokeWidth={1.8} />
              </LiquidGlassIconButton>

              {/* 3. USER PROFILE PERSON ICON OR CHOSEN PFP */}
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

          <ScrollView style={StyleSheet.absoluteFill} contentContainerStyle={{ paddingTop: 60, paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
            <View style={styles.vlogFeedSection}>
              {/* ROTATE TO CAPTURE HEADER ROW (DISPLAYED BY DEFAULT ON HOMESCREEN ALWAYS ABOVE VLOG BOX) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -5, marginBottom: 6, paddingLeft: 4 }}>
                <Animated.View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  }}
                >
                  <Image
                    source={require('../../assets/images/custom_rotate_smiley.png')}
                    style={{ width: 15.5, height: 15.5, tintColor: '#000000' }}
                    resizeMode="contain"
                  />
                </Animated.View>
                <Text style={{ fontSize: 16, color: isDark ? '#8E8E93' : '#636366', fontFamily: Fonts.SystemRoundedMedium }}>
                  rotate to capture
                </Text>
              </View>

              {/* IF VIDEO IS SENT TO VLOG: ENLARGED 16:9 VLOG CARD */}
              {vlogList.length > 0 && !!vlogList[homeVlogIndex]?.uri ? (
                <View style={{ width: '100%', marginBottom: 16 }}>
                  {/* SCALED UP 16:9 VLOG CARD */}
                  <TouchableOpacity
                    style={{
                      width: '100%',
                      height: (screenWidth - 20) * (9 / 16),
                      borderRadius: 24,
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: '#000000',
                      alignSelf: 'center',
                    }}
                    activeOpacity={0.9}
                    onPress={() => setShowExportSheet(true)}
                  >
                    <Video
                      key={vlogList[homeVlogIndex]?.id || homeVlogIndex}
                      source={{ uri: vlogList[homeVlogIndex]?.uri || vlogList[0]?.uri }}
                      style={
                        isHomeVlogVertical
                          ? {
                              position: 'absolute',
                              top: ((screenWidth - 20) * (9 / 16) - (screenWidth - 20)) / 2,
                              left: ((screenWidth - 20) - (screenWidth - 20) * (9 / 16)) / 2,
                              width: (screenWidth - 20) * (9 / 16),
                              height: screenWidth - 20,
                              transform: [{ rotate: '270deg' }],
                            }
                          : StyleSheet.absoluteFill
                      }
                      resizeMode={ResizeMode.COVER}
                      shouldPlay={activeTab === 'pals' && !showExportSheet && !showChatDrawer && !showCamera && !showCreateModal && !showEditNameModal && !showGroupsView}
                      isLooping={vlogList.length === 1}
                      isMuted={!(activeTab === 'pals' && !showExportSheet && !showChatDrawer && !showCamera && !showCreateModal && !showEditNameModal && !showGroupsView) || (vlogList[homeVlogIndex]?.isMuted ?? false)}
                      rate={vlogList[homeVlogIndex]?.rate || 1.0}
                      shouldCorrectPitch={true}
                      progressUpdateIntervalMillis={16}
                      onPlaybackStatusUpdate={(status) => {
                        if (status.isLoaded) {
                          if (status.durationMillis && status.durationMillis > 0) {
                            const p = Math.min(Math.max(status.positionMillis / status.durationMillis, 0), 1);
                            setHomeVlogProgress(p);
                          }
                          if (status.didJustFinish) {
                            setHomeVlogProgress(0);
                            if (vlogList.length > 1) {
                              setHomeVlogIndex((prev) => (prev + 1) % vlogList.length);
                            }
                          }
                        }
                      }}
                      onReadyForDisplay={(event) => {
                        if (event?.naturalSize) {
                          const { width, height } = event.naturalSize;
                          setIsHomeVlogVertical(height > width);
                        }
                      }}
                    />
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.15)' }]} pointerEvents="none" />

                    {/* CENTER OVERLAY: VLOG (LEFT) | CAPTION (CENTER) | TIMESTAMP (RIGHT) */}
                    <View
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 20,
                        right: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 10,
                      }}
                      pointerEvents="none"
                    >
                      <Text style={{ color: '#FFFFFF', fontSize: 24, fontFamily: Fonts.SystemRoundedBold }}>
                        vlog
                      </Text>
                      {!!vlogList[homeVlogIndex]?.caption && (
                        <Text style={{ color: '#FFFFFF', fontSize: 18, fontFamily: Fonts.SystemRoundedSemibold }}>
                          {vlogList[homeVlogIndex]?.caption}
                        </Text>
                      )}
                      <Text style={{ color: '#FFFFFF', fontSize: 17, fontFamily: Fonts.SystemRoundedSemibold }}>
                        {getNearestHourText(vlogList[homeVlogIndex]?.timestamp || vlogList[homeVlogIndex]?.displayTime)}
                      </Text>
                    </View>

                    {/* BOTTOM CENTER: HORIZONTAL SEGMENTED PROGRESSIVE SEEK BAR (EXACT VIDEO PLAYBACK SEEK FILL) */}
                    {vlogList.length > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 20,
                          alignSelf: 'center',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          zIndex: 15,
                        }}
                        pointerEvents="none"
                      >
                        {vlogList.map((_, index) => {
                          let fillPercent = 0;
                          if (vlogList.length === 1) {
                            fillPercent = homeVlogProgress * 100;
                          } else {
                            if (index < homeVlogIndex) {
                              fillPercent = 100;
                            } else if (index === homeVlogIndex) {
                              fillPercent = homeVlogProgress * 100;
                            } else {
                              fillPercent = 0;
                            }
                          }

                          return (
                            <View
                              key={index}
                              style={{
                                width: vlogList.length === 1 ? 30 : 24,
                                height: 3.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.40)',
                                overflow: 'hidden',
                              }}
                            >
                              <View
                                style={{
                                  width: `${Math.min(Math.max(fillPercent, 0), 100)}%`,
                                  height: '100%',
                                  backgroundColor: '#FFFFFF',
                                  borderRadius: 2,
                                }}
                              />
                            </View>
                          );
                        })}
                      </View>
                    )}

                    {/* BOTTOM RIGHT: EXPORT BUTTON */}
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        bottom: 12,
                        right: 14,
                        padding: 6,
                      }}
                      activeOpacity={0.7}
                      onPress={() => setShowExportSheet(true)}
                    >
                      <Ionicons name="share-outline" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              ) : (
                /* DEFAULT STAR-DOODLE VLOG CARD (WHEN NO VIDEO SENT) */
                <TouchableOpacity
                  style={[
                    styles.vlogCard,
                    {
                      width: '100%',
                      alignSelf: 'center',
                      backgroundColor: isDark ? '#161616' : '#EFEFEF',
                      overflow: 'hidden',
                      position: 'relative',
                    },
                  ]}
                  activeOpacity={0.9}
                  onPress={() => setShowExportSheet(true)}
                >
                  <View style={styles.vlogTextSection}>
                    <Text style={[styles.vlogTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      vlog
                    </Text>
                    <Text style={[styles.vlogSubtext, { color: '#8E8E93' }]}>
                      your space. Each day runs 4am{'\n'}to 4am.
                    </Text>
                  </View>

                  <Image
                    source={require('../../assets/images/dm_star_4.png')}
                    style={styles.starDoodleImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}

              {/* 2. ADDITIONAL PAL ROOM CARDS IF ANY */}
              {userPalRooms.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[styles.vlogCard, { backgroundColor: isDark ? '#161616' : '#EFEFEF' }]}
                  activeOpacity={0.9}
                  onPress={() => setShowExportSheet(true)}
                >
                  <View style={styles.vlogTextSection}>
                    <Text style={[styles.vlogTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {room.name.toLowerCase()}
                    </Text>
                    <Text style={[styles.vlogSubtext, { color: '#8E8E93' }]}>
                      max {room.maxCount} pals.
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/images/dm_star_4.png')}
                    style={styles.starDoodleImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
                {/* INSTRUCTION STEPS, DAY RESET BLOB & DOODLE FOOTER (DISAPPEARS WHEN VIDEO SENT TO VLOG) */}
                {vlogList.length === 0 && (
                  <>
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
                  </>
                )}
          </ScrollView>
        </Animated.View>

        {/* 3. UNIFIED BOTTOM LIQUID GLASS NAVIGATION BAR */}
        <View style={styles.unifiedBottomRow}>
          {/* LEFT TIMER BUTTON (CAMERA TAB ONLY, SMOOTH FADE) */}
          <Animated.View
            style={{
              opacity: tabTransitionAnim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [1, 0.2, 0],
              }),
            }}
            pointerEvents={activeTab === 'camera' ? 'auto' : 'none'}
          >
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
                    fontFamily="System"
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
                    fontFamily="System"
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
          </Animated.View>

          {/* CENTER TAB SWITCHER (CAMERA / PALS) */}
          <LiquidGlassNavPillBar
            activeTab={activeTab}
            onSelectTab={(t) => {
              setActiveTab(t);
            }}
            isDark={isDark}
          />

          {/* RIGHT CAMERA ROTATE BUTTON (CAMERA TAB ONLY, SMOOTH FADE) */}
          <Animated.View
            style={{
              opacity: tabTransitionAnim.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [1, 0.2, 0],
              }),
            }}
            pointerEvents={activeTab === 'camera' ? 'auto' : 'none'}
          >
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
          </Animated.View>
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
                  variant="clear"
                  renderer="auto"
                  cornerStyle="continuous"
                >
                  {/* ADD MENU ITEMS LIST */}
                  <View style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                    {/* Option 1: create a pal */}
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
                        create a pal
                      </Text>
                    </TouchableOpacity>

                    {/* Option 2: join a pal */}
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
                        join a pal
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
                      <Stop offset="0%" stopColor={accentColor} stopOpacity={0.88} />
                      <Stop offset="45%" stopColor={accentColor} stopOpacity={isDark ? 0.65 : 0.78} />
                      <Stop offset="100%" stopColor={accentColor} stopOpacity={isDark ? 0.26 : 0.38} />
                    </LinearGradient>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#dropdownDiagonalGlow)" />
                </Svg>

                <BlurView
                  intensity={70}
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
                      <Stop offset="0%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.40 : 0.48} />
                      <Stop offset="50%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.18 : 0.24} />
                      <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#FFFFFF'} stopOpacity={isDark ? 0.07 : 0.10} />
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

                  <BlurView intensity={75} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

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
                        <Stop offset="0%" stopColor={accentColor} stopOpacity={0.88} />
                        <Stop offset="45%" stopColor={accentColor} stopOpacity={isDark ? 0.65 : 0.78} />
                        <Stop offset="100%" stopColor={accentColor} stopOpacity={isDark ? 0.26 : 0.38} />
                      </LinearGradient>
                    </Defs>
                    <Rect width="100%" height="100%" fill="url(#colorSubDiagonalGlow)" />
                  </Svg>

                  <BlurView intensity={75} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    <Defs>
                      <LinearGradient id="colorSubCardBorder" x1="100%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.40 : 0.48} />
                        <Stop offset="50%" stopColor={isDark ? accentColor : '#FFFFFF'} stopOpacity={isDark ? 0.18 : 0.24} />
                        <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#FFFFFF'} stopOpacity={isDark ? 0.07 : 0.10} />
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
              behavior="padding"
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
                      fontFamily: Fonts.SystemRoundedBold,
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
                      fontFamily: Fonts.SystemRoundedMedium,
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
                        fontFamily: Fonts.SystemRoundedSemibold,
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
                        fontFamily: Fonts.SystemRoundedMedium,
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
                          fontFamily: Fonts.SystemRoundedSemibold,
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
                          fontFamily: Fonts.SystemRoundedSemibold,
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

        <ActivityDrawer
          visible={showActivityDrawer}
          onClose={() => setShowActivityDrawer(false)}
          isDark={isDark}
          selectedThemeColor={selectedThemeColor}
        />

        <ChatDrawer
          visible={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          onOpenVlog={() => setShowExportSheet(true)}
          palCode="palzee_space"
          user={user}
          isDark={isDark}
          selectedThemeColor={selectedThemeColor}
          vlogList={vlogList}
          activeVideoUri={vlogList.length > 0 ? vlogList[0]?.uri : undefined}
        />

        <VlogSheet
          visible={showExportSheet}
          onClose={() => {
            setShowChatDrawer(false);
            setShowExportSheet(false);
          }}
          user={user}
          selectedThemeColor={selectedThemeColor}
          vlogList={vlogList}
          activeVideoUri={vlogList.length > 0 ? vlogList[0]?.uri : null}
          caption={vlogList.length > 0 ? vlogList[0]?.caption : ''}
          timestamp={vlogList.length > 0 ? vlogList[0]?.timestamp : ''}
          isMuted={vlogList.length > 0 ? vlogList[0]?.isMuted : false}
          onDeleteVideo={handleDeleteVideo}
          onUpdateCaption={handleUpdateCaption}
          onOpenCamera={() => {
            setShowChatDrawer(false);
            setShowExportSheet(false);
            setShowCamera(true);
          }}
          onOpenChat={() => {
            setShowChatDrawer(true);
          }}
        />
      </View>
    </DynamicGlowContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 10,
  },
  topHeader: {
    position: 'absolute',
    top: 4,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  palzeeLogoText: {
    fontFamily: Fonts.Unpack,
    fontSize: 47,
    fontWeight: 'bold',
    color: '#4FFFB0',
    letterSpacing: 1.5,
    marginLeft: -5,
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
    marginHorizontal: 0,
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hiCard: {
    backgroundColor: '#161616',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  hiCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Fonts.SystemRoundedBold,
  },
  hiCardIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vlogTextSection: {
    flex: 1,
    paddingRight: 10,
  },
  vlogTitle: {
    color: '#FFFFFF',
    fontFamily: Fonts.SystemRoundedBold,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  vlogSubtext: {
    color: '#8E8E93',
    fontFamily: Fonts.SystemRoundedMedium,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 21,
  },
  starDoodleImage: {
    width: 65.05,
    height: 65.05,
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
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: Fonts.SystemRoundedBold,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  plusSymbolText: {
    fontSize: 15,
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
    fontFamily: Fonts.SystemRoundedSemibold,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionHintText: {
    fontFamily: Fonts.SystemRoundedSemibold,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stepSubtext: {
    fontFamily: Fonts.SystemRoundedMedium,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
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
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 100,
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
    fontFamily: Fonts.SystemRoundedMedium,
    fontSize: 16,
    fontWeight: '400',
  },
  activeSegmentText: {
    color: '#FFFFFF',
    fontFamily: Fonts.SystemRoundedSemibold,
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
    fontFamily: Fonts.SystemRoundedSemibold,
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
    fontFamily: Fonts.SystemRounded,
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
    fontFamily: Fonts.SystemRounded,
  },
});
