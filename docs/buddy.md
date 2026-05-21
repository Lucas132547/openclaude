# 🐾 OpenClaw Buddy — Documentação Completa

## Visão Geral

O Buddy é um companion virtual que vive no canto da sua tela no OpenClaw. Ele observa seu trabalho, reage a eventos, ganha XP, sobe de nível e desbloqueia habilidades e outfits.

---

## Primeiro Uso

Execute `/buddy` pela primeira vez para chocar seu companion. Ele será gerado deterministicamente a partir do seu userId, com:

- **Espécie** — uma de 18 (duck, goose, blob, cat, dragon, octopus, owl, penguin, turtle, snail, ghost, axolotl, capybara, cactus, robot, rabbit, mushroom, chonk)
- **Raridade** — common (60%), uncommon (25%), rare (10%), epic (4%), legendary (1%)
- **Olhos** — um de 6 estilos
- **Personalidade** — uma de 5
- **Nome** — gerado deterministicamente (ex: "Bytebud", "Echobit", "Glintspark")

---

## Sistema de XP

### Fontes de XP

| Ação             | XP   | Detalhes                                   |
| ---------------- | ---- | ------------------------------------------ |
| Bash com sucesso | +0.1 | Cada comando que roda sem erro             |
| Pet diário       | +1   | Primeiro `/buddy` do dia                   |
| Task concluída   | +3   | Quando o assistente completa um TaskUpdate |
| Alimentar        | +0.5 | `/buddy alimentar` (cooldown: 1h)          |
| Streak 3 dias    | +0.5 | Bônus por 3 dias seguidos                  |
| Streak 7 dias    | +1   | Bônus por 7 dias seguidos                  |
| Streak 14 dias   | +2   | Bônus por 14 dias seguidos                 |
| Streak 30 dias   | +3   | Bônus por 30 dias seguidos                 |
| Easter egg       | +5   | 0.5% de chance no pet                      |

### Níveis e Chapéus

| Nível | XP necessário | Chapéu    | Status                            |
| ----- | ------------- | --------- | --------------------------------- |
| 1     | 0             | —         | "Aprendendo o fluxo de trabalho." |
| 2     | 5             | beanie    | "Gostando do progresso!"          |
| 3     | 25            | propeller | "Trabalhando duro!"               |
| 4     | 50            | tophat    | "Cozinhando código!"              |
| 5     | 80            | wizard    | "Dominou as artes!"               |
| 6     | 120           | crown     | "Lendário!"                       |

### Custo de XP

| Ação     | Custo | Requisito |
| -------- | ----- | --------- |
| Renomear | 5 XP  | Level 2+  |
| Rerrolar | 15 XP | —         |

---

## Comandos

### `/buddy` (sem argumentos)

- **Primeira vez:** Choca um novo companion
- **Depois:** Acaricia o companion (+1 XP diário, streak, easter egg, outfits)

### `/buddy status`

Mostra informações do companion:

- Nome, espécie, raridade
- Nível e XP
- Estado (ouvindo/silenciado)
- Personalidade
- Humor (dinâmico)

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

### `/buddy resumo`

Mostra um resumo da sessão atual.

- **Requisito:** Level 4+

### `/buddy lembrar <minutos> <texto>`

Define um lembrete. O companion te avisa quando o tempo acabar.

- **Tempo:** 1 a 1440 minutos (24h)
- **Exemplo:** `/buddy lembrar 10 revisar PR`

### `/buddy memorias`

Mostra as memórias do companion (eventos marcantes).

### `/buddy outfits`

Mostra os outfits disponíveis, desbloqueados e equipados.

### `/buddy equipar <nome>`

Equipa um outfit desbloqueado.

### `/buddy mute` / `/buddy unmute`

Silencia ou reativa as reações do companion.

### `/buddy help`

Mostra a ajuda com todos os comandos.

---

## Sistema de Mood

O humor do companion é dinâmico e muda baseado na sua atividade:

| Humor         | Condição                        |
| ------------- | ------------------------------- |
| 😴 Sonolento  | Não fez pet hoje                |
| 😟 Preocupado | Taxa de erro > 40%              |
| 🤩 Empolgado  | Múltiplo de 10 tasks concluídas |
| 😤 Orgulhoso  | Streak >= 7 dias                |
| 😄 Feliz      | Pet feito, sem problemas        |

---

## Sistema de Outfits

Outfits são skins visuais desbloqueadas por achievements:

| Outfit    | Requisito            | Descrição      |
| --------- | -------------------- | -------------- |
| Fantasma  | Streak de 7 dias     | Skin etérea    |
| Neon      | Streak de 30 dias    | Skin luminosa  |
| Dourado   | 100 tasks concluídas | Skin brilhante |
| Cyber     | 500 comandos bash    | Skin digital   |
| Arco-Íris | Encontrar easter egg | Skin colorida  |

---

## Sistema de Skills (Habilidades)

Habilidades desbloqueadas por nível:

| Level | Habilidade       | Descrição                                              |
| ----- | ---------------- | ------------------------------------------------------ |
| 2     | Dicas em erros   | 10% de chance de mostrar uma dica quando um bash falha |
| 4     | Resumo da sessão | `/buddy resumo` mostra estatísticas da sessão          |
| 6     | Sugestões        | Companion sugere próximo passo                         |

---

## Reações do Observer

O companion reage automaticamente a eventos:

| Evento               | Reação                                             |
| -------------------- | -------------------------------------------------- |
| Bash com sucesso     | 20% chance de reação positiva                      |
| Bash com erro        | Sempre reage com mensagem de apoio                 |
| Task concluída       | Reação de celebração + XP                          |
| Git status           | Avisa sobre commits pendentes ou branch divergente |
| Menciona o companion | Reage quando você fala o nome dele                 |

---

## Lembretes de Produtividade

O companion monitora seu trabalho e te avisa:

- **1 hora trabalhando sem parar** — sugere uma pausa
- **15 minutos inativo** — pergunta se está travado

---

## Memórias

O companion lembra de eventos importantes:

- Primeiro level up
- Streak de 7 e 30 dias
- 100 bashes e 50 tasks
- Easter egg encontrado
- Rename e reroll

Máximo de 20 memórias (FIFO).

---

## Easter Eggs

- **0.5% de chance** no pet de encontrar um "bug brilhante" (+5 XP)
- Desbloqueia o outfit Arco-Íris

---

## Arquitetura

### Arquivos

| Arquivo                         | Função                                         |
| ------------------------------- | ---------------------------------------------- |
| `src/buddy/types.ts`            | Tipos e constantes (espécies, raridades, etc.) |
| `src/buddy/companion.ts`        | Geração determinística do companion            |
| `src/buddy/observer.ts`         | Reações a eventos do sistema                   |
| `src/buddy/progression.ts`      | Níveis e thresholds de XP                      |
| `src/buddy/mood.ts`             | Sistema de humor dinâmico                      |
| `src/buddy/skills.ts`           | Habilidades desbloqueáveis                     |
| `src/buddy/memory.ts`           | Memórias do companion                          |
| `src/buddy/outfits.ts`          | Sistema de outfits                             |
| `src/buddy/streak.ts`           | Sistema de streak diário                       |
| `src/buddy/reminders.ts`        | Lembretes de produtividade e customizados      |
| `src/buddy/prompt.ts`           | Injeção no system prompt                       |
| `src/buddy/CompanionSprite.tsx` | Renderização visual (ASCII art)                |
| `src/buddy/sprites.ts`          | Sprites das 18 espécies                        |
| `src/buddy/feature.ts`          | Feature flag (sempre true)                     |
| `src/buddy/hash.ts`             | Hash compartilhado                             |
| `src/commands/buddy/buddy.tsx`  | Handler do comando `/buddy`                    |
| `src/commands/buddy/index.ts`   | Registro do comando                            |

### Config Fields

```typescript
companion?: StoredCompanion          // Alma do companion
companionMuted?: boolean             // Silenciado?
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
