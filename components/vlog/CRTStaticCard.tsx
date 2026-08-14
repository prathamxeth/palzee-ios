import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

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
  const noiseRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const noiseSequence = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -1.65, duration: 40, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 1.32, duration: 40, useNativeDriver: true }),
          Animated.timing(noiseRotate, { toValue: 1, duration: 40, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 1.32, duration: 35, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -1.65, duration: 35, useNativeDriver: true }),
          Animated.timing(noiseRotate, { toValue: 2, duration: 35, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -1.10, duration: 42, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -1.10, duration: 42, useNativeDriver: true }),
          Animated.timing(noiseRotate, { toValue: 3, duration: 42, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 1.65, duration: 38, useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 1.10, duration: 38, useNativeDriver: true }),
          Animated.timing(noiseRotate, { toValue: 0, duration: 38, useNativeDriver: true }),
        ]),
      ])
    );

    noiseSequence.start();

    return () => {
      noiseSequence.stop();
    };
  }, []);

  const rotateInterpolation = noiseRotate.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['0deg', '90deg', '180deg', '270deg'],
  });

  const noiseOpacity = isDark ? 0.32 : 0.20;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius, overflow: 'hidden' },
      ]}
      pointerEvents="none"
    >
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="cameraVignette" cx="50%" cy="50%" r="70%">
            <Stop offset="0%" stopColor={isDark ? '#222228' : '#F5F5F8'} stopOpacity={1} />
            <Stop offset="65%" stopColor={isDark ? '#141418' : '#E6E6EA'} stopOpacity={1} />
            <Stop offset="100%" stopColor={isDark ? '#0A0A0C' : '#D2D2D8'} stopOpacity={1} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#cameraVignette)" />
      </Svg>

      <Animated.Image
        source={isDark ? vhsDarkTexture : vhsLightTexture}
        resizeMode="repeat"
        fadeDuration={0}
        style={[
          StyleSheet.absoluteFill,
          {
            width: '200%',
            height: '200%',
            left: '-50%',
            top: '-50%',
            opacity: noiseOpacity,
            transform: [
              { scale: 1.15 },
              { translateX: noiseAnimX },
              { translateY: noiseAnimY },
              { rotate: rotateInterpolation },
            ],
          },
        ]}
      />
    </View>
  );
};
