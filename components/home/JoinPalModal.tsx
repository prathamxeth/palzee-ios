import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { LiquidGlass } from '../ui/LiquidGlassView';

interface JoinPalModalProps {
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
  const systemScheme = useColorScheme();
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
    setIsSubmitting(true);
    try {
      await onJoin(inputVal.trim());
      onClose();
    } catch (e) {
      setIsSubmitting(false);
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
                {/* 1. TOP FLOATING HEADER CARD (MATCHING REFERENCE IMAGE) */}
                <View
                  style={[
                    styles.topCard,
                    {
                      backgroundColor: isDark ? '#000000' : '#FFFFFF',
                      borderColor: isDark ? '#222224' : '#E5E5EA',
                    },
                  ]}
                >
                  <Text style={[styles.titleText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    join with code
                  </Text>
                  <Text style={[styles.subtitleText, { color: pinkEdgeColor }]}>
                    ask your friends for their pin#
                  </Text>
                </View>

                {/* 2. BOTTOM INPUT CAPSULE CARD (WHITE CAPSULE MATCHING IMAGE) */}
                <View style={styles.inputCapsule}>
                  {/* Left Hash Symbol # */}
                  <Text style={styles.hashSymbol}>#</Text>

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
                          <Text style={styles.typedText}>{inputVal}</Text>
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

                    {/* Black Underline Bar */}
                    <View style={styles.blackUnderlineBar} />

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
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const SystemFont = 'System';

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
  topCard: {
    width: '100%',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
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
  inputCapsule: {
    width: '100%',
    height: 68,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
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
    color: '#000000', // Crisp Black Arrow inside Pink Circle as in screenshot
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: -2,
  },
});
