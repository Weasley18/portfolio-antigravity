# Portfolio Antigravity

A personal portfolio website built with React and Vite.

## Local Development

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production bundle: `npm run build`
- Preview production build: `npm run preview`
- Run lint checks: `npm run lint`

## CI/CD

The project uses GitHub Actions workflow at `.github/workflows/ci-cd.yml`.

- `pull_request` to `main`: runs CI checks (`npm ci`, `npm run lint`, `npm run build`)
- `push` to `main`: runs CI checks, then deploys to GitHub Pages if checks pass
- Deployment target is the Vite output directory: `dist`
- Custom domain is preserved through `public/CNAME`

## Required GitHub Settings

- In repository settings, set Pages source to `GitHub Actions`

## Troubleshooting

- If deploy does not start, verify the push was to `main` (deploy is gated to that branch)
- If CI fails on install, rerun after lockfile sync (`package-lock.json` committed)
- If Pages deployment fails, check workflow permissions include `pages: write` and `id-token: write`
- If custom domain is missing, confirm `public/CNAME` exists and contains your domain
