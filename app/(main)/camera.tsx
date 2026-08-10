import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/colors';

interface CameraScreenProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export default function CameraScreen({ onCapture, onClose }: CameraScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : current === 'on' ? 'auto' : 'off'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        if (photo?.uri) {
          onCapture(photo.uri);
        }
      } catch (e) {
        console.error('Failed to take picture', e);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>
        <SafeAreaView style={styles.controlsOverlay}>
          {/* Top Row Controls */}
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
              <Text style={styles.iconText}>✕</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={toggleFlash}>
              <Text style={styles.iconText}>⚡ {flash.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row Capture Controls */}
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.flipBtn} onPress={toggleFacing}>
              <Text style={styles.iconText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shutterBtn} onPress={takePicture}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  grantBtn: {
    backgroundColor: Colors.PalFireRed,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  grantBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  camera: {
    flex: 1,
  },
  controlsOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  iconText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  flipBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.PalFireRed,
  },
});
