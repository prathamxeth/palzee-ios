import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
  size = 45,
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
      <BlurView key={isDark ? 'dark' : 'light'} intensity={35} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`${idPrefix}Grad`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor={isDark ? '#2C2C2E' : '#FFFFFF'}
              stopOpacity={isDark ? 0.65 : 0.88}
            />
            <Stop
              offset="50%"
              stopColor={isDark ? '#1C1C1E' : '#F7F6F3'}
              stopOpacity={isDark ? 0.50 : 0.75}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#0A0A0C' : '#EAE8E3'}
              stopOpacity={isDark ? 0.60 : 0.65}
            />
          </LinearGradient>
          <LinearGradient id={`${idPrefix}Bdr`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity={isDark ? 0.28 : 0.95}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#FFFFFF' : '#000000'}
              stopOpacity={isDark ? 0.04 : 0.08}
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0.5"
          y="0.5"
          width={size - 1.0}
          height={size - 1.0}
          rx={(size - 1.0) / 2}
          fill={`url(#${idPrefix}Grad)`}
          stroke={`url(#${idPrefix}Bdr)`}
          strokeWidth={1.0}
        />
      </Svg>
      <View style={styles.contentContainer}>
        {children}
      </View>
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
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});
