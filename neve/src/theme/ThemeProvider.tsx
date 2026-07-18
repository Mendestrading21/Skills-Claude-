import React, { createContext, useContext, useMemo } from 'react';

import {
  fontSize,
  fontWeight,
  opaque,
  palette,
  radii,
  shadow,
  spacing,
} from './tokens';

export type ThemeColors = { [K in keyof typeof palette]: string };

export type Theme = {
  /** Effective colours, already resolved for reduced-transparency mode. */
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  shadow: typeof shadow;
  /** True when blur surfaces are allowed. */
  glassEnabled: boolean;
  reducedTransparency: boolean;
};

function buildTheme(reducedTransparency: boolean): Theme {
  const colors = reducedTransparency
    ? {
        ...palette,
        surface: opaque.surface,
        surfaceStrong: opaque.surfaceStrong,
        surfacePressed: opaque.surfacePressed,
      }
    : { ...palette };

  return {
    colors,
    spacing,
    radii,
    fontSize,
    fontWeight,
    shadow,
    glassEnabled: !reducedTransparency,
    reducedTransparency,
  };
}

const ThemeContext = createContext<Theme>(buildTheme(false));

export function ThemeProvider({
  reducedTransparency = false,
  children,
}: {
  reducedTransparency?: boolean;
  children: React.ReactNode;
}) {
  const theme = useMemo(
    () => buildTheme(reducedTransparency),
    [reducedTransparency],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
