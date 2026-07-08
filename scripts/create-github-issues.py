#!/usr/bin/env python3
import json, os, subprocess

TOKEN = open(os.path.expanduser("~/.git-credentials")).read()
for line in TOKEN.split("\n"):
    if "github.com" in line:
        TOKEN = line.split(":")[2].split("@")[0]
        break

REPO = "https://api.github.com/repos/RonaldoM9/timebank-poc"
HEADERS = ["Authorization: token " + TOKEN, "Content-Type: application/json"]

def gh_post(endpoint, data):
    cmd = ["curl", "-s", "-X", "POST"] + [f"-H{h}" for h in HEADERS] + [endpoint, "-d", json.dumps(data)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(r.stdout)

issues = [
    {
        "title": "🎨 Hero : montage photo + carousel de héros",
        "body": "## Description\nRemplacer le placeholder vidéo du hero par un montage de photos authentiques de héros avec carousel automatique.\n\n## Proposition\n- 3-4 photos de vrais héros (permis, pas IA) avec overlay gradient teal → transparent\n- Carousel automatique qui défile toutes les 5-6 secondes\n- Chaque slide = un héros différent avec son histoire courte\n\n## Où\n- `src/app/page.tsx` — Landing page hero section\n\n## Priorité\n🔴 Urgent pour les démos prospects d'août",
        "labels": ["design", "phase-1"]
    },
    {
        "title": "🎨 Images/catégories sur les cards missions",
        "body": "## Description\nLes cards missions sont actuellement 100% textuelles. Ajouter une illustration ou photo d'ambiance par catégorie.\n\n## Catégories à couvrir\n- **Tech 📱** → écran smartphone\n- **Solidaire 🤝** → personnes qui marchent ensemble\n- **Communauté ☕** → café partagé\n- **Bricolage 🔧** → atelier / outils\n- **Senior 👴** → accompagnement personne âgée\n- **Urgent ⚡** → icône différenciante\n\n## Où\n- Landing page : cards \"Missions solidaires près de chez toi\"\n- Marketplace : `src/app/services/ServicesClient.tsx`\n\n## Priorité\n🔴 Urgent pour les démos",
        "labels": ["design", "phase-1"]
    },
    {
        "title": "🎨 Section témoignages avec photos de vrais héros",
        "body": "## Description\nCréer une section \"Ils donnent de leur temps\" sur la landing page avec photos + prénom + citation courte.\n\n## Personnages existants (comptes démo)\n- **Sarah Martin** — \"Je donne 2h de soutien scolaire par semaine\"\n- **Karim Benali** — \"J'ai monté des étagères à l'école du quartier\"\n- **Inès Laurent** — \"J'aide les seniors avec leurs démarches\"\n\n## Format\n- Photo ronde + nom + rôle + citation courte\n- Disposition en grille 3 colonnes\n- Sur mobile : carousel swipe\n\n## Priorité\n🟡 Important",
        "labels": ["design", "phase-1"]
    },
    {
        "title": "🎨 Avatars automatiques (DiceBear / initiales)",
        "body": "## Description\nLes profils utilisateurs n'ont pas d'avatar (juste initiales). Ajouter un système d'avatar automatique.\n\n## Options\n1. **Initiales avec dégradé** — Couleur dérivée du user ID, lettre blanche sur fond dégradé\n2. **DiceBear Avataaars** — API gratuite, avatars uniques générés à partir du user ID\n3. **Mélange** — DiceBear par défaut, fallback initiales\n\n## Où\n- Header utilisateur connecté\n- Profil public `/profile/[id]`\n- Cards missions (avatar du provider)\n- Commentaires / discussions\n\n## Priorité\n🟡 Important pour l'identité visuelle",
        "labels": ["design", "phase-1"]
    },
    {
        "title": "🎨 États vides illustrés",
        "body": "## Description\nPartout où une liste est vide (pas de services, pas de bookings, pas de résultats de recherche), remplacer le texte fade par une illustration personnalisée.\n\n## Exemples\n- \"Aucun service trouvé\" → illustration d'un héros qui cherche\n- \"Aucune réservation\" → illustration calendrier vide\n- \"Aucun message\" → illustration boîte aux lettres\n- \"Aucun résultat\" → illustration loupe\n\n## Format\n- SVG inline ou composant React\n- Animé (fadeInUp) comme le reste du site\n- Message encourageant + CTA vers l'action\n\n## Priorité\n🟢 Nice to have",
        "labels": ["design", "phase-1"]
    },
    {
        "title": "🎨 Infographies impact (SVG) au lieu de chiffres nus",
        "body": "## Description\nLa section impact sur la landing page affiche juste \"30h · 29 missions · 16 héros\". Remplacer par des mini-graphiques SVG.\n\n## Idées\n- Jauge de TIME échangés avec dégradé teal\n- Barres de progression par catégorie de mission\n- Badges animés style \"power meter\" (déjà existant dans rewards)\n- Nuage montrant qui aide qui\n\n## Où\n- Landing page section \"L'impact TimeHeroes en chiffres\"\n- Dashboard (widget stats)\n- Rapport d'impact\n\n## Priorité\n🟢 Nice to have",
        "labels": ["design", "phase-1"]
    },
    {
        "title": "📱 PWA — Service Worker + Manifest (installable, offline)",
        "body": "## Description\nConfigurer le site en Progressive Web App pour qu'il soit installable sur mobile et utilisable hors-ligne.\n\n## À faire\n1. Installer `@serwist/next` (successeur de next-pwa)\n2. Générer icônes PWA (192x192, 512x512)\n3. Configurer le manifest.json (nom, short_name, theme_color, background_color)\n4. Service worker : cache des pages statiques + stratégie réseau pour les pages dynamiques\n5. Tester le score Lighthouse\n\n## Bénéfices\n- \"Ajouter à l'écran d'accueil\" sur mobile\n- Fonctionnement offline partiel\n- Score SEO/performance amélioré\n- Pas de réécriture — le site actuel devient une app\n\n## Ressources\n- `@serwist/next` : https://serwist.pages.dev/\n- Couleurs : theme=#00A889, background=#F8F5F0\n\n## Priorité\n🔴 Avant septembre",
        "labels": ["pwa", "phase-2"]
    },
    {
        "title": "📱 Notifications push pour bookings et urgences",
        "body": "## Description\nAjouter des notifications push pour alerter les utilisateurs en temps réel.\n\n## Cas d'usage\n- **Nouveau booking** : \"Quelqu'un a réservé votre service\"\n- **Mission terminée** : \"Votre mission a été validée\"\n- **Urgent Help** : \"Quelqu'un a besoin d'aide près de chez vous\"\n- **Rappel** : \"Votre mission commence dans 2h\"\n- **Pot commun** : \"Le pot commun a financé une mission\"\n\n## Stack\n- Web Push API (via service worker PWA)\n- Backend : Next.js API route + web-push lib\n- Stockage des subscriptions en base\n\n## Priorité\n🟡 Important — valeur ajoutée forte pour l'engagement",
        "labels": ["pwa", "phase-2"]
    }
]

for issue in issues:
    r = gh_post(REPO + "/issues", issue)
    if "number" in r:
        print(f"✅ #{r['number']}  {r['title']}")
    else:
        print(f"❌  {r.get('message', str(r))}")
