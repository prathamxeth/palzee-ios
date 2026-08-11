import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

interface LiquidGlassProps {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  isDark?: boolean;
  accentColor?: string;
  borderRadius?: number;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  style,
  children,
  isDark = false,
  borderRadius = 26,
}) => {
  return (
    <View
      style={[
        style,
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: isDark ? 'rgba(24, 20, 36, 0.90)' : 'rgba(252, 248, 254, 0.90)',
        },
      ]}
    >
      {/* 1. TOP-LEFT CYAN-PINK AURORA LIQUID REFRACTION MATCHING REFERENCE IMAGE */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="auroraGlassRefraction" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity={isDark ? 0.45 : 0.55} />
            <Stop offset="25%" stopColor="#FF77E9" stopOpacity={isDark ? 0.20 : 0.28} />
            <Stop offset="100%" stopColor={isDark ? '#1C1C1E' : '#FFFFFF'} stopOpacity={isDark ? 0.05 : 0.08} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#auroraGlassRefraction)" />
      </Svg>

      {/* 2. FROSTED BACKDROP BLUR */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 85 : 95}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. SPECULAR WHITE BORDER HIGHLIGHT STROKE */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <LinearGradient id="frostedBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.95} />
            <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.20 : 0.40} />
            <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0.75"
          y="0.75"
          width="99.1%"
          height="99.1%"
          rx={borderRadius - 1}
          ry={borderRadius - 1}
          fill="none"
          stroke="url(#frostedBorderGrad)"
          strokeWidth="1.2"
        />
      </Svg>

      {children}
    </View>
  );
};
