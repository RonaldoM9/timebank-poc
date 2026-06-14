# Charte graphique — TimeBank

> Source : charte préparée par Ronald Mounien pour le POC TimeBank
> Date : 2026-05-25

---

## 1. Concept créatif

TimeBank est une plateforme de TimeBanking où chacun peut échanger ses compétences contre du temps.

L'inspiration visuelle principale :

> "Nous sommes tous des super-héros du quotidien."

Le style doit mélanger :
- SaaS moderne
- fintech / wallet / ledger
- marketplace communautaire
- énergie comics / super-héros
- confiance, solidarité, impact local

**Important :** Le rendu doit être **premium**, pas enfantin. Vibe "comics adulte / startup impact / dark fintech".

---

## 2. Direction artistique

### Mots-clés
Dark premium, Super-héros du quotidien, Communauté, Confiance, Ledger, Temps partagé, Impact local, Énergie positive, Fintech solidaire, Comics moderne

### À faire
- Utiliser des fonds noirs / anthracite
- Ajouter des accents vert émeraude
- Utiliser des cards modernes
- Ajouter des textures halftone discrètes
- Utiliser des badges façon comics
- Ajouter des angles, éclairs, bulles, burst shapes
- Garder une UI très lisible

### À éviter
- Trop de couleurs
- Style cartoon enfantin
- UI trop chargée
- Comic Sans
- Icônes cheap
- Effets néon excessifs
- Trop de dessins au détriment du produit

---

## 3. Palette couleurs

### Couleurs principales
```css
--background: #0a0a0a;
--surface: #111111;
--surface-elevated: #181818;
--surface-soft: #1f1f1f;

--border: #262626;
--border-soft: #333333;

--text-primary: #f5f5f5;
--text-secondary: #a3a3a3;
--text-muted: #737373;

--accent: #00d4aa;
--accent-hover: #00b894;
--accent-soft: rgba(0, 212, 170, 0.12);
--accent-border: rgba(0, 212, 170, 0.35);
```

### Couleurs statut
```css
--success: #22c55e;
--warning: #f59e0b;
--danger: #ef4444;
--info: #3b82f6;
--purple: #8b5cf6;
```

### Couleurs ledger TIME
```css
--time-positive: #00d4aa;
--time-negative: #f97316;
--time-escrow: #f59e0b;
--time-release: #22c55e;
--time-refund: #3b82f6;
--time-mint: #00d4aa;
```

---

## 4. Typographie

### Direction
1. **Police UI moderne** pour textes, menus, formulaires
2. **Police display impact/comics** pour titres héroïques

### Recommandation finale
| Usage | Police |
|---|---|
| Headlines principales | **Anton** (uppercase) |
| Sous-titres / labels comics | **Bangers** (uppercase, légèrement incliné) |
| Interface / body / cards | **Inter** |
| Boutons | Inter, bold |

### CSS
```css
:root {
  --font-ui: "Inter", sans-serif;
  --font-display: "Anton", sans-serif;
  --font-comic: "Bangers", cursive;
}

body { font-family: var(--font-ui); }
.hero-title { font-family: var(--font-display); text-transform: uppercase; letter-spacing: -0.02em; }
.comic-label { font-family: var(--font-comic); text-transform: uppercase; letter-spacing: 0.03em; }
```

---

## 5. Logo et identité

**Nom :** TimeBank

**Logo :** Bouclier + T stylisé, éventuellement éclair intégré, couleur accent #00d4aa
- Sens : protection + confiance + énergie + temps

**Wordmark :** `Time` en blanc `Bank` en vert émeraude (#00d4aa)

**Variantes icône :** Shield T, T coin, T lightning
- Utilisation : favicon, wallet token, badges réputation, cards TIME, icônes ledger

---

## 6. Style UI général

### Layout
- Dark background
- Large cards
- Borders subtiles
- Spacing généreux
- Grille claire
- Header fixe ou sticky
- Sidebar sur dashboard
- Responsive mobile-first mais desktop premium

### Cards
```css
.card {
  background: linear-gradient(180deg, #181818 0%, #111111 100%);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.35);
}
```

### Cards accentuées
```css
.card-accent {
  border: 1px solid rgba(0, 212, 170, 0.35);
  background:
    radial-gradient(circle at top right, rgba(0, 212, 170, 0.15), transparent 35%),
    linear-gradient(180deg, #181818 0%, #111111 100%);
}
```

### Boutons
| Variant | Style |
|---|---|
| Primaire | `background: #00d4aa; color: #020617; font-weight: 800; border-radius: 14px;` |
| Secondaire | `background: transparent; color: #f5f5f5; border: 1px solid rgba(0, 212, 170, 0.5);` |
| Danger | `background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.35);` |

---

## 7. Motifs comics

### Éléments graphiques
- Halftone dots
- Burst shapes
- Speech bubbles
- Angled banners
- Lightning bolts
- Shield badges
- Thick outlines
- Slightly tilted labels

### Usage par écran
| Écran | Usage comics |
|---|---|
| Hero section | Fort |
| Dashboard | Modéré |
| Wallet | Modéré, plus sérieux |
| Marketplace | Équilibré |
| Forms | Faible |
| Admin / Pilot B2B | Faible, plus corporate |

### Halftone texture
```css
.halftone-bg {
  background-image: radial-gradient(rgba(0, 212, 170, 0.18) 1px, transparent 1px);
  background-size: 14px 14px;
}
```

---

## 8. Iconographie

**Style :** Icônes linéaires modernes, épaisseur 2px, coins arrondis, accent vert pour actions clés

**Librairie :** `lucide-react`

| Concept | Icône |
|---|---|
| Wallet | `Wallet` |
| TIME | `CircleDollarSign` ou custom T coin |
| Services | `BriefcaseBusiness` |
| Bookings | `CalendarCheck` |
| Reputation | `ShieldStar` |
| Community | `Users` |
| Messages | `MessageCircle` |
| Search | `Search` |
| Dashboard | `LayoutDashboard` |
| Escrow | `Lock` |
| Release | `CheckCircle` |
| Refund | `RotateCcw` |
| Mint | `PlusCircle` |

---

## 9. Illustrations — Personnages

**Style :** Super-héros du quotidien
- Voisins, parents, étudiants, retraités actifs, développeurs, bricoleurs, coachs, jardiniers, mentors
- **Pas** de costumes Marvel complets
- Plutôt : hoodie avec emblème T, cape discrète, toolbelt, laptop, plantes, vélo, livre

**Direction :** Semi-réaliste comics, contours marqués, lumière cinématique, couleurs sombres + accent vert, postures confiantes, diversité

**Message :** "J'ai une compétence utile." / "Je peux aider." / "Mon temps a de la valeur." / "Je fais partie d'une communauté."

---

## 10. Ton rédactionnel UI

**Ton :** Inspirant, Simple, Confiant, Énergique, Communautaire, Non moralisateur

**Phrases clés :**
- Échangez du temps, pas de l'argent.
- Nous sommes tous des super-héros du quotidien.
- Donnez du temps, recevez du temps, créez du lien.
- Chaque heure partagée crée un impact réel.
- Petits gestes, grand impact.
- Votre temps a de la valeur.
- Construisez votre réputation.
- Aidez. Recevez. Progressez.

**CTAs :** Proposer un service, Explorer les services, Réserver avec mes TIME, Voir mon wallet, Gérer mes services, Voir mes missions, Rejoindre la communauté

---

## 11. Écrans prioritaires

### 1. Landing page — Concept
- Comics fort, Hero très visuel
- Sections : Hero → Comment ça marche → Services populaires → B2C/B2B → Impact communauté → CTA final

### 2. Dashboard — Vue activité
- Comics modéré, SaaS premium
- Cards : Solde TIME, Réputation, Services publiés, Missions en cours, Activité récente, Défi du mois, Impact personnel

### 3. Marketplace — Trouver un service
- Filtres, Grid de cards, Bannière talents
- Cards : Image, Catégorie, Titre, Prestataire, Rating, TIME/h, CTA

### 4. Wallet — Ledger crédible
- Plus fintech que comics, très lisible
- Solde TIME, Wallet simulé, Historique transactions, Mint/Escrow/Release/Refund, Règles du TIME, Badge réputation

### 5. Page service détail — Conversion
- Titre, Description, Prestataire, Réputation, TIME/h, Choix heures, Total, CTA réserver, Avis, Services similaires

### 6. Page Pilot B2B — Corporate
- Plus data que comics, KPIs : utilisateurs actifs, services, missions, TIME échangés, completion, satisfaction, litiges

---

## 12. Design tokens Tailwind

```ts
const colors = {
  background: "#0a0a0a",
  surface: "#111111",
  elevated: "#181818",
  border: "#262626",
  muted: "#737373",
  primaryText: "#f5f5f5",
  secondaryText: "#a3a3a3",
  accent: "#00d4aa",
  accentHover: "#00b894",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
};

theme: {
  extend: {
    colors: {
      tb: {
        bg: "#0a0a0a",
        surface: "#111111",
        elevated: "#181818",
        border: "#262626",
        muted: "#737373",
        text: "#f5f5f5",
        text2: "#a3a3a3",
        accent: "#00d4aa",
        accentHover: "#00b894",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      }
    },
    borderRadius: {
      "2xl": "1.5rem",
      "3xl": "2rem",
    },
    boxShadow: {
      glow: "0 0 40px rgba(0, 212, 170, 0.18)",
      card: "0 20px 60px rgba(0, 0, 0, 0.35)",
    }
  }
}
```

---

## 13. Composants UI à standardiser

**Components :** AppShell, Navbar, Sidebar, Button, Card, MetricCard, ServiceCard, BookingCard, TransactionRow, TimeBalanceCard, RatingStars, StatusBadge, ComicBadge, HeroBanner, EmptyState, Input, Textarea, Select, Tabs

**Badges variants :**
| Statut | Couleur |
|---|---|
| active | green |
| pending | yellow |
| completed | green |
| disputed | red |
| cancelled | gray |
| escrow | orange |
| release | green |
| mint | emerald |
| refund | blue |

---

## 14. Classes Tailwind types

```tsx
// Page background
<div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">

// Card standard
<div className="rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">

// Card accent
<div className="rounded-2xl border border-[#00d4aa]/30 bg-[#111111] shadow-[0_0_40px_rgba(0,212,170,0.12)]">

// CTA principal
<button className="rounded-xl bg-[#00d4aa] px-5 py-3 font-bold text-black hover:bg-[#00b894]">

// CTA secondaire
<button className="rounded-xl border border-[#00d4aa]/50 px-5 py-3 font-bold text-white hover:bg-[#00d4aa]/10">

// Label comics
<span className="-rotate-2 inline-block bg-[#00d4aa] px-3 py-1 font-black uppercase text-black">
```

---

## 15. Règles responsives

| Breakpoint | Layout |
|---|---|
| Desktop | Sidebar, grilles 3-4 colonnes, Hero illustration droite |
| Tablet | Sidebar compressée, grille 2 colonnes, header simplifié |
| Mobile | Bottom nav ou burger, cards empilées, CTA sticky possible |

---

## 16. Règles produit dans l'UI

**Toujours expliquer :**
- TIME = unité de temps interne
- 1 heure donnée = TIME gagné
- TIME bloqué en escrow pendant une réservation
- TIME libéré quand la mission est validée
- Réputation construite par les avis

**Termes à utiliser :** crédit temps, unité d'échange, ledger interne, solde communautaire

**Termes à éviter au MVP :** crypto, investissement, gain financier, valeur monétaire réelle, token spéculatif

---

## 17. Hiérarchie visuelle

| Priorité | Éléments |
|---|---|
| **P1** | Solde TIME, Action principale, Service/mission, Statut booking, Transaction ledger |
| **P2** | Réputation, Avis, Catégorie, Prestataire, Date |
| **P3** | Badges comics, Illustrations, Messages inspirationnels, Textures |

Le produit doit toujours rester compréhensible.

---

## 18. Prompts agents

### Prompt général UI
```
Tu es l'agent design du projet TimeBank.
Respecte strictement cette direction : dark premium, bg #0a0a0a, accent #00d4aa, SaaS moderne, inspiration comics / super-héros du quotidien (pas enfantin), typo moderne, cards rounded-2xl, borders subtiles, halftone dots discrets, badges comics, interface très lisible.
```

### Prompts par écran (Landing page, Dashboard, Wallet, Marketplace)
→ Voir fichiers `prompts/` dans ce dossier.

### Prompt génération d'images (anchor)
```
High-fidelity desktop SaaS web app mockup for TimeBank, a TimeBanking platform where everyday people exchange services using TIME credits. Dark premium theme, deep black #0a0a0a background, emerald accent #00d4aa, modern bold typography, subtle comic-book superhero visual language, halftone dots, angled banners, burst badges, shield icons, everyday superheroes helping each other. Professional startup product design, not childish, highly legible UI, French interface.
```

**Négatif :** Avoid childish cartoon style, avoid Comic Sans, avoid messy layout, avoid too many colors, avoid overdone neon, avoid Marvel/DC copyrighted characters, avoid toy-like UI, avoid cluttered panels.

---

*Généré le 2026-05-25 — charte complète à utiliser avec Jarvis, Claude Code, Hermes ou tout agent design.*
