import type { AccountKind, AssetClass } from '@/types';

/**
 * Tasteful emojis used as content decoration (never for navigation icons).
 * Resolution is keyword-based so it works with user-created accounts/categories
 * without any schema change.
 */

const ACCOUNT_BY_KIND: Record<AccountKind, string> = {
  bank: '🏦',
  cash: '💵',
  brokerage: '📈',
  crypto: '🪙',
  pension: '🛡️',
  real_estate: '🏠',
  other: '💼',
};

const ACCOUNT_KEYWORDS: [RegExp, string][] = [
  [/robo|géré|gere|advisor/i, '🤖'],
  [/2e? ?pilier|lpp|caisse de pension|prévoyance|prevoyance/i, '🏛️'],
  [/3e? ?pilier|3a|3b/i, '🛡️'],
  [/épargne|epargne|saving/i, '🐷'],
  [/néobanque|neobanque|neo/i, '📲'],
  [/eur|euro/i, '💶'],
  [/usd|dollar/i, '💵'],
  [/espèce|espece|cash|liquid/i, '💶'],
  [/courant|checking/i, '🏦'],
  [/immo|appart|maison|logement/i, '🏠'],
];

export function accountEmoji(name: string, kind: AccountKind): string {
  for (const [re, emoji] of ACCOUNT_KEYWORDS) if (re.test(name)) return emoji;
  return ACCOUNT_BY_KIND[kind] ?? '💼';
}

const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/salaire|revenu|paie|income/i, '💰'],
  [/logement|loyer|rent|maison/i, '🏠'],
  [/aliment|course|grocery|food/i, '🛒'],
  [/transport|train|bus|essence|voiture/i, '🚆'],
  [/loisir|cinéma|cinema|sport|jeu/i, '🎬'],
  [/resto|restaurant|repas|café|cafe/i, '🍽️'],
  [/santé|sante|pharma|médecin|medecin/i, '💊'],
  [/abonnement|streaming|netflix|spotify/i, '📱'],
  [/voyage|vacance|trip/i, '✈️'],
  [/impôt|impot|tax/i, '🧾'],
  [/épargne|epargne|saving/i, '🐷'],
];

export function categoryEmoji(name: string | undefined, kind?: 'income' | 'expense'): string {
  if (name) for (const [re, emoji] of CATEGORY_KEYWORDS) if (re.test(name)) return emoji;
  return kind === 'income' ? '💰' : '💳';
}

const ASSET_CLASS_EMOJI: Record<AssetClass, string> = {
  cash: '💵',
  equity: '📊',
  etf: '🗂️',
  fund: '📈',
  bond: '📜',
  crypto: '🪙',
  pension: '🛡️',
  real_estate: '🏠',
  commodity: '🪙',
  other: '💼',
};

export function assetClassEmoji(assetClass: AssetClass): string {
  return ASSET_CLASS_EMOJI[assetClass] ?? '💼';
}

/** Greeting emoji chosen once at app start (module scope keeps render pure). */
const START_HOUR = new Date().getHours();

export function greeting(): { text: string; emoji: string } {
  if (START_HOUR < 6) return { text: 'Bonne nuit', emoji: '🌙' };
  if (START_HOUR < 12) return { text: 'Bonjour', emoji: '☀️' };
  if (START_HOUR < 18) return { text: 'Bel après-midi', emoji: '🌤️' };
  return { text: 'Bonsoir', emoji: '🌆' };
}
