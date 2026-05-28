#!/bin/bash
# Setup stoneage skills for OpenClaude
# Run from openclaude/ directory: ./setup-stoneage.sh
#
# Skills go to TWO places:
#   .claude/skills/   — project-local (this repo only)
#   ~/.openclaude/skills/ — global (all projects)
#
# IMPORTANT: skills must be FLAT (.claude/skills/X/SKILL.md), never nested
# inside a category folder — that creates namespace prefix that breaks /slash commands.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILLS_SRC="$SCRIPT_DIR/plugins/stoneage/skills"
SKILLS_PROJECT="$SCRIPT_DIR/.claude/skills"
SKILLS_GLOBAL="$HOME/.openclaude/skills"

if [ ! -d "$SKILLS_SRC" ]; then
  echo "Erro: $SKILLS_SRC nao existe"
  exit 1
fi

echo "=== Stoneage Skills Setup ==="
echo ""

# 1. Copy skills to project-local (.claude/skills/) — flat, no nesting
mkdir -p "$SKILLS_PROJECT"
for skill in "$SKILLS_SRC"/*/; do
  name=$(basename "$skill")
  target="$SKILLS_PROJECT/$name"
  if [ -d "$target" ]; then
    rm -rf "$target"
  fi
  cp -r "$skill" "$target"
  echo "  [project] $name"
done

# 2. Copy skills to global (~/.openclaude/skills/) — available in all projects
mkdir -p "$SKILLS_GLOBAL"
for skill in "$SKILLS_SRC"/*/; do
  name=$(basename "$skill")
  target="$SKILLS_GLOBAL/$name"
  # Skip if it's a symlink (managed externally)
  if [ -L "$target" ]; then
    echo "  [global] $name (symlink, skipped)"
    continue
  fi
  if [ -d "$target" ]; then
    rm -rf "$target"
  fi
  cp -r "$skill" "$target"
  echo "  [global] $name"
done

# 3. Remove stale nested structure if it exists
if [ -d "$SKILLS_PROJECT/stoneage" ] && [ -f "$SKILLS_PROJECT/stoneage/SKILL.md" ]; then
  # Check if it's the old nested category dir (has subdirs inside)
  has_children=$(find "$SKILLS_PROJECT/stoneage" -mindepth 1 -maxdepth 1 -type d | head -1)
  if [ -n "$has_children" ]; then
    echo ""
    echo "  AVISO: Estrutura antiga detectada em .claude/skills/stoneage/"
    echo "  Skills flat ja copiadas. Remova .claude/skills/stoneage/ manualmente se quiser."
  fi
fi

echo ""
echo "Pronto! Reinicie sessoes do OpenClaude."
echo "Skills disponiveis via /stoneage, /token-economy, /answer-first, etc."
