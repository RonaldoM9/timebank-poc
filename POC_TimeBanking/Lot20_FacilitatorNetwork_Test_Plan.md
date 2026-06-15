# Cahier de Recette — Lot 20
## Facilitator Dashboard v2 / Intelligence réseau

### Objectif
Vérifier que le dashboard Intelligence réseau fonctionne correctement :
- Page `/facilitator/network` accessible FACILITATOR/ADMIN uniquement
- KPIs santé réseau
- Détection demandes bloquées
- Détection Heroes sur-sollicités / sous-utilisés
- Détection TIME dormants
- Alertes réseau (génération, résolution, ignorance)
- Notes facilitateur
- Non-régression Lots 1-19

### Comptes de test
| User | Email | Password | Rôle |
|------|-------|----------|------|
| Sarah Martin | `sarah.demo@timeheroes.fr` | `TimeHeroes2026!` | FACILITATOR |
| Alex Demo | `demo@timeheroes.fr` | `TimeHeroes2026!` | ADMIN |
| Karim Benali | `karim.demo@timeheroes.fr` | `TimeHeroes2026!` | USER |

### Tests

#### Accès et navigation
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.001 | USER accède `/facilitator/network` | Redirection `/dashboard` |
| T20.002 | FACILITATOR accède `/facilitator/network` | ✅ Page affichée |
| T20.003 | ADMIN accède `/facilitator/network` | ✅ Page affichée |
| T20.004 | Lien "Intelligence réseau" visible dans le menu FACILITATOR | ✅ |
| T20.005 | Lien "Intelligence réseau" caché pour USER | ✅ |
| T20.006 | Lien "Pot commun" toujours visible FACILITATOR | ✅ |

#### KPIs santé réseau
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.007 | Score santé réseau affiché (0-100) | ✅ |
| T20.008 | Demandes bloquées comptées | ✅ Valeur > 0 |
| T20.009 | Heroes sur-sollicités comptés | ✅ |
| T20.010 | Heroes sous-utilisés comptés | ✅ |
| T20.011 | TIME dormants affichés | ✅ |
| T20.012 | Réciprocité affichée en % | ✅ |
| T20.013 | Délai moyen de réponse affiché | ✅ |
| T20.014 | Alertes critiques comptées | ✅ |

#### Demandes bloquées (Tab 1)
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.015 | UrgentRequest sans offre >48h détectée | ✅ |
| T20.016 | UrgentRequest avec offres pending >48h détectée | ✅ |
| T20.017 | CommunityPotRequest pending >48h détectée | ✅ |
| T20.018 | Mission solidaire SELF_DECLARED >72h détectée | ✅ |
| T20.019 | Booking pending >5j détecté | ✅ |
| T20.020 | Sévérité HIGH/CRITICAL affichée | ✅ |
| T20.021 | Lien vers la demande bloquée fonctionnel | ✅ |
| T20.022 | Action recommandée affichée | ✅ |

#### Heroes sur-sollicités (Tab 2)
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.023 | Hero >=5 missions 30j détecté | ✅ |
| T20.024 | Hero >=10h données 30j détecté | ✅ |
| T20.025 | Score de sur-sollicitation affiché | ✅ |
| T20.026 | Niveau de risque (MEDIUM/HIGH) affiché | ✅ |
| T20.027 | Recommandation affichée | ✅ |

#### Heroes sous-utilisés (Tab 3)
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.028 | Profil complet + 0 mission détecté | ✅ |
| T20.029 | Compétences affichées | ✅ |
| T20.030 | Taux de complétion Passport affiché | ✅ |
| T20.031 | Recommandation affichée | ✅ |

#### TIME dormants (Tab 4)
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.032 | Balance >=10 sans dépense 30j détectée | ✅ |
| T20.033 | Balance >=20 sans dépense 60j détectée (dormant fort) | ✅ |
| T20.034 | Statut (Light/Strong/TimeRich/TimePoor) affiché | ✅ |
| T20.035 | Suggestion affichée | ✅ |

#### Alertes réseau (Tab 5)
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.036 | Bouton "Rafraîchir" disponible | ✅ |
| T20.037 | Alertes générées après rafraîchissement | ✅ |
| T20.038 | Sévérité affichée sur chaque alerte | ✅ |
| T20.039 | Statut OPEN/RESOLVED/DISMISSED affiché | ✅ |
| T20.040 | Résoudre une alerte → statut RESOLVED | ✅ |
| T20.041 | Ignorer une alerte → statut DISMISSED | ✅ |
| T20.042 | Note de résolution optionnelle | ✅ |
| T20.043 | Impossible de résoudre une alerte déjà résolue | ✅ |
| T20.044 | Rafraîchir ne duplique pas les alertes (idempotent) | ✅ |
| T20.045 | USER ne peut pas résoudre/ignorer (sécurité serveur) | ✅ |

#### Détail du score
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.046 | Sous-scores visibles (détail dépliable) | ✅ |
| T20.047 | Liquidité, Réponse, Réciprocité, Activité, Sécurité | ✅ |
| T20.048 | Poids de chaque sous-score affiché | ✅ |

#### Non-régression
| ID | Test | Résultat attendu |
|----|------|-----------------|
| T20.049 | `/facilitator/community-pot` fonctionne encore | ✅ |
| T20.050 | Don au pot commun fonctionne | ✅ |
| T20.051 | Validation demande pot fonctionne | ✅ |
| T20.052 | Missions solidaires filtrables | ✅ |
| T20.053 | Urgent Help fonctionne | ✅ |
| T20.054 | Booking escrow/release/refund OK | ✅ |
| T20.055 | Dashboard utilisateur normal OK | ✅ |
| T20.056 | Menu mobile responsive | ✅ |
| T20.057 | Build 0 erreur | ✅ |

### Responsive
| Vue | Attendu |
|-----|---------|
| Mobile 375px | KPIs en grille 2 colonnes, tabs scrollables |
| Tablette | Grille 4 colonnes, tabs utilisables |
| Desktop | Grille 4-8 colonnes, layout propre |
| États vides | Message clair si aucune donnée |
| Loading | Bouton refresh désactivé pendant chargement |

### Critères de validation
- [ ] `/facilitator/network` existe et s'affiche
- [ ] Seuls FACILITATOR et ADMIN y accèdent
- [ ] Les 8 KPIs de santé réseau sont affichés
- [ ] Les demandes bloquées sont détectées et priorisées
- [ ] Les Heroes sur-sollicités sont détectés avec score
- [ ] Les Heroes sous-utilisés sont détectés
- [ ] Les TIME dormants sont détectés avec suggestion
- [ ] Les alertes peuvent être générées, résolues et ignorées
- [ ] Les alertes ne sont pas dupliquées (idempotence)
- [ ] Le seed rend la page non vide
- [ ] Le dashboard ne révèle pas de données sensibles
- [ ] Lots 17 bis, 18, 19 continuent de fonctionner
- [ ] Build passe sans erreur
