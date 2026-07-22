# Lot 22 — Cahier de Recette / Test Plan

> Partner Spaces / Organisations clientes — Sécurisation complète
> Date : 21/06/2026 | Tag : `lot-22-partner-spaces`

---

## Résumé des actions de sécurisation

| Action | Statut |
|---|---|
| Zod validation sur toutes les server actions (12/12) | ✅ |
| Permission system centralisé (7 permissions, 5 rôles) | ✅ |
| Vérification statut org avant actions admin | ✅ |
| Validation rôles (OWNER protégé, role in ORGANIZATION_ROLES) | ✅ |
| Anti self-invite | ✅ |
| Anti remove self (doit utiliser leave) | ✅ |
| Anti double-archive / double-suspend / double-verify | ✅ |
| Validation CUID sur tous les IDs | ✅ |

---

## 1. Accès et authentification

| ID | Test | Attendu |
|---|---|---|
| T01 | USER non connecté → `/organizations` | OK (page publique) |
| T02 | USER non connecté → `/organizations/new` | Redirige `/auth/signin` |
| T03 | USER non connecté → `/organizations/[slug]/dashboard` | Redirige `/auth/signin` |
| T04 | USER non connecté → `/organizations/[slug]/members` | Redirige `/auth/signin` |
| T05 | USER non connecté → `/admin/organizations` | Redirige `/auth/signin` |
| T06 | USER (role=USER) → `/admin/organizations` | Redirige `/dashboard` |
| T07 | FACILITATOR → `/admin/organizations` | Redirige `/dashboard` |
| T08 | ADMIN → `/admin/organizations` | OK (200) |
| T09 | USER voie `/organizations` | Liste visible |
| T10 | USER clique sur org → page publique | OK |

---

## 2. Création organisation (Zod validation)

| ID | Test | Attendu |
|---|---|---|
| T11 | Nom vide | Refus : "Le nom doit faire au moins 3 caractères" |
| T12 | Nom = "ab" (2 chars) | Refus |
| T13 | Nom = "ABC" (3 chars) | Accepté |
| T14 | Nom = 101 caractères | Refus |
| T15 | Type vide | Refus : "Type d'organisation invalide" |
| T16 | Type = "INVALID_TYPE" | Refus |
| T17 | Type = "CITY" | Accepté |
| T18 | Type = "ASSOCIATION" | Accepté |
| T19 | Type = "CCAS" | Accepté |
| T20 | Type = "SOCIAL_LANDLORD" | Accepté |
| T21 | Type = "SCHOOL" | Accepté |
| T22 | Type = "COMPANY" | Accepté |
| T23 | Type = "FOUNDATION" | Accepté |
| T24 | Type = "SENIOR_RESIDENCE" | Accepté |
| T25 | Type = "COMMUNITY_CENTER" | Accepté |
| T26 | Type = "OTHER" | Accepté |
| T27 | Ville vide | Refus : "La ville est obligatoire" |
| T28 | Ville = "Paris" | Accepté |
| T29 | Description courte = 181 caractères | Refus |
| T30 | Description courte = 180 caractères | Accepté |
| T31 | Description = 1501 caractères | Refus |
| T32 | Description = 1500 caractères | Accepté |
| T33 | Website = "pas-une-url" | Refus : "L'URL n'est pas valide" |
| T34 | Website = "https://example.fr" | Accepté |
| T35 | Email = "pas-un-email" | Refus |
| T36 | Email = "contact@exemple.fr" | Accepté |
| T37 | Formulaire valide complet | ✅ Organisation créée |
| T38 | Slug automatique généré | Vérifier slug correct |
| T39 | Slug unique (même nom 2×) | slug-1, slug-2 |
| T40 | Statut après création | PENDING_REVIEW |
| T41 | Créateur devient OWNER | Vérifier rôle |
| T42 | Pot créé automatiquement | Balance = 0 |
| T43 | Redirection après création | `/organizations/[slug]/dashboard` |

---

## 3. Page publique organisation

| ID | Test | Attendu |
|---|---|---|
| T44 | Slug existe → page 200 | OK |
| T45 | Slug inexistant → 404 | OK |
| T46 | Nom affiché | ✅ |
| T47 | Type affiché | ✅ |
| T48 | Statut + badge couleur | ✅ |
| T49 | Ville + département | ✅ |
| T50 | Description courte | ✅ |
| T51 | Description complète | ✅ |
| T52 | Nombre de membres | ✅ |
| T53 | Solde pot affiché | ✅ |
| T54 | Badge "Partenaire vérifié" si isVerified | ✅ |
| T55 | Lien site web si présent | ✅ |
| T56 | Email de contact PAS affiché | ❌ privé |
| T57 | CTA "Rejoindre" pour connecté | ✅ |
| T58 | CTA "Connectez-vous" pour non connecté | ✅ |
| T59 | Lien dashboard pour OWNER/ADMIN/FACILITATOR | ✅ |
| T60 | Lien dashboard PAS visible pour non-membre | ✅ |

---

## 4. Dashboard privé (permissions)

| ID | Test | Attendu |
|---|---|---|
| T61 | OWNER voit dashboard | OK |
| T62 | ADMIN voit dashboard | OK |
| T63 | FACILITATOR voit dashboard | OK |
| T64 | MEMBER ne voit pas dashboard | 404 |
| T65 | VIEWER ne voit pas dashboard | 404 |
| T66 | USER hors organisation ne voit pas | 404 |
| T67 | ADMIN global voit n'importe quel dashboard | OK |
| T68 | KPIs dashboard corrects (membres, missions, TIME) | ✅ |
| T69 | Actions rapides visibles | ✅ |
| T70 | Lien membres visible | ✅ |
| T71 | Lien paramètres visible | ✅ |

---

## 5. Gestion des membres (permissions)

| ID | Test | Attendu |
|---|---|---|
| T72 | OWNER voit page membres | OK |
| T73 | ADMIN voit page membres | OK |
| T74 | FACILITATOR voit page membres (lecture) | OK |
| T75 | MEMBER ne voit pas page membres | 404 |
| T76 | USER hors organisation ne voit pas | 404 |
| T77 | Liste membres complète | ✅ |
| T78 | Noms, emails, rôles affichés | ✅ |

---

## 6. Invitation membres

| ID | Test | Attendu |
|---|---|---|
| T79 | OWNER peut inviter | OK |
| T80 | ADMIN peut inviter | OK |
| T81 | FACILITATOR ne peut PAS inviter | ✅ (permission MANAGE_MEMBERS) |
| T82 | MEMBER ne peut PAS inviter | ✅ |
| T83 | Email vide → refus Zod | ✅ |
| T84 | Email invalide → refus | ✅ |
| T85 | Email valide → accepté | ✅ |
| T86 | Rôle invalide → refus Zod | ✅ |
| T87 | Rôle = "MEMBER" → OK | ✅ |
| T88 | Rôle = "FACILITATOR" → OK | ✅ |
| T89 | Rôle = "ADMIN" → OK | ✅ |
| T90 | Rôle = "OWNER" → OK (peut inviter comme OWNER) | ✅ |
| T91 | Inviter user inexistant → "Aucun utilisateur trouvé" | ✅ |
| T92 | Inviter soi-même → refus | ✅ (nouveau !) |
| T93 | Inviter membre déjà actif → "déjà membre" | ✅ |
| T94 | Invitation crée OrganizationMember | ✅ |
| T95 | Invitation crée OrganizationInvitation | ✅ |

---

## 7. Modification des rôles

| ID | Test | Attendu |
|---|---|---|
| T96 | OWNER peut changer rôle membre | OK |
| T97 | ADMIN peut changer rôle membre | OK |
| T98 | FACILITATOR ne peut PAS changer rôle | Refus |
| T99 | MEMBER ne peut PAS changer rôle | Refus |
| T100 | Changer rôle en "OWNER" | ✅ (permission role valide) |
| T101 | Changer rôle d'un OWNER | Refus : "Impossible" |
| T102 | Changer rôle invalide (ex: "SUPERUSER") | Refus Zod |
| T103 | Changer rôle MEMBER → FACILITATOR | OK |
| T104 | Changer rôle FACILITATOR → ADMIN | OK |

---

## 8. Retrait de membres

| ID | Test | Attendu |
|---|---|---|
| T105 | OWNER peut retirer un membre | OK |
| T106 | ADMIN peut retirer un membre | OK |
| T107 | FACILITATOR ne peut PAS retirer | Refus |
| T108 | MEMBER ne peut PAS retirer | Refus |
| T109 | Retirer un OWNER | Refus : "Impossible" |
| T110 | Retirer soi-même (via remove) | Refus : "Utilisez 'Quitter'" ✅ (nouveau !) |
| T111 | Retirer → status = REMOVED | ✅ |
| T112 | Retirer un membre déjà REMOVED | Erreur propre |

---

## 9. Quitter une organisation

| ID | Test | Attendu |
|---|---|---|
| T113 | MEMBER peut quitter | OK |
| T114 | FACILITATOR peut quitter | OK |
| T115 | Seul OWNER ne peut PAS quitter | "Transférez le rôle" |
| T116 | Si 2 OWNERS, un OWNER peut quitter | OK |
| T117 | Non-membre → "pas membre actif" | ✅ |
| T118 | Après avoir quitté, l'user ne voit plus le dashboard | 404 |

---

## 10. Rejoindre une organisation

| ID | Test | Attendu |
|---|---|---|
| T119 | USER peut rejoindre une org active | OK |
| T120 | Rejoindre org suspendue | Refus |
| T121 | Rejoindre org archivée | Refus |
| T122 | Rejoindre org PENDING_REVIEW | OK (status pas filtré) |
| T123 | Rejoindre alors que déjà membre actif | "déjà membre" |
| T124 | Rejoindre après avoir été REMOVED | Refus |
| T125 | Rejoindre après INVITED → devient ACTIVE | ✅ |

---

## 11. Admin — Vérifier organisation

| ID | Test | Attendu |
|---|---|---|
| T126 | ADMIN vérifie org PENDING_REVIEW → VERIFIED | OK |
| T127 | ADMIN vérifie org déjà VERIFIED | Refus : "déjà vérifiée" |
| T128 | ADMIN vérifie org ARCHIVED | Refus |
| T129 | ADMIN vérifie org SUSPENDED | Refus |
| T130 | USER tente de vérifier | Refus : "réservée aux administrateurs" |
| T131 | FACILITATOR tente de vérifier | Refus |
| T132 | Après vérification : isVerified=true, verifiedAt, verifiedById | ✅ |

---

## 12. Admin — Suspendre organisation

| ID | Test | Attendu |
|---|---|---|
| T133 | ADMIN suspend org ACTIVE → SUSPENDED | OK |
| T134 | ADMIN suspend org SUSPENDED | Refus : "déjà suspendue" |
| T135 | ADMIN suspend org ARCHIVED | Refus |
| T136 | USER tente de suspendre | Refus |
| T137 | Après suspension : org inaccessible (join, missions) | ✅ |

---

## 13. Admin — Activer organisation

| ID | Test | Attendu |
|---|---|---|
| T138 | ADMIN active org SUSPENDED → ACTIVE | OK |
| T139 | ADMIN active org ACTIVE | Refus : "déjà active" |
| T140 | ADMIN active org ARCHIVED | Refus |
| T141 | USER tente d'activer | Refus |
| T142 | Après activation : org à nouveau accessible | ✅ |

---

## 14. Archiver organisation

| ID | Test | Attendu |
|---|---|---|
| T143 | OWNER archive son org → ARCHIVED | OK |
| T144 | ADMIN archive son org → ARCHIVED | OK |
| T145 | ADMIN global archive n'importe quelle org | OK |
| T146 | FACILITATOR archive org | Refus |
| T147 | MEMBER archive org | Refus |
| T148 | Archiver org déjà ARCHIVED | Refus : "déjà archivée" |

---

## 15. Pot TIME organisation

| ID | Test | Attendu |
|----|------|---------|
| T149 | Pot créé automatiquement à la création | Balance = 0 |
| T150 | MEMBRE connecté → page `/organizations/[slug]/pot` | ✅ Page accessible, header = "Donner au pot — {org}" |
| T151 | FACILITATOR/ADMIN/OWNER → même page | ✅ Header = "Pot TIME — {org}" |
| T152 | MEMBRE donne 5 TIME | User -5, pot +5, transaction DONATION créée |
| T153 | MEMBRE donne 0 TIME | Refus Zod : "positif" |
| T154 | MEMBRE donne montant négatif | Refus Zod |
| T155 | MEMBRE donne > solde | Refus : "Solde insuffisant" |
| T156 | MEMBRE donne > 10000 | Refus Zod |
| T157 | Transaction DONATION enregistrée avec fromUserId, amount, type | ✅ |
| T158 | Transaction TIME créée (type: transfer) dans ledger global | ✅ |
| T159 | OWNER voit historique complet des transactions pot | ✅ |
| T160 | MEMBER voit le même historique (transparence totale) | ✅ |
| T161 | MEMBER voit le formulaire de don + bouton "Donner" | ✅ |
| T162 | MEMBER voit la description "Donnez du TIME pour soutenir..." | ✅ |
| T163 | FACILITATOR voit la description "Gérez le pot commun..." | ✅ |
| T164 | Carte info adaptée pour MEMBER : "En donnant, vous contribuez..." | ✅ |
| T165 | Carte info adaptée pour FACILITATOR+ : "En tant que gestionnaire..." | ✅ |
| T166 | Utilisateur connecté NON membre de l'org → page pot | ✅ Page accessible mais formulaire masqué, message "Vous devez être membre" affiché |
| T167 | Utilisateur NON connecté → `/organizations/[slug]/pot` | Redirige `/auth/signin` |
| T168 | Dashboard "Actions rapides → Pot TIME" visible pour MEMBER | ✅ Lien présent avec "Voir le solde · Donner au pot" |
| T169 | `canManage` = true pour FACILITATOR/ADMIN/OWNER | ✅ Prêt pour futures actions de gestion |
| T170 | `canManage` = false pour MEMBER | ✅ |
| T171 | MEMBER donne avec montant décimal (ex: 5.5) | Refus Zod (int requis) |
| T172 | MEMBER donne 1 TIME (minimum) | Accepté ✅ |
| T173 | Double don rapide (soumission multiple) | Transaction atomique, pas de double débit |

---

## 16. Navigation

| ID | Test | Attendu |
|---|---|---|
| T160 | Lien "Organisations" dans le menu | Visible pour tous connectés |
| T161 | Lien "Admin org." dans le menu | Visible pour ADMIN seulement |
| T162 | FACILITATOR ne voit PAS "Admin org." | ✅ |
| T163 | USER ne voit PAS "Admin org." | ✅ |
| T164 | Page `/organizations` liste toutes les orgs | ✅ |

---

## 17. Filtres page organisations

| ID | Test | Attendu |
|---|---|---|
| T165 | Filtre par nom (recherche) | Filtre correct |
| T166 | Filtre par type | Filtre correct |
| T167 | Filtre par ville | Filtre correct |
| T168 | Combinaison recherche + type | Filtre correct |
| T169 | Aucun résultat → message vide | ✅ |
| T170 | Reset filtres → toutes les orgs | ✅ |

---

## 18. Seed de démonstration

| ID | Test | Attendu |
|---|---|---|
| T171 | `npm run seed:organizations` | ✅ 5 organisations créées |
| T172 | Ville Démo — Saint-Martin-sur-Seine (CITY) | ✅ |
| T173 | CCAS Écouen (CCAS) | ✅ |
| T174 | Association Les Voisins Solidaires (ASSOCIATION) | ✅ |
| T175 | Résidence Horizon (SOCIAL_LANDLORD) | ✅ |
| T176 | Fondation Horizon Social (FOUNDATION) | ✅ |
| T177 | Alex Demo = OWNER de 2 orgs | ✅ |
| T178 | Sarah Martin = FACILITATOR dans 3 orgs | ✅ |
| T179 | Pots TIME avec soldes corrects (120, 80, 45, 30, 200) | ✅ |
| T180 | Membres affectés correctement | ✅ |
| T181 | Idempotent (rejouable) | ✅ |

---

## 19. Sécurité — Anti-fuite de données

| ID | Test | Attendu |
|---|---|---|
| T182 | Les emails ne sont PAS exposés publiquement | ✅ |
| T183 | Les données privées d'org A ne fuient pas vers org B | ✅ (permission check) |
| T184 | Les membres REMOVED n'apparaissent pas en count | ✅ (status filter) |
| T185 | Un USER ne peut pas accéder au dashboard d'une org dont il n'est pas membre | ✅ |
| T186 | Un USER ne peut pas appeler les actions admin | ✅ |
| T187 | Les CUIDs sont imprévisibles (pas d'ID auto-incrément) | ✅ |
| T188 | Les tokens d'invitation sont hashés (UUID) | ✅ |

---

## 20. Sécurité — Résistance aux manipulations

| ID | Test | Attendu |
|---|---|---|
| T189 | Appeler `verifyOrganizationAction` avec ID invalide | Zod refuse |
| T190 | Appeler `suspendOrganizationAction` avec ID vide | Zod refuse |
| T191 | CRUD injection XSS dans le nom | Zod sanitize (trim) |
| T192 | Description avec HTML | Zod accepte (rendu texte) |
| T193 | Website URL avec javascript: | Zod refuse (url validation) |
| T194 | Email avec injection | Zod refuse (email validation) |
| T195 | Appeler action avec mauvaise orgId qui existe mais n'appartient pas | Permission refuse |
| T196 | Double soumission rapide (race condition) | Transaction Prisma gère |

---

## 21. Build & Déploiement

| ID | Test | Attendu |
|---|---|---|
| T197 | `npm run build` | 0 erreurs |
| T198 | Nombre de routes | 30+ routes |
| T199 | Tag git `lot-22-partner-spaces` | ✅ |
| T200 | Push sur `origin/main` | ✅ |
| T201 | Site accessible après build | ✅ |

---

## 22. Règles métier — Cas limites

| ID | Test | Attendu |
|---|---|---|
| T202 | Supprimer le dernier OWNER impossible | ✅ (leave bloqué, remove bloqué) |
| T203 | 2 OWNERS → l'un peut quitter | ✅ |
| T204 | 2 OWNERS → l'un peut retirer l'autre | Bloqué (remove OWNER impossible) |
| T205 | MEMBER promu ADMIN → peut gérer membres | ✅ |
| T206 | ADMIN promu OWNER → peut archiver | ✅ |
| T207 | OWNER rétrogradé ADMIN → ne peut plus archiver | ✅ |
| T208 | FACILITATOR promu ADMIN → peut inviter | ✅ |
| T209 | Créer org sans pot | Impossible (pot auto-créé) |
| T210 | Créer org sans être OWNER | Impossible (createur = OWNER) |

---

## 23. Intégration avec lots existants

| ID | Test | Attendu |
|---|---|---|
| T211 | Service peut avoir organizationId | ✅ |
| T212 | CollectiveMission peut avoir organizationId | ✅ |
| T213 | Les KPIs dashboard comptent les missions org | ✅ |
| T214 | Non-régression Lots 1-21 | ✅ |

---

## 24. Résumé des validations Zod

| Action | Champs validés | Contraintes |
|---|---|---|
| createOrganization | 11 champs | name≥3, type in list, city required, url+email valides, shortDesc≤180, desc≤1500 |
| updateOrganization | 7 champs (optionals) | Mêmes contraintes, null permis |
| inviteMember | email, role | Email valide, role in list |
| updateMemberRole | newRole | Role in list, ≠ OWNER |
| potDonation | amount | Int, >0, ≤10000 |
| organizationId | id | CUID format |
| memberId | id | CUID format |

---

## 25. Résumé des permissions

| Rôle | VIEW_PRIVATE_DASHBOARD | MANAGE_ORG | MANAGE_MEMBERS | CREATE_MISSION | MANAGE_POT | ARCHIVE |
|---|---|---|---|---|---|---|
| OWNER | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| FACILITATOR | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| MEMBER | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| VIEWER | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| ADMIN global | ✅ (toutes) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 26. Cas de test additionnels — Sécurité renforcée

| ID | Test | Attendu |
|---|---|---|
| T215 | ORGANIZATION_ROLES.keys n'inclut pas "SUPER_ADMIN" → Zod refuse | ✅ |
| T216 | updateMemberRole OWNER garde le OWNER protégé | ✅ (vérification serveur) |
| T217 | inviteMember pour email déjà membre ACTIF → refus | ✅ |
| T218 | inviteMember pour email REMOVED → réactivation | ✅ |
| T219 | joinOrganization sur org inexistante → "introuvable" | ✅ |
| T220 | leaveOrganization sur org inexistante → "pas membre" | ✅ |
| T221 | Créer org avec contactEmail valide mais nom vide → refus Zod | ✅ |
| T222 | Créer org avec city url encodée → accepté (Zod trim) | ✅ |
| T223 | Créer org avec accents dans le slug → normalisé | ✅ |
| T224 | ADMIN global voit dashboard sans être membre | ✅ (bypass permission) |
| T225 | ADMIN global peut inviter n'importe qui | ✅ |
| T226 | ADMIN global peut archiver n'importe quelle org | ✅ |
| T227 | USER qui était OWNER puis REMOVED ne peut pas ré-joindre | ✅ |
| T228 | INVITED (= status INVITED) peut être réactivé via join | ✅ |
| T229 | Montant donation pot avec décimale → Zod int | Refus |
| T230 | Montant donation = 0.5 → Zod int | Refus (pas int) |

---

## Fichiers modifiés pour la sécurisation

| Fichier | Changement |
|---|---|
| `lib/organization-schemas.ts` | **NOUVEAU** — 5 schémas Zod, types, validateurs CUID |
| `app/actions/organizations.ts` | **RÉÉCRIT** — Zod sur 12 actions, statuts checks, anti-self-invite, anti-self-remove |
| `lib/organizations.ts` | **INCHANGÉ** — permission system inchangé (déjà solide) |
