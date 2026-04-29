---
agent: agent
description: Force-update all agent skills to their latest versions
---

Run the following command to force-update agent skills (bypasses the broken `npx skills update` detection):

```bash
npx skills add vercel-labs/agent-skills
```

Note: `npx skills update` sometimes reports "already up to date" even when the official skills have changed. Re-installing with `npx skills add` overwrites the local files with the latest versions.
