# Product Specification — Application patrimoniale personnelle

## Proposition de valeur

Centraliser manuellement le patrimoine, les investissements, les dettes, le budget et le cash-flow dans une application privée, lisible et contrôlable.

L’application n’est ni une banque, ni un courtier, ni un gestionnaire de fortune. Elle ne passe aucun ordre.

## Utilisateurs principaux

- particulier qui veut connaître son patrimoine net ;
- investisseur qui suit plusieurs comptes et classes d’actifs ;
- foyer qui suit budget et cash-flow ;
- utilisateur suisse avec CHF comme devise principale, tout en gérant EUR et USD.

## Principes produit

1. La saisie manuelle reste toujours disponible.
2. Une donnée distante peut enrichir, jamais bloquer.
3. Chaque montant doit pouvoir être expliqué.
4. Les calculs doivent être déterministes et testés.
5. L’utilisateur peut exporter et supprimer ses données.
6. L’interface montre l’essentiel avant le détail.
7. Les alertes sont informatives, pas anxiogènes.
8. Les fonctions “intelligentes” doivent rester optionnelles.

## MVP complet

### Entités
- comptes ;
- actifs ;
- passifs ;
- positions ;
- transactions ;
- valorisations ;
- budgets ;
- catégories ;
- objectifs ;
- taux de change ;
- snapshots patrimoniaux ;
- préférences.

### Flux principaux
- créer un profil local ;
- choisir CHF/EUR/USD ;
- ajouter un compte ;
- ajouter une position ;
- enregistrer une transaction ;
- ajouter une dette ;
- créer un budget ;
- voir le patrimoine net ;
- voir l’allocation ;
- consulter une position ;
- exporter ses données ;
- réinitialiser l’application.

### Calculs
- actif total ;
- passif total ;
- patrimoine net ;
- valeur d’une position ;
- coût de revient ;
- gain latent ;
- gain réalisé si implémenté ;
- cash-flow ;
- budget consommé ;
- allocation ;
- performance par période ;
- exposition par devise.

## Hors périmètre initial

À ne pas simuler :
- connexion bancaire réelle ;
- agrégation Open Banking ;
- trading ;
- exécution d’ordres ;
- fiscalité complète ;
- conseil financier réglementé ;
- synchronisation cloud chiffrée sans backend réel ;
- notification présentée comme temps réel sans infrastructure.

Les préparer par interfaces, mais ne pas mentir sur leur disponibilité.

## Écrans

### Cockpit
Vue synthétique, actionnable et personnalisée.

### Patrimoine
Actifs et passifs regroupés, filtres, détail et historique.

### Portefeuille
Positions, performance, allocation, devises, transactions.

### Budget
Budgets, cash-flow, catégories, récurrences, objectifs.

### Activité
Timeline globale et filtres.

### Assistant
Questions sur les données et explications.

### Réglages
Devise, confidentialité, export, import, sécurité, mentions.

## Ton rédactionnel

- français naturel ;
- phrases courtes ;
- vocabulaire financier exact mais accessible ;
- aucun ton vendeur agressif ;
- aucune promesse ;
- pas de “vous êtes riche” ou jugement ;
- préférer “À vérifier”, “Donnée estimée”, “Prix indicatif”.

## Libellés conseillés

- Patrimoine net
- Actifs
- Passifs
- Liquidités
- Investissements
- Performance
- Cash-flow
- Budget restant
- Valeur actuelle
- Coût de revient
- Gain latent
- Dernière mise à jour
- Source du prix
- Valeur manuelle
- Données de démonstration

## Microcopies critiques

Prix :
> Prix indicatif provenant d’une source publique. Il peut être retardé ou incomplet.

Assistant :
> Les réponses sont informatives et ne remplacent pas un avis professionnel.

Confidentialité :
> Vos données restent sur cet appareil tant que vous n’activez pas une fonction distante.

Suppression :
> Cette action efface définitivement les données locales de l’application.
