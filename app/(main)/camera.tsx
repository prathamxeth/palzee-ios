import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, useColorScheme, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import PalCameraPreview from '../../components/camera/PalCameraPreview';
import { DynamicGlowContainer } from '../../components/ui/DynamicGlowContainer';
import { LiquidGlassIconButton } from '../../components/ui/LiquidGlassIconButton';

type TimerMode = 'off' | '3s' | '5s' | 'timelapse' | 'jump_cut';

interface CameraScreenProps {
  onCapture?: (uri: string) => void;
  onClose?: () => void;
  selectedThemeColor?: string;
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

          {/* TOP-LEFT CLOSE CROSS BUTTON OVERLAY (INSIDE CAMERA FRAME MATCHING REFERENCE IMAGE & APP GLASS ICON SPECS) */}
          <View style={styles.topLeftCloseBtnWrapper}>
            <LiquidGlassIconButton
              idPrefix="btnCloseCameraFrame"
              isDark={isDark}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={iconColor} />
            </LiquidGlassIconButton>
          </View>
        </View>

        {/* BOTTOM CONTROLS ROW BELOW CAMERA FRAME MATCHING APP LIQUID GLASS ICON SPECS */}
        <View style={[styles.bottomControlsRow, { width: cameraWidth }]}>
          {/* LEFT: TIMER BUTTON */}
          <LiquidGlassIconButton
            idPrefix="btnCameraTimer"
            isDark={isDark}
            onPress={toggleTimerMode}
          >
            <Text style={[styles.bottomControlTimerText, { color: iconColor }]}>
              {timerMode === '3s' ? '3' : timerMode === '5s' ? '5' : timerMode === 'timelapse' ? 'T' : timerMode === 'jump_cut' ? 'J' : '5'}
            </Text>
          </LiquidGlassIconButton>

          {/* RIGHT: FLIP CAMERA VIEW BUTTON */}
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
  topLeftCloseBtnWrapper: {
    position: 'absolute',
    top: 24,
    left: 24,
    zIndex: 99999,
  },
  bottomControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 38,
    paddingRight: 18,
    paddingVertical: 12,
  },
  bottomControlTimerText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
