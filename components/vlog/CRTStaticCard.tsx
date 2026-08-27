import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { BouncingSmileyView, SmileyTouchInfo } from './BouncingSmileyView';

const vhsLightTexture = require('../../assets/images/vhs_static_light.png');
const vhsDarkTexture = require('../../assets/images/vhs_static_dark.png');

interface CRTStaticCardProps {
  isDark?: boolean;
  width: number;
  height: number;
  borderRadius?: number;
  showBouncingSmiley?: boolean;
  onSmileyHover?: (info: SmileyTouchInfo | null) => void;
  pillRect?: { x: number; y: number; width: number; height: number };
}

export const CRTStaticCard: React.FC<CRTStaticCardProps> = React.memo(({
  isDark = false,
  width,
  height,
  borderRadius = 24,
  showBouncingSmiley = false,
  onSmileyHover,
  pillRect,
}) => {
  const grainX1 = useRef(new Animated.Value(0)).current;
  const grainY1 = useRef(new Animated.Value(0)).current;
  const grainX2 = useRef(new Animated.Value(0)).current;
  const grainY2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Primary grain field vector (speed increased by 25%: ~720ms per step)
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(grainX1, { toValue: -6, duration: 720, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY1, { toValue: 5, duration: 720, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX1, { toValue: 7, duration: 780, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY1, { toValue: -6, duration: 780, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX1, { toValue: -4, duration: 690, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY1, { toValue: -7, duration: 690, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX1, { toValue: 6, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY1, { toValue: 4, duration: 750, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX1, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY1, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );

    // 2. Secondary counter-phase grain field vector (creates individual independent dot movement)
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(grainX2, { toValue: 5, duration: 780, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY2, { toValue: -6, duration: 780, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX2, { toValue: -7, duration: 710, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY2, { toValue: 5, duration: 710, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX2, { toValue: 6, duration: 760, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY2, { toValue: 6, duration: 760, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(grainX2, { toValue: 0, duration: 730, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(grainY2, { toValue: 0, duration: 730, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ]),
      ])
    );

    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
  }, []);

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { borderRadius, overflow: 'hidden', backgroundColor: isDark ? '#0A0A0C' : '#F7F6F3' },
      ]}
      pointerEvents="none"
    >
      {/* Primary Grain Field Layer */}
      <Animated.View
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
          opacity: isDark ? 0.08 : 0.12,
          transform: [
            { translateX: grainX1 },
            { translateY: grainY1 },
          ],
        }}
      >
        <ExpoImage
          source={isDark ? vhsDarkTexture : vhsLightTexture}
          contentFit="cover"
          transition={0}
          priority="high"
          cachePolicy="memory"
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Secondary Counter-Phase Grain Field Layer (Individual Particle Level Motion) */}
      <Animated.View
        style={{
          position: 'absolute',
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
          opacity: isDark ? 0.06 : 0.10,
          transform: [
            { translateX: grainX2 },
            { translateY: grainY2 },
          ],
        }}
      >
        <ExpoImage
          source={isDark ? vhsDarkTexture : vhsLightTexture}
          contentFit="cover"
          transition={0}
          priority="high"
          cachePolicy="memory"
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {showBouncingSmiley && (
        <BouncingSmileyView
          cardWidth={width}
          cardHeight={height}
          onSmileyHover={onSmileyHover}
          pillRect={pillRect}
        />
      )}
    </View>
  );
});
