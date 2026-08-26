import React from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface DynamicGlowContainerProps {
  selectedThemeColor: string;
  showBorder: boolean;
  showGlow?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export const DynamicGlowContainer: React.FC<DynamicGlowContainerProps> = ({
  selectedThemeColor,
  showBorder = true,
  showGlow = true,
  children,
  style,
}) => {
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const containerBg = isDark ? '#000000' : Colors.PalBackground;

  // 1. Screen edge boundary line remains the theme border color
  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';

  // 2. The insidewards glow effect uses the PALZEE text color
  const innerGlowColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] ||
    accentColor;

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
            shadowColor: showGlow ? innerGlowColor : 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: showGlow ? (isDark ? 0.50 : 0.49) : 0,
            shadowRadius: showGlow ? 9.5 : 0,
            elevation: showGlow ? 9.5 : 0,
          },
          style,
        ]}
      >
        {/* MAIN CONTENT (CAMERA PREVIEW / FEED) */}
        <View style={styles.innerContainer}>
          {children}
        </View>

        {/* 360-DEGREE ISOTROPIC GAUSSIAN BLURRED CORNER & EDGE GLOW OVERLAY */}
        {showBorder && showGlow && (
          <View style={styles.inwardGlowOverlay} pointerEvents="none">
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <Filter id="cornerGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <FeGaussianBlur stdDeviation="3.5" />
                </Filter>
              </Defs>

              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx={48}
                ry={48}
                stroke={innerGlowColor}
                strokeWidth={13.5}
                strokeOpacity={isDark ? 0.38 : 0.34}
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
