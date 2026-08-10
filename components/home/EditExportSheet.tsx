import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';

interface EditExportSheetProps {
  visible: boolean;
  onClose: () => void;
}

const BG_COLORS = ['#000000', '#F7F6F3', '#FFB443', '#AC87FA', '#60A5FA', '#10B981'];
const EMOJIS = ['😊', '🔥', '🍕', '🎉', '🌟', '🐢', '❤️', '🚀'];

export const EditExportSheet: React.FC<EditExportSheetProps> = ({ visible, onClose }) => {
  const [selectedBg, setSelectedBg] = useState(BG_COLORS[0]);
  const [selectedEmoji, setSelectedEmoji] = useState(EMOJIS[0]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Export Slideshow</Text>

          {/* Background Colors */}
          <Text style={styles.sectionHeader}>Background Color</Text>
          <View style={styles.colorRow}>
            {BG_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: c },
                  selectedBg === c && styles.activeSwatch,
                ]}
                onPress={() => setSelectedBg(c)}
              />
            ))}
          </View>

          {/* Emoji Selection */}
          <Text style={styles.sectionHeader}>Missed Hour Emoji</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiItem, selectedEmoji === e && styles.activeEmoji]}
                onPress={() => setSelectedEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportBtn} onPress={onClose}>
              <Text style={styles.exportText}>Export 9:16 Video</Text>
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
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
  },
  title: {
    fontFamily: Fonts.Bricolage,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    marginTop: 10,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeSwatch: {
    borderColor: Colors.PalFireRed,
  },
  emojiRow: {
    gap: 12,
    paddingVertical: 6,
    marginBottom: 24,
  },
  emojiItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeEmoji: {
    backgroundColor: Colors.PalCloudYellow,
    borderWidth: 2,
    borderColor: Colors.PalOrangeFruit,
  },
  emojiText: {
    fontSize: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  exportBtn: {
    flex: 2,
    backgroundColor: Colors.PalFireRed,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  exportText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
