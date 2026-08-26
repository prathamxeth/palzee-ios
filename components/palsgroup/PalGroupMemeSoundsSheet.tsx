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
  selectedThemeColor = 'orange',
  isDark: isDarkProp,
}) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useFastColorScheme();
  const isDark = isDarkProp ?? (systemScheme === 'dark');
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Screen edge boundary and inner fill glow color
  const screenEdgeColor =
    (Colors?.BorderGlow as any)?.[selectedThemeColor] || '#FE9068';
  // Palzee text color for the pill boundary ring
  const palzeeTextColor =
    (Colors?.LogoTextAccent as any)?.[selectedThemeColor] || screenEdgeColor;

  const textColor = isDark ? '#FFFFFF' : '#000000';
  const screenBg = isDark ? '#000000' : '#F5F5F7';

  const [soundsList, setSoundsList] = useState<MemeSoundItem[]>(FALLBACK_MEME_SOUNDS);
  const [selectedSound, setSelectedSound] = useState<MemeSoundItem | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const soundObjectRef = useRef<Audio.Sound | null>(null);

  // Fetch online trending meme sounds from MyInstants API
  useEffect(() => {
    let isMounted = true;
    const fetchSounds = async () => {
      try {
        const res = await fetch('https://www.myinstants.com/api/v1/instants/?format=json');
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.results && Array.isArray(data.results) && data.results.length > 0) {
          const formatted: MemeSoundItem[] = data.results.map((item: any, idx: number) => ({
            id: item.slug || `api_${idx}`,
            name: item.name,
            sound: item.sound?.startsWith('http') ? item.sound : `https://www.myinstants.com${item.sound}`,
          }));
          if (isMounted) {
            const combined = [...FALLBACK_MEME_SOUNDS];
            formatted.forEach((f) => {
              if (!combined.some((c) => c.name.toLowerCase() === f.name.toLowerCase())) {
                combined.push(f);
              }
            });
            setSoundsList(combined);
          }
        }
      } catch (err) {
        // Fallback list remains active
      }
    };

    fetchSounds();
    return () => {
      isMounted = false;
    };
  }, []);

  // Cleanup audio playback on unmount / dismiss
  useEffect(() => {
    return () => {
      stopCurrentAudio();
    };
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
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        stopCurrentAudio();
        onClose();
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: screenBg,
            paddingTop: Math.max(insets.top + 4, 14),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
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

          {/* Top Right Send Button (Liquid Glass + Selected Accent Fill) */}
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
                  : isDark
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(0, 0, 0, 0.25)'
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
                onPress={() => handleSelectSound(item)}
                style={[
                  styles.soundCard,
                  {
                    overflow: 'hidden',
                  },
                ]}
              >
                {/* Screen edge color fill inside + Palzee text color on boundary + Apple liquid glass */}
                {isSelected ? (
                  <View
                    style={{
                      ...StyleSheet.absoluteFillObject,
                      borderRadius: 28,
                      overflow: 'hidden',
                      backgroundColor: isDark ? 'rgba(32, 28, 44, 0.92)' : 'rgba(255, 255, 255, 0.96)',
                    }}
                  >
                    {/* 1. Frosted Backdrop Blur */}
                    <BlurView
                      key={`blur_selected_meme_${index}_${isDark ? 'dark' : 'light'}`}
                      intensity={Platform.OS === 'ios' ? 65 : 45}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />

                    {/* 2. Screen Edge Colour Fill Inside the Pill (Cleanly Clipped with rx={28}) */}
                    <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                      <Defs>
                        <LinearGradient
                          id={`memeSelectedDiagGlow_${index}`}
                          x1="100%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <Stop offset="0%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.50 : 0.40} />
                          <Stop offset="40%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.28 : 0.22} />
                          <Stop offset="75%" stopColor={screenEdgeColor} stopOpacity={isDark ? 0.10 : 0.08} />
                          <Stop offset="100%" stopColor={screenEdgeColor} stopOpacity={0.02} />
                        </LinearGradient>
                        <LinearGradient
                          id={`memeSelectedRim_${index}`}
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.55 : 0.85} />
                          <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.20 : 0.40} />
                          <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
                        </LinearGradient>
                      </Defs>
                      <Rect width="100%" height="100%" rx={28} ry={28} fill={`url(#memeSelectedDiagGlow_${index})`} />
                      {/* Crisp Palzee Text Color Boundary Stroke */}
                      <Rect
                        x="1"
                        y="1"
                        width="99.4%"
                        height="96.5%"
                        rx={27}
                        ry={27}
                        fill="none"
                        stroke={palzeeTextColor}
                        strokeWidth={2}
                      />
                      {/* Specular Highlight Rim */}
                      <Rect
                        x="1"
                        y="1"
                        width="99.4%"
                        height="96.5%"
                        rx={27}
                        ry={27}
                        fill="none"
                        stroke={`url(#memeSelectedRim_${index})`}
                        strokeWidth={1.2}
                      />
                    </Svg>
                  </View>
                ) : (
                  <LiquidGlassPillBackground
                    idPrefix={`meme_sound_${index}`}
                    isDark={isDark}
                    borderRadius={28}
                  />
                )}

                {/* Left Play/Pause Button */}
                <TouchableOpacity
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
                  activeOpacity={0.75}
                  onPress={() => handleTogglePlay(item)}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={isDark ? '#FFFFFF' : '#000000'} />
                  ) : (
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={18}
                      color={isPlaying ? '#000000' : isDark ? '#FFFFFF' : '#000000'}
                      style={{ marginLeft: isPlaying ? 0 : 2 }}
                    />
                  )}
                </TouchableOpacity>

                {/* Center Sound Title */}
                <Text
                  style={[
                    styles.soundTitle,
                    {
                      color: textColor,
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  titlePillWrapper: {
    alignItems: 'center',
  },
  titlePill: {
    width: 110,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
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
