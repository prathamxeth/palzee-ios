import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { DynamicGlowContainer } from '../ui/DynamicGlowContainer';
import { LiquidGlassIconButton } from '../ui/LiquidGlassIconButton';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/typography';
import { User } from '../../types';

interface ChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onOpenCamera?: () => void;
  onOpenVlog?: () => void;
  palCode?: string;
  user?: User;
  isDark?: boolean;
  selectedThemeColor?: string;
  vlogList?: Array<{ id: string; uri: string; caption?: string; timestamp: string; isMuted?: boolean; rate?: number; mode?: string }>;
  activeVideoUri?: string | null;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  visible,
  onClose,
  onOpenCamera,
  onOpenVlog,
  user,
  isDark: isDarkProp,
  selectedThemeColor = 'cyan',
  vlogList = [],
  activeVideoUri,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const systemScheme = useColorScheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : systemScheme === 'dark';
  const edgeColor = Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] || '#FE9068';
  const username = user?.displayName || user?.email?.split('@')[0] || 'apple_user';

  const displayList = vlogList && vlogList.length > 0 
    ? vlogList 
    : activeVideoUri 
      ? [{ id: 'active_default', uri: activeVideoUri, caption: 'Hi', timestamp: '7:26 PM' }] 
      : [{ id: 'demo_default', uri: 'https://assets.mixkit.co/videos/preview/mixkit-portrait-of-a-fashion-woman-with-silver-makeup-39875-large.mp4', caption: 'Hi', timestamp: '7:26 PM' }];

  const getDayLabel = (item?: any) => {
    if (!item) return 'Today';
    if (item.dayLabel) return item.dayLabel;
    return 'Today';
  };

  const [messageText, setMessageText] = useState('');
  const [modalVisible, setModalVisible] = useState(visible);
  const [previewVideoModal, setPreviewVideoModal] = useState(false);

  const getNearestHourText = (rawTimestamp?: string) => {
    const t = rawTimestamp || '19:00';
    const parts = t.split(':');
    if (parts.length === 2) {
      let h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (isNaN(h)) h = 19;
      if (!isNaN(m) && m >= 30) h = (h + 1) % 24;
      return `${String(h).padStart(2, '0')}:00`;
    }
    return t;
  };

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
                <View style={[styles.bodyContainer, { justifyContent: 'flex-end', paddingBottom: 8 }]}>
                  {displayList.length > 0 && (
                    <>
                      {/* TIMESTAMP / DAY HEADER ABOVE VIDEO THUMBNAIL (CHARCOAL IN DARK MODE, GREY IN LIGHT MODE) */}
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 14,
                          fontFamily: Fonts.SystemRoundedMedium,
                          color: isDark ? '#8E8E93' : '#636366',
                          marginBottom: 10,
                        }}
                      >
                        {`${getDayLabel(displayList[0])} ${displayList[0]?.timestamp || '7:26 PM'}`}
                      </Text>

                      {/* THUMBNAIL BUBBLE AS LIVE PREVIEW OF SENT VIDEO PAL (RIGHT-ALIGNED, CLICKABLE TO OPEN PREVIEW) */}
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setPreviewVideoModal(true)}
                        style={{
                          alignSelf: 'flex-end',
                          marginRight: 16,
                          marginBottom: 14,
                          width: 146,
                          height: 86,
                          borderRadius: 20,
                          overflow: 'hidden',
                          backgroundColor: '#000000',
                          borderWidth: 1,
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.10)',
                        }}
                      >
                        <Video
                          source={{ uri: displayList[0]?.uri }}
                          style={StyleSheet.absoluteFill}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={true}
                          isLooping={true}
                          isMuted={true}
                          usePoster={true}
                          posterSource={{ uri: displayList[0]?.uri }}
                          posterStyle={{ resizeMode: 'cover' }}
                          rate={displayList[0]?.rate || 1.0}
                          shouldCorrectPitch={true}
                        />
                      </TouchableOpacity>

                      {/* VIEW PAL BOX BELOW THUMBNAIL (SHOWN ONLY WHEN VIDEO PALS ARE CAPTURED) */}
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => {
                          setModalVisible(false);
                          onClose();
                          if (onOpenVlog) onOpenVlog();
                        }}
                        style={{
                          marginHorizontal: 16,
                          height: 58,
                          borderRadius: 24,
                          backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 22,
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 17,
                            fontFamily: Fonts.SystemRoundedBold,
                            color: isDark ? '#FFFFFF' : '#000000',
                          }}
                        >
                          {getDayLabel(displayList[0])}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontFamily: Fonts.SystemRoundedSemibold,
                            color: edgeColor,
                          }}
                        >
                          view pal
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>

              {/* 3. BOTTOM FLOATING MESSAGE INPUT BAR WITH KEYBOARD AVOIDING */}
              <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={8}
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

      {/* FULL-SCREEN VIDEO PREVIEW OVERLAY MODAL (MATCHING IMAGE 2 EXACTLY) */}
      <Modal
        visible={previewVideoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVideoModal(false)}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' }]}>
          {/* TOP HEADER BAR INSIDE MODAL: LEFT CLOSE CROSS ICON + CENTER "Hi" PILL */}
          <View style={{ position: 'absolute', top: Math.max(insets.top, 16), left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 50 }}>
            <LiquidGlassIconButton
              idPrefix="btnClosePreviewOverlay"
              isDark={isDark}
              onPress={() => setPreviewVideoModal(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </LiquidGlassIconButton>

            {/* CENTER "Hi" PILL BUTTON MATCHING IMAGE 2 */}
            <View
              style={{
                width: 52,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(30,30,34,0.75)',
                borderColor: 'rgba(255,255,255,0.15)',
                borderWidth: 1,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />
              <Text style={{ fontSize: 16, fontFamily: Fonts.SystemRoundedBold, color: '#FFFFFF' }}>Hi</Text>
            </View>

            <View style={{ width: 44 }} />
          </View>

          {/* CENTER 16:9 VIDEO PREVIEW CARD BOX (MATCHING IMAGE 2 EXACTLY) */}
          <View
            style={{
              width: screenWidth - 32,
              height: (screenWidth - 32) * (9 / 16),
              borderRadius: 28,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#000000',
              shadowColor: '#000000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Video
              source={{ uri: displayList[0]?.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay={true}
              isLooping={true}
              isMuted={false}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.20)' }]} pointerEvents="none" />

            {/* TOP LEFT USER ROW INSIDE CARD: DEFAULT PROFILE SMILEY CIRCLE + FULL USERNAME */}
            <View
              style={{
                position: 'absolute',
                top: 14,
                left: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                zIndex: 20,
              }}
              pointerEvents="none"
            >
              <View
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: 13.5,
                  backgroundColor: edgeColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                }}
              >
                <Image
                  source={require('../../assets/images/capture_smile.png')}
                  style={{ width: 15, height: 15, tintColor: '#000000' }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ fontSize: 16, fontFamily: Fonts.SystemRoundedSemibold, color: '#FFFFFF', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
                {username}
              </Text>
            </View>

            {/* CENTER TIME TEXT & CAPTION OVERLAY */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 20,
              }}
              pointerEvents="none"
            >
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: Fonts.DelaGothicOne,
                  color: '#FFFFFF',
                  textAlign: 'center',
                  textShadowColor: 'rgba(0, 0, 0, 0.6)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 5,
                }}
              >
                {getNearestHourText(displayList[0]?.timestamp)}
              </Text>
              {!!displayList[0]?.caption && (
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.SystemRoundedSemibold,
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginTop: 2,
                    textShadowColor: 'rgba(0, 0, 0, 0.6)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 3,
                  }}
                >
                  {displayList[0]?.caption}
                </Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
    fontFamily: Fonts.SystemRoundedSemibold,
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
    fontFamily: Fonts.SystemRounded,
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
