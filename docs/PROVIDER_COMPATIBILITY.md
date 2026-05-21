# Provider Compatibility Matrix

This document provides a comprehensive reference for which features work with
each provider in OpenClaude. Use it to quickly determine if your preferred
provider supports the capabilities you need.

> **Generated from source:** `src/integrations/descriptors.ts`,
> `src/integrations/models/*.ts`, `src/integrations/vendors/*.ts`,
> `src/integrations/gateways/*.ts`, `src/services/api/cacheMetrics.ts`

---

## Quick Reference Table

### Vendors (Direct API Providers)

| Feature | Anthropic | OpenAI | Gemini | DeepSeek | xAI | MiniMax | Moonshot | Venice | Z.AI | Xiaomi MiMo | Bankr |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Streaming** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Tool Use / Function Calling** | Yes | Yes | Yes | Yes | Yes | Yes* | Yes | Yes | Yes | Yes | Yes |
| **Vision (Image Input)** | Yes | Yes | Yes | No | Yes | Yes* | Yes | No | No | Varies** | No |
| **Reasoning / Extended Thinking** | Yes | No | Yes | Varies*** | Yes | Varies**** | Yes | No | Yes | Yes | No |
| **JSON Mode** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Precise Token Counting** | No | Yes | No | No | No | No | No | No | No | No | No |
| **Prompt Caching** | Yes | Yes | Yes | Yes | No | No | Yes | No | No | No | No |
| **System Messages** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Multi-turn Conversations** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Web Search** | Yes | No | No | No | No | No | No | No | No | No | No |
| **Usage / Rate Limit Tracking** | Yes | No | No | No | No | Yes | No | Yes | No | No | No |
| **Max Context Window** | 200K | 1.05M | 1M | 1M | 2M | 524K | 262K | N/A | 202K | 1M | N/A |
| **Max Output Tokens** | 8K | 128K | 65K | 65K | 32K | 131K | 32K | N/A | 131K | 128K | N/A |

\* MiniMax: Function calling supported on M2+ models; Vision on M2.1+ and Vision-01 models.\
\*\* Xiaomi MiMo: Vision available on MiMo V2.5 and V2 Omni; not on Pro/Flash variants.\
\*\*\* DeepSeek: Reasoning on Reasoner and V4 Pro; not on Chat or V4 Flash.\
\*\*\*\* MiniMax: Reasoning on M2+ models; not on Text-01 or Vision-01 models.

### Gateways (Aggregation / Hosted / Local)

| Feature | GitHub Copilot | Bedrock | Vertex | Ollama | LM Studio | Groq | OpenRouter | Mistral | Azure OpenAI | Together | Hicap |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Streaming** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Tool Use / Function Calling** | Yes | Yes | Yes | Yes* | Yes* | Yes | Yes | Yes | Yes | Yes | Yes |
| **Vision (Image Input)** | Varies** | Yes | Yes | Varies* | Varies* | No | Varies | No | Varies | No | Varies |
| **Reasoning / Extended Thinking** | Varies** | Yes | Yes | Varies* | Varies* | No | Varies | No | Varies | No | Varies |
| **JSON Mode** | Yes | Yes | Yes | Yes* | Yes* | Yes | Yes | Yes | Yes | Yes | Yes |
| **Precise Token Counting** | No | No | No | No | No | No | No | No | No | No | No |
| **Prompt Caching** | Yes*** | Yes | Yes | No | No | No | No | No | No | No | No |
| **System Messages** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Multi-turn Conversations** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Web Search** | No | Yes | Yes | No | No | No | No | No | No | No | No |
| **Usage / Rate Limit Tracking** | No | No | No | No | No | No | No | No | No | No | No |
| **Model Discovery** | Static | Static | Static | Dynamic | Dynamic | Hybrid | Hybrid | Static | Static | Static | Hybrid |

\* Ollama and LM Studio: Capabilities depend entirely on the locally loaded model.\
\*\* GitHub Copilot: Capabilities vary by the underlying model (Claude, GPT, Gemini, etc.).\
\*\*\* GitHub Copilot: Prompt caching enabled only when routing Claude models through the native Anthropic path.

### Additional Gateways

| Feature | DashScope CN/INTL | NVIDIA NIM | Kimi Code | Atomic Chat | Gitlawb Opengateway | Custom |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Streaming** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Tool Use / Function Calling** | Yes | Yes | Yes | Yes* | Yes | Yes* |
| **Vision** | Yes | No | Yes | Varies* | Varies | Varies* |
| **Reasoning** | Yes | No | Yes | Varies* | Yes | Varies* |
| **JSON Mode** | Yes | Yes | Yes | Yes* | Yes | Yes* |
| **Prompt Caching** | No | No | No | No | No | No |
| **Model Discovery** | Static | Static | Static | Dynamic | Static | Static |

\* Atomic Chat and Custom: Capabilities depend on the model and server implementation.

---

## Provider Details

### Anthropic (Vendor)

The primary first-party provider. Uses the native Anthropic Messages API
(`anthropic-native` transport). All Claude model families are supported.

- **Auth:** API key via `ANTHROPIC_API_KEY`
- **Base URL:** `https://api.anthropic.com`
- **Default Model:** `claude-sonnet-4-6`
- **Transport:** Native Anthropic SDK
- **Prompt Caching:** Full support with `cache_control` blocks. Cache creation
  and cache read tokens are tracked separately. Supports 1-hour extended cache
  for eligible plans.
- **Web Search:** Supported via `server_tool_use` (Anthropic's built-in web search)
- **Usage Tracking:** Fetches utilization data from the Claude.ai API for
  subscribers (rate limits, credit usage)
- **Models Available:**
  - Claude Sonnet 4.6 (200K context, 8K output, vision + reasoning)
  - Claude Opus 4.7 (200K context, 8K output, vision + reasoning)
  - Claude Opus 4.6 (200K context, 8K output, vision + reasoning)
  - Claude Haiku 4.5 (144K context, 8K output, vision, no reasoning)

**Configuration Tips:**
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
# Optional: override base URL for proxies
export ANTHROPIC_BASE_URL="https://your-proxy.example.com"
# Optional: override default model
export ANTHROPIC_MODEL="claude-opus-4-6"
```

---

### OpenAI (Vendor)

First-party OpenAI provider. Uses the OpenAI-compatible transport with the
Responses API format when available.

- **Auth:** API key via `OPENAI_API_KEY`
- **Base URL:** `https://api.openai.com/v1`
- **Default Model:** `gpt-5.4`
- **Transport:** OpenAI-compatible
- **Prompt Caching:** Supported (OpenAI's automatic server-side caching)
- **Precise Token Counting:** Yes (OpenAI returns exact token counts)
- **Models Available:** GPT-5.4, GPT-5.5, GPT-5 Mini, GPT-4o, GPT-4.1,
  o1, o3, o4-mini, and more

**Configuration Tips:**
```bash
export OPENAI_API_KEY="sk-..."
# Codex transport (for codex models) is auto-detected when model matches
# codex-specific names like gpt-5.5, gpt-5.3-codex, etc.
```

**Notes:**
- Codex models (gpt-5.5, gpt-5.3-codex, etc.) automatically route through the
  Codex transport (`chatgpt.com/backend-api/codex`) instead of the standard
  OpenAI API.
- Reasoning effort levels (low/medium/high) are supported for o-series and
  codex models.

---

### Google Gemini (Vendor)

Google's Gemini models via the OpenAI-compatible endpoint at
`generativelanguage.googleapis.com`.

- **Auth:** API key via `GEMINI_API_KEY`, `GOOGLE_API_KEY`, or Google ADC
- **Base URL:** `https://generativelanguage.googleapis.com/v1beta/openai`
- **Default Model:** `gemini-3-flash-preview`
- **Transport:** Gemini native (with OpenAI shim fallback)
- **Prompt Caching:** Supported via `cached_content_token_count`
- **Enablement:** Set `CLAUDE_CODE_USE_GEMINI=1`
- **Models Available:**
  - Gemini 3.1 Pro Preview (1M context, 65K output)
  - Gemini 2.5 Pro (1M context, 65K output)
  - Gemini 3 Flash Preview (1M context, 65K output)
  - Gemini 3.1 Flash Lite Preview (1M context, 65K output)
  - Gemini 2.0 Flash (1M context, 8K output)

**Configuration Tips:**
```bash
export CLAUDE_CODE_USE_GEMINI=1
export GEMINI_API_KEY="AIza..."
# Or use Google ADC (Application Default Credentials)
gcloud auth application-default login
```

**Notes:**
- All Gemini models support vision, reasoning, function calling, and JSON mode.
- The 1M token context window is among the largest available.

---

### DeepSeek (Vendor)

DeepSeek models via their OpenAI-compatible API. Known for reasoning
capabilities and large context windows.

- **Auth:** API key via `DEEPSEEK_API_KEY`
- **Base URL:** `https://api.deepseek.com/v1`
- **Default Model:** `deepseek-v4-pro`
- **Transport:** OpenAI-compatible with DeepSeek-specific extensions
- **Reasoning Content:** Preserved via `preserveReasoningContent` and
  `thinkingRequestFormat: 'deepseek-compatible'`
- **Prompt Caching:** Supported via `prompt_cache_hit_tokens` /
  `prompt_cache_miss_tokens`
- **Models Available:**
  - DeepSeek Chat (128K context, no reasoning)
  - DeepSeek Reasoner (128K context, 65K output, reasoning)
  - DeepSeek V4 Flash (1M context, 65K output, no reasoning)
  - DeepSeek V4 Pro (1M context, 65K output, reasoning)

**Configuration Tips:**
```bash
export DEEPSEEK_API_KEY="sk-..."
```

**Limitations:**
- No vision support on any model
- `max_tokens` field used (not `max_completion_tokens`)
- The `store` field is removed from requests

---

### xAI (Vendor)

xAI's Grok models.

- **Auth:** API key via `XAI_API_KEY`
- **Base URL:** `https://api.x.ai/v1`
- **Default Model:** `grok-4.3`
- **Transport:** OpenAI-compatible
- **Models Available:**
  - Grok 4.3 (1M context, 32K output, vision + reasoning)
  - Grok 4 (2M context, 32K output, vision + reasoning)
  - Grok 3 (131K context, 32K output, vision + reasoning)

**Configuration Tips:**
```bash
export XAI_API_KEY="xai-..."
```

**Notes:**
- Grok 4 has the largest context window in the matrix at 2M tokens.
- All Grok models support full feature sets (vision, reasoning, function calling).

---

### MiniMax (Vendor)

MiniMax models with a wide range of variants.

- **Auth:** API key via `MINIMAX_API_KEY`
- **Base URL:** `https://api.minimax.io/v1`
- **Default Model:** `MiniMax-M2.7`
- **Transport:** OpenAI-compatible
- **Usage Tracking:** Supported (fetches from MiniMax API)
- **Models Available:**
  - MiniMax M2 / M2.1 / M2.5 / M2.7 (204K context, 131K output, reasoning)
  - Highspeed variants of M2.1 / M2.5 / M2.7
  - MiniMax Text 01 (524K context, no vision/reasoning)
  - MiniMax Vision 01 / Vision 01 Fast (no function calling/reasoning)

**Configuration Tips:**
```bash
export MINIMAX_API_KEY="..."
```

**Limitations:**
- Vision-01 models do NOT support function calling or JSON mode
- Text-01 models do NOT support vision or reasoning
- `supportsApiFormatSelection` and `supportsAuthHeaders` are both false

---

### Moonshot AI / Kimi (Vendor + Gateway)

Moonshot AI provides Kimi models. Available both as a direct vendor and via
the Kimi Code gateway.

- **Auth:** API key via `MOONSHOT_API_KEY` (vendor) or `KIMI_API_KEY` (gateway)
- **Base URL:** `https://api.moonshot.ai/v1` (vendor) or
  `https://api.kimi.com/coding/v1` (gateway)
- **Transport:** OpenAI-compatible with reasoning content preservation
- **Prompt Caching:** Supported via `cached_tokens` field
- **Models Available:**
  - Kimi for Coding (262K context, 32K output, vision + reasoning)
  - Kimi K2.5 / K2.6 (262K context, 32K output, vision + reasoning)
  - Kimi K2 Thinking (262K context, 32K output, vision + reasoning)
  - Moonshot v1 variants (8K to 131K context)

**Configuration Tips:**
```bash
# Direct vendor
export MOONSHOT_API_KEY="..."
# Kimi Code gateway (coding-optimized)
export KIMI_API_KEY="..."
```

---

### Venice (Vendor)

Venice provides uncensored, privacy-focused models.

- **Auth:** API key via `VENICE_API_KEY`
- **Base URL:** `https://api.venice.ai/api/v1`
- **Default Model:** `venice-uncensored`
- **Transport:** OpenAI-compatible
- **Usage Tracking:** Supported

**Configuration Tips:**
```bash
export VENICE_API_KEY="..."
```

**Limitations:**
- No vision, reasoning, or precise token counting
- `supportsApiFormatSelection` and `supportsAuthHeaders` are both false

---

### Z.AI (Vendor)

Z.AI provides GLM (General Language Model) models from Zhipu AI.

- **Auth:** API key via `OPENAI_API_KEY` (uses OpenAI key env var)
- **Base URL:** `https://api.z.ai/api/coding/paas/v4`
- **Default Model:** `GLM-5.1`
- **Transport:** OpenAI-compatible with reasoning content preservation
- **Models Available:**
  - GLM-5.1 (202K context, 131K output, reasoning)
  - GLM-5-Turbo (202K context, 131K output, reasoning)
  - GLM-4.7 (202K context, 131K output, reasoning)
  - GLM-4.5-Air (128K context, 65K output, reasoning)

**Configuration Tips:**
```bash
export OPENAI_API_KEY="your-zai-key"
export OPENAI_MODEL="GLM-5.1"
```

**Limitations:**
- No vision support on any GLM model
- Uses `OPENAI_API_KEY` (same env var as OpenAI)

---

### Xiaomi MiMo (Vendor)

Xiaomi's MiMo coding models. Available directly and via the Gitlawb
Opengateway.

- **Auth:** API key via `MIMO_API_KEY`
- **Base URL:** `https://api.xiaomimimo.com/v1`
- **Default Model:** `mimo-v2.5-pro`
- **Transport:** OpenAI-compatible with reasoning content preservation
- **Auth Header:** Uses `api-key` header (raw, not Bearer)
- **Models Available:**
  - MiMo V2.5 Pro (1M context, 128K output, reasoning, no vision)
  - MiMo V2 Pro (1M context, 128K output, reasoning, no vision)
  - MiMo V2.5 (1M context, 128K output, vision + reasoning)
  - MiMo V2 Omni (256K context, 128K output, vision + reasoning)
  - MiMo V2 Flash (256K context, 64K output, reasoning, no vision)

**Configuration Tips:**
```bash
export MIMO_API_KEY="..."
# Or via Gitlawb Opengateway (free, no API key needed):
# Select "Gitlawb Opengateway" preset
```

---

### Bankr (Vendor)

Bankr LLM Gateway providing access to Claude models via OpenAI-compatible
API.

- **Auth:** API key via `BNKR_API_KEY`
- **Base URL:** `https://llm.bankr.bot/v1`
- **Default Model:** `claude-opus-4.6`
- **Transport:** OpenAI-compatible

**Configuration Tips:**
```bash
export BNKR_API_KEY="..."
```

---

### GitHub Copilot (Gateway)

GitHub Copilot provides access to multiple model families (Claude, GPT, Gemini,
Grok) through a single gateway. Has special handling for Claude models.

- **Auth:** GitHub token via `GITHUB_TOKEN` or `GH_TOKEN` (OAuth flow via
  `/onboard-github`)
- **Base URL:** `https://api.githubcopilot.com`
- **Transport:** OpenAI-compatible, with native Anthropic path for Claude models
- **Enablement:** Set `CLAUDE_CODE_USE_GITHUB=1`
- **Prompt Caching:** Supported ONLY when using Claude models (routes through
  native Anthropic format). Non-Claude models do not support caching.
- **Model Routing:** Supports model routing (select different models)
- **Claude Native Mode:** When the model string contains `claude-`, the runtime
  automatically uses the Anthropic native API format, enabling prompt caching
  and full Claude feature support.

**Configuration Tips:**
```bash
export CLAUDE_CODE_USE_GITHUB=1
export GITHUB_TOKEN="ghp_..."
# Or authenticate interactively:
# Run /onboard-github in the CLI
```

**Models Available (via aliases):**
- Claude: Sonnet 4.6, Opus 4.6, Haiku 4.5
- GPT: 5.5, 5.4, 5.2, 4.1, 4o, 4o-mini
- Gemini: 2.5 Pro, 3 Flash, 3.1 Pro
- Grok: Code Fast 1

**Limitations:**
- Prompt caching only works for Claude models via native Anthropic path
- Non-Claude models report `supported: false` for cache metrics
- Rate limit and usage tracking not available

---

### AWS Bedrock (Gateway)

AWS Bedrock hosts Anthropic Claude models with AWS-native authentication.

- **Auth:** AWS Default Credentials (ADC) -- IAM roles, environment variables,
  or AWS CLI configuration
- **Transport:** Bedrock-specific (native Anthropic format via AWS)
- **Models Available:** Claude Opus 4.6 (and other Claude models via AWS)

**Configuration Tips:**
```bash
# Configure AWS credentials (one of):
aws configure
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="us-east-1"  # or your preferred region

# Model-specific region overrides:
export VERTEX_REGION_CLAUDE_HAIKU_4_5="us-west-2"
```

**Notes:**
- Uses native Anthropic message format (not OpenAI-compatible)
- Full prompt caching support (Anthropic cache_control blocks)
- Web search supported via Anthropic server tools

---

### Google Vertex AI (Gateway)

Google Cloud's Vertex AI hosts Claude models with GCP authentication.

- **Auth:** Google Application Default Credentials (ADC)
- **Transport:** Vertex-specific (native Anthropic format via GCP)
- **Models Available:** Claude Opus 4.6 (and other Claude models via GCP)

**Configuration Tips:**
```bash
# Authenticate:
gcloud auth application-default login

# Required:
export ANTHROPIC_VERTEX_PROJECT_ID="your-gcp-project-id"

# Region (optional, defaults to us-east5):
export CLOUD_ML_REGION="us-east5"

# Model-specific region overrides:
export VERTEX_REGION_CLAUDE_3_5_HAIKU="us-east5"
```

**Notes:**
- Uses native Anthropic message format
- Full prompt caching support
- Some betas (like web-search) may cause 400 errors and are filtered

---

### Ollama (Gateway)

Local model server. Auto-detected when running on localhost.

- **Auth:** None required
- **Base URL:** `http://localhost:11434/v1`
- **Default Model:** `llama3.1:8b`
- **Transport:** Local (OpenAI-compatible)
- **Auto-Detection:** Yes (probes `ollama-generation` endpoint)
- **Model Discovery:** Dynamic (discovers installed models via Ollama tags API)
- **Cache Reporting:** Not supported (returns `supported: false`)

**Configuration Tips:**
```bash
# Ollama is auto-detected when running. To use explicitly:
export OPENAI_BASE_URL="http://localhost:11434/v1"
export OPENAI_MODEL="llama3.1:8b"
```

**Limitations:**
- All capabilities depend on the loaded model
- No cache metrics reported
- No usage/rate limit tracking
- No web search
- `max_tokens` field used

---

### LM Studio (Gateway)

Local model server. Auto-detected when running on localhost.

- **Auth:** None required
- **Base URL:** `http://localhost:1234/v1`
- **Default Model:** `local-model`
- **Transport:** Local (OpenAI-compatible)
- **Auto-Detection:** Yes (probes `openai-compatible-models` endpoint)
- **Model Discovery:** Dynamic

**Configuration Tips:**
```bash
# LM Studio is auto-detected when running. To use explicitly:
export OPENAI_BASE_URL="http://localhost:1234/v1"
export OPENAI_MODEL="your-model-name"
```

**Limitations:**
- Same as Ollama: all capabilities depend on the loaded model
- No cache metrics, usage tracking, or web search

---

### Groq (Gateway)

Groq provides fast inference for open-source models.

- **Auth:** API key via `GROQ_API_KEY`
- **Base URL:** `https://api.groq.com/openai/v1`
- **Default Model:** `llama-3.3-70b-versatile`
- **Transport:** OpenAI-compatible
- **Model Discovery:** Hybrid (static catalog + dynamic discovery)
- **Models Available:** Llama 3.3 70B and other Groq-hosted models

**Configuration Tips:**
```bash
export GROQ_API_KEY="gsk_..."
```

**Limitations:**
- No vision support on Groq-hosted models
- No reasoning support
- `store` and `reasoning_effort` fields removed from requests

---

### OpenRouter (Gateway)

Aggregator providing access to hundreds of models from various providers.

- **Auth:** API key via `OPENROUTER_API_KEY`
- **Base URL:** `https://openrouter.ai/api/v1`
- **Default Model:** `openai/gpt-5-mini`
- **Transport:** OpenAI-compatible
- **Model Discovery:** Hybrid (static + dynamic)

**Configuration Tips:**
```bash
export OPENROUTER_API_KEY="sk-or-..."
```

**Notes:**
- Capabilities vary by the underlying model selected
- Supports model routing to any provider in the OpenRouter catalog

---

### Mistral AI (Gateway)

Mistral AI's hosted models, optimized for coding tasks.

- **Auth:** API key via `MISTRAL_API_KEY`
- **Base URL:** `https://api.mistral.ai/v1`
- **Default Model:** `devstral-latest`
- **Transport:** OpenAI-compatible
- **Enablement:** Set `CLAUDE_CODE_USE_MISTRAL=1`
- **Models Available:**
  - Mistral Large Latest (256K context, 32K output)
  - Mistral Small Latest (256K context, 32K output)
  - Devstral Latest (256K context, 32K output)
  - Codestral (32K context, 8K output)

**Configuration Tips:**
```bash
export CLAUDE_CODE_USE_MISTRAL=1
export MISTRAL_API_KEY="..."
```

**Limitations:**
- No vision support on any Mistral model
- No reasoning support
- `store` field removed from requests

---

### Azure OpenAI (Gateway)

Microsoft Azure's hosted OpenAI models.

- **Auth:** API key via `AZURE_OPENAI_API_KEY`
- **Base URL:** `https://YOUR-RESOURCE-NAME.openai.azure.com/openai/v1`
- **Transport:** OpenAI-compatible
- **Model Routing:** Not supported (single deployment per configuration)

**Configuration Tips:**
```bash
export AZURE_OPENAI_API_KEY="..."
export OPENAI_BASE_URL="https://your-resource.openai.azure.com/openai/v1"
export OPENAI_MODEL="your-deployment-name"
```

**Notes:**
- The model name is your Azure deployment name
- Capabilities depend on the deployed model

---

### DashScope (Alibaba Cloud) -- CN and INTL (Gateways)

Alibaba Cloud's DashScope for Qwen models. Two variants: China and
International.

- **Auth:** API key via `DASHSCOPE_API_KEY`
- **Base URLs:**
  - China: `https://coding.dashscope.aliyuncs.com/v1`
  - International: `https://coding-intl.dashscope.aliyuncs.com/v1`
- **Default Model:** `qwen3.6-plus`
- **Models Available:** Qwen 3.6 Plus (1M context, 65K output)

**Configuration Tips:**
```bash
export DASHSCOPE_API_KEY="..."
```

---

### NVIDIA NIM (Gateway)

NVIDIA's inference platform for accelerated model serving.

- **Auth:** API key via `NVIDIA_API_KEY`
- **Base URL:** `https://integrate.api.nvidia.com/v1`
- **Default Model:** `nvidia/llama-3.1-nemotron-70b-instruct`
- **Enablement:** Set `NVIDIA_NIM=1`

**Configuration Tips:**
```bash
export NVIDIA_NIM=1
export NVIDIA_API_KEY="nvapi-..."
```

**Limitations:**
- No vision support
- No reasoning support

---

### Hicap (Gateway)

Hicap provides an OpenAI-compatible gateway with custom auth headers.

- **Auth:** API key via `HICAP_API_KEY`
- **Base URL:** `https://api.hicap.ai/v1`
- **Transport:** OpenAI-compatible with custom auth header (`api-key: raw`)
- **Model Discovery:** Hybrid (static + dynamic)
- **Responses API:** Only for `gpt-` prefixed models

**Configuration Tips:**
```bash
export HICAP_API_KEY="..."
```

---

### Gitlawb Opengateway (Gateway)

Free hosted gateway providing access to Xiaomi MiMo and partner models.
No API key required.

- **Auth:** None required
- **Base URL:** `https://opengateway.gitlawb.com/v1`
- **Default Model:** `mimo-v2.5-pro`
- **Transport:** OpenAI-compatible with reasoning content preservation

**Configuration Tips:**
```bash
# No configuration needed -- select the preset and start coding
# Models: mimo-v2.5-pro, mimo-v2-pro, mimo-v2.5, mimo-v2-omni, mimo-v2-flash
```

---

### Atomic Chat (Gateway)

Local model provider with auto-detection.

- **Auth:** None required
- **Base URL:** `http://127.0.0.1:1337/v1`
- **Transport:** Local (OpenAI-compatible)
- **Auto-Detection:** Yes

---

### Custom OpenAI-Compatible (Gateway)

Catch-all for any OpenAI-compatible endpoint not covered by the above.

- **Auth:** Optional API key via `OPENAI_API_KEY`
- **Base URL:** Configurable via `OPENAI_BASE_URL`
- **Transport:** OpenAI-compatible
- **Default Fallback:** `http://localhost:11434/v1`

**Configuration Tips:**
```bash
export OPENAI_BASE_URL="https://your-server.example.com/v1"
export OPENAI_API_KEY="optional-key"
export OPENAI_MODEL="your-model"
```

---

## Feature Reference

### Prompt Caching

Prompt caching reduces costs by reusing previously processed input tokens.
Support varies significantly by provider:

| Provider | Cache Mechanism | Cache Read Tracking | Cache Creation Tracking |
|---|---|---|---|
| Anthropic | `cache_control` blocks | `cache_read_input_tokens` | `cache_creation_input_tokens` |
| OpenAI | Automatic server-side | `input_tokens_details.cached_tokens` | N/A (automatic) |
| Gemini | `cached_content_token_count` | `cached_content_token_count` | N/A |
| DeepSeek | `prompt_cache_hit_tokens` | `prompt_cache_hit_tokens` | `prompt_cache_miss_tokens` |
| Moonshot/Kimi | `cached_tokens` | `cached_tokens` | N/A |
| GitHub Copilot (Claude) | Anthropic native `cache_control` | Same as Anthropic | Same as Anthropic |
| Bedrock / Vertex | Anthropic native `cache_control` | Same as Anthropic | Same as Anthropic |
| All others | Not supported | N/A | N/A |

**Important:** Providers that do not report cache data return `supported: false`
rather than fabricating 0% hit rates. This prevents misleading aggregate
statistics.

### Reasoning / Extended Thinking

Extended thinking allows models to show their reasoning process. Support:

| Provider | Models with Reasoning | Thinking Format |
|---|---|---|
| Anthropic | Sonnet 4.6, Opus 4.6/4.7 | Native Anthropic thinking blocks |
| Gemini | All models | Native (via API) |
| DeepSeek | Reasoner, V4 Pro | DeepSeek-compatible (`thinkingRequestFormat`) |
| xAI | All Grok models | Standard |
| MiniMax | M2+ models | Standard |
| Moonshot/Kimi | All Kimi models | Preserved reasoning content |
| Z.AI (GLM) | All GLM models | DeepSeek-compatible format |
| Xiaomi MiMo | All models | Preserved reasoning content |
| OpenAI | o1, o3, o4-mini series | Native (via Responses API) |

### Vision (Image Input)

Vision allows models to process images in conversations:

| Provider | Vision-Capable Models |
|---|---|
| Anthropic | Sonnet 4.6, Opus 4.6/4.7, Haiku 4.5 |
| OpenAI | All GPT-4o+ models |
| Gemini | All models |
| xAI | All Grok models |
| MiniMax | M2.1+, M2.5+, M2.7+, Vision-01 |
| Moonshot/Kimi | All Kimi models |
| Xiaomi MiMo | V2.5, V2 Omni |

**Non-vision providers:** DeepSeek, Venice, Z.AI (GLM), Mistral, Llama models,
NVIDIA NIM

### Web Search

Web search is Anthropic's built-in tool for searching the web during
conversations:

| Provider | Web Search |
|---|---|
| Anthropic | Supported (`server_tool_use`) |
| Bedrock | Supported (via Anthropic) |
| Vertex | Supported (via Anthropic) |
| All others | Not supported |

### Token Counting

Precise token counting (exact counts from the API vs. estimates):

| Provider | Precise Token Counting |
|---|---|
| OpenAI | Yes (API returns exact counts) |
| All others | No (estimates used) |

---

## Transport Types

The transport layer determines how requests are sent to providers:

| Transport | Providers | Description |
|---|---|---|
| `anthropic-native` | Anthropic | Native Anthropic Messages API |
| `anthropic-proxy` | (Custom proxies) | Anthropic format via proxy |
| `openai-compatible` | OpenAI, DeepSeek, Venice, xAI, MiniMax, Moonshot, Z.AI, Xiaomi MiMo, Bankr, GitHub (non-Claude), Groq, OpenRouter, Together, Mistral, Azure, DashScope, NIM, Hicap, Kimi Code, Custom | Standard OpenAI chat/completions API |
| `gemini-native` | Gemini | Gemini API with OpenAI shim fallback |
| `bedrock` | AWS Bedrock | Anthropic format via AWS SDK |
| `vertex` | Google Vertex AI | Anthropic format via GCP SDK |
| `local` | Ollama, LM Studio, Atomic Chat | Local server with OpenAI-compatible API |

---

## Authentication Modes

| Mode | Providers | Description |
|---|---|---|
| `api-key` | Anthropic, OpenAI, DeepSeek, xAI, MiniMax, Moonshot, Venice, Z.AI, Xiaomi MiMo, Bankr, Groq, OpenRouter, Together, Mistral, Azure, DashScope, NIM, Hicap | Standard API key |
| `token` | GitHub Copilot | GitHub OAuth token |
| `adc` | Bedrock, Vertex | Cloud provider Default Credentials |
| `oauth` | Codex (OpenAI) | OAuth2 flow for ChatGPT subscribers |
| `none` | Ollama, LM Studio, Atomic Chat, Gitlawb Opengateway | No authentication needed |

---

## Known Limitations and Gotchas

1. **DeepSeek reasoning content:** DeepSeek uses a special `thinkingRequestFormat:
   'deepseek-compatible'` that differs from Anthropic's thinking blocks.
   Reasoning content is preserved but displayed differently.

2. **GitHub Copilot Claude routing:** When using GitHub Copilot with a Claude
   model (model string containing `claude-`), the runtime automatically switches
   to the native Anthropic API format. This enables prompt caching but means
   the request format differs from non-Claude models on the same gateway.

3. **MiniMax Vision-01 limitations:** The Vision-01 and Vision-01 Fast models
   support image input but do NOT support function calling or JSON mode, making
   them unsuitable for tool-based workflows.

4. **Z.AI / Xiaomi MiMo env var conflicts:** Both use `OPENAI_API_KEY` as
   their credential env var. If you have both OpenAI and Z.AI/MiMo keys,
   use provider profiles to avoid conflicts.

5. **Local providers (Ollama, LM Studio, Atomic Chat):** All feature support
   depends on the loaded model. A Llama model won't support vision; a
   multimodal model might. The system cannot pre-detect capabilities for
   dynamically discovered models.

6. **Vertex AI beta filtering:** Some Anthropic betas (like web search) cause
   400 errors on Vertex and are automatically filtered out of requests.

7. **Codex transport auto-detection:** Models matching Codex-specific names
   (e.g., `gpt-5.5`, `gpt-5.3-codex`) automatically route through the Codex
   transport (`chatgpt.com/backend-api/codex`) instead of the standard OpenAI
   API. This uses OAuth authentication and has different rate limits.

8. **Cache metrics honesty:** Providers that don't report cache data (GitHub
   Copilot non-Claude, Ollama, LM Studio, self-hosted) return `supported:
   false` for cache metrics rather than fabricating 0% values. This prevents
   corrupting aggregate hit-rate statistics.

9. **Venice and MiniMax auth headers:** These providers do not support the
   standard `Authorization: Bearer` header format (`supportsAuthHeaders:
   false`). Authentication is handled differently by the shim layer.

10. **Azure OpenAI model routing:** Azure OpenAI does not support model routing
    (`supportsModelRouting: false`). Each deployment is a separate model, so
    you configure the deployment name as the model.

---

## Choosing a Provider

| Use Case | Recommended Provider(s) |
|---|---|
| Best overall experience | Anthropic (first-party) |
| Largest context window | xAI Grok 4 (2M), DeepSeek V4 (1M), Gemini (1M) |
| Cheapest local inference | Ollama or LM Studio |
| Free hosted option | Gitlawb Opengateway |
| Privacy-focused / uncensored | Venice |
| Multi-model access | GitHub Copilot, OpenRouter |
| AWS infrastructure | Bedrock |
| GCP infrastructure | Vertex AI |
| Fast inference | Groq |
| Chinese market | DashScope (Alibaba), Moonshot/Kimi, Z.AI, Xiaomi MiMo |
| Reasoning-heavy tasks | DeepSeek V4 Pro, Gemini, Claude Opus |
| Vision tasks | Claude, GPT-4o+, Gemini, Grok |
