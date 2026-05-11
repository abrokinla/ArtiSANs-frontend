Cloudflare Pages setup for ArtiSANs frontend
===========================================

Follow these steps to use Cloudflare Pages (not Workers) to build and serve the frontend:

- Connect the repository to Cloudflare Pages via the Cloudflare dashboard (GitHub integration).
  - Select the `main` branch as the production branch.

- Build settings:
  - Build command: `npm ci && npm run build`
  - Build output directory: `.vercel/output/static`
  - (Optional) Set Node version to `22` if available in the Pages build settings.

- Environment variables (set under Pages > Settings > Environment variables):
  - `NEXT_PUBLIC_API_URL` = `https://artisans-ojzr.onrender.com/api`
  - `NEXT_PUBLIC_WS_URL` = `https://artisans-ojzr.onrender.com`

- Files already prepared in this repo:
  - `wrangler.toml` includes `pages_build_output_dir = ".vercel/output/static"` and `name = "artisans-ng"` to match the Pages project name.
  - `package.json` has a `deploy` script that runs:

    `wrangler pages deploy .vercel/output/static --project-name artisans-ng`

- Local deploy (optional):
  1. `npm ci`
  2. `npm run build`
  3. `npm run deploy`

- Notes:
  - We disabled the GitHub Action that also ran `wrangler pages deploy` to prevent duplicate deploys. If you prefer CI-based deploys instead of Pages' Git integration, re-enable the workflow or change it to `workflow_dispatch`.
  - If the Cloudflare dashboard reports a different project name, update `wrangler.toml` and the `--project-name` argument accordingly.

If you want, I can update the workflow to `workflow_dispatch` (manual) instead of fully disabling it, or re-enable automatic GH Action deploys and remove the Pages Git integration—tell me which you prefer.
