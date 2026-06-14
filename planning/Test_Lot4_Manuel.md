# ✅ Test Manuel — Lot 4 : Profil Public

> Coche chaque ✅ quand c'est bon.

---

## 1. Le profil s'affiche

| # | Action | Résultat attendu | ✅ |
|---|--------|------------------|---|
| 1 | Va sur `/profile/cmplir9lo000328mqb6x7xzx4` | La page se charge sans erreur | ☐ |
| 2 | Va sur `/profile/cmpliosii000028mqkos0jtgg` | La page se charge sans erreur | ☐ |

---

## 2. Header profil

| # | Vérification | ✅ |
|---|-------------|---|
| 3 | Le **nom** du héros est affiché | ☐ |
| 4 | Sa **réputation** est visible (⭐ X.X/5 ou "Nouveau héros") | ☐ |
| 5 | La **date d'inscription** est affichée | ☐ |
| 6 | Le **wallet** est tronqué (ex: `time_cmplio...000`) pas le wallet complet | ☐ |

---

## 3. Bio

| # | Action | Résultat | ✅ |
|---|--------|----------|---|
| 7 | Va sur `/profile/cmplir9lo000328mqb6x7xzx4` | Bio affichée si elle existe | ☐ |
| 8 | Va sur un profil **sans bio** | Message "Ce héros n'a pas encore renseigné sa bio" | ☐ |

---

## 4. KPIs Impact

| # | Vérification | ✅ |
|---|-------------|---|
| 9 | Section **"Impact dans la communauté"** visible | ☐ |
| 10 | **Réputation** affichée | ☐ |
| 11 | **Services actifs** (nombre) affiché | ☐ |
| 12 | **Missions réalisées** (nombre) affiché | ☐ |
| 13 | **TIME gagnés** affiché | ☐ |

---

## 5. Services actifs

| # | Vérification | ✅ |
|---|-------------|---|
| 14 | Les services **actifs** du provider sont affichés (cards) | ☐ |
| 15 | Chaque card a : titre, description, catégorie, tarif TIME/h, bouton Voir | ☐ |
| 16 | Les services **inactifs** ne sont PAS visibles | ☐ |
| 17 | Si zéro service : message "Ce héros n'a pas encore de service actif" | ☐ |

---

## 6. Avis reçus

| # | Vérification | ✅ |
|---|-------------|---|
| 18 | Section **"Avis de la communauté"** visible | ☐ |
| 19 | Chaque avis montre : score, commentaire, nom du client, service | ☐ |
| 20 | Si zéro avis : message "Aucun avis pour le moment." | ☐ |

---

## 7. Privacy (SÉCURITÉ)

| # | Vérification | ✅ |
|---|-------------|---|
| 21 | L'**email** n'apparaît PAS dans le profil | ☐ |
| 22 | Le **solde TIME** (timeBalance) n'apparaît PAS | ☐ |
| 23 | Les **transactions** privées n'apparaissent PAS | ☐ |
| 24 | Les **bookings** privés n'apparaissent PAS | ☐ |

---

## 8. Navigation

| # | Action | Résultat | ✅ |
|---|--------|----------|---|
| 25 | Depuis `/services`, clique sur le **nom du provider** | Arrive sur `/profile/[id]` | ☐ |
| 26 | Depuis `/services/[id]`, clique **"Voir le profil complet"** | Arrive sur `/profile/[id]` | ☐ |
| 27 | Depuis `/bookings/[id]`, clique sur le **nom du client/provider** | Arrive sur `/profile/[id]` | ☐ |

---

## 9. 404

| # | Action | Résultat | ✅ |
|---|--------|----------|---|
| 28 | Va sur `/profile/fake-id-qui-nexiste-pas` | Page 404 propre : "Héros introuvable" | ☐ |

---

## 10. Non connecté

| # | Action | Résultat | ✅ |
|---|--------|----------|---|
| 29 | Ouvre `/profile/[id]` dans un onglet **navigation privée** | Le profil est visible (pas de redirection login) | ☐ |

---

## 11. Responsive

| # | Action | Résultat | ✅ |
|---|--------|----------|---|
| 30 | Réduis la fenêtre en largeur mobile (~375px) | Tout est lisible, pas de scroll horizontal | ☐ |

---

## Résultat final

**☐ / 30 tests OK** → Valide si ≥ 28/30 ✅

Si un test échoue, note le numéro ici :
- Échec(s) : #___
