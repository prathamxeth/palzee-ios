import React from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
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
            borderWidth: 2.5,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.82,
            shadowRadius: 8.25,
            elevation: 11,
          },
          style,
        ]}
      >
        {/* MAIN CONTENT (CAMERA PREVIEW / FEED) */}
        <View style={styles.innerContainer}>
          {children}
        </View>

        {/* SOFT VIBRANT INWARD GLOW OVERLAY ON TOP OF CONTENT (POINTER-EVENTS: NONE) */}
        {showBorder && (
          <View style={styles.inwardGlowOverlay} pointerEvents="none">
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id="softInwardTop" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                  <Stop offset="0.5%" stopColor={accentColor} stopOpacity="0.05" />
                  <Stop offset="1.2%" stopColor={accentColor} stopOpacity="0" />
                </LinearGradient>

                <LinearGradient id="softInwardBottom" x1="0%" y1="100%" x2="0%" y2="0%">
                  <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                  <Stop offset="0.5%" stopColor={accentColor} stopOpacity="0.05" />
                  <Stop offset="1.2%" stopColor={accentColor} stopOpacity="0" />
                </LinearGradient>

                <LinearGradient id="softInwardLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                  <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                  <Stop offset="0.8%" stopColor={accentColor} stopOpacity="0.05" />
                  <Stop offset="2.0%" stopColor={accentColor} stopOpacity="0" />
                </LinearGradient>

                <LinearGradient id="softInwardRight" x1="100%" y1="0%" x2="0%" y2="0%">
                  <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                  <Stop offset="0.8%" stopColor={accentColor} stopOpacity="0.05" />
                  <Stop offset="2.0%" stopColor={accentColor} stopOpacity="0" />
                </LinearGradient>
              </Defs>

              <Rect x="0" y="0" width="100%" height="100%" fill="url(#softInwardTop)" />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#softInwardBottom)" />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#softInwardLeft)" />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#softInwardRight)" />
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
  },
  innerContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 48,
    overflow: 'hidden',
    position: 'relative',
  },
  inwardGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    overflow: 'hidden',
    zIndex: 9999,
  },
});
