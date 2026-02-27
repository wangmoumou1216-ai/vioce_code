# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build (also runs tsc)
npm run lint     # ESLint
npx tsc --noEmit # Type-check only (no emit)
```

No test suite is configured yet.

## Architecture

This is a single-page Next.js 16 App Router app for voice cloning and TTS via Fish Audio API. All data is stored locally — no external DB, no auth.

### Data flow for TTS generation

1. User selects a voice from the library → `voice_id` passed to `POST /api/tts`
2. Route reads the voice's `audio_path` from SQLite → loads file from `public/uploads/` → base64-encodes it
3. Sends `{ text, references: [{ audio: base64, text: transcript }] }` to `https://api.fish.audio/v1/tts` with `model` header
4. Binary response saved to `public/generated/` → path stored in `generations` table → URL returned to client
5. Client renders `<AudioPlayer>` with the returned URL

### Layer responsibilities

- **`lib/db.ts`** — Single SQLite connection (WAL mode, lazy init). Schema auto-created on first access. All DB access goes through the typed helpers exported here; never use `better-sqlite3` directly in routes.
- **`lib/fish-audio.ts`** — Thin fetch wrapper for `POST /v1/tts`. Supports instant clone via `references[]` array or saved-model via `reference_id`. The `model` value is sent as a request header, not in the body.
- **`lib/storage.ts`** — All file I/O. Paths stored in DB are relative to `public/` (e.g. `uploads/abc.mp3`), so they're directly served as static assets at `/<path>`.
- **`app/api/`** — Route handlers are thin: validate input → call lib functions → return JSON. No business logic lives here.
- **`components/`** — All client components (`'use client'`). State lives in `page.tsx` (`selectedVoice`, `refreshTrigger`); child components receive it as props. `refreshTrigger` is an incrementing integer used to re-fetch voices after mutations.

### SQLite schema

```sql
voices      (id, name, audio_path, transcript, created_at)
generations (id, voice_id, voice_name, text, audio_path, model, created_at)
settings    (key, value)  -- stores fish_api_key
```

Database file: `data/app.db` (gitignored). Created automatically on first run.

### Key constraints

- The Fish Audio API key is stored in the `settings` table under `fish_api_key`. The settings API returns a masked value (`***xxxx`) on GET — never the real key.
- `public/uploads/` and `public/generated/` are gitignored. Deleting a voice also deletes its audio file via `deleteStoredFile`.
- No streaming — TTS responses are buffered fully before saving and returning the URL.
