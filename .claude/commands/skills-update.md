# Update Agent Skills

Force-update all agent skills to their latest versions.

`npx skills update` sometimes reports "already up to date" even when the official skills have changed. Re-installing with `npx skills add` overwrites the local files with the latest versions.

Run:

```bash
pnpm skills:update
```
