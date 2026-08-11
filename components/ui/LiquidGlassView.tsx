import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

let NativeLiquidGlassView: any = null;
try {
  NativeLiquidGlassView = require('expo-liquid-glass-view').LiquidGlassView;
} catch (e) {
  // Graceful fallback
}

interface LiquidGlassProps {
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
  isDark?: boolean;
  accentColor?: string;
  borderRadius?: number;
  variant?: 'regular' | 'clear';
  renderer?: 'auto' | 'native' | 'metal';
  cornerStyle?: 'continuous' | 'circular';
  tint?: string;
  interactive?: boolean;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  style,
  children,
  isDark = false,
  borderRadius = 26,
  variant = 'clear',
  renderer = 'auto',
  cornerStyle = 'continuous',
  tint,
  interactive = true,
}) => {
  if (NativeLiquidGlassView && Platform.OS === 'ios') {
    return (
      <NativeLiquidGlassView
        style={[style, { borderRadius, overflow: 'hidden' }]}
        variant={variant}
        renderer={renderer}
        cornerStyle={cornerStyle}
        cornerRadius={borderRadius}
        tint={tint}
        interactive={interactive}
      >
        {children}
      </NativeLiquidGlassView>
    );
  }

  // Clear & Vibrant Glassmorphism Fallback (variant="clear", renderer="auto")
  const isClear = variant === 'clear';
  const surfaceAlpha = isClear ? (isDark ? 0.65 : 0.65) : (isDark ? 0.90 : 0.90);
  const blurIntensity = isClear ? 50 : 85;

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
      {/* 1. TOP-LEFT CYAN-PINK AURORA LIQUID REFRACTION */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="auroraClearRefraction" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00E5FF" stopOpacity={isDark ? 0.40 : 0.50} />
            <Stop offset="25%" stopColor="#FF77E9" stopOpacity={isDark ? 0.18 : 0.25} />
            <Stop offset="100%" stopColor={isDark ? '#1C1C1E' : '#FFFFFF'} stopOpacity={isDark ? 0.05 : 0.08} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#auroraClearRefraction)" />
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
          <LinearGradient id="clearBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.50 : 0.95} />
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
          stroke="url(#clearBorderGrad)"
          strokeWidth="1.2"
        />
      </Svg>

      {children}
    </View>
  );
};
