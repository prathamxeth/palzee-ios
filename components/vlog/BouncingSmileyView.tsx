import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Image } from 'expo-image';

export const TWELVE_PALZEE_COLORS = [
  '#FF5232', // Fire Red
  '#10B981', // Plant Green
  '#60A5FA', // Bingsu Blue
  '#AC87FA', // Plant Purple
  '#FFB443', // Pizza Orange
  '#FE75F5', // Pink Glow
  '#11D5F3', // Cyan Glow
  '#65EA7B', // Lime Green
  '#AA6DFE', // Violet
  '#FF6584', // Berry Pink
  '#FFC72C', // Sunshine Yellow
  '#4FFFB0', // Palzee Mint
];

export interface BouncingSmileyViewProps {
  cardWidth: number;
  cardHeight: number;
}

export const BouncingSmileyView: React.FC<BouncingSmileyViewProps> = ({
  cardWidth,
  cardHeight,
}) => {
  const smileySize = 60.0;
  const maxX = Math.max(0, cardWidth - smileySize);
  const maxY = Math.max(0, cardHeight - smileySize);

  const initialX = Math.floor(Math.random() * (maxX || 1));
  const initialY = Math.floor(Math.random() * (maxY || 1));

  const boxRef = useRef<View>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const posRef = useRef({ x: initialX, y: initialY });
  const velRef = useRef({
    vx: 3.20,
    vy: 2.75,
  });

  const colorIndexRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // 1. HARDWARE-ACCELERATED INFINITE 60FPS CONTINUOUS ROTATION (NEVER STALLS / NEVER GLITCHES)
  useEffect(() => {
    rotateAnim.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim]);

  // 2. ULTRA-SMOOTH DIRECT VIEW TRANSFORMS (ZERO REACT RE-RENDERS / ZERO ANIMATION NODE JAMS)
  useEffect(() => {
    let active = true;

    const curX = Math.min(posRef.current.x, maxX);
    const curY = Math.min(posRef.current.y, maxY);
    posRef.current = { x: curX, y: curY };

    if (boxRef.current) {
      boxRef.current.setNativeProps({
        style: {
          transform: [{ translateX: curX }, { translateY: curY }],
        },
      });
    }

    let lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    const updatePhysics = () => {
      if (!active) return;

      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      const elapsed = now - lastTime;
      lastTime = now;

      // Delta time factor (normalized to 60fps = 16.67ms)
      const dt = Math.min(Math.max(elapsed / 16.67, 0.5), 2.0);

      let { x, y } = posRef.current;
      let { vx, vy } = velRef.current;

      let nextX = x + vx * dt;
      let nextY = y + vy * dt;
      let hit = false;

      if (nextX <= 0) {
        nextX = 0;
        vx = Math.abs(vx);
        hit = true;
      } else if (nextX >= maxX) {
        nextX = maxX;
        vx = -Math.abs(vx);
        hit = true;
      }

      if (nextY <= 0) {
        nextY = 0;
        vy = Math.abs(vy);
        hit = true;
      } else if (nextY >= maxY) {
        nextY = maxY;
        vy = -Math.abs(vy);
        hit = true;
      }

      velRef.current = { vx, vy };
      posRef.current = { x: nextX, y: nextY };

      if (hit) {
        colorIndexRef.current = (colorIndexRef.current + 1) % TWELVE_PALZEE_COLORS.length;
      }

      if (boxRef.current) {
        boxRef.current.setNativeProps({
          style: {
            transform: [{ translateX: nextX }, { translateY: nextY }],
            backgroundColor: TWELVE_PALZEE_COLORS[colorIndexRef.current],
          },
        });
      }

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      active = false;
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [cardWidth, cardHeight, maxX, maxY]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        ref={boxRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: [
            { translateX: initialX },
            { translateY: initialY },
          ],
          width: smileySize,
          height: smileySize,
          borderRadius: smileySize / 2,
          backgroundColor: TWELVE_PALZEE_COLORS[0],
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width: smileySize,
            height: smileySize,
            justifyContent: 'center',
            alignItems: 'center',
            transform: [{ rotate: spin }],
          }}
        >
          <Image
            source={require('../../assets/images/capture_smile.png')}
            style={{
              width: smileySize,
              height: smileySize,
              tintColor: '#000000',
            }}
            contentFit="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
};
