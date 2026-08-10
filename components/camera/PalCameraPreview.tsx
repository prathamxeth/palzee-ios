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

  // Smooth free rotation of smiley button when idle
  useEffect(() => {
    Animated.loop(
      Animated.timing(idleRotateAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

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

  const sideMargin = 9;
  let cameraWidth = screenWidth - sideMargin * 2;
  let cameraHeight = (screenWidth + 15) * (16 / 9) - 5;

  const maxCameraHeight = screenHeight - (insets.top + 20) - (insets.bottom + 80);

  if (cameraHeight > maxCameraHeight) {
    cameraHeight = maxCameraHeight;
  }

  // Theme accent color matching exact screen outer edge color
  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

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

    const duration =
      timerMode === '3s' ? 3000 : timerMode === '5s' ? 5000 : timerMode === 'timelapse' ? 10000 : 2500;

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
    outputRange: ['180deg', '540deg'],
  });

  const smileyColor = isRecording ? DANCING_COLORS[colorIndex] : '#00F0FF';

  return (
    <View style={styles.container}>
      {/* 1. EXACT CAMERA VIEWPORT CARD */}
      <View
        style={[
          styles.viewportCard,
          {
            width: cameraWidth,
            height: cameraHeight,
            borderColor: accentColor,
            marginTop: 20,
          },
        ]}
      >
        {/* Self-closing CameraView with native lens zoom scaling */}
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          zoom={zoomLevel}
        />

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

          {/* RIGHT SIDE FLOATING MODE PILL INDICATOR */}
          {timerMode !== 'off' && (
            <View style={styles.modePillContainer} pointerEvents="none">
              <Text style={styles.modePillText}>
                {timerMode === '3s'
                  ? '3 second timer'
                  : timerMode === '5s'
                  ? '5 second timer'
                  : timerMode === 'timelapse'
                  ? 'timelapse'
                  : 'jump cut'}
              </Text>
            </View>
          )}

          {/* ZOOM OPTIONS (.5, 1) ROTATED -90 DEG */}
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

          {/* SHUTTER & FLASH ROW CENTERED HORIZONTALLY */}
          <View style={styles.shutterOverlayRowCentered}>
            {/* FLASH ICON ROTATED 90 DEGREES CLOCKWISE, WHITE FILLED, INCREASED BY 2.5DP */}
            <TouchableOpacity style={styles.flashBtn} activeOpacity={0.8} onPress={toggleFlash}>
              <Image
                source={require('../../assets/images/custom_flash_icon.png')}
                style={{
                  width: 30.5,
                  height: 30.5,
                  tintColor: flash === 'on' || flash === 'auto' ? '#FFD600' : '#FFFFFF',
                  transform: [{ rotate: '90deg' }],
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* FREELY ROTATING SMILEY CAPTURE SHUTTER BUTTON EXACTLY CENTERED */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startRecordSequence}
              style={styles.shutterWrapper}
            >
              {/* Concentric Outer Deep Blue Ring (#1B00E2) */}
              <Svg width={80} height={80} style={StyleSheet.absoluteFill}>
                <Circle cx="40" cy="40" r="37.5" stroke="#1B00E2" strokeWidth="4.5" fill="none" />
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
                {/* EXACT capture_smile.png IMAGE ASSET */}
                <Image
                  source={require('../../assets/images/capture_smile.png')}
                  style={styles.captureSmileAsset}
                  resizeMode="contain"
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* SCREEN-EDGE ANCHORED VERTICAL PROGRESS BAR */}
          {isRecording && (
            <View style={styles.progressBarWrapper} pointerEvents="none">
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
  viewportCard: {
    alignSelf: 'center',
    borderRadius: 32,
    borderWidth: 1.5,
    position: 'relative',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  centerTimeContainer: {
    ...StyleSheet.absoluteFillObject,
    justify.content: 'center',
    alignItems: 'center',
  },
  verticalTimeText: {
    color: '#FFFFFF',
    fontFamily: Fonts.DelaGothicOne,
    fontSize: 24,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
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
    right: 12,
    top: '40%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    transform: [{ rotate: '-90deg' }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modePillText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  zoomRowCentered: {
    position: 'absolute',
    bottom: 142,
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
    fontSize: 15.5,
    fontWeight: '700',
    transform: [{ rotate: '-90deg' }],
  },
  activeZoomText: {
    color: '#FFD600',
    fontWeight: '800',
  },
  shutterOverlayRowCentered: {
    position: 'absolute',
    bottom: 44,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  flashBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justify.content: 'center',
    alignItems: 'center',
  },
  shutterWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyInnerCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureSmileAsset: {
    width: 44,
    height: 44,
  },
  progressBarWrapper: {
    position: 'absolute',
    right: 2,
    top: 24,
    bottom: 24,
    width: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    borderRadius: 2,
  },
});
