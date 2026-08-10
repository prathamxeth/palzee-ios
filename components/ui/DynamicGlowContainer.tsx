import React from 'react';
import { StyleSheet, View, ViewStyle, useColorScheme } from 'react-native';
import Svg, { Defs, Filter, FeGaussianBlur, Rect } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface DynamicGlowContainerProps {
  selectedThemeColor: string;
  showBorder: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const DynamicGlowContainer: React.FC<DynamicGlowContainerProps> = ({
  selectedThemeColor,
  showBorder = true,
  children,
  style,
}) => {
  const systemScheme = useColorScheme();
  const isDark = systemScheme === 'dark';
  const containerBg = isDark ? '#000000' : Colors.PalBackground;

  const accentColor =
    Colors.BorderGlow[selectedThemeColor as keyof typeof Colors.BorderGlow] ||
    '#11D5F3';

  return (
    <View style={[styles.wrapper, { backgroundColor: containerBg }]}>
      {/* ONE SINGLE UNIFIED SCREEN EDGE COLOUR BOUNDARY LINE */}
      <View
        style={[
          styles.outerContainer,
          { backgroundColor: containerBg },
          showBorder && {
            borderColor: accentColor,
            borderWidth: 3.0,
            shadowColor: accentColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.85,
            shadowRadius: 7.5,
            elevation: 12,
          },
          style,
        ]}
      >
        <View style={[styles.innerContainer, { backgroundColor: containerBg }]}>
          {children}
        </View>

        {/* SOFT GAUSSIAN BLURRED GLOW EMANATING 360 DEGREES OUT OF ALL CORNERS & EDGES */}
        {showBorder && (
          <View style={styles.inwardGlowOverlay} pointerEvents="none">
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <Filter id="cornerGlowBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <FeGaussianBlur stdDeviation="5" />
                </Filter>
              </Defs>

              <Rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx={48}
                ry={48}
                stroke={accentColor}
                strokeWidth={12}
                strokeOpacity={0.26}
                fill="none"
                filter="url(#cornerGlowBlur)"
              />
            </Svg>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  outerContainer: {
    flex: 1,
    borderRadius: 48,
    backgroundColor: '#000000',
    position: 'relative',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 45,
    overflow: 'hidden',
    position: 'relative',
    margin: 3.0,
  },
  inwardGlowOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    overflow: 'hidden',
    zIndex: 999,
  },
});
