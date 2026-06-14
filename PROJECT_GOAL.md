# 🏆 TimeHeroes — Project Goal

> **Banque du temps des héros du quotidien.**
> POC technique pour le Strategic Project MBA ESSEC Executive 2026 — Ronald Mounien.

---

## 1. Vision

**TimeHeroes** est une plateforme de timebanking (banque du temps) moderne où :
- Chacun peut **proposer ou demander un service** (bricolage, numérique, soutien scolaire, etc.)
- **1 heure de service = 1 TIME** (unité d'échange interne, non monétaire)
- Le TIME est **bloqué en escrow** pendant la mission, libéré après validation
- La validation se fait par **QR code ou NFC**
- Un système de **réputation, XP, badges et niveaux** valorise l'engagement
- Les communautés locales permettent l'entraide de proximité

**Positionnement :** TimeHeroes n'est PAS une marketplace (type AlloVoisins). C'est une banque du temps — on échange du temps, pas de l'argent.

---

## 2. Stack technique (FIXE — ne pas changer)

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16.2.6 | Framework (App Router) |
| TypeScript | 5.x | Langage strict |
| Prisma | 6.6.0 | ORM (⚠️ Prisma 7+ casse la config `url` dans schema) |
| SQLite | - | Base de données (fichier `dev.db`) |
| Tailwind CSS | 4.x | Styling via `@theme inline` dans `globals.css` |
| NextAuth | 4.24.14 | Auth (Credentials + JWT, cookies `secure: false` pour HTTP) |
| Lucide React | 1.16+ | Icônes |
| Zod | 4.x | Validation |
| react-qr-code | 2.x | Affichage QR |
| bcryptjs | 3.x | Hash mots de passe |

**Règles :**
- ❌ Pas de React Native / app mobile native
- ❌ Pas de crypto / blockchain
- ❌ Pas de Redis / message broker
- ❌ Pas de Docker (déploiement direct sur VPS)
- ✅ Next.js App Router (pages, layouts, API routes)
- ✅ Server Components pour les reads, Client Components pour l'interactivité
- ✅ Design tokens Tailwind v4 via `@theme inline` dans `globals.css`

---

## 3. Design System

- **Fond :** `#0a0a0a` (dark premium)
- **Surface :** `#111111` / `#181818` (elevated)
- **Accent :** `#00d4aa` (vert/turquoise) → `#00b894` (hover)
- **Texte principal :** `#f5f5f5`
- **Texte secondaire :** `#a3a3a3`
- **Bordures :** `#262626`
- **Typo :** Inter (sans-serif), Anton (display), Bangers (comics/hero)
- **Composants :** cards arrondies (rounded-xl/2xl), bordures fines, hover states subtils, gradient subtil

**À ne PAS faire :** landing corporate, trop de texte, effet crypto, promesses non livrées, jargon ESS trop lourd.

---

## 4. Architecture déploiement

```
Client → HTTPS → timeheroes.fr (Caddy) → localhost:3096 (Node.js/Next.js)
```

- **VPS :** Hetzner (204.168.193.43)
- **Domaine :** timeheroes.fr (OVH)
- **SSL :** Let's Encrypt via Caddy
- **Serveur :** `node start-timeheroes.mjs` (programmatic, bypass CSS hash bug)
- **Port :** 3096 (interne), 80/443 (public via Caddy)
- **Démarrer :** `cd /root/projects/timebank-poc/src && npm run build && node start-timeheroes.mjs`
- **Dépannage build :** `rm -rf .next && npm run build` (CSS hash mismatch)
- **PORT env :** Doit être `3096` pour que le proxy login CSRF fonctionne

---

## 5. Lots livrés

| Lot | Description | Commit |
|-----|-------------|--------|
| 1 | Auth, wallet, mint TIME | `a25add9` |
| 2a | Marketplace services (CRUD, search, filter) | `4c5085a` |
| 2b | Booking & Escrow (réservation, complétion, annulation) | `fa22dda` |
| 3 | Rating & Reputation | `39d91bd` |
| 5 | Géolocalisation déclarative (Local Heroes) | `becd005` |
| 6 | Urgent Help Mode (demandes, offres, booking) | `0e5eb67` |
| 8 | NFC Proof of Completion | `f534849` |
| 10 | Gamification Hero (XP, badges, niveaux, quêtes, rewards) | `725da3e` |
| 11 | Demo seed data + connexion démo 1-clic | `8958cef` |
| 12 | Landing Page & Storytelling (cette page README) | `740c93d` |

---

## 6. Routes principales

| Route | Accès | Description |
|-------|-------|-------------|
| `/` | Public | Landing page (non-connecté) / Dashboard (connecté) |
| `/auth/signin` | Public | Login + connexion démo 1-clic |
| `/auth/signup` | Public | Inscription |
| `/dashboard` | Connecté | Tableau de bord Hero |
| `/services` | Public | Marketplace de missions |
| `/services/new` | Connecté | Créer une mission |
| `/services/[id]` | Public | Détail mission |
| `/services/[id]/book` | Connecté | Réserver une mission |
| `/bookings` | Connecté | Mes réservations |
| `/bookings/[id]` | Connecté | Détail réservation |
| `/wallet` | Connecté | Wallet TIME + historique |
| `/wallet/transfer` | Connecté | Transférer du TIME |
| `/rewards` | Connecté | Progression Hero (XP, badges, quêtes) |
| `/profile/[id]` | Public | Profil public Hero |
| `/urgent` | Connecté | Demandes urgentes |
| `/urgent/new` | Connecté | Publier demande urgente |
| `/complete/qr/[token]` | Public | Validation QR |
| `/complete/nfc/[token]` | Public | Validation NFC |
| `/settings/location` | Connecté | Modifier zone d'intervention |
| `/my-services` | Connecté | Mes services publiés |
| `/ratings` | Connecté | Mes avis |

---

## 7. Comptes démo

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Demo | `demo@timeheroes.fr` | `TimeHeroes2026!` |

La page `/auth/signin` a un bouton **⚡ Connexion démo** 1-clic. Les identifiants sont aussi affichés sur la landing page.

---

## 8. Règles de décision

1. **POC d'abord, perfection ensuite** — livrer fonctionnel, pas parfait
2. **Pas de feature non livrée vendue comme active** — honnêteté dans la com'
3. **TIME ≠ XP ≠ argent** — TIME = devise d'échange, XP = progression, badges = reconnaissance
4. **Garder le vocabulaire Hero** — on ne dit pas "client/prestataire" mais "Hero"
5. **Privilégier les Server Components** — Next.js App Router, fetch data côté serveur
6. **Tests curl avant browser** — plus rapide, moins de dépendances
7. **Commits descriptifs** — `feat: lot N description`
8. **Ne pas reset la base sans demander** — les seeds sont idempotents

---

## 9. Pitfalls connus

- **Prisma 7+ :** `url` dans schema n'est plus supporté → utiliser Prisma 6
- **Next.js 16 Turbopack :** `next start` rebuild silencieusement → utiliser `start.mjs` programmatique
- **CSS hash mismatch :** entre build et serve → `rm -rf .next && rebuild`
- **NextAuth cookies sur HTTP :** doivent être `secure: false` et `sameSite: "lax"`
- **PORT en prod :** le login proxy utilise `process.env.PORT` → doit être `3096` (pas 3000)
- **npx en panne :** sur ce système `npx` passe par rtk → utiliser les chemins directs `./node_modules/.bin/`
- **Zombie ports :** `fuser -k 3000/tcp` ou `3096/tcp` pour tuer les processus fantômes

---

## 10. Vision long terme

- **Records of Achievement** — Passeport d'engagement numérique
- **ESS & Employabilité** — L'engagement citoyen devient un actif professionnel
- **Portfolio bénévole** — CV valorisant missions, badges et compétences
- **Écosystème communautaire** — Réseau de coopératives TimeBank ESS
