import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

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
  isDark: isDarkProp,
  borderRadius = 26,
}) => {
  const systemScheme = useFastColorScheme();
  const isDark = isDarkProp ?? (systemScheme === 'dark');

  return (
    <View
      style={[
        styles.liquidWrapper,
        {
          borderRadius,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.liquidInner,
          {
            borderRadius,
          },
        ]}
      >
        {/* 1. FROSTED BACKDROP BLUR (ORGANIC APPLE TRANSLUCENCY) */}
        <BlurView
          key={`blur_view_${isDark ? 'dark' : 'light'}`}
          intensity={Platform.OS === 'ios' ? 40 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* 2. SPECULAR LIGHT-EDGE HIGHLIGHT RIM (NO SOLID COLOR FILLS) */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Defs>
            <LinearGradient id="glassViewRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor="#FFFFFF"
                stopOpacity={isDark ? 0.45 : 0.85}
              />
              <Stop
                offset="35%"
                stopColor="#FFFFFF"
                stopOpacity={isDark ? 0.15 : 0.40}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#FFFFFF' : '#000000'}
                stopOpacity={isDark ? 0.05 : 0.08}
              />
            </LinearGradient>
          </Defs>
          <Rect
            x="0.75"
            y="0.75"
            width="99.2%"
            height="99.2%"
            rx={Math.max(0, borderRadius - 0.75)}
            ry={Math.max(0, borderRadius - 0.75)}
            fill="none"
            stroke="url(#glassViewRim)"
            strokeWidth={1.2}
          />
        </Svg>

        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  liquidWrapper: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  liquidInner: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    position: 'relative',
  },
});
