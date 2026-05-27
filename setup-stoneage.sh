#!/bin/bash
# Setup stoneage plugin for OpenClaude
# Run from openclaude/ directory: ./setup-stoneage.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PLUGIN_DIR="$SCRIPT_DIR/plugins/stoneage"
SKILLS_SRC="$PLUGIN_DIR/skills"
SKILLS_DST="$SCRIPT_DIR/.claude/skills/stoneage"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "Erro: $PLUGIN_DIR nao existe"
  exit 1
fi

# 1. Copy skills to .claude/skills/stoneage/ (needed because .gitignore blocks .claude/)
mkdir -p "$SKILLS_DST"
for skill in "$SKILLS_SRC"/*/; do
  name=$(basename "$skill")
  cp -r "$skill" "$SKILLS_DST/$name"
  echo "  + $name"
done

# 2. Update project settings
SETTINGS="$SCRIPT_DIR/.openclaude/settings.json"
if [ -f "$SETTINGS" ]; then
  node -e "
const fs = require('fs');
const s = JSON.parse(fs.readFileSync('$SETTINGS', 'utf8'));
if (!s.extraKnownMarketplaces) s.extraKnownMarketplaces = {};
s.extraKnownMarketplaces.stoneage = {
  source: { source: 'directory', path: '$PLUGIN_DIR' }
};
if (!s.enabledPlugins) s.enabledPlugins = {};
s.enabledPlugins['stoneage@stoneage'] = true;
fs.writeFileSync('$SETTINGS', JSON.stringify(s, null, 2) + '\n');
"
  echo "  Settings atualizado"
fi

echo ""
echo "Stoneage configurado! Reinicie as sessoes do OpenClaude."
