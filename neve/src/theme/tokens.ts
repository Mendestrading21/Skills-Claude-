/**
 * Design tokens — the single source of truth for the dark-glass visual language.
 * Semantic meaning is stable even if raw values are tuned for contrast.
 */

export const palette = {
  background: '#07090D',
  backgroundElevated: '#0C1016',
  surface: 'rgba(255,255,255,0.055)',
  surfaceStrong: 'rgba(255,255,255,0.085)',
  surfacePressed: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#F7F8FA',
  textSecondary: '#A6ADBA',
  textMuted: '#737B89',
  accent: '#FF8A1F',
  accentLight: '#FFB15A',
  accentDark: '#C85F08',
  positive: '#31D17C',
  negative: '#FF6464',
  warning: '#F5B942',
  info: '#58A6FF',
  categoryViolet: '#A979FF',
  categoryPink: '#F36AB5',
  categoryCyan: '#4FD7D1',
  onAccent: '#1A1206',
} as const;

/**
 * Opaque fallbacks used when transparency is reduced (accessibility) or when
 * blur is unavailable. These keep contrast without relying on backdrop blur.
 */
export const opaque = {
  surface: '#12161D',
  surfaceStrong: '#171C24',
  surfacePressed: '#1E242E',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  control: 12,
  button: 16,
  card: 22,
  panel: 30,
  pill: 999,
} as const;

export const fontSize = {
  display: 40,
  screenTitle: 28,
  sectionTitle: 19,
  cardTitle: 15,
  cardValue: 24,
  body: 16,
  meta: 13,
  micro: 11,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
} as const;

/** Category colours cycled for allocation / budget category chips. */
export const categoryColors = [
  palette.accent,
  palette.categoryViolet,
  palette.info,
  palette.categoryCyan,
  palette.categoryPink,
  palette.positive,
  palette.warning,
  palette.accentLight,
] as const;

export type ThemeTokens = {
  palette: typeof palette;
  opaque: typeof opaque;
  spacing: typeof spacing;
  radii: typeof radii;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  shadow: typeof shadow;
};

export const tokens: ThemeTokens = {
  palette,
  opaque,
  spacing,
  radii,
  fontSize,
  fontWeight,
  shadow,
};
