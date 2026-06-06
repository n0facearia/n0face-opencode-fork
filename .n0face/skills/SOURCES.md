# Skill Sources

Fetched: 2026-06-06

## Source 1 — Impeccable (design + frontend)
- **Source**: https://github.com/pbakaus/impeccable
- **Location**: `.n0face/skills/impeccable/`
- **Files**: SKILL.md, 27 reference .md files, 37 scripts, agents config
- **Modes**: Design, frontend UI, UX review
- **Update**: `git pull` from upstream

## Source 2 — Anthropic (frontend, testing)
- **Source**: `anthropics/skills` via `npx skills add`
- **Locations**:
  - `agent-skills/frontend-design/` — frontend design skill
  - `testing/webapp-testing/` — webapp testing skill
- **Modes**: Frontend engineering, testing
- **Update**: `skills update anthropics/skills`

## Source 3 — Vercel Labs (frontend, backend)
- **Source**: `vercel-labs/agent-skills` and `vercel-labs/next-skills` via `npx skills add`
- **Locations**:
  - `vercel-labs/react-best-practices/` — React best practices
  - `vercel-labs/next-best-practices/` — Next.js best practices
  - `vercel-labs/web-design-guidelines/` — Web design guidelines
- **Modes**: React, Next.js, web design
- **Update**: `skills update vercel-labs/agent-skills` / `skills update vercel-labs/next-skills`

## Source 4 — Google Labs / Stitch (design, frontend)
- **Source**: `google-labs-code/stitch-skills` via `npx skills add`
- **Locations**:
  - `google-labs/design-md/` — Design docs skill
  - `google-labs/shadcn-ui/` — shadcn/ui skill
- **Modes**: Design systems, component libraries
- **Update**: `skills update google-labs-code/stitch-skills`

## Source 5 — Trail of Bits (security)
- **Source**: `trailofbits/skills` via `npx skills add`
- **Locations**:
  - `trailofbits/ask-questions-if-underspecified/` — Requirements clarification
  - `trailofbits/insecure-defaults/` — Insecure defaults detection
- **Requested but unavailable in registry**: `static-analysis`, `differential-review`, `property-based-testing`
- **Modes**: Security review, code audit
- **Update**: `skills update trailofbits/skills`

## Source 6 — OpenAI (security, frontend)
- **Source**: `openai/skills` via `npx skills add`
- **Locations**:
  - `openai/security-best-practices/` — Security best practices
- **Requested but unavailable in registry**: `security-threat-model`, `frontend-skill`
- **Modes**: Security hardening
- **Update**: `skills update openai/skills`

## Source 7 — Supabase (database)
- **Source**: `supabase/agent-skills` via `npx skills add`
- **Locations**:
  - `supabase/postgres-best-practices/` — Postgres best practices
- **Modes**: Database design, Postgres, Supabase
- **Update**: `skills update supabase/agent-skills`

## Source 8 — Addy Osmany / wshobson (general engineering)
- **Sources**:
  - `addyosmani/agent-skills` (23 skills) via `npx skills add` → `agent-skills/`
  - `wshobson-agents` (pre-existing at `.am/skills/wshobson-agents/`)
- **Modes**: Code review, planning, frontend, testing, CI/CD, documentation, etc.
- **Update**: `skills update addyosmani/agent-skills`

## Notes
- 35 SKILL.md files across all sources
- 3 requested skills were unavailable: `trailofbits/static-analysis`, `trailofbits/differential-review`, `trailofbits/property-based-testing`, `openai/security-threat-model`, `openai/frontend-skill`
- wshobson-agents exist at `.am/skills/wshobson-agents/` (pre-existing, not re-fetched)
