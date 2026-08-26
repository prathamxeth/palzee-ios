import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Share,
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
import { JoinPalModal } from './JoinPalModal';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

interface CreatePalModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (groupName: string, maxCount: number) => Promise<{ code: string; name: string } | void>;
  onJoin: (code: string) => Promise<void>;
  themeColor?: string;
  initialTab?: 'create' | 'join';
}

type Step = 'FORM' | 'CREATING' | 'SUCCESS';
type PalSizeKey = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

export const CreatePalModal: React.FC<CreatePalModalProps> = ({
  visible,
  onClose,
  onCreate,
  onJoin,
  themeColor = 'blue',
  initialTab = 'create',
}) => {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'create' | 'join'>(initialTab);
  const [inputVal, setInputVal] = useState('');
  const [sizeKey, setSizeKey] = useState<PalSizeKey>('3');
  const [step, setStep] = useState<Step>('FORM');
  const [dots, setDots] = useState('');
  const [createdCode, setCreatedCode] = useState('');
  const [createdName, setCreatedName] = useState('');

  const accentColor =
    Colors.BorderGlow[themeColor as keyof typeof Colors.BorderGlow] || '#11D5F3';
  const logoTextColor =
    Colors.LogoTextAccent[themeColor as keyof typeof Colors.LogoTextAccent] || '#310BED';

  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setCursorVisible(true);
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (visible) {
      setStep('FORM');
      setInputVal('');
      setSizeKey('3');
      setCreatedCode('');
      setCreatedName('');
      setTab(initialTab);
    }
  }, [visible, initialTab]);

  // Animated dots for CREATING step: "" -> "." -> ".." -> "..."
  useEffect(() => {
    if (step !== 'CREATING') return;
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        if (prev === '..') return '...';
        if (prev === '.') return '..';
        return '.';
      });
    }, 380);
    return () => clearInterval(interval);
  }, [step]);

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

  const getMaxCount = () => {
    return parseInt(sizeKey, 10) || 3;
  };

  const generateRandomCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async () => {
    if (!inputVal.trim()) return;
    const trimmedName = inputVal.trim();
    setStep('CREATING');

    try {
      let finalCode = '';
      if (tab === 'create') {
        const res = await onCreate(trimmedName, getMaxCount());
        finalCode = res && res.code ? res.code : generateRandomCode();
      } else {
        await onJoin(trimmedName);
        finalCode = generateRandomCode();
      }
      setCreatedName(trimmedName);
      setCreatedCode(finalCode);
      // Small graceful buffer so creating animation feels smooth
      setTimeout(() => {
        setStep('SUCCESS');
      }, 700);
    } catch (e) {
      setStep('FORM');
    }
  };

  const handleInviteFriend = async () => {
    if (!createdCode) return;
    const shareMessage = `Join my Pal group "${createdName}"!\ncode : ${createdCode}`;

    try {
      await Share.share({
        title: `Join ${createdName} on Palzee`,
        message: shareMessage,
      });
    } catch (error) {
      console.warn('Error sharing pal invite:', error);
    }
  };

  const handleDoneSuccess = () => {
    setStep('FORM');
    onClose();
  };

  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const modalBg = isDark ? '#000000' : Colors.PalBackground;
  const textColor = isDark ? '#FFFFFF' : Colors.PalTextDark;

  if (tab === 'join') {
    return (
      <JoinPalModal
        visible={visible}
        onClose={onClose}
        onJoin={onJoin}
        themeColor={themeColor}
        onSwitchToCreate={() => setTab('create')}
      />
    );
  }

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, backgroundColor: modalBg }]}>
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
          {step === 'FORM' ? (
            <TouchableOpacity style={styles.closeBtn} activeOpacity={0.7} onPress={onClose}>
              <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <Svg width={44} height={44} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="closeBtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
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
                  <LinearGradient id="closeBtnBdr" x1="0%" y1="0%" x2="0%" y2="100%">
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
                  width="42.5"
                  height="42.5"
                  rx="21.25"
                  fill="url(#closeBtnGrad)"
                  stroke="url(#closeBtnBdr)"
                  strokeWidth={1.5}
                />
              </Svg>
              <Text style={[styles.closeIcon, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>✕</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.btnPlaceholder} />
          )}

          <Text style={[styles.palzeeLogo, { color: logoTextColor }]}>PALZEE</Text>

          {step === 'FORM' ? (
            <TouchableOpacity
              style={[
                styles.checkBtn,
                { backgroundColor: accentColor },
                !inputVal.trim() && styles.disabledCheckBtn,
              ]}
              activeOpacity={0.7}
              onPress={handleSubmit}
              disabled={!inputVal.trim()}
            >
              <Text style={styles.checkIcon}>✓</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.btnPlaceholder} />
          )}
        </View>

        {/* STEP 1: FORM */}
        {step === 'FORM' && (
          <View style={styles.body}>
            {/* Section Title: → create a pal */}
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              → create a pal
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
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.sizePill,
                        { borderColor: isDark ? '#444448' : '#C7C6C0' },
                        isActive && { backgroundColor: accentColor, borderColor: accentColor },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSizeKey(key)}
                    >
                      <Text
                        style={[
                          styles.sizePillText,
                          { color: textColor },
                          isActive && styles.activeSizePillText,
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
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.sizePill,
                        { borderColor: isDark ? '#444448' : '#C7C6C0' },
                        isActive && { backgroundColor: accentColor, borderColor: accentColor },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => setSizeKey(key)}
                    >
                      <Text
                        style={[
                          styles.sizePillText,
                          { color: textColor },
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
        )}

        {/* STEP 2: CREATING PROGRESS */}
        {step === 'CREATING' && (
          <View style={styles.creatingContainer}>
            <Text style={[styles.creatingText, { color: textColor }]}>
              creating pal{dots}
            </Text>
          </View>
        )}

        {/* STEP 3: SUCCESS (GROUP NAME, CODE, INVITE A FRIEND, DONE) */}
        {step === 'SUCCESS' && (
          <View style={styles.successContainer}>
            {/* 1. Group Name */}
            <View style={styles.successItemRow}>
              <Text style={[styles.successItemText, { color: textColor }]}>
                {createdName || 'Pal'} :)
              </Text>
            </View>

            {/* 2. Group Code */}
            <View style={styles.successItemRow}>
              <Text style={[styles.successItemText, { color: textColor }]}>
                # {createdCode}
              </Text>
            </View>

            {/* 3. Invite a Friend */}
            <TouchableOpacity
              style={styles.successItemRow}
              activeOpacity={0.7}
              onPress={handleInviteFriend}
            >
              <Text style={[styles.successItemText, styles.underlineText, { color: textColor }]}>
                invite a friend →
              </Text>
            </TouchableOpacity>

            {/* 4. Done */}
            <TouchableOpacity
              style={styles.successItemRow}
              activeOpacity={0.7}
              onPress={handleDoneSuccess}
            >
              <Text style={[styles.successItemText, styles.underlineText, { color: textColor }]}>
                done →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
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
  sizePill: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#444448',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  sizePillWide: {
    minWidth: 64,
    paddingHorizontal: 14,
  },
  sizePillText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  activeSizePillText: {
    color: '#000000',
    fontWeight: '700',
  },
  subtextDescription: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 6,
    marginBottom: 16,
  },
  creatingContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  creatingText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    lineHeight: 28,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  successContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  successItemRow: {
    marginBottom: 24,
  },
  successItemText: {
    fontFamily: Fonts.IBMPlexMono,
    fontSize: 18,
    lineHeight: 26,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});
