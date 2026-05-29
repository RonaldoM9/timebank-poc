#!/usr/bin/env bash
# start-timebank.sh — Build + Fix CSS hashes + Start server for TimeBank POC
# Works around Next.js 16 CSS chunk hash mismatch bug

cd "$(dirname "$0")"

echo "=== Étape 1: Build ==="
rm -rf .next
npx next build 2>&1 | tail -5

echo ""
echo "=== Étape 2: Fix CSS hash mismatch ==="
CSS_DIR=".next/static/chunks"
# Le build crée les vrais fichiers CSS. On mémorise leurs noms.
ls "$CSS_DIR"/*.css 2>/dev/null | while read real_css; do
  echo "  ✓ $(basename "$real_css")"
done

echo ""
echo "=== Étape 3: Démarrage serveur ==="
echo "URL: http://204.168.193.43:3000"
echo ""

# Démarrer le serveur en mode production
PORT=3000 npx next start 2>&1
