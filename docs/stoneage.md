# Stoneage — Modo de Compressao de Tokens

## Visao Geral

O **Stoneage** e uma skill nativa do OpenClaw que reduz ~75% dos tokens de saida mantendo precisao tecnica total. Inspirado na sabedoria primitiva: poucas palavras, significado total. Como pinturas rupestres que contam historias com poucos tracos.

Diferente de solucoes externas, o Stoneage e integrado diretamente no projeto e conectado ao sistema Buddy, permitindo que seu companion reage quando voce economiza tokens e ganhe XP por isso.

---

## Instalacao

O Stoneage ja vem incluido como skill nativa do OpenClaw. As skills ficam em:

```
.claude/skills/
├── stoneage/SKILL.md           ← Skill principal (/stoneage)
├── stoneage-commit/SKILL.md    ← /stoneage-commit
├── stoneage-review/SKILL.md    ← /stoneage-review
├── stoneage-compress/SKILL.md  ← /stoneage-compress
├── stoneage-stats/SKILL.md     ← /stoneage-stats
├── stoneage-help/SKILL.md      ← /stoneage-help
├── answer-first/SKILL.md       ← /answer-first
├── code-only/SKILL.md          ← /code-only
├── context-trim/SKILL.md       ← /context-trim
├── memory-prune/SKILL.md       ← /memory-prune
├── session-budget/SKILL.md     ← /session-budget
├── silent-tools/SKILL.md       ← /silent-tools
├── task-batch/SKILL.md         ← /task-batch
└── token-economy/SKILL.md      ← /token-economy
```

Nenhuma instalacao adicional e necessaria. O OpenClaw carrega automaticamente.

> **Importante:** Skills devem ficar em `.claude/skills/<nome>/SKILL.md` (flat).
> Nunca aninhar em subpastas como `.claude/skills/stoneage/<nome>/` — isso gera
> prefixo de namespace (`stoneage:<nome>`) que quebra o slash command.

---

## Comandos

### `/stoneage [lite|full|ultra]`

Ativa o modo de comunicacao compacto.

| Argumento | Comportamento              |
| --------- | -------------------------- |
| (nenhum)  | Ativa modo `full` (padrao) |
| `lite`    | Ativa modo lite            |
| `full`    | Ativa modo full            |
| `ultra`   | Ativa modo ultra           |

**Desativar:** Digite `stop stoneage`, `modo normal`, ou `normal mode`.

### `/stoneage-commit`

Gera mensagens de commit ultra-compactas no formato Conventional Commits.

- Assunto ≤50 chars (teto 72)
- Corpo apenas quando "por que" nao e obvio
- Modo imperativo: "add", "fix", "remove"
- Sem repetir o que o diff ja diz

**Exemplo:**

```
feat(api): add GET /users/:id/profile

Cliente mobile precisa de dados de perfil sem o payload completo
do usuario para reduzir bandwidth LTE em telas de cold-launch.

Closes #128
```

### `/stoneage-review`

Gera comentarios de code review em uma linha por achado.

**Formato:** `L<linha>: <problema>. <solucao>.`

**Severidade:**

- `🔴 bug:` — comportamento quebrado, vai causar incidente
- `🟡 risk:` — funciona mas e fragil
- `🔵 nit:` — estilo, naming, micro-optim
- `❓ q:` — pergunta genuina

**Exemplo:**

```
L42: 🔴 bug: user pode ser null apos .find(). Adicionar guard antes de .email.
L88-140: 🔵 nit: fn de 50 linhas faz 4 coisas. Extrair validate/normalize/persist.
```

### `/stoneage-compress <caminho>`

Comprime arquivos de memoria (.md, .txt) em formato stoneage.

- Preserva: termos tecnicos, blocos de codigo, URLs, caminhos, comandos
- Remove: artigos, preenchimento, cortesias, hedging
- Backup automatico: `arquivo.original.md`
- Economia media: ~46% dos tokens de input

**Exemplo:**

```
/stoneage-compress CLAUDE.md
```

### `/stoneage-stats`

Exibe estatisticas de economia da sessao.

```
🪨 Stoneage Stats
──────────────────────
Turnos:           X
Output tokens:    X
Economia est.:    X (~65%)
USD economizado:  ~$X.XX
──────────────────────
```

### `/stoneage-help`

Exibe o cartao de referencia rapida com todos os comandos.

---

## Niveis de Intensidade

### lite

Remove preenchimento e hedging. Mantem artigos e frases completas. Profissional mas direto.

**Exemplo — "Por que componente React re-renderiza?"**

> "O componente re-renderiza porque cria nova referencia de objeto a cada render. Use `useMemo`."

### full (padrao)

Dropa artigos, aceita fragmentos, sinonimos curtos. Stoneage classico.

**Exemplo — mesmo assunto:**

> "Nova ref cada render. Prop inline = nova ref = re-render. `useMemo`."

### ultra

Abrevia termos tecnicos (DB/auth/config/req/res/fn/impl), remove conjuncoes, usa setas (→) para causalidade, uma palavra quando uma basta.

**Exemplo — mesmo assunto:**

> "obj prop → new ref → re-render. `useMemo`."

**Regras do ultra:**

- Abreviacoes permitidas: DB, auth, config, req, res, fn, impl, env, infra, perf, ops, CI, CD, API, SDK, CLI, UI, UX
- Seta `→` para causalidade: `erro de autenticacao → token expirado → fix: renovar`
- Simbolos de codigo, nomes de funcoes, APIs, strings de erro: **nunca abreviar**

---

## Regras de Compressao

### O que dropar

| Categoria         | Exemplos                                           |
| ----------------- | -------------------------------------------------- |
| Artigos           | um, uma, o, a, os, as                              |
| Preenchimento     | apenas, simplesmente, basicamente, na verdade      |
| Cortesias         | claro, com certeza, com prazer, feliz em ajudar    |
| Hedging           | talvez, poderia, seria bom, vale a pena considerar |
| Conectivos vazios | no entanto, alem disso, adicionalmente             |

### O que manter

| Categoria             | Regra                                        |
| --------------------- | -------------------------------------------- |
| Termos tecnicos       | Sempre exatos, nunca abreviar (exceto ultra) |
| Blocos de codigo      | Intocados                                    |
| Nomes de funcoes/APIs | Exatos                                       |
| Erros                 | Citados exatamente                           |
| URLs/caminhos         | Completos                                    |

### Padrao de escrita

```
[coisa] [acao] [razao]. [proximo passo].
```

**Antes:** "Claro! Eu ficaria feliz em te ajudar com isso. O problema que voce esta experimentando e provavelmente causado pelo seu middleware de autenticacao nao validando corretamente a expiracao do token."

**Depois:** "Bug no auth middleware. Token expiry check usa `<` nao `<=`. Fix:"

---

## Auto-Clarity

O Stoneage e desativado automaticamente quando:

- **Avisos de seguranca** — riscos de exploits, tokens expostos, permissoes abertas
- **Acoes irreversiveis** — `DROP TABLE`, `rm -rf`, `git reset --hard`
- **Confirmacoes** — antes de destruir dados, fazer deploy, pagar
- **Ambiguidade tecnica** — quando fragmentos omitidos criam confusao (ex: "migrar tabela dropar coluna backup primeiro")
- **Sequencias multi-passo** — onde a ordem importa e omitir conjuncoes perde clareza
- **Usuario repete a pergunta** — sinal de que a compressao causou confusao

Apos a parte clara, o Stoneage retoma automaticamente.

**Exemplo — operacao destrutiva:**

> **Aviso:** Isso vai deletar permanentemente todas as linhas da tabela `users` e nao pode ser desfeito.
>
> ```sql
> DROP TABLE users;
> ```
>
> Stoneage retoma. Verifique backup existente primeiro.

---

## Limites

| Contexto     | Comportamento                          |
| ------------ | -------------------------------------- |
| Codigo fonte | Escrever normal (nao comprimir)        |
| Commits      | Escrever normal (usar stoneage-commit) |
| PRs          | Escrever normal                        |
| Desativar    | "stop stoneage" ou "modo normal"       |
| Persistencia | Ativo ate desativar ou fim da sessao   |

---

## Integracao com Buddy

O Stoneage e integrado ao sistema Buddy do OpenClaw. Quando voce ativa o stoneage:

### Reacoes do Companion

Seu buddy reage com frases tematicas pre-historicas:

- "Pedra afiada. Resposta menor."
- "Gravuras na caverna. Codigo compacto."
- "Fogo bom. Menos palavras, mais acao."
- "Mamute satisfeito com a economia."
- "Rodinha redonda. Tokens economizados."
- "Lascagem perfeita. Sobra so o essencial."
- "Pintura rupestre: poucos tracos, historia completa."

### XP

Cada ativacao do stoneage concede **+0.5 XP** ao companion.

### Estatisticas

O companion rastreia tokens economizados em `/buddy stats`:

```
Tokens economizados (stoneage): X
```

### Conquistas

| Emoji | Conquista         | Descricao                         | Condicao     |
| ----- | ----------------- | --------------------------------- | ------------ |
| 🪨    | Primeiro Contato  | Ativar stoneage pela primeira vez | 1 ativacao   |
| 🔥    | Economia de Fogo  | Economizar 1000 tokens estimados  | 1000 tokens  |
| 🦣    | Mamute de Ouro    | Economizar 10000 tokens estimados | 10000 tokens |
| ⛏️    | Mestre das Pedras | Ativar stoneage 50 vezes          | 25000 tokens |

---

## Arquitetura

### Arquivos de Skill

```
.claude/skills/
├── stoneage/SKILL.md           ← Regras de compressao (3 niveis, auto-clarity)
├── stoneage-commit/SKILL.md    ← Conventional Commits ≤50 chars
├── stoneage-review/SKILL.md    ← Review em 1 linha com severidade
├── stoneage-compress/SKILL.md  ← Compressao de arquivos .md
├── stoneage-stats/SKILL.md     ← Estatisticas de economia
├── stoneage-help/SKILL.md      ← Cartao de referencia
├── answer-first/SKILL.md       ← Respostas diretas
├── code-only/SKILL.md          ← Codigo puro
├── context-trim/SKILL.md       ← Comprimir tool results
├── memory-prune/SKILL.md       ← Limpar MEMORY.md
├── session-budget/SKILL.md     ← Controle de budget por sessao
├── silent-tools/SKILL.md       ← Resumir output de ferramentas
├── task-batch/SKILL.md         ← Agrupar tool calls de tasks
└── token-economy/SKILL.md      ← Skill mestra (liga/desliga todas)
```

> **Regra:** Skills devem ser flat em `.claude/skills/`. Nunca aninhar dentro de categorias.

### Plugin (Hooks + Statusline)

```
.claude/plugins/stoneage/
├── .claude-plugin/
│   └── plugin.json             ← Manifest com hooks
├── src/hooks/
│   ├── stoneage-config.js      ← Config compartilhada (flag file, modes)
│   ├── stoneage-activate.js    ← SessionStart: auto-ativar + emitir regras
│   ├── stoneage-mode-tracker.js ← UserPromptSubmit: detectar /stoneage
│   └── stoneage-statusline.sh  ← Badge [STONEAGE] na statusline
└── skills/stoneage/            ← Skills (copiadas de .claude/skills/)
```

### Arquivos TypeScript (Buddy Integration)

| Arquivo                        | Mudanca                               |
| ------------------------------ | ------------------------------------- |
| `src/utils/config.ts`          | +`totalTokensSaved` no companionStats |
| `src/buddy/observer.ts`        | +STONEAGE_REPLIES, detecção, XP grant |
| `src/buddy/memory.ts`          | +trigger `stoneageFirst`              |
| `src/buddy/achievements.ts`    | +4 conquistas                         |
| `src/commands/buddy/buddy.tsx` | +exibir tokens salvos                 |

### Fluxo de Ativacao

```
1. Usuario digita "/stoneage" ou "modo pedra"
2. Skill SKILL.md e injetada como contexto do sistema
3. Observer detecta "stoneage" no prompt
4. CompanionStats.totalTokensSaved += 500 (estimativa)
5. grantXp(companion, 0.5)
6. Buddy reage com frase tematica
7. Se primeira ativacao: addMemory('stoneageFirst')
8. Proximas respostas seguem as regras de compressao
```

---

## Auto-Ativacao via Hooks

O stoneage pode ser auto-ativado no inicio de cada sessao, sem precisar digitar `/stoneage`.

### Configuracao

O padrao de ativacao e controlado por (em ordem de prioridade):

1. **Variavel de ambiente:** `STONEAGE_DEFAULT_MODE=lite|full|ultra|off`
2. **Arquivo de config:** `~/.config/stoneage/config.json` com campo `defaultMode`
3. **Padrao:** `full` (ativo automaticamente)

Para desativar a auto-ativacao:

```bash
export STONEAGE_DEFAULT_MODE=off
```

Ou crie `~/.config/stoneage/config.json`:

```json
{ "defaultMode": "off" }
```

### Hook SessionStart

Roda uma vez por sessao. Se `defaultMode` nao for `off`:

1. Escreve flag file `~/.claude/.stoneage-active` com o modo ativo
2. Le o SKILL.md e emite as regras como contexto oculto do sistema
3. Filtra a tabela de intensidade para mostrar apenas o nivel ativo

### Hook UserPromptSubmit

Roda a cada mensagem do usuario. Faz 3 coisas:

1. **Detecta comandos:** `/stoneage`, `/stoneage lite|full|ultra`, "stop stoneage"
2. **Atualiza flag file:** escreve ou limpa `~/.claude/.stoneage-active`
3. **Reforco por turno:** emite `hookSpecificOutput` com resumo das regras para manter o modelo no estilo

### Flag File

Comunicacao entre hooks via `~/.claude/.stoneage-active`:

- **Escrita segura:** atomic temp+rename, recusa symlinks, 0600 permissions
- **Leitura segura:** recusa symlinks, cap de 64 bytes, whitelist de modos validos
- **Modos validos:** `off`, `lite`, `full`, `ultra`

---

## Statusline Badge

Quando stoneage esta ativo, um badge aparece na statusline do terminal:

```
[STONEAGE:full]
```

O badge usa cores ANSI:

- Fundo verde (#4CAF50)
- Texto escuro
- Inclui emoji de pedra

### Configuracao

O badge e configurado automaticamente via `settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "bash \"/path/to/stoneage-statusline.sh\""
  }
}
```

O script le o flag file e emite o badge apenas quando stoneage esta ativo.

---

---

## Exemplos de Uso

### Conversa normal vs Stoneage

**Pergunta:** "Como faco para otimizar uma query SQL que esta lenta?"

**Normal (sem stoneage):**

> "Claro! Para otimizar uma query SQL que esta lenta, existem varias abordagens que voce pode tentar. Primeiro, voce deveria analisar o plano de execucao da query usando EXPLAIN para entender como o banco de dados esta processando a consulta. Depois, considere adicionar indices apropriados nas colunas usadas nas clausulas WHERE, JOIN e ORDER BY. Tambem e importante verificar se ha subqueries que podem ser reescritas como JOINs."

**Stoneage full:**

> "Usar EXPLAIN pra ver plano de execucao. Adicionar indices em WHERE/JOIN/ORDER BY. Subqueries → JOINs quando possivel."

**Stoneage ultra:**

> "EXPLAIN → ver plano. +indices em WHERE/JOIN/ORDER. sub→JOIN quando possivel."

### Code Review

**Normal:**

> "Eu notei que na linha 42 voce nao esta verificando se o objeto user e nulo antes de acessar a propriedade email. Isso poderia causar um crash se o usuario nao for encontrado no banco de dados. Voce poderia adicionar uma verificacao de nulo aqui."

**Stoneage:**

> `L42: 🔴 bug: user pode ser null apos .find(). Adicionar guard antes de .email.`

### Commit Message

**Normal:**

> "feat: adicionar um novo endpoint para obter informacoes de perfil do usuario do banco de dados"

**Stoneage:**

> `feat(api): add GET /users/:id/profile`
