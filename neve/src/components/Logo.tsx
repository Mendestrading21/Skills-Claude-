import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { palette } from '@/theme';

/**
 * Original monogram: an upward twin-peak "N" formed by a rising line — evokes
 * an alpine ridge and growth. Deliberately distinct from any reference mark.
 */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <LinearGradient id="logoGrad" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={palette.accentDark} />
            <Stop offset="0.55" stopColor={palette.accent} />
            <Stop offset="1" stopColor={palette.accentLight} />
          </LinearGradient>
        </Defs>
        {/* Ridge line: base-left up to a peak, dip, second higher peak. */}
        <Path
          d="M7 39 L7 15 L20 31 L27 20 L41 39"
          stroke="url(#logoGrad)"
          strokeWidth={5}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        {/* Snow cap accent on the higher peak. */}
        <Path
          d="M27 20 L31 25 L27 27 L23.5 24.5 Z"
          fill={palette.text}
          opacity={0.9}
        />
      </Svg>
    </View>
  );
}
