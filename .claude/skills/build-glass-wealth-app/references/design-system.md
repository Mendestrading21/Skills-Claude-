# Design System — Dark Glass Wealth

## Direction

Une application de patrimoine doit inspirer contrôle, calme, précision et confiance. Le style est premium mais sobre : graphite, verre fumé, halos chauds et chiffres très lisibles.

Les captures du dossier `screenshots/` sont des références d’ambiance, pas des fichiers à reproduire.

## Palette de base

Centraliser tous les tokens. Valeurs de départ recommandées :

```ts
export const colors = {
  background: "#07090D",
  backgroundElevated: "#0C1016",
  surface: "rgba(255,255,255,0.055)",
  surfaceStrong: "rgba(255,255,255,0.085)",
  surfacePressed: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.16)",
  text: "#F7F8FA",
  textSecondary: "#A6ADBA",
  textMuted: "#737B89",
  accent: "#FF8A1F",
  accentLight: "#FFB15A",
  accentDark: "#C85F08",
  positive: "#31D17C",
  negative: "#FF6464",
  warning: "#F5B942",
  info: "#58A6FF",
  categoryViolet: "#A979FF",
  categoryPink: "#F36AB5",
  categoryCyan: "#4FD7D1",
};
```

Ces valeurs peuvent être ajustées pour le contraste, mais la logique sémantique doit rester stable.

## Fonds

Le fond ne doit pas être un simple aplat noir.

Construire :
- une base graphite ;
- un halo orange très diffus près d’une zone d’action ;
- un halo froid discret à l’opposé ;
- un léger grain ou dégradé radial, sans image lourde ;
- aucun motif qui gêne les graphiques.

## Verre

Carte standard :
- opacité faible ;
- blur 18 à 24 sur iOS ;
- bordure 1 px claire à faible opacité ;
- rayon 20 à 26 ;
- ombre large mais très discrète ;
- reflet supérieur optionnel ;
- fallback opaque propre lorsque le blur n’est pas disponible.

Ne pas empiler plusieurs flous coûteux dans une liste animée.

## Typographie

Utiliser la police système par défaut pour simplicité, performance et qualité native.

Échelle indicative :
- Display patrimoine : 36–44, semibold ou bold ;
- Titre écran : 28–32, bold ;
- Titre section : 18–20, semibold ;
- Titre carte : 14–16, semibold ;
- Chiffre de carte : 20–26, bold ;
- Corps : 15–17, regular ;
- Métadonnée : 12–13, medium ;
- Micro-label : 10–12, semibold, espacement léger.

Les montants utilisent des chiffres tabulaires lorsque disponible.

## Espacement

Base 4 :
- 4, 8, 12, 16, 20, 24, 32, 40.

Marges d’écran :
- téléphone compact : 16 ;
- téléphone standard : 20 ;
- tablette : 28 à 36.

Espacement vertical régulier. Une carte ne doit jamais sembler collée à la suivante.

## Rayons

- petit contrôle : 10–12 ;
- bouton : 14–16 ;
- carte : 20–24 ;
- panneau principal : 28–32 ;
- pilule : 999.

## Icônes

- famille cohérente ;
- trait arrondi ;
- pas d’émojis comme icônes de navigation ;
- orange pour l’action active ;
- teinte secondaire pour les catégories ;
- taille minimale 20 ;
- étiquette texte pour les actions ambiguës.

## Boutons

Primaire :
- fond orange ;
- texte presque noir ;
- hauteur 50–56 ;
- rayon 16 ;
- état pressé visible ;
- pas plus d’un bouton primaire dominant par vue.

Secondaire :
- verre renforcé ;
- bordure visible ;
- texte blanc.

Destructif :
- rouge uniquement dans le contexte de confirmation.

## Cartes de métriques

Une carte de métrique contient :
- icône ou micro-label ;
- titre court ;
- valeur principale ;
- variation ;
- période ;
- éventuellement sparkline.

Éviter plus de quatre informations distinctes dans une petite carte.

## Graphiques

- grille minimale ;
- courbe principale orange ou blanche ;
- zone sous courbe à opacité faible ;
- vert/rouge réservé aux rendements ;
- sélection tactile ;
- période clairement visible ;
- unités toujours affichées ;
- aucune légende redondante ;
- animation 250–450 ms ;
- mode réduction des animations.

## Motion

- apparition : fondu + translation 6–10 px ;
- changement d’onglet : 180–240 ms ;
- bottom sheet : ressort léger ;
- chiffre : transition brève sans défilement exagéré ;
- haptique sur validation, ajout et changement de filtre ;
- pas d’animation continue décorative.

## Responsive

Téléphone :
- colonne unique ;
- métriques en grille 2 colonnes si lisibles ;
- bottom sheets pour les formulaires.

iPad :
- largeur de contenu plafonnée ;
- cockpit en 2 colonnes ;
- liste + détail lorsque pertinent ;
- navigation pouvant devenir une sidebar ;
- cartes légèrement plus denses, pas simplement étirées.

## Accessibilité

- contraste WCAG raisonnable ;
- information jamais portée uniquement par couleur ;
- tailles dynamiques ;
- VoiceOver labels ;
- ordre de lecture logique ;
- cibles 44 × 44 minimum ;
- graphiques accompagnés d’un résumé textuel ;
- mode transparence réduite avec surfaces opaques.
