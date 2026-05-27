---
name: stoneage-compress
description: >
  Comprime arquivos de memória (.md, .txt) em formato stoneage para reduzir tokens de input.
  Preserva toda substância técnica, código, URLs e estrutura.
  Versão compacta sobrescreve o original. Backup salvo como FILE.original.md.
  Use: /stoneage-compress CAMINHO ou "comprimir arquivo de memória"
user-invocable: true
---

# Stoneage Compress

## Propósito

Comprimir arquivos de linguagem natural (.md, .txt) em formato stoneage para reduzir tokens de input. Versão compacta sobrescreve o original. Backup como `<arquivo>.original.md`.

## Processo

1. Ler o arquivo alvo
2. Comprimir mantendo: termos técnicos, blocos de código, URLs, caminhos, comandos, nomes próprios, datas, versões, variáveis de ambiente
3. Salvar backup como `ARQUIVO.original.md`
4. Sobrescrever original com versão comprimida
5. Reportar economia (tokens antes/depois)

## Regras de Compressão

### Remover

- Artigos: um, uma, o, a, os, as
- Preenchimento: apenas, simplesmente, basicamente, na verdade, essencialmente, geralmente
- Cortesias: "claro", "com certeza", "com prazer", "feliz em ajudar"
- Hedging: "vale a pena considerar", "poderia pensar em", "seria bom"
- Frases redundantes: "a fim de" → "para", "certificar-se de" → "garantir", "a razão é porque" → "porque"
- Conectivos vazios: "no entanto", "além disso", "adicionalmente"

### Preservar EXATAMENTE (nunca modificar)

- Blocos de código (``` e indentados)
- Código inline (backticks)
- URLs e links completos
- Caminhos de arquivo (`/src/components/...`, `./config.yaml`)
- Comandos (`npm install`, `git commit`, `docker build`)
- Termos técnicos (nomes de bibliotecas, APIs, protocolos, algoritmos)
- Nomes próprios (projetos, pessoas, empresas)
- Datas, versões, valores numéricos
- Variáveis de ambiente (`$HOME`, `NODE_ENV`)

### Preservar Estrutura

- Todos os headings markdown (manter texto exato, comprimir corpo abaixo)
- Hierarquia de bullets (manter nível de nesting)
- Listas numeradas (manter numeração)
- Tabelas (comprimir texto das células, manter estrutura)
- Frontmatter/YAML headers

### Comprimir

- Sinônimos curtos: "grande" não "extenso", "corrigir" não "implementar uma solução para"
- Fragmentos OK: "Rodar testes antes do commit" não "Você deve sempre rodar os testes antes de fazer commit"
- Dropar "você deve", "certifique-se", "lembre-se de" — apenas declarar a ação
- Merge bullets redundantes que dizem a mesma coisa diferente
- Manter um exemplo quando múltiplos mostram o mesmo padrão

## Limites

- Apenas comprimir arquivos de linguagem natural (.md, .txt)
- NUNCA modificar: .py, .js, .ts, .json, .yaml, .yml, .toml, .env, .lock, .css, .html, .xml, .sql, .sh
- Se arquivo tem conteúdo misto (prosa + código), comprimir APENAS as seções de prosa
- Original é salvo como ARQUIVO.original.md antes de sobrescrever
