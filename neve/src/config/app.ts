/**
 * Centralised application identity and constants.
 * Changing the product name is a single edit here.
 */

export const APP_NAME = 'Névé';
export const APP_TAGLINE = 'Votre patrimoine, au clair.';
export const APP_SLUG = 'neve';

/** Bump when the persisted schema shape changes; drives migrations. */
export const SCHEMA_VERSION = 1;

/** Storage key namespace for local persistence. */
export const STORAGE_KEY = 'neve.state.v1';

/** Default base currency used before onboarding completes. */
export const DEFAULT_BASE_CURRENCY = 'CHF';

/** Supported base currencies offered in onboarding / settings. */
export const SUPPORTED_CURRENCIES = ['CHF', 'EUR', 'USD'] as const;

/** Informative, non-advisory microcopy reused across the app. */
export const DISCLAIMERS = {
  price:
    'Prix indicatif provenant d’une source publique. Il peut être retardé ou incomplet.',
  assistant:
    'Les réponses sont informatives et ne remplacent pas un avis professionnel.',
  privacy:
    'Vos données restent sur cet appareil tant que vous n’activez pas une fonction distante.',
  deletion:
    'Cette action efface définitivement les données locales de l’application.',
  demo: 'Données de démonstration. À remplacer par vos propres données.',
} as const;
