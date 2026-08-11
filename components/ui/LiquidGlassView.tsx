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
}) => {
  return (
    <View
      style={[
        style,
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        },
      ]}
    >
      {/* 1. FROSTED BACKDROP BLUR MATCHING ICON BUTTONS */}
      <BlurView
        intensity={35}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. GRADIENT FILL & SPECULAR BORDER STROKE MATCHING OTHER ICONS EXACTLY */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="iconMatchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop
              offset="0%"
              stopColor={isDark ? '#0E0E10' : '#EAE8E3'}
              stopOpacity={isDark ? 0.15 : 0.20}
            />
            <Stop
              offset="35%"
              stopColor={isDark ? '#18181B' : '#F7F6F3'}
              stopOpacity={isDark ? 0.60 : 0.70}
            />
            <Stop
              offset="75%"
              stopColor={isDark ? '#28282E' : '#FFFFFF'}
              stopOpacity={1.0}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#28282E' : '#FFFFFF'}
              stopOpacity={1.0}
            />
          </LinearGradient>
          <LinearGradient id="iconMatchBdr" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity={isDark ? 0.35 : 0.95}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#FFFFFF' : '#000000'}
              stopOpacity={isDark ? 0.08 : 0.08}
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0.75"
          y="0.75"
          width="99.1%"
          height="99.1%"
          rx={borderRadius - 1}
          ry={borderRadius - 1}
          fill="url(#iconMatchGrad)"
          stroke="url(#iconMatchBdr)"
          strokeWidth="1.5"
        />
      </Svg>

      {children}
    </View>
  );
};
