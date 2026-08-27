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
  const bg = backgroundColor !== undefined ? backgroundColor : (isDark ? 'transparent' : '#FFFFFF');

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
      {isDark && (
        <BlurView
          key={`blur_${idPrefix}_dark`}
          intensity={Platform.OS === 'ios' ? 45 : 30}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      )}
      {layout.width > 0 && (
        <Svg width={layout.width} height={layout.height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`${idPrefix}Rim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 1.0} />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.6} />
              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.08)'} stopOpacity={isDark ? 0.05 : 1.0} />
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
            strokeWidth={1.0}
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
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          borderRadius: rx,
          overflow: 'hidden',
          backgroundColor: isDark ? 'transparent' : '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {isDark && (
          <BlurView
            key={`blur_${idPrefix}_dark`}
            intensity={Platform.OS === 'ios' ? 45 : 30}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`${idPrefix}CapsuleRim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.45 : 1.0} />
              <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.15 : 0.6} />
              <Stop offset="100%" stopColor={isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.08)'} stopOpacity={isDark ? 0.05 : 1.0} />
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
            strokeWidth={1.0}
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
            backgroundColor: isDark ? 'transparent' : '#FFFFFF',
          },
        ]}
      >
        {/* 1. FROSTED BACKDROP BLUR (ORGANIC APPLE TRANSLUCENCY IN DARK MODE) */}
        {isDark && (
          <BlurView
            key={`blur_view_dark`}
            intensity={Platform.OS === 'ios' ? 45 : 30}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* 2. SPECULAR LIGHT-EDGE HIGHLIGHT RIM (NO SOLID COLOR FILLS) */}
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Defs>
            <LinearGradient id="glassViewRim" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor="#FFFFFF"
                stopOpacity={isDark ? 0.45 : 1.0}
              />
              <Stop
                offset="40%"
                stopColor="#FFFFFF"
                stopOpacity={isDark ? 0.15 : 0.6}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.08)'}
                stopOpacity={isDark ? 0.05 : 1.0}
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
            strokeWidth={1.0}
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  liquidInner: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    position: 'relative',
  },
});
