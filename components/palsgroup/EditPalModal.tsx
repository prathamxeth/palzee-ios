import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';
import { LiquidGlassIconButton } from '../ui';

interface EditPalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newName: string, newSize: number) => Promise<void> | void;
  initialName: string;
  initialSize: number;
  minSize?: number;
  themeColor?: string;
}

type PalSizeKey = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

export const EditPalModal: React.FC<EditPalModalProps> = ({
  visible,
  onClose,
  onSave,
  initialName,
  initialSize,
  minSize = 2,
  themeColor = 'cyan',
}) => {
  const insets = useSafeAreaInsets();
  const [inputVal, setInputVal] = useState(initialName || '');
  const [sizeKey, setSizeKey] = useState<PalSizeKey>(
    (String(Math.min(Math.max(initialSize || 3, 2), 10)) as PalSizeKey) || '3'
  );
  const [cursorVisible, setCursorVisible] = useState(true);

  const accentColor =
    Colors.BorderGlow[themeColor as keyof typeof Colors.BorderGlow] || '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[themeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

  useEffect(() => {
    if (!visible) return;
    setInputVal(initialName || '');
    const clampedSize = Math.min(Math.max(initialSize || 3, 2), 10);
    setSizeKey(String(clampedSize) as PalSizeKey);
  }, [visible, initialName, initialSize]);

  useEffect(() => {
    if (!visible) return;
    setCursorVisible(true);
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [visible]);

  const getSubtext = () => {
    switch (sizeKey) {
      case '2':
        return '1 friend';
      case '3':
        return '2 friends';
      case '4':
        return '3 friends';
      case '5':
        return '4 friends';
      case '6':
        return '5 friends';
      case '7':
        return '6 friends';
      case '8':
        return '7 friends';
      case '9':
        return '8 friends';
      case '10':
        return 'Invite up to 10 friends.';
      default:
        return '2 friends';
    }
  };

  const handleSave = async () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const finalSize = parseInt(sizeKey, 10) || 3;
    await onSave(trimmed, finalSize);
    onClose();
  };

  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const modalBg = isDark ? '#000000' : Colors.PalBackground;
  const textColor = isDark ? '#FFFFFF' : Colors.PalTextDark;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={[StyleSheet.absoluteFill, { zIndex: 99999, backgroundColor: modalBg }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: modalBg,
              paddingTop: Math.max(insets.top, 20) + 8,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
          ]}
        >
          {/* HEADER: CLOSE (✕) | PALZEE LOGO | SUBMIT (✓) */}
          <View style={styles.headerRow}>
            <LiquidGlassIconButton
              idPrefix="btnEditClose"
              isDark={isDark}
              size={44}
              onPress={onClose}
            >
              <Text style={[styles.closeIcon, { color: isDark ? '#FFFFFF' : '#000000', fontSize: 20 }]}>✕</Text>
            </LiquidGlassIconButton>

            <Text style={[styles.palzeeLogo, { color: logoTextColor }]}>PALZEE</Text>

            <LiquidGlassIconButton
              idPrefix="btnEditCheck"
              isDark={isDark}
              size={44}
              onPress={handleSave}
              disabled={!inputVal.trim()}
            >
              <Text
                style={[
                  styles.checkIcon,
                  {
                    color: !inputVal.trim()
                      ? (isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)')
                      : accentColor,
                    fontSize: 24,
                    fontWeight: 'bold',
                  },
                ]}
              >
                ✓
              </Text>
            </LiquidGlassIconButton>
          </View>

          {/* EDIT FORM BODY (EXACT CLONE OF CREATE PAL MODAL WITH 'edit pal') */}
          <View style={styles.body}>
            {/* Section Title: → edit pal */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              → edit pal
            </Text>

            {/* Pal Name Input Row with Dynamic Blinking Cursor */}
            <View style={styles.inputRow}>
              <View style={styles.inlineTextRow} pointerEvents="none">
                {inputVal.length === 0 ? (
                  <>
                    <Text
                      style={[
                        styles.cursorBlock,
                        { color: accentColor, opacity: cursorVisible ? 1 : 0 },
                      ]}
                    >
                      █
                    </Text>
                    <Text style={styles.placeholderText}>
                      pal name
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.typedText, { color: textColor }]}>
                      {inputVal}
                    </Text>
                    <Text
                      style={[
                        styles.cursorBlock,
                        { color: accentColor, opacity: cursorVisible ? 1 : 0, marginLeft: 2 },
                      ]}
                    >
                      █
                    </Text>
                  </>
                )}
              </View>
              <TextInput
                style={styles.invisibleInput}
                value={inputVal}
                onChangeText={setInputVal}
                autoCapitalize="words"
                autoFocus
                caretHidden={true}
              />
            </View>

            {/* Pal Size Section */}
            <View style={styles.sizeSection}>
              <Text style={[styles.sizeLabel, { color: textColor }]}>
                pal size
              </Text>

              {/* Size Row 1 (Upper Row): 2, 3, 4, 5 */}
              <View style={styles.sizeRow}>
                {(['2', '3', '4', '5'] as const).map((key) => {
                  const isActive = sizeKey === key;
                  const numKey = parseInt(key, 10);
                  const isBelowMin = numKey < minSize;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.sizePillWrapper,
                        isBelowMin && { opacity: 0.35 },
                        isActive && {
                          shadowColor: accentColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.35,
                          shadowRadius: 8,
                          elevation: 4,
                        },
                      ]}
                      activeOpacity={0.8}
                      disabled={isBelowMin}
                      onPress={() => setSizeKey(key)}
                    >
                      <View
                        style={[
                          styles.sizePillInner,
                          {
                            backgroundColor: isActive
                              ? accentColor
                              : (isDark ? 'rgba(30, 30, 34, 0.65)' : 'rgba(255, 255, 255, 0.72)'),
                          },
                        ]}
                      >
                        <BlurView
                          key={`blur_size_${key}_${isDark ? 'dark' : 'systemMaterialLight'}`}
                          intensity={Platform.OS === 'ios' ? 35 : 25}
                          tint={isDark ? 'dark' : 'systemMaterialLight'}
                          style={StyleSheet.absoluteFill}
                        />
                        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                          <Defs>
                            <LinearGradient id={`editSizeRim_${key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isActive ? 0.90 : (isDark ? 0.45 : 0.85)} />
                              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isActive ? 0.30 : (isDark ? 0.05 : 0.08)} />
                            </LinearGradient>
                          </Defs>
                          <Rect
                            x="0.75"
                            y="0.75"
                            width="98.5%"
                            height="98.5%"
                            rx={13.25}
                            ry={13.25}
                            fill="none"
                            stroke={`url(#editSizeRim_${key})`}
                            strokeWidth={1.2}
                          />
                        </Svg>
                      </View>
                      <Text
                        style={[
                          styles.sizePillText,
                          { color: isActive ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#000000') },
                        ]}
                      >
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Size Row 2 (Below Row): 6, 7, 8, 9, 10 */}
              <View style={styles.sizeRow}>
                {(['6', '7', '8', '9', '10'] as const).map((key) => {
                  const isActive = sizeKey === key;
                  const numKey = parseInt(key, 10);
                  const isBelowMin = numKey < minSize;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.sizePillWrapper,
                        isBelowMin && { opacity: 0.35 },
                        isActive && {
                          shadowColor: accentColor,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.35,
                          shadowRadius: 8,
                          elevation: 4,
                        },
                      ]}
                      activeOpacity={0.8}
                      disabled={isBelowMin}
                      onPress={() => setSizeKey(key)}
                    >
                      <View
                        style={[
                          styles.sizePillInner,
                          {
                            backgroundColor: isActive
                              ? accentColor
                              : (isDark ? 'rgba(30, 30, 34, 0.65)' : 'rgba(255, 255, 255, 0.35)'),
                          },
                        ]}
                      >
                        <BlurView
                          key={`blur_size_${key}_${isDark ? 'dark' : 'systemMaterialLight'}`}
                          intensity={Platform.OS === 'ios' ? 35 : 25}
                          tint={isDark ? 'dark' : 'systemMaterialLight'}
                          style={StyleSheet.absoluteFill}
                        />
                        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
                          <Defs>
                            <LinearGradient id={`editSizeRim_${key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isActive ? 0.90 : (isDark ? 0.45 : 0.85)} />
                              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isActive ? 0.30 : (isDark ? 0.05 : 0.08)} />
                            </LinearGradient>
                          </Defs>
                          <Rect
                            x="0.75"
                            y="0.75"
                            width="97%"
                            height="95%"
                            rx="11.25"
                            ry="11.25"
                            fill="none"
                            stroke={`url(#editSizeRim_${key})`}
                            strokeWidth={1.2}
                          />
                        </Svg>
                      </View>
                      <Text
                        style={[
                          styles.sizePillText,
                          { color: isActive ? '#000000' : textColor },
                          isActive && styles.activeSizePillText,
                        ]}
                      >
                        {key}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subtext description (e.g. 2 friends) */}
              <Text style={[styles.subtextDescription, { color: textColor }]}>
                {getSubtext()}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPlaceholder: {
    width: 44,
    height: 44,
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
  palzeeLogo: {
    fontFamily: Fonts.Unpack,
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledCheckBtn: {
    opacity: 0.4,
  },
  checkIcon: {
    color: '#000000',
    fontSize: 26,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: '500',
  },
  inputRow: {
    marginBottom: 20,
    paddingLeft: 6,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  inlineTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursorBlock: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 20,
    marginRight: 0,
  },
  placeholderText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    color: '#8E8E93',
  },
  typedText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    color: '#FFFFFF',
  },
  invisibleInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0,
    color: 'transparent',
  },
  sizeSection: {
    marginBottom: 12,
  },
  sizeLabel: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
    fontWeight: '500',
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  sizePillWrapper: {
    height: 36,
    minWidth: 42,
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
  },
  sizePillInner: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sizePillText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
    zIndex: 10,
  },
  activeSizePillText: {
    color: '#000000',
    fontWeight: '700',
    zIndex: 10,
  },
  subtextDescription: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 16,
  },
});
