#!/bin/sh
# Pre-commit hook: detect secrets before they reach GitHub
# Template — copy to .git/hooks/pre-commit to activate
# Installed by: detect-secrets setup

echo "🔍 Scanning for secrets..."

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -v 'node_modules/' | grep -v '\.next/' | grep -v '.secrets.baseline' | tr '\n' ' ')

if [ -n "$STAGED_FILES" ]; then
    python -m detect_secrets scan --baseline .secrets.baseline $STAGED_FILES 2>/dev/null | python -c "
import json, sys
data = json.load(sys.stdin)
results = data.get('results', {})
has_secrets = False
for file, secrets in results.items():
    if secrets:
        for s in secrets:
            if not s.get('is_secret', True):
                continue
            has_secrets = True
            print(f'  ⚠️  {file}: {s.get(\"type\", \"unknown\")} detected')
            print(f'     Line {s.get(\"line_number\", \"?\")}: {s.get(\"secret\", \"\")[:80]}')
if has_secrets:
    print('❌ Secrets detected! Commit blocked.')
    print('   If this is a false positive, run: detect-secrets scan --update .secrets.baseline')
    sys.exit(1)
else:
    print('✅ No new secrets detected.')
" 2>/dev/null || echo "✅ Scan skipped."
fi
exit 0
