# thomasisalwayslate — research

`/` is the original interactive ID card, with its research link.
`/research` holds the research articles and interactive demonstrations.
The former project collection, product pages and product artwork are retained
locally under ignored `archive/privacy-retired-2026-10-19/` and excluded from publication.
The retired `/home` route leads to `/research`.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run check
```

## Deploy

Pushing to `main` builds and deploys via `.github/workflows/deploy.yml` to GitHub
Pages. The workflow builds the static site and verifies the public research page after
deployment.

## Analytics

Cloudflare Web Analytics uses the public site identifier in
`PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN`. Set it as a GitHub Actions repository
variable for the Pages build; `.env.example` shows the local configuration.
Without a token, no analytics script is included. Tracking only runs on the
canonical production hostname and respects Do Not Track. Local previews do not
send visits. The shared component covers the research pages and full-screen graph.
