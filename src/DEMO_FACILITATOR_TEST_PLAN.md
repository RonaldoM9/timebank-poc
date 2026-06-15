# 🧪 Plan de Recette — Rôle Facilitateur / Gardien des TIME

> **Objectif :** Tester le flux complet du rôle Facilitateur : accès, validation/refus des demandes, impact sur le pot commun, missions solidaires.
> **Seed :** `npm run seed:facilitator-test` (idempotent, à lancer après `npm run seed:demo`)
> **Base :** TimeHeroes POC — Lot 17 Community Pot + Lot 17 bis Facilitateur + Lot 18 Missions Solidaires

---

## Prérequis

1. Base seedée :
   ```bash
   cd /root/projects/timebank-poc/src
   npm run seed:demo          # Comptes, services, bookings, transactions
   npm run seed:facilitator-test  # Données facilitateur
   npm run build              # Build sans erreur
   node start-timeheroes.mjs  # Démarrage serveur
   ```

2. Comptes de test :

   | Rôle        | Email                       | Mot de passe    |
   |-------------|-----------------------------|-----------------|
   | ADMIN       | demo@timeheroes.fr          | TimeHeroes2026! |
   | FACILITATOR | sarah.demo@timeheroes.fr    | TimeHeroes2026! |
   | USER        | karim.demo@timeheroes.fr    | TimeHeroes2026! |
   | USER        | alice.seed@timeheroes.fr    | TimeHeroes2026! |

---

## Scénario 1 — Accès rôles

**Objectif :** Vérifier que seuls ADMIN et FACILITATOR accèdent à l'espace facilitateur.

| # | Action | Résultat attendu |
|---|--------|------------------|
| 1.1 | Connecte-toi avec **demo@timeheroes.fr** (ADMIN) | ✅ Accès à `/facilitator/community-pot` |
| 1.2 | Le lien "Facilitateur" apparaît dans la navigation | ✅ Icône bouclier visible |
| 1.3 | Déconnexion → connexion avec **sarah.demo@timeheroes.fr** (FACILITATOR) | ✅ Accès à `/facilitator/community-pot` |
| 1.4 | Le lien "Facilitateur" apparaît dans la navigation | ✅ Visible pour Sarah |
| 1.5 | Déconnexion → connexion avec **karim.demo@timeheroes.fr** (USER) | ❌ Redirigé vers `/dashboard` en tentant `/facilitator/community-pot` |
| 1.6 | Le lien "Facilitateur" n'apparaît PAS dans la navigation | ✅ Menu sans icône bouclier |

---

## Scénario 2 — Validation d'une demande (APPROVE)

**Objectif :** Valider la Demande A (Alice, 3 TIME, mission solidaire).

| # | Action | Résultat attendu |
|---|--------|------------------|
| 2.1 | Connexion **sarah.demo@timeheroes.fr** | |
| 2.2 | Aller sur `/facilitator/community-pot` | |
| 2.3 | Observer les KPIs en haut de page | ✅ 5 indicateurs visibles : Solde (50), Dons (1), TIME utilisés (5), Demandes en attente (3), Missions (0) |
| 2.4 | Repérer la demande "Financer une mission solidaire d'aide numérique senior" — Alice, 3 TIME | ✅ Demande visible dans la section "Demandes en attente" |
| 2.5 | Cliquer sur **Valider** | ✅ Modal de confirmation apparaît |
| 2.6 | Optionnel : saisir une note "Mission senior validée" | |
| 2.7 | Confirmer la validation | ✅ Message "Demande approuvée avec succès !" |
| 2.8 | Vérifier le solde du pot commun | ✅ 50 - 3 = **47 TIME** |
| 2.9 | Vérifier les KPIs | ✅ Demandes en attente passe à 2, Missions passe à 1, TIME utilisés augmente de 3 |
| 2.10 | Aller dans `/wallet` | ✅ Pot commun affiche 47 TIME |
| 2.11 | Vérifier l'historique du pot | ✅ Transaction FUNDING de 3 TIME visible |
| 2.12 | Aller sur `/bookings/[id]` du booking lié (Aide smartphone senior) | ✅ "Financé par le pot commun" affiché |
| 2.13 | L'historique des décisions du facilitateur | ✅ Demande dans l'onglet historique avec statut APPROVED |

---

## Scénario 3 — Refus d'une demande (REJECT)

**Objectif :** Refuser la Demande B (Karim, 5 TIME).

| # | Action | Résultat attendu |
|---|--------|------------------|
| 3.1 | Toujours connecté en tant que Sarah | |
| 3.2 | Aller sur `/facilitator/community-pot` | |
| 3.3 | Repérer la demande "Demande de financement à refuser pour tester le workflow" — Karim, 5 TIME | ✅ Visible dans "Demandes en attente" |
| 3.4 | Cliquer sur **Refuser** | ✅ Modal de confirmation apparaît |
| 3.5 | Saisir une note : "Demande test refusée — workflow OK" | |
| 3.6 | Confirmer le refus | ✅ Message "Demande refusée." |
| 3.7 | Vérifier le solde du pot commun | ✅ Toujours **47 TIME** (pas de débit) |
| 3.8 | L'historique des décisions | ✅ Demande dans l'onglet historique avec statut REJECTED + note + décidé par Sarah |

---

## Scénario 4 — Pot insuffisant

**Objectif :** Vérifier le blocage d'une demande de 999 TIME alors que le pot a 47 TIME.

| # | Action | Résultat attendu |
|---|--------|------------------|
| 4.1 | Toujours connecté en tant que Sarah | |
| 4.2 | Aller sur `/facilitator/community-pot` | |
| 4.3 | Repérer la demande "Test solde pot insuffisant" — Alice, 999 TIME | ✅ Visible |
| 4.4 | Cliquer sur **Valider** | ✅ Modal de confirmation |
| 4.5 | Confirmer la validation | ❌ Message d'erreur : "Solde du pot insuffisant. Le pot a 47 TIME, la demande est de 999 TIME." |
| 4.6 | Vérifier le solde du pot commun | ✅ Toujours **47 TIME** — aucun débit effectué |
| 4.7 | Vérifier que la demande est toujours PENDING | ✅ Statut inchangé |

---

## Scénario 5 — Non-régression

**Objectif :** Vérifier que les fonctionnalités existantes ne sont pas cassées.

| # | Action | Résultat attendu |
|---|--------|------------------|
| 5.1 | Aller sur `/wallet` et donner 2 TIME au pot commun | ✅ Don réussi, pot passe à 49 TIME |
| 5.2 | Faire un transfert TIME classique via `/wallet/transfer` | ✅ Transaction transfer créée |
| 5.3 | Aller sur `/services` | ✅ 39 services visibles (36 démo + 3 solidaires) |
| 5.4 | Filtrer les missions solidaires | ✅ Les 3 missions solidaires apparaissent avec badge |
| 5.5 | Ouvrir `/services/[id]` pour "Aide smartphone senior" | ✅ Badge solidaire visible + section pot commun |
| 5.6 | Ouvrir `/services/[id]` pour "Accompagnement courses senior" | ✅ Badge SELF_DECLARED visible |
| 5.7 | Aller sur `/bookings/[id]` du booking "Aide smartphone senior" | ✅ "Financé par le pot commun" affiché |
| 5.8 | Aller sur `/profile/[id]` d'Alice | ✅ Pas de données sensibles exposées |
| 5.9 | Lancer `npm run build` | ✅ 0 erreurs |

---

## Récapitulatif des données de test

### Demandes de financement

| ID | Demandeur | Mt | Statut | Usage |
|----|-----------|----|--------|-------|
| A | Alice | 3 TIME | PENDING | ✅ À approuver (débite le pot) |
| B | Karim | 5 TIME | PENDING | ❌ À refuser (ne débite pas) |
| C | Alice | 999 TIME | PENDING | ⛔ Validation impossible (pot insuffisant) |
| D | Alice | 2 TIME | APPROVED | Historique |
| E | Karim | 4 TIME | REJECTED | Historique |

### Missions solidaires

| Mission | Catégorie | Statut | Provider |
|---------|-----------|--------|----------|
| Aide smartphone senior | DIGITAL_HELP | VERIFIED | Sarah Martin |
| Accompagnement courses senior | SENIOR_SUPPORT | SELF_DECLARED | Karim Benali |
| Soutien administratif solidaire | LOCAL_SUPPORT | VERIFIED | Alex Demo |

### Pot commun

| Élément | Valeur |
|---------|--------|
| Solde initial | 50 TIME |
| 1 donation | Alice, +5 TIME (J-15) |
| 1 funding approuvé | -3 TIME (J-10) |
| 1 funding refusé | -2 TIME (J-7) |
| Transaction FUNDING | Créée après validation |

---

## Critères d'acceptation

- [ ] `/facilitator/community-pot` n'est pas vide
- [ ] Sarah peut tester validation/refus immédiatement
- [ ] Karim ne peut pas accéder à l'espace facilitateur
- [ ] Une demande validée débite réellement le pot
- [ ] Une demande refusée ne touche pas au pot
- [ ] L'historique des décisions est lisible
- [ ] Les missions solidaires liées sont visibles dans la marketplace
- [ ] Le booking financé affiche "financé par le pot commun"
- [ ] `npm run build` passe sans erreur
- [ ] `npm run seed:facilitator-test` peut être relancé sans casser les données

---

## Commandes utiles

```bash
# Lancer le seed facilitateur (après seed:demo)
npm run seed:facilitator-test

# Build
npm run build

# Démarrer le serveur
node start-timeheroes.mjs

# Reset complet (si besoin)
npm run seed:demo
npm run seed:facilitator-test
```
