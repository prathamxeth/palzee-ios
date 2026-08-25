import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import Svg, { Circle } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import PalVideoSendPreviewModal from './PalVideoSendPreviewModal';
import { cameraWarmupStore } from '../../utils/cameraWarmupStore';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

const DANCING_COLORS = ['#00F0FF', '#FF007F', '#7F00FF', '#00FF66', '#FFCC00', '#FF3366', '#00E5FF', '#A800FF'];

type TimerMode = 'off' | '3s' | '5s' | 'timelapse' | 'jump_cut';

interface PalCameraPreviewProps {
  selectedThemeColor?: string;
  autoTickVlog?: boolean;
  palCount?: number;
  onCaptureSuccess?: (uri: string, caption?: string, isMuted?: boolean, rate?: number, mode?: string) => void;
  onClose?: () => void;
  timerMode?: TimerMode;
  onToggleTimerMode?: () => void;
  facing?: CameraType;
  onToggleFacing?: () => void;
  isActive?: boolean;
}

export default function PalCameraPreview({
  selectedThemeColor = 'cyan',
  autoTickVlog = true,
  palCount = 0,
  onCaptureSuccess,
  onClose,
  timerMode = 'off',
  onToggleTimerMode,
  facing = 'back',
  onToggleFacing,
  isActive = true,
}: PalCameraPreviewProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const screenWidth = windowWidth > 0 ? windowWidth : 390;
  const screenHeight = windowHeight > 0 ? windowHeight : 844;
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();
  const [storeGranted, setStoreGranted] = useState(cameraWarmupStore.isCameraGranted());
  const hasPermission = Boolean(permission?.granted || storeGranted);

  const [flash, setFlash] = useState<FlashMode>('off');
  const [cameraZoom, setCameraZoom] = useState<number>(0.05); // Default 1x
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const isHeldDownRef = useRef(false);
  const isRecordingRef = useRef(false);
  const countdownIntervalRef = useRef<any>(null);
  const baseZoomRef = useRef(0.05);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const cancelCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
  };

  const recordingTimerRef = useRef<any>(null);

  const stopRecording = async () => {
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (cameraRef.current && isRecordingRef.current) {
      try {
        await cameraRef.current.stopRecording();
      } catch (e) {}
    }
  };

  const shutterPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        if (isRecordingRef.current) {
          stopRecording();
          return;
        }
        if (countdownIntervalRef.current !== null || countdown !== null) {
          cancelCountdown();
          return;
        }
        isHeldDownRef.current = true;
        baseZoomRef.current = cameraZoom;
        startRecordSequence();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!isHeldDownRef.current) return;
        const dragUp = -gestureState.dy;
        const dynamicZoom = Math.min(Math.max(baseZoomRef.current + (dragUp / 200) * 0.6, 0.0), 0.8);
        setCameraZoom(dynamicZoom);
      },
      onPanResponderRelease: () => {
        isHeldDownRef.current = false;
        if (timerMode === 'off' && isRecordingRef.current) {
          stopRecording();
        }
      },
      onPanResponderTerminate: () => {
        isHeldDownRef.current = false;
        if (timerMode === 'off' && isRecordingRef.current) {
          stopRecording();
        }
      },
    })
  ).current;

  useEffect(() => {
    const unsub = cameraWarmupStore.subscribe(() => {
      setStoreGranted(cameraWarmupStore.isCameraGranted());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      cameraWarmupStore.setCameraGranted(true);
    }
  }, [permission]);

  // Video send preview window state
  const [previewVideoUri, setPreviewVideoUri] = useState<string | null>(null);

  const cameraRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const idleRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      }).catch(() => {});
    }
  }, [isActive]);

  const [colorIndex, setColorIndex] = useState(0);
  const [isPreparingVideo, setIsPreparingVideo] = useState(false);

  // Live time state (Formated as 7:17 PM)
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedMin = minutes < 10 ? `0${minutes}` : `${minutes}`;
      setTimeText(`${hours}:${formattedMin} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Smooth continuous free rotation of smiley button
  const startIdleRotation = () => {
    idleRotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(idleRotateAnim, {
        toValue: 1,
        duration: 3666,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    startIdleRotation();
  }, []);

  useEffect(() => {
    if (!previewVideoUri && !isRecording && !isPreparingVideo && countdown === null) {
      startIdleRotation();
    }
  }, [previewVideoUri, isRecording, isPreparingVideo, countdown]);

  // Floating mode pill auto-hide state
  const [showPill, setShowPill] = useState(false);
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (timerMode === 'off') return;
    }

    setShowPill(true);
    Animated.timing(pillOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(pillOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        setShowPill(false);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [timerMode]);

  // Dancing hex colors animation during recording, countdown & video preparation
  useEffect(() => {
    let danceInterval: any = null;
    if (isRecording || isPreparingVideo || countdown !== null) {
      danceInterval = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % DANCING_COLORS.length);
      }, 100);
    } else {
      setColorIndex(0);
    }
    return () => {
      if (danceInterval) clearInterval(danceInterval);
    };
  }, [isRecording, isPreparingVideo, countdown]);

  // Slow rotation during recording, countdown & video preparation
  useEffect(() => {
    if (isRecording || isPreparingVideo || countdown !== null) {
      rotationAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.stopAnimation();
      rotationAnim.setValue(0);
    }
  }, [isRecording, isPreparingVideo, countdown]);

  const sideMargin = 8.5;
  let cameraWidth = Math.max(screenWidth - sideMargin * 2, 320);
  let cameraHeight = (screenWidth + 15) * (16 / 9) + 95;

  const maxCameraHeight = screenHeight - (insets.top - 20) - (insets.bottom - 10);

  if (cameraHeight > maxCameraHeight && maxCameraHeight > 200) {
    cameraHeight = maxCameraHeight;
  }
  if (cameraHeight < 400 || isNaN(cameraHeight)) {
    cameraHeight = Math.max(screenHeight * 0.86, 580);
  }

  // Theme accent color
  const baseAccentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

  useEffect(() => {
    if (!hasPermission && requestPermission) {
      requestPermission();
    }
    if (!micPermission?.granted && requestMicPermission) {
      requestMicPermission().catch(() => {});
    }
  }, [hasPermission, micPermission]);

  const handleFlashPress = () => {
    if (flash === 'off') {
      setFlash('on');
      startRecordSequence();
    } else {
      setFlash('off');
    }
  };

  const startRecordSequence = () => {
    if (isRecording || countdown !== null) return;

    if (timerMode === '3s') {
      runCountdown(3);
    } else if (timerMode === '5s') {
      runCountdown(5);
    } else {
      executeRecording();
    }
  };

  const runCountdown = (sec: number) => {
    cancelCountdown();
    setCountdown(sec);
    let count = sec;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        cancelCountdown();
        executeRecording();
      }
    }, 1000);
  };

  const getRecordingDurationSec = () => {
    if (timerMode === 'off') return 2.0;
    if (timerMode === '3s') return 3.0; // 3s video after 3..2..1 countdown
    if (timerMode === '5s') return 5.0; // 5s video after 5..4..3..2..1 countdown
    if (timerMode === 'timelapse') return 10.0; // 10s video in timelapse mode
    if (timerMode === 'jump_cut') return 15.0; // 15s video in jumpcut mode
    return 2.0;
  };

  const executeRecording = async () => {
    if (!cameraRef.current || isRecordingRef.current) return;
    setIsRecording(true);
    isRecordingRef.current = true;
    progressAnim.setValue(0);

    const recSec = getRecordingDurationSec();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: recSec * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
    }
    recordingTimerRef.current = setTimeout(() => {
      stopRecording();
    }, recSec * 1000);

    try {
      const data = await cameraRef.current.recordAsync();
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsPreparingVideo(true);
      if (data && data.uri) {
        try {
          const info = await FileSystem.getInfoAsync(data.uri);
          if (info && info.exists) {
            setPreviewVideoUri(data.uri);
          } else {
            setPreviewVideoUri(data.uri);
          }
        } catch (e) {
          setPreviewVideoUri(data.uri);
        }
      }
    } catch (e) {
      console.log('Record error:', e);
    } finally {
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setIsRecording(false);
      isRecordingRef.current = false;
      setIsPreparingVideo(false);
      progressAnim.setValue(0);
      setFlash('off');
    }
  };

  const idleSpin = idleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const smileyColor = isRecording || isPreparingVideo || countdown !== null ? DANCING_COLORS[colorIndex] : '#00F0FF';
  const shutterSize = 82;
  const centerShutterLeft = (cameraWidth - shutterSize) / 2;

  const pillHeight =
    timerMode === 'off'
      ? 56
      : timerMode === 'timelapse' || timerMode === 'jump_cut'
      ? 120
      : 165;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top - 24, 0),
          paddingBottom: Math.max(insets.bottom - 24, 0),
        },
      ]}
    >
        {/* 1. EXACT CAMERA VIEWPORT CARD MATCHING USER REFERENCE IMAGE */}
        <View
          style={[
            styles.viewportCardContainer,
            {
              width: cameraWidth,
              flex: 1,
              maxHeight: cameraHeight,
            },
          ]}
        >
          {/* Border Overlay */}
          <View
            style={{
              position: 'absolute',
              top: -0.75,
              bottom: -0.75,
              left: -0.75,
              right: -0.75,
              borderRadius: 32,
              borderWidth: 1.625,
              borderColor: baseAccentColor,
              opacity: 0.50,
              zIndex: 100,
            }}
            pointerEvents="none"
          />

          {/* Rounded Inner Clip View for Camera Feed */}
          <View style={styles.innerCameraViewClip}>
            {hasPermission && isActive && !previewVideoUri ? (
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing={facing}
                mode="video"
                mute={false}
                flash={flash}
                enableTorch={flash === 'on'}
                zoom={cameraZoom}
                onCameraReady={() => setIsCameraReady(true)}
              />
            ) : hasPermission ? null : (
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="camera-outline" size={42} color={baseAccentColor} style={{ marginBottom: 10 }} />
                <Text style={{ color: '#FFFFFF', fontSize: 14, textAlign: 'center', marginBottom: 12 }}>
                  Enable camera permissions to view live preview
                </Text>
                <TouchableOpacity style={[styles.grantBtn, { backgroundColor: baseAccentColor }]} onPress={requestPermission}>
                  <Text style={[styles.grantBtnText, { color: '#000000' }]}>Enable Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ABSOLUTE OVERLAY CONTAINER FOR CAMERA CONTROLS */}
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* TOP-LEFT CLOSE BUTTON OVERLAY */}
            {onClose && (
              <View style={styles.topLeftCloseBtnWrapper}>
                <LiquidGlassIconButton
                  idPrefix="btnCloseCameraPreview"
                  isDark={isDark}
                  onPress={onClose}
                >
                  <SymbolView name="xmark" size={30} tintColor={iconColor} />
                </LiquidGlassIconButton>
              </View>
            )}

            {/* VERTICAL CENTER TIME OVERLAY */}
            {countdown === null && (
              <View style={styles.centerTimeContainer} pointerEvents="none">
                <Text style={styles.verticalTimeText}>{timeText}</Text>
              </View>
            )}

            {/* COUNTDOWN OVERLAY */}
            {countdown !== null && (
              <View style={styles.countdownContainer} pointerEvents="none">
                <Text style={styles.countdownText}>{countdown}</Text>
              </View>
            )}

            {/* FLOATING MODE PILL INDICATOR WITH DYNAMIC ADAPTIVE HEIGHT */}
            {showPill && (
              <Animated.View
                style={[
                  styles.modePillContainer,
                  {
                    height: pillHeight,
                    marginTop: -pillHeight / 2,
                    opacity: pillOpacity,
                  },
                ]}
                pointerEvents="none"
              >
              <BlurView
                intensity={55}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.specularBorderHighlight} pointerEvents="none" />
              <Text
                style={[
                  styles.modePillText,
                  { width: pillHeight },
                  timerMode !== 'off' && { fontSize: 15 },
                ]}
              >
                {timerMode === 'off'
                  ? 'off'
                  : timerMode === '3s'
                  ? '3 second timer'
                  : timerMode === '5s'
                  ? '5 second timer'
                  : timerMode === 'timelapse'
                  ? 'timelapse'
                  : 'jump cut'}
              </Text>
            </Animated.View>
          )}

          {/* ZOOM NUMBERS (.5, 1) */}
          <View
            style={{
              position: 'absolute',
              bottom: 124,
              left: (cameraWidth - 70) / 2,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              zIndex: 15,
            }}
          >
            {[
              { label: '.5', val: 0.0 },
              { label: '1', val: 0.05 },
            ].map((item) => {
              const isSelected = (item.val === 0.0 && cameraZoom < 0.025) || (item.val === 0.05 && cameraZoom >= 0.025);
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCameraZoom(item.val);
                    baseZoomRef.current = item.val;
                  }}
                  style={{ padding: 4 }}
                >
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: isSelected ? '800' : '600',
                      color: isSelected ? '#FFCC00' : '#FFFFFF',
                      transform: [{ rotate: '90deg' }],
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FLASH ICON */}
          <TouchableOpacity
            style={[styles.flashBtnAbsolute, { left: centerShutterLeft - 68, zIndex: 1000 }]}
            activeOpacity={0.8}
            onPress={handleFlashPress}
          >
            <Image
              source={require('../../assets/images/custom_flash_icon.png')}
              style={{
                width: 35.5,
                height: 35.5,
                transform: [{ rotate: '90deg' }],
                tintColor: flash === 'on' ? '#FFCC00' : '#FFFFFF',
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* SMILEY CAPTURE SHUTTER BUTTON WITH HOLD-AND-SWIPE ZOOM GESTURE */}
          <View
            {...shutterPanResponder.panHandlers}
            style={[styles.shutterWrapperAbsolute, { left: centerShutterLeft, zIndex: 1000 }]}
          >
            <Svg width={83} height={83} style={StyleSheet.absoluteFill}>
              <Circle cx="41.5" cy="41.5" r="39.5" stroke="#1000E5" strokeWidth="3.5" fill="none" />
            </Svg>

            <Animated.View
              style={[
                styles.smileyInnerCircle,
                { backgroundColor: smileyColor },
                {
                  transform: [
                    {
                      rotate: isRecording || countdown !== null ? rotationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }) : idleSpin,
                    },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../assets/images/capture_smile.png')}
                style={{
                  width: 71.7,
                  height: 71.7,
                  transform: [{ rotate: '90deg' }],
                }}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          {/* RIGHT SIDE VERTICAL UNCLIPPED RECORDING PROGRESS BAR */}
          {isRecording && (
            <View
              style={[
                styles.progressBarGapCentered,
                {
                  width: 4.25,
                  top: 32,
                  bottom: 32,
                  right: -5.0,
                  zIndex: 999999,
                  elevation: 9999,
                },
              ]}
              pointerEvents="none"
            >
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: logoTextColor,
                    height: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          )}
        </View>
      </View>

      {/* STANDALONE DEDICATED 16:9 VIDEO SEND PREVIEW WINDOW MODAL */}
      <PalVideoSendPreviewModal
        visible={!!previewVideoUri}
        videoUri={previewVideoUri}
        timeText={timeText}
        selectedThemeColor={selectedThemeColor}
        autoTickVlog={autoTickVlog}
        palCount={palCount}
        playbackRate={timerMode === 'timelapse' ? 3.5 : timerMode === 'jump_cut' ? 1.35 : 1.0}
        timerMode={timerMode}
        onRetake={() => {
          setPreviewVideoUri(null);
          setIsRecording(false);
          progressAnim.setValue(0);
        }}
        onSend={(uri, caption, isMuted, rate, mode) => {
          setPreviewVideoUri(null);
          setIsRecording(false);
          progressAnim.setValue(0);
          if (onCaptureSuccess) {
            onCaptureSuccess(uri, caption, isMuted, rate || (timerMode === 'timelapse' ? 3.5 : timerMode === 'jump_cut' ? 1.35 : 1.0), mode || timerMode);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  viewportCardContainer: {
    borderRadius: 32,
    backgroundColor: '#000000',
    overflow: 'visible',
    position: 'relative',
  },
  innerCameraViewClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#161618',
  },
  grantBtn: {
    backgroundColor: '#11D5F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  grantBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerTimeContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  verticalTimeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontFamily: Fonts.DelaGothicOne,
    transform: [{ rotate: '90deg' }],
  },
  countdownContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 300,
  },
  countdownText: {
    fontSize: 90,
    fontFamily: Fonts.SystemRounded,
    fontWeight: '400',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  modePillContainer: {
    position: 'absolute',
    top: '50%',
    right: 16,
    width: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.90)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 400,
  },
  specularBorderHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.55)',
  },
  modePillText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Fonts.SystemRoundedSemibold,
    transform: [{ rotate: '90deg' }],
  },
  progressBarGapCentered: {
    position: 'absolute',
    borderRadius: 2.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 99999,
    elevation: 999,
  },
  progressBarFill: {
    width: '100%',
    borderRadius: 2.5,
  },
  flashBtnAbsolute: {
    position: 'absolute',
    bottom: 30,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterWrapperAbsolute: {
    position: 'absolute',
    bottom: 12,
    width: 83,
    height: 83,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyInnerCircle: {
    width: 71.7,
    height: 71.7,
    borderRadius: 35.85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topLeftCloseBtnWrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 9999,
  },
});
