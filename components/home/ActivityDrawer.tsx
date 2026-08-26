import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassIconButton } from '../ui';
import { Fonts } from '../../constants/typography';
import { Colors } from '../../constants/colors';

interface ActivityDrawerProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
  selectedThemeColor?: string;
}

import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  visible,
  onClose,
  isDark: isDarkProp,
  selectedThemeColor = 'cyan',
}) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';

  const screenBg = isDark ? '#000000' : Colors.PalBackground;
  const textColor = isDark ? '#FFFFFF' : Colors.PalTextDark;
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 9999, backgroundColor: screenBg }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: screenBg,
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* TOP HEADER BAR: CENTERED "activity" TITLE + RIGHT CIRCULAR GLASS PILL CLOSE CROSS ICON */}
          <View style={styles.headerRow}>
            <Text style={[styles.headerTitle, { color: textColor }]}>
              activity
            </Text>

            <View style={{ position: 'absolute', right: 16 }}>
              <LiquidGlassIconButton idPrefix="btnActClose" isDark={isDark} size={44} onPress={onClose}>
                <Ionicons name="close" size={26} color={iconColor} />
              </LiquidGlassIconButton>
            </View>
          </View>

          {/* CONTENT BODY AREA */}
          <View style={styles.bodyContainer} />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: Fonts.SystemRoundedBold,
    textAlign: 'center',
  },
  closeButtonPill: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyContainer: {
    flex: 1,
  },
});
