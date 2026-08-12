import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

const vhsLightTexture = require('../../assets/images/vhs_static_light.png');
const vhsDarkTexture = require('../../assets/images/vhs_static_dark.png');

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
  const lowLightFlicker = useRef(new Animated.Value(isDark ? 0.75 : 0.28)).current;

  useEffect(() => {
    // 1. IPHONE LOW-LIGHT SENSOR JITTER MOTION
    const noiseSequence = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -6, duration: 200, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 5, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 5, duration: 235, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -6, duration: 235, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -5, duration: 165, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 4, duration: 165, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 4, duration: 235, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -3, duration: 235, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 0, duration: 165, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 0, duration: 165, useNativeDriver: true }),
        ]),
      ])
    );

    // 2. LOW-LIGHT ROLLING SHUTTER EXPOSURE FLICKER (IPHONE SELFIE SENSOR GLITCH)
    const flickerSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(lowLightFlicker, { toValue: isDark ? 0.95 : 0.42, duration: 120, useNativeDriver: true }),
        Animated.timing(lowLightFlicker, { toValue: isDark ? 0.65 : 0.22, duration: 180, useNativeDriver: true }),
        Animated.timing(lowLightFlicker, { toValue: isDark ? 0.88 : 0.38, duration: 150, useNativeDriver: true }),
        Animated.timing(lowLightFlicker, { toValue: isDark ? 0.70 : 0.26, duration: 220, useNativeDriver: true }),
      ])
    );

    noiseSequence.start();
    flickerSequence.start();

    return () => {
      noiseSequence.stop();
      flickerSequence.stop();
    };
  }, [isDark]);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: isDark ? '#1B1B1D' : '#F6F6F8' },
      ]}
      pointerEvents="none"
    >
      {/* LOW-LIGHT CAMERA SENSOR ISO NOISE GRAIN */}
      <Animated.Image
        source={isDark ? vhsDarkTexture : vhsLightTexture}
        resizeMode="repeat"
        style={[
          StyleSheet.absoluteFill,
          {
            width: '250%',
            height: '250%',
            left: '-75%',
            top: '-75%',
            opacity: lowLightFlicker,
            transform: [
              { translateX: noiseAnimX },
              { translateY: noiseAnimY },
            ],
          },
        ]}
      />
    </View>
  );
};
