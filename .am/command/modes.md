---
description: Show all available AM modes and activate one.
---

Show all available AM modes and activate one.

When /modes is run:

1. Display this exact list:

   ┌─ AM Modes ─────────────────────────────────────────────┐
   │                                                          │
   │   1. manager       Project intake and build planning     │
   │   2. design        Visual identity and design system     │
   │   3. frontend      UI implementation                     │
   │   4. backend       API, services, middleware             │
   │   5. database      Schema, migrations, ORM               │
   │   6. cleanup       Dead code, lint, unused deps          │
   │   7. security      Vulnerability scanning                │
   │   8. testing       Unit, integration, component tests    │
   │   9. devops        CI/CD, Docker, deployment             │
   │  10. documentation Final docs and README                 │
   │  11. chat          Questions and answers only            │
   │                                                          │
   │  Current mode: [read from project.md last_active_mode]   │
   │  Type a number or name to switch.                        │
   └──────────────────────────────────────────────────────────┘

2. Wait for the developer to type a number (1–11) or a mode name.

3. When they respond, activate that mode:
   - Read the corresponding .n0face/agent/<mode>.md file
   - Announce: 'Switched to [mode name] mode.'
   - Then follow that mode's STARTUP BEHAVIOR

4. If the developer types something that does not match any mode,
   display the list again with a note:
   'That did not match a mode. Type a number 1–11 or a mode name.'

5. If project.md does not have a last_active_mode value yet,
   show 'Current mode: none' in the box.
