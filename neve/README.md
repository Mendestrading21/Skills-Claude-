# Névé — Patrimoine, portefeuille & budget

> Application mobile privée de suivi de patrimoine, investissements, dettes et budget.
> Interface **dark-glass** premium. Ni banque, ni courtier — aucun ordre n’est passé.

Construite avec **Expo (SDK 57) · React Native · TypeScript · Expo Router · Zustand · react-native-svg**.
100 % locale par défaut ; les données restent sur l’appareil.

## Démarrage

```bash
cd neve
npm install
npm run start        # puis 'i' (iOS), 'a' (Android) ou 'w' (web)
```

- iOS / iPad : `npm run ios` (nécessite macOS + simulateur) ou l’app Expo Go.
- Android : `npm run android`.
- Web : `npm run web`.

Au premier lancement, l’onboarding propose de **charger un jeu de démonstration** (CHF) ou de
**commencer à vide**.

### Version web hébergée

`npm run web:build` génère un bundle statique dans `dist/`. L’application est une SPA 100 % locale
(aucun appel réseau) : elle peut donc être servie comme simple fichier statique.

## Vérification

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (config Expo)
npm test             # jest — calculs financiers, import/migrations, sélecteurs
npm run web:build    # expo export --platform web (bundle statique)
```

État actuel : `typecheck` 0 erreur · `lint` 0 problème · `test` 46/46 · export web OK.

## Architecture

```
src/
├── app/            # routes Expo Router (cockpit, patrimoine, portefeuille, budget, activité,
│                   #   onboarding, réglages, assistant, détail de position)
├── components/     # design system dark-glass réutilisable
├── features/       # écrans par fonctionnalité + formulaires d’ajout
├── domain/         # calculs financiers PURS et testés (money, fx, portefeuille, patrimoine…)
├── data/           # persistance, données de démo, migrations, validation Zod, import/export
├── services/       # prix, FX, assistant, notifications, haptique (interfaces + mode local)
├── store/          # Zustand + sélecteurs dérivés
├── theme/          # tokens & ThemeProvider
├── i18n/           # copie française centralisée
├── types/          # modèle de données
└── config/         # identité de l’app (nom centralisé dans config/app.ts)
```

## Fonctionnalités

- **Cockpit** : patrimoine net, variation, actifs/passifs/liquidités, historique interactif
  (1M/3M/6M/1A/Tout), allocation, cash-flow, budget, alertes, synthèse.
- **Patrimoine** : actifs & passifs regroupés par classe / compte / devise, positions, dettes.
- **Portefeuille** : valeur, coût de revient, gain latent, allocation en anneau, contributeurs,
  exposition par devise, détail de position (source de prix, fraîcheur, disclaimer).
- **Budget** : revenus/dépenses/net, budgets par catégorie avec jauges, récurrences, objectifs.
- **Activité** : timeline filtrable (type, période).
- **Assistant local** : réponses informatives à partir des données locales, avec disclaimer.
- **Réglages** : devise, transparence réduite, confidentialité, export JSON/CSV, import validé,
  chargement démo, effacement complet.

## Confidentialité

Vos données restent sur cet appareil tant que vous n’activez pas une fonction distante. Aucune
connexion bancaire simulée, aucun conseil garanti, aucune exécution d’ordre.

## Documentation

- [`../docs/glass-wealth-implementation-plan.md`](../docs/glass-wealth-implementation-plan.md)
- [`../docs/glass-wealth-product-decisions.md`](../docs/glass-wealth-product-decisions.md)
