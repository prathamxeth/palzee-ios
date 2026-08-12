import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { cameraWarmupStore } from '../../utils/cameraWarmupStore';

export function CameraPrewarmer() {
  const [cameraGranted, setCameraGranted] = useState(cameraWarmupStore.isCameraGranted());

  useEffect(() => {
    cameraWarmupStore.checkAndWarmupPermissions().then((res) => {
      setCameraGranted(res.camera);
    });

    const unsubscribe = cameraWarmupStore.subscribe(() => {
      setCameraGranted(cameraWarmupStore.isCameraGranted());
    });

    return unsubscribe;
  }, []);

  if (!cameraGranted) {
    return null;
  }

  return (
    <View style={styles.hiddenContainer} pointerEvents="none">
      <CameraView
        style={styles.hiddenCamera}
        facing="back"
        mode="video"
        onCameraReady={() => {
          console.log('[CameraPrewarmer] Background Camera stream warm & ready');
          cameraWarmupStore.setPrewarmed(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    left: -9999,
    top: -9999,
    width: 1,
    height: 1,
    opacity: 0.01,
    overflow: 'hidden',
  },
  hiddenCamera: {
    width: 1,
    height: 1,
  },
});
