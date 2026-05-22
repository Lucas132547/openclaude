# 🐾 OpenClaw Buddy — Documentação Completa

## Visão Geral

O Buddy é um companion virtual que vive no canto da sua tela no OpenClaw. Ele observa seu trabalho, reage a eventos, ganha XP, sobe de nível, desbloqueia habilidades, outfits, chapéus, e pode evoluir.

---

## Primeiro Uso

Execute `/buddy` pela primeira vez para chocar seu companion. Ele será gerado deterministicamente a partir do seu userId, com:

- **Espécie** — uma de 24 (duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk, lion, crab, bear, ufo, sprout, bat)
- **Raridade** — common (60%), uncommon (25%), rare (10%), epic (4%), legendary (1%)
- **Olhos** — um de 6 estilos (·, ✦, ×, ◉, @, °)
- **Personalidade** — uma de 5
- **Nome** — gerado deterministicamente (ex: "Bytebud", "Echobit", "Glintspark")

---

## Sistema de XP

### Fontes de XP

| Ação             | XP     | Detalhes                                   |
| ---------------- | ------ | ------------------------------------------ |
| Bash com sucesso | +0.1   | Cada comando que roda sem erro             |
| Pet diário       | +1     | Primeiro `/buddy` do dia                   |
| Task concluída   | +3     | Quando o assistente completa um TaskUpdate |
| Alimentar        | +0.5   | `/buddy alimentar` (cooldown: 1h)          |
| Streak 3 dias    | +0.5   | Bônus por 3 dias seguidos                  |
| Streak 7 dias    | +1     | Bônus por 7 dias seguidos                  |
| Streak 14 dias   | +2     | Bônus por 14 dias seguidos                 |
| Streak 30 dias   | +3     | Bônus por 30 dias seguidos                 |
| Easter egg       | +3~+20 | Vários tipos (ver seção Easter Eggs)       |

### Níveis e Chapéus

| Nível | XP necessário | Chapéu    | Status                            |
| ----- | ------------- | --------- | --------------------------------- |
| 1     | 0             | —         | "Aprendendo o fluxo de trabalho." |
| 2     | 5             | beanie    | "Gostando do progresso!"          |
| 3     | 25            | propeller | "Trabalhando duro!"               |
| 4     | 50            | tophat    | "Cozinhando código!"              |
| 5     | 80            | wizard    | "Dominou as artes!"               |
| 6     | 120           | pirate    | "Navegando os mares!"             |
| 7     | 170           | halo      | "Angelical!"                      |
| 8     | 230           | tinyduck  | "Tem um amiguinho!"               |
| 9     | 300           | chef      | "Mestre-cuca!"                    |
| 10    | 400           | crown     | "Lendário!"                       |

### Custo de XP

| Ação                 | Custo | Requisito           |
| -------------------- | ----- | ------------------- |
| Renomear             | 5 XP  | Level 2+            |
| Rerrolar             | 15 XP | —                   |
| Pet Premium          | 1 XP  | —                   |
| Equipar Outfit       | 2 XP  | Outfit desbloqueado |
| Evoluir              | 50 XP | Level 5+            |
| Evoluir (meia-noite) | 40 XP | Level 5+            |

---

## Comandos

### `/buddy` (sem argumentos)

- **Primeira vez:** Choca um novo companion
- **Depois:** Acaricia o companion (+1 XP diário, streak, easter egg, outfits)

### `/buddy status`

Mostra informações do companion:

- Nome, espécie, raridade, tier de evolução
- Nível e XP
- Estado (ouvindo/silenciado)
- Personalidade
- Humor (dinâmico)
- Modo premium (se ativo)
- Evolução (se aplicável)

### `/buddy stats`

Mostra estatísticas detalhadas:

- Nível e XP atual
- Streak de dias seguidos
- Total de comandos bash executados
- Total de tasks concluídas
- Total de erros encontrados
- Total de pets recebidos

### `/buddy rename <nome>`

Renomeia o companion.

- **Custo:** 5 XP
- **Requisito:** Level 2+
- **Limite:** 1-30 caracteres

### `/buddy reroll`

Muda a aparência do companion (espécie, olhos, stats).

- **Custo:** 15 XP

### `/buddy brincar`

Brinca com o companion. Reações divertidas.

- **Cooldown:** 1 hora

### `/buddy alimentar`

Alimenta o companion.

- **XP:** +0.5
- **Cooldown:** 1 hora

### `/buddy pet premium`

Ativa o modo premium por 1 hora.

- **Custo:** 1 XP
- **Efeito:** Code Review com 90% de chance (normal: 30%), Dicas de Erro com 70% (normal: 10%)
- **Cooldown:** 1 hora (não acumula)
- **Visual:** Emoji 🔥/⭐ alternando, mood premium

### `/buddy outfit <nome>`

Equipa um outfit com custo de XP.

- **Custo:** 2 XP
- **Requisito:** Outfit desbloqueado
- **Diferença do equipar:** Custo de XP adicional

### `/buddy evolve`

Evolui o companion para a próxima espécie na cadeia de evolução.

- **Custo:** 50 XP (40 XP à meia-noite)
- **Requisito:** Level 5+
- **Animação:** Sprite pisca por 3 segundos
- **Ver seção Evolução para cadeias**

### `/buddy resumo`

Mostra um resumo da sessão atual.

- **Requisito:** Level 4+

### `/buddy lembrar <minutos> <texto>`

Define um lembrete. O companion te avisa quando o tempo acabar.

- **Tempo:** 1 a 1440 minutos (24h)
- **Exemplo:** `/buddy lembrar 10 revisar PR`

### `/buddy memorias`

Mostra as memórias do companion (eventos marcantes).

### `/buddy journal`

Mostra o diário de hoje com estatísticas da sessão.

### `/buddy achievements` / `/buddy conquistas`

Mostra todas as conquistas com status desbloqueado/bloqueado.

### `/buddy requisitos`

Mostra o progresso de outfits e chapéus (requisitos e status).

### `/buddy outfits`

Mostra os outfits disponíveis, desbloqueados e equipados.

### `/buddy equipar <nome>`

Equipa um outfit desbloqueado (sem custo de XP).

### `/buddy mute` / `/buddy unmute`

Silencia ou reativa as reações do companion.

### `/buddy compact` / `/buddy decompact`

Ativa ou desativa o modo compacto do sprite.

- **Compacto:** Mostra apenas a face do companion (1 linha) na barra inferior
- **Completo:** Mostra o sprite inteiro (24x10) quando o terminal tiver 120+ colunas
- **Padrão:** Comportamento baseado na largura do terminal (compacto se < 120 cols)

### `/buddy preview`

Mostra todas as 24 espécies com seus 3 frames de animação lado a lado.

### `/buddy help`

Mostra a ajuda com todos os comandos.

---

## Sistema de Evolução

O companion pode evoluir para uma forma mais forte. Existem 8 cadeias de evolução:

| Tier 1  | Tier 2   | Tier 3  | Tema                      |
| ------- | -------- | ------- | ------------------------- |
| duck    | goose    | dragon  | Aves da Fúria             |
| cat     | chonk    | lion    | A Realeza Felina          |
| snail   | turtle   | crab    | Esquadrão da Carapaça     |
| rabbit  | capybara | bear    | Os Peludos da Paz         |
| penguin | axolotl  | octopus | Profundezas Aquáticas     |
| blob    | robot    | ufo     | Vida Artificial           |
| sprout  | mushroom | cactus  | Botânica de Sobrevivência |
| bat     | owl      | ghost   | Criaturas da Noite        |

**Requisitos:** Level 5+, 50 XP
**Especial:** À meia-noite (00:00-01:00), custa apenas 40 XP

---

## Sistema de Mood

O humor do companion é dinâmico e muda baseado na sua atividade:

| Prioridade | Humor         | Condição                        |
| ---------- | ------------- | ------------------------------- |
| 1          | 🔥/⭐ Premium | Modo premium ativo              |
| 2          | 😴 Sonolento  | Não fez pet hoje                |
| 3          | 😟 Preocupado | Taxa de erro > 40%              |
| 4          | 🤩 Empolgado  | Múltiplo de 10 tasks concluídas |
| 5          | 😤 Orgulhoso  | Streak >= 7 dias                |
| 6          | 😄 Feliz      | Pet feito, sem problemas        |

---

## Sistema de Outfits

Outfits são skins visuais com efeitos profundos (cor, olhos, símbolos, linhas extras, dim, blink).

### Outfits Disponíveis (13)

| Outfit    | Requisito                | Cor     | Olhos | Efeitos Extras           |
| --------- | ------------------------ | ------- | ----- | ------------------------ |
| Dourado   | 100 tasks concluídas     | yellow  | ✦     | Sparkles topo + fundo    |
| Neon      | Streak de 30 dias        | cyan    | ◉     | Glow fundo               |
| Cyber     | 500 comandos bash        | green   | @     | Matrix topo + fundo      |
| Fantasma  | Streak de 7 dias         | gray    | ×     | Semi-transparente        |
| Arco-Íris | Encontrar easter egg     | magenta | ◈     | Sparkles topo            |
| Viking    | 50 tasks + streak 7 dias | red     | ◉     | Escudo topo + fundo      |
| Pixel Art | 100h de uso              | blue    | []    | Blocos fundo             |
| Invisível | 5+ easter eggs           | gray    | ·     | Quase invisível          |
| Fogo      | Streak de 60 dias        | red     | ◉     | Chamas fundo             |
| Geladeira | 3 projetos diferentes    | cyan    | ❄     | Gelo topo + fundo        |
| Hacker    | 1000 comandos bash       | green   | @     | Terminal topo + fundo    |
| Festivo   | Usar em dezembro         | yellow  | ★     | Confetti topo + fundo    |
| Ninja     | 20 tasks + 0 erros       | gray    | >     | Stealth, blink 3x rápido |

### Efeitos Visuais por Outfit

Cada outfit pode ter:

- **Cor** — cor do texto do sprite (sobrescreve raridade)
- **Olhos** — caractere personalizado (substitui olho do companion)
- **Símbolo** — caractere nas laterais do sprite
- **Extra Top** — linhas acima do sprite
- **Extra Bottom** — linhas abaixo do sprite
- **Dim** — sprite semi-transparente
- **Blink Speed** — velocidade de piscar (1x padrão, 3x ninja)

Para manter a cor da raridade mesmo com outfit ativo, use `keepRarityColor: true`.

---

## Sistema de Skills (Habilidades)

### Dicas em Erros (Level 2+)

Quando um bash falha, o companion pode mostrar uma dica contextual.

- **Chance:** 10% (normal), 70% (premium)
- **Lógica:** Analisa a mensagem de erro e escolhe a dica mais relevante
- **Categorias:** arquivo, permissão, sintaxe, rede, dependência, git, build, teste

### Code Review Buddy (Level 2+)

Após um bash bem-sucedido, o companion pode sugerir melhorias.

- **Chance:** 30% (normal), 90% (premium)
- **Lógica:** Analisa o comando executado e sugere boas práticas
- **Categorias:** git, npm/yarn, build, teste, docker, rm, curl, sudo

### Resumo da Sessão (Level 4+)

`/buddy resumo` mostra estatísticas da sessão atual.

### Sugestões de Próximo Passo (Level 6)

O companion sugere o que fazer depois.

---

## Easter Eggs (7 tipos)

| Easter Egg      | Trigger                                    | Recompensa      | Frequência |
| --------------- | ------------------------------------------ | --------------- | ---------- |
| Konami Code     | Digitar `upupdowndownleftrightleftrightba` | +10 XP          | One-time   |
| Shiny Bug       | 0.5% de chance no pet                      | +5 XP           | Infinito   |
| Resposta 42     | Mensagem termina com "42" isolado          | +3 XP           | Infinito   |
| Midnight Hatch  | Nascer entre 00:00-01:00                   | Ghost + olhos ✦ | One-time   |
| Loop Infinito   | Mesmo bash falha 3x seguidas               | +2 XP           | Infinito   |
| Double Rainbow  | Shiny + outfit arco-íris                   | +20 XP          | Infinito   |
| Midnight Evolve | Evoluir entre 00:00-01:00                  | -10 XP no custo | Infinito   |

---

## Conquistas (21)

| Emoji | Conquista            | Descrição                | Condição       |
| ----- | -------------------- | ------------------------ | -------------- |
| 🎯    | Primeiro Commit      | Primeiro comando bash    | 1 bash         |
| 🏃    | Maratonista          | 100 comandos bash        | 100 bashes     |
| 🏅    | Maratonista de Elite | 1000 comandos bash       | 1000 bashes    |
| 🐛    | Bug Hunter           | 20 erros                 | 20 erros       |
| ⚔️    | Bug Slayer           | 100 erros                | 100 erros      |
| ✅    | Task Master          | 50 tasks                 | 50 tasks       |
| 🏆    | Task Legend          | 200 tasks                | 200 tasks      |
| 🔥    | Streak Warrior       | Streak de 30 dias        | 30 dias        |
| 💎    | Streak Obsessed      | Streak de 90 dias        | 90 dias        |
| ❤️    | Pet Lover            | 100 pets                 | 100 pets       |
| 💖    | Pet Addict           | 500 pets                 | 500 pets       |
| 🧬    | Evolver              | Evoluir o buddy          | 1 evolução     |
| 🎮    | Konami Master        | Ativar Konami Code       | 1 konami       |
| 👗    | Fashionista          | 5 outfits desbloqueados  | 5 outfits      |
| 👑    | Fashion King         | 10 outfits desbloqueados | 10 outfits     |
| 👑    | Lendário             | Level 10                 | 400 XP         |
| 🥚    | Easter Hunter        | 3 easter eggs diferentes | 3 triggers     |
| 🦉    | Night Owl            | Usar à meia-noite        | midnightEvolve |
| 🌈    | Rainbow Warrior      | Double Rainbow           | doubleRainbow  |
| ⭐    | Premium User         | Modo premium             | petPremium     |
| 🔍    | Code Reviewer        | 50+ comandos bash        | 50 bashes      |

---

## Eventos Sazonais

O companion reage a datas especiais com mensagens temáticas:

| Evento             | Data     | Emoji | Mensagens                            |
| ------------------ | -------- | ----- | ------------------------------------ |
| Natal              | 25/12    | 🎄    | 5 frases (inclui "Jesus é o motivo") |
| Réveillon          | 31/12    | 🎆    | 5 frases (ano dinâmico)              |
| Carnaval           | Variável | 🎭    | 5 frases (data calculada via Páscoa) |
| Halloween          | 31/10    | 🎃    | 5 frases                             |
| Dia do Programador | 13/09    | 💻    | 5 frases                             |
| Dia dos Namorados  | 12/06    | 💕    | 5 frases                             |
| Páscoa             | Variável | 🐰    | 5 frases (data calculada via Páscoa) |

---

## Memórias

O companion lembra de eventos importantes (15 triggers):

| Trigger        | Quando                  |
| -------------- | ----------------------- |
| firstLevelUp   | Primeiro level up       |
| streak7        | Streak de 7 dias        |
| streak30       | Streak de 30 dias       |
| bashes100      | 100 comandos bash       |
| tasks50        | 50 tasks                |
| easterEgg      | Shiny bug encontrado    |
| reroll         | Reroll feito            |
| rename         | Rename feito            |
| evolve         | Evolução                |
| konami         | Konami Code ativado     |
| petPremium     | Modo premium ativado    |
| doubleRainbow  | Double Rainbow          |
| midnightEvolve | Evolução à meia-noite   |
| loopInfinite   | Loop infinito detectado |
| answer42       | Resposta 42 encontrada  |

Máximo de 20 memórias (FIFO — as mais antigas saem).

---

## Diário

O companion mantém um diário automático com estatísticas do dia:

- Tasks concluídas
- Comandos executados
- Erros encontrados
- XP total
- Streak
- Eventos do dia (memórias)

**Comando:** `/buddy journal`

---

## Reações do Observer

O companion reage automaticamente a eventos:

| Evento               | Reação                                             |
| -------------------- | -------------------------------------------------- |
| Bash com sucesso     | 20% chance de reação positiva + Code Review (30%)  |
| Bash com erro        | Sempre reage + dica contextual (10%, 70% premium)  |
| Task concluída       | Reação de celebração + XP                          |
| Git status           | Avisa sobre commits pendentes ou branch divergente |
| Menciona o companion | Reage quando você fala o nome dele                 |
| Konami Code          | Reação especial + XP                               |
| Resposta 42          | Reação especial + XP                               |

---

## Lembretes de Produtividade

O companion monitora seu trabalho e te avisa:

- **1 hora trabalhando sem parar** — sugere uma pausa
- **15 minutos inativo** — pergunta se está travado

---

## Chapéus

### Por Nível (10)

| Chapéu    | Nível |
| --------- | ----- |
| beanie    | 2     |
| propeller | 3     |
| tophat    | 4     |
| wizard    | 5     |
| pirate    | 6     |
| halo      | 7     |
| tinyduck  | 8     |
| chef      | 9     |
| crown     | 10    |

### Por Achievement (3)

| Chapéu     | Condição              |
| ---------- | --------------------- |
| santa      | Usar no Natal (25/12) |
| party      | Aniversário do hatch  |
| headphones | 500 comandos bash     |

---

## Renderização do Sprite

Cada espécie tem sprites ASCII art com **24 caracteres de largura × 10 linhas de altura**, com 3 frames de animação (idle fidget).

### Modos de Exibição

| Modo     | Condição                                   | Visual                                  |
| -------- | ------------------------------------------ | --------------------------------------- |
| Completo | Terminal >= 120 colunas                    | Sprite 24x10 com nome e animação        |
| Compacto | Terminal < 120 colunas ou `/buddy compact` | Apenas a face (1 linha, ex: `\|°  °\|`) |

- O sprite completo aparece como **overlay flutuante** (fullscreen) ou **lado a lado** com o input (non-fullscreen)
- O modo compacto economiza espaço vertical no terminal
- Use `/buddy compact` para forçar o modo compacto em qualquer terminal
- Use `/buddy decompact` para voltar ao comportamento automático

### Placeholder de Olho

O placeholder `{E}` no código-fonte ocupa 3 caracteres mas é substituído por 1 caractere do olho do companion (ex: ·, ✦, ×, ◉, @, °). Isso permite trocar olhos sem quebrar o alinhamento do sprite.

### Slot do Chapéu

A linha 0 de cada frame é reservada para o chapéu. Se não houver chapéu e todos os frames tiverem a linha 0 vazia, ela é removida automaticamente (altura reduz de 10 para 9).

---

## Arquitetura

### Arquivos

| Arquivo                         | Função                                                        |
| ------------------------------- | ------------------------------------------------------------- |
| `src/buddy/types.ts`            | Tipos e constantes (espécies, raridades, hats)                |
| `src/buddy/companion.ts`        | Geração determinística do companion                           |
| `src/buddy/observer.ts`         | Reações a eventos do sistema                                  |
| `src/buddy/progression.ts`      | Níveis e thresholds de XP                                     |
| `src/buddy/mood.ts`             | Sistema de humor dinâmico                                     |
| `src/buddy/skills.ts`           | Habilidades desbloqueáveis (contextual)                       |
| `src/buddy/memory.ts`           | Memórias do companion (15 triggers)                           |
| `src/buddy/outfits.ts`          | Sistema de outfits (13 outfits)                               |
| `src/buddy/evolution.ts`        | Sistema de evolução (8 cadeias)                               |
| `src/buddy/easter-eggs.ts`      | Easter eggs (7 tipos)                                         |
| `src/buddy/streak.ts`           | Sistema de streak diário                                      |
| `src/buddy/reminders.ts`        | Lembretes de produtividade e customizados                     |
| `src/buddy/prompt.ts`           | Injeção no system prompt                                      |
| `src/buddy/CompanionSprite.tsx` | Renderização visual (ASCII art 24x10 + outfits)               |
| `src/buddy/sprites.ts`          | Sprites das 24 espécies (24x10, 3 frames) + estilos de outfit |
| `src/buddy/journal.ts`          | Diário do companion                                           |
| `src/buddy/seasonal.ts`         | Eventos sazonais (7 eventos)                                  |
| `src/buddy/achievements.ts`     | Conquistas (21)                                               |
| `src/buddy/feature.ts`          | Feature flag (sempre true)                                    |
| `src/buddy/hash.ts`             | Hash compartilhado                                            |
| `src/commands/buddy/buddy.tsx`  | Handler do comando `/buddy`                                   |
| `src/commands/buddy/index.ts`   | Registro do comando                                           |

### Config Fields

```typescript
companion?: StoredCompanion          // Alma do companion
companionMuted?: boolean             // Silenciado?
companionCompact?: boolean           // Modo compacto forçado
companionLastPetDate?: string        // Último pet (data local)
companionStreakCount?: number        // Dias seguidos
companionLastStreakDate?: string     // Último streak (data local)
companionStats?: {                   // Estatísticas
  totalBashes: number
  totalTasks: number
  totalErrors: number
  totalPets: number
  daysActive: number
}
companionLastAction?: Record<string, number>  // Cooldowns
companionReminders?: Array<{...}>    // Lembretes customizados
companionMemory?: Array<{...}>       // Memórias
companionOutfits?: string[]          // Outfits desbloqueados
companionActiveOutfit?: string       // Outfit equipado
```
