This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy to Cloudflare Pages

This project includes a workflow and configuration for deploying the static output to Cloudflare Pages. The project build produces static files at `.vercel/output/static` using `@cloudflare/next-on-pages`.

- Add a repository secret named `CF_API_TOKEN` in GitHub with a Cloudflare API token that has Pages write permissions.
- The included GitHub Actions workflow at `.github/workflows/deploy-pages.yml` builds the site and runs `wrangler pages deploy` when commits are pushed to `main`.

To build locally and deploy from your machine, run:

```bash
npm ci
npm run build
# then deploy using wrangler (requires CF_API_TOKEN env var)
CF_API_TOKEN=your_token npx wrangler pages deploy .vercel/output/static --branch main --project-name artisans-frontend
```

If you prefer to use `wrangler deploy` directly, pass the assets flag:

```bash
npx wrangler deploy --assets=.vercel/output/static
```

Notes:
- Environment variables intended for the client are configured in `wrangler.toml` under the `[vars]` table. For production secrets, use Cloudflare Pages environment variables or GitHub secrets instead of committing them to the repository.
- The `wrangler.toml` in the repository sets `compatibility_date` and an `[assets]` directory so Pages deployment can find the build output.
