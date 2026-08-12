import React, { useState } from 'react';
import { CameraType } from 'expo-camera';
import PalCameraPreview from '../../components/camera/PalCameraPreview';

type TimerMode = 'off' | '3s' | '5s' | 'timelapse' | 'jump_cut';

interface CameraScreenProps {
  onCapture?: (uri: string) => void;
  onClose?: () => void;
  selectedThemeColor?: string;
}

export default function CameraScreen({ onCapture, onClose, selectedThemeColor = 'cyan' }: CameraScreenProps) {
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

  return (
    <PalCameraPreview
      selectedThemeColor={selectedThemeColor}
      onCaptureSuccess={onCapture}
      onClose={onClose}
      timerMode={timerMode}
      onToggleTimerMode={toggleTimerMode}
      facing={facing}
      onToggleFacing={toggleFacing}
    />
  );
}
