# Community service

The playground Community window uses this Next.js API for the guestbook,
GitHub login and DeepSeek chat. It reuses hoshihoshi's Neon `users`,
Auth.js adapter and `guest_book` tables; existing messages are not migrated
or modified. Credentials stay on the server.

## Local development

1. Copy `.env.example` to `.env.local` in this directory. Set `DATABASE_URL`,
   `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, and `DEEPSEEK_API_KEY`
   to the existing service values. Do not commit this file.
2. Register `http://localhost:5173/api/community/auth/callback/github` as the
   callback of a GitHub OAuth app, and use its client ID and secret. A separate
   development OAuth app avoids changing the production callback.
3. Run `pnpm community:dev` and `pnpm play` from the workspace root. The Vite
   server proxies `/api/community` to port 3001. If Vite uses another port,
   update `AUTH_URL` and the GitHub OAuth callback to match it.

## Vercel

Create two Vercel projects from this repository:

1. Set the service project's root directory to `packages/community-service`.
   Set the five secret variables above and set `AUTH_URL` to
   `https://<playground-domain>/api/community/auth`. Deploy the service and
   note its stable production domain.
2. Set the playground project's root directory to `packages/playground`.
   Configure its build to build the UI library before the playground, for
   example `pnpm --filter @murasaki-io/react98 build && pnpm build`, and set
   `COMMUNITY_SERVICE_ORIGIN` to the service's HTTPS origin. Its Vercel
   function and rewrite forward `/api/community/*` to that service, preserving
   streaming and authentication cookies.
3. Set the GitHub OAuth app callback to
   `https://<playground-domain>/api/community/auth/callback/github`. Redeploy
   after changing configuration, then verify sign-in, historical messages,
   posting and a streamed chatbot reply.

Use the same canonical playground domain for `AUTH_URL` and GitHub's callback.
GitHub Pages is static and cannot run the proxy: the Community window needs a
same-origin proxy on that host or a Vercel-hosted playground. The Vite proxy
only applies to development, not `vite preview`.

The GitHub Pages build sets `VITE_COMMUNITY_PLAYGROUND_URL` to the Vercel
playground, so its Community window links there instead of calling the API.
Update the URL in the Pages workflow if the Vercel domain changes.

The chatbot is publicly accessible, like the original. Origin checks are not
rate limiting and can be forged by non-browser clients. Before exposing it,
configure Vercel firewall/rate limits and a DeepSeek spending limit. Restrict
direct access to the service as appropriate for the deployment. Never put
database, OAuth or DeepSeek secrets in `VITE_` variables.
