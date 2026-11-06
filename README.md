# Dolmo

[Run Locally](#run-locally) · [Using Dolmo](#using-dolmo) · [How It Works](#how-it-works) ·
[Configuration](#configuration) · [Authentication Setup](#authentication-setup) ·
[Coolify Deployment](#coolify-deployment) · [Development](#development)

Dolmo is a live voice interpreter for people who don't share a language. Put one device on the
table, pick the languages being spoken, and press Start. Whenever someone finishes speaking,
Dolmo says the translation out loud in every other language, then listens again. It works with
any number of people and languages; the 32 languages of ElevenLabs Flash v2.5 are available.

Dolmo also understands when a question is meant for it rather than for the others. "What did he
say again?" replays the last translation in the asker's language instead of translating the
question to everyone.

This is a demo: the interface is minimal, and the conversation lives only in the open browser
tab.

## Run Locally

You need Node 22.17 or newer, pnpm, Podman, an Anthropic API key, an ElevenLabs API key with
Speech to Text and Text to Speech access, and an OIDC client for sign-in (see
[Authentication Setup](#authentication-setup)).

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create `.env` from `.env.example` and fill in every value (see [Configuration](#configuration)).
   Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`.

3. Start PostgreSQL (it stores sign-in sessions) and apply the migrations:

   ```bash
   podman run \
     --name postgres-sveltekit \
     --env POSTGRES_PASSWORD=postgres \
     --publish 5432:5432 \
     --volume postgres-sveltekit-data:/var/lib/postgresql/data \
     --detach \
     postgres:18-alpine
   pnpm drizzle-kit migrate
   ```

   It matches `DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"`. Later, start
   the existing container with `podman start postgres-sveltekit`.

4. Start the app and open the URL Vite prints (normally `http://localhost:5173`):

   ```bash
   pnpm dev
   ```

5. Sign in, select at least two languages, press **Start** and allow microphone access. Speak,
   pause, and Dolmo answers in the other languages.

## Using Dolmo

- **Languages**: select every language spoken at the table. Translations are spoken in the
  order you selected them. Languages are locked while a conversation runs.
- **Claude model and effort**: pick Opus 5.5, Sonnet 5.5 or Haiku 5.5, and an effort from `low`
  to `max`. Changes apply from the next turn, and every turn shows how long Claude took, so you
  can compare settings. Lower effort and smaller models answer faster.
- **Taking turns**: Dolmo works like a walkie-talkie. A pause of about 0.8 seconds ends a turn,
  and the microphone is muted while Dolmo speaks, so it never translates itself. **Skip** cuts
  the current playback short; **Stop** ends listening but keeps the conversation on screen.
- **Asking Dolmo**: "Dolmo, what did he say?" or "say that again" replays the earlier
  translation, only in your language. Questions such as "what does that word mean?" are
  answered briefly in your language only. Questions addressed to another person ("what did
  _you_ say about the price?") are translated as usual.
- **Replay**: the play button next to any translation replays it.
- Background noise, coughs and lone filler words are ignored and shown as muted lines.

## How It Works

Each turn passes through three services:

1. **Listening**: the browser streams the microphone to ElevenLabs Scribe v2 Realtime, which
   detects the end of each utterance and returns its transcript. The browser connects with a
   single-use token from the server, so API keys never reach the browser.
2. **Deciding**: the server sends the utterance, the session languages and the last 30 turns to
   Claude, which returns a structured decision: `translate` (into every other language),
   `repeat` (replay an earlier turn), `clarify` (answer the asker) or `ignore`. The server
   validates the decision before the browser sees it.
3. **Speaking**: the server synthesizes each output with ElevenLabs Flash v2.5, and the browser
   plays them one after another and keeps the audio so repeats replay exactly what was said.

Where to look in the code:

- `src/lib/server/anthropic.ts`: the Claude prompt and request.
- `src/lib/server/turn-validation.ts`: the rules a decision must satisfy.
- `src/lib/translation-session.svelte.ts`: the browser-side session (microphone, queue,
  playback).
- `src/lib/translate.remote.ts` and `src/routes/api/speech/+server.ts`: the server endpoints.

Opus 5.5 and Sonnet 5.5 requests use Anthropic's server-side refusal fallback. Haiku 5.5 has
none, so a declined turn shows an error and can be repeated.

## Configuration

All variables are required. Copy `.env.example` to `.env` for local development.

| Variable             | Purpose                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`  | Anthropic API key for Claude.                                                                                                    |
| `ELEVENLABS_API_KEY` | ElevenLabs API key with Speech to Text and Text to Speech access.                                                                |
| `DATABASE_URL`       | PostgreSQL connection string for sign-in sessions.                                                                               |
| `ORIGIN`             | Public base URL of the app, e.g. `http://localhost:5173`.                                                                        |
| `BETTER_AUTH_SECRET` | High-entropy secret (at least 32 characters) that signs sessions.                                                                |
| `OIDC_DISCOVERY_URL` | Full discovery document URL, e.g. `https://auth.example.com/.well-known/openid-configuration`; the issuer URL alone is rejected. |
| `OIDC_CLIENT_ID`     | Client ID of the Dolmo OIDC client.                                                                                              |
| `OIDC_CLIENT_SECRET` | Client secret of the Dolmo OIDC client.                                                                                          |

## Authentication Setup

Dolmo shows its own login screen; **Sign in** starts an OIDC Authorization Code flow with PKCE
against the configured provider, whose access policy decides who may use Dolmo. Sessions last
seven days and are never extended, and signing out also ends the provider session.

- Public Client: Off
- Callback URL: `/api/auth/callback/oidc`
- Logout Callback URL: `/login`
- Environment variables (all required): `OIDC_DISCOVERY_URL`, `OIDC_CLIENT_ID`,
  `OIDC_CLIENT_SECRET`, plus `BETTER_AUTH_SECRET`, `ORIGIN` and `DATABASE_URL`; see
  [Configuration](#configuration).

## Coolify Deployment

- **Build Pack**: Railpack (no `railpack.json` needed; Node comes from `engines.node`, pnpm from
  `packageManager`, and Railpack runs `pnpm run build` and `pnpm run start`)
- **Base Directory**: `/`
- **Site type**: Dynamic
- **Ports Exposes**: `3000`
- **Post-Deployment Command**: `pnpm drizzle-kit migrate` (runs via `sh -c` in the app
  container)

Required environment variables. Mark every variable except `PROTOCOL_HEADER` and `HOST_HEADER`
as **Available during build**, because the build validates them:

- `ORIGIN`: `https://dolmo.kaufmann.dev`
- `DATABASE_URL`: connection string of the PostgreSQL database
- `BETTER_AUTH_SECRET`: high-entropy session secret
- `OIDC_DISCOVERY_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`: the OIDC client (see
  [Authentication Setup](#authentication-setup))
- `ANTHROPIC_API_KEY`: Anthropic API key
- `ELEVENLABS_API_KEY`: ElevenLabs API key with Speech to Text and Text to Speech access
- `PROTOCOL_HEADER`: `x-forwarded-proto` and `HOST_HEADER`: `x-forwarded-host`, so the Node
  server sees the public HTTPS URL behind Coolify's proxy

Optional: `PORT` (default `3000`; keep it in sync with Ports Exposes).

## Development

```bash
pnpm dev          # development server
pnpm check        # type check (run pnpm build or pnpm dev once on a fresh clone first)
pnpm lint         # Prettier and ESLint
pnpm format       # format all files
pnpm test         # unit tests (Vitest)
pnpm build        # production build
pnpm preview      # preview the production build
pnpm start        # serve the production build (node build; reads env vars from the environment, expects HTTPS in front)
```

Paraglide generates `src/lib/paraglide` during `pnpm dev` and `pnpm build`, which is why
`pnpm check` needs one of them to run first. After changing the Better Auth configuration, run
`pnpm auth:schema` and `pnpm drizzle-kit generate`, then `pnpm drizzle-kit migrate`.
