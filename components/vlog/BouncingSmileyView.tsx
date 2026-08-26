import React, { useState, useEffect, useRef } from 'react';
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

import { useFastColorScheme } from '../../hooks/useFastColorScheme';

export const BouncingSmileyView: React.FC<BouncingSmileyViewProps> = ({
  cardWidth,
  cardHeight,
}) => {
  const colorScheme = useFastColorScheme();
  const isDark = colorScheme === 'dark';

  const smileySize = 60.0;
  const padding = 0;

  const maxX = Math.max(0, cardWidth - smileySize);
  const maxY = Math.max(0, cardHeight - smileySize);

  const [pos, setPos] = useState({
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY),
  });

  const [colorIndex, setColorIndex] = useState(0);

  const velRef = useRef({
    vx: 3.20,
    vy: 2.75,
  });

  const posRef = useRef(pos);
  posRef.current = pos;

  const animFrameRef = useRef<number | null>(null);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotateAnim]);

  useEffect(() => {
    let active = true;

    const updatePhysics = () => {
      if (!active) return;

      let { x, y } = posRef.current;
      let { vx, vy } = velRef.current;

      let nextX = x + vx;
      let nextY = y + vy;
      let hit = false;

      if (nextX <= padding) {
        nextX = padding;
        vx = Math.abs(vx);
        hit = true;
      } else if (nextX >= maxX) {
        nextX = maxX;
        vx = -Math.abs(vx);
        hit = true;
      }

      if (nextY <= padding) {
        nextY = padding;
        vy = Math.abs(vy);
        hit = true;
      } else if (nextY >= maxY) {
        nextY = maxY;
        vy = -Math.abs(vy);
        hit = true;
      }

      velRef.current = { vx, vy };
      setPos({ x: nextX, y: nextY });

      if (hit) {
        setColorIndex((prev) => (prev + 1) % TWELVE_PALZEE_COLORS.length);
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

  const currentColor = TWELVE_PALZEE_COLORS[colorIndex];

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          width: smileySize,
          height: smileySize,
          borderRadius: smileySize / 2,
          backgroundColor: currentColor,
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
