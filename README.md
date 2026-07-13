# Orbit Chat

Orbit Chat is a full-stack AI chat application with multi-provider model
support, real-time conversation history, image generation, file uploads, and
user authentication.

## What it supports

- streamed multi-model chat through Groq and OpenRouter;
- OpenAI and Gemini image generation;
- Clerk authentication and Convex-backed real-time history;
- image uploads to DigitalOcean Spaces;
- thread titles, sharing, dark/light themes, and locally stored provider keys.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the entity model, table
relationships, routes, controllers, services, repositories, and request flows.

## Run locally

Requirements: Node.js 18 or newer and pnpm 9.

```bash
cp .env.example .env.local
pnpm install
pnpm convex:dev
pnpm dev
```

Fill in the Clerk, Convex, Groq, and DigitalOcean Spaces variables from
`.env.example`. `OPENROUTER_API_KEY` is an optional server fallback; users can
also supply provider keys from Settings.

## Checks

```bash
pnpm check-types
pnpm lint
pnpm build
```

## Project layout

```text
app/                 Next.js pages, UI, and thin HTTP route mappings
server/chat/         Complete-chat controller, use case, repository, providers
server/attachments/  Upload controller and image-upload use case
server/threads/      Thread-title controller, use case, repository, generator
server/infrastructure/
                     External technical adapters
convex/              Schema, real-time queries, mutations, and Clerk webhook
public/              Static visual assets
docs/                Architecture and interview documentation
```

This repository is an independent application and can be run or deployed on
its own.
