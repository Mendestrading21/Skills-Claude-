import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { palette } from '@/theme';

/**
 * Névé — a snow-capped twin summit. "Névé" is the granular permanent snow at a
 * glacier's head, so the mark is literal: two peaks in a warm gradient, each
 * crowned with a white snow cap. Chosen to read unambiguously as a mountain
 * (not an abstract glyph) even at favicon size.
 */

// Filled orange mountain range: base-left → left peak → saddle → main peak → base-right.
const MOUNTAIN = 'M4 39 L18 17 L24.5 25.5 L32 9 L44 39 Z';
// White snow cap on the main (right) peak, jagged lower edge.
const CAP_MAIN = 'M32 9 L27.7 18.4 L29.9 16.2 L31.5 18.6 L33.5 15.8 L35.8 18.4 Z';
// Smaller snow cap on the left peak.
const CAP_LEFT = 'M18 17 L15.1 21.5 L16.8 19.8 L18.2 21.6 L19.8 19.6 L21.4 21.5 Z';

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
        <Path d={MOUNTAIN} fill="url(#logoGrad)" strokeLinejoin="round" />
        <Path d={CAP_MAIN} fill={palette.text} />
        <Path d={CAP_LEFT} fill={palette.text} opacity={0.92} />
      </Svg>
    </View>
  );
}
