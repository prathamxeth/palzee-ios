import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  LogBox,
  Animated,
  Easing,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';

const shouldSuppressExpoAv = (...args: any[]) => {
  try {
    const fullMsg = args
      .map((a) => (typeof a === 'string' ? a : JSON.stringify(a || '')))
      .join(' ');
    return (
      fullMsg.includes('expo-av') ||
      fullMsg.includes('expo-video') ||
      fullMsg.includes('Video component') ||
      fullMsg.includes('deprecated in favor of')
    );
  } catch (e) {
    return false;
  }
};

const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (shouldSuppressExpoAv(...args)) return;
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args: any[]) => {
  if (shouldSuppressExpoAv(...args)) return;
  originalError(...args);
};

const originalLog = console.log;
console.log = (...args: any[]) => {
  if (shouldSuppressExpoAv(...args)) return;
  originalLog(...args);
};

const originalInfo = console.info;
console.info = (...args: any[]) => {
  if (shouldSuppressExpoAv(...args)) return;
  originalInfo(...args);
};

LogBox.ignoreLogs([
  '[expo-av]',
  'Expo AV has been deprecated',
  'Video component from `expo-av` is deprecated',
  'expo-av',
  'expo-video',
  'deprecated in favor of `expo-video`',
  'SDK 54',
]);

interface PalVideoSendPreviewModalProps {
  visible: boolean;
  videoUri: string | null;
  timeText: string;
  selectedThemeColor?: string;
  isVerticalCapture?: boolean;
  onRetake: () => void;
  onSend: (uri: string, caption?: string) => void;
}

const LiquidGlassCircleButton = ({
  onPress,
  children,
  idPrefix = 'circle',
  isDark = false,
  size = 44,
}: {
  onPress: () => void;
  children: React.ReactNode;
  idPrefix?: string;
  isDark?: boolean;
  size?: number;
}) => (
  <TouchableOpacity
    style={[styles.liquidCircleBtn, { width: size, height: size, borderRadius: size / 2 }]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
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
        width={size - 1.5}
        height={size - 1.5}
        rx={(size - 1.5) / 2}
        fill={`url(#${idPrefix}Grad)`}
        stroke={`url(#${idPrefix}Bdr)`}
        strokeWidth="1.5"
      />
    </Svg>
    {children}
  </TouchableOpacity>
);

export default function PalVideoSendPreviewModal({
  visible,
  videoUri,
  timeText,
  selectedThemeColor = 'cyan',
  isVerticalCapture = true,
  onRetake,
  onSend,
}: PalVideoSendPreviewModalProps) {
  const { width: screenWidth } = useWindowDimensions();
  const [isMuted, setIsMuted] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [isVertical, setIsVertical] = useState(isVerticalCapture);
  const textInputRef = useRef<TextInput>(null);
  const videoPlayerRef = useRef<Video>(null);
  const slideAnim = useRef(new Animated.Value(screenWidth * 0.85)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setIsVertical(isVerticalCapture);
  }, [isVerticalCapture, videoUri]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (visible && videoUri) {
      const timer = setTimeout(() => {
        videoPlayerRef.current?.playAsync().catch(() => {});
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, videoUri]);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(screenWidth * 0.85);
      scaleAnim.setValue(0.96);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.bezier(0.16, 1, 0.3, 1), // Apple native iOS bezier curve
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        textInputRef.current?.focus();
      });
    } else {
      setCaptionText('');
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth * 0.85,
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRetake();
    });
  };

  const handleSend = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth * 0.85,
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 280,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (videoUri) {
        onSend(videoUri, captionText);
      }
    });
  };

  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const containerBg = isDark ? '#000000' : Colors.PalBackground;
  const titleColor = isDark ? '#FFFFFF' : '#000000';
  const iconColor = isDark ? '#FFFFFF' : '#000000';
  const sendToColor = isDark ? '#9E9EA5' : '#707070';

  if (!visible || !videoUri) return null;

  const baseAccentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#11D5F3';

  // 16:9 Aspect Ratio Card Frame Dimensions
  const cardWidth = screenWidth - 20.0;
  const cardHeight = cardWidth * (9 / 16);

  // Exact 90° Rotated Dimensions for Vertical Captures to Fill 16:9 Frame
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

  const horizontalStyle = {
    ...StyleSheet.absoluteFillObject,
    transform: [],
  };
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      supportedOrientations={['portrait']}
      onRequestClose={handleClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={false}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim, transform: [{ translateX: slideAnim }, { scale: scaleAnim }] }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContainer, { backgroundColor: containerBg }]}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={{ flex: 1, paddingHorizontal: 10.0, paddingTop: 50, paddingBottom: 20 }}>
                {/* 1. HEADER ROW: HOMESCREEN EXACT LIQUID GLASS CLOSE (X) & ARROW UP (↑) */}
                <View style={styles.headerRow}>
                  {/* Exact Home Screen Liquid Glass Close Button (X) */}
                  <LiquidGlassCircleButton onPress={handleClose} idPrefix="closeBtn" isDark={isDark}>
                    <Ionicons name="close" size={24} color={iconColor} />
                  </LiquidGlassCircleButton>

                  {/* Title Text "send" */}
                  <Text style={[styles.headerTitle, { color: titleColor }]}>send</Text>

                  {/* Exact Home Screen Liquid Glass Send Arrow Button (↑) */}
                  <LiquidGlassCircleButton onPress={handleSend} idPrefix="sendBtn" isDark={isDark}>
                    <Ionicons name="arrow-up" size={24} color={iconColor} />
                  </LiquidGlassCircleButton>
                </View>

                {/* 2. 16:9 HORIZONTAL VIDEO CARD BOX */}
                <View style={styles.videoCardWrapper}>
                  <View
                    style={[
                      styles.videoCardContainer,
                      {
                        width: cardWidth,
                        height: cardHeight,
                      },
                    ]}
                  >
                    {/* Dynamic Video Player: Rotates 270° for Vertical Captures; Unrotated for Horizontal Captures */}
                    {visible && !!videoUri && (
                      <Video
                        key={videoUri}
                        ref={videoPlayerRef}
                        source={{ uri: videoUri }}
                        style={isVertical ? rotatedStyle : horizontalStyle}
                        shouldPlay={true}
                        isLooping={true}
                        isMuted={isMuted}
                        useNativeControls={false}
                        resizeMode={ResizeMode.COVER}
                        onReadyForDisplay={(event) => {
                          videoPlayerRef.current?.playAsync().catch(() => {});
                          if (event?.naturalSize) {
                            const { width, height } = event.naturalSize;
                            setIsVertical(height > width);
                          }
                        }}
                      />
                    )}

                    {/* CENTER TIME TEXT + BLINKING CURSOR CAPTION INPUT DIRECTLY BELOW TIME TEXT */}
                    <View style={styles.centerTimeAndCaptionContainer}>
                      <Text style={styles.timeTextHorizontal}>{timeText}</Text>
                      <TextInput
                        ref={textInputRef}
                        style={styles.captionInputBelowTime}
                        value={captionText}
                        onChangeText={setCaptionText}
                        placeholder=""
                        selectionColor={baseAccentColor}
                        cursorColor={baseAccentColor}
                        multiline={false}
                        autoFocus={false}
                      />
                    </View>

                    {/* Bottom Left SOLID BOLD Volume Icon */}
                    <TouchableOpacity
                      style={styles.videoOverlayIconLeft}
                      activeOpacity={0.8}
                      onPress={() => setIsMuted(!isMuted)}
                    >
                      <Ionicons
                        name={isMuted ? 'volume-mute' : 'volume-high'}
                        size={24}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>

                    {/* Bottom Right Download / Save Icon */}
                    <TouchableOpacity style={styles.videoOverlayIconRight} activeOpacity={0.8}>
                      <Ionicons name="download-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 3. CLEAN "send to:" SUBTITLE (NO INPUT OR CURSOR BELOW "send to:", ONLY BELOW TIME TEXT) */}
                <View style={styles.captionSection}>
                  <Text style={[styles.sendToLabel, { color: sendToColor }]}>send to:</Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Animated.View>
      </DynamicGlowContainer>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  liquidCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  liquidGlassHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  specularBorderHighlightHeader: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  videoCardWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  videoCardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
  },
  centerTimeAndCaptionContainer: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  timeTextHorizontal: {
    color: '#FFFFFF',
    fontFamily: Fonts.DelaGothicOne,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  captionInputBelowTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    minWidth: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  videoOverlayIconLeft: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    zIndex: 15,
  },
  videoOverlayIconRight: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    zIndex: 15,
  },
  captionSection: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  sendToLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#909090',
  },
});
