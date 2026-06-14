# TimeBank POC — Premier Lot

Plateforme de TimeBanking où chacun échange ses compétences contre du temps via une unité interne appelée **TIME**.

> "Nous sommes tous des super-héros du quotidien."

## Stack

- **Next.js 16** — App Router
- **TypeScript** — Strict mode
- **Tailwind CSS v4** — Design tokens personnalisés
- **Prisma 6** — ORM
- **SQLite** — Base de données
- **NextAuth v4** — Authentification Credentials
- **bcryptjs** — Hash des mots de passe
- **zod** — Validation des formulaires

## Périmètre (Lot 1)

Pages :
- `/auth/signup` — Création de compte
- `/auth/signin` — Connexion
- `/dashboard` — Tableau de bord utilisateur
- `/wallet` — Wallet + historique transactions

Flux validé :
```
signup → mint 10 TIME → login → dashboard → wallet
```

## Installation

```bash
cd src

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Lancer la migration
npx prisma migrate dev --name init

# Démarrer le serveur de dev
npm run dev
```

## Variables d'environnement

Créer un fichier `.env` à la racine de `src/` :

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="replace-with-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Générer un secret aléatoire :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Commandes Prisma

```bash
# Créer une migration
npx prisma migrate dev --name nom_de_la_migration

# Voir la base dans Prisma Studio
npx prisma studio

# Regénérer le client
npx prisma generate
```

## Lancement

```bash
npm run dev
# → http://localhost:3000
```

## Premier scénario de test

1. Ouvrir `http://localhost:3000`
2. Redirigé vers `/auth/signin`
3. Cliquer "S'inscrire" → `/auth/signup`
4. Remplir nom / email / mot de passe → "Créer mon compte"
5. Redirigé vers `/auth/signin`
6. Se connecter avec l'email et le mot de passe
7. **Dashboard** : "Bonjour {name}", solde = 10 TIME, wallet address
8. Aller sur **/wallet**
9. Voir : solde = 10 TIME, wallet address, transaction "Mint initial" +10 TIME

## Structure

```
src/
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/    → NextAuth handler
│   │   └── signup/           → API d'inscription
│   ├── auth/
│   │   ├── signin/           → Page de connexion
│   │   └── signup/           → Page d'inscription
│   ├── dashboard/            → Tableau de bord
│   ├── wallet/               → Wallet + historique
│   ├── layout.tsx            → Layout global (fonts + providers)
│   ├── providers.tsx         → SessionProvider
│   └── page.tsx              → Redirection racine
├── lib/
│   ├── auth.ts               → Config NextAuth
│   └── prisma.ts             → Client Prisma singleton
├── prisma/
│   └── schema.prisma         → Modèles User + Transaction
└── .env                      → Variables d'environnement
```

## Limites du premier lot

- Pas de marketplace / services / bookings
- Pas de blockchain ou digital twin
- Pas de rating / admin / notifications / chat
- TIME n'est pas une crypto ni une monnaie convertible
- Les CTA "Explorer les services" et "Proposer un service" sont visibles mais pas fonctionnels

## Prochaine étape recommandée

- Implémentation de l'escrow (réservation de temps entre utilisateurs)
- Catalogue de services
- Recherche et filtres
