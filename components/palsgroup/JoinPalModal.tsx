import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export interface JoinPalModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
  themeColor?: string;
  onSwitchToCreate?: () => void;
}

export const JoinPalModal: React.FC<JoinPalModalProps> = ({
  visible,
  onClose,
  onJoin,
  themeColor = 'pink',
}) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';

  // Screen Edge Pink Accent Color (Exact match to device border glow in screenshot)
  const pinkEdgeColor =
    Colors.BorderGlow[themeColor as keyof typeof Colors.BorderGlow] || '#FE75F5';

  const [inputVal, setInputVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setInputVal('');
    setIsSubmitting(false);
    setCursorVisible(true);
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [visible]);

  const handleSubmit = async () => {
    if (!inputVal.trim() || isSubmitting) return;
    const cleanCode = inputVal.trim().replace(/^#\s*/, '').toLowerCase();
    if (!cleanCode) return;
    setIsSubmitting(true);
    try {
      await onJoin(cleanCode);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.keyboardContainer}
          >
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={[styles.dialogWrapper, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
                {/* 1. TOP FLOATING HEADER CARD */}
                <View style={styles.topCardWrapper}>
                  <View
                    style={[
                      styles.topCardInner,
                      {
                        backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                      },
                    ]}
                  >
                    <BlurView
                      key={`blur_join_top_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 45 : 30}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                      <Defs>
                        <LinearGradient id="joinTopRim" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                          <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0.75"
                        y="0.75"
                        width="99.5%"
                        height="98.5%"
                        rx="23.25"
                        ry="23.25"
                        fill="none"
                        stroke="url(#joinTopRim)"
                        strokeWidth={1.2}
                      />
                    </Svg>
                  </View>
                  <View style={styles.topCardContent}>
                    <Text style={[styles.titleText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      join with code
                    </Text>
                    <Text style={[styles.subtitleText, { color: pinkEdgeColor }]}>
                      ask your friends for their pin#
                    </Text>
                  </View>
                </View>

                {/* 2. BOTTOM INPUT CAPSULE CARD */}
                <View style={styles.inputCapsuleWrapper}>
                  <View
                    style={[
                      styles.inputCapsuleInner,
                      {
                        backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                      },
                    ]}
                  >
                    <BlurView
                      key={`blur_join_input_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 45 : 30}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                      <Defs>
                        <LinearGradient id="joinInputRim" x1="0%" y1="0%" x2="0%" y2="100%">
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
                          <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0.75"
                        y="0.75"
                        width="99.5%"
                        height="98.5%"
                        rx="27.25"
                        ry="27.25"
                        fill="none"
                        stroke="url(#joinInputRim)"
                        strokeWidth={1.2}
                      />
                    </Svg>
                  </View>

                  <View style={styles.inputCapsuleContent}>
                    {/* Left Hash Symbol # */}
                    <Text style={[styles.hashSymbol, { color: isDark ? '#FFFFFF' : '#000000' }]}>#</Text>

                    {/* Middle Text Area with Black Underline & Blinking Pink Cursor */}
                    <View style={styles.inputCenterArea}>
                      <View style={styles.textRowContainer}>
                        {inputVal.length === 0 ? (
                          <View style={styles.placeholderRow}>
                            <Text
                              style={[
                                styles.blinkingCursor,
                                { color: pinkEdgeColor, opacity: cursorVisible ? 1 : 0 },
                              ]}
                            >
                              |
                            </Text>
                            <Text style={styles.placeholderText}>abc123</Text>
                          </View>
                        ) : (
                          <View style={styles.typedRow}>
                            <Text style={[styles.typedText, { color: isDark ? '#FFFFFF' : '#000000' }]}>{inputVal}</Text>
                            <Text
                              style={[
                                styles.blinkingCursor,
                                { color: pinkEdgeColor, opacity: cursorVisible ? 1 : 0, marginLeft: 1 },
                              ]}
                            >
                              |
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Underline Bar */}
                      <View style={[styles.blackUnderlineBar, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]} />

                      {/* Hidden Native TextInput with AutoFocus */}
                      <TextInput
                        style={styles.invisibleInput}
                        value={inputVal}
                        onChangeText={setInputVal}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus={true}
                        caretHidden={true}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="join"
                      />
                    </View>

                    {/* Right Circular Pink Arrow Button (Black arrow inside) */}
                    <TouchableOpacity
                      style={[
                        styles.arrowCircleBtn,
                        { backgroundColor: pinkEdgeColor },
                        !inputVal.trim() && styles.arrowDisabledOpacity,
                      ]}
                      activeOpacity={0.8}
                      onPress={handleSubmit}
                      disabled={!inputVal.trim() || isSubmitting}
                    >
                      <Text style={styles.arrowIconText}>→</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const SystemFont = Fonts.SystemRounded;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  dialogWrapper: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: 14,
  },
  topCardWrapper: {
    width: '100%',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  topCardInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  topCardContent: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 10,
  },
  titleText: {
    fontFamily: SystemFont,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: 'left',
  },
  subtitleText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.2,
    textAlign: 'left',
  },
  inputCapsuleWrapper: {
    width: '100%',
    height: 68,
    borderRadius: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  inputCapsuleInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    overflow: 'hidden',
  },
  inputCapsuleContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  hashSymbol: {
    fontSize: 26,
    fontWeight: '400',
    color: '#000000',
    marginRight: 12,
  },
  inputCenterArea: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
    marginRight: 14,
  },
  textRowContainer: {
    height: 30,
    justifyContent: 'center',
  },
  placeholderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blinkingCursor: {
    fontSize: 24,
    fontWeight: '300',
    marginRight: 1,
    marginTop: -2,
  },
  placeholderText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 22,
    color: '#D1D1D6',
  },
  typedText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 22,
    color: '#000000',
    letterSpacing: 0.5,
  },
  blackUnderlineBar: {
    height: 2,
    backgroundColor: '#000000',
    width: '100%',
    marginTop: 2,
  },
  invisibleInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0,
    color: 'transparent',
  },
  arrowCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabledOpacity: {
    opacity: 0.5,
  },
  arrowIconText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
