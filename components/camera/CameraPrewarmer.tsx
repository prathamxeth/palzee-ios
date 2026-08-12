import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CameraView } from 'expo-camera';
import { cameraWarmupStore } from '../../utils/cameraWarmupStore';

export function CameraPrewarmer() {
  useEffect(() => {
    cameraWarmupStore.checkAndWarmupPermissions();
  }, []);

  return null;
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
