import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { Fonts } from '../../constants/typography';

export interface ViewingPalsInstructionModalProps {
  visible: boolean;
  onContinue: () => void;
}

import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export const ViewingPalsInstructionModal: React.FC<ViewingPalsInstructionModalProps> = ({
  visible,
  onContinue,
}) => {
  const colorScheme = useFastColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = useWindowDimensions();

  const bg = isDark ? '#000000' : '#F7F6F3';
  const primaryText = isDark ? '#FFFFFF' : '#000000';
  const secondaryText = '#8E8E93';
  const iconColor = isDark ? '#FFFFFF' : '#000000';

  if (!visible) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}>
      <TouchableOpacity
        style={[styles.container, { backgroundColor: bg }]}
        activeOpacity={1}
        onPress={onContinue}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: primaryText }]}>viewing pals</Text>
            <Text style={[styles.subtitle, { color: secondaryText }]}>
              use gestures to navigate pals
            </Text>
          </View>

          {/* Instructions List */}
          <View style={styles.list}>
            {/* 1. Go Forward */}
            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
                  {/* Tap burst lines */}
                  <Line x1="19" y1="7" x2="19" y2="3" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
                  <Line x1="14" y1="9" x2="11" y2="7" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
                  <Line x1="24" y1="9" x2="27" y2="7" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />

                  {/* Hand tapping right */}
                  <Path
                    d="M 12 28 C 12 28, 11 22, 14 20 C 15.5 19, 17 20, 17 22 L 17 12 C 17 10.8 17.9 10 19 10 C 20.1 10 21 10.8 21 12 L 21 21 M 21 17 C 21 15.9 21.9 15 23 15 C 24.1 15 25 15.9 25 17 L 25 21 M 25 19 C 25 17.9 25.9 17 27 17 C 28.1 17 29 17.9 29 19 L 29 25 C 29 29 25 32 20 32 C 16 32 12 29 12 25 Z"
                    stroke={iconColor}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Vertical bar on the right */}
                  <Line x1="36" y1="12" x2="36" y2="32" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" />
                </Svg>
              </View>
              <View style={styles.textGroup}>
                <Text style={[styles.itemTitle, { color: primaryText }]}>Go forward</Text>
                <Text style={[styles.itemSub, { color: secondaryText }]}>tap the right side</Text>
              </View>
            </View>

            {/* 2. Go Backward */}
            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
                  {/* Vertical bar on the left */}
                  <Line x1="8" y1="12" x2="8" y2="32" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" />

                  {/* Tap burst lines */}
                  <Line x1="25" y1="7" x2="25" y2="3" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
                  <Line x1="20" y1="9" x2="17" y2="7" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
                  <Line x1="30" y1="9" x2="33" y2="7" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />

                  {/* Hand tapping left */}
                  <Path
                    d="M 18 28 C 18 28, 17 22, 20 20 C 21.5 19, 23 20, 23 22 L 23 12 C 23 10.8 23.9 10 25 10 C 26.1 10 27 10.8 27 12 L 27 21 M 27 17 C 27 15.9 27.9 15 29 15 C 30.1 15 31 15.9 31 17 L 31 21 M 31 19 C 31 17.9 31.9 17 33 17 C 34.1 17 35 17.9 35 19 L 35 25 C 35 29 31 32 26 32 C 22 32 18 29 18 25 Z"
                    stroke={iconColor}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.textGroup}>
                <Text style={[styles.itemTitle, { color: primaryText }]}>Go backward</Text>
                <Text style={[styles.itemSub, { color: secondaryText }]}>tap the left side</Text>
              </View>
            </View>

            {/* 3. Switch Days */}
            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
                  {/* Curved Swipe Arc Above */}
                  <Path d="M 10 14 C 16 10, 28 10, 34 14" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" />
                  <Path d="M 31 10 L 35 14 L 31 18" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M 13 10 L 9 14 L 13 18" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Hand gesture */}
                  <Path
                    d="M 14 30 C 14 30, 13 24, 16 22 C 17.5 21, 19 22, 19 24 L 19 18 C 19 16.8 19.9 16 21 16 C 22.1 16 23 16.8 23 18 L 23 23 M 23 20 C 23 18.9 23.9 18 25 18 C 26.1 18 27 18.9 27 20 L 27 23 M 27 21 C 27 19.9 27.9 19 29 19 C 30.1 19 31 19.9 31 21 L 31 27 C 31 31 27 34 22 34 C 18 34 14 31 14 27 Z"
                    stroke={iconColor}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <View style={styles.textGroup}>
                <Text style={[styles.itemTitle, { color: primaryText }]}>Switch days</Text>
                <Text style={[styles.itemSub, { color: secondaryText }]}>swipe left or right</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: primaryText }]}>tap to continue</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontFamily: Fonts.Unpack,
    fontSize: 32,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.SystemRoundedRegular,
    textAlign: 'center',
  },
  list: {
    width: '100%',
    gap: 32,
    marginBottom: 72,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingLeft: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textGroup: {
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: Fonts.SystemRoundedBold,
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 15,
    fontFamily: Fonts.SystemRoundedRegular,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 17,
    fontFamily: Fonts.SystemRoundedBold,
    letterSpacing: 0.3,
  },
});
