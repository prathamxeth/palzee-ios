import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export interface LiquidGlassIconButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  idPrefix?: string;
  size?: number;
}

export const LiquidGlassIconButton: React.FC<LiquidGlassIconButtonProps> = ({
  onPress,
  children,
  isDark = true,
  idPrefix = 'btn',
  size = 44,
}) => {
  const btnRadius = size / 2;
  const rectSize = size - 1.5;
  const rectRadius = (size - 1.5) / 2;

  return (
    <TouchableOpacity
      style={[
        styles.circleIconBtn,
        { width: size, height: size, borderRadius: btnRadius },
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <BlurView intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`${idPrefix}Grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor={isDark ? '#28282E' : '#FFFFFF'}
              stopOpacity={isDark ? 0.75 : 0.88}
            />
            <Stop
              offset="50%"
              stopColor={isDark ? '#18181B' : '#F7F6F3'}
              stopOpacity={isDark ? 0.6 : 0.75}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#0E0E10' : '#EAE8E3'}
              stopOpacity={isDark ? 0.85 : 0.65}
            />
          </LinearGradient>
          <LinearGradient id={`${idPrefix}Bdr`} x1="0%" y1="0%" x2="0%" y2="100%">
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
          width={rectSize}
          height={rectSize}
          rx={rectRadius}
          fill={`url(#${idPrefix}Grad)`}
          stroke={`url(#${idPrefix}Bdr)`}
          strokeWidth="1.5"
        />
      </Svg>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  circleIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
});
