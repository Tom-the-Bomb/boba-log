# Boba Tracker

Boba Tracker

## Cloudflare Workers deploy

- Run `bun run cf:deploy` to build with OpenNext and deploy with Wrangler.
- `wrangler deploy` by itself will fail if `.open-next/worker.js` has not been generated.

### Windows note

- OpenNext may fail on Windows with `EPERM ... symlink` during `cf:build`.
- Recommended: run deploy from WSL or CI/Linux environment.
- If deploying locally on Windows, ensure Developer Mode is enabled or run with permissions that allow symlink creation.
