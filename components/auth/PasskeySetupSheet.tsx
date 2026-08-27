import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import { useFastColorScheme } from '../../hooks/useFastColorScheme';

interface PasskeySetupSheetProps {
  visible: boolean;
  onClose: () => void;
  onSetupPasskey: (name: string, email: string) => Promise<void>;
}

export const PasskeySetupSheet: React.FC<PasskeySetupSheetProps> = ({
  visible,
  onClose,
  onSetupPasskey,
}) => {
  const isDark = useFastColorScheme() === 'dark';
  const [name, setName] = useState('Pratham');
  const [email, setEmail] = useState('pratham@palzee.app');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    await onSetupPasskey(name.trim(), email.trim());
    setLoading(false);
  };

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

          {/* Face ID & Pal Logo Header Badge */}
          <View style={styles.iconContainer}>
            <Svg width={48} height={48} viewBox="0 0 54 54" fill="none">
              <Path
                d="M4 18V12C4 7.58172 7.58172 4 12 4H18"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <Path
                d="M36 4H42C46.4183 4 50 7.58172 50 12V18"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <Path
                d="M4 36V42C4 46.4183 7.58172 50 12 50H18"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <Path
                d="M36 50H42C46.4183 50 50 46.4183 50 42V36"
                stroke="#007AFF"
                strokeWidth={3.5}
                strokeLinecap="round"
              />
              <Path
                d="M20 22V24M34 22V24M23 30C25 33 29 33 31 30M27 24V28"
                stroke="#007AFF"
                strokeWidth={3}
                strokeLinecap="round"
              />
            </Svg>

            <View style={styles.avatarBadge}>
              <Image
                source={isDark ? require('../../assets/images/pal_logo_dark.png') : require('../../assets/images/pal_logo_light.png')}
                style={{ width: 22, height: 22, borderRadius: 11 }}
                contentFit="contain"
              />
            </View>
          </View>

          {/* Title & Description */}
          <Text style={styles.title}>Set Up Passkey</Text>
          <Text style={styles.subtitle}>
            Save a Passkey for Palzee in Apple Passwords &amp; iCloud Keychain for seamless passwordless login.
          </Text>

          {/* Form Inputs */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Name"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ACCOUNT EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@domain.com"
              placeholderTextColor="#8E8E93"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                Save Passkey in iCloud Keychain
              </Text>
            )}
          </TouchableOpacity>

          {/* Secondary Action Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>

          {/* Home Bar Handle Indicator */}
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
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3E5E8',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  iconContainer: {
    position: 'relative',
    width: 56,
    height: 52,
    marginBottom: 12,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#3C3C43',
    lineHeight: 20,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
});
