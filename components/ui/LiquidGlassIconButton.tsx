import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export interface LiquidGlassIconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  idPrefix?: string;
  size?: number;
  disabled?: boolean;
  style?: any;
}

export const LiquidGlassIconButton: React.FC<LiquidGlassIconButtonProps> = ({
  onPress,
  children,
  isDark = true,
  idPrefix = 'btn',
  size = 45,
  disabled = false,
  style,
}) => {
  const btnRadius = size / 2;

  return (
    <TouchableOpacity
      style={[
        styles.liquidCircleWrapper,
        {
          width: size,
          height: size,
          borderRadius: btnRadius,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
      activeOpacity={0.8}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.liquidCircleInner,
          {
            borderRadius: btnRadius,
            backgroundColor: isDark ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
          },
        ]}
      >
        <BlurView
          key={`blur_${idPrefix}_${isDark ? 'dark' : 'systemUltraThinMaterialLight'}`}
          intensity={Platform.OS === 'ios' ? 45 : 30}
          tint={isDark ? 'dark' : 'systemUltraThinMaterialLight'}
          style={StyleSheet.absoluteFill}
        />
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`${idPrefix}GlassRim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor="#FFFFFF"
                stopOpacity={isDark ? 0.45 : 0.70}
              />
              <Stop
                offset="40%"
                stopColor="#FFFFFF"
                stopOpacity={isDark ? 0.15 : 0.30}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#FFFFFF' : '#000000'}
                stopOpacity={isDark ? 0.05 : 0.06}
              />
            </LinearGradient>
          </Defs>
          <Rect
            x="0.75"
            y="0.75"
            width={size - 1.5}
            height={size - 1.5}
            rx={btnRadius - 0.75}
            fill="none"
            stroke={`url(#${idPrefix}GlassRim)`}
            strokeWidth={1.0}
          />
        </Svg>
        <View style={styles.contentContainer}>
          {children}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  liquidCircleWrapper: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: 'transparent',
  },
  liquidCircleInner: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
