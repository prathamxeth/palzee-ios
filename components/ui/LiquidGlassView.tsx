import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export interface LiquidGlassPillBackgroundProps {
  isDark: boolean;
  idPrefix: string;
  borderRadius?: number;
  backgroundColor?: string;
}

export const LiquidGlassPillBackground: React.FC<LiquidGlassPillBackgroundProps> = ({
  isDark,
  idPrefix,
  borderRadius,
  backgroundColor,
}) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const rx = borderRadius !== undefined ? borderRadius : layout.height > 0 ? layout.height / 2 : 26;
  const bg = backgroundColor !== undefined ? backgroundColor : (isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)');

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: rx,
          backgroundColor: bg,
          overflow: 'hidden',
        },
      ]}
      pointerEvents="none"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) {
          setLayout({ width, height });
        }
      }}
    >
      <BlurView
        key={`blur_${idPrefix}_${isDark ? 'dark' : 'light'}`}
        intensity={Platform.OS === 'ios' ? 45 : 30}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {layout.width > 0 && (
        <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`${idPrefix}Rim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
              <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0.6"
            y="0.6"
            width={layout.width - 1.2}
            height={layout.height - 1.2}
            rx={rx - 0.6}
            ry={rx - 0.6}
            fill="none"
            stroke={`url(#${idPrefix}Rim)`}
            strokeWidth={1.2}
          />
        </Svg>
      )}
    </View>
  );
};

export interface LiquidGlassCapsuleProps {
  children: React.ReactNode;
  isDark?: boolean;
  idPrefix?: string;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const LiquidGlassCapsule: React.FC<LiquidGlassCapsuleProps> = ({
  children,
  isDark: isDarkProp,
  idPrefix = 'capsule',
  width = 110,
  height = 45,
  borderRadius,
  style,
}) => {
  const systemScheme = useFastColorScheme();
  const isDark = isDarkProp ?? (systemScheme === 'dark');
  const rx = borderRadius ?? height / 2;

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius: rx,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 3,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          borderRadius: rx,
          overflow: 'hidden',
          backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <BlurView
          key={`blur_${idPrefix}_${isDark ? 'dark' : 'light'}`}
          intensity={Platform.OS === 'ios' ? 45 : 30}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`${idPrefix}CapsuleRim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 0.85} />
              <Stop offset="35%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.40} />
              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : '#000000'} stopOpacity={isDark ? 0.05 : 0.08} />
            </LinearGradient>
          </Defs>
          <Rect
            x="0.75"
            y="0.75"
            width={typeof width === 'number' ? width - 1.5 : '98.5%'}
            height={height - 1.5}
            rx={rx - 0.75}
            ry={rx - 0.75}
            fill="none"
            stroke={`url(#${idPrefix}CapsuleRim)`}
            strokeWidth={1.2}
          />
        </Svg>
        {children}
      </View>
    </View>
  );
};

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
            backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.88)',
          },
        ]}
      >
        {/* 1. FROSTED BACKDROP BLUR (ORGANIC APPLE TRANSLUCENCY) */}
        <BlurView
          key={`blur_view_${isDark ? 'dark' : 'light'}`}
          intensity={Platform.OS === 'ios' ? 45 : 30}
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
