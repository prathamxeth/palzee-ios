import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { Colors } from '../../constants/colors';
import { User } from '../../types';

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera?: () => void;
  palCode?: string;
  user?: User;
  isDark?: boolean;
  selectedThemeColor?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  visible,
  onClose,
  onOpenCamera,
  isDark: isDarkProp,
  selectedThemeColor = 'cyan',
}) => {
  const insets = useSafeAreaInsets();
  const systemScheme = useColorScheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : systemScheme === 'dark';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';

  const [messageText, setMessageText] = useState('');
  const [modalVisible, setModalVisible] = useState(visible);

  const expandAnim = useRef(new Animated.Value(0)).current;
  const smileyRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    smileyRotateAnim.setValue(0);
    const rotateLoop = Animated.loop(
      Animated.timing(smileyRotateAnim, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateLoop.start();
    return () => rotateLoop.stop();
  }, [modalVisible]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      expandAnim.setValue(0);

      Animated.spring(expandAnim, {
        toValue: 1,
        mass: 0.7,
        damping: 17,
        stiffness: 160,
        useNativeDriver: true,
      }).start();
    } else if (modalVisible) {
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(expandAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const screenBg = isDark ? '#000000' : '#F5F5F7';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  if (!modalVisible) return null;

  // iOS App Open / Close Hover Expand Interpolations (Origin from Top Right Chat Icon)
  const scale = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 1],
  });

  const opacity = expandAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 0.9, 1],
  });

  const translateX = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [140, 0],
  });

  const translateY = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              opacity,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
            },
          ]}
        >
          <DynamicGlowContainer selectedThemeColor={selectedThemeColor} showBorder={true} showGlow={false}>
            <View
              style={[
                styles.container,
                {
                  backgroundColor: screenBg,
                  paddingTop: Math.max(insets.top, 12),
                  paddingBottom: Math.max(insets.bottom, 12),
                },
              ]}
            >
              {/* 1. TOP NAVIGATION HEADER BAR (MATCHING IMAGE 1 & IMAGE 2) */}
              <View style={styles.headerRow}>
                {/* LEFT: BACK CHEVRON BUTTON */}
                <LiquidGlassIconButton idPrefix="btnChatBack" isDark={isDark} onPress={handleClose}>
                  <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
                </LiquidGlassIconButton>

                {/* CENTER: VLOG LIQUID GLASS PILL BUTTON */}
                <View style={styles.vlogCenterPillWrapper} pointerEvents="box-none">
                  <View
                    style={[
                      styles.vlogLiquidPillBtn,
                      {
                        backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <BlurView
                      intensity={35}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={[styles.vlogPillText, { color: textColor }]}>Vlog</Text>
                  </View>
                </View>

                {/* BALANCING SPACER */}
                <View style={{ width: 44 }} />
              </View>

              {/* 2. FLEXIBLE CHAT CONTENT AREA (DISMISS KEYBOARD ON TOUCH) */}
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.bodyContainer} />
              </TouchableWithoutFeedback>

              {/* 3. BOTTOM FLOATING MESSAGE INPUT BAR WITH KEYBOARD AVOIDING */}
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
              >
                <View style={styles.bottomInputBarRow}>
                  {/* LEFT: LIQUID GLASS PILL BUTTON WITH ROTATING SMILEY AVATAR (OPENS CAMERA INSTANTLY) */}
                  <TouchableOpacity
                    style={[
                      styles.smileyGlassPillBtn,
                      {
                        backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      setModalVisible(false);
                      onClose();
                      if (onOpenCamera) onOpenCamera();
                    }}
                  >
                    <BlurView
                      intensity={35}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={[styles.innerSmileyCircle, { backgroundColor: edgeColor }]}>
                      <Animated.Image
                        source={require('../../assets/images/custom_rotate_smiley.png')}
                        style={[
                          styles.smileyAvatarImg,
                          {
                            transform: [
                              {
                                rotate: smileyRotateAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: ['0deg', '360deg'],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* CENTER/RIGHT: LIQUID GLASS MESSAGE INPUT PILL WITH INTEGRATED SEND BUTTON */}
                  <View
                    style={[
                      styles.messageInputPillContainer,
                      {
                        backgroundColor: isDark ? 'rgba(30,30,34,0.75)' : 'rgba(255,255,255,0.85)',
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                      },
                    ]}
                  >
                    <BlurView
                      intensity={35}
                      tint={isDark ? 'dark' : 'light'}
                      style={StyleSheet.absoluteFill}
                    />

                    <TextInput
                      style={[styles.textInputStyle, { color: textColor }]}
                      placeholder="message"
                      placeholderTextColor="#8E8E93"
                      value={messageText}
                      onChangeText={setMessageText}
                    />

                    {/* RIGHT SEND ARROW BUTTON INSIDE INPUT PILL */}
                    <TouchableOpacity
                      style={[
                        styles.sendArrowBtn,
                        {
                          backgroundColor:
                            messageText.trim().length > 0
                              ? edgeColor
                              : isDark
                              ? 'rgba(255, 255, 255, 0.12)'
                              : 'rgba(0, 0, 0, 0.08)',
                        },
                      ]}
                      activeOpacity={0.75}
                      onPress={() => setMessageText('')}
                    >
                      <Ionicons
                        name="arrow-up"
                        size={18}
                        color={messageText.trim().length > 0 ? '#000000' : isDark ? '#8E8E93' : '#666666'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </DynamicGlowContainer>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'relative',
  },
  vlogCenterPillWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  vlogLiquidPillBtn: {
    width: 80,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vlogPillText: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  bodyContainer: {
    flex: 1,
  },
  bottomInputBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  smileyGlassPillBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerSmileyCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  smileyAvatarImg: {
    width: 30.8,
    height: 30.8,
    tintColor: '#000000',
    resizeMode: 'contain',
  },
  messageInputPillContainer: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 6,
    position: 'relative',
  },
  textInputStyle: {
    flex: 1,
    fontSize: 17,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    paddingVertical: 0,
    paddingRight: 8,
  },
  sendArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
