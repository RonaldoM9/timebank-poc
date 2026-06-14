# Plan de Test — TimeBank POC (Lots 1–4)

> **Projet :** TimeBank POC — MBA ESSEC Executive  
> **Couverture :** Authentication, Dashboard, Wallet, Services, My Services, Booking (escrow/release/refund), Ratings, Public Profile  
> **Stack :** Next.js 16 (App Router), Prisma 6 + SQLite, NextAuth v4 Credentials  
> **Charte :** Dark premium (#0a0a0a), accent (#00d4aa), touches comics discrètes

---

## 🔐 LOT 1 — Authentication

### T1 — Inscription (signup)

1. Aller sur `/auth/signup`
2. Remplir formulaire : nom, email, mot de passe
3. Cliquer "Créer mon compte"
4. ✅ Redirigé vers `/auth/signin`
5. ✅ Un utilisateur est créé en DB
6. ✅ Un wallet address est généré (unique)
7. ✅ Transaction `mint` +10 TIME créée
8. ✅ L'email est unique (tester une seconde inscription avec le même email → erreur)

### T2 — Connexion (signin)

1. Aller sur `/auth/signin`
2. Entrer email + mot de passe valides
3. ✅ Redirigé vers `/dashboard`
4. ✅ Session créée (NextAuth)

### T3 — Échec connexion

1. Entrer mauvais email ou mauvais mot de passe
2. ✅ Message d'erreur affiché
3. ✅ Pas de redirection

### T4 — Redirection non connecté

1. Aller sur `/dashboard` sans session
2. ✅ Redirigé vers `/auth/signin`

### T5 — Déconnexion

1. Connecté, cliquer "Déconnexion"
2. ✅ Redirigé vers `/auth/signin`
3. ✅ Session détruite

---

## 📊 LOT 1 — Dashboard

### T6 — Dashboard affiché

1. Connecté, aller sur `/dashboard`
2. ✅ Message "Bonjour {name} 👋"
3. ✅ Solde TIME affiché (10 après inscription)
4. ✅ Wallet address affiché
5. ✅ Nombre de services (actifs/inactifs) = 0
6. ✅ Réservations en cours = 0
7. ✅ Missions reçues = 0
8. ✅ "Nouveau héros" si aucun avis

### T7 — Navigation depuis dashboard

1. ✅ Lien "Mon Wallet" fonctionne → `/wallet`
2. ✅ Lien "Explorer les services" → `/services`
3. ✅ Lien "Proposer un service" → `/services/new`
4. ✅ Lien "Voir tout" (services) → `/my-services`
5. ✅ Lien réservations en cours → `/bookings`
6. ✅ Lien missions reçues → `/bookings`

### T8 — Transactions récentes sur dashboard

1. Après avoir créé une réservation, revenir sur `/dashboard`
2. ✅ Transaction "Réservation" visible (type escrow, montant négatif)
3. ✅ Format correct

---

## 💰 LOT 1 — Wallet

### T9 — Wallet affiché

1. Connecté, aller sur `/wallet`
2. ✅ Solde TIME affiché
3. ✅ Wallet address affiché
4. ✅ Transaction "Crédit de bienvenue" (mint) +10 TIME visible
5. ✅ Statut "completed" visible

### T10 — Historique wallet après booking

1. Réserver un service (voir T15)
2. Aller sur `/wallet`
3. ✅ Transaction "Réservation en attente" (escrow) visible
4. ✅ Montant en négatif (rouge)

### T11 — Historique wallet après complétion

1. Marquer booking comme terminé (voir T17)
2. Aller sur `/wallet`
3. ✅ Transaction "Service terminé" (release) visible pour le provider
4. ✅ Solde du provider augmenté

### T12 — Historique wallet après annulation

1. Annuler booking (voir T18)
2. Aller sur `/wallet`
3. ✅ Transaction "Remboursement" (refund) visible pour le client
4. ✅ Solde du client remboursé

---

## 🛠️ LOT 2 — Services / Marketplace

### T13 — Créer un service

1. Connecté, aller sur `/services/new`
2. Remplir : titre, description (≥10 caractères), catégorie, tarif TIME/h
3. Cliquer "Publier mon service"
4. ✅ Redirigé vers `/my-services`
5. ✅ Service visible dans la liste avec statut "ACTIF"
6. ✅ Service visible dans `/services` (marketplace)

### T14 — Validation formulaire service

1. Titre trop court (< 3 caractères) → ✅ erreur
2. Description trop courte (< 10 caractères) → ✅ erreur
3. Tarif négatif ou 0 → ✅ erreur
4. Catégorie vide → ✅ erreur
5. ✅ Toutes les erreurs sont affichées dans l'UI

### T15 — Marketplace listing

1. Aller sur `/services`
2. ✅ Liste des services actifs (status = active) affichée
3. ✅ Chaque card montre : titre, description, catégorie, tarif, provider, réputation
4. ✅ Provider name est un lien cliquable vers `/profile/[id]`
5. ✅ Bouton "Voir" mène vers `/services/[id]`

### T16 — Recherche et filtre services

1. Entrer un terme de recherche
2. ✅ Résultats filtrés par titre, description, ou nom du provider
3. Sélectionner une catégorie
4. ✅ Résultats filtrés par catégorie
5. Combiner recherche + catégorie → ✅ les deux filtres appliqués
6. Aucun résultat → ✅ message "Aucun service trouvé"

### T17 — Détail service

1. Cliquer "Voir" sur un service depuis `/services`
2. ✅ Titre, description, catégorie, tarif, date de publication affichés
3. ✅ Provider name est un lien cliquable vers `/profile/[id]`
4. ✅ Section "À propos du héros" : nom, wallet court, réputation
5. ✅ Lien "Voir le profil complet" → `/profile/[providerId]`
6. ✅ Si c'est mon service : "C'est votre service" + lien gérer
7. ✅ Si connecté non-propriétaire : bouton "Réserver avec mes TIME"
8. ✅ Si non connecté : bouton "Se connecter pour réserver"
9. ✅ Si statut "inactive" : badge INACTIF affiché

---

## 📋 LOT 2 — My Services

### T18 — My Services listing

1. Créer plusieurs services
2. Aller sur `/my-services`
3. ✅ Tous les services listés (actifs + inactifs)
4. ✅ Compteur : "X actifs — Y inactifs"
5. ✅ Chaque card : titre, description, catégorie, tarif, date, statut

### T19 — Toggle statut service

1. Depuis `/my-services`, cliquer "Désactiver" sur un service actif
2. ✅ Statut passe à "INACTIF"
3. ✅ Le service n'apparaît plus dans `/services` (marketplace)
4. Cliquer "Activer" → ✅ statut repasse à "ACTIF"
5. ✅ Le service réapparaît dans `/services`

### T20 — Empty state My Services

1. Utilisateur sans service → `/my-services`
2. ✅ Message "Tu n'as pas encore proposé de service"
3. ✅ Bouton "Proposer mon premier service" → `/services/new`

---

## 📅 LOT 3 — Booking / Escrow

### T21 — Réserver un service (flux complet)

**Prérequis :** 2 utilisateurs existent (Client A et Provider B). Provider B a un service actif à 5 TIME/h. Client A a ≥ 10 TIME.

1. Client A connecté, aller sur `/services/[id]` du service de B
2. ✅ Bouton "Réserver avec mes TIME" visible (pas pour son propre service)
3. Cliquer → `/services/[id]/book`
4. ✅ Voir : héros, tarif, solde, récapitulatif
5. Entrer 2 heures, cliquer "Réserver avec mes TIME"
6. ✅ Redirigé vers `/bookings`
7. ✅ Nouveau booking visible dans "Missions confiées" : statut "En attente"
8. ✅ 10 TIME débités du wallet de A (2h × 5 TIME/h)
9. ✅ Provider B voit le booking dans "Missions reçues"

### T22 — Solde insuffisant

1. Client A avec 3 TIME essaie de réserver un service à 5 TIME/h × 2h = 10 TIME
2. ✅ Message "Solde insuffisant" affiché
3. ✅ Bouton "Réserver" désactivé
4. ✅ Pas de booking créé

### T23 — Service inactif

1. Provider B désactive son service
2. Client A essaie d'accéder à `/services/[id]/book`
3. ✅ Message approprié ou blocage (l'API renvoie une erreur "Ce service n'est plus actif")

### T24 — Impossible de réserver son propre service

1. Provider B connecté essaie d'accéder à `/services/[id]/book` de son propre service
2. ✅ Message "Vous êtes le héros de ce service" / "Vous ne pouvez pas réserver votre propre service"

### T25 — Détail réservation (booking detail)

1. Cliquer "Détails" sur un booking depuis `/bookings`
2. ✅ Titre du service, statut, client, héros, date, heures, tarif, total
3. ✅ Section "Transactions liées" : escrow visible (montant négatif)
4. ✅ Si booking completé : date de complétion + release transaction
5. ✅ Si booking annulé : date d'annulation + raison (si fournie) + refund transaction

### T26 — Compléter une réservation → Release

1. Client A connecté, booking en statut "pending"
2. Depuis `/bookings/[id]` ou card dans `/bookings`
3. Cliquer "Marquer comme terminé"
4. ✅ Statut passe à "Terminé"
5. ✅ Transaction `release` créée : provider B reçoit le montant
6. ✅ Solde de B augmenté du montant
7. ✅ Solde de A reste débité (déjà en escrow)

### T27 — Annuler une réservation → Refund

1. Client A connecté, booking en statut "pending"
2. Cliquer "Annuler la réservation"
3. ✅ Dialogue de confirmation affiché
4. ✅ Prompt pour motif d'annulation (optionnel)
5. ✅ Statut passe à "Annulé"
6. ✅ Motif enregistré si fourni
7. ✅ Transaction `refund` créée : A remboursé
8. ✅ Solde de A +10 TIME restitué

### T28 — Conflit : double complétion

1. Booking déjà "completed"
2. Client A essaie de "Marquer comme terminé"
3. ✅ Erreur : "Seules les réservations en attente peuvent être complétées"

### T29 — Conflit : double annulation

1. Booking déjà "cancelled"
2. Client A essaie d'annuler
3. ✅ Erreur : "Seules les réservations en attente peuvent être annulées"

### T30 — Provider ne peut pas compléter/annuler

1. Provider B connecté, booking pending
2. ✅ Pas de bouton "Terminer" ou "Annuler"
3. ✅ Message : "Réservation en attente — le client peut la marquer comme terminée ou l'annuler"

### T31 — Accès booking non autorisé

1. Utilisateur C (ni client ni provider) essaie d'accéder à `/bookings/[id]`
2. ✅ Redirigé ou page inaccessible

### T32 — Liste réservations (bookings index)

1. Connecté, aller sur `/bookings`
2. ✅ Section "Missions confiées" : bookings où je suis client
3. ✅ Section "Missions reçues" : bookings où je suis provider
4. ✅ Chaque booking : titre, statut, heures, total, date
5. ✅ Badge statut coloré (En attente / Terminé / Annulé)
6. ✅ Si statut "En attente" et je suis client : boutons "Terminé" et "Annuler"
7. ✅ Empty state si aucune réservation

---

## ⭐ LOT 3 — Ratings

### T33 — Noter un booking completed (client → provider)

1. Booking completed, client A connecté
2. Aller sur `/bookings/[id]`
3. ✅ Section "Avis" visible
4. ✅ Formulaire : étoiles cliquables + commentaire optionnel
5. Noter 5 étoiles, commentaire "Excellent service !"
6. ✅ Message "Avis déjà publié" après soumission
7. ✅ Rating enregistré en DB (bookingId unique)
8. ✅ Réputation du provider recalculée
9. ✅ Dashboard du provider affiche la nouvelle réputation

### T34 — Noter sans commentaire

1. Booking completed, laisser note 4/5, pas de commentaire
2. ✅ Rating créé avec comment = null
3. ✅ Réputation recalculée

### T35 — Score invalide

1. Tester score = 0 → ✅ erreur (doit être ≥ 1)
2. Tester score = 6 → ✅ erreur (doit être ≤ 5)
3. Tester score non entier → ✅ erreur ou arrondi

### T36 — Commentaire trop long

1. Écrire un commentaire > 500 caractères
2. ✅ Limité à 500 (textarea maxLength = 500)
3. ✅ Côté serveur vérifié

### T37 — Double rating impossible

1. Client A a déjà noté un booking
2. Essaie de noter à nouveau le même booking
3. ✅ Erreur : "Un avis a déjà été publié pour ce booking"

### T38 — Rating sur booking non completed

1. Booking en statut "pending" → essayer de noter
2. ✅ Erreur : "Le booking doit être terminé pour être noté"
3. Booking en statut "cancelled" → ✅ message "Une mission annulée ne peut pas être notée"

### T39 — Seul le client peut noter

1. Provider B essaie de noter le booking où il est provider
2. ✅ Erreur : "Seul le client du booking peut laisser un avis"

### T40 — Client ne peut pas se noter lui-même (prévention sécurité)

1. Tester via API directe : tenter un rating où fromId = toId
2. ✅ Erreur : "Vous ne pouvez pas vous noter vous-même"

### T41 — Réputation affichée partout

1. ✅ Sur `/services` : provider reputation visible (⭐ X.X/5 ou "NOUVEAU HÉROS")
2. ✅ Sur `/services/[id]` : provider reputation dans bloc "À propos du héros"
3. ✅ Sur `/dashboard` : réputation + nombre d'avis
4. ✅ Sur `/profile/[id]` : réputation + nombre d'avis
5. ✅ Sur `/bookings/[id]` : réputation du provider affichée

---

## 👤 LOT 4 — Profil Public

### T42 — Accès profil public

1. Aller sur `/services`
2. Cliquer sur le nom du provider
3. ✅ Arrivé sur `/profile/[id]`
4. ✅ Profil affiché correctement (pas d'erreur)

### T43 — Visiteur non connecté

1. Ouvrir `/profile/[id]` en navigation privée (sans session)
2. ✅ Profil visible sans authentification
3. ✅ Aucune information privée affichée

### T44 — Header profil

1. ✅ Nom du héros affiché
2. ✅ Avatar placeholder (initiales ou icône) si pas d'avatar
3. ✅ Badge "Héros du quotidien" ou similaire
4. ✅ Réputation : "⭐ X.X / 5 — Y avis" ou "Nouveau héros"
5. ✅ Date d'inscription formatée lisiblement
6. ✅ Wallet address tronqué : `time_cmplio...000`

### T45 — Bio

1. ✅ Bio affichée si présente
2. ✅ Fallback "Ce héros n'a pas encore renseigné sa bio" si absente

### T46 — KPIs Impact

1. ✅ Section "Impact dans la communauté"
2. ✅ 4 KPIs affichés :
   - Réputation (⭐ X.X/5)
   - Services actifs (nombre)
   - Missions réalisées (count completed comme provider)
   - TIME gagnés (sum des transactions release, PAS le timeBalance)
3. ✅ TIME gagnés = historique via release, pas le solde actuel

### T47 — Services actifs seuls

1. Provider a un service actif et un service inactif
2. ✅ Seul le service actif est visible sur le profil
3. ✅ Service inactif masqué
4. ✅ Chaque card service : titre, description courte, catégorie, tarif TIME/h, bouton Voir

### T48 — Avis reçus

1. Provider a reçu des ratings
2. ✅ Section "Avis de la communauté"
3. ✅ Chaque avis : score, commentaire, nom du client, service concerné
4. ✅ Client name cliquable vers `/profile/[clientId]`

### T49 — Provider sans avis

1. Ouvrir profil d'un utilisateur sans aucun rating
2. ✅ Badge "Nouveau héros"
3. ✅ Message "Aucun avis pour le moment."
4. ✅ Réputation = 0 affichée correctement

### T50 — Provider sans services

1. Ouvrir profil d'un utilisateur sans service actif
2. ✅ Message "Ce héros n'a pas encore de service actif."
3. ✅ Les autres KPIs fonctionnent (missions, TIME)

### T51 — Privacy : aucune donnée privée exposée

1. Vérifier que le profil n'affiche JAMAIS :
   - ❌ Email
   - ❌ Password / hash
   - ❌ Solde TIME (timeBalance)
   - ❌ Transactions détaillées privées
   - ❌ Bookings privés
   - ❌ Wallet address complet
2. ✅ Wallet tronqué uniquement

### T52 — User inexistant

1. Aller sur `/profile/fake-id-qui-nexiste-pas`
2. ✅ 404 : "Héros introuvable" / "Ce profil n'existe pas ou n'est plus disponible"

### T53 — Navigation vers profil

1. ✅ Depuis `/services` : provider name cliquable → `/profile/[id]`
2. ✅ Depuis `/services/[id]` : "Voir le profil complet" → `/profile/[providerId]`
3. ✅ Depuis `/bookings/[id]` : client et provider names cliquables → `/profile/[id]`

### T54 — Lien retour profil → service

1. Être sur `/profile/[id]` d'un provider
2. ✅ Lien "Retour aux services" fonctionnel → `/services`

---

## 🔄 LOT 5 (Proposition) — Régression Lots 1-4

### T55 — Vérification de non-régression

Après chaque modification au code :

1. ✅ T1-T5 : Authentication toujours fonctionnelle
2. ✅ T6-T8 : Dashboard toujours fonctionnel
3. ✅ T9-T12 : Wallet toujours fonctionnel
4. ✅ T13-T17 : Services marketplace toujours fonctionnel
5. ✅ T18-T20 : My Services toujours fonctionnel
6. ✅ T21-T32 : Booking / escrow / release / refund toujours fonctionnel
7. ✅ T33-T41 : Ratings / réputation toujours fonctionnel
8. ✅ T42-T54 : Profil public toujours fonctionnel

---

## 📱 Responsive (tous lots)

### T56 — Responsive design

1. ✅ Dashboard lisible sur mobile (stack vertical)
2. ✅ Wallet lisible sur mobile
3. ✅ Services en single column sur mobile
4. ✅ My Services lisible sur mobile
5. ✅ Bookings lisible sur mobile
6. ✅ Booking detail lisible sur mobile
7. ✅ Profil public lisible sur mobile
8. ✅ Pas de scroll horizontal

---

## 🧪 Scénarios d'intégration (end-to-end)

### S1 — Parcours complet "Nouvel utilisateur"

1. Inscription → connexion → dashboard (10 TIME) → wallet (mint visible)
2. Créer un service → visible dans marketplace
3. Déconnexion

### S2 — Parcours complet "Client réserve"

1. Connexion en tant que Client A
2. Explorer services → filtrer par catégorie
3. Voir détail service → cliquer provider → voir profil public
4. Revenir → réserver 2h → redirigé bookings
5. Voir booking "En attente" dans missions confiées
6. Voir détail booking : escrow visible
7. Marquer comme terminé → release visible
8. Laisser avis 5/5 → réputation mise à jour

### S3 — Parcours complet "Annulation"

1. Connexion Client A
2. Réserver un service → booking créé
3. Annuler avec motif "Plus besoin"
4. ✅ Solde remboursé
5. ✅ Provider voit statut "Annulé"

### S4 — Parcours complet "Provider / Profil"

1. Connexion Provider B
2. Dashboard : solde mis à jour après release, réputation après avis
3. My Services : activer/désactiver un service
4. Profil public (vu non connecté) : KPIs, services actifs, avis reçus

---

## 📋 Check-list validation rapide

- [ ] **Auth :** Signup → mint → signin → dashboard (3 tests)
- [ ] **Wallet :** Solde + historique transactions (4 tests)
- [ ] **Services :** CRUD + search + filter + toggle (8 tests)
- [ ] **Booking :** Création → escrow → release → refund (12 tests)
- [ ] **Ratings :** Notation + réputation + contraintes (9 tests)
- [ ] **Profil public :** Vue publique + KPIs + privacy + navigation (13 tests)
- [ ] **Responsive :** Toutes les pages mobiles (1 test)
- [ ] **Régression :** Lots 1-4 intacts après modifications (1 test)

---

## Données de test recommandées

### Utilisateurs

```text
Client A : cmpliosii000028mqkos0jtgg ("Test Hero 1")
Provider B : cmplir9lo000328mqb6x7xzx4 ("Alice Test")
```

### Service actif

```text
ID : cmpljr5ct000428mqh5rr2igo
Titre : "Aide jardinage" — 5 TIME/h — Provider = Alice Test
```

### Booking de test

```text
ID : cmpnxq3qt000h28t8dv5dtweb
Service : "Aide jardinage"
Client : Test Hero 1 → Provider : Alice Test
Statut : pending (utiliser pour test completion)
```

---

> **Exécution :** Utiliser `browser_navigate` pour chaque URL, `browser_click` + `browser_type` pour les interactions, `browser_snapshot` ou `browser_vision` pour valider l'affichage.
