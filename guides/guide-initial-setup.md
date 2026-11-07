# Initial Setup — reveal-grid-app

This documents how this repo was scaffolded, so you can reproduce or extend it.

## Stack

| Concern        | Tool                                        |
| -------------- | ------------------------------------------- |
| Build/dev      | Vite 8 + React 19 + TypeScript 7            |
| Routing        | TanStack Router (client-side, manual routes) |
| Component lab  | Storybook 10 (`@storybook/react-vite`)      |
| Unit tests     | Vitest 5 + React Testing Library (jsdom)    |
| Story tests    | Vitest browser mode (Playwright/Chromium)   |
| Lint + format  | Biome 2                                     |
| Icons          | lucide-react                                |

## Commands

```sh
npm run dev             # Vite dev server
npm run test            # unit tests (jsdom, project "unit")
npm run test-storybook  # story tests (real Chromium, project "storybook")
npm run lint            # biome check .
npm run format          # biome format --write .
npm run build           # tsc -b && vite build
npm run storybook       # Storybook dev server on :6006
npm run build-storybook # static build of Storybook
```

## Layout

```
src/
  main.tsx            # entry: router + RouterProvider
  routeTree.tsx       # manual route tree (client-side only, no route file generation)
  Home.tsx            # index route component
  Home.test.tsx       # unit test example (RTL)
  index.css
  test/setup.ts       # vitest setup (jest-dom matchers)
  components/
    RevealGrid/       # empty — created for the example component
.storybook/
  main.ts             # stories glob, addons: vitest, a11y, docs
  preview.tsx         # a11y test mode: 'todo'
guides/               # this documentation
```

## Notes

- **Two Vitest projects** live in `vite.config.ts`: `unit` (jsdom) and `storybook`
  (browser mode via Playwright Chromium). Install the browser once with
  `npx playwright install chromium`.
- **Storybook MCP**: the addon `@storybook/addon-mcp` is installed; run
  `npm run storybook` and the MCP server is at `http://localhost:6006/mcp`.
  Register it in your agent harness if you want docs/story/test tools.
- **Manual routing**: routes are composed in `src/routeTree.tsx`
  (createRootRoute/createRoute) — deliberately no file-based route generation.
- `test-storybook` currently passes with no test files (`--passWithNoTests`)
  until stories exist.
