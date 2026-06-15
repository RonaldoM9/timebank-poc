# 🧪 Plan de Recette — Lot 19 Missions Collectives / Co-production

> **Objectif :** Tester le flux complet des missions collectives : création, inscription, validation de présence, distribution TIME via pot commun, et non-régression des lots 1-18.
> **Seed :** `npm run seed:collective-missions` (idempotent, à lancer après `npm run seed:demo` et `npm run seed:facilitator-test`)
> **Base :** TimeHeroes POC — Lot 19 Missions Collectives

---

## Prérequis

```bash
cd /root/projects/timebank-poc/src
npm run seed:demo
npm run seed:facilitator-test
npm run seed:collective-missions
npm run build
node start-timeheroes.mjs
```

---

## Scénario 1 — Création d'une mission collective

| # | Action | Résultat attendu |
|---|--------|------------------|
| 1.1 | Connecte-toi avec **sarah.demo@timeheroes.fr** | |
| 1.2 | Va sur `/collective-missions/new` | ✅ Formulaire visible |
| 1.3 | Remplis : titre "Initiation au compostage", description "Atelier de 2h pour apprendre à composter dans son jardin", type "ONE_TO_MANY", catégorie "Jardinage", ville "Écouen", durée 2h, max participants 8, financement "NONE", pas solidaire | |
| 1.4 | Soumets | ✅ Mission créée, redirigé vers `/collective-missions/[id]` |
| 1.5 | Vérifie que tu es listé comme ORGANIZER | ✅ |
| 1.6 | Retour sur `/collective-missions` | ✅ Nouvelle mission visible dans la liste |

### Tests de validation

| # | Action | Résultat attendu |
|---|--------|------------------|
| 1.7 | Titre vide ("ab") | ❌ Refus "min 5 caractères" |
| 1.8 | Description trop courte ("test") | ❌ Refus "min 20 caractères" |
| 1.9 | Durée = 0 | ❌ Refus |
| 1.10 | Max participants = 1 | ❌ Refus "min 2" |
| 1.11 | Solidaire sans catégorie | ❌ Refus |
| 1.12 | Solidaire sans justification | ❌ Refus |

---

## Scénario 2 — Inscription / Désinscription

| # | Action | Résultat attendu |
|---|--------|------------------|
| 2.1 | Connecte-toi avec **karim.demo@timeheroes.fr** | |
| 2.2 | Va sur `/collective-missions` | ✅ 4 missions visibles (seed) |
| 2.3 | Ouvre "Atelier smartphone senior — Écouen" | ✅ Détail visible, bouton "Rejoindre" |
| 2.4 | Clique **Rejoindre** | ✅ Inscrit, bouton devient "Quitter" |
| 2.5 | Rafraîchis la page | ✅ Participants = 3 (Sarah, Alice, Karim) |
| 2.6 | Clique **Quitter** | ✅ Désinscrit |
| 2.7 | Essaie de rejoindre la mission terminée | ❌ Refus "n'accepte plus d'inscriptions" |
| 2.8 | Connecte-toi en tant que user non inscrit sur mission FULL | ❌ Refus si complet |

---

## Scénario 3 — Validation des présences (FACILITATOR)

| # | Action | Résultat attendu |
|---|--------|------------------|
| 3.1 | Connecte-toi **sarah.demo@timeheroes.fr** (FACILITATOR) | |
| 3.2 | Ouvre "Atelier smartphone senior" (Sarah est ORGANIZER) | |
| 3.3 | Fais rejoindre Karim (ou utilise seed existant) | |
| 3.4 | Clique **Valider présence** sur un participant | ✅ Statut passe VALIDATED |
| 3.5 | Clique **Absent** sur un autre participant | ✅ Statut passe NO_SHOW |
| 3.6 | Un participant VALIDATED apparaît dans la section "Prêts à compléter" | ✅ |

---

## Scénario 4 — Completion et distribution TIME

| # | Action | Résultat attendu |
|---|--------|------------------|
| 4.1 | Connecte-toi **sarah.demo@timeheroes.fr** | |
| 4.2 | Va sur une mission où au moins un participant est VALIDATED | |
| 4.3 | Clique **Compléter la mission** | ✅ Mission passe COMPLETED |
| 4.4 | Si `fundingSource = COMMUNITY_POT` : pot débité | ✅ |
| 4.5 | Chaque contributeur validé reçoit `durationHours` TIME | ✅ |
| 4.6 | Transaction `collective_mission_reward` créée pour chaque contributeur | ✅ |
| 4.7 | `CommunityPotTransaction` de type `COLLECTIVE_MISSION_FUNDING` créée | ✅ |
| 4.8 | Si pot insuffisant : message d'erreur, pas de complétion | ✅ |

---

## Scénario 5 — Annulation

| # | Action | Résultat attendu |
|---|--------|------------------|
| 5.1 | Connecte-toi **sarah.demo@timeheroes.fr** | |
| 5.2 | Ouvre une mission OPEN | |
| 5.3 | Clique **Annuler la mission** | ✅ Statut CANCELLED |
| 5.4 | Aucune distribution TIME | ✅ |
| 5.5 | Tentative de compléter une mission CANCELLED | ❌ Refus |
| 5.6 | Tentative d'annuler une mission COMPLETED | ❌ Refus |

---

## Scénario 6 — Dashboard & Impact

| # | Action | Résultat attendu |
|---|--------|------------------|
| 6.1 | Va sur `/dashboard` | ✅ Widget "Missions collectives" avec compteur |
| 6.2 | Va sur `/impact` | ✅ Section "Missions collectives" avec 4 KPIs |
| 6.3 | Vérifie KPIs : missions completed, participants validés, TIME distribués, heures collectives | ✅ |

---

## Scénario 7 — Facilitateur

| # | Action | Résultat attendu |
|---|--------|------------------|
| 7.1 | Connecte-toi **sarah.demo@timeheroes.fr** | |
| 7.2 | Va sur `/facilitator/community-pot` | ✅ 6ᵉ KPI "Collectives" présent |
| 7.3 | Clique sur le KPI | ✅ Redirigé vers `/collective-missions` |

---

## Scénario 8 — Non-régression

| Lot | Test | Résultat |
|-----|------|----------|
| 1 | Auth (connexion) | ✅ |
| 2B | Booking escrow/release/refund | ✅ |
| 6 | Urgent Help | ✅ |
| 10 | Gamification | ✅ |
| 17 | Community Pot don | ✅ |
| 17 bis | Facilitateur accès | ✅ |
| 18 | Missions solidaires | ✅ |
| Build | `npm run build` | ✅ 0 erreurs |

---

## Récapitulatif des données seed

| Mission | Type | Statut | Participants |
|---------|------|--------|-------------|
| Atelier smartphone senior — Écouen | ONE_TO_MANY | OPEN | Sarah (ORG), Alice (BEN) |
| Rangement jardin solidaire | MANY_TO_ONE | OPEN | Alex (ORG) |
| Repair Café quartier | MANY_TO_MANY | OPEN | Sarah (ORG) |
| Mission collective terminée — Test | MANY_TO_MANY | COMPLETED | 3 validés, 6 TIME distribués |

---

## Critères d'acceptation

- [ ] Un utilisateur peut créer une mission collective
- [ ] Les participants peuvent rejoindre et quitter
- [ ] Les places disponibles sont correctement calculées
- [ ] L'organisateur/facilitateur peut valider les présences
- [ ] Les contributeurs validés reçoivent les TIME
- [ ] Le pot commun est débité si financement COMMUNITY_POT
- [ ] Aucun TIME n'est distribué à un absent
- [ ] Une mission annulée ne distribue aucun TIME
- [ ] Une mission terminée ne peut pas être complétée deux fois
- [ ] Les missions collectives apparaissent dans le dashboard
- [ ] Les missions collectives alimentent la page impact
- [ ] Les missions solidaires collectives affichent le badge
- [ ] Les lots 1 à 18 restent fonctionnels
- [ ] `npm run build` passe sans erreur

---

## Commandes utiles

```bash
npm run seed:collective-missions   # Seed idempotent
npm run build                       # Build avec nouvelles routes
git tag lot-19-collective-missions  # Tag de release
```
