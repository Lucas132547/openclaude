---
name: memory-prune
description: >
  Mantém MEMORY.md limpo e eficiente. Remove entradas stale, consolida duplicatas,
  mantém índice enxuto. Ative com: "limpa memory", "prune memory", "memory cleanup".
  Executa automaticamente quando MEMORY.md > 20 entradas.
user-invocable: true
---

MEMORY.md carregado em toda sessão. Entradas stale = tokens desperdiçados.

## Regras

**Varredura automática quando MEMORY.md > 20 entradas:**

- Ler cada arquivo referenciado no índice
- Marcar para remoção se:
  - Tarefa concluída (PR merged, feature shipped, bug fixed)
  - Pessoa saiu do projeto
  - Informação derivável do código/git (não precisa persistir)
  - Duplicata de outra entrada
- Consolidar entradas relacionadas em uma só
- Manter: preferências do user, convenções do projeto, decisões de arquitetura

**O que NÃO remover:**

- Preferências do user (communication, workflow)
- Decisões de design que afetam código futuro
- Referências externas (Linear, Slack, URLs)
- Regras de teste/deploy

**Formato de limpeza:**

1. Listar entradas candidatas a remoção
2. Pedir confirmação antes de deletar
3. Atualizar MEMORY.md e deletar arquivos .md referenciados
4. Registrar ação em nova entrada "memory-prune" se limpar > 5 entradas

## Exemplo de stale entry

```
- [Buddy v0.15.0 Roadmap](buddy_v015_roadmap.md) — 14 commits, PR #6
```

Se PR #6 já foi merged e v0.15.0 released → remover. Info está no git log.

## Exemplo de consolidação

```
- [Buddy Sprite Fix](buddy_sprite_fix.md) — 24x10 layout fix
- [Buddy Compact Toggle](buddy_compact_toggle.md) — face-only mode
```

Ambos sobre display do buddy → consolidar em "Buddy Display Improvements".

## Controle

- Individual: "memory prune on/off"
- Mestre: "token economy on/off" (controla todas as skills)
