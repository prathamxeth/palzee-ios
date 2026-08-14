import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
  useWindowDimensions,
  Animated,
  Easing,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Svg, { Defs, LinearGradient, Stop, Pattern, Rect, Circle, Path, Line } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { LiquidGlassIconButton, DynamicGlowContainer } from '../ui';

import { CRTStaticCard } from './CRTStaticCard';
import { ChatDrawer } from '../home/ChatDrawer';
import { EditExportSheet } from './EditExportSheet';
import { getNearestHourText, formatExactTime } from '../../utils/mediaUtils';

export interface VlogSheetProps {
  visible: boolean;
  onClose: () => void;
  user?: any;
  selectedThemeColor?: string;
  onOpenCamera?: () => void;
  onOpenChat?: () => void;
  vlogList?: Array<{ id: string; uri: string; caption?: string; timestamp: string; isMuted?: boolean; rate?: number; mode?: string }>;
  activeVideoUri?: string | null;
  caption?: string;
  timestamp?: string;
  isVertical?: boolean;
  isMuted?: boolean;
  onDeleteVideo?: (id?: string) => void;
  onUpdateCaption?: (newCaption: string, id?: string) => void;
  initialOpenExport?: boolean;
}

export const VlogSheet: React.FC<VlogSheetProps> = ({
  visible,
  onClose,
  user,
  selectedThemeColor = 'cyan',
  onOpenCamera,
  onOpenChat,
  vlogList = [],
  activeVideoUri,
  caption = 'Hi',
  timestamp = '18:33',
  isVertical = true,
  isMuted = false,
  onDeleteVideo,
  onUpdateCaption,
  initialOpenExport = false,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth - 20;
  const cardHeight = cardWidth * (9 / 16);
  const isDark = colorScheme === 'dark';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

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

  const [showVlogDropdown, setShowVlogDropdown] = useState(false);
  const [showEditCaptionBox, setShowEditCaptionBox] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [show0Logs, setShow0Logs] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isSheetVideoVertical, setIsSheetVideoVertical] = useState(isVertical);
  const [currentVlogIndex, setCurrentVlogIndex] = useState(0);

  const rawList = vlogList && vlogList.length > 0 ? vlogList : (activeVideoUri ? [{ id: 'default', uri: activeVideoUri, caption, timestamp, isMuted }] : []);
  const list = rawList;
  const currentClip = list.length > 0 ? list[Math.min(currentVlogIndex, list.length - 1)] : null;
  const currentUri = currentClip ? currentClip.uri : activeVideoUri;
  const currentCaption = currentClip ? (currentClip.caption || '') : caption;
  const currentTimestamp = getNearestHourText(currentClip ? ((currentClip as any).displayTime || currentClip.timestamp) : timestamp);
  const currentIsMuted = currentClip ? (currentClip.isMuted ?? false) : isMuted;

  const [editingCaptionText, setEditingCaptionText] = useState(currentCaption);

  useEffect(() => {
    if (visible) {
      setCurrentVlogIndex(0);
      setShowExportModal(Boolean(initialOpenExport));
      setShowVlogDropdown(false);
      setShowEditCaptionBox(false);
      setShowOptionsMenu(false);
      setShowDeleteDialog(false);
      setIsEditingCaption(false);
      if (!vlogList || vlogList.length === 0) {
        trigger0PalsEffect();
      }
    }
  }, [visible, vlogList?.length, initialOpenExport]);

  useEffect(() => {
    setEditingCaptionText(currentCaption);
  }, [currentCaption]);

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    setShowEditCaptionBox(false);
    if (onDeleteVideo) {
      if (currentClip?.id && currentClip.id !== 'default') {
        onDeleteVideo(currentClip.id);
      } else {
        onDeleteVideo();
      }
    }
  };

  const handleSaveCaption = () => {
    setIsEditingCaption(false);
    if (onUpdateCaption) {
      if (currentClip?.id && currentClip.id !== 'default') {
        onUpdateCaption(editingCaptionText, currentClip.id);
      } else {
        onUpdateCaption(editingCaptionText);
      }
    }
  };

  const handleScreenTap = (evt: any) => {
    if (showEditCaptionBox) {
      setShowEditCaptionBox(false);
      return;
    }
    if (showDeleteDialog || isEditingCaption || showVlogDropdown) return;
    if (list.length <= 1) return;

    const touchX = evt.nativeEvent.locationX;
    if (touchX < screenWidth / 2) {
      setCurrentVlogIndex((prev) => (prev < list.length - 1 ? prev + 1 : 0));
    } else {
      setCurrentVlogIndex((prev) => (prev > 0 ? prev - 1 : list.length - 1));
    }
  };

  const logsRotateAnim = useRef(new Animated.Value(0)).current;
  const logsOpacityAnim = useRef(new Animated.Value(1)).current;
  const rotateLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const trigger0PalsEffect = () => {
    if (rotateLoopRef.current) rotateLoopRef.current.stop();
    if (timerRef.current) clearTimeout(timerRef.current);

    setShow0Logs(true);
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
        setShow0Logs(false);
        if (rotateLoopRef.current) rotateLoopRef.current.stop();
      });
    }, 3000);
  };

  const handleClose = () => {
    setShowChatDrawer(false);
    setShowEditCaptionBox(false);
    setShowDeleteDialog(false);
    setIsEditingCaption(false);
    setShowVlogDropdown(false);
    onClose();
  };

  useEffect(() => {
    if (!visible) {
      setShowChatDrawer(false);
      setShowEditCaptionBox(false);
      setShowDeleteDialog(false);
      setIsEditingCaption(false);
      setShowVlogDropdown(false);
      return;
    }
    setShow0Logs(false);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rotateLoopRef.current) rotateLoopRef.current.stop();
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F5F5F7' }]}>
          {/* 1. TOP NAVIGATION HEADER BAR */}
          <View style={[styles.headerBar, { paddingTop: Math.max(insets.top + 4, 12) }]}>
            <View style={{ width: 100, height: 44, justifyContent: 'center' }}>
              {show0Logs ? (
                <Animated.View style={{ opacity: logsOpacityAnim }}>
                  <TouchableOpacity
                    style={styles.zeroLogsPillBtn}
                    activeOpacity={0.8}
                    onPress={handleClose}
                  >
                    <BlurView
                      intensity={35}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width={96} height={42} style={StyleSheet.absoluteFill}>
                      <Defs>
                        <LinearGradient id="logsPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor={isDark ? '#28282E' : '#FFFFFF'} stopOpacity={isDark ? 0.75 : 0.90} />
                          <Stop offset="100%" stopColor={isDark ? '#0E0E10' : '#EAE8E3'} stopOpacity={isDark ? 0.85 : 0.70} />
                        </LinearGradient>
                        <LinearGradient id="logsPillBdr" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.35 : 0.95} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0.75"
                        y="0.75"
                        width="94.5"
                        height="40.5"
                        rx="20.25"
                        fill="url(#logsPillGrad)"
                        stroke="url(#logsPillBdr)"
                        strokeWidth="1.5"
                      />
                    </Svg>
                    <View style={[styles.logsSmileyCircle, { backgroundColor: '#FF3B30' }]}>
                      <Animated.Image
                        source={require('../../assets/images/custom_rotate_smiley.png')}
                        style={[
                          styles.logsSmileyImg,
                          {
                            tintColor: '#000000',
                            transform: [
                              {
                                rotate: logsRotateAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['180deg', '540deg'],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.zeroLogsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      0 pals
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ) : (
                <LiquidGlassIconButton idPrefix="btnVlogBack" isDark={isDark} onPress={handleClose}>
                  <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                </LiquidGlassIconButton>
              )}
            </View>

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

              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: edgeColor,
                  borderWidth: 1.5,
                  borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  marginTop: 6,
                }}
              >
                <Image
                  source={require('../../assets/images/custom_rotate_smiley.png')}
                  style={{ width: 15, height: 15, tintColor: '#000000' }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.headerRightIcons}>
              <LiquidGlassIconButton
                idPrefix="btnVlogShare"
                isDark={isDark}
                onPress={() => {
                  if (currentUri) {
                    setShowExportModal(true);
                  }
                }}
              >
                <Ionicons name="share-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>

              <LiquidGlassIconButton
                idPrefix="btnVlogChat"
                isDark={isDark}
                onPress={() => setShowChatDrawer(true)}
              >
                <Ionicons name="chatbubble-outline" size={22} color={isDark ? '#FFFFFF' : '#000000'} />
              </LiquidGlassIconButton>
            </View>
          </View>

          {/* 2. MAIN 16:9 CARD VIEW CONTAINER */}
          <TouchableOpacity
            style={styles.cardContainer}
            activeOpacity={1}
            onPress={handleScreenTap}
          >
            <View style={[styles.cardOuter, { width: cardWidth, height: cardHeight }]}>
              {!!currentUri ? (
                <Video
                  key={currentUri}
                  source={{ uri: currentUri }}
                  style={isSheetVideoVertical ? rotatedStyle : styles.videoBackground}
                  resizeMode={ResizeMode.COVER}
                  shouldPlay={visible && !showEditCaptionBox && !showDeleteDialog && !showChatDrawer && !showExportModal}
                  isLooping={true}
                  isMuted={currentIsMuted}
                  rate={currentClip?.rate || 1.0}
                  onReadyForDisplay={(event) => {
                    if (event?.naturalSize) {
                      const { width: w, height: h } = event.naturalSize;
                      setIsSheetVideoVertical(h > w);
                    }
                  }}
                />
              ) : (
                <CRTStaticCard isDark={isDark} width={cardWidth} height={cardHeight} borderRadius={28} />
              )}

              <View style={styles.cardHeaderRow} pointerEvents="box-none">
                <View style={styles.userInfoBadge}>
                  <View style={[styles.avatarCircle, { backgroundColor: edgeColor }]}>
                    {user?.photoURL ? (
                      <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
                    ) : (
                      <Image
                        source={require('../../assets/images/capture_smile.png')}
                        style={styles.smileyIcon}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text style={styles.userNameText}>{username}</Text>
                </View>
              </View>

              <View style={styles.cardMiddleRow} pointerEvents="box-none">
                {!!currentUri ? (
                  <>
                    <Text style={[styles.cardVlogTitle, { color: '#FFFFFF' }]}>vlog</Text>
                    {!!currentCaption && (
                      <Text style={{ color: '#FFFFFF', fontSize: 20, fontFamily: Fonts.SystemRoundedSemibold }}>
                        {currentCaption}
                      </Text>
                    )}
                    <Text style={[styles.timestampText, { color: '#FFFFFF' }]}>
                      {formatExactTime((currentClip as any)?.displayTime || currentClip?.timestamp || timestamp)}
                    </Text>
                  </>
                ) : (
                  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity
                      style={styles.centerCaptureBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        onClose();
                        if (onOpenCamera) onOpenCamera();
                      }}
                    >
                      <Text style={styles.centerCaptureBtnText}>tap to capture vlog</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* BOTTOM RIGHT TRIPLE DOT BUTTON (PLAIN ICON, NO PILL BG) */}
              {!!currentUri && (
                <TouchableOpacity
                  style={styles.cardBottomRightDots}
                  activeOpacity={0.7}
                  onPress={() => setShowOptionsMenu(true)}
                >
                  <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          <EditExportSheet
            visible={showExportModal}
            onClose={() => setShowExportModal(false)}
            vlogList={vlogList}
            selectedThemeColor={selectedThemeColor}
            onDeleteVideo={onDeleteVideo}
            onUpdateCaption={onUpdateCaption}
          />

          {/* TRIPLE DOT 3-OPTIONS MENU POPUP SHEET (FLOATING ABOVE CARD BOTTOM BOUNDARY) */}
          <Modal
            visible={showOptionsMenu}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowOptionsMenu(false)}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                paddingBottom: 282.5,
                paddingRight: 9,
              }}
              activeOpacity={1}
              onPress={() => setShowOptionsMenu(false)}
            >
              <View
                style={{
                  width: 190,
                  borderRadius: 20,
                  overflow: 'hidden',
                  borderWidth: 1.5,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.95)',
                  backgroundColor: isDark ? 'rgba(30, 30, 34, 0.82)' : 'rgba(255, 255, 255, 0.88)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 10,
                }}
              >
                <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

                <Svg width={190} height={120} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="optionsPillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <Stop offset="0%" stopColor={isDark ? '#28282E' : '#FFFFFF'} stopOpacity={isDark ? 0.75 : 0.88} />
                      <Stop offset="100%" stopColor={isDark ? '#0E0E10' : '#EAE8E3'} stopOpacity={isDark ? 0.85 : 0.65} />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="190" height="120" rx="20" fill="url(#optionsPillGrad)" />
                </Svg>

                {/* 1. Edit Caption */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    gap: 10,
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    setShowEditCaptionBox(true);
                  }}
                >
                  <Ionicons name="create-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
                  <Text style={{ fontSize: 14, fontFamily: Fonts.SystemRoundedSemibold, color: isDark ? '#FFFFFF' : '#000000' }}>
                    edit caption
                  </Text>
                </TouchableOpacity>

                {/* 2. Save & Export */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    gap: 10,
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    setShowExportModal(true);
                  }}
                >
                  <Ionicons name="share-outline" size={18} color={isDark ? '#FFFFFF' : '#000000'} />
                  <Text style={{ fontSize: 14, fontFamily: Fonts.SystemRoundedSemibold, color: isDark ? '#FFFFFF' : '#000000' }}>
                    save & export
                  </Text>
                </TouchableOpacity>

                {/* 3. Delete Vlog */}
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    gap: 10,
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  <Text style={{ fontSize: 14, fontFamily: Fonts.SystemRoundedSemibold, color: '#FF3B30' }}>
                    delete vlog
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <ChatDrawer
            visible={showChatDrawer}
            onClose={() => setShowChatDrawer(false)}
            onOpenCamera={() => {
              setShowChatDrawer(false);
              onClose();
              if (onOpenCamera) onOpenCamera();
            }}
            onOpenVlog={() => {
              setShowChatDrawer(false);
              setShowExportModal(true);
            }}
            palCode="palzee_space"
            user={user}
            isDark={isDark}
            selectedThemeColor={selectedThemeColor}
            vlogList={vlogList}
            activeVideoUri={activeVideoUri}
          />
        </View>
      </DynamicGlowContainer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 100,
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
    width: 22,
    height: 22,
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
    alignItems: 'center',
    marginTop: 75,
  },
  vlogLiquidPillBtn: {
    width: 96,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vlogPillText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedBold,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  cardOuter: {
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  cardHeaderRow: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  smileyIcon: {
    width: 18,
    height: 18,
  },
  userNameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Fonts.SystemRoundedSemibold,
  },
  cardBottomRightDots: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    padding: 6,
    zIndex: 20,
  },
  cardMiddleRow: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: '50%',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  cardVlogTitle: {
    fontSize: 25,
    fontFamily: Fonts.SystemRoundedBold,
  },
  timestampText: {
    fontSize: 20,
    fontFamily: Fonts.SystemRoundedMedium,
  },
  centerCaptureBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  centerCaptureBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedBold,
  },
});
