# Glass Wealth App — Décisions produit & techniques

## Identité

- **Nom : Névé** (terme alpin désignant la neige compactée en haute montagne — évoque la Suisse,
  l’accumulation, la clarté). Centralisé dans [`src/config/app.ts`](../neve/src/config/app.ts)
  (`APP_NAME`) : renommage en une seule édition.
- **Logo original** : monogramme SVG (crête à double pic avec calotte de neige), dégradé orange.
  Aucun élément (nom, logo, texte, composition) copié de l’application de référence.

## Choix techniques réversibles (assumés en autonomie)

| Sujet | Décision | Raison |
|------|----------|--------|
| Persistance | AsyncStorage derrière `PersistenceService` (au lieu d’Expo SQLite) | Fiable multi-plateforme (dont web), testable, aucune dépendance native fragile ; l’interface reste swappable vers SQLite. |
| Graphiques | Composants custom `react-native-svg` | Contrôle total du rendu premium, compatibilité web, pas de lib de charts fragile vis-à-vis de la version Expo. |
| Emplacement | Sous-dossier `neve/` | Préserve la liste `awesome-skills` existante du dépôt. |
| Vérification visuelle | Export web + Chromium/Playwright | Le rendu natif iOS/iPad n’est pas exécutable en environnement headless. |

## Modèle financier

- Montants stockés en **unités mineures entières** (centimes) → pas de dérive flottante.
- `amountMinor` des transactions = **magnitude positive** ; le sens (entrée/sortie) découle du `type`.
- Distinction stricte **valeur saisie / prix de marché / valeur calculée** ; les montants d’affichage
  sont dérivés, jamais la source de vérité.
- FX : rate direct, inverse ou triangulé via devise pivot ; les conversions manquantes sont **signalées**
  (`fxComplete: false`) au lieu d’être masquées.
- Snapshots d’historique de démo **dérivés** du patrimoine net calculé → le chiffre du cockpit et la
  courbe coïncident toujours.

## Confidentialité & honnêteté (non négociables)

- 100 % local par défaut ; aucun envoi distant sans consentement explicite (réglages).
- Aucune connexion bancaire simulée, aucun ordre, aucun conseil garanti.
- L’assistant est **local, à règles**, avec disclaimer visible ; il ne remplace pas un avis professionnel.
- Prix toujours étiquetés « indicatifs » avec source et fraîcheur.
- Suppression des données réellement effective (`resetAll` efface le stockage).

## Données de démonstration

- Jeu CHF cohérent (comptes, actions/ETF/fonds, crypto USD, 3e pilier, immobilier, hypothèque,
  revenus/dépenses, 12 mois d’historique). **Séparé** des données utilisateur : « charger la démo »
  remplace tout ; « commencer à vide » part d’un état propre. Aucune fusion automatique.

## Limites connues (assumées honnêtement)

- Pas d’intégration de prix/FX distants réelle (interfaces prêtes, mode local uniquement).
- Rendu natif iOS/Android non exécuté ici : vérification via export web (les effets `expo-blur`,
  haptique et SQLite se comportent différemment en natif). Le fallback opaque couvre Android/transparence réduite.
- Verrouillage Face ID : préférence exposée, implémentation native à brancher (aucune promesse fausse).
- Édition d’une position existante : archivage + suppression fournis ; l’édition complète des champs
  reste une évolution.
- Listes d’activité : rendu direct (adapté au volume de démo) ; une virtualisation `FlatList` serait
  souhaitable pour de très grands historiques.
