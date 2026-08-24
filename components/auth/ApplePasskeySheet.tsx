import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

interface ApplePasskeySheetProps {
  visible: boolean;
  onClose: () => void;
  onAuthenticate: () => void;
}

export const ApplePasskeySheet: React.FC<ApplePasskeySheetProps> = ({
  visible,
  onClose,
  onAuthenticate,
}) => {
  const isDark = useFastColorScheme() === 'dark';
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <View style={styles.sheet}>
          {/* Close Button (top-right X) */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="#3C3C43"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>

          {/* FaceID & App Logo Badge */}
          <View style={styles.iconContainer}>
            {/* Blue Face ID Frame */}
            <Svg width={52} height={52} viewBox="0 0 54 54" fill="none">
              {/* Top Left Bracket */}
              <Path
                d="M4 18V12C4 7.58172 7.58172 4 12 4H18"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {/* Top Right Bracket */}
              <Path
                d="M36 4H42C46.4183 4 50 7.58172 50 12V18"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {/* Bottom Left Bracket */}
              <Path
                d="M4 36V42C4 46.4183 7.58172 50 12 50H18"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {/* Bottom Right Bracket */}
              <Path
                d="M36 50H42C46.4183 50 50 46.4183 50 42V36"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              {/* Face ID Eyes & Smile */}
              <Path
                d="M20 22V24M34 22V24M23 30C25 33 29 33 31 30M27 24V28"
                stroke="#007AFF"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </Svg>

            {/* Overlapping Pal App Logo Badge */}
            <View style={styles.avatarBadge}>
              <Image
                source={isDark ? require('../../assets/images/pal_logo_dark.png') : require('../../assets/images/pal_logo_light.png')}
                style={{ width: 22, height: 22, borderRadius: 11 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Sign In</Text>

          {/* Prompt Description */}
          <Text style={styles.subtitle}>
            Sign in to &quot;palzee&quot; with your passkey for &quot;Pratham&quot; saved in &quot;Passwords&quot;?
          </Text>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={onAuthenticate}
          >
            <Text style={styles.primaryButtonText}>Use Passkey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={onClose}
          >
            <Text style={styles.secondaryButtonText}>More Options</Text>
          </TouchableOpacity>

          {/* iOS Bottom Home Bar Indicator */}
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#F4F6F8',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3E5E8',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  iconContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4F6F8',
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1C1C1E',
    lineHeight: 22,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 6,
  },
});
