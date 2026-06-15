#!/usr/bin/env bash
# TimeHeroes — Backup hebdomadaire de la base SQLite
set -euo pipefail

PROJECT_DIR="/root/projects/timebank-poc"
BACKUP_DIR="$PROJECT_DIR/backups"
DB_SOURCE="$PROJECT_DIR/src/prisma/dev.db"
DATE=$(date +%F)

mkdir -p "$BACKUP_DIR"

# Copier la base
cp "$DB_SOURCE" "$BACKUP_DIR/db-$DATE.db"

# Aller dans le repo
cd "$PROJECT_DIR"

# Pull silencieux si possible
git pull --rebase origin main 2>/dev/null || true

# Ajouter le backup
git add "$BACKUP_DIR/db-$DATE.db"
git commit -m "📦 Backup base SQLite — $DATE"
git push origin main

echo "✅ Backup $DATE terminé — $(du -h $BACKUP_DIR/db-$DATE.db | cut -f1)"
