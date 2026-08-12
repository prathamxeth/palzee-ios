import React, { useState } from 'react';
import { StyleSheet, View, Image, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraType } from 'expo-camera';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import PalCameraPreview from '../../components/camera/PalCameraPreview';
import { DynamicGlowContainer } from '../../components/ui/DynamicGlowContainer';
import { LiquidGlassIconButton } from '../../components/ui/LiquidGlassIconButton';

type TimerMode = 'off' | '3s' | '5s' | 'timelapse' | 'jump_cut';

interface CameraScreenProps {
  onCapture?: (uri: string, caption?: string, isMuted?: boolean, rate?: number, mode?: string) => void;
  onClose?: () => void;
  selectedThemeColor?: string;
}

function CameraTimerIcon({ timerMode, iconColor }: { timerMode: TimerMode; iconColor: string }) {
  if (timerMode === '3s') {
    return (
      <Svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: [{ rotate: '90deg' }] }}>
        <Circle cx="12" cy="12" r="9.5" stroke={iconColor} strokeWidth="1.8" fill="none" />
        <SvgText
          x="12"
          y="15.8"
          fontSize="11"
          fontWeight="bold"
          fill={iconColor}
          textAnchor="middle"
          fontFamily="System"
        >
          3
        </SvgText>
      </Svg>
    );
  }
  if (timerMode === '5s') {
    return (
      <Svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: [{ rotate: '90deg' }] }}>
        <Circle cx="12" cy="12" r="9.5" stroke={iconColor} strokeWidth="1.8" fill="none" />
        <SvgText
          x="12"
          y="15.8"
          fontSize="11"
          fontWeight="bold"
          fill={iconColor}
          textAnchor="middle"
          fontFamily="System"
        >
          5
        </SvgText>
      </Svg>
    );
  }
  if (timerMode === 'timelapse') {
    return (
      <Svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: [{ rotate: '90deg' }] }}>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 12 + 5.5 * Math.cos(rad);
          const y1 = 12 + 5.5 * Math.sin(rad);
          const x2 = 12 + 9 * Math.cos(rad);
          const y2 = 12 + 9 * Math.sin(rad);
          return (
            <Path
              key={i}
              d={`M${x1},${y1} L${x2},${y2}`}
              stroke={iconColor}
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    );
  }
  if (timerMode === 'jump_cut') {
    return <Ionicons name="cut-outline" size={22} color={iconColor} style={{ transform: [{ rotate: '90deg' }] }} />;
  }
  return (
    <Image
      source={require('../../assets/images/custom_timer_icon.png')}
      style={{ width: 28, height: 28, tintColor: iconColor, transform: [{ rotate: '90deg' }] }}
      resizeMode="contain"
    />
  );
}

export default function CameraScreen({ onCapture, onClose, selectedThemeColor = 'cyan' }: CameraScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const screenWidth = windowWidth > 0 ? windowWidth : 390;
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const iconColor = isDark ? '#FFFFFF' : '#1C1C1E';

  const [timerMode, setTimerMode] = useState<TimerMode>('off');
  const [facing, setFacing] = useState<CameraType>('back');

  const toggleTimerMode = () => {
    const modes: TimerMode[] = ['off', '3s', '5s', 'timelapse', 'jump_cut'];
    const nextIndex = (modes.indexOf(timerMode) + 1) % modes.length;
    setTimerMode(modes[nextIndex]);
  };

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const sideMargin = 8.5;
  const cameraWidth = Math.max(screenWidth - sideMargin * 2, 320);

  return (
    <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#000000' : '#F5F5F7',
            paddingTop: Math.max(insets.top, 12),
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* MAIN CAMERA PREVIEW */}
        <View style={styles.cameraWrapper}>
          <PalCameraPreview
            selectedThemeColor={selectedThemeColor}
            onCaptureSuccess={onCapture}
            onClose={onClose}
            timerMode={timerMode}
            onToggleTimerMode={toggleTimerMode}
            facing={facing}
            onToggleFacing={toggleFacing}
          />
        </View>

        {/* BOTTOM CONTROLS ROW: TIMER & FLIP ICONS CENTERED AND EXACTLY 20DP APART FROM CENTER */}
        <View style={[styles.bottomControlsRow, { width: cameraWidth }]}>
          {/* LEFT OF CENTER (10DP LEFT): TIMER BUTTON */}
          <LiquidGlassIconButton
            idPrefix="btnCameraTimer"
            isDark={isDark}
            onPress={toggleTimerMode}
          >
            <CameraTimerIcon timerMode={timerMode} iconColor={iconColor} />
          </LiquidGlassIconButton>

          {/* RIGHT OF CENTER (10DP RIGHT): FLIP CAMERA VIEW BUTTON */}
          <LiquidGlassIconButton
            idPrefix="btnCameraFlip"
            isDark={isDark}
            onPress={toggleFacing}
          >
            <Image
              source={require('../../assets/images/custom_flip_icon.png')}
              style={{ width: 30, height: 30, tintColor: iconColor }}
              resizeMode="contain"
            />
          </LiquidGlassIconButton>
        </View>
      </View>
    </DynamicGlowContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cameraWrapper: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 45,
    paddingVertical: 12,
  },
});
