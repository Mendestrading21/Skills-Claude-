---
name: build-glass-wealth-app
description: Conçoit, développe, refond ou complète une application mobile de suivi de patrimoine, portefeuille, budget et cash-flow avec une interface premium dark glass. À utiliser uniquement quand l’utilisateur demande explicitement de construire ou transformer cette application de bout en bout.
when_to_use: Utiliser pour une app iPhone/iPad ou mobile de patrimoine personnel, portefeuille, investissements, budget, transactions, multi-devises, graphiques et assistant financier informatif. Ne pas utiliser pour une simple correction isolée.
argument-hint: "[nom-optionnel-de-l-app] [objectif-optionnel]"
disable-model-invocation: true
allowed-tools: Read Write Edit Glob Grep Bash
---

# Mission

Construis dans le dépôt courant une application mobile de gestion patrimoniale personnelle, simple à utiliser, visuellement premium et réellement fonctionnelle.

Le résultat doit reprendre les qualités générales des captures présentes dans `references/screenshots/` :
- application financière sombre et élégante ;
- orange chaud comme accent principal ;
- visualisation claire du patrimoine, du portefeuille et des budgets ;
- cartes riches, graphiques lisibles et navigation mobile directe.

Ne copie jamais le nom, le logo, les textes, les illustrations, la composition exacte ni les actifs de l’application de référence. Crée une identité originale avec un langage visuel **dark glass / glassmorphism financier**, plus moderne, plus transparent et plus raffiné.

`$ARGUMENTS` peut contenir le nom souhaité de l’application ou une priorité particulière. Si aucun nom n’est fourni, détecte le nom existant dans le dépôt. S’il n’y en a aucun, utilise temporairement `Patrimoine` et centralise ce nom pour permettre son remplacement en une seule modification.

# Règle d’exécution

Travaille de manière autonome jusqu’à obtenir le meilleur résultat exécutable raisonnablement possible.

- Ne t’arrête pas après un plan, une maquette ou quelques composants.
- Audite, décide, implémente, lance, vérifie, corrige et documente.
- Ne demande pas de validation pour les choix réversibles.
- Ne pose une question que lorsqu’une information externe indispensable manque réellement : secret, compte développeur, certificat, identifiant d’API privé ou décision juridique.
- Si une intégration externe bloque, crée une abstraction propre et un mode local fonctionnel avec données de démonstration.
- Préserve les fonctionnalités existantes qui marchent.
- Ne supprime pas du code utile sans comprendre son rôle.
- N’affirme jamais qu’un écran ou un flux fonctionne sans l’avoir vérifié.
- Laisse le dépôt dans un état propre, typé, testable et lançable.

# Étape 1 — Audit obligatoire

Commence par lire :
- `README*`, `CLAUDE.md`, `AGENTS.md` ;
- les manifestes et fichiers de configuration ;
- l’arborescence de l’application ;
- les routes, écrans, composants, modèles de données et services ;
- les tests, scripts de build et conventions existantes ;
- les fichiers de design ou captures disponibles.

Détermine :
1. le framework et la plateforme ;
2. ce qui existe déjà ;
3. ce qui fonctionne réellement ;
4. ce qui manque ;
5. les risques de régression ;
6. la stratégie la plus simple pour livrer vite sans dette grossière.

Crée ou mets à jour `docs/glass-wealth-implementation-plan.md` avec :
- état initial ;
- architecture retenue ;
- phases d’implémentation ;
- risques ;
- critères de réussite.

Puis exécute immédiatement le plan.

# Choix de stack

## Dépôt existant

Respecte la stack existante lorsqu’elle est saine. Évite une réécriture complète uniquement pour imposer une préférence technique.

## Dépôt vide ou inutilisable

Utilise par défaut :
- Expo + React Native + TypeScript ;
- Expo Router ;
- composants React Native natifs ;
- `expo-blur` pour les surfaces vitrées ;
- `expo-linear-gradient` pour les fonds et reflets ;
- `react-native-svg` pour les formes et visualisations personnalisées ;
- Zustand pour l’état applicatif ;
- persistance locale structurée avec Expo SQLite ;
- Zod pour valider les données aux frontières ;
- une librairie de graphiques compatible avec la version Expo réellement installée, après vérification de compatibilité ;
- Jest et React Native Testing Library pour les tests utiles.

Détecte le gestionnaire de paquets existant. N’en mélange pas plusieurs.

Ne verrouille pas arbitrairement des versions anciennes. Utilise les versions stables compatibles avec le projet au moment de l’exécution.

# Architecture attendue

Sépare au minimum :
- `app/` ou routes ;
- `src/components/` ;
- `src/features/` ;
- `src/domain/` ;
- `src/data/` ;
- `src/services/` ;
- `src/store/` ;
- `src/theme/` ;
- `src/utils/` ;
- `src/types/` ;
- `src/i18n/` si la localisation existe.

Utilise une architecture orientée fonctionnalités, pas un dossier de composants géant et indifférencié.

Crée des interfaces de service pour :
- prix de marché ;
- taux de change ;
- sauvegarde/import/export ;
- assistant ;
- notifications.

Le mode local doit rester utilisable même sans API distante.

# Produit à construire

## Navigation principale

Utilise une barre inférieure compacte de quatre ou cinq destinations maximum :

1. **Cockpit**
2. **Portefeuille**
3. **Budget**
4. **Activité**
5. **Assistant** ou **Plus**, selon la place disponible

Le bouton d’action principal peut être flottant pour ajouter rapidement :
- un compte ;
- une position ;
- une transaction ;
- une dépense ;
- un revenu ;
- une dette ;
- une valeur manuelle.

## Onboarding

Construis un onboarding court :
1. proposition de valeur ;
2. devise principale ;
3. catégories de patrimoine suivies ;
4. confidentialité et mode local ;
5. ajout du premier compte ou chargement de données de démonstration.

Évite plus de cinq étapes. Permets de quitter l’onboarding et d’y revenir.

## Cockpit

Le cockpit doit afficher, sans surcharge :
- patrimoine net total ;
- variation absolue et relative ;
- actif total ;
- passif total ;
- liquidités disponibles ;
- performance du portefeuille ;
- cash-flow mensuel ;
- progression budgétaire ;
- allocation par classe d’actifs ;
- historique du patrimoine ;
- alertes et actions prioritaires ;
- mini synthèse hebdomadaire.

Chaque carte doit mener à un écran détaillé.

## Patrimoine

Gère au minimum :
- comptes bancaires ;
- espèces ;
- actions ;
- ETF ;
- fonds ;
- cryptomonnaies ;
- obligations ;
- 3e pilier / prévoyance ;
- immobilier ;
- autres actifs ;
- crédits, hypothèques et autres dettes.

Permets :
- saisie manuelle ;
- modification et suppression ;
- regroupement par compte, devise et classe d’actifs ;
- suivi de la valeur actuelle ;
- coût de revient ;
- gain/perte latent ;
- notes ;
- archivage ;
- valorisation manuelle lorsqu’aucun prix public n’est disponible.

## Portefeuille

Construis :
- vue consolidée ;
- positions ;
- allocation ;
- performance ;
- meilleurs et moins bons contributeurs ;
- exposition par devise ;
- exposition par secteur si les données existent ;
- détail d’une position ;
- historique des transactions ;
- ajout achat, vente, dividende, frais et transfert.

Les prix distants sont indicatifs. Affiche :
- la source ;
- l’heure de dernière mise à jour ;
- l’état en cache ;
- un état d’erreur propre ;
- une option de valeur manuelle.

## Budget et cash-flow

Construis :
- revenus récurrents et ponctuels ;
- dépenses récurrentes et ponctuelles ;
- catégories ;
- budgets mensuels ;
- barres de progression ;
- reste disponible ;
- cash-flow net ;
- comparaison au mois précédent ;
- transactions à venir ;
- objectifs d’épargne.

Utilise des cartes, jauges, anneaux et graphiques. Évite les longues listes sans hiérarchie.

## Activité

Affiche une timeline filtrable :
- transactions ;
- modifications de valorisation ;
- revenus ;
- dépenses ;
- dividendes ;
- transferts ;
- notes ;
- alertes.

Filtres :
- période ;
- type ;
- compte ;
- actif ;
- devise.

## Assistant informatif

L’assistant est optionnel et ne doit jamais bloquer l’application.

Il peut :
- répondre à partir des données locales ;
- expliquer une allocation ;
- résumer un mois ;
- repérer une concentration ;
- signaler un budget dépassé ;
- proposer des questions de réflexion ;
- expliquer les chiffres en langage simple.

Il ne doit pas :
- exécuter d’ordre ;
- prétendre remplacer un professionnel ;
- formuler une garantie de rendement ;
- masquer l’incertitude ;
- transmettre des données à un tiers sans consentement explicite.

Sans clé d’API, fournis un assistant local à règles simples et des réponses de démonstration clairement identifiées.

## Réglages et confidentialité

Construis :
- devise principale ;
- thème sombre par défaut ;
- format des nombres ;
- langue FR, avec architecture prête pour d’autres langues ;
- Face ID / verrouillage si compatible ;
- export JSON ou CSV ;
- import ;
- sauvegarde locale ;
- suppression complète des données ;
- consentement séparé pour toute fonction distante ;
- mentions informatives.

# Modèle de données

Lis `references/data-model.md` avant de créer les modèles.

Contraintes :
- montants stockés en unités décimales sûres ou unités mineures ;
- devise ISO 4217 ;
- dates ISO ;
- identifiants stables ;
- distinction entre valeur saisie, prix de marché et valeur calculée ;
- distinction entre actif et passif ;
- historique de valorisation ;
- migrations de schéma ;
- données de démonstration séparées des données utilisateur.

# Design system

Lis intégralement `references/design-system.md`.

Principes non négociables :
- fond graphite presque noir, jamais noir plat omniprésent ;
- surfaces vitrées semi-transparentes ;
- flou mesuré et performant ;
- bordures lumineuses discrètes ;
- orange chaud réservé à l’action et à la marque ;
- vert uniquement pour un résultat positif ;
- rouge uniquement pour une perte, une erreur ou un risque ;
- violet, bleu ou rose uniquement comme couleurs de catégories secondaires ;
- grande lisibilité des chiffres ;
- densité maîtrisée ;
- espaces généreux ;
- animations courtes et utiles ;
- aucun effet “casino”, néon excessif ou faux luxe.

Construis des composants réutilisables :
- `GlassCard`
- `MetricCard`
- `SectionHeader`
- `AmountText`
- `TrendBadge`
- `AllocationRing`
- `ProgressBar`
- `Sparkline`
- `EmptyState`
- `ErrorState`
- `SkeletonCard`
- `FilterChips`
- `QuickAction`
- `BottomSheetForm`
- `CurrencyAmountInput`
- `PrivacyBadge`

# Qualité UX

Chaque écran doit gérer :
- chargement ;
- vide ;
- erreur ;
- données partielles ;
- mode hors ligne ;
- texte long ;
- grands nombres ;
- petites et grandes tailles d’écran ;
- clavier ;
- zone sûre ;
- orientation iPad si la stack le permet.

Règles :
- une action primaire claire par écran ;
- aucun bouton factice ;
- aucun élément interactif sans retour visuel ;
- validation immédiate mais non agressive ;
- confirmations uniquement pour les actions destructrices ;
- formulaires fractionnés et simples ;
- cibles tactiles accessibles ;
- support du texte dynamique ;
- contraste suffisant ;
- réduction des animations respectée.

# Données de démonstration

Crée un jeu cohérent en CHF avec :
- compte courant ;
- épargne ;
- portefeuille actions et ETF ;
- petite allocation crypto ;
- 3e pilier ;
- bien immobilier optionnel ;
- hypothèque ;
- revenus et dépenses ;
- six à douze mois d’historique.

Les données doivent produire des graphiques crédibles et permettre de tester tous les états.

Ne mélange jamais ces données avec celles d’un utilisateur après qu’il a commencé sa propre saisie.

# Graphiques

Les graphiques doivent être utiles, tactiles et lisibles :
- courbe de patrimoine ;
- allocation en anneau ;
- performance ;
- cash-flow ;
- progression budgétaire ;
- exposition par devise.

Prévois :
- périodes 1M, 3M, 6M, 1A, Tout ;
- valeurs accessibles hors couleur ;
- infobulles ou sélection ;
- échelles cohérentes ;
- format CHF/EUR/USD ;
- états sans données ;
- réduction de la complexité sur petit écran.

# Performance

- Évite les re-renders globaux.
- Sélectionne précisément l’état Zustand.
- Mémoïse uniquement les calculs coûteux.
- Virtualise les longues listes.
- Ne floute pas de grandes surfaces animées en permanence.
- Mets en cache les prix et taux de change.
- Calcule les agrégats dans des sélecteurs testables.
- Évite les appels réseau au montage de chaque carte.

# Sécurité

- Aucun secret dans le dépôt ou l’application cliente.
- Aucun journal contenant des données financières sensibles.
- Validation de tous les imports.
- Limites de taille pour les fichiers.
- Échappement et nettoyage du texte utilisateur.
- Stockage sécurisé pour jetons et préférences sensibles.
- Suppression de données réellement effective.
- Pas de connexion bancaire fictive présentée comme réelle.
- Pas d’exécution d’ordres.
- Pas de conseil financier personnalisé présenté comme une recommandation professionnelle.

# Méthode d’implémentation

Travaille par tranches verticales :

1. lancement propre et navigation ;
2. thème et composants de base ;
3. modèle de données et persistance ;
4. onboarding ;
5. cockpit avec données réelles du store ;
6. ajout/modification d’un actif ;
7. portefeuille et position détaillée ;
8. budget et transactions ;
9. activité et filtres ;
10. réglages, import/export et confidentialité ;
11. assistant optionnel ;
12. finitions iPad, accessibilité, performances et tests.

Après chaque tranche :
- lance le formatage ;
- lance le lint ;
- lance le typecheck ;
- lance les tests pertinents ;
- ouvre ou démarre l’application si l’environnement le permet ;
- corrige immédiatement les erreurs.

# Vérification visuelle

Compare régulièrement le rendu aux captures de référence uniquement sur les qualités générales :
- profondeur ;
- hiérarchie ;
- contraste ;
- densité ;
- lisibilité ;
- premium financier ;
- qualité des cartes et graphiques.

Ne cherche pas le pixel-perfect par rapport à l’app tierce.

Lorsque l’environnement permet les captures d’écran :
- capture les écrans principaux ;
- inspecte les débordements ;
- vérifie les états vide et erreur ;
- vérifie petit iPhone et iPad ;
- corrige avant de conclure.

# Tests minimums

Écris des tests utiles pour :
- calcul du patrimoine net ;
- conversion de devises ;
- coût de revient ;
- gain/perte ;
- cash-flow ;
- progression budgétaire ;
- import invalide ;
- migrations ;
- sélecteurs du cockpit ;
- rendu des principaux états vides.

Ne cherche pas artificiellement un pourcentage de couverture élevé. Couvre les calculs qui peuvent produire une erreur financière.

# Livrables obligatoires

À la fin, le dépôt doit contenir :
- application lançable ;
- design system centralisé ;
- navigation complète ;
- persistance locale ;
- données de démonstration ;
- écrans principaux fonctionnels ;
- formulaires réels ;
- tests critiques ;
- documentation de lancement ;
- `.env.example` si nécessaire ;
- `docs/glass-wealth-implementation-plan.md` mis à jour ;
- `docs/glass-wealth-product-decisions.md` avec les décisions importantes ;
- aucun secret ;
- aucun bouton factice présenté comme terminé.

# Definition of Done

Lis `references/acceptance-checklist.md` et valide chaque point.

Avant de terminer :
1. exécute `scripts/verify.sh` ou l’équivalent adapté au dépôt ;
2. corrige les erreurs ;
3. vérifie `git diff` ;
4. résume précisément ce qui a été construit ;
5. liste les commandes réellement exécutées ;
6. indique les limites restantes sans les minimiser ;
7. propose uniquement les prochaines étapes qui nécessitent une décision externe.

Ne conclus pas par une promesse vague. Livre un état concret et vérifié.
