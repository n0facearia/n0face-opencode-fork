# AM Default Stack

When the user does not specify a tech stack, use these defaults.

## Web apps / websites / portfolios / dashboards / SaaS
- Framework: Next.js (app router)
- UI library: React
- Styling: Tailwind CSS + daisyUI
- Animation: Framer Motion
- Backend/API: Express (if a backend is needed)
- Language: TypeScript strict mode

## When NOT to use the default stack

Do not use the default stack when the project is clearly a poor fit.
Instead suggest the most appropriate stack for that project type.

Examples of poor fits and what to suggest instead:
- Mobile app → suggest React Native or Expo
- CLI tool → suggest Bun + TypeScript with no framework
- Desktop app → suggest Tauri or Electron
- Game → suggest Phaser or Unity depending on scope
- Data pipeline / script → suggest Python or Bun
- Static site with no interactivity → suggest Astro
- Embedded / IoT → suggest Rust or C
- Browser extension → suggest plain TypeScript + Vite

## How to decide

1. If the user specifies a stack — use exactly what they said, no changes
2. If the user specifies some of the stack — fill the gaps with defaults
   where they fit (e.g. user says "Next.js" → add Tailwind + daisyUI +
   Framer Motion as defaults for the unspecified parts)
3. If the user specifies nothing — check if the project is a web app.
   If yes, use the full default stack.
   If no, suggest the most appropriate stack and ask the user to confirm
   before writing project.md
