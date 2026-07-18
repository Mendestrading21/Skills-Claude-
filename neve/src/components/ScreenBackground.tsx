import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { palette } from '@/theme';

/**
 * Layered dark-glass backdrop: a graphite vertical gradient with a warm orange
 * halo near the action zone and a discreet cold halo opposite. No heavy image.
 */
export function ScreenBackground() {
  const { width, height } = useWindowDimensions();
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[palette.background, palette.backgroundElevated, palette.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="warm" cx="82%" cy="16%" r="65%">
            <Stop offset="0" stopColor={palette.accent} stopOpacity={0.20} />
            <Stop offset="0.5" stopColor={palette.accentDark} stopOpacity={0.06} />
            <Stop offset="1" stopColor={palette.background} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="cold" cx="12%" cy="92%" r="60%">
            <Stop offset="0" stopColor={palette.info} stopOpacity={0.10} />
            <Stop offset="1" stopColor={palette.background} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#warm)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#cold)" />
      </Svg>
    </View>
  );
}
