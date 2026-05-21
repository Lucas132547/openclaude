# Citations Streaming Support

## Utilidade

O streaming de respostas da API da Anthropic agora suporta **citações** (citations). Antes dessa correção, o caso `citations_delta` no handler de streaming descartava silenciosamente todos os dados de citação recebidos da API. Isso significava que quando o Claude citava fontes de documentos, PDFs ou conteúdo longo, as citações eram perdidas.

Agora, cada citação é acumulada durante o streaming e associada ao bloco de texto correto, permitindo que o frontend exiba as fontes citadas.

## Como utilizar

### Para desenvolvedores do frontend

As citações estão disponíveis no campo `citations` de cada bloco de texto na resposta:

```typescript
interface TextContentBlock {
  type: "text";
  text: string;
  citations: Citation[]; // Array de citações acumuladas durante streaming
}

interface Citation {
  type: string; // Tipo da citação (ex: "page_location", "web_search_result")
  cited_text: string; // Texto citado
  source: string; // Fonte da citação
  // ... outros campos dependendo do tipo
}
```

### Fluxo de streaming

```
content_block_start (type: text)
  → Inicializa citations: []

content_block_delta (type: text_delta)
  → Acumula texto no bloco

content_block_delta (type: citations_delta)
  → Valida que o bloco atual é do tipo text
  → Inicializa citations[] se necessário
  → Push delta.citation no array

content_block_stop
  → Bloco finalizado com texto + citations
```

## Quando utilizar

- **Quando o Claude processa documentos longos** — PDFs, artigos, documentação
- **Quando o Claude usa web search** — citações de resultados de busca
- **Quando o Claude referencia partes específicas** — citações de localização de página

## Tratamento de erros

Se um `citations_delta` chegar quando o bloco atual não é do tipo `text`:

- Um evento de analytics é logado (não lança exceção)
- O streaming continua normalmente
- Isso garante resiliência durante o streaming

## Arquivo alterado

| Arquivo                                | Mudança                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/services/api/claude.ts:2047-2121` | Inicialização de `citations: []` em content_block_start + acumulação em citations_delta |
