import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { BouncingSmileyView } from './BouncingSmileyView';

const vhsLightTexture = require('../../assets/images/vhs_static_light.png');
const vhsDarkTexture = require('../../assets/images/vhs_static_dark.png');

interface CRTStaticCardProps {
  isDark?: boolean;
  width: number;
  height: number;
  borderRadius?: number;
  showBouncingSmiley?: boolean;
}

export const CRTStaticCard: React.FC<CRTStaticCardProps> = ({
  isDark = false,
  width,
  height,
  borderRadius = 24,
  showBouncingSmiley = false,
}) => {
  const noiseAnimX = useRef(new Animated.Value(0)).current;
  const noiseAnimY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ultra smooth, fluid particle flow with cubic bezier easing
    const particleLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -2.5, duration: 120, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 2.0, duration: 120, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 2.0, duration: 110, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -2.5, duration: 110, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: -1.5, duration: 130, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: -1.5, duration: 130, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(noiseAnimX, { toValue: 2.5, duration: 125, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
          Animated.timing(noiseAnimY, { toValue: 1.5, duration: 125, easing: Easing.bezier(0.4, 0.0, 0.2, 1), useNativeDriver: true }),
        ]),
      ])
    );

    particleLoop.start();

    return () => {
      particleLoop.stop();
    };
  }, []);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius, overflow: 'hidden', backgroundColor: isDark ? '#121216' : '#E4E4E8' },
      ]}
      pointerEvents="none"
    >
      <Animated.Image
        source={isDark ? vhsDarkTexture : vhsLightTexture}
        resizeMode="cover"
        fadeDuration={0}
        style={[
          StyleSheet.absoluteFill,
          {
            width: '115%',
            height: '115%',
            left: '-7.5%',
            top: '-7.5%',
            opacity: isDark ? 0.45 : 0.35,
            transform: [
              { translateX: noiseAnimX },
              { translateY: noiseAnimY },
            ],
          },
        ]}
      />

      {showBouncingSmiley && (
        <BouncingSmileyView cardWidth={width} cardHeight={height} />
      )}
    </View>
  );
};
