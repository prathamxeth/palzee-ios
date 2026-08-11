import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

let NativeGlassView: any = null;
try {
  NativeGlassView = require('expo-glass-effect').GlassView;
} catch (e) {
  // Native module not linked yet
}

interface LiquidGlassProps {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  isDark?: boolean;
  accentColor?: string;
  borderRadius?: number;
  variant?: 'regular' | 'clear';
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  style,
  children,
  isDark = false,
  borderRadius = 26,
  variant = 'clear',
}) => {
  // If native expo-glass-effect is linked and compiled into the app binary:
  if (NativeGlassView && Platform.OS === 'ios') {
    return (
      <NativeGlassView
        style={[style, { borderRadius, overflow: 'hidden' }]}
        glassEffectStyle={variant}
        tintColor={isDark ? 'rgba(24, 20, 36, 0.4)' : 'rgba(255, 255, 255, 0.4)'}
      >
        {children}
      </NativeGlassView>
    );
  }

  // High-fidelity fallback (Expo BlurView)
  const isClear = variant === 'clear';
  const surfaceAlpha = isClear ? (isDark ? 0.65 : 0.65) : (isDark ? 0.90 : 0.90);
  const blurIntensity = isClear ? 65 : 85;

  return (
    <View
      style={[
        style,
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: isDark ? `rgba(24, 20, 36, ${surfaceAlpha})` : `rgba(252, 248, 254, ${surfaceAlpha})`,
        },
      ]}
    >
      {/* 1. TOP-LEFT LIQUID CYAN-PINK COLOR SPLASH */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="auroraTopLeftGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity={isDark ? 0.55 : 0.65} />
            <Stop offset="22%" stopColor="#FF77E9" stopOpacity={isDark ? 0.28 : 0.35} />
            <Stop offset="55%" stopColor={isDark ? '#1C1C1E' : '#FFFFFF'} stopOpacity={0.0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#auroraTopLeftGlow)" />
      </Svg>

      {/* 2. FROSTED BACKDROP BLUR */}
      <BlurView
        intensity={Platform.OS === 'ios' ? blurIntensity : 90}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. SPECULAR WHITE BORDER HIGHLIGHT STROKE */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <LinearGradient id="liquidPillBorder" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.50 : 0.95} />
            <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.20 : 0.40} />
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
          stroke="url(#liquidPillBorder)"
          strokeWidth="1.2"
        />
      </Svg>

      {children}
    </View>
  );
};
