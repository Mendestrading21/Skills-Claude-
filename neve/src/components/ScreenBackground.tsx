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
          <RadialGradient id="warm" cx="84%" cy="12%" r="70%">
            <Stop offset="0" stopColor={palette.accent} stopOpacity={0.26} />
            <Stop offset="0.45" stopColor={palette.accentDark} stopOpacity={0.08} />
            <Stop offset="1" stopColor={palette.background} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="mint" cx="88%" cy="88%" r="60%">
            <Stop offset="0" stopColor={palette.positive} stopOpacity={0.13} />
            <Stop offset="1" stopColor={palette.background} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="violet" cx="10%" cy="8%" r="55%">
            <Stop offset="0" stopColor={palette.categoryViolet} stopOpacity={0.12} />
            <Stop offset="1" stopColor={palette.background} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="cold" cx="8%" cy="94%" r="58%">
            <Stop offset="0" stopColor={palette.info} stopOpacity={0.10} />
            <Stop offset="1" stopColor={palette.background} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#warm)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#mint)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#violet)" />
        <Rect x="0" y="0" width={width} height={height} fill="url(#cold)" />
      </Svg>
    </View>
  );
}
