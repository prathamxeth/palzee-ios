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
  const [zoomSlot, setZoomSlot] = useState<number>(2); // Default '1' selected
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

  // Smooth continuous free rotation of smiley button with zero lag or stopping
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
    return () => loopAnim.stop();
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

  const sideMargin = 8.875;
  let cameraWidth = screenWidth - sideMargin * 2; // Increased width by 0.25dp
  let cameraHeight = (screenWidth + 15) * (16 / 9) - 5;

  const maxCameraHeight = screenHeight - (insets.top + 20) - (insets.bottom + 80);

  if (cameraHeight > maxCameraHeight) {
    cameraHeight = maxCameraHeight;
  }

  // Theme accent color with brightness reduced by 25%
  const baseAccentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

  // Helper to reduce color brightness by 50%
  const dimColorBrightness = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex, 16);
    const r = Math.floor(((num >> 16) & 255) * 0.5);
    const g = Math.floor(((num >> 8) & 255) * 0.5);
    const b = Math.floor((num & 255) * 0.5);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const dimmedBorderColor = dimColorBrightness(baseAccentColor);

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
    setFlash((current) => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
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
    setIsRecording(true);
    progressAnim.setValue(0);

    let duration = 2000; // Default 'off' state records exact 2s clip

    if (timerMode === '3s') {
      duration = 3000; // 3s clip after 3s countdown
    } else if (timerMode === '5s') {
      duration = 5000; // 5s clip after 5s countdown
    } else if (timerMode === 'timelapse') {
      duration = 10000; // 10s timelapse clip
    } else if (timerMode === 'jump_cut') {
      duration = 3300; // 3.3s jump cut burst sequence
    }

    Animated.timing(progressAnim, {
      toValue: 1,
      duration,
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
      {/* 1. EXACT CAMERA VIEWPORT CARD WITH 50% REDUCED BORDER BRIGHTNESS */}
      <View
        style={[
          styles.viewportCardContainer,
          {
            width: cameraWidth,
            height: cameraHeight,
            borderColor: dimmedBorderColor,
            borderWidth: 1.5,
            marginTop: 20,
          },
        ]}
      >
        {/* Border Overlay with 50% Reduced Color Brightness */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: 32,
              borderWidth: 1.5,
              borderColor: dimmedBorderColor,
              opacity: 0.75,
            },
          ]}
          pointerEvents="none"
        />

        {/* Rounded Inner Clip View for Camera Feed */}
        <View style={styles.innerCameraViewClip}>
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing={facing}
            flash={flash}
            zoom={zoomLevel}
          />
        </View>

        {/* ABSOLUTE OVERLAY CONTAINER */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* VERTICAL CENTER TIME OVERLAY */}
          <View style={styles.centerTimeContainer} pointerEvents="none">
            <Text style={styles.verticalTimeText}>{timeText}</Text>
          </View>

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
              { slot: 1, label: '.5', zoom: 0 },
              { slot: 2, label: '1', zoom: 0.05 },
            ].map((item) => {
              const isSelected = zoomSlot === item.slot;
              return (
                <TouchableOpacity
                  key={item.slot}
                  activeOpacity={0.8}
                  style={styles.zoomDot}
                  onPress={() => {
                    setZoomSlot(item.slot);
                    setZoomLevel(item.zoom);
                  }}
                >
                  <Text style={[styles.zoomText, isSelected && styles.activeZoomText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* EXACT UNMODIFIED PNG FLASH ICON */}
          <TouchableOpacity
            style={[styles.flashBtnAbsolute, { left: centerShutterLeft - 63 }]}
            activeOpacity={0.8}
            onPress={toggleFlash}
          >
            <Image
              source={require('../../assets/images/custom_flash_icon.png')}
              style={{
                width: 35.5,
                height: 35.5,
                transform: [{ rotate: '90deg' }],
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
                    { rotate: isRecording ? fastSpin : idleSpin },
                  ],
                },
              ]}
            >
              {/* CAPTURE_SMILE.PNG ASSET */}
              <Image
                source={require('../../assets/images/capture_smile.png')}
                style={styles.captureSmileAsset}
                resizeMode="contain"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* CYLINDRICAL PROGRESS BAR PERFECTLY CENTERED IN THE GAP BETWEEN CAMERA BORDER AND SCREEN EDGE */}
        {isRecording && (
          <View
            style={[
              styles.progressBarGapCentered,
              {
                width: 5,
                top: 32, // straight boundary top offset
                height: cameraHeight - 64, // straight boundary height
                right: -7, // dead-centered in the 9dp gap between camera border (0) and screen edge!
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 0,
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
    backgroundColor: Colors.PalFireRed,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  viewportCardContainer: {
    alignSelf: 'center',
    borderRadius: 32,
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'visible',
  },
  innerCameraViewClip: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 31,
    overflow: 'hidden',
  },
  centerTimeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  countdownText: {
    color: '#FFFFFF',
    fontFamily: Fonts.DelaGothicOne,
    fontSize: 72,
    fontWeight: 'bold',
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
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textAlign: 'center',
  },
  zoomRowCentered: {
    position: 'absolute',
    bottom: 132,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    backgroundColor: 'transparent',
  },
  zoomDot: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '500',
    transform: [{ rotate: '90deg' }],
  },
  activeZoomText: {
    color: '#FFD600',
    fontWeight: '500',
  },
  flashBtnAbsolute: {
    position: 'absolute',
    bottom: 54,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterWrapperAbsolute: {
    position: 'absolute',
    bottom: 34,
    width: 82,
    height: 82,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyInnerCircle: {
    width: 68.5,
    height: 68.5,
    borderRadius: 34.25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureSmileAsset: {
    width: 63,
    height: 63,
    transform: [{ scale: 1.12 }],
  },
  progressBarGapCentered: {
    position: 'absolute',
    borderRadius: 2.5,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    borderRadius: 2.5,
  },
});
