# Project State Rules

## Writing project.md

After intake is complete, write `.am/project.md` with all sections filled from intake answers. No blank sections unless explicitly "not applicable".

Template:

```
# Project: <name>

## Overview
<one-paragraph description from question 2>

## Stack
- Language: <answer from question 5>
- Frontend: <answer from question 6>
- Backend: <answer from question 7>
- Database: <answer from question 8>
- Deployment: <answer from question 12>

## Features
- Authentication: <answer from question 9>
- Real-time: <answer from question 10>
- File uploads: <answer from question 11>
- Third-party integrations: <answer from question 14>

## Settings
- learning_layer: disabled

## Decisions Made
<chronological list of architectural decisions with rationale from intake>

## Current State
- Modes completed: []
- Modes in progress: []
- Modes remaining: [<modes from approved build order>]
- Last active mode: start
- Last session: <current timestamp>

## Build Order
1. start
2. <second mode>
3. <third mode>
...

## Known Issues / Open Questions
<anything unresolved>

## Mode Reference
| Mode | Color | Focus |
|---|---|---|
| start | #F59E0B | Intake, planning, orchestration, handoff |
| design | #8B5CF6 | Design system, tokens, visual direction |
| frontend | #3B82F6 | UI components, routing, state, accessibility |
| backend | #10B981 | API, business logic, data layer |
| database | #EC4899 | Schema, migrations, queries, ORM config |
| cleanup | #6B7280 | Refactoring, tech debt, consistency |
| security | #EF4444 | Audit, hardening, compliance |
| testing | #A855F7 | Unit, integration, E2E, accessibility |
| devops | #06B6D4 | CI/CD, deployment, infrastructure |
| documentation | #F97316 | Architecture docs, API docs, onboarding |
```

## Updating Decisions Made

After each session, append decisions made (architecture, schema, testing strategy, etc.) to "Decisions Made" in `.am/project.md`. Include what was decided, rationale, and alternatives considered.
