import React from 'react';
import { StyleSheet, View, ViewStyle, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Filter, FeGaussianBlur, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

interface DynamicGlowContainerProps {
  selectedThemeColor: string;
  showBorder: boolean;
  showGlow?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DynamicGlowContainer: React.FC<DynamicGlowContainerProps> = ({
  selectedThemeColor,
  showBorder = true,
  showGlow = true,
  children,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const systemScheme = useFastColorScheme();
  const isDark = systemScheme === 'dark';
  const containerBg = isDark ? '#000000' : Colors.PalBackground;

  // Dynamically compute precise hardware bezel corner radius for any iPhone/iOS device
  const deviceCornerRadius =
    Platform.OS === 'ios'
      ? insets.top >= 59
        ? 56
        : insets.top >= 50
        ? 53.5
        : insets.top >= 44
        ? 47.33
        : insets.top >= 40
        ? 39
        : insets.top > 20
        ? 39
        : 0
      : 32;

  // 1. Screen edge boundary line remains the theme border color
  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';

  // 2. The insidewards glow effect uses the PALZEE text color
  const innerGlowColor =
    Colors.LogoTextAccent[selectedThemeColor as keyof typeof Colors.LogoTextAccent] ||
    accentColor;

  const borderWidth = 3.5;
  const halfBorder = borderWidth / 2;
  const glowStrokeWidth = 8.5;
  const halfGlow = glowStrokeWidth / 2;

  return (
    <View style={[styles.wrapper, { backgroundColor: containerBg }]}>
      {/* MAIN CONTENT LAYER */}
      <View style={[styles.contentContainer, style]}>
        {children}
      </View>

      {/* 360-DEGREE SCREEN EDGE BOUNDARY & INWARD GLOW (0.00dp spacing from screen edge) */}
      {showBorder && screenWidth > 0 && screenHeight > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFill}>
            <Defs>
              <Filter id="cornerGlowBlur" x="-30%" y="-30%" width="160%" height="160%">
                <FeGaussianBlur stdDeviation="2.8" />
              </Filter>
            </Defs>

            {/* 1. INWARD AMBIENT ISOTROPIC GLOW (Starts exactly from outer screen edge) */}
            {showGlow && (
              <Rect
                x={halfGlow}
                y={halfGlow}
                width={screenWidth - glowStrokeWidth}
                height={screenHeight - glowStrokeWidth}
                rx={Math.max(0, deviceCornerRadius - halfGlow)}
                ry={Math.max(0, deviceCornerRadius - halfGlow)}
                stroke={innerGlowColor}
                strokeWidth={glowStrokeWidth}
                strokeOpacity={isDark ? 0.45 : 0.40}
                fill="none"
                filter="url(#cornerGlowBlur)"
              />
            )}

            {/* 2. EXACT SCREEN EDGE BOUNDARY OUTLINE (0.00dp spacing from screen corners) */}
            <Rect
              x={halfBorder}
              y={halfBorder}
              width={screenWidth - borderWidth}
              height={screenHeight - borderWidth}
              rx={Math.max(0, deviceCornerRadius - halfBorder)}
              ry={Math.max(0, deviceCornerRadius - halfBorder)}
              stroke={accentColor}
              strokeWidth={borderWidth}
              fill="none"
            />
          </Svg>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
