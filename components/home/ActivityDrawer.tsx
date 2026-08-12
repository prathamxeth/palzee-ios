import React from 'react';
import {
  Modal,
  Platform,
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
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';

interface ActivityDrawerProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
  selectedThemeColor?: string;
}

export const ActivityDrawer: React.FC<ActivityDrawerProps> = ({
  visible,
  onClose,
  isDark: isDarkProp,
  selectedThemeColor = 'cyan',
}) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : systemScheme === 'dark';

  const screenBg = isDark ? '#121212' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1C1C1E';
  const iconColor = isDark ? '#FFFFFF' : '#1C1C1E';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
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

            <TouchableOpacity
              style={styles.closeButtonPill}
              activeOpacity={0.8}
              onPress={onClose}
            >
              <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
              <Svg width={44} height={44} style={StyleSheet.absoluteFill}>
                <Defs>
                  <LinearGradient id="actCloseBtnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop
                      offset="0%"
                      stopColor={isDark ? '#28282E' : '#FFFFFF'}
                      stopOpacity={isDark ? 0.75 : 0.92}
                    />
                    <Stop
                      offset="50%"
                      stopColor={isDark ? '#18181B' : '#F7F6F3'}
                      stopOpacity={isDark ? 0.6 : 0.80}
                    />
                    <Stop
                      offset="100%"
                      stopColor={isDark ? '#0E0E10' : '#EAE8E3'}
                      stopOpacity={isDark ? 0.85 : 0.70}
                    />
                  </LinearGradient>
                  <LinearGradient id="actCloseBtnBdr" x1="0%" y1="0%" x2="0%" y2="100%">
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
                  fill="url(#actCloseBtnGrad)"
                  stroke="url(#actCloseBtnBdr)"
                  strokeWidth="1.5"
                />
              </Svg>

              <Ionicons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>

          {/* CONTENT BODY AREA */}
          <View style={styles.bodyContainer} />
        </View>
      </DynamicGlowContainer>
    </Modal>
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
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
