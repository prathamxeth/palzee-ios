import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Image, useColorScheme } from 'react-native';

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

  const smileySize = 62.5;
  const padding = 12;

  const maxX = Math.max(10, cardWidth - smileySize - padding);
  const maxY = Math.max(10, cardHeight - smileySize - padding);

  const [pos, setPos] = useState({
    x: padding + Math.floor(Math.random() * (maxX - padding)),
    y: padding + Math.floor(Math.random() * (maxY - padding)),
  });

  const [colorIndex, setColorIndex] = useState(0);

  const velRef = useRef({
    vx: 2.02,
    vy: 1.72,
  });

  const posRef = useRef(pos);
  posRef.current = pos;

  const animFrameRef = useRef<number | null>(null);

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
        <Image
          source={require('../../assets/images/capture_smile.png')}
          style={{ width: 55, height: 55, tintColor: '#000000', transform: [{ scale: 1.25 }] }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};
