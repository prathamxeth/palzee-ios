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
  variant?: 'regular' | 'clear';
  renderer?: 'auto' | 'native' | 'metal';
  cornerStyle?: 'continuous' | 'circular';
  tint?: string;
  interactive?: boolean;
  enableBackgroundExtension?: boolean;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  style,
  children,
  isDark = false,
  borderRadius = 26,
  variant = 'clear',
  enableBackgroundExtension = true,
}) => {
  const isClear = variant === 'clear';
  const surfaceAlpha = isClear ? (isDark ? 0.70 : 0.72) : (isDark ? 0.88 : 0.90);
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
      {/* 1. APPLE LIQUID GLASS BACKGROUND EXTENSION EFFECT LAYER */}
      {enableBackgroundExtension && (
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <LinearGradient id="backgroundExtensionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#00E5FF" stopOpacity={isDark ? 0.45 : 0.55} />
              <Stop offset="30%" stopColor="#FF77E9" stopOpacity={isDark ? 0.22 : 0.30} />
              <Stop offset="70%" stopColor="#A4C6FF" stopOpacity={isDark ? 0.12 : 0.18} />
              <Stop offset="100%" stopColor={isDark ? '#1C1C1E' : '#FFFFFF'} stopOpacity={isDark ? 0.05 : 0.08} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#backgroundExtensionGrad)" />
        </Svg>
      )}

      {/* 2. FROSTED MATERIAL BACKDROP BLUR */}
      <BlurView
        intensity={Platform.OS === 'ios' ? blurIntensity : 90}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. GLOSSY TOP HIGHLIGHT REFLECTION */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <LinearGradient id="topGlossReflection" x1="0%" y1="0%" x2="0%" y2="40%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.25 : 0.50} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="40%" fill="url(#topGlossReflection)" />
      </Svg>

      {/* 4. APPLE SPECULAR HIGHLIGHT BORDER RING (Continuous Curve) */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Defs>
          <LinearGradient id="appleSpecularRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.60 : 0.98} />
            <Stop offset="45%" stopColor={isDark ? '#A4C6FF' : '#D8C2FF'} stopOpacity={isDark ? 0.30 : 0.50} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.12 : 0.22} />
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
          stroke="url(#appleSpecularRing)"
          strokeWidth="1.2"
        />
      </Svg>

      {children}
    </View>
  );
};
