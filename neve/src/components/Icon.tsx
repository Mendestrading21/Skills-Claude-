import React from 'react';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import { palette } from '@/theme';

export type IconName =
  | 'cockpit'
  | 'wealth'
  | 'portfolio'
  | 'budget'
  | 'activity'
  | 'assistant'
  | 'settings'
  | 'plus'
  | 'close'
  | 'chevronRight'
  | 'chevronLeft'
  | 'chevronDown'
  | 'arrowUp'
  | 'arrowDown'
  | 'download'
  | 'upload'
  | 'trash'
  | 'lock'
  | 'shield'
  | 'info';

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

/** Coherent rounded-stroke icon family used across navigation and actions. */
export function Icon({ name, size = 22, color = palette.textSecondary, strokeWidth = 2 }: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'cockpit' && (
        <>
          <Path d="M3 12a9 9 0 0 1 18 0" {...common} />
          <Path d="M12 12l4-3" {...common} />
          <Circle cx={12} cy={12} r={1.6} fill={color} stroke="none" />
          <Path d="M3 12v3M21 12v3" {...common} />
        </>
      )}
      {name === 'wealth' && (
        <>
          <Path d="M3 7l9-4 9 4-9 4-9-4z" {...common} />
          <Path d="M3 12l9 4 9-4" {...common} />
          <Path d="M3 17l9 4 9-4" {...common} />
        </>
      )}
      {name === 'portfolio' && (
        <>
          <Path d="M4 19V5" {...common} />
          <Polyline points="4 15 9 10 13 13 20 6" {...common} />
          <Path d="M20 6v4M20 6h-4" {...common} />
        </>
      )}
      {name === 'budget' && (
        <>
          <Circle cx={12} cy={12} r={8} {...common} />
          <Path d="M12 12V4M12 12l6 4" {...common} />
        </>
      )}
      {name === 'activity' && (
        <Polyline points="3 12 7 12 10 5 14 19 17 12 21 12" {...common} />
      )}
      {name === 'assistant' && (
        <>
          <Path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" {...common} />
          <Circle cx={18} cy={17} r={1.4} fill={color} stroke="none" />
        </>
      )}
      {name === 'settings' && (
        <>
          <Circle cx={12} cy={12} r={3} {...common} />
          <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" {...common} />
        </>
      )}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...common} />}
      {name === 'chevronRight' && <Polyline points="9 6 15 12 9 18" {...common} />}
      {name === 'chevronLeft' && <Polyline points="15 6 9 12 15 18" {...common} />}
      {name === 'chevronDown' && <Polyline points="6 9 12 15 18 9" {...common} />}
      {name === 'arrowUp' && <Path d="M12 19V5M6 11l6-6 6 6" {...common} />}
      {name === 'arrowDown' && <Path d="M12 5v14M6 13l6 6 6-6" {...common} />}
      {name === 'download' && <Path d="M12 3v12M8 11l4 4 4-4M4 21h16" {...common} />}
      {name === 'upload' && <Path d="M12 21V9M8 13l4-4 4 4M4 3h16" {...common} />}
      {name === 'trash' && <Path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" {...common} />}
      {name === 'lock' && (
        <>
          <Path d="M6 11h12v9H6z" {...common} />
          <Path d="M9 11V8a3 3 0 0 1 6 0v3" {...common} />
        </>
      )}
      {name === 'shield' && <Path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6l7-3z" {...common} />}
      {name === 'info' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Path d="M12 11v5M12 8h.01" {...common} />
        </>
      )}
    </Svg>
  );
}
