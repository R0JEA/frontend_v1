# Python Unit Test Generator — Frontend

A Nuxt 3 + Tailwind CSS frontend for an AI-powered Python unit test generator. Paste a Python function, choose an output format (`pytest` or `unittest`), and receive generated unit tests from the backend LLM service.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | 18.x LTS or 20.x LTS |
| npm | 9.x+ (bundled with Node) |

Verify your versions:
```bash
node --version
npm --version
```

---

## Quick Start (Development)

### 1 — Clone / navigate to the project

```bash
cd frontend_v1
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set real values:

```env
NUXT_AUTH_USERNAME=admin
NUXT_AUTH_PASSWORD=your_strong_password
NUXT_JWT_SECRET=<random 64-char string>
NUXT_BACKEND_URL=http://localhost:8000
```

Generate a secure JWT secret (run in terminal):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 4 — Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

## Project Structure

```
frontend_v1/
├── app.vue                        # Root layout (renders <NuxtPage />)
├── nuxt.config.ts                 # Nuxt configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript (extends .nuxt/tsconfig.json)
├── .env.example                   # Template for environment variables
│
├── types/
│   └── index.ts                   # Shared TypeScript interfaces
│
├── pages/
│   ├── index.vue                  # Redirects → /chat
│   ├── login.vue                  # Admin login form
│   └── chat.vue                   # Main chat interface
│
├── components/
│   └── ChatMessage.vue            # Single chat message (user / assistant)
│
├── composables/
│   ├── useAuth.ts                 # login() and logout() helpers
│   └── useChat.ts                 # generate() and chat history state
│
├── middleware/
│   └── auth.global.ts             # Global route guard (JWT check)
│
├── server/
│   ├── utils/
│   │   └── jwt.ts                 # signToken / verifyToken
│   └── api/
│       ├── auth/
│       │   ├── login.post.ts      # POST /api/auth/login
│       │   ├── logout.post.ts     # POST /api/auth/logout
│       │   └── me.get.ts          # GET  /api/auth/me
│       └── generate.post.ts       # POST /api/generate (proxies to backend)
│
└── docs/
    └── backend-api.md             # Backend implementation specification
```

---

## Authentication Flow

1. User visits any protected route → global middleware checks `/api/auth/me`
2. If not authenticated → redirected to `/login`
3. Credentials validated server-side against `NUXT_AUTH_USERNAME` / `NUXT_AUTH_PASSWORD`
4. On success → JWT signed with `NUXT_JWT_SECRET`, stored in an **httpOnly** cookie (`auth_token`, 8-hour expiry)
5. Subsequent requests carry the cookie automatically
6. `/api/generate` verifies the JWT before proxying to the backend

---

## Available npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR at http://localhost:3000 |
| `npm run build` | Build for production (outputs to `.output/`) |
| `npm run preview` | Preview the production build locally |
| `npm run generate` | Generate a fully static site |
| `npm run postinstall` | Run automatically after `npm install` — generates Nuxt type stubs |

---

## Production Build & Deployment

### Build

```bash
npm run build
```

This produces a `.output/` directory containing the Node.js server bundle.

### Run in production

```bash
node .output/server/index.mjs
```

Set the same environment variables in your production environment (do **not** use `.env` in production — use your host's secrets manager):

```bash
export NUXT_AUTH_USERNAME=admin
export NUXT_AUTH_PASSWORD=<strong_password>
export NUXT_JWT_SECRET=<long_random_string>
export NUXT_BACKEND_URL=http://your-backend-host:8000
```

### Docker (optional)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output /app/.output
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Static hosting (Nuxt generate)

If you want to host on a static CDN (Netlify, Vercel, GitHub Pages) you must use `npm run generate` instead. Note: server-side API routes (auth, proxy) will not be available — this mode is only appropriate if you rewrite the auth layer to a separate API service.

---

## Environment Variable Reference

All variables are prefixed with `NUXT_` so Nuxt maps them to `runtimeConfig` automatically.

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_AUTH_USERNAME` | Yes | Admin login username |
| `NUXT_AUTH_PASSWORD` | Yes | Admin login password |
| `NUXT_JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NUXT_BACKEND_URL` | Yes | Base URL of the Python AI backend |

---

## Backend

The frontend proxies code to a separate Python backend. See **[docs/backend-api.md](docs/backend-api.md)** for the full API contract, request/response schemas, and a FastAPI reference implementation.
