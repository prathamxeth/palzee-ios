import React from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface DynamicGlowContainerProps {
  selectedThemeColor: string;
  showBorder: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DynamicGlowContainer: React.FC<DynamicGlowContainerProps> = ({
  selectedThemeColor,
  showBorder = true,
  children,
  style,
}) => {
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const containerBg = isDark ? '#000000' : Colors.PalBackground;

  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';

  return (
    <View style={[styles.wrapper, { backgroundColor: containerBg }]}>
      {/* 1. ONE SINGLE UNIFIED SCREEN EDGE COLOUR BOUNDARY LINE */}
      <View
        style={[
          styles.outerContainer,
          { backgroundColor: containerBg },
          showBorder && {
            borderColor: accentColor,
            borderWidth: 3.5,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: isDark ? 0.54 : 0.71,
            shadowRadius: 10.0, // Area & radius strictly preserved
            elevation: 10,
          },
          style,
        ]}
      >
        {/* MAIN CONTENT (CAMERA PREVIEW / FEED) */}
        <View style={styles.innerContainer}>
          {children}
        </View>

        {/* 360-DEGREE ISOTROPIC GAUSSIAN BLURRED CORNER & EDGE GLOW OVERLAY */}
        {showBorder && (
          <View style={styles.inwardGlowOverlay} pointerEvents="none">
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <Filter id="cornerGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <FeGaussianBlur stdDeviation="6" />
                </Filter>
              </Defs>

              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx={48}
                ry={48}
                stroke={accentColor}
                strokeWidth={14}
                strokeOpacity={isDark ? 0.19 : 0.49}
                fill="none"
                filter="url(#cornerGlowBlur)"
              />
            </Svg>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  outerContainer: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
    margin: -0.25,
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 48,
    overflow: 'hidden',
    position: 'relative',
  },
  inwardGlowOverlay: {
    position: 'absolute',
    top: -1.10,
    bottom: -1.10,
    left: -1.10,
    right: -1.10,
    borderRadius: 48,
    overflow: 'hidden',
    zIndex: 9999,
  },
});
