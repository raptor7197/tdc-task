# TDC Matchmaker Dashboard MVP

A full-stack internal tool for The Date Crew matchmakers to manage customers, view profiles, compute AI-powered match suggestions, and track the matchmaking journey.

## Tech Choices

**Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 — fast dev experience, no SSR overhead. shadcn-inspired components built with Tailwind. A love-themed palette (rose/pink/gold) aligns the UI with the matchmaking context without being unprofessional.

**Backend**: Express + TypeScript — simple REST API with JWT auth. Static JSON files serve as the data layer (120 faker-generated profiles with realistic Indian names, cities, colleges, and cultural attributes). In-memory storage handles notes and match history for MVP simplicity.

**AI**: OpenRouter API (OpenAI-compatible) powers three features: match compatibility explanations, personalized intro email generation, and meeting note summarization. Falls back gracefully when no API key is configured.

**Deployment**: Docker Compose with nginx reverse proxy. The frontend (built static files) and backend API are containerized separately. The nginx config serves the SPA and proxies `/api/*` to the Express server. Single `docker compose up -d` deploys everything.

## Matching Logic

Gender-specific scoring with configurable weights (adjustable from the Scoring Config dashboard):

**For male customers** — matches with women who are younger (2-7 year gap ideal), earn less (conventional expectation), are shorter, and share matching views on children. Religion/caste alignment is heavily weighted.

**For female customers** — matches with men who are older (1-7 year gap), earn more, are taller, and share values around family, education, and lifestyle. Profession compatibility and education level are weighted higher.

Ten scoring dimensions: Religion/Caste, Age, Education, Income, Height, Location, Want Kids, Diet, Family Values, Lifestyle. Three presets (Traditional, Modern, Balanced) are included, plus full custom control with live preview.

## How AI Is Used

1. **Match Explanations**: Given two profiles, the AI writes a warm 2-3 sentence explanation of why they're compatible, referencing actual details from both profiles.
2. **Intro Email Generation**: The AI drafts a personalized email introducing one profile to another, highlighting compatibility points and signed by the matchmaker.
3. **Note Summarization**: Raw meeting/call notes are structured into Key Observations, Compatibility Signals, Potential Concerns, and Suggested Next Steps.

All AI features use `gpt-4o-mini` via OpenRouter (cost-effective). The system degrades gracefully with hardcoded fallbacks if the API is unavailable.

## Sample Login Credentials

| Email | Password |
|---|---|
| `priya@thedatecrew.com` | `tdc2024` |
| `rahul@thedatecrew.com` | `tdc2024` |

## Quick Start (Production)

```bash
# Clone and navigate
cd tdc-project

# Configure (optional — AI features need OpenRouter key)
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY

# Deploy
docker compose up -d

# Open http://localhost:3000
```

## Quick Start (Development)

```bash
# Terminal 1: Backend
cd server
npm install
npm run dev    # http://localhost:3001

# Terminal 2: Frontend
cd client
npm install
npm run dev    # http://localhost:5173 (proxies API to 3001)
```

## Project Structure

```
tdc-project/
├── server/                   # Express backend
│   ├── src/
│   │   ├── index.ts          # App entry point
│   │   ├── routes/           # Auth, profiles, matches, notes, scoring, AI
│   │   ├── middleware/       # JWT auth middleware
│   │   ├── lib/              # Types, matching algo, OpenAI client
│   │   └── data/             # JSON data files (profiles, matchmakers, scoring config)
│   ├── scripts/              # Faker-based profile generator
│   └── Dockerfile
├── client/                   # React frontend
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, CustomerDetail, ScoringConfig
│   │   ├── components/       # Layout, UI, matching, scoring components
│   │   ├── context/          # Auth context provider
│   │   └── lib/              # Types, API client, utilities
│   ├── nginx.conf            # SPA + API proxy config
│   └── Dockerfile
└── docker-compose.yml        # VM deployment orchestration
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current matchmaker info |
| GET | `/api/profiles/assigned` | My assigned profiles (with filters) |
| GET | `/api/profiles` | All profiles (admin) |
| GET | `/api/profiles/:id` | Single profile detail |
| GET | `/api/matches/:profileId` | Top 15 matches for a customer |
| POST | `/api/matches/send` | Record a match being sent |
| GET | `/api/matches/history/:id` | Match history for a profile |
| GET | `/api/notes/:profileId` | Notes for a customer |
| POST | `/api/notes/:profileId` | Add a note |
| GET | `/api/scoring/config` | Current scoring weights |
| PUT | `/api/scoring/config` | Update weights |
| GET | `/api/scoring/presets` | List presets |
| POST | `/api/scoring/preview` | Live score preview |
| POST | `/api/ai/explain` | AI match explanation |
| POST | `/api/ai/intro` | AI intro email |
| POST | `/api/ai/summarize-notes` | AI note summary |

## Assumptions Made

- **No database needed**: 120 static profiles (JSON) and in-memory notes/history are sufficient for an MVP. A production version would use PostgreSQL/Redis.
- **Flat profile assignment**: Each profile is assigned to exactly one matchmaker. Real-world matchmakers might collaborate.
- **Gender binary**: Matching logic assumes male/female. Real-world products need non-binary support.
- **Indian context**: Profile fields and matching logic are tuned for Indian matchmaking norms (caste, religion, family values, diet, manglik status, etc.).
- **No real email sending**: The "Send Match" action logs the event and shows a toast. Actual email/SMS delivery would require an external service.
- **OpenRouter fallback**: AI features work without a configured key by returning static fallback text.
