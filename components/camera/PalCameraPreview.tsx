import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import Svg, { Circle, Path } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';

const DANCING_COLORS = ['#11D5F3', '#65EA7B', '#FE9068', '#FE75F5', '#AA6DFE', '#5D96FF'];

type TimerMode = 'off' | '3s' | '5s' | 'timelapse' | 'jump_cut';

interface PalCameraPreviewProps {
  selectedThemeColor?: string;
  onCaptureSuccess?: (uri: string) => void;
  onClose?: () => void;
  timerMode?: TimerMode;
  onToggleTimerMode?: () => void;
  facing?: CameraType;
  onToggleFacing?: () => void;
}

export default function PalCameraPreview({
  selectedThemeColor = 'cyan',
  onCaptureSuccess,
  onClose,
  timerMode = 'off',
  onToggleTimerMode,
  facing = 'back',
  onToggleFacing,
}: PalCameraPreviewProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoomLevel, setZoomLevel] = useState<number>(0.05); // Native 1x optical zoom default
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const cameraRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const idleRotateAnim = useRef(new Animated.Value(0)).current;
  const [colorIndex, setColorIndex] = useState(0);

  // Live time state
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const formattedMin = minutes < 10 ? `0${minutes}` : minutes;
      setTimeText(`${hours}:${formattedMin} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Smooth continuous free rotation of smiley button with zero lag, stopping, or interruption
  useEffect(() => {
    idleRotateAnim.setValue(0);
    const loopAnim = Animated.loop(
      Animated.timing(idleRotateAnim, {
        toValue: 1,
        duration: 3666,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loopAnim.start();
  }, []);

  // Floating mode pill auto-hide state (fades out after 2.5s when mode changes)
  const [showPill, setShowPill] = useState(false);
  const pillOpacity = useRef(new Animated.Value(0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip showing 'off' pill on initial camera screen mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (timerMode === 'off') {
        return;
      }
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

  // Dancing colors during recording
  useEffect(() => {
    let danceInterval: any = null;
    if (isRecording) {
      danceInterval = setInterval(() => {
        setColorIndex((prev) => (prev + 1) % DANCING_COLORS.length);
      }, 150);
    } else {
      setColorIndex(0);
    }
    return () => {
      if (danceInterval) clearInterval(danceInterval);
    };
  }, [isRecording]);

  // Fast rotation during recording
  useEffect(() => {
    if (isRecording) {
      rotationAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.stopAnimation();
      rotationAnim.setValue(0);
    }
  }, [isRecording]);

  const sideMargin = 8.75;
  let cameraWidth = screenWidth - sideMargin * 2; // Increased camera width by 0.25dp
  let cameraHeight = (screenWidth + 15) * (16 / 9) - 5;

  const maxCameraHeight = screenHeight - (insets.top + 20) - (insets.bottom + 80);

  if (cameraHeight > maxCameraHeight) {
    cameraHeight = maxCameraHeight;
  }

  // Theme accent color
  const baseAccentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

  // Helper to adjust color brightness (0.75 = 25% increased brightness over 50% dimmed)
  const dimColorBrightness = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    const r = Math.floor(((num >> 16) & 255) * 0.75);
    const g = Math.floor(((num >> 8) & 255) * 0.75);
    const b = Math.floor((num & 255) * 0.75);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const dimmedBorderColor = dimColorBrightness(baseAccentColor);

  const now = new Date();
  const currentTimeStr = `${now.getHours() % 12 || 12}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera permissions to take photos and videos</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
  };

  const handleFlashPress = () => {
    toggleFlash();
    startRecordSequence();
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
    setCountdown(sec);
    let count = sec;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        executeRecording();
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const executeRecording = async () => {
    if (!cameraRef.current || isRecording) return;
    setIsRecording(true);
    progressAnim.setValue(0);

    let durationMs = 2000; // Default 'off' state records 2s video clip

    if (timerMode === '3s') {
      durationMs = 3000; // 3s clip
    } else if (timerMode === '5s') {
      durationMs = 5000; // 5s clip
    } else if (timerMode === 'timelapse') {
      durationMs = 10000; // 10s timelapse clip
    } else if (timerMode === 'jump_cut') {
      durationMs = 3300; // 3.3s jump cut sequence
    }

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: durationMs,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(async () => {
      setIsRecording(false);
      progressAnim.setValue(0);

      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
          if (photo?.uri && onCaptureSuccess) {
            onCaptureSuccess(photo.uri);
          }
        } catch (e) {
          console.error('Camera capture error:', e);
        }
      }
    });
  };

  const fastSpin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const idleSpin = idleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const smileyColor = isRecording ? DANCING_COLORS[colorIndex] : '#00F0FF';
  const shutterSize = 82;
  const centerShutterLeft = (cameraWidth - shutterSize) / 2;

  return (
    <View style={styles.container}>
      {/* 1. EXACT CAMERA VIEWPORT CARD */}
      <View
        style={[
          styles.viewportCardContainer,
          {
            width: cameraWidth,
            height: cameraHeight,
            marginTop: 20,
          },
        ]}
      >
        {/* Border Overlay - Dead-Centered (50% Inside, 50% Outside Camera Frame Edge) */}
        <View
          style={{
            position: 'absolute',
            top: -0.625,
            bottom: -0.625,
            left: -0.625,
            right: -0.625,
            borderRadius: 32,
            borderWidth: 1.25,
            borderColor: dimmedBorderColor,
            opacity: 0.95,
            zIndex: 100,
          }}
          pointerEvents="none"
        />

        {/* Rounded Inner Clip View for Camera Feed */}
        <View style={styles.innerCameraViewClip}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            mode="video"
            flash={flash}
            enableTorch={flash === 'on'}
            zoom={zoomLevel}
          />
        </View>

        {/* ABSOLUTE OVERLAY CONTAINER FOR CAMERA CONTROLS */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* VERTICAL CENTER TIME OVERLAY (HIDDEN DURING COUNTDOWN) */}
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

          {/* RIGHT SIDE FLOATING MODE PILL INDICATOR WITH LIQUID GLASS BLUR & SPECULAR HIGHLIGHT */}
          {showPill && (
            <Animated.View style={[styles.modePillContainer, { opacity: pillOpacity }]} pointerEvents="none">
              <BlurView
                intensity={Platform.OS === 'ios' ? 55 : 80}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.specularBorderHighlight} pointerEvents="none" />
              <Text style={styles.modePillText}>
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

          {/* ZOOM OPTIONS (.5, 1) ROTATED 90 DEG CLOCKWISE */}
          <View style={styles.zoomRowCentered}>
            {[
              { label: '.5', val: 0.02 },
              { label: '1', val: 0.05 },
            ].map((item) => {
              const isSelected = zoomLevel === item.val;
              return (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.8}
                  onPress={() => setZoomLevel(item.val)}
                  style={[styles.zoomPillItem, isSelected && styles.activeZoomPillItem]}
                >
                  <Text style={[styles.zoomText, isSelected && styles.activeZoomText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* FLASH ICON - FILLED SOLID YELLOW INSIDE WITH ZERO OUTSIDE BOX GLOW */}
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

          {/* SMILEY CAPTURE SHUTTER BUTTON */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startRecordSequence}
            style={[styles.shutterWrapperAbsolute, { left: centerShutterLeft }]}
          >
            {/* Concentric Outer Deep Blue Ring (#1B00E2) */}
            <Svg width={82} height={82} style={StyleSheet.absoluteFill}>
              <Circle cx="41" cy="41" r="38.5" stroke="#1B00E2" strokeWidth="4" fill="none" />
            </Svg>

            <Animated.View
              style={[
                styles.smileyInnerCircle,
                { backgroundColor: smileyColor },
                {
                  transform: [
                    {
                      rotate: isRecording ? fastSpin : idleSpin,
                    },
                  ],
                },
              ]}
            >
              <Svg width={46} height={46} viewBox="0 0 24 24">
                <Circle cx="8.5" cy="10" r="1.5" fill="#000000" />
                <Circle cx="15.5" cy="10" r="1.5" fill="#000000" />
                <Path
                  d="M 7.5 14.5 C 9.5 18, 14.5 18, 16.5 14.5"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            </Animated.View>
          </TouchableOpacity>

          {/* RIGHT SIDE VERTICAL UNCLIPPED RECORDING PROGRESS BAR */}
          {isRecording && (
            <View
              style={[
                styles.progressBarGapCentered,
                {
                  width: 5,
                  top: 32, // straight boundary top offset
                  height: cameraHeight - 64, // straight boundary height
                  right: -5.5, // moved left by 0.1dp
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
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
  },
  statusBarRow: {
    position: 'absolute',
    top: 14,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  clockText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centerTimeContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  verticalTimeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.DelaGothicOne,
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ rotate: '90deg' }],
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  countdownContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  countdownText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
    fontSize: 44,
    fontWeight: '700',
    transform: [{ rotate: '90deg' }],
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  modePillContainer: {
    position: 'absolute',
    right: -41,
    top: '45%',
    marginTop: 5,
    width: 140,
    paddingVertical: 9,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    transform: [{ rotate: '90deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  specularBorderHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  modePillText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  zoomRowCentered: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -25,
    flexDirection: 'column',
    gap: 8,
    zIndex: 15,
  },
  zoomPillItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeZoomPillItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    transform: [{ rotate: '90deg' }],
  },
  activeZoomText: {
    color: '#000000',
    fontWeight: '700',
  },
  flashBtnAbsolute: {
    position: 'absolute',
    bottom: 25,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterWrapperAbsolute: {
    position: 'absolute',
    bottom: 6,
    width: 82,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyInnerCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarGapCentered: {
    position: 'absolute',
    borderRadius: 2.5,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    zIndex: 10000,
    elevation: 20,
  },
  progressBarFill: {
    width: '100%',
    borderRadius: 2.5,
  },
});
