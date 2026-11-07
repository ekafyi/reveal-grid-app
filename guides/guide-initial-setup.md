# Initial Setup — reveal-grid-app

One-time steps to get a fresh clone ready for the UI component workflow.
(How the repo was scaffolded: Vite `react-ts` template + Storybook init;
stack table below for reference.)

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

## 1. Install dependencies

```sh
npm install
npx playwright install chromium   # browser for story tests
```

## 2. Register tools with your coding agent (harness)

Required by the agent workflow (`prompts.md`); these are not npm dependencies:

- [ ] chrome-devtools MCP (e.g. `npx chrome-devtools-mcp@latest --headless`)
- [ ] firefox-devtools MCP (a local Firefox must also be installed)
- [ ] Storybook MCP (optional; endpoint `http://localhost:6006/mcp`, only
      while `npm run storybook` runs)
- [ ] agent-browser (`npm i -g agent-browser && agent-browser install`)

## 3. Activate the workflow rule

- [ ] Paste block 1 of [`prompts.md`](prompts.md) into `AGENTS.md` (repo root)
      and commit it

## 4. Sanity-check

```sh
npm run lint && npm test && npm run test-storybook && npm run build
```

All green → you're ready to run the component workflow
(`guide-example-ui-component.md`).

## Commands (reference)

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

## Layout (reference)

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
  main.ts             # stories glob, addons: vitest, a11y, docs, mcp
  preview.tsx         # a11y test mode: 'todo'
guides/               # this documentation
```

## Notes (reference)

- **Two Vitest projects** live in `vite.config.ts`: `unit` (jsdom) and
  `storybook` (browser mode via Playwright Chromium).
- **Storybook MCP**: enabled via `@storybook/addon-mcp` in `.storybook/main.ts`.
- **Biome scope**: `biome.json` lints/formats `src/` only and excludes
  `*.stories.*` files. Config files, `.storybook/`, and assets are not linted.
- **Manual routing**: routes are composed in `src/routeTree.tsx`
  (createRootRoute/createRoute) — deliberately no file-based route generation.
- `test-storybook` passes with no test files (`--passWithNoTests`) until
  stories exist.
