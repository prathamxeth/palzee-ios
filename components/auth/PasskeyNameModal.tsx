import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';

interface PasskeyNameModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (firstName: string, email: string) => void;
  loading: boolean;
}

export const PasskeyNameModal: React.FC<PasskeyNameModalProps> = ({
  visible,
  onClose,
  onSubmit,
  loading,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = () => {
    if (!name.trim() || !email.trim()) return;
    onSubmit(name.trim(), email.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Register Temp Profile</Text>
          <Text style={styles.subtitle}>Enter your details for fast Passkey login.</Text>

          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btn, styles.submitBtn]} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontFamily: Fonts.Bricolage,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F0F0F0',
  },
  submitBtn: {
    backgroundColor: Colors.PalFireRed,
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  submitText: {
    color: '#FFF',
    fontWeight: '600',
  },
});
