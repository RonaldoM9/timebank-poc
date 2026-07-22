# 📱 Cours : Transformer TimeHeroes en Application Mobile

**Auteur :** Hermes Agent / Nandi  
**Date :** 12 juillet 2026  
**Projet :** TimeHeroes — Banque du Temps  
**Stack actuel :** Next.js 16 · Prisma · SQLite · Caddy · systemd  

---

## Sommaire

1. [Introduction](#1-introduction)
2. [Option 1 : PWA (Progressive Web App)](#2-option-1--pwa-progressive-web-app)
3. [Option 2 : Capacitor / Ionic](#3-option-2--capacitor-ionic)
4. [Option 3 : React Native / Expo](#4-option-3--react-native--expo)
5. [Tableau comparatif détaillé](#5-tableau-comparatif-détaillé)
6. [Focus technique : NFC et QR Code](#6-focus-technique--nfc-et-qr-code)
7. [Focus technique : Notifications Push](#7-focus-technique--notifications-push)
8. [Focus technique : Mode Hors-ligne](#8-focus-technique--mode-hors-ligne)
9. [Roadmap recommandée](#9-roadmap-recommandée)
10. [Glossaire](#10-glossaire)

---

## 1. Introduction

### Le constat

TimeHeroes est actuellement une **application web** (Next.js) accessible via un navigateur. C'est parfait pour :
- Un POC / MVP
- Une démonstration à des partenaires
- Un usage ponctuel sur desktop

Mais pour passer à l'échelle et séduire une fondation comme **La France s'engage**, il faut une **expérience mobile** :

| Besoin | Solution web seule | Solution mobile |
|--------|-------------------|-----------------|
| Scanner un QR code | ❌ Pas de caméra native | ✅ Scan natif |
| Valider une mission en NFC | ❌ Pas de NFC | ✅ Tap to validate |
| Recevoir une notification | ⚠️ Si onglet ouvert | ✅ Push natif toujours |
| Utiliser hors-ligne | ❌ | ✅ Cache offline |
| Être sur l'écran d'accueil | ⚠️ Dépend du navigateur | ✅ Icône permanente |

### Les trois chemins possibles

Il existe 3 approches pour transformer un site web en application mobile :

```
┌─────────────────────────────────────────────────────────────┐
│                    STRATÉGIES MOBILES                       │
├─────────────┬──────────────────┬────────────────────────────┤
│    PWA      │    Capacitor     │      React Native          │
│  (1 jour)   │   (3-5 jours)    │     (4-8 semaines)         │
├─────────────┼──────────────────┼────────────────────────────┤
│ Web app     │ Web + wrapper    │ App 100% native            │
│ installable │ natif (WebView)  │ (sa propre UI)             │
├─────────────┼──────────────────┼────────────────────────────┤
│ Pas d'app   │ App Store        │ App Store                  │
│ store       │ iOS + Android    │ iOS + Android              │
│             │                  │                            │
│ 0€          │ 99€/an (Apple)   │ 99€/an + développeur       │
└─────────────┴──────────────────┴────────────────────────────┘
```

---

## 2. Option 1 : PWA (Progressive Web App)

### Qu'est-ce qu'une PWA ?

Une PWA est un **site web qui se comporte comme une app native** :

- L'utilisateur visite `timeheroes.fr` sur son téléphone
- Le navigateur propose "Ajouter à l'écran d'accueil"
- L'icône apparaît comme une vraie app
- Au clic, l'app s'ouvre **sans la barre d'adresse** du navigateur
- Elle peut fonctionner **hors-ligne** (cache)
- Elle peut envoyer des **notifications push**

### Comment ça marche techniquement ?

```
┌─────────────────────────────────────┐
│        timeheroes.fr                │
├─────────────────────────────────────┤
│  next.config.js                     │
│  ├── @serwist/next (service worker) │
│  └── PWA config                     │
├─────────────────────────────────────┤
│  public/                            │
│  ├── manifest.json  ← Icônes + thème│
│  ├── icon-192.png                   │
│  └── icon-512.png                   │
├─────────────────────────────────────┤
│  Service Worker (sw.ts)             │
│  └── Cache les pages statiques      │
│  └── Gère les notifications push    │
└─────────────────────────────────────┘
```

### Les fichiers clés

#### `manifest.json`
```json
{
  "name": "TimeHeroes",
  "short_name": "TimeHeroes",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#f5f2ed",
  "theme_color": "#2BB286",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

#### Service Worker (avec Serwist / next-pwa)
```typescript
// sw.ts — mise en cache des pages pour le offline
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});
```

### Ce que la PWA PEUT faire

| Fonctionnalité | ✅ / ❌ |
|----------------|:------:|
| Icône sur l'écran d'accueil | ✅ |
| Pas de barre de navigateur | ✅ |
| Fonctionne hors-ligne (pages en cache) | ✅ |
| Notifications push (via Web Push API) | ✅ |
| Partage (Web Share API) | ✅ |
| QR Code (via `getUserMedia` caméra Web) | ⚠️ Possible |
| **NFC** | ❌ **Pas possible** |
| Bluetooth | ❌ |
| Stockage de fichiers | ⚠️ Limitée |

### Ce que la PWA NE PEUT PAS faire

- **NFC** : impossible en WebView. Pas d'accès au chip NFC du téléphone.
- **Notifications avancées** : pas de badges, pas de "rich notifications" Android
- **Background sync complexe** : limité à `sync` et `periodicSync` (peu supporté)
- **Stockage persistant** : le cache peut être vidé par le navigateur

### Installation côté utilisateur

**Sur Android (Chrome)** :
1. Ouvrir timeheroes.fr
2. Cliquer sur "Ajouter à l'écran d'accueil" (proposé automatiquement)
3. L'icône apparaît

**Sur iOS (Safari)** :
1. Ouvrir timeheroes.fr
2. Cliquer sur l'icône Partager (⬆️)
3. "Sur l'écran d'accueil"
4. L'icône apparaît

### ✅ Avantages PWA

- **0 €** de coût (pas de compte développeur Apple)
- **1 jour** de développement
- **100% du code existant** réutilisé
- **Sans validation** — pas d'App Store / Google Play
- Mise à jour instantanée (pas de "mise à jour disponible")
- Liens profonds (deep links) fonctionnels

### ❌ Inconvénients PWA

- Pas de NFC (incompatible avec la feature principale de validation)
- Pas de présence dans l'App Store (moins crédible pour un fondation)
- iOS Safari limite le stockage à ~50 MB
- iOS ne propose pas automatiquement l'installation (l'utilisateur doit le savoir)
- Pas d'accès aux capteurs avancés (baromètre, gyroscope poussé)

### Qui utilise des PWA ?

| Service | PWA ? | Usage |
|---------|:-----:|-------|
| Twitter (X) | ✅ | App installable |
| Pinterest | ✅ | 40% + de temps passé |
| Starbucks | ✅ | Commande hors-ligne |
| Uber | ✅ | Version allégée |
| Trivago | ✅ | +97% de clics sur les bannières |

---

## 3. Option 2 : Capacitor / Ionic

### Qu'est-ce que Capacitor ?

Capacitor est un **pont entre le web et le natif**. Concrètement :

1. Ton app Next.js reste inchangée
2. Capacitor l'encapsule dans une **WebView native**
3. Un **pont JavaScript → APIs natives** permet d'accéder à : NFC, Caméra, Push, etc.

```
┌──────────────────────────────────────────────┐
│              App Mobile TimeHeroes            │
├──────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐    │
│  │       WebView (ton site Next.js)     │    │
│  │  timeheroes.fr/dashboard             │    │
│  │  timeheroes.fr/services              │    │
│  └────────────┬─────────────────────────┘    │
│               │ Pont JS → Natif              │
│  ┌────────────▼─────────────────────────┐    │
│  │          Capacitor Plugins            │    │
│  │  ┌─────┐ ┌─────┐ ┌──────┐ ┌──────┐  │    │
│  │  │ NFC │ │Push │ │Camera│ │Haptics│  │    │
│  │  └─────┘ └─────┘ └──────┘ └──────┘  │    │
│  └──────────────────────────────────────┘    │
├──────────────────────────────────────────────┤
│  Android (Kotlin)        iOS (Swift)         │
└──────────────────────────────────────────────┘
```

### Installation

```bash
# 1. Installer Capacitor dans le projet Next.js
npm install @capacitor/core @capacitor/cli

# 2. Initialiser
npx cap init TimeHeroes com.timeheroes.app

# 3. Ajouter les plateformes
npx cap add android
npx cap add ios

# 4. Installer les plugins natifs nécessaires
npm install @capacitor/nfc              # NFC
npm install @capacitor/push-notifications # Push
npm install @capacitor/camera            # Caméra QR
npm install @capacitor/share             # Partage

# 5. Build Next.js + Sync
npm run build
npx cap copy   # Copie le build dans les dossiers natifs
npx cap sync   # Synchronise les plugins

# 6. Ouvrir dans Xcode / Android Studio
npx cap open ios    # Xcode
npx cap open android # Android Studio
```

### Accès NFC — Le code

```typescript
// nfc.ts — Plugin Capacitor NFC
import { NFC } from '@capacitor-nfc/nfc';

export async function readNFCTag() {
  const result = await NFC.startScan(); // Ouvre le lecteur NFC
  return result.tag; // { id, type, techTypes }
}

export async function writeNFCTag(data: string) {
  await NFC.writeTag({ message: [{ type: 'text/plain', value: data }] });
}
```

Dans l'app Next.js actuelle, le QR code utilise déjà une URL comme `https://timeheroes.fr/complete/qr/[token]`. Avec NFC, tu pourrais écrire ce même token sur un tag NFC et le lire par tap :

```typescript
// Lors de la validation d'une mission
async function validateMission(bookingId: string, method: 'qr' | 'nfc') {
  if (method === 'nfc') {
    const tag = await readNFCTag();
    // Le tag contient le même token que le QR code
    await fetch(`/api/bookings/${bookingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ token: tag.id, method: 'nfc' }),
    });
  }
}
```

### Accès Notifications Push

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Demander la permission + enregistrer le device
async function setupPush() {
  await PushNotifications.requestPermissions();
  const { token } = await PushNotifications.register();
  
  // Envoyer le token à ton serveur
  await fetch('/api/notifications/register', {
    method: 'POST',
    body: JSON.stringify({ deviceToken: token.value, platform: 'capacitor' }),
  });
}

// Écouter les notifications reçues
PushNotifications.addListener('pushNotificationReceived', (notification) => {
  // Afficher une notification locale
  console.log('Notification reçue :', notification);
});
```

### Build pour publication

**Android** :
1. Ouvrir dans Android Studio
2. Générer un APK signé (Build → Generate Signed Bundle)
3. Uploader sur Google Play Console (25$ unique)

**iOS** :
1. Ouvrir dans Xcode
2. Configurer le signing (compte développeur Apple : 99€/an)
3. Archive + Upload sur App Store Connect

### ✅ Avantages Capacitor

- **95% du code Next.js réutilisé** — l'UI reste la même
- **NFC natif** ✅ — la feature clé de validation des missions
- **Notifications push natives** ✅
- **Caméra native** pour QR code ✅
- **Temps de développement court** : 3-5 jours
- Mise à jour simplifiée : rebuild Next.js → `npx cap sync` → nouveau build
- Une seule UI pour web + mobile

### ❌ Inconvénients Capacitor

- **Performance WebView** : moins fluide qu'une vraie app native (scroll, animations)
- **Compte Apple Developer** : 99€/an obligatoire pour iOS
- **App store review** : chaque mise à jour majeure doit être validée
- Le rendu des polices/fonts peut différer entre WebView et navigateur
- Dépend de Capacitor pour l'accès natif (si un plugin manque, impossible)

### Les apps qui utilisent Capacitor

| App | Stack |
|-----|-------|
| **Instacart** | React + Capacitor |
| **Grow** (ex-HNGRY) | Angular + Capacitor |
| **Drips** | Vue + Capacitor |
| **Burger King** (France) | Ionic + Capacitor |
| **Citi Mobile** | Ionic + Capacitor |

---

## 4. Option 3 : React Native / Expo

### Qu'est-ce que React Native ?

Contrairement aux options précédentes, React Native **ne met pas le site dans une WebView**. Il **réécrit l'interface utilisateur en composants natifs** (Android : Kotlin/Java, iOS : Swift/Objective-C).

```
┌──────────────────────────────────────────────┐
│              App React Native TimeHeroes      │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐          │
│  │ Écran Accueil│  │Écran Missions│          │
│  │ (View natif) │  │ (FlatList    │          │
│  │              │  │  native)     │          │
│  └──────────────┘  └──────────────┘          │
├──────────────────────────────────────────────┤
│  Pont JS → Natif                              │
│  ┌──────┐ ┌───────┐ ┌──────┐ ┌────────────┐  │
│  │ NFC  │ │ Camera│ │Anims│ │Reanimated 2│  │
│  └──────┘ └───────┘ └──────┘ └────────────┘  │
├──────────────────────────────────────────────┤
│  API REST → timeheroes.fr/api/...            │
│  (Prisma inchangé côté serveur)               │
└──────────────────────────────────────────────┘
```

### Arborescence du projet React Native

```
timebank-poc-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx    # Bottom tab navigator
│   │   ├── index.tsx      # Dashboard
│   │   ├── services.tsx   # Liste des missions
│   │   └── bookings.tsx   # Réservations
│   └── service/
│       ├── [id].tsx       # Détail d'une mission
│       └── book.tsx       # Réservation
├── components/
│   ├── ServiceCard.tsx    # Composant carte (FlatList)
│   ├── HeroHeader.tsx     # Header avec avatar
│   └── TimeBadge.tsx      # Badge TIME
├── api/
│   ├── services.ts        # Appels à l'API Next.js
│   └── auth.ts
├── app.json               # Expo config
└── package.json
```

### Exemple : Composant React Native

```tsx
// components/ServiceCard.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface ServiceCardProps {
  id: string;
  title: string;
  category: string;
  ratePerHour: number;
  providerName: string;
  city: string;
}

export default function ServiceCard({ id, title, category, ratePerHour, providerName, city }: ServiceCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/service/${id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <Text style={styles.category}>{category}</Text>
        <Text style={styles.price}>{ratePerHour} TIME/h</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>{providerName} · {city}</Text>
        <Text style={styles.seeMore}>Voir →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e0d8',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  category: { fontSize: 10, color: '#2BB286', fontWeight: '600' },
  price: { fontSize: 13, color: '#2BB286', fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meta: { fontSize: 11, color: '#6b6b6b' },
  seeMore: { fontSize: 10, color: '#2BB286', fontWeight: '600' },
});
```

### Architecture : API partagée

L'avantage, c'est que l'API Next.js reste **inchangée** :

```
┌─────────────────────┐     ┌──────────────────┐
│  Next.js (serveur)  │     │  React Native    │
│  ┌───────────────┐  │     │  ┌────────────┐  │
│  │ /api/services │──┼─────┼─→│ fetch()    │  │
│  │ /api/bookings │  │     │  │ services/  │  │
│  │ /api/auth     │  │     │  │            │  │
│  │ Prisma + SQL  │  │     │  │            │  │
│  └───────────────┘  │     │  └────────────┘  │
└─────────────────────┘     └──────────────────┘
```

### ✅ Avantages React Native

- **Performance native** : scroll 60fps, animations fluides (Reanimated 2)
- **UX mobile authentique** : swipe, bottom sheets, tab bars, haptics
- **Tout l'accès natif** : NFC ✅, Camera ✅, Push ✅, Biometrics ✅
- **Expo** simplifie le build : `npx eas build` (cloud, pas besoin de Xcode/mac)
- **Expo Go** : tester immédiatement sans build
- **OTA updates** : mettre à jour l'UI sans passer par l'App Store (avec EAS Update, une feature d'Expo Application Services qui permet de déployer des mises à jour JavaScript/React directement sur les appareils des utilisateurs)

### ❌ Inconvénients React Native

- **Temps** : 4 à 8 semaines (contre 1 à 5 jours pour PWA/Capacitor)
- **Deux codebases** : maintenir le site web + l'app mobile séparément
- **Pas de partage d'UI** : les composants Next.js ne sont pas réutilisables
- **Coût** : développeur React Native (freelance ~500-800€/jour)
- **Fragmentation** : comportements différents entre iOS et Android

### Apps célèbres en React Native

| App | Pourquoi React Native |
|-----|-----------------------|
| **Instagram** | Performance + partage de logique |
| **Airbnb** (avant) | Code sharing entre web et mobile |
| **Uber Eats** | Dashboard restaurant |
| **Coinbase** | Trading en temps réel |
| **Walmart** | 95% de code partagé iOS/Android |
| **Discord** | Notifications + chat temps réel |

---

## 5. Tableau comparatif détaillé

| Critère | PWA | Capacitor | React Native |
|---------|:---:|:---------:|:------------:|
| **Effort technique** | 1 jour | 3-5 jours | 4-8 semaines |
| **Code réutilisé** | 100% | ~95% | ~40% (API only) |
| **NFC natif** | ❌ | ✅ | ✅ |
| **QR Code natif** | ⚠️ (Web) | ✅ | ✅ |
| **Notifications push** | ✅ Web Push | ✅ FCM/APN | ✅ FCM/APN |
| **Mode hors-ligne** | ✅ | ✅ | ✅ |
| **Performance** | Moyenne | Bonne | Excellente |
| **App Store / Play Store** | ❌ | ✅ | ✅ |
| **Mise à jour** | Instantanée | App store review | App store review |
| **Coût fixe** | 0€ | 99€/an (Apple) | 99€/an (Apple) |
| **Coût dev** | 0€ (toi-même) | 0€ (toi-même) | 500-800€/jour × 20-40j |
| **Crédibilité fondation** | ⚠️ Moyenne | ✅ Bonne | ✅✅ Excellente |
| **Maintenance** | Faible | Faible | Élevée (2 codebases) |
| **Idéal pour** | POC / MVP rapide | Production avec NFC | Scale 10k+ utilisateurs |

---

## 6. Focus technique : NFC et QR Code

### Le problème

TimeHeroes utilise **QR Code + token** pour valider les missions. L'utilisateur scanne un QR code sur l'écran du prestataire → la mission est marquée comme terminée.

Mais :
- Un QR code nécessite d'avoir **les deux téléphones allumés** avec l'app ouverte
- C'est moins fluide qu'un simple "tap" NFC
- Les seniors (cible clé du projet) sont moins à l'aise avec les QR codes

### La solution NFC

NFC (Near Field Communication) est la technologie derrière le **sans contact** :
- Même principe qu'un paiement par carte bancaire
- Distance max : ~4 cm
- Fonctionne même téléphone éteint (mode transit)
- Pas besoin d'ouvrir l'app (selon configuration)

### Architecture de validation NFC

```
┌─────────────────┐                      ┌─────────────────┐
│  Bénévole       │                      │  Senior         │
│  (téléphone A)  │                      │  (téléphone B)  │
│                 │                      │                 │
│  App → Valider  │    ──── NFC tap ────→│  Tag NFC lu     │
│  → tag NFC lu   │                      │                 │
│                 │                      │                 │
└────────┬────────┘                      └────────┬────────┘
         │                                        │
         │  ✅ Validation réussie                  │
         ▼                                        ▼
    ┌──────────────────────────────────────────┐
    │              Serveur Next.js              │
    │  /api/bookings/[id]/complete              │
    │  → Escrow TIME libéré                     │
    │  → Transaction +1 TIME au prestataire     │
    └──────────────────────────────────────────┘
```

### QR code vs NFC

| Critère | QR Code | NFC |
|---------|:-------:|:---:|
| Distance | Écran → caméra | < 4 cm |
| Temps | ~5 secondes | ~0.5 seconde |
| Téléphone éteint ? | ❌ | ✅ |
| Confort senior | ⚠️ | ✅✅ |
| Budget tag | 0€ (écran) | ~0.30€ / tag NFC |
| Lecture sans app | ✅ (caméra) | ⚠️ (iOS lit, Android lit) |
| Sécurité | Token hashé | ID unique + hash |

**Recommandation :** Garder les deux. QR code pour le POC, NFC comme upgrade pour la version mobile Capacitor.

---

## 7. Focus technique : Notifications Push

### Pourquoi les notifications push ?

Dans une banque du temps, les notifications sont **critiques** :

| Notification | Pourquoi c'est important |
|-------------|--------------------------|
| "Quelqu'un a réservé ton service" | Le prestataire doit savoir |
| "Rappel : mission dans 2h" | Réduit les no-shows |
| "Mission validée : +1 TIME" | Feedback immédiat |
| "Nouvelle mission solidaire" | Engager les bénévoles |
| "Urgence : demande d'aide" | Réponse rapide |

### Architecture push (avec Capacitor)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  App mobile │ ──→ │  Firebase    │ ──→ │  Serveur     │
│  (device)   │     │  Cloud       │     │  Next.js     │
│             │     │  Messaging   │     │              │
│  Token      │ ←── │  (FCM)       │ ←── │  Envoie la   │
│  stocké     │     │              │     │  notification│
│  dans DB    │     │              │     │              │
└─────────────┘     └──────────────┘     └──────────────┘
```

### Code côté serveur (Next.js)

```typescript
// api/notifications/send.ts
import admin from 'firebase-admin';

// Initialiser Firebase Admin (une fois)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export async function sendBookingNotification(userId: string, title: string, body: string) {
  // 1. Récupérer les tokens du user
  const devices = await prisma.userDevice.findMany({ where: { userId } });

  // 2. Envoyer à chaque appareil
  const messages = devices.map((device) => ({
    token: device.fcmToken,
    notification: { title, body },
    data: { type: 'booking', userId },
  }));

  // 3. Firebase distribue
  await admin.messaging().sendEach(messages);
}
```

---

## 8. Focus technique : Mode Hors-ligne

### Stratégie offline (avec Capacitor)

Le mode hors-ligne est important pour :
- Les seniors qui n'ont pas toujours la 4G
- Les zones rurales (où se trouvent les CCAS)
- Continuer à naviguer dans le métro

```
┌──────────┐     ⚡ Offline     ┌──────────┐
│  App     │ ─────────────────→ │  Cache   │
│  mobile  │                    │  local   │
│          │ ←───────────────── │          │
│          │    Sync quand      │  - Liste │
│          │    reconnecté      │    services│
│          │                    │  - Profil│
└──────────┘                    │  - TIME  │
                                │    balance│
                                └──────────┘
```

### Ce qu'on peut mettre en cache

| Donnée | Cache ? | Stratégie |
|--------|:-------:|-----------|
| Liste des services | ✅ | Cache → Réseau → Mise à jour |
| Détail d'un service | ✅ | Cache → Réseau |
| Profil utilisateur | ✅ | Cache → Réseau |
| Solde TIME | ✅ | Cache + Push refresh |
| Réservations en cours | ✅ | Cache + Sync au réveil |
| Envoyer un message | ✅ | Queue offline → envoi au reconnect |
| Créer une mission | ❌ | Uniquement online |

### Code offline (avec Capacitor + Workbox)

```typescript
// sw.ts — stratégie "Stale While Revalidate"
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Cache les appels API (services, profil, etc.)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/services'),
  new StaleWhileRevalidate({
    cacheName: 'api-services',
  })
);

// Cache les pages statiques
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({
    cacheName: 'pages',
  })
);
```

---

## 9. Roadmap recommandée

Pour TimeHeroes, voici la roadmap que je recommande :

### Phase 1 — PWA (1 jour) 🔜
**Maintenant — Pour la démo fondation**
- [ ] Ajouter `manifest.json` à Next.js
- [ ] Installer `@serwist/next` pour le service worker
- [ ] Ajouter les icônes 192×192 et 512×512
- [ ] Tester sur téléphone

**Résultat** : Démo "ajoute à l'écran d'accueil" à montrer à la fondation

### Phase 2 — Capacitor (3-5 jours)
**Si la fondation valide — Avant pilote CCAS**
- [ ] Initialiser Capacitor dans le projet Next.js
- [ ] Ajouter plugins NFC + Push + Camera
- [ ] Adapter le code de validation (QR → NFC + QR)
- [ ] Setup Firebase Cloud Messaging
- [ ] Build APK Android + Archive iOS
- [ ] Publier en test interne (TestFlight / Google Play Internal)

**Résultat** : App smartphone complète avec NFC

### Phase 3 — React Native (4-8 semaines)
**Si passage à l'échelle (10k+ utilisateurs)**
- [ ] Créer un nouveau projet Expo
- [ ] Réécrire les écrans principaux (Dashboard, Services, Bookings)
- [ ] Brancher sur l'API existante
- [ ] Animer avec Reanimated 2
- [ ] Tester, corriger, itérer
- [ ] Publier App Store + Google Play

**Résultat** : App 100% native, fluide, premium

### Diagramme de décision

```
Question 1 : Le NFC est-il nécessaire ?
├── NON  → PWA (Phase 1)
└── OUI  → Question 2

Question 2 : Combien d'utilisateurs ?
├── < 1 000 → Capacitor (Phase 2) ← TU ES ICI
├── 1 000 - 10 000 → Capacitor
└── > 10 000 → React Native (Phase 3)

Question 3 : Budget / Temps ?
├── 0€ / 1 jour → PWA
├── 0€ / 5 jours → Capacitor (toi-même)
└── 10k€+ / 8 semaines → React Native
```

---

## 10. Glossaire

| Terme | Définition |
|-------|------------|
| **PWA** | Progressive Web App — site web qui s'installe comme une app |
| **Service Worker** | Script JS qui tourne en arrière-plan, gère le cache et les push |
| **Manifest** | Fichier JSON qui définit l'apparence de l'app installée (nom, icône, thème) |
| **WebView** | Navigateur embarqué dans une app native |
| **Capacitor** | Outil qui encapsule un site web dans une WebView native avec accès aux APIs du téléphone |
| **Ionic** | Framework UI pour apps Capacitor (optionnel — on n'en a pas besoin avec Next.js) |
| **React Native** | Framework pour créer des apps natives en JavaScript/React |
| **Expo** | Surcouche de React Native qui simplifie le build et le déploiement |
| **NFC** | Near Field Communication — communication sans fil courte distance (~4 cm) |
| **Token** | Chaîne unique qui prouve qu'une mission a été réalisée |
| **FCM** | Firebase Cloud Messaging — service Google pour les notifications push |
| **APN** | Apple Push Notification service — service Apple pour les notifications push |
| **OTP** | One-Time Password — mot de passe à usage unique (autre méthode de validation) |
| **Workbox** | Bibliothèque Google pour gérer le cache et le offline facilement |
| **Stale While Revalidate** | Stratégie de cache : afficher la version en cache, puis mettre à jour en arrière-plan |
| **EAS Build** | Expo Application Services — build cloud des apps Expo (pas besoin de Mac) |
| **EAS Update** | Mise à jour OTA (Over-The-Air) des apps Expo sans passer par l'App Store |
| **Escrow** | Séquestre : les TIME sont bloqués jusqu'à validation de la mission |
| **WebView** | Vue web intégrée dans une app native qui affiche du contenu HTML/JS/CSS |

---

## Annexe : Budget estimé

| Poste | PWA | Capacitor | React Native |
|-------|:---:|:---------:|:------------:|
| Développement (toi-même) | 1 jour × 0€ | 5 jours × 0€ | — |
| Développeur externe | — | — | 20-40 jours × 500-800€ |
| Compte Apple Developer | 0€ | 99€/an | 99€/an |
| Compte Google Play | 25$ unique | 25$ unique | 25$ unique |
| Firebase (notifications) | Gratuit | Gratuit | Gratuit |
| Serveur supplémentaire | — | — | — (même serveur) |
| **Total année 1** | **0€** | **~124€** | **10 000 - 32 000€** |

---

*Document généré le 12 juillet 2026 pour le projet TimeHeroes — Banque du Temps.*
