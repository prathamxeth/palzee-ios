import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

interface CRTStaticCardProps {
  isDark?: boolean;
  width: number;
  height: number;
  borderRadius?: number;
}

export const CRTStaticCard: React.FC<CRTStaticCardProps> = ({
  isDark = false,
  width,
  height,
  borderRadius = 24,
}) => {
  const noiseAnimX = useRef(new Animated.Value(0)).current;
  const noiseAnimY = useRef(new Animated.Value(0)).current;
  const noiseScale = useRef(new Animated.Value(1.0)).current;

  useEffect(() => {
    // 50% SLOWER 360-DEGREE TV SCREEN GLITCH ANIMATION
    const loop = Animated.loop(
      Animated.sequence([
        // 1. TOP-RIGHT DIRECTION (120ms)
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 8, duration: 120, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -7, duration: 120, useNativeDriver: true }),
          Animated.timing(noiseScale, { toValue: 1.02, duration: 120, useNativeDriver: true }),
        ]),
        // 2. BOTTOM-LEFT DIRECTION (100ms)
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -9, duration: 100, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 8, duration: 100, useNativeDriver: true }),
          Animated.timing(noiseScale, { toValue: 0.98, duration: 100, useNativeDriver: true }),
        ]),
        // 3. TOP-LEFT DIRECTION (130ms)
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -7, duration: 130, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -9, duration: 130, useNativeDriver: true }),
          Animated.timing(noiseScale, { toValue: 1.03, duration: 130, useNativeDriver: true }),
        ]),
        // 4. BOTTOM-RIGHT DIRECTION (110ms)
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 10, duration: 110, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 9, duration: 110, useNativeDriver: true }),
          Animated.timing(noiseScale, { toValue: 0.99, duration: 110, useNativeDriver: true }),
        ]),
        // 5. CENTER JITTER RESET (90ms)
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 2, duration: 90, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -3, duration: 90, useNativeDriver: true }),
          Animated.timing(noiseScale, { toValue: 1.01, duration: 90, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          width: '200%',
          height: '200%',
          left: '-40%',
          top: '-40%',
          transform: [
            { translateX: Animated.add(noiseAnimX, 30) },
            { translateY: Animated.add(noiseAnimY, 50) },
            { scale: noiseScale },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="allSidesNoisePattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width="10" height="10" fill={isDark ? '#161618' : '#E2E2E4'} />
            {/* DARK MODE CHARCOAL & LIGHT MODE SILVER OFFWHITE 0.25dp MICROSCOPIC PARTICLES */}
            <Rect x="0" y="0" width="0.25" height="0.25" fill={isDark ? '#3A3A3C' : '#C8C8CA'} opacity={isDark ? 0.85 : 0.75} />
            <Rect x="1.2" y="0.6" width="0.25" height="0.25" fill={isDark ? '#48484A' : '#FFFFFF'} opacity={isDark ? 0.90 : 0.85} />
            <Rect x="2.8" y="0" width="0.25" height="0.25" fill={isDark ? '#2C2C2E' : '#D2D2D4'} opacity={isDark ? 0.80 : 0.70} />
            <Rect x="4.4" y="1.0" width="0.25" height="0.25" fill={isDark ? '#5A5A5E' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.80} />
            <Rect x="6.0" y="0" width="0.25" height="0.25" fill={isDark ? '#242426' : '#C4C4C6'} opacity={isDark ? 0.75 : 0.65} />
            <Rect x="7.8" y="1.4" width="0.25" height="0.25" fill={isDark ? '#3E3E42' : '#D8D8DA'} opacity={isDark ? 0.80 : 0.75} />

            <Rect x="0.6" y="2.5" width="0.25" height="0.25" fill={isDark ? '#444448' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.80} />
            <Rect x="2.2" y="3.4" width="0.25" height="0.25" fill={isDark ? '#2A2A2C' : '#C8C8CA'} opacity={isDark ? 0.80 : 0.70} />
            <Rect x="3.8" y="2.5" width="0.25" height="0.25" fill={isDark ? '#505054' : '#FFFFFF'} opacity={isDark ? 0.90 : 0.85} />
            <Rect x="5.4" y="3.2" width="0.25" height="0.25" fill={isDark ? '#2C2C2E' : '#D2D2D4'} opacity={isDark ? 0.75 : 0.65} />
            <Rect x="7.0" y="3.8" width="0.25" height="0.25" fill={isDark ? '#3A3A3C' : '#C4C4C6'} opacity={isDark ? 0.80 : 0.75} />
            <Rect x="8.6" y="2.6" width="0.25" height="0.25" fill={isDark ? '#48484A' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.80} />

            <Rect x="1.0" y="5.0" width="0.25" height="0.25" fill={isDark ? '#343438' : '#C8C8CA'} opacity={isDark ? 0.80 : 0.70} />
            <Rect x="3.2" y="4.4" width="0.25" height="0.25" fill={isDark ? '#505054' : '#FFFFFF'} opacity={isDark ? 0.90 : 0.85} />
            <Rect x="5.0" y="5.4" width="0.25" height="0.25" fill={isDark ? '#242426' : '#D2D2D4'} opacity={isDark ? 0.75 : 0.65} />
            <Rect x="6.6" y="4.8" width="0.25" height="0.25" fill={isDark ? '#3A3A3C' : '#C4C4C6'} opacity={isDark ? 0.80 : 0.75} />
            <Rect x="8.2" y="5.6" width="0.25" height="0.25" fill={isDark ? '#48484A' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.80} />

            <Rect x="0" y="7.0" width="0.25" height="0.25" fill={isDark ? '#3E3E42' : '#D8D8DA'} opacity={isDark ? 0.80 : 0.70} />
            <Rect x="1.8" y="7.6" width="0.25" height="0.25" fill={isDark ? '#444448' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.85} />
            <Rect x="4.2" y="6.6" width="0.25" height="0.25" fill={isDark ? '#2C2C2E' : '#C8C8CA'} opacity={isDark ? 0.80 : 0.75} />
            <Rect x="6.2" y="7.6" width="0.25" height="0.25" fill={isDark ? '#343438' : '#D2D2D4'} opacity={isDark ? 0.75 : 0.65} />
            <Rect x="7.6" y="6.8" width="0.25" height="0.25" fill={isDark ? '#48484A' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.80} />
            <Rect x="9.0" y="7.8" width="0.25" height="0.25" fill={isDark ? '#2A2A2C' : '#C4C4C6'} opacity={isDark ? 0.75 : 0.70} />

            <Rect x="0.6" y="9.0" width="0.25" height="0.25" fill={isDark ? '#505054' : '#FFFFFF'} opacity={isDark ? 0.85 : 0.80} />
            <Rect x="3.0" y="8.5" width="0.25" height="0.25" fill={isDark ? '#3A3A3C' : '#C8C8CA'} opacity={isDark ? 0.80 : 0.75} />
            <Rect x="4.8" y="9.0" width="0.25" height="0.25" fill={isDark ? '#444448' : '#FFFFFF'} opacity={isDark ? 0.90 : 0.85} />
            <Rect x="7.0" y="8.8" width="0.25" height="0.25" fill={isDark ? '#2C2C2E' : '#D2D2D4'} opacity={isDark ? 0.75 : 0.65} />
            <Rect x="8.6" y="9.0" width="0.25" height="0.25" fill={isDark ? '#3E3E42' : '#C4C4C6'} opacity={isDark ? 0.80 : 0.70} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#allSidesNoisePattern)" />
      </Svg>
    </Animated.View>
  );
};
