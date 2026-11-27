# Community service

The playground Community window uses this Next.js API for the guestbook,
and DeepSeek chat. Visitors submit a display name, private email address, and
message; there is no account or GitHub login. The service keeps existing
guestbook entries and reads their display names from the legacy `users` table.
Email addresses are stored in the database but are never returned by the
public guestbook API.

## Local development

1. Copy `.env.example` to `.env.local` in this directory and set
   `DATABASE_URL` and `DEEPSEEK_API_KEY`. Do not commit this file.
2. Before deploying the new service, run
   [`migrations/20261127_anonymous_guestbook.sql`](./migrations/20261127_anonymous_guestbook.sql)
   once against the existing database. It makes the legacy `user_id` nullable
   and adds `author_name` and `email` columns without removing old entries.
3. Run `pnpm community:dev` and `pnpm play` from the workspace root. The Vite
   server proxies `/api/community` to port 3001; local requests from
   `http://localhost:5173` are allowed by default.

## Vercel

The Vercel Playground project can keep its current root directory. The
repository-root and `packages/playground` deployments both include the same
API proxy.

1. Set the service project's root directory to `packages/community-service`.
   Set `DATABASE_URL`, `DEEPSEEK_API_KEY`, and `COMMUNITY_ALLOWED_ORIGINS` in
   its Production environment. Include both public origins as a comma-separated
   list:
   `https://murasaki-playground.vercel.app,https://zixing8284.github.io`.
2. In the Playground Vercel project, set `COMMUNITY_SERVICE_ORIGIN` to the
   Community service's HTTPS origin. It proxies same-origin requests from the
   Playground to that service.
3. Run the database migration above before deploying the updated service.
   Redeploy both projects after changing environment variables or code.

## GitHub Pages and CORS

GitHub Pages is static, but its browser app can call the Community API directly.
The Pages build sets `VITE_COMMUNITY_API_ORIGIN` to the Community service
origin; the service's allowlist must include `https://zixing8284.github.io`.
The Vercel Playground uses its same-origin proxy instead. Neither deployment
needs OAuth cookies for guestbook posting.

Names and email addresses are user-submitted and not verified; email remains
private in the API response but is stored on the server. Origin checks and CORS
are browser controls, not rate limiting; configure Vercel firewall/rate limits
and a DeepSeek spending limit. Never put database or DeepSeek secrets in `VITE_`
variables.
