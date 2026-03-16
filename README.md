# Pixel Art Agent Office (PAAO)

Open-source, self-hosted dashboard to monitor OpenClaw agents in a pixel-art office view.

## MVP Features
- ✅ Agents list view with pixel art cards
- ✅ 5 status indicators (working / waiting / calling / idle / error)
- ✅ Real-time updates via Socket.IO
- ✅ Click agent to view details panel
- ✅ Approve / Reject / Pause / Resume actions
- ✅ Mobile responsive layout
- ✅ Dark-mode first UI
- ✅ Docker support

## Tech Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Realtime: Socket.IO
- Database: SQLite (local), PostgreSQL-ready dependency

## Architecture (ASCII)

```text
┌──────────────────────────┐         Socket.IO / REST         ┌──────────────────────────┐
│      React Client        │  ─────────────────────────────▶  │     Express + Socket     │
│  Agent cards + details   │  ◀─────────────────────────────  │  Agent APIs + events     │
└─────────────┬────────────┘                                  └─────────────┬────────────┘
              │                                                           │
              │                                                           │
              ▼                                                           ▼
      Browser local state                                          SQLite (local)
                                                                / PostgreSQL (prod)
```

## Demo Screenshot

> Placeholder: `docs/demo.png` (add screenshot after first polished UI capture)

## Project Structure

```text
paao/
├── client/
│  ├── src/
│  │  ├── components/
│  │  │  ├── AgentCard.jsx
│  │  │  ├── AgentDetails.jsx
│  │  │  ├── OfficeCanvas.jsx
│  │  │  └── StatusIndicator.jsx
│  │  ├── hooks/useSocket.js
│  │  ├── utils/pixelArt.js
│  │  └── App.jsx
├── server/
│  ├── routes/agents.js
│  ├── sockets/index.js
│  ├── models/Agent.js
│  └── server.js
├── skills/openclaw-paao/SKILL.md
├── docker-compose.yml
└── .env.example
```

## Quick Start

1. Clone repo
```bash
git clone https://github.com/yourusername/paao
cd paao
```

2. Install dependencies
```bash
npm install
npm run install-all
```

3. Configure environment
```bash
cp .env.example .env
# edit .env with OpenClaw details if needed
```

4. Run development
```bash
npm run dev
```
- Client: http://localhost:5173
- Server: http://localhost:8080

5. Build for production
```bash
npm run build
docker-compose up -d --build
```

## API

### Agent Object
```json
{
  "id": "string",
  "name": "string",
  "role": "string",
  "status": "working | waiting | calling | idle | error",
  "currentTask": "string",
  "progress": 0,
  "lastActive": "timestamp",
  "assignedTo": "string",
  "conversations": []
}
```

### Endpoints
- `GET /api/agents`
- `GET /api/agent/:id`
- `POST /api/agent/:id/approve`
- `POST /api/agent/:id/reject`
- `POST /api/agent/:id/pause`
- `POST /api/agent/:id/resume`
- Socket.IO namespace: `/`

### cURL Examples
```bash
# list agents
curl http://localhost:8080/api/agents

# get one agent
curl http://localhost:8080/api/agent/orion

# approve agent task
curl -X POST http://localhost:8080/api/agent/orion/approve
```

## Connect with OpenClaw

Add integration skill path in OpenClaw config if desired:

```json
{
  "skills": {
    "load": {
      "extraDirs": ["/path/to/paao/skills"]
    }
  }
}
```

## Troubleshooting

- **Client cannot reach server:** Check `VITE_API_URL` and `VITE_SOCKET_URL`.
- **Socket disconnected:** Ensure backend is running on `:8080` and CORS origin is correct.
- **Database issues:** Verify `DB_PATH` in `.env`; file write permission required.
- **Docker healthcheck failing:** Wait 10-20s after boot; inspect logs via `docker compose logs`.

## Phase 2 ideas
- Agent-to-agent workflow arrows
- Telegram Topic integration
- Multi-user auth
- 3D office mode
