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
      <View
        style={[
          styles.outerContainer,
          { backgroundColor: containerBg },
          showBorder && {
            borderColor: accentColor,
            borderWidth: 3,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.9,
            shadowRadius: 10,
            elevation: 12,
          },
          style,
        ]}
      >
        <View style={[styles.innerContainer, { backgroundColor: containerBg }]}>
          {children}

          {/* SCREEN-WIDE INWARD EDGE GLOW FROM ALL 4 BEZEL BOUNDARIES */}
          {showBorder && (
            <View style={styles.inwardGlowOverlay} pointerEvents="none">
              <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                  {/* Top-to-Bottom Edge Inward Glow */}
                  <LinearGradient id="screenTopGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                    <Stop offset="1%" stopColor={accentColor} stopOpacity="0.05" />
                    <Stop offset="1.8%" stopColor={accentColor} stopOpacity="0" />
                  </LinearGradient>

                  {/* Bottom-to-Top Edge Inward Glow */}
                  <LinearGradient id="screenBottomGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                    <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                    <Stop offset="1%" stopColor={accentColor} stopOpacity="0.05" />
                    <Stop offset="1.8%" stopColor={accentColor} stopOpacity="0" />
                  </LinearGradient>

                  {/* Left-to-Right Edge Inward Glow */}
                  <LinearGradient id="screenLeftGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                    <Stop offset="2%" stopColor={accentColor} stopOpacity="0.05" />
                    <Stop offset="3.8%" stopColor={accentColor} stopOpacity="0" />
                  </LinearGradient>

                  {/* Right-to-Left Edge Inward Glow */}
                  <LinearGradient id="screenRightGlow" x1="100%" y1="0%" x2="0%" y2="0%">
                    <Stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                    <Stop offset="2%" stopColor={accentColor} stopOpacity="0.05" />
                    <Stop offset="3.8%" stopColor={accentColor} stopOpacity="0" />
                  </LinearGradient>
                </Defs>

                {/* 4 Inward Directional Edge Glow Rectangles */}
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#screenTopGlow)" />
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#screenBottomGlow)" />
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#screenLeftGlow)" />
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#screenRightGlow)" />
              </Svg>
            </View>
          )}
        </View>
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
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 44,
    overflow: 'hidden',
    position: 'relative',
  },
  inwardGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 44,
    overflow: 'hidden',
    zIndex: 999,
  },
});
