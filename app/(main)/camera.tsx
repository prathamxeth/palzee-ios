import React from 'react';
import PalCameraPreview from '../../components/camera/PalCameraPreview';

interface CameraScreenProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
  selectedThemeColor?: string;
}

export default function CameraScreen({ onCapture, onClose, selectedThemeColor = 'cyan' }: CameraScreenProps) {
  return (
    <PalCameraPreview
      selectedThemeColor={selectedThemeColor}
      onCaptureSuccess={onCapture}
      onClose={onClose}
    />
  );
}
