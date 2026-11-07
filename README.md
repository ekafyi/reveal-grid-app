# reveal-grid-app

Vite + React + TypeScript starter with an agent-first UI component workflow.

**Stack:** Vite 8 · React 19 · TypeScript 7 · TanStack Router (client-side) ·
Storybook 10 · Vitest 5 + React Testing Library · Biome 2 · lucide-react

## Getting started

```sh
npm install
npx playwright install chromium   # once, for story tests
npm run dev
```

## Commands

| Command               | What it does                              |
| --------------------- | ----------------------------------------- |
| `npm run dev`         | Vite dev server                           |
| `npm test`            | Unit tests (jsdom, RTL)                   |
| `npm run test-storybook` | Story tests (real Chromium)            |
| `npm run lint`        | Biome lint + format check                 |
| `npm run format`      | Biome format (write)                      |
| `npm run build`       | Type-check + production build             |
| `npm run storybook`   | Storybook on :6006                        |

## Guides

- [`guides/guide-initial-setup.md`](guides/guide-initial-setup.md) — how this repo is wired
- [`guides/guide-example-ui-component.md`](guides/guide-example-ui-component.md) — the agent workflow for building UI components (scroll-driven animation example; `src/components/RevealGrid/` is the empty target dir)
