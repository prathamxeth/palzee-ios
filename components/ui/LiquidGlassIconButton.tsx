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
            backgroundColor: isDark ? 'transparent' : '#F2F2F7',
          },
        ]}
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
            <LinearGradient id={`${idPrefix}GlassRim`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop
                offset="0%"
                stopColor="#FFFFFF"
                stopOpacity={0.45}
              />
              <Stop
                offset="40%"
                stopColor="#FFFFFF"
                stopOpacity={0.15}
              />
              <Stop
                offset="100%"
                stopColor="#FFFFFF"
                stopOpacity={0.05}
              />
            </LinearGradient>
          </Defs>
          <Rect
            x="0.5"
            y="0.5"
            width={size - 1.0}
            height={size - 1.0}
            rx={btnRadius - 0.5}
            fill="none"
            stroke={isDark ? `url(#${idPrefix}GlassRim)` : 'rgba(0, 0, 0, 0.04)'}
            strokeWidth={isDark ? 1.0 : 0.8}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
