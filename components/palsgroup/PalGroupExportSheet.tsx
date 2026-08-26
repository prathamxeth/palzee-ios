import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
  Share,
  NativeModules,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system/legacy';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';
import { LiquidGlassIconButton } from '../ui';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export interface PalGroupExportSheetProps {
  visible: boolean;
  onClose: () => void;
  vlogList?: Array<{ id: string; uri: string; thumbnailUri?: string; caption?: string; timestamp: string; isMuted?: boolean; rate?: number; mode?: string }>;
  selectedThemeColor?: string;
  onDeleteVideo?: (id?: string) => void;
  onUpdateCaption?: (newCaption: string, id?: string) => void;
  selectedDayOffset?: number;
}

export const PalGroupExportSheet: React.FC<PalGroupExportSheetProps> = ({
  visible,
  onClose,
  vlogList = [],
  selectedThemeColor = 'cyan',
  onDeleteVideo,
  onUpdateCaption,
  selectedDayOffset = 0,
}) => {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth > 0 ? windowWidth : 390;
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  const cardWidth = screenWidth - 28;
  const cardHeight = Math.round(cardWidth * (9.5 / 16) + 15);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.fullScreenContainer,
          {
            backgroundColor: isDark ? '#000000' : '#F5F5F7',
            paddingTop: Math.max(insets.top + 4, 12),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <LiquidGlassIconButton
            idPrefix="palExportBackBtn"
            isDark={isDark}
            size={45}
            onPress={onClose}
          >
            <Ionicons name="chevron-back" size={30} color={isDark ? '#FFFFFF' : '#000000'} style={{ marginLeft: -1.5 }} />
          </LiquidGlassIconButton>

          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            export
          </Text>

          <View style={{ width: 45 }} />
        </View>

        {/* Center Content Placeholder */}
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#636366' }]}>
            0 pals to export
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.SystemRoundedBold,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedSemibold,
  },
});
