import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import Svg, { Circle, Path } from 'react-native-svg';
import { SymbolView } from 'expo-symbols';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';

const DANCING_COLORS = ['#11D5F3', '#65EA7B', '#FE9068', '#FE75F5', '#AA6DFE', '#5D96FF'];

type TimerMode = 'off' | '3s' | '5s' | 'timelapse' | 'jump_cut';

interface PalCameraPreviewProps {
  selectedThemeColor?: string;
  onCaptureSuccess?: (uri: string) => void;
  onClose?: () => void;
}

export default function PalCameraPreview({
  selectedThemeColor = 'cyan',
  onCaptureSuccess,
  onClose,
}: PalCameraPreviewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [timerMode, setTimerMode] = useState<TimerMode>('off');
  const [zoomLevel, setZoomLevel] = useState<number>(0);
  const [zoomSlot, setZoomSlot] = useState<number>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const cameraRef = useRef<any>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
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

  // Theme accent color matching selected theme
  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

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

  // Continuous rotation during recording
  useEffect(() => {
    if (isRecording) {
      rotationAnim.setValue(0);
      Animated.loop(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotationAnim.stopAnimation();
      rotationAnim.setValue(0);
    }
  }, [isRecording]);

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

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
  };

  const toggleTimerMode = () => {
    setTimerMode((current) => {
      if (current === 'off') return '3s';
      if (current === '3s') return '5s';
      if (current === '5s') return 'timelapse';
      if (current === 'timelapse') return 'jump_cut';
      return 'off';
    });
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

  const spin = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const baseRotate = timerMode === '3s' ? '180deg' : '0deg';
  const smileyColor = isRecording ? DANCING_COLORS[colorIndex] : accentColor;

  return (
    <View style={styles.container}>
      {/* 1. CAMERA VIEWPORT CARD WITH THICK BOUNDARY BORDER */}
      <View style={[styles.viewportCard, { borderColor: accentColor }]}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          flash={flash}
          zoom={zoomLevel}
        >
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

          {/* ZOOM SLOTS SELECTOR (.5, 1) */}
          <View style={styles.zoomRow}>
            {[
              { slot: 1, label: '.5', zoom: 0 },
              { slot: 2, label: '1', zoom: 0.2 },
            ].map((item) => {
              const isSelected = zoomSlot === item.slot;
              return (
                <TouchableOpacity
                  key={item.slot}
                  activeOpacity={0.8}
                  style={[styles.zoomDot, isSelected && styles.activeZoomDot]}
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

          {/* FLASH & CAPTURE SMILEY BUTTON OVERLAY AT BOTTOM OF VIEWPORT */}
          <View style={styles.shutterOverlayRow}>
            {/* FLASH LIGHT BUTTON */}
            <TouchableOpacity style={styles.flashBtn} activeOpacity={0.8} onPress={toggleFlash}>
              <SymbolView
                name="bolt.fill"
                size={22}
                tintColor={flash === 'on' || flash === 'auto' ? '#FFD600' : '#FFFFFF'}
              />
            </TouchableOpacity>

            {/* CAPTURE SMILEY BUTTON WITH OUTER CONCENTRIC STROKE RING */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startRecordSequence}
              style={styles.shutterWrapper}
            >
              <Svg width={72} height={72} style={StyleSheet.absoluteFill}>
                <Circle cx="36" cy="36" r="33" stroke="#1B00E2" strokeWidth="4" fill="none" />
              </Svg>

              <Animated.View
                style={[
                  styles.smileyInnerCircle,
                  { backgroundColor: smileyColor },
                  { transform: [{ rotate: isRecording ? spin : baseRotate }] },
                ]}
              >
                {/* SMILEY FACE SVG */}
                <Svg width={38} height={38} viewBox="0 0 38 38">
                  {/* Eyes */}
                  <Circle cx="12" cy="14" r="3" fill="#000000" />
                  <Circle cx="26" cy="14" r="3" fill="#000000" />
                  {/* Smile Arc */}
                  <Path
                    d="M 10 23 Q 19 32 28 23"
                    stroke="#000000"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </Svg>
              </Animated.View>
            </TouchableOpacity>

            <View style={{ width: 44 }} />
          </View>
        </CameraView>

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

      {/* 2. EXTERNAL BOTTOM CONTROLS (TIMER SWITCH, TAB SWITCHER, CAMERA ROTATE) */}
      <View style={styles.externalControlsRow}>
        {/* LEFT TIMER MODE SWITCH BUTTON */}
        <TouchableOpacity style={styles.extControlBtn} activeOpacity={0.8} onPress={toggleTimerMode}>
          {timerMode === 'off' && <Text style={styles.extControlText}>↻</Text>}
          {timerMode === '3s' && <Text style={styles.extControlBadge}>3</Text>}
          {timerMode === '5s' && <Text style={styles.extControlBadge}>5</Text>}
          {timerMode === 'timelapse' && <SymbolView name="rays" size={22} tintColor="#000000" />}
          {timerMode === 'jump_cut' && <SymbolView name="scissors" size={20} tintColor="#000000" />}
        </TouchableOpacity>

        {/* RIGHT CAMERA ROTATE BUTTON */}
        <TouchableOpacity style={styles.extControlBtn} activeOpacity={0.8} onPress={toggleFacing}>
          <SymbolView name="arrow.clockwise.circle" size={24} tintColor="#000000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    flex: 1,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 32,
    borderWidth: 3,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
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
  zoomRow: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  zoomDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeZoomDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    transform: [{ rotate: '-90deg' }],
  },
  activeZoomText: {
    color: '#FFD600',
  },
  shutterOverlayRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  flashBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '-90deg' }],
  },
  shutterWrapper: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
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
  externalControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
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
  extControlText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  extControlBadge: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
});
