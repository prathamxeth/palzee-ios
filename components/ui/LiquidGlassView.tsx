import { View, StyleSheet, ViewStyle, Platform, useColorScheme } from 'react-native';
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

import { useFastColorScheme } from '../../hooks/useFastColorScheme';

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
        style,
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: 'transparent',
        },
      ]}
    >
      {/* 1. FROSTED BACKDROP BLUR MATCHING VLOG PILL */}
      <BlurView
        key={isDark ? 'dark' : 'light'}
        intensity={35}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. EXACT VLOG PILL GRADIENT FILL & SPECULAR BORDER STROKE */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
        <Defs>
          <LinearGradient id="iconMatchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop
              offset="0%"
              stopColor={isDark ? '#28282E' : '#FFFFFF'}
              stopOpacity={isDark ? 0.75 : 0.88}
            />
            <Stop
              offset="50%"
              stopColor={isDark ? '#18181B' : '#F7F6F3'}
              stopOpacity={isDark ? 0.60 : 0.75}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#0E0E10' : '#EAE8E3'}
              stopOpacity={isDark ? 0.85 : 0.65}
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
              stopOpacity={0.08}
            />
          </LinearGradient>
        </Defs>
        <Rect
          x="0.5"
          y="0.5"
          width="99.3%"
          height="99.3%"
          rx={borderRadius - 0.5}
          ry={borderRadius - 0.5}
          fill="url(#iconMatchGrad)"
          stroke="url(#iconMatchBdr)"
          strokeWidth={1.2}
        />
      </Svg>

      {children}
    </View>
  );
};
