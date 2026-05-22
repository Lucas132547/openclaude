import { getGlobalConfig } from '../utils/config.js'
import { getLevelInfo } from './progression.js'

// ─── Error Tips (Level 2+) ──────────────────────────────────────────────────

type ErrorTipCategory = {
  patterns: RegExp[]
  tips: readonly string[]
}

const ERROR_TIP_CATEGORIES: ErrorTipCategory[] = [
  {
    patterns: [/cannot find module/i, /module not found/i, /cannot resolve/i, /missing dependency/i, /npm err/i, /yarn err/i],
    tips: [
      'Roda `npm install` ou `yarn` pra instalar as dependências.',
      'Verifica se o package.json tem a dependência listada.',
      'Tenta deletar node_modules e reinstalar: `rm -rf node_modules && npm i`.',
      'Conferiu se o lockfile tá atualizado?',
    ],
  },
  {
    patterns: [/enoent/i, /no such file/i, /não encontrado/i],
    tips: [
      'Já conferiu se o arquivo existe e o caminho está correto?',
      'Verifica se o diretório pai existe antes de criar o arquivo.',
      'Tenta usar `ls` ou `find` pra confirmar que o arquivo tá lá.',
      'As vezes é só um typo no nome do arquivo ou extensão errada.',
    ],
  },
  {
    patterns: [/permission/i, /eacces/i, /eperm/i, /acesso negado/i, /forbidden/i],
    tips: [
      'Pode ser permissão de arquivo. Tenta `chmod` ou `sudo`.',
      'Verifica se o arquivo não tá com permissão de só leitura.',
      'Se é um socket ou porta, outro processo pode estar usando.',
      'Conferiu se tem permissão de escrita no diretório?',
    ],
  },
  {
    patterns: [/syntax/i, /unexpected/i, /parse/i, /unexpected token/i, /syntaxerror/i],
    tips: [
      'Erro de sintaxe! Confere parênteses, chaves e vírgulas.',
      'Tenta formatar o arquivo pra achar o erro mais fácil.',
      'Verifica se não falta uma vírgula ou ponto e vírgula.',
      'As vezes é um caractere invisível. Tenta recolar o código.',
    ],
  },
  {
    patterns: [/econnrefused/i, /econnreset/i, /timeout/i, /etimedout/i, /network/i, /fetch failed/i],
    tips: [
      'Parece ser problema de rede. O servidor tá rodando?',
      'Verifica se a URL/porta está correta.',
      'Tenta novamente — pode ser timeout temporário.',
      'Conferiu se não tem firewall bloqueando a conexão?',
    ],
  },
  {
    patterns: [/merge conflict/i, /CONFLICT/i, /git/i],
    tips: [
      'Conflito de merge! Abre o arquivo e resolve os marcadores `<<<<<<<`.',
      'Tenta `git mergetool` pra resolver visualmente.',
      'Se quiser abortar: `git merge --abort`.',
      'Conferiu qual branch tá tentando merge?',
    ],
  },
  {
    patterns: [/build failed/i, /compilation/i, /type error/i, /typescript/i, /ts\d+/i],
    tips: [
      'Erro de tipo! Confere os tipos das variáveis e parâmetros.',
      'Tenta rodar `tsc --noEmit` pra ver todos os erros de uma vez.',
      'Verifica se o tsconfig.json tá configurado corretamente.',
      'As vezes é só adicionar uma checagem de null/undefined.',
    ],
  },
  {
    patterns: [/test fail/i, /assertion/i, /expect/i, /jest/i, /vitest/i, /mocha/i],
    tips: [
      'Teste falhou! Lê a mensagem de erro pra entender o esperado vs atual.',
      'Tenta rodar só o teste que falhou pra isolar o problema.',
      'Verifica se o mock/setup do teste tá correto.',
      'Conferiu se o teste não depende de estado de outro teste?',
    ],
  },
]

const ERROR_TIPS_GENERIC = [
  'Tenta verificar o log de erro completo antes de tentar de novo.',
  'Talvez um `git diff` ajude a ver o que mudou.',
  'As vezes rodar o comando sem pipe ajuda a isolar o erro.',
  'Verifica se tem algum arquivo de config faltando.',
  'Tenta rodar com mais verbose flags pra ver mais detalhes.',
  'Que tal um `git status` pra ver o estado atual do repositório?',
  'Se funcionava antes, tenta `git stash` e testa sem as mudanças.',
  'Googleia o erro? As vezes tem issue no GitHub com a solução.',
] as const

// ─── Code Review Tips (30% chance, 90% premium) ─────────────────────────────

type CodeReviewCategory = {
  patterns: RegExp[]
  tips: readonly string[]
}

const CODE_REVIEW_CATEGORIES: CodeReviewCategory[] = [
  {
    patterns: [/^git add/i, /^git commit/i, /^git push/i],
    tips: [
      'Antes de commitar, roda `git diff --cached` pra ver o que tá staged.',
      'Lembre de escrever uma mensagem de commit descritiva.',
      'Se fez muitas mudanças, que tal dividir em commits menores?',
      'Já rodou os testes antes de pushar?',
    ],
  },
  {
    patterns: [/^git checkout/i, /^git switch/i, /^git branch/i],
    tips: [
      'Conferiu se tá no branch certo antes de começar?',
      'Se vai criar branch novo, lembra de puxar main atualizado.',
    ],
  },
  {
    patterns: [/npm install/i, /yarn add/i, /pnpm add/i, /bun add/i],
    tips: [
      'Conferiu se a versão do pacote é compatível com o projeto?',
      'Lembre de commitar o lockfile junto com as mudanças.',
      'Verifica se o pacote tem vulnerabilidades conhecidas.',
    ],
  },
  {
    patterns: [/npm run build/i, /yarn build/i, /pnpm build/i, /bun build/i, /make/i],
    tips: [
      'Se o build passou, que tal rodar os testes antes de commitar?',
      'Conferiu se não tem warning no build que deveria resolver?',
    ],
  },
  {
    patterns: [/npm test/i, /yarn test/i, /jest/i, /vitest/i, /pytest/i, /go test/i],
    tips: [
      'Se os testes passaram, tá quase pronto! Só falta revisar o diff.',
      'Conferiu se tem teste novo pra feature nova?',
      'Se cobriu tudo, que tal rodar com --coverage pra ver a cobertura?',
    ],
  },
  {
    patterns: [/docker/i, /docker-compose/i, /podman/i],
    tips: [
      'Conferiu se o Dockerfile tá otimizado com multi-stage build?',
      'Verifica se não tá rodando como root no container.',
      'Lembre de adicionar .dockerignore pra não copiar node_modules.',
    ],
  },
  {
    patterns: [/rm -rf/i, /rm -r/i, /del\b/i, /rmdir/i],
    tips: [
      'Cuidado com `rm -rf`! Confere o caminho antes de rodar.',
      'Tem certeza que quer deletar isso? Pode ser útil manter.',
    ],
  },
  {
    patterns: [/curl/i, /wget/i, /fetch/i],
    tips: [
      'Conferiu se a URL é HTTPS e não HTTP?',
      'Verifica se tem autenticação necessária no endpoint.',
      'Lembre de tratar erros de rede na requisição.',
    ],
  },
  {
    patterns: [/chmod/i, /chown/i, /sudo/i],
    tips: [
      'Cuidado com `sudo`! Tem certeza que precisa de privilégios de admin?',
      'Se tá mudando permissão, conferiu se não vai quebrar outro processo?',
    ],
  },
]

const CODE_REVIEW_TIPS_GENERIC = [
  'Lembre de revisar o diff antes de pushar.',
  'Já pensou em adicionar um .gitignore atualizado?',
  'Que tal um `git status` pra ver o que tá staged?',
  'Se tá debugando, tenta isolar o problema com testes menores.',
  'Antes de refactorar, garanta que tem cobertura de testes.',
  'Se mudou dependências, conferiu o lockfile?',
  'Se fez mudanças em config, lembra de não commitar segredos.',
  'Que tal adicionar um README atualizado com as mudanças?',
] as const

// ─── Contextual Selection ───────────────────────────────────────────────────

function pickContextual(
  categories: { patterns: RegExp[]; tips: readonly string[] }[],
  genericTips: readonly string[],
  input: string,
): string {
  // Find matching category
  for (const cat of categories) {
    if (cat.patterns.some(p => p.test(input))) {
      return cat.tips[Math.floor(Date.now() / 1000) % cat.tips.length]!
    }
  }
  // Fallback to generic
  return genericTips[Math.floor(Date.now() / 1000) % genericTips.length]!
}

// ─── Exports ────────────────────────────────────────────────────────────────

export function getErrorTip(premiumActive: boolean, errorOutput?: string): string | null {
  const chance = premiumActive ? 0.70 : 0.10
  if (Math.random() > chance) return null

  if (errorOutput) {
    return pickContextual(ERROR_TIP_CATEGORIES, ERROR_TIPS_GENERIC, errorOutput)
  }
  return ERROR_TIPS_GENERIC[Math.floor(Date.now() / 1000) % ERROR_TIPS_GENERIC.length]!
}

export function getCodeReviewTip(premiumActive: boolean, bashCommand?: string): string | null {
  const chance = premiumActive ? 0.90 : 0.30
  if (Math.random() > chance) return null

  if (bashCommand) {
    return pickContextual(CODE_REVIEW_CATEGORIES, CODE_REVIEW_TIPS_GENERIC, bashCommand)
  }
  return CODE_REVIEW_TIPS_GENERIC[Math.floor(Date.now() / 1000) % CODE_REVIEW_TIPS_GENERIC.length]!
}

// ─── Session Summary (Level 4+) ─────────────────────────────────────────────

export function getSessionSummary(): string | null {
  const config = getGlobalConfig()
  const companion = config.companion
  if (!companion) return null

  const xp = companion.xp ?? 0
  const levelInfo = getLevelInfo(xp)
  if (levelInfo.level < 4) return null

  const stats = config.companionStats
  if (!stats) return null

  return `📊 Resumo da sessão:
Bash executados: ${stats.totalBashes}
Tasks concluídas: ${stats.totalTasks}
Erros encontrados: ${stats.totalErrors}
XP: ${xp} (Nível ${levelInfo.level})
Streak: ${config.companionStreakCount ?? 0} dias`
}
