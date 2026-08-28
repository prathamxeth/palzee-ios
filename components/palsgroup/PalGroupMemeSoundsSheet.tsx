import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { LiquidGlassPillBackground, LiquidGlassCapsule } from '../ui/LiquidGlassView';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export interface MemeSoundItem {
  id: string;
  name: string;
  sound: string;
}

// Curated top trending Indian & viral meme sounds from MyInstants
const FALLBACK_MEME_SOUNDS: MemeSoundItem[] = [
  { id: '1', name: 'VINE BOOM SOUND', sound: 'https://www.myinstants.com/media/sounds/vine-boom.mp3' },
  { id: '2', name: 'FAHHHHHHHHHHHHHH', sound: 'https://www.myinstants.com/media/sounds/fahhhhhhhhhhhhhh.mp3' },
  { id: '3', name: 'FAAAH', sound: 'https://www.myinstants.com/media/sounds/faaah.mp3' },
  { id: '4', name: 'Aayein Meme', sound: 'https://www.myinstants.com/media/sounds/aayein-meme.mp3' },
  { id: '5', name: 'Ruko jara', sound: 'https://www.myinstants.com/media/sounds/ruko-jara.mp3' },
  { id: '6', name: 'Are baap re yaad aya', sound: 'https://www.myinstants.com/media/sounds/are-baap-re-yaad-aya.mp3' },
  { id: '7', name: 'CID LE MDC', sound: 'https://www.myinstants.com/media/sounds/cid-le-mdc.mp3' },
  { id: '8', name: 'Nahi nahi saluke', sound: 'https://www.myinstants.com/media/sounds/nahi-nahi-saluke-yaha-kuchh-to-gadbad-hai.mp3' },
  { id: '9', name: 'Maa tari oo bhai', sound: 'https://www.myinstants.com/media/sounds/maa-tari-oo-bhai.mp3' },
  { id: '10', name: 'Matlab alag hi level', sound: 'https://www.myinstants.com/media/sounds/matlab-wo-alag-hi-level-ka-banda-tha.mp3' },
  { id: '11', name: 'Chicken screaming', sound: 'https://www.myinstants.com/media/sounds/chicken-on-tree-screaming.mp3' },
  { id: '12', name: 'Anime Wow', sound: 'https://www.myinstants.com/media/sounds/anime-wow.mp3' },
  { id: '13', name: 'Sad Violin Meme', sound: 'https://www.myinstants.com/media/sounds/sad-violin-the-meme-one.mp3' },
  { id: '14', name: 'Among Us Reveal', sound: 'https://www.myinstants.com/media/sounds/among-us-role-reveal-sound.mp3' },
  { id: '15', name: 'Rizz sound effect', sound: 'https://www.myinstants.com/media/sounds/rizz-sound-effect.mp3' },
  { id: '16', name: 'Baby laughing meme', sound: 'https://www.myinstants.com/media/sounds/baby-laughing-meme.mp3' },
  { id: '17', name: 'Slap Hard', sound: 'https://www.myinstants.com/media/sounds/slap-hard.mp3' },
  { id: '18', name: 'Instagram thud', sound: 'https://www.myinstants.com/media/sounds/instagram-thud.mp3' },
  { id: '19', name: 'Fart Sound', sound: 'https://www.myinstants.com/media/sounds/dry-fart.mp3' },
  { id: '20', name: 'Bone Crack', sound: 'https://www.myinstants.com/media/sounds/bone-crack.mp3' },
];

export interface PalGroupMemeSoundsSheetProps {
  visible: boolean;
  onClose: () => void;
  onSendSound: (sound: MemeSoundItem) => void;
  selectedThemeColor?: string;
  isDark?: boolean;
}

export const PalGroupMemeSoundsSheet: React.FC<PalGroupMemeSoundsSheetProps> = ({
  visible,
  onClose,
  onSendSound,
  selectedThemeColor = 'cyan',
  isDark: propIsDark,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const colorScheme = useFastColorScheme();
  const isDark = propIsDark !== undefined ? propIsDark : colorScheme === 'dark';

  const [soundsList, setSoundsList] = useState<MemeSoundItem[]>(FALLBACK_MEME_SOUNDS);
  const [selectedSound, setSelectedSound] = useState<MemeSoundItem | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const soundObjectRef = useRef<Audio.Sound | null>(null);

  const screenBg = isDark ? '#000000' : '#F5F5F7';
  const screenEdgeColor =
    (Colors as any)?.[selectedThemeColor]?.primary || (Colors as any)?.[selectedThemeColor] || '#22D3EE';
  const textColor = isDark ? '#FFFFFF' : '#000000';
  const palzeeTextColor = textColor;

  // Cleanup audio playback on unmount / dismiss
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
        stopCurrentAudio();
    }
  }, [visible]);

  const stopCurrentAudio = async () => {
    try {
      if (soundObjectRef.current) {
        await soundObjectRef.current.stopAsync();
        await soundObjectRef.current.unloadAsync();
        soundObjectRef.current = null;
      }
    } catch (e) {}
    setPlayingId(null);
    setLoadingAudioId(null);
  };

  const handleTogglePlay = async (item: MemeSoundItem) => {
    if (playingId === item.id) {
      await stopCurrentAudio();
      return;
    }

    await stopCurrentAudio();
    setLoadingAudioId(item.id);

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.sound },
        { shouldPlay: true }
      );

      soundObjectRef.current = sound;
      setPlayingId(item.id);
      setLoadingAudioId(null);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
        }
      });
    } catch (err) {
      setPlayingId(null);
      setLoadingAudioId(null);
    }
  };

  const handleSelectSound = (item: MemeSoundItem) => {
    if (selectedSound?.id === item.id) {
      setSelectedSound(null);
    } else {
      setSelectedSound(item);
    }
  };

  const handleSend = () => {
    if (!selectedSound) return;
    stopCurrentAudio();
    onSendSound(selectedSound);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        stopCurrentAudio();
        onClose();
      }}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          justifyContent: 'flex-end',
          paddingHorizontal: 8,
          paddingBottom: Math.max(insets.bottom - 26.5, 0),
        }}
        activeOpacity={1}
        onPress={() => {
          stopCurrentAudio();
          onClose();
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: Math.min(screenHeight * 0.85, 640),
            backgroundColor: isDark ? '#1C1C20' : '#F7F6F3',
            borderRadius: 36,
            borderWidth: 1.2,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.10)',
            paddingTop: 14,
            paddingBottom: 18,
            paddingHorizontal: 0,
            overflow: 'hidden',
          }}
        >
          <BlurView
            key={isDark ? 'dark' : 'light'}
            intensity={60}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />

          {/* Drag Handle */}
          <View
            style={{
              width: 36,
              height: 4.5,
              borderRadius: 2.25,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.25)',
              alignSelf: 'center',
              marginBottom: 10,
            }}
          />

          {/* 1. TOP HEADER (Cross Button + "memes" Title Pill + Send Button) */}
          <View style={styles.headerRow}>
                {/* Top Left Close/Cross Icon Button */}
                <LiquidGlassIconButton
                  idPrefix="btnCloseMemeSheet"
                  isDark={isDark}
                  size={45}
                  onPress={() => {
                    stopCurrentAudio();
                    onClose();
                  }}
                >
                  <Ionicons name="close" size={26} color={textColor} />
                </LiquidGlassIconButton>

                {/* Center "memes" Title Capsule */}
                <View style={styles.titlePillWrapper}>
                  <LiquidGlassCapsule
                    idPrefix="memeHeaderTitle"
                    isDark={isDark}
                    width={110}
                    height={45}
                  >
                    <Text style={[styles.titlePillText, { color: textColor }]}>
                      memes
                    </Text>
                  </LiquidGlassCapsule>
                </View>

                {/* Top Right Send Button (Pure Screen Edge Fill Inside, No Outer Boundary) */}
                <TouchableOpacity
                  style={[
                    styles.headerSendBtn,
                    {
                      overflow: 'hidden',
                    },
                  ]}
                  activeOpacity={selectedSound ? 0.75 : 1}
                  onPress={handleSend}
                  disabled={!selectedSound}
                >
                  <LiquidGlassPillBackground
                    idPrefix="memeSheetSend"
                    isDark={isDark}
                    borderRadius={22.5}
                    backgroundColor={
                      selectedSound
                        ? screenEdgeColor
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.05)'
                    }
                  />
                  <Ionicons
                    name="arrow-up"
                    size={22}
                    color={
                      selectedSound
                        ? '#000000'
                        : screenEdgeColor
                    }
                    style={{ zIndex: 10 }}
                  />
                </TouchableOpacity>
              </View>

              {/* 2. MEMES LIST */}
              <FlatList
                data={soundsList}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, index }) => {
                  const isSelected = selectedSound?.id === item.id;
                  const isPlaying = playingId === item.id;
                  const isLoading = loadingAudioId === item.id;

                  return (
                    <TouchableOpacity
                      activeOpacity={0.82}
                      onPress={() => {
                        handleTogglePlay(item);
                        handleSelectSound(item);
                      }}
                      style={[
                        styles.soundCard,
                        {
                          overflow: 'hidden',
                        },
                      ]}
                    >
                      {/* Profile Dropdown Glow Fill Style + Palzee Text Color Boundary */}
                      {isSelected ? (
                        <View
                          style={{
                            ...StyleSheet.absoluteFillObject,
                            borderRadius: 24,
                            overflow: 'hidden',
                            backgroundColor: isDark ? 'rgba(32, 28, 44, 0.88)' : 'rgba(255, 255, 255, 0.50)',
                          }}
                        >
                          {/* 1. Frosted Backdrop Blur */}
                          <BlurView
                            key={`blur_selected_meme_${index}_${isDark ? 'dark' : 'light'}`}
                            intensity={Platform.OS === 'ios' ? 70 : 50}
                            tint={isDark ? 'dark' : 'light'}
                            style={StyleSheet.absoluteFill}
                          />

                          {/* 2. Inner Diagonal Ambient Theme Glow (Exact Profile Dropdown Formula) */}
                          <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                            <Defs>
                              <LinearGradient
                                id={`memeSelectedDiagGlow_${index}`}
                                x1="100%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <Stop offset="0%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.50 : 0.65} />
                                <Stop offset="40%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.28 : 0.38} />
                                <Stop offset="75%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.10 : 0.16} />
                                <Stop offset="100%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.03 : 0.05} />
                              </LinearGradient>
                            </Defs>
                            <Rect width="100%" height="100%" rx={24} ry={24} fill={`url(#memeSelectedDiagGlow_${index})`} />
                            {/* Single Crisp Palzee Text Color Boundary Stroke (No Double Lining) */}
                            <Rect
                              x="1"
                              y="1"
                              width="99.2%"
                              height="96.5%"
                              rx={23}
                              ry={23}
                              fill="none"
                              stroke={palzeeTextColor}
                              strokeWidth={1.5}
                            />
                          </Svg>
                        </View>
                      ) : (
                        <LiquidGlassPillBackground
                          idPrefix={`meme_item_${item.id}`}
                          isDark={isDark}
                          borderRadius={24}
                          backgroundColor={isDark ? 'transparent' : 'rgba(255, 255, 255, 0.12)'}
                        />
                      )}

                      {/* Left Play/Pause Button */}
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleTogglePlay(item)}
                        style={[
                          styles.playBtn,
                          {
                            backgroundColor: isPlaying
                              ? screenEdgeColor
                              : isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(0, 0, 0, 0.06)',
                            zIndex: 10,
                          },
                        ]}
                      >
                        {isLoading ? (
                          <ActivityIndicator size="small" color={isPlaying ? '#000000' : textColor} />
                        ) : (
                          <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={18}
                            color={isPlaying ? '#000000' : textColor}
                            style={{ marginLeft: isPlaying ? 0 : 2 }}
                          />
                        )}
                      </TouchableOpacity>

                      {/* Center Meme Title */}
                      <Text
                        style={[
                          styles.soundTitle,
                          {
                            color: isSelected
                              ? isDark
                                ? '#FFFFFF'
                                : '#000000'
                              : textColor,
                            zIndex: 10,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      {/* Right Selection Radio Circle */}
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected
                              ? palzeeTextColor
                              : isDark
                              ? 'rgba(255, 255, 255, 0.25)'
                              : 'rgba(0, 0, 0, 0.18)',
                            backgroundColor: isSelected ? screenEdgeColor : 'transparent',
                            zIndex: 10,
                          },
                        ]}
                      >
                        {isSelected && <Ionicons name="checkmark" size={14} color="#000000" />}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.40)',
    },
    sheetContainer: {
      width: '100%',
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      borderTopWidth: 1.5,
      borderLeftWidth: 1.5,
      borderRightWidth: 1.5,
      overflow: 'hidden',
      paddingTop: 16,
    },
    headerRow: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      marginBottom: 8,
      backgroundColor: 'transparent',
    },
    titlePillWrapper: {
      alignItems: 'center',
    },
    titlePillText: {
      fontSize: 22,
      fontFamily: Fonts.SystemRoundedBold,
    },
    headerSendBtn: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      paddingHorizontal: 15,
      paddingTop: 4,
      paddingBottom: 16,
      gap: 10,
    },
  soundCard: {
    height: 56,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  soundTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: Fonts.SystemRoundedBold,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
