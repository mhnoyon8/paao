---
name: openclaw-paao
description: Send OpenClaw agent status updates to PAAO backend endpoint for real-time office view.
---

# OpenClaw → PAAO Bridge

Use this skill to push agent state changes to PAAO.

## Expected endpoint
- `POST http://localhost:8080/api/agent/:id/resume|pause|approve|reject`

## Example mapping
- working -> resume
- waiting approval -> pause
- error -> reject

## Suggested automation
- Trigger from hooks on tool start/end and approval required events.
- Keep payload concise: id, currentTask, progress, lastActive.
