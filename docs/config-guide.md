# 📝 Guia de Configuração e Diagnóstico - OpenClaude

Este documento explica a hierarquia de arquivos do **OpenClaude**, como eles interagem e como identificar configurações que podem estar causando travamentos.

---

## 1. Localização dos Arquivos

| Nível | Caminho do Arquivo | Descrição | Status Git |
| :--- | :--- | :--- | :--- |
| **Global** | \`~/.openclaude/settings.json\` | Configurações que valem para toda a máquina. | Fora do Git |
| **Projeto** | \`.openclaude/settings.json\` | Configurações compartilhadas com o time. | **Commitado** |
| **Local** | \`.openclaude/settings.local.json\` | Overrides específicos da sua máquina. | **Ignorado** |
| **Segredos** | \`.env\` | Chaves de API e tokens sensíveis. | **Ignorado** |

---

## 2. Estrutura do Arquivo \`settings.json\`

Os arquivos utilizam o formato JSON e são divididos principalmente em:

### A. Bloco \`env\` (Variáveis de Ambiente)
Define qual provedor de IA e modelo o OpenClaude deve usar.
\`\`\`json
"env": {
  "CLAUDE_CODE_USE_OPENAI": "1",
  "OPENAI_BASE_URL": "https://seu-gateway.com/v1",
  "OPENAI_MODEL": "modelo-selecionado"
}
\`\`\`

### B. Bloco \`permissions\` (Permissões de Execução)
Define quais comandos o agente pode rodar sem pedir sua autorização toda vez.
*   **allow**: Lista de comandos pré-aprovados.
*   **Formato**: \`Bash(comando:*)\` (o \`*\` funciona como wildcard).

---

## 3. Por que o OpenClaude Trava? (Diagnóstico)

Se o OpenClaude "congela" no terminal, verifique estes 4 pontos:

### 🛠️ Problema 1: Indexação Infinita (Orama)
O OpenClaude tenta ler todos os arquivos do projeto para "entender" o código. Se ele entrar em pastas como \`node_modules\`, \`dist\` ou \`.git\`, a CPU vai a 100%.
*   **Sintoma:** O logo pisca e o terminal para de responder antes de você digitar.
*   **Solução:** Rode com \`--bare\` para desativar a indexação:
    \`\`\`bash
    openclaude --bare
    \`\`\`

### 🔌 Problema 2: Conflito de Hooks/Plugins
Se você tem scripts que manipulam arquivos (como comandos \`ln -sf\`), eles podem rodar em loop ou criar recursão.
*   **Sintoma:** Erros de "Too many open files" ou travamento logo após dar ENTER.
*   **Solução:** Limpe os links simbólicos e reinicie.

### 🌐 Problema 3: Latência do Gateway/API
O OpenClaude espera o primeiro caractere da resposta para renderizar a interface. Se a rede ou o modelo estiverem lentos, ele parece travado.
*   **Sintoma:** Você envia a mensagem, o ícone de "pensando" aparece, mas nada acontece por 30s+.
*   **Solução:** Teste com um modelo mais rápido ou verifique sua conexão com o \`OPENAI_BASE_URL\`.

### 👻 Problema 4: Processos Zumbis
Como o OpenClaude gerencia subprocessos (LSP, TypeScript), eles podem ficar travados em background.
*   **Solução:** O "Botão de Pânico":
    \`\`\`bash
    killall node bun tsc
    \`\`\`

---

## 4. Comandos de Manutenção Rápida

| Comando | O que faz |
| :--- | :--- |
| \`openclaude --bare\` | Inicia sem plugins/indexação (Modo de Segurança). |
| \`DEBUG=openclaude* openclaude\` | Mostra no log exatamente em qual passo ele travou. |
| \`rm -rf ~/.openclaude/cache\` | Limpa o índice de busca (força re-indexação limpa). |
| \`openclaude config list\` | Mostra todas as configurações ativas no momento. |
