# Survival Spanish

Data-driven Spanish language learning app for immigrants in Spain.

> Get absolute beginners through real-world Spanish interactions without freezing or reaching for a translator.

## Quick Start

### Prerequisites

- Node.js 18+ (20+ recommended)
- Yarn 4.0+
- Expo CLI (for client): `npm install -g expo-cli`

### Setup

```bash
# Install dependencies
yarn install

# Copy environment files
cp apps/backend/.env.example apps/backend/.env
cp apps/client/.env.example apps/client/.env
```

### Development

Run backend and client in separate terminals:

**Terminal 1: Backend**
```bash
yarn dev:backend
# Server runs on http://localhost:4000
# Health check: curl http://localhost:4000/health
```

**Terminal 2: Client**
```bash
yarn dev:client
# Opens Expo DevTools
# Press 'w' for web, 'i' for iOS simulator, 'a' for Android emulator
```

### Docker

Run backend in Docker:

```bash
docker-compose up backend
```

## Project Structure

```
superextranjero/
├── apps/
│   ├── backend/          # Express.js modular monolith (F1–F5)
│   │   ├── src/
│   │   │   ├── main.ts           # Express app entry
│   │   │   ├── routes/           # API endpoints
│   │   │   ├── middleware/       # Express middleware
│   │   │   └── config/           # Environment & config
│   │   └── __tests__/            # Backend tests
│   │
│   └── client/           # React Native (Expo)
│       ├── src/
│       │   ├── App.tsx           # Root component
│       │   ├── screens/          # UI screens
│       │   ├── navigation/       # Route navigation
│       │   ├── api/              # HTTP client
│       │   └── state/            # State management
│       └── __tests__/            # Client tests
│
├── packages/             # Shared utilities (future)
├── docs/specs/           # Specification documents
├── .github/workflows/    # GitHub Actions CI
└── docker/               # Docker configuration
```

## Scripts

### Development
- `yarn dev:backend` — Start backend dev server (nodemon + tsx)
- `yarn dev:client` — Start Expo client

### Quality
- `yarn lint` — Run ESLint on all workspaces
- `yarn lint:fix` — Fix linting issues
- `yarn format` — Format code with Prettier
- `yarn format:check` — Check formatting without changing
- `yarn type-check` — TypeScript type checking
- `yarn test` — Run Jest tests
- `yarn test:watch` — Run tests in watch mode

### Build
- `yarn build` — Build all workspaces for production
- `yarn workspace @ss/backend build` — Build backend only
- `yarn workspace @ss/client build:web` — Build client web version

## Specification & Architecture

See `/docs/specs/` for the complete specification suite:

- **PRD_v0.4.md** — Product requirements, objectives, scope
- **Architecture_v0.1.md** — System design, LLM Gateway, modular monolith
- **InterfaceContracts_v0.1.html** — Capability boundaries and contracts
- **UserJourneys_v0.1.html** — Persona walkthroughs
- **ImplementationWorkstreams_v0.1.md** — Build sequencing (F1–F5, V1–V6)

## Current Workstream: F1 (Repo + CI + Monorepo)

**F1 Status:** ✅ Complete

This foundation establishes:
- ✅ Yarn v4 monorepo with workspaces
- ✅ Root-level ESLint, Prettier, TypeScript configuration
- ✅ Express backend with hello-world endpoints
- ✅ Expo React Native client with API integration
- ✅ GitHub Actions CI pipeline (lint, test, build)
- ✅ Pre-commit hooks via Husky + lint-staged
- ✅ Docker support for backend

### Verification

The monorepo is **done when:**

1. ✅ Monorepo structure exists with shared linting & type checking
2. ✅ CI passes: lint, format, type-check, test all green
3. ✅ Backend health check: `GET /health` → `{ status: "ok" }`
4. ✅ Client boots and displays home screen
5. ✅ Client → Backend call works: pressing "Call Backend" shows backend message
6. ✅ Pre-commit hooks fire automatically
7. ✅ CI workflow passes on push

### Next Workstream: F2 (Data Layer)

Once F1 is merged, F2 will add:
- PostgreSQL schema and migrations
- `user`, `verb`, `micro_scenario`, `user_micro_scenario_progress` tables
- Database connection pool in backend
- Seed data endpoints

Then F3 (LLM Gateway), F4 (Auth), F5 (Client state), and finally `seed_verb_pool` (J5 cold-start).

## Development Workflow

1. Create a new branch: `git checkout -b feature/description`
2. Make changes and commit: `git commit -m "Clear message"`
3. Pre-commit hooks run automatically (lint + format)
4. Push: `git push -u origin feature/description`
5. GitHub Actions CI runs: lint, format, type-check, test
6. Open a pull request and request review
7. Merge when all checks pass

## Troubleshooting

### Port Already in Use
If port 4000 is in use:
```bash
# macOS/Linux
lsof -i :4000
kill -9 <PID>

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Yarn Cache Issues
```bash
yarn cache clean
rm -rf node_modules .yarn/cache
yarn install
```

### Expo Issues
```bash
expo start --clear
# Or reset cache: expo start -c
```

## Contributing

See CLAUDE.md for coding guidelines and specification navigation.

## License

MIT
