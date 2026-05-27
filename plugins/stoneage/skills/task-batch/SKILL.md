---
name: task-batch
description: >
  Agrupa TaskCreate e TaskUpdate em chamadas paralelas no mesmo turno.
  Menos turnos = menos tokens de overhead. Buddy ganha XP por task individual
  mesmo em batch. Use quando criar ou completar 3+ tasks.
user-invocable: true
---

Tasks separadas = turnos desperdiçados. Batch = menos overhead.

## Regras

**Criar tasks:**

- Se 2+ tasks independentes, criar todas no mesmo turno (tool calls paralelas)
- Definir dependências (addBlockedBy) no mesmo turno das tasks

**Completar tasks:**

- Se 2+ tasks prontas, marcar todas completed no mesmo turno
- Buddy processa cada completion individualmente — XP garantido por task

**Exceções:**

- Task que depende de resultado de outra → turno separado (precisa do output)
- Apenas 1 task → sem benefício de batch

## Exemplo

```
// ❌ 5 turnos separados
Turno 1: TaskCreate("fix auth")
Turno 2: TaskUpdate("1", in_progress)
Turno 3: [edita código]
Turno 4: TaskUpdate("1", completed)
Turno 5: TaskCreate("add tests")

// ✅ 2 turnos
Turno 1: TaskCreate("fix auth") + TaskCreate("add tests") + TaskCreate("update docs")
Turno 2: [edita código] + TaskUpdate("1", completed) + TaskUpdate("2", completed) + TaskUpdate("3", completed)
```

## Controle

- Individual: "task batch on/off"
- Mestre: "token economy on/off" (controla todas as skills)
