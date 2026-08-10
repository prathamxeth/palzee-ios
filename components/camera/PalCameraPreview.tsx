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

  // Theme accent color matching selected theme (default cyan #00F0FF)
  const accentColor =
    selectedThemeColor === 'cyan'
      ? '#00F0FF'
      : Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#00F0FF';
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

  // Default mode: upside-down smile (mouth arc top, eyes bottom)
  // 3s timer mode: flipped right-side up smile (mouth arc bottom, eyes top)
  const baseRotateDeg = timerMode === '3s' ? 180 : 0;
  const smileyColor = isRecording ? DANCING_COLORS[colorIndex] : accentColor;

  return (
    <View style={styles.container}>
      {/* 1. EXACT 9:16 CAMERA VIEWPORT CARD WITH THICK BOUNDARY BORDER */}
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

          {/* COMPLETELY TRANSPARENT ZOOM OPTIONS (.5, 1) */}
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

          {/* FLASH & CAPTURE SMILEY BUTTON OVERLAY AT BOTTOM OF VIEWPORT */}
          <View style={styles.shutterOverlayRow}>
            {/* WHITE LIGHTNING BOLT FLASHLIGHT BUTTON */}
            <TouchableOpacity style={styles.flashBtn} activeOpacity={0.8} onPress={toggleFlash}>
              <Svg width={24} height={24} viewBox="0 0 24 24">
                <Path
                  d="M7 2v11h3v9l7-12h-4l4-8z"
                  fill={flash === 'on' || flash === 'auto' ? '#FFD600' : '#FFFFFF'}
                />
              </Svg>
            </TouchableOpacity>

            {/* CAPTURE SMILEY BUTTON WITH EXACT SMILEY VECTOR (2dp GAP FROM BOUNDARY) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startRecordSequence}
              style={styles.shutterWrapper}
            >
              {/* Concentric Outer Deep Blue Ring (#1B00E2) */}
              <Svg width={67} height={67} style={StyleSheet.absoluteFill}>
                <Circle cx="33.5" cy="33.5" r="31.5" stroke="#1B00E2" strokeWidth="3.5" fill="none" />
              </Svg>

              <Animated.View
                style={[
                  styles.smileyInnerCircle,
                  { backgroundColor: smileyColor },
                  {
                    transform: [
                      { rotate: isRecording ? spin : `${baseRotateDeg}deg` },
                    ],
                  },
                ]}
              >
                {/* SVG SMILEY FACE WITH 2dp MARGIN GAP FROM INNER CIRCLE BOUNDARY */}
                <Svg width={51} height={51} viewBox="0 0 51 51">
                  {/* Top Mouth Arc with 2dp distance from top boundary */}
                  <Path
                    d="M 10 17 Q 25.5 3 41 17"
                    stroke="#000000"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Eye Dots with 2dp distance from bottom/side boundary */}
                  <Circle cx="18" cy="32" r="3.2" fill="#000000" />
                  <Circle cx="33" cy="32" r="3.2" fill="#000000" />
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
          {timerMode === 'off' && (
            <Svg width={24} height={24} viewBox="0 -960 960 960">
              <Path
                d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm-99.5 291.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5ZM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82ZM480-440Z"
                fill="#1F1F1F"
              />
            </Svg>
          )}
          {timerMode === '3s' && (
            <Svg width={24} height={24} viewBox="0 -960 960 960">
              <Path
                d="M360-270h160q35 0 57.5-25t22.5-55v-30q0-23-17-41.5T540-440q26 0 43-18.5t17-41.5v-30q0-30-22.5-55T520-610H360v80h160v50H400v80h120v50H360v80Zm0-570v-80h240v80H360Zm-19.5 731.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5ZM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82ZM480-440Z"
                fill="#1F1F1F"
              />
            </Svg>
          )}
          {timerMode === '5s' && (
            <Svg width={24} height={24} viewBox="0 -960 960 960">
              <Path
                d="M360-270h160q33 0 56.5-23.5T600-350v-50q0-33-23.5-56.5T520-480h-80v-50h160v-80H360v210h160v50H360v80Zm0-570v-80h240v80H360Zm-19.5 731.5Q275-137 226-186t-77.5-114.5Q120-366 120-440t28.5-139.5Q177-645 226-694t114.5-77.5Q406-800 480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80q-74 0-139.5-28.5ZM678-242q82-82 82-198t-82-198q-82-82-198-82t-198 82q-82 82-82 198t82 198q82 82 198 82t198-82ZM480-440Z"
                fill="#1F1F1F"
              />
            </Svg>
          )}
          {timerMode === 'timelapse' && (
            <Svg width={24} height={24} viewBox="0 -960 960 960">
              <Path
                d="M480-240q100 0 170-70t70-170q0-100-70-170t-170-70v240L310-310q35 33 78.5 51.5T480-240Zm0 160q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                fill="#1F1F1F"
              />
            </Svg>
          )}
          {timerMode === 'jump_cut' && (
            <Svg width={24} height={24} viewBox="0 -960 960 960">
              <Path
                d="m560-200 160-160-56-56-64 62v-166h-80v166l-64-62-56 56 160 160ZM360-440h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
                fill="#1F1F1F"
              />
            </Svg>
          )}
        </TouchableOpacity>

        {/* RIGHT CAMERA ROTATE BUTTON (SWAP VERTICAL CIRCLE) */}
        <TouchableOpacity style={styles.extControlBtn} activeOpacity={0.8} onPress={toggleFacing}>
          <Svg width={24} height={24} viewBox="0 -960 960 960">
            <Path
              d="m560-200 160-160-56-56-64 62v-166h-80v166l-64-62-56 56 160 160ZM360-440h80v-166l64 62 56-56-160-160-160 160 56 56 64-62v166ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
              fill="#1F1F1F"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    paddingBottom: 16,
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
    aspectRatio: 9 / 16,
    alignSelf: 'center',
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: 10,
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
    bottom: 74,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  zoomDot: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
    bottom: -18,
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
    width: 67,
    height: 67,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileyInnerCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
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
    alignItems: 'center',
    paddingHorizontal: 28,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 18,
  },
  extControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
