import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { chatService } from '../../services/chatService';
import { MessageDbItem, User } from '../../types';

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  palCode: string;
  user: User;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  visible,
  onClose,
  palCode,
  user,
}) => {
  const [messages, setMessages] = useState<MessageDbItem[]>([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!visible || !palCode) return;

    chatService.getMessages(palCode).then(setMessages);

    const subscription = chatService.subscribeToMessages(palCode, (newMsg) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [visible, palCode]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const content = text.trim();
    setText('');
    await chatService.postMessage(palCode, user.id, user.displayName, content);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Group Chat ({palCode})</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isMine = item.senderId === user.id;
              return (
                <View style={[styles.msgRow, isMine ? styles.myMsgRow : styles.theirMsgRow]}>
                  {!isMine && <Text style={styles.senderName}>{item.senderDisplayName}</Text>}
                  <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.msgText, isMine ? styles.myMsgText : styles.theirMsgText]}>
                      {item.content}
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* Input Bar */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Send a message..."
              placeholderTextColor="#999"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 60,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  title: {
    fontFamily: Fonts.Bricolage,
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeIcon: {
    fontSize: 20,
    color: '#666',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  msgRow: {
    maxWidth: '80%',
  },
  myMsgRow: {
    alignSelf: 'flex-end',
  },
  theirMsgRow: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    marginLeft: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: Colors.PalFireRed,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 15,
  },
  myMsgText: {
    color: '#FFFFFF',
  },
  theirMsgText: {
    color: '#1A1A1A',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#EEE',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A1A',
  },
  sendBtn: {
    backgroundColor: Colors.PalFireRed,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
