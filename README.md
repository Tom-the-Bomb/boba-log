# [Boba Log](https://boba.tomthebomb)

Boba Log is a Next.js app for tracking tea shop visits and drink totals, deployed to Cloudflare Workers.

## Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Runtime and Deploy:** Cloudflare Workers (OpenNext)
- **Database:** Cloudflare D1 (SQLite)
- **Object Storage:** Cloudflare R2
- **Package Manager:** Bun
- **Auth:** JWT (PBKDF2 algorithm) + localStorage
- **Localization:** Chinese (simplified) + English with i18next and [simplelocalize.io](https://simplelocalize.io)

### Libraries

- **Charts:** `react-chartjs-2` (with `chart.js`) for dashboard visualizations
- **Icons:** `lucide-react` for UI icons

## Setup

### Prerequisites

- Bun
- Wrangler CLI

### Install

```bash
bun install
```

### Environment

Create a `.env` file in the project root:

```env
JWT_SECRET=your-jwt-secret
```

### Local database

Initialize the local D1 database for `bun dev`:

```bash
wrangler d1 execute boba-log --local --file=schema.sql
```

### SimpleLocalize (i18n)

Translation files live in `i18n/messages/`. The `simplelocalize.yml` config is gitignored since it contains an API key. To set it up:

1. Install the [SimpleLocalize CLI](https://simplelocalize.io/docs/cli/get-started/)
2. Create a `simplelocalize.yml` with your API key and the upload/download paths pointing to `./i18n/messages/{ns}.json` (use `multi-language-json` format)
3. Use the i18n scripts:

```bash
bun run i18n:upload          # dry run upload
bun run i18n:upload:confirm  # upload to SimpleLocalize
bun run i18n:download        # download translations
```

## Development

### `bun dev`

Runs the Next.js dev server with hot reload and local Cloudflare bindings (D1, R2). This is the recommended way to develop, bindings are local emulations so changes are fast and don't touch production data.

```bash
bun dev
```

### `bun preview`

Builds the full Cloudflare Workers bundle and runs it locally via wrangler. Uses **remote** D1 and R2 bindings, so it hits your actual production data. Useful for final verification before deploying.

```bash
bun preview
```

## Database (D1)

This project uses the `D1` D1 binding from `wrangler.jsonc` with database name `boba-log`.

### Create database

Create the D1 database:

```bash
bun wrangler d1 create boba-log
```

Apply schema:

```bash
bun wrangler d1 execute boba-log --remote --file=schema.sql
```

### Schema

<!-- markdownlint-disable MD033 -->
<p align="center">
  <img
    src="https://raw.githubusercontent.com/Tom-the-Bomb/boba-log/refs/heads/main/schema-mermaid.png"
    alt="schema"
    width="500"
  />
</p>
<!-- markdownlint-enable MD033 -->

## Object Storage (R2)

This project uses the `R2` R2 binding from `wrangler.jsonc` with bucket name `boba-log` for storing shop avatar images.

### Create bucket

Create the R2 bucket:

```bash
bun wrangler r2 bucket create boba-log
```

Avatars are uploaded as `{shopId}.webp` and served via the `/api/avatars/[shopId]` API route, which reads directly from the R2 binding.

## Default Shop Avatars

Normalize all images in `public/default-shops` to square `256x256` WebP assets:

```bash
bun run assets:process
```

Supported source formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.tiff`.
Non-WebP source files are replaced with generated `.webp` outputs.

## Deployment

```bash
bun run deploy
```

## Scripts

- `bun run dev` — Next.js dev server with local Cloudflare bindings
- `bun run build` — Production build
- `bun run preview` — OpenNext Cloudflare preview with remote bindings
- `bun run deploy` — OpenNext Cloudflare deploy
- `bun run assets:process` — Normalize `public/default-shops` images to `256x256` WebP
- `bun run i18n:upload` — Dry run upload translations to SimpleLocalize
- `bun run i18n:upload:confirm` — Upload translations to SimpleLocalize
- `bun run i18n:download` — Download translations from SimpleLocalize
- `bun run lint` — ESLint + Prettier check + TypeScript no-emit
- `bun run lint:fix` — ESLint fix + Prettier write + TypeScript no-emit
- `bun run format` — Prettier write
- `bun run format:check` — Prettier check
