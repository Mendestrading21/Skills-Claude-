# Glass Wealth App — Plan d’implémentation

Application : **Névé** — suivi de patrimoine, portefeuille et budget, interface dark-glass premium.
Emplacement dans le dépôt : [`neve/`](../neve).

## État initial

Le dépôt hébergeait une liste `awesome-claude-skills` (README + `.github`). Aucune application
mobile préexistante. Le skill `build-glass-wealth-app` a été copié dans
[`.claude/skills/build-glass-wealth-app`](../.claude/skills/build-glass-wealth-app).

Décision : construire l’application dans un sous-dossier `neve/` afin de **préserver** la liste
existante, plutôt que d’écraser la racine du dépôt.

## Architecture retenue

- **Expo SDK 57 + React Native 0.86 + TypeScript** (strict), Expo Router (routes typées).
- **État** : Zustand (`src/store`) avec sélecteurs dérivés purs.
- **Persistance locale** : interface `PersistenceService` (`src/data/persistence.ts`), implémentation
  AsyncStorage (localStorage sur web) — swappable vers SQLite/chiffré sans toucher aux consommateurs.
- **Domaine financier pur et testé** (`src/domain`) : money, FX, portefeuille, patrimoine net,
  cash-flow, budget, historique. Aucune dépendance UI → testable en Node.
- **Design system centralisé** (`src/theme`) : tokens, `ThemeProvider` (mode transparence réduite).
- **Graphiques custom** en `react-native-svg` (courbe, anneau, sparkline, barres).
- **Services abstraits** (`src/services`) : prix de marché, FX, assistant, notifications, haptique —
  tous avec un mode local fonctionnel.
- **Architecture orientée fonctionnalités** (`src/features/*`), composants réutilisables (`src/components`).

Arborescence : `app/` (routes) · `components/` · `features/` · `domain/` · `data/` · `services/` ·
`store/` · `theme/` · `types/` · `i18n/` · `utils/` · `config/`.

## Phases (toutes livrées)

1. Scaffold Expo propre, nettoyage du template, navigation. ✅
2. Thème dark-glass + composants de base (GlassCard, MetricCard, charts…). ✅
3. Modèle de données, persistance, migrations, validation Zod, import/export. ✅
4. Onboarding (5 étapes, sortie possible). ✅
5. Cockpit avec données réelles du store. ✅
6. Formulaires d’ajout (compte, position, transaction, dette, budget). ✅
7. Portefeuille + détail de position. ✅
8. Budget et transactions. ✅
9. Activité et filtres. ✅
10. Réglages, import/export, confidentialité. ✅
11. Assistant local optionnel. ✅
12. Finitions iPad, accessibilité, tests, vérification visuelle web. ✅

## Risques et mitigations

- **Rendu natif non vérifiable en headless** → export web Expo + captures Chromium pour la
  vérification visuelle (9 écrans, 0 erreur console).
- **Modules natifs en test** → domaine pur sans dépendance native, testé avec Jest.
- **Prix distants indisponibles** → mode local + valeurs manuelles + libellés « prix indicatif ».

## Critères de réussite (atteints)

- `tsc --noEmit` : 0 erreur · `eslint` : 0 problème · `jest` : 46/46 · `expo export --platform web` : OK.
- Navigation complète, persistance locale, données de démo cohérentes et auto-consistantes.
- Design dark-glass premium et original (nom, logo, composition propres).

Voir [`glass-wealth-product-decisions.md`](./glass-wealth-product-decisions.md) pour les décisions clés.
