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

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  style,
  children,
  isDark: isDarkProp,
  borderRadius = 26,
}) => {
  const systemScheme = useColorScheme();
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
              stopColor={isDark ? '#0A0A0C' : '#EAE8E3'}
              stopOpacity={isDark ? 0.60 : 0.20}
            />
            <Stop
              offset="35%"
              stopColor={isDark ? '#1C1C1E' : '#F7F6F3'}
              stopOpacity={isDark ? 0.50 : 0.70}
            />
            <Stop
              offset="75%"
              stopColor={isDark ? '#2C2C2E' : '#FFFFFF'}
              stopOpacity={isDark ? 0.65 : 1.0}
            />
            <Stop
              offset="100%"
              stopColor={isDark ? '#2C2C2E' : '#FFFFFF'}
              stopOpacity={isDark ? 0.65 : 1.0}
            />
          </LinearGradient>
          <LinearGradient id="iconMatchBdr" x1="0%" y1="0%" x2="0%" y2="100%">
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
          width="99.3%"
          height="99.3%"
          rx={borderRadius - 0.5}
          ry={borderRadius - 0.5}
          fill="url(#iconMatchGrad)"
          stroke="url(#iconMatchBdr)"
          strokeWidth={1.0}
        />
      </Svg>

      {children}
    </View>
  );
};
