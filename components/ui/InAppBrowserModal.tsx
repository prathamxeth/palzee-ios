import React from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Fonts } from '../../constants/typography';

export interface InAppBrowserModalProps {
  visible: boolean;
  url: string;
  title?: string;
  onClose: () => void;
  accentColor?: string;
}

export const InAppBrowserModal: React.FC<InAppBrowserModalProps> = ({
  visible,
  url,
  title,
  onClose,
  accentColor = '#8A2BE2',
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!visible || !url) return null;

  // Extract clean domain for display e.g. "palzee.fun/feedback.html"
  const cleanDisplayUrl = url.replace(/^https?:\/\//, '');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0F0A1A' : '#F7F6F3' }]}>
        {/* TOP BAR / HEADER */}
        <View style={[styles.topHeader, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)' }]}>
          <BlurView intensity={50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          
          {/* URL / TITLE LOCK ICON */}
          <View style={styles.headerTitleContainer}>
            <Ionicons name="lock-closed" size={13} color={isDark ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.55)'} style={{ marginRight: 6 }} />
            <Text style={[styles.displayUrlText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]} numberOfLines={1}>
              {title || cleanDisplayUrl}
            </Text>
          </View>

          {/* DONE BUTTON */}
          <TouchableOpacity style={[styles.doneButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)' }]} activeOpacity={0.7} onPress={onClose}>
            <Text style={[styles.doneButtonText, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* WEBVIEW CONTENT */}
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: url }}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={accentColor} />
              </View>
            )}
            style={{ flex: 1, backgroundColor: isDark ? '#0F0A1A' : '#FFFFFF' }}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  displayUrlText: {
    fontSize: 15,
    fontFamily: Fonts.SystemRoundedSemibold,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  doneButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  doneButtonText: {
    fontSize: 15,
    fontFamily: Fonts.SystemRoundedBold,
    fontWeight: 'bold',
  },
  webViewContainer: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
