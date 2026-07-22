---
tags:
  - timeheroes
  - o2p
  - organisation
  - permissions
  - pot-time
created: 2026-07-10
---

# 🏛️ O2P — Droits par profil sur la partie Organisation

> TimeHeroes — Lot 22 | Juillet 2026

---

## 📋 Sommaire des sections

1. [[#Rôles dans l'organisation]]
2. [[#Matrice des permissions]]
3. [[#ADMIN global — Alex Demo]]
4. [[#Interface adaptée selon le rôle]]
5. [[#Pot TIME — Règles de gestion complètes]]
6. [[#Comptes de test]]
7. [[#Pages et accès]]
8. [[#Log des modifications]]

---

## 1. Rôles dans l'organisation

| Rôle | Description | Niveau |
|:-----|:------------|:------:|
| **OWNER** | Propriétaire de l'org — créateur par défaut | 🔓 Maximum |
| **ADMIN** (org) | Administration quotidienne sans archivage | 🔓 Haut |
| **FACILITATOR** | Animation terrain — missions, programmes, pot | 🔑 Moyen |
| **MEMBER** | Héros participant — don au pot uniquement | 👤 Basique |
| **VIEWER** | Observateur — aucun droit actif | 👀 Lecture |

**Rôle système (hors organisation) :**
| Rôle | Description |
|:-----|:------------|
| **ADMIN global** (Alex) | Bypasse toutes les permissions — peut tout faire sur toutes les orgs |

---

## 2. Matrice des permissions

### Définition technique (`lib/organizations.ts`)

```typescript
type OrganizationPermission =
  | "VIEW_PRIVATE_DASHBOARD"
  | "MANAGE_ORGANIZATION"
  | "MANAGE_MEMBERS"
  | "CREATE_ORG_MISSION"
  | "MANAGE_ORG_POT"
  | "VERIFY_ORGANIZATION"
  | "ARCHIVE_ORGANIZATION"
  | "VIEW_ORG_POT";
```

### Tableau des droits

| Permission | OWNER | ADMIN (org) | FACILITATOR | MEMBER | VIEWER |
|:-----------|:-----:|:-----------:|:-----------:|:-----:|:------:|
| `VIEW_PRIVATE_DASHBOARD` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `MANAGE_ORGANIZATION` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `MANAGE_MEMBERS` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `CREATE_ORG_MISSION` | ✅ | ✅ | ✅ | ❌ | ❌ |
| `MANAGE_ORG_POT` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `VIEW_ORG_POT` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `ARCHIVE_ORGANIZATION` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `VERIFY_ORGANIZATION` | ❌ | ❌ | ❌ | ❌ | ❌ |

> `VERIFY_ORGANIZATION` est réservée au rôle système ADMIN (Alex).

### Traduction métier

| Action utilisateur | OWNER | ADMIN (org) | FACILITATOR | MEMBER | VIEWER |
|:-------------------|:-----:|:-----------:|:-----------:|:-----:|:------:|
| **Voir page publique** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Voir le dashboard privé** | ✅ | ✅ | ✅ | ❌ 404 | ❌ 404 |
| **Voir la page Pot TIME** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Donner au pot** (1-10 000 TIME) | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Voir historique transactions pot** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Gérer le pot** (retrait, financement) | ✅ | ✅ | 🚧 prêt | ❌ | ❌ |
| **Créer des missions** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Créer des programmes** | ✅ | ✅ | ✅ *corrigé* | ❌ | ❌ |
| **Gérer les membres** (inviter, rôle, retrait) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Modifier l'organisation** (nom, desc, etc.) | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Archiver l'organisation** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Voir/accéder aux programmes** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Générer des rapports d'impact** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Quitter l'organisation** | ⚠️* | ✅ | ✅ | ✅ | ✅ |
| **Rejoindre l'organisation** | — | — | — | — | ✅ |

> ⚠️ * OWNER ne peut quitter que s'il y a **au moins 2 OWNERS** dans l'org.

---

## 3. ADMIN global — Alex Demo

**Alex** (demo@timeheroes.fr) a le rôle système `ADMIN` — il **bypasse toutes les permissions** organisation.

```typescript
// Dans checkOrganizationPermission() — lib/organizations.ts
if (user?.role === "ADMIN") return true;  // bypass total
```

| Action | ADMIN global |
|:-------|:-----------:|
| Dashboard privé de **n'importe quelle org** | ✅ |
| Pot TIME — gestion complète | ✅ |
| Gérer les membres (inviter, changer rôles) | ✅ |
| Modifier n'importe quelle org | ✅ |
| Archiver n'importe quelle org | ✅ |
| Vérifier une org (PENDING_REVIEW → VERIFIED) | ✅ |
| Suspendre / Activer une org | ✅ |
| Voir le panneau `/admin/organizations` | ✅ |

### Comportement UI

Quand Alex (non membre d'une org) visite la page :

| Page | Ce qu'il voit |
|:-----|:-------------|
| **Page publique** | `myRole = "ADMIN"` (bypass) → lien dashboard + pot visibles |
| **Page Pot TIME** | Header *"Pot TIME — {org}"*, `canManage = true` |
| **Dashboard** | Accès complet via bypass permission |

---

## 4. Interface adaptée selon le rôle

### Page publique `/organizations/[slug]`

| État | CTA principal | Liens rapides |
|:-----|:-------------|:--------------|
| ❌ **Non connecté** | "Connectez-vous pour rejoindre" | (rien) |
| 👤 **MEMBER** | ❤️ "Donner au pot" (rose) | Pot TIME + Programmes |
| 🔑 **FACILITATOR+** | ❤️ "Donner au pot" (rose) | Dashboard + Pot TIME + Programmes |
| 🌐 **Hors org (connecté)** | "Rejoindre cette organisation" | (rien) |

### Page Pot TIME `/organizations/[slug]/pot`

| Rôle | Header | Description | Formulaire | Carte info |
|:-----|:------:|:-----------:|:----------:|:----------:|
| **MEMBER** | 🏷️ *"Donner au pot — {org}"* | *"Donnez du TIME pour soutenir..."* | ✅ Visible | *"En donnant, vous contribuez..."* |
| **FACILITATOR+** | 🏷️ *"Pot TIME — {org}"* | *"Gérez le pot commun..."* | ✅ Visible | *"En tant que gestionnaire..."* |
| **Hors org** | Redirigé connexion | — | ❌ Masqué + message | — |
| **ADMIN global** | 🏷️ *"Pot TIME — {org}"* | *"Gérez le pot commun..."* | ✅ Visible | *"En tant que gestionnaire..."* |

### Dashboard `/organizations/[slug]/dashboard`

| Rôle | Accès |
|:-----|:------|
| FACILITATOR+ / ADMIN global | ✅ 200 |
| MEMBER / VIEWER / Hors org | ❌ 404 |

---

## 5. Pot TIME — Règles de gestion complètes

### 5.1 Création
- Créé **automatiquement** à la création de l'org avec `balance = 0`
- Lié à l'org via `OrganizationPot.organizationId`

### 5.2 Don au pot

**Qui peut donner ?** Tout **membre actif** de l'org (MEMBER, FACILITATOR, ADMIN, OWNER)

**Règles :**
| Règle | Valeur |
|:------|:-------|
| Montant minimum | 1 TIME |
| Montant maximum | 10 000 TIME |
| Type | Entier uniquement (pas de décimales) |
| Solde | Doit être suffisant dans le wallet personnel |
| Atomicité | ✅ Transaction Prisma : débit wallet + crédit pot + historiques |

**Validation Zod (`potDonationSchema`) :**
```typescript
z.object({
  amount: z.number().int().positive().max(10000),
})
```

### 5.3 Types de transactions

| Type | Usage | Qui |
|:-----|:------|:----|
| `DONATION` | Membre donne au pot | MEMBER+ |
| `FUNDING` | Pot finance une mission | FACILITATOR+ |
| `ADJUSTMENT` | Ajustement manuel | ADMIN (futur) |
| `REFUND` | Remboursement | FACILITATOR+ (futur) |

### 5.4 Visibilité
- **Tous les membres** voient le solde et l'historique des transactions
- Transparence totale : MEMBER voit les dons des autres

### 5.5 Gestion (futur)
- Retraits et financements réservés aux `MANAGE_ORG_POT` (FACILITATOR+)
- `canManage = true` prêt dans le code

### 5.6 Non-membre
- **Connecté non-membre** : page accessible, formulaire masqué, message *"Vous devez être membre"*
- **Non connecté** : redirigé `/auth/signin`

---

## 6. Comptes de test

| Persona | Email | MDP | Rôle système | Rôle(s) org | Comportement attendu |
|:--------|:------|:---:|:------------:|:-----------:|:---------------------|
| **Alex** 👑 | demo@timeheroes.fr | TimeHeroes2026! | **ADMIN** | OWNER (Ville, Fondation) | 🔓 **Accès total** — voit tout, gère tout, même sans être membre |
| **Sarah** 🛠️ | sarah.demo@timeheroes.fr | TimeHeroes2026! | FACILITATOR | OWNER (CCAS), FACILITATOR (Ville, Horizon, Fondation) | Gère ses orgs, dashboard, programmes, missions |
| **Karim** 🦸 | karim.demo@timeheroes.fr | TimeHeroes2026! | USER | MEMBER (Ville), FACILITATOR (Voisins) | Donne au pot, voit historique, pas de dashboard |
| **Alice** 👵 | alice.seed@timeheroes.fr | TimeHeroes2026! | USER | MEMBER (seed) | Donne au pot uniquement |
| **Hugo** 👤 | hugo.demo@timeheroes.fr | TimeHeroes2026! | USER | MEMBER (Ville, CCAS) | Donne au pot uniquement |

---

## 7. Pages et accès

| Page | URL | Accès | Rôle min. |
|:-----|:----|:-----:|:---------:|
| Liste des organisations | `/organizations` | 🔓 Public | — |
| Page publique org | `/organizations/[slug]` | 🔓 Public | — |
| Dashboard privé | `/organizations/[slug]/dashboard` | 🔒 Privé | FACILITATOR+ |
| Pot TIME | `/organizations/[slug]/pot` | 🔒 Connecté | MEMBER+ (ou membre) |
| Programmes | `/organizations/[slug]/programs` | 🔒 Privé | MEMBER+ |
| Membres | `/organizations/[slug]/members` | 🔒 Privé | FACILITATOR+ |
| Rapports d'impact | `/organizations/[slug]/reports` | 🔒 Privé | FACILITATOR+ |
| Paramètres org | `/organizations/[slug]/settings` | 🔒 Privé | FACILITATOR+ |
| Admin (panel global) | `/admin/organizations` | 🔒 Admin | ADMIN global |

---

## 8. Log des modifications

### 2026-07-10 — Lot 22 — Pot TIME & permissions

#### 🔧 Modifications techniques

| Fichier | Changement |
|:--------|:-----------|
| `lib/organizations.ts` | Permission system — 8 permissions, 5 rôles, bypass ADMIN global |
| `app/actions/organizations.ts` | 12 server actions avec Zod validation + permission checks |
| `lib/organization-schemas.ts` | **NOUVEAU** — 5 schémas Zod, validateurs CUID |
| `app/organizations/[slug]/pot/page.tsx` | Ajout `myRole` + **bypass ADMIN global** |
| `app/organizations/[slug]/pot/OrganizationPotClient.tsx` | Header/description/carte info **adaptés au rôle**, formulaire masqué pour non-membre |
| `app/organizations/[slug]/page.tsx` | Ajout `myRole` + **bypass ADMIN global** |
| `app/organizations/[slug]/OrganizationDetailClient.tsx` | CTA adapté (donner/rejoindre/connexion), quick links conditionnels |
| `app/organizations/[slug]/dashboard/OrganizationDashboardClient.tsx` | Lien Pot TIME dans Actions rapides |
| `cahier-de-recette-lot22.md` | Section 15 enrichie (T149-T173) |
| `prisma/seed-organizations.ts` | 5 orgs de démo avec rôles et soldes |
| `components/ConnectedHeader.tsx` | + Prop `orgRole`, badge rôle cliquable + tooltip "Mes droits" avec liste des permissions |
| `lib/organization-labels.ts` | + `ROLE_PERMISSIONS_LABELS` : 5 rôles, permissions avec descriptions + `FACILITATOR` peut créer programmes |
| `app/organizations/[slug]/pot/OrganizationPotClient.tsx` | + Badge rôle dans le hero de la page Pot TIME |
| `app/organizations/[slug]/programs/new/page.tsx` | **CORRECTION BUG** : FACILITATOR pouvait créer programme côté serveur mais pas côté page → 404 corrigé |
| `app/organizations/[slug]/programs/page.tsx` | **CORRECTION** : Bouton "Créer un programme" maintenant visible pour FACILITATOR |

#### 🧪 Tests ajoutés (Section 6 — Pot TIME, PT1-PT17)

| ID | Test |
|:---|:-----|
| PT1 | MEMBER → page pot (header adapté) |
| PT2 | Don de 5 TIME OK |
| PT3 | Dons invalides (0, négatif, décimal, >solde, >10000) |
| PT4 | FACILITATOR+ → page pot (header gestion) |
| PT5-PT7 | Historique & permissions (canManage) |
| PT8 | Connecté non-membre → formulaire masqué |
| PT9 | Non connecté → redirigé |
| PT10-PT11 | Dashboard et navigation pour MEMBER |
| PT12-PT17 | Adaptation UI et canManage par rôle |

#### 📁 Fichiers Drive mis à jour

| Fichier | Lien |
|:--------|:-----|
| `TimeHeroes_O2P_Scenarios_Transverse_Complet.pptx` | [Drive link](https://docs.google.com/presentation/d/1c7cmmBgp7qANEzoq3GjfysTo1kNV97s9/) |
| `TimeHeroes_O2P_Scenarios_Recette.pptx` | [Drive link](https://docs.google.com/presentation/d/1xxvbYeG1A0uRCyaD66x1EdkLRZ3t3KUY/) |
| (Local) `docs/obsidian-timeheroes-o2p-droits.md` | 📄 Ce fichier |

---

> 💡 **TimeHeroes.fr** — Juillet 2026 — Ronald Mounien — ESSEC EMBA WE27
