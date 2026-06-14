# Lot 14 — Discussion sécurisée par booking

## Objectif

Ajouter une **zone de discussion liée à chaque réservation** pour permettre au demandeur et au Hero de se coordonner directement dans TimeHeroes.

Le but est double :

1. faciliter l'organisation de la mission ;
2. éviter que les utilisateurs sortent trop vite vers WhatsApp, SMS ou téléphone, ce qui crée des risques de harcèlement, stalking, divulgation de données personnelles ou litiges impossibles à suivre.

Le format recommandé est **commentaires type Jira**, pas un chat temps réel complexe.

---

# 1. Vision produit

Quand une réservation est créée, une discussion s'ouvre automatiquement sur la page du booking.

Exemple :

```txt
Booking : Aider à configurer WhatsApp
Créneau : samedi 10h-11h

Discussion :
- Système : Réservation créée pour samedi 10h.
- Demandeur : Bonjour, c'est pour aider mon père à envoyer des photos.
- Hero : Pas de souci. Il utilise Android ou iPhone ?
- Demandeur : Android.
```

L'utilisateur reste dans TimeHeroes pour coordonner la mission.

---

# 2. Périmètre du lot

## Fonctionnalités à livrer

| ID         | Fonctionnalité                     | Description                                              | Priorité |
| ---------- | ---------------------------------- | -------------------------------------------------------- | -------- |
| **F14.1**  | Discussion par booking             | Chaque booking possède son thread                        |          |
| **F14.2**  | Commentaires chronologiques        | Messages simples triés par date                          |          |
| **F14.3**  | Accès limité                       | Seuls demandeur, Hero et admin voient la discussion      |          |
| **F14.4**  | Champ d'envoi                      | Ajouter un message dans le booking                       |          |
| **F14.5**  | Messages système                   | Événements automatiques : créé, accepté, annulé, terminé |          |
| **F14.6**  | Compteur messages non lus          | Indicateur simple dans liste bookings                    |          |
| **F14.7**  | Détection coordonnées personnelles | Téléphone, email, lien WhatsApp                          |          |
| **F14.8**  | Warning sécurité                   | Alerte si coordonnées détectées                          |          |
| **F14.9**  | Signalement message                | Bouton "Signaler" sur chaque message utilisateur         |          |
| **F14.10** | Règles de conversation             | Bloc de prévention dans l'UI                             |          |
| **F14.11** | Responsive mobile                  | Discussion utilisable sur téléphone                      |          |

---

# 3. Ce qu'on ne fait pas encore

Pour rester simple, ne pas faire maintenant :

| Hors scope                          | Pourquoi                       |
| ----------------------------------- | ------------------------------ |
| Chat temps réel WebSocket           | Trop lourd pour le POC         |
| Pièces jointes                      | Risques sécurité + complexité  |
| Messages vocaux                     | Pas prioritaire                |
| Appels audio/vidéo                  | Hors scope                     |
| Chiffrement bout-en-bout            | Trop lourd maintenant          |
| Modération IA avancée               | Plus tard                      |
| Suppression définitive des messages | On garde une trace pour litige |
| Partage de localisation précise     | Risqué, à cadrer plus tard     |

Le POC doit livrer une messagerie **simple, sécurisée, traçable**.

---

# 4. Modèle de données

## 4.1 Créer `BookingMessage`

```prisma
model BookingMessage {
  id        String   @id @default(cuid())

  bookingId String
  authorId  String?

  content   String
  type      String   @default("USER") // USER, SYSTEM

  isFlagged Boolean  @default(false)
  isHidden  Boolean  @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([bookingId])
  @@index([authorId])
  @@index([createdAt])
}
```

### Notes

* `authorId` peut être nullable pour les messages système.
* `type = SYSTEM` pour les événements automatiques.
* `isFlagged` sert à marquer un message suspect.
* `isHidden` peut servir plus tard pour masquer un message modéré.

---

## 4.2 Créer `MessageReport`

```prisma
model MessageReport {
  id         String   @id @default(cuid())

  messageId  String
  reporterId String

  reason     String
  comment    String?
  status     String   @default("OPEN") // OPEN, REVIEWED, DISMISSED

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([messageId])
  @@index([reporterId])
  @@index([status])
}
```

---

## 4.3 Option utile : lecture des messages

Pour le compteur de messages non lus, deux options.

### Option P0 simple

Ajouter dans `Booking` :

```prisma
lastMessageAt DateTime?
```

Et côté affichage, montrer simplement le nombre total de messages.

### Option P1 meilleure

Créer :

```prisma
model BookingMessageRead {
  id        String   @id @default(cuid())
  bookingId String
  userId    String
  lastReadAt DateTime @default(now())

  @@unique([bookingId, userId])
}
```

Pour le POC, tu peux faire P0 si Nandi veut aller vite.

---

# 5. Permissions

## Règle principale

Seuls les utilisateurs liés au booking peuvent lire et écrire dans la discussion :

* demandeur ;
* Hero / provider ;
* admin/modérateur.

## Interdictions

Un utilisateur ne doit pas pouvoir :

* lire les messages d'un booking où il n'est pas participant ;
* écrire dans un booking qui ne le concerne pas ;
* signaler son propre message si inutile ;
* modifier le contenu d'un message après coup, sauf si cette règle est explicitement prévue.

## Message système

Les messages système sont créés par le serveur uniquement.

---

# 6. Pages concernées

## 6.1 Page booking détail

Sur :

```txt
/bookings/[id]
```

Ajouter une section :

```txt
Discussion de mission
```

Cette section contient :

* bloc de règles de sécurité ;
* liste des messages ;
* messages système distincts visuellement ;
* champ de commentaire ;
* bouton envoyer ;
* bouton signaler sur les messages utilisateur ;
* warning si coordonnées personnelles détectées.

---

## 6.2 Liste des bookings

Sur :

```txt
/bookings
```

Ajouter un indicateur :

```txt
3 messages
Nouveau message
Dernier message il y a 2h
```

En P0, afficher simplement :

```txt
Dernier message : il y a 2h
```

---

# 7. Messages système à créer

Créer automatiquement des messages système lors des événements clés.

| Événement       | Message système                                                    |
| --------------- | ------------------------------------------------------------------ |
| Booking créé    | `Réservation créée.`                                               |
| Créneau choisi  | `Créneau confirmé : samedi 10h-11h.`                               |
| Booking accepté | `Mission acceptée par le Hero.`                                    |
| Booking annulé  | `Mission annulée.`                                                 |
| Booking terminé | `Mission terminée. En attente de validation finale si nécessaire.` |
| QR/NFC validé   | `Mission validée par preuve QR/NFC.`                               |
| TIME libéré     | `TIME libéré au Hero.`                                             |
| Refund          | `TIME remboursé au demandeur.`                                     |

Ne pas en faire trop au début. Les messages système doivent clarifier, pas polluer.

---

# 8. Détection des coordonnées personnelles

## Objectif

Éviter que les utilisateurs partagent trop vite :

* numéro de téléphone ;
* email personnel ;
* lien WhatsApp ;
* adresse complète.

## Détection P0

Détecter au minimum :

### Téléphone français

Exemples :

```txt
06 12 34 56 78
+33 6 12 34 56 78
0612345678
07.12.34.56.78
```

### Email

Exemple :

```txt
prenom.nom@gmail.com
```

### WhatsApp

Exemples :

```txt
wa.me/
whatsapp.com
WhatsApp
```

## Comportement recommandé P0

Ne pas forcément bloquer le message. Afficher un warning avant ou après l'envoi.

### Option douce recommandée

Si coordonnées détectées :

* le message peut être envoyé ;
* `isFlagged = true` ;
* afficher un warning :

```txt
Coordonnées personnelles détectées. Pour votre sécurité, gardez les échanges dans TimeHeroes.
```

### Option stricte P1

Bloquer le message tant que l'utilisateur n'a pas retiré les coordonnées.

Pour le POC, je recommande **warning + flag**, pas blocage dur.

---

# 9. Message de sécurité dans l'UI

Afficher au-dessus de la discussion :

```txt
Pour votre sécurité, gardez les échanges dans TimeHeroes.
Ne partagez pas votre numéro de téléphone, email personnel ou adresse complète.
En cas de comportement inapproprié, vous pouvez signaler un message.
```

Ce message doit être visible mais pas trop intrusif.

---

# 10. Prompts de discussion utiles

Pour encourager une bonne discussion sans échange de numéro, ajouter des suggestions de messages.

## Exemples de boutons rapides

```txt
Confirmer le besoin
Demander plus de détails
Confirmer l'horaire
Préciser le matériel nécessaire
Dire que je suis en route
Confirmer que la mission est terminée
```

## Exemple de microcopy

```txt
Questions utiles avant la mission :
- Quel est le besoin exact ?
- Faut-il prévoir du matériel ?
- Le créneau est-il toujours bon ?
- Y a-t-il une contrainte particulière ?
```

C'est très important : on ne veut pas seulement empêcher le partage de numéros, on veut rendre la discussion interne suffisamment utile pour que les gens restent dedans.

---

# 11. Actions serveur attendues

Créer ou adapter des actions :

```ts
createBookingMessage(bookingId: string, content: string)
getBookingMessages(bookingId: string)
createSystemBookingMessage(bookingId: string, content: string)
reportBookingMessage(messageId: string, reason: string, comment?: string)
markBookingMessagesAsRead(bookingId: string)
```

Chaque action doit vérifier les permissions côté serveur.

---

# 12. Validation Zod

## Création message

```ts
const createBookingMessageSchema = z.object({
  bookingId: z.string().min(1),
  content: z.string().min(1).max(1000),
})
```

## Signalement

```ts
const reportMessageSchema = z.object({
  messageId: z.string().min(1),
  reason: z.enum([
    "HARASSMENT",
    "PERSONAL_CONTACT",
    "SPAM",
    "INAPPROPRIATE",
    "OTHER"
  ]),
  comment: z.string().max(500).optional(),
})
```

---

# 13. Limites et protections

## Longueur message

Limiter à :

```txt
1000 caractères
```

## Anti-spam simple

En P0 :

* empêcher message vide ;
* empêcher 10 messages identiques d'affilée si facile ;
* désactiver bouton pendant l'envoi.

## XSS

Très important :

* ne jamais rendre le contenu HTML brut ;
* afficher le texte échappé ;
* pas de `dangerouslySetInnerHTML`.

## Historique

Ne pas supprimer définitivement les messages utilisateur pour l'instant.
Si modération, utiliser `isHidden`.

---

# 14. UI attendue

## Structure de la discussion

```txt
Discussion de mission

[Bloc sécurité]

Système — Réservation créée pour samedi 10h-11h.

Alex Demo
Bonjour, c'est pour aider mon père à configurer WhatsApp.

Sarah
Pas de souci. Il utilise Android ou iPhone ?

[Champ écrire un message]
[Envoyer]
```

## Messages système

Visuellement différents :

* plus petits ;
* fond discret ;
* icône info ;
* pas de bouton signaler.

## Messages utilisateur

Afficher :

* nom public ;
* date/heure ;
* contenu ;
* badge "coordonnées détectées" si flaggé ;
* bouton signaler.

---

# 15. Mobile

La discussion doit être utilisable sur smartphone :

* champ message visible ;
* bouton envoyer accessible ;
* messages lisibles ;
* pas d'overflow horizontal ;
* boutons signaler pas trop gros ;
* hauteur confortable.

---

# 16. Critères d'acceptation

Le Lot 14 est validé si :

| ID      | Critère                                                  |
| ------- | -------------------------------------------------------- |
| CA14.1  | Chaque booking possède une discussion                    |
| CA14.2  | Les participants peuvent lire les messages               |
| CA14.3  | Les non-participants ne peuvent pas lire les messages    |
| CA14.4  | Les participants peuvent envoyer un message              |
| CA14.5  | Les messages sont triés chronologiquement                |
| CA14.6  | Des messages système sont créés pour les événements clés |
| CA14.7  | Les téléphones/emails/liens WhatsApp sont détectés       |
| CA14.8  | Un warning sécurité est affiché                          |
| CA14.9  | Un message suspect est marqué `isFlagged`                |
| CA14.10 | Un message peut être signalé                             |
| CA14.11 | La liste des bookings indique l'activité de discussion   |
| CA14.12 | La discussion fonctionne sur mobile                      |
| CA14.13 | Aucun contenu HTML dangereux n'est rendu                 |
| CA14.14 | Les permissions sont vérifiées côté serveur              |

---

# 17. Tests rapides à faire

Nandi devra tester au minimum :

```txt
1. Créer un booking entre Hero A et Hero B
2. Vérifier qu'une discussion apparaît dans /bookings/[id]
3. Hero A envoie un message
4. Hero B voit le message
5. Hero C, non participant, ne peut pas lire la discussion
6. Hero B répond
7. Les messages sont dans le bon ordre
8. Créer un message avec un téléphone : 06 12 34 56 78
9. Vérifier warning + isFlagged
10. Créer un message avec email : test@gmail.com
11. Vérifier warning + isFlagged
12. Signaler un message
13. Vérifier MessageReport créé
14. Changer le statut du booking : accepté / terminé
15. Vérifier messages système
16. Tester sur mobile
```

---

# 18. Bugs bloquants

Le lot ne doit pas être validé si :

* un utilisateur non participant peut lire une discussion ;
* un utilisateur non participant peut écrire dans une discussion ;
* les messages ne sont pas persistés ;
* un message HTML peut injecter du code ;
* la détection de téléphone/email ne fonctionne pas du tout ;
* aucun warning sécurité n'est affiché ;
* les messages système ne sont jamais créés ;
* les messages apparaissent dans le mauvais ordre ;
* le bouton signaler ne crée rien ;
* la discussion est inutilisable sur mobile.
