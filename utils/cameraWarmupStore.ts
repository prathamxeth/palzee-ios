import { Camera } from 'expo-camera';

type Listener = () => void;

class CameraWarmupStore {
  private cameraGranted: boolean = false;
  private micGranted: boolean = false;
  private prewarmed: boolean = false;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.checkAndWarmupPermissions();
  }

  public async checkAndWarmupPermissions(): Promise<{ camera: boolean; mic: boolean }> {
    try {
      const [camRes, micRes] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Camera.getMicrophonePermissionsAsync(),
      ]);
      const isCamGranted = camRes.granted;
      const isMicGranted = micRes.granted;

      let changed = false;
      if (this.cameraGranted !== isCamGranted) {
        this.cameraGranted = isCamGranted;
        changed = true;
      }
      if (this.micGranted !== isMicGranted) {
        this.micGranted = isMicGranted;
        changed = true;
      }

      if (changed) {
        this.notify();
      }

      return { camera: isCamGranted, mic: isMicGranted };
    } catch (e) {
      console.warn('[CameraWarmupStore] Check permissions error:', e);
      return { camera: this.cameraGranted, mic: this.micGranted };
    }
  }

  public setCameraGranted(granted: boolean) {
    if (this.cameraGranted !== granted) {
      this.cameraGranted = granted;
      this.notify();
    }
  }

  public setMicGranted(granted: boolean) {
    if (this.micGranted !== granted) {
      this.micGranted = granted;
      this.notify();
    }
  }

  public setPrewarmed(prewarmed: boolean) {
    if (this.prewarmed !== prewarmed) {
      this.prewarmed = prewarmed;
      this.notify();
    }
  }

  public isCameraGranted(): boolean {
    return this.cameraGranted;
  }

  public isMicGranted(): boolean {
    return this.micGranted;
  }

  public isPrewarmed(): boolean {
    return this.prewarmed;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

export const cameraWarmupStore = new CameraWarmupStore();
