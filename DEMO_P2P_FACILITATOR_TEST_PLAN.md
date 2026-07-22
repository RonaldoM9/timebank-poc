# Plan de Test — P2P & Facilitateur

## Objectif
Tester l'intégralité du parcours **pair-à-pair** (recherche de service → réservation → messagerie → complétion → évaluation) et du **dashboard facilitateur** (Pot Commun, Matching, Intelligence Réseau).

---

## 📋 Préparation

### 1. Réinitialiser les données de démo
```bash
npm run db:reset-demo
# ou manuellement :
npm run seed:demo
npm run seed:gamification
npm run seed:facilitator-test
npm run seed:collective-missions
npm run seed:facilitator-network
```

### 2. Comptes de test
| Rôle | Email | Mot de passe |
|------|-------|-------------|
| **Admin démo** | `demo@timeheroes.fr` | `TimeHeroes2026!` |
| **Facilitateur** | `sarah.demo@timeheroes.fr` | `TimeHeroes2026!` |
| **Hero 1 (bricoleur)** | `karim.demo@timeheroes.fr` | `TimeHeroes2026!` |
| **Hero 2 (admin)** | `alice.seed@timeheroes.fr` | `TimeHeroes2026!` |

> 💡 Utilise 2 navigateurs/navires différents pour tester le P2P des deux côtés.

---

## 🧪 PARTIE 1 — PARCOURS P2P COMPLET

### S1 — Marketplace et découverte de services
1. Connecte-toi en **Karim** (`karim.demo@timeheroes.fr`)
2. Va sur **Services** → page `/services`
3. ✅ Vérifie : liste des services visibles, catégories fonctionnelles
4. ✅ Vérifie : les cartes de service montrent nom, note, TIME/h
5. ✅ Clique sur un service (ex: "Cours d'anglais" ou "Aide informatique")
6. ✅ Vérifie : page détail avec description complète, profil du provider, avis

### S2 — Réservation P2P
1. Depuis la page d'un service, clique **Réserver**
2. ✅ Remplis : nombre d'heures, date souhaitée
3. ✅ Vérifie : récapitulatif du coût (heures × TIME/h)
4. ✅ Confirme la réservation
5. ✅ Vérifie : message de succès "Réservation envoyée"
6. ✅ Vérifie : le statut est "En attente" (pending)

### S3 — Messagerie P2P (Booking Discussion)
1. Va sur **Mes réservations** → `/bookings`
2. ✅ Vérifie : le nouveau booking apparaît avec statut "En attente"
3. ✅ Clique sur le booking pour ouvrir le détail
4. ✅ Vérifie : la section discussion est visible
5. ✅ Envoie un message au provider : « Bonjour, je suis intéressé par votre service ! »
   - **Note** : si le provider n'a pas encore répondu, le système doit gérer l'affichage correctement
6. ✅ Vérifie que le message s'affiche avec ton nom et la date

### S4 — Réponse du Provider (changer de compte)
1. **Déconnecte-toi** et connecte-toi en **Alex** (`demo@timeheroes.fr` — qui est le provider des services de démo)
2. Va sur **Mes réservations**
   - **Note** : Si tu as réservé un service appartenant à un autre provider, connecte-toi avec ce compte (Julie, Thomas, etc.)
3. ✅ Vérifie : le booking apparaît dans tes réservations entrantes
4. ✅ Ouvre la discussion et réponds : « Bonjour ! Avec plaisir. Je suis disponible jeudi après-midi. »
5. ✅ Vérifie le marquage "lu" (read indicator)

### S5 — Changement de statut par le provider
1. Le provider peut **Accepter** ou **Refuser** la réservation
   - Si disponible : ✅ Clique sur **Accepter**
   - ✅ Le statut passe à "Confirmé"
   - ✅ Un message système apparaît dans la discussion : "La réservation a été confirmée"

### S6 — Complétion de mission (QR / Preuve)
1. Va sur la réservation confirmée (connecté en provider)
2. ✅ Vérifie qu'un bouton **Marquer comme terminée** ou **Générer un QR** est disponible
3. ✅ Clique pour générer un QR de complétion
4. ✅ Scanne le QR (ou copie le lien de complétion) dans l'autre session
5. ✅ Vérifie que la mission passe à "Terminée"

### S7 — Évaluation (Rating)
1. Après complétion, ✅ Vérifie que la page de détail propose de noter l'expérience
2. ✅ Donne une note (1-5 étoiles) et un commentaire
3. ✅ Vérifie que la note et le commentaire s'affichent dans la page de profil du provider
4. ✅ Vérifie que la note impacte la réputation

### S8 — Wallet et transaction TIME
1. Connecté en Karim, va sur **Mon Porte-Monnaie** → `/wallet`
2. ✅ Vérifie que le solde TIME a été débité du montant de la réservation
3. ✅ Vérifie que l'historique des transactions montre :
   - `escrow_hold` (mise en séquestre) au moment de la complétion
   - `escrow_release` (libération) au provider
4. ✅ Connecte-toi en provider et vérifie que son solde a augmenté
5. ✅ Vérifie que le nombre total de TIME en circulation est cohérent

### S9 — Transfert P2P direct
1. Va sur **Transférer** → `/wallet/transfer`
2. ✅ Envoie 1 TIME à un autre utilisateur (ex: `alice.seed@timeheroes.fr`)
3. ✅ Vérifie le message de confirmation
4. ✅ Vérifie que la transaction apparaît dans l'historique des deux comptes

---

## 🧪 PARTIE 2 — URGENCES

### S10 — Créer une demande urgente
1. Connecté en Karim, va sur **Urgences** → `/urgent`
2. ✅ Vérifie la liste des demandes urgentes existantes (si seed chargé)
3. ✅ Clique sur **Nouvelle demande urgente**
4. ✅ Remplis : titre, description, catégorie
5. ✅ Soumets la demande
6. ✅ Vérifie : la demande apparaît dans la liste avec statut "Ouvert"

### S11 — Répondre à une urgence (P2P)
1. Déconnecte-toi et connecte-toi en Alex Demo
2. Va sur **Urgences**
3. ✅ Vérifie que la demande de Karim est visible
4. ✅ Clique pour proposer ton aide — envoie une offre
5. ✅ Reviens en Karim et vérifie que l'offre apparaît
6. ✅ Accepte l'offre
7. ✅ Vérifie : le statut passe à "En cours" ou "Résolu"

---

## 🧪 PARTIE 3 — FACILITATEUR : POT COMMUN

### S12 — Dashboard Pot Commun
1. Connecte-toi en **Sarah** (`sarah.demo@timeheroes.fr` — facilitateur)
2. Va sur **Pot Commun** → `/facilitator/community-pot`
3. ✅ Vérifie que le dashboard s'affiche avec :
   - Solde actuel du pot
   - Donations du mois (nombre)
   - Financements du mois (total TIME)
   - Demandes en attente
4. ✅ Vérifie que les KPIs sont interactifs (clique sur un KPI pour filtrer)

### S13 — Gérer les demandes de financement
1. ✅ Vérifie la section **Demandes en attente**
2. ✅ Examine une demande : montant, raison, message, date
3. ✅ Clique sur **Approuver** pour une demande
4. ✅ Vérifie le modal de confirmation avec champ "Note de décision"
5. ✅ Soumets l'approbation avec une note
6. ✅ Vérifie le message de succès
7. ✅ Vérifie que la demande passe dans l'historique "Approuvée"
8. ✅ Vérifie que le solde du pot a diminué du montant approuvé

### S14 — Refuser une demande
1. ✅ Trouve une demande en attente, clique sur **Refuser**
2. ✅ Ajoute une note de décision
3. ✅ Vérifie le message de confirmation
4. ✅ Vérifie que la demande passe dans "Refusée"
5. ✅ Vérifie que le solde du pot n'a pas changé

### S15 — Voir les transactions du pot
1. ✅ Scrolle jusqu'à **Dernières transactions**
2. ✅ Vérifie que les donations (entrées) et fundings (sorties) sont visibles
3. ✅ Vérifie les détails : montant, utilisateur, date, raison

### S16 — Missions solidaires à vérifier
1. ✅ Vérifie la section **Missions solidaires** dans le même dashboard
2. ✅ Si une mission SELF_DECLARED est visible, clique pour vérifier
3. ✅ Teste l'action **Vérifier** (approuver la mission solidaire)
4. ✅ Teste l'action **Refuser** la mission solidaire

---

## 🧪 PARTIE 4 — FACILITATEUR : MATCHING

### S17 — Matching pour demandes urgentes
1. Va sur **Matching** → `/facilitator/matching`
2. ✅ Vérifie les onglets : "Urgent" | "Soliidaire" | "Collective" | "Historique"
3. ✅ Dans l'onglet **Urgent**, vérifie que les demandes urgentes sont listées
4. ✅ Clique sur **Générer des recommandations** pour une demande
5. ✅ Vérifie que des Heroes recommandés apparaissent avec :
   - Nom, ville, compétences
   - Score de matching
   - Nombre de missions complétées
6. ✅ Vérifie que tu peux **Approuver** ou **Rejeter** chaque recommandation

### S18 — Feedback sur les recommandations
1. ✅ Après avoir approuvé/rejeté une recommandation, vérifie qu'un champ de feedback apparaît
2. ✅ Laisse un commentaire sur pourquoi cette recommandation était pertinente ou non
3. ✅ Vérifie que le feedback est enregistré

### S19 — Matching missions solidaires
1. ✅ Bascule sur l'onglet **Solidaire**
2. ✅ Vérifie que les missions solidaires ouvertes sont listées
3. ✅ Génère des recommandations pour une mission
4. ✅ Vérifie les résultats

### S20 — Matching missions collectives
1. ✅ Bascule sur l'onglet **Collective**
2. ✅ Vérifie que les missions collectives ouvertes sont listées
3. ✅ Génère des recommandations
4. ✅ Vérifie les résultats

### S21 — Historique des matchs
1. ✅ Bascule sur l'onglet **Historique**
2. ✅ Vérifie que les recommandations passées (approuvées/rejetées) sont visibles
3. ✅ Vérifie que les feedbacks associés sont affichés

---

## 🧪 PARTIE 5 — FACILITATEUR : INTELLIGENCE RÉSEAU

### S22 — Dashboard Intelligence Réseau
1. Va sur **Intelligence Réseau** → `/facilitator/network`
2. ✅ Vérifie le **Network Health Score** global (0-100)
3. ✅ Vérifie les 5 sous-scores avec barres de progression :
   - Liquidité, Réponse, Réciprocité, Activité, Sécurité
4. ✅ Vérifie les **métriques clés** :
   - Demandes bloquées
   - Heroes sur-sollicités
   - Heroes sous-utilisés
   - TIME dormants
   - Alertes critiques

### S23 — Demandes bloquées
1. ✅ Scrolle jusqu'à la section **Demandes bloquées**
2. ✅ Vérifie que les différents types apparaissent :
   - Urgences sans réponse
   - Demandes Pot Commun en attente
   - Missions solidaires non vérifiées
   - Bookings bloqués (pending > 5 jours)
   - Missions collectives sous-remplies
3. ✅ Vérifie le code couleur par sévérité (LOW, MEDIUM, HIGH, CRITICAL)

### S24 — Heroes sur-sollicités
1. ✅ Vérifie la section **Heroes sur-sollicités**
2. ✅ Les metrics doivent montrer : missions 30j, heures données, score de sur-sollicitation
3. ✅ Vérifie que le niveau de risque (LOW/MEDIUM/HIGH) est indiqué
4. ✅ Vérifie les recommandations d'action
5. ✅ Clique sur un hero pour voir son profil

### S25 — Heroes sous-utilisés  
1. ✅ Vérifie la section **Heroes sous-utilisés**
2. ✅ Les metrics doivent montrer : compétences, complétion du passport, jours depuis dernière activité
3. ✅ Vérifie les recommandations d'action

### S26 — TIME dormants
1. ✅ Vérifie la section **TIME dormants**
2. ✅ Vérifie les statuts : Light, Strong, TimeRich, TimePoor
3. ✅ Vérifie les suggestions de recyclage des TIME

### S27 — Alertes & Notes
1. ✅ Vérifie la section **Alertes du réseau**
2. ✅ Clique sur une alerte pour voir les détails
3. ✅ Teste l'action **Résoudre** une alerte (avec note)
4. ✅ Teste l'action **Ignorer** une alerte
5. ✅ Vérifie la section **Notes** — ajoute une note sur un hero ou une mission
6. ✅ Vérifie que la note apparaît dans l'historique

### S28 — Rafraîchissement
1. ✅ Clique sur le bouton **Rafraîchir** pour recalculer les scores
2. ✅ Vérifie que les données se mettent à jour

---

## 🧪 PARTIE 6 — MISSIONS COLLECTIVES

### S29 — Voir les missions collectives
1. Va sur **Missions Collectives** → `/collective-missions`
2. ✅ Vérifie la liste des missions (si seed chargé)
3. ✅ Vérifie les détails : titre, organisateur, participants, statut

### S30 — Participer à une mission collective
1. ✅ Clique sur une mission ouverte
2. ✅ Vérifie la page détail : description, créneau, places, type (ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY)
3. ✅ Clique sur **Participer**
4. ✅ Vérifie que le compteur de participants augmente

---

## 🧪 SCÉNARIO COMPLET (TEST JOURNEY)

Ce scénario enchaîne toutes les étapes comme un vrai facilitateur utiliserait l'outil :

1. **Matin** — Sarah se connecte et vérifie le Dashboard Réseau
2. Elle repère une **demande urgente** bloquée depuis 48h
3. Elle va dans **Matching**, génère des recommandations pour cette urgence
4. Elle approuve une recommandation → le Hero reçoit une notification
5. Elle va dans **Pot Commun**, approuve une demande de financement
6. Elle laisse une **note** sur le Hero concerné pour suivi
7. Elle vérifie que les **TIME dormants** ont une suggestion de recyclage
8. **Après-midi** — Elle vérifie que les alertes ont été résolues
9. Elle clique **Rafraîchir** pour voir le nouveau score réseau

---

## ✅ Checklist finale

| # | Test | Statut |
|---|------|--------|
| S1 | Marketplace et découverte | ✅ |
| S2 | Réservation P2P | ✅ |
| S3 | Messagerie (envoi) | ✅ |
| S4 | Messagerie (réponse) | ✅ |
| S5 | Changement de statut (QR → completion) | ✅ |
| S6 | Complétion QR/preuve | ✅ |
| S7 | Évaluation (rating) | ⬜ |
| S8 | Wallet et transactions | ⬜ |
| S9 | Transfert P2P direct | ⬜ |
| S10 | Créer urgence | ⬜ |
| S11 | Répondre à une urgence | ⬜ |
| S12 | Dashboard Pot Commun | ⬜ |
| S13 | Approuver demande | ⬜ |
| S14 | Refuser demande | ⬜ |
| S15 | Transactions du pot | ⬜ |
| S16 | Missions solidaires | ⬜ |
| S17 | Matching urgent | ⬜ |
| S18 | Feedback matching | ⬜ |
| S19 | Matching solidaire | ⬜ |
| S20 | Matching collectif | ⬜ |
| S21 | Historique matchs | ⬜ |
| S22 | Dashboard Réseau | ⬜ |
| S23 | Demandes bloquées | ⬜ |
| S24 | Heroes sur-sollicités | ⬜ |
| S25 | Heroes sous-utilisés | ⬜ |
| S26 | TIME dormants | ⬜ |
| S27 | Alertes & Notes | ⬜ |
| S28 | Rafraîchissement | ⬜ |
| S29 | Missions collectives | ⬜ |
| S30 | Participer mission collective | ⬜ |
