# Example: UI Component Workflow — `RevealGrid` (scroll-driven animation)

This is the agreed workflow for building/updating UI components with a coding agent.
Example case: a card grid that reveals cards as they scroll into view
(`animation-timeline: view()` + `animation-range`).
Spec: https://developer.chrome.com/docs/css-ui/scroll-driven-animations

Props: `cards` (title/body/image), `direction` (`up | left | fade`),
`range` (`early | default | late`), `stagger` (number).

MCP tools referenced: chrome-devtools MCP, firefox-devtools MCP, agent-browser.
Storybook MCP only where noted. The component dir `src/components/RevealGrid/`
exists and is empty — the agent creates everything in it.

---

## (I) INITIAL SETUP — one-time per project (already done in this repo)

1. **DEV** installs Storybook: `npx storybook@latest init` (or agent-driven:
   "Set up Storybook for me with npm create storybook@latest ...")
2. **DEV/AGENT** enables Vitest addon: `npx storybook add @storybook/addon-vitest`;
   adds `test-storybook` script (CI runs it in a Playwright-capable environment)
3. **DEV/AGENT** installs MCP addon: `npx storybook add @storybook/addon-mcp`
   (optional; MCP endpoint at `http://localhost:6006/mcp` when Storybook runs)
4. **DEV** registers MCP servers in the coding harness: Storybook (optional),
   chrome-devtools (`npx chrome-devtools-mcp@latest --headless`),
   firefox-devtools; macOS runner if Safari/WebKit needed
5. **DEV** defines pass/fail gates + retry budget (e.g. "all stories green;
   timeline assertions pass; no long tasks > 50ms during scroll; max 3 retries
   then halt + report")
6. **DEV** sets up dev server with seeded data + test-auth; auto-start script

## (II) NEW UI COMPONENT

**Step 1 — component + unit tests**
- **DEV** provides instructions ("RevealGrid, scroll-driven reveal via `view()`,
  props: cards/direction/range/stagger ...")
- **AGENT** writes component + Vitest/Testing Library unit tests in
  `src/components/RevealGrid/`; runs quality gate (`npm run lint`, `npm test`) → green
- *Why:* fast, deterministic feedback on prop logic and render output; catches
  structural bugs before any browser is involved

**Step 2 — stories**
- **AGENT** writes `RevealGrid.stories.tsx`: `direction` × `range` matrix,
  `stagger` variants, scroll-container wrapper story (so `view()` binds to a
  scroller), edges (0/1/50 cards, reduced motion)
- Copy conventions from existing `.stories.tsx` files in the repo (read them).
  In this repo there are none yet — so use Storybook MCP
  `get-storybook-story-instructions` (run `npm run storybook` first), or match
  the style of `src/Home.test.tsx` + CSF 3 (`satisfies Meta<...>`, co-located file)
- **Storybook MCP also if:** components come from an external published design
  system (`docs-show` for real props)
- *Why:* every story is automatically a render test (Vitest addon) — prop-matrix
  breadth nearly free; stories double as living docs

**Step 3 — interaction test in real browser**
- **AGENT** adds one play function pinning the core invariant: scroll the
  wrapper → animation progress is scroll-coupled, not time-driven; include an
  a11y check
- **AGENT** runs `npm run test-storybook` (real Chromium) → green; CI re-runs it forever
- *Why:* the core invariant pinned as a permanent, committed regression test —
  survives this PR, protects every future one

**Step 4 — real-app verification (chrome-devtools MCP)**
- **AGENT** mounts RevealGrid on a route (e.g. `/gallery` in `src/routeTree.tsx`),
  starts dev server (`npm run dev`), then via MCP:
  `navigate_page` → `take_snapshot` → `evaluate_script` scroll-stop assertions →
  `take_screenshot` → `resize_page` (mobile) → `emulate` reduced motion → fix + re-run
- *Why:* page-level scroll with real data, layout, and viewport — not
  reproducible in Storybook's isolated iframe

**Step 5 — performance gate (chrome-devtools MCP)**
- **AGENT**: `performance_start_trace` → scripted scrolls → `performance_stop_trace`
  → assert compositor-driven, no long tasks > threshold
- *Why:* DevTools trace insight exists nowhere else in the pipeline

**Step 6 — cross-engine (firefox-devtools MCP; Safari if macOS runner)**
- **AGENT** reruns core assertions + screenshots per engine → fix CSS fallbacks → re-verify
- *Why:* engine truth — catches parsing/fallback differences Chromium silently forgives

**Step 7 — visual baseline / regression (agent-browser)**
- **Condition: NEW component** — **AGENT** scripts the journey (`agent-browser open <url>` → scroll stops →
  `agent-browser screenshot ...`) and commits captures as golden baselines in
  `baseline/RevealGrid/` (diffs land in `__diffs__/`, which is gitignored)
  - *Why:* nothing to regress against yet — this PR records what "correct" looks like
- **Condition: UPDATE existing component** — **AGENT** runs the same journey →
  `agent-browser diff` vs committed baselines; unexpected drift fails the gate;
  intended changes re-record the baseline in the same PR
  - *Why:* nothing else catches visual regression — chrome-devtools MCP takes
    screenshots but has no baseline/compare; agent-browser is the regression net

**Step 8 — ship (merge gate)**
- **AGENT** opens PR: component + stories + tests + baseline artifacts
  (and updated baselines if intended)
- **CI** re-runs: unit tests, Storybook tests, agent-browser diff (on updates).
  NOTE: no CI workflow is configured in this repo yet — locally this gate is
  `npm run lint && npm test && npm run test-storybook` (+ diff on updates);
  add a GitHub Actions workflow when the component lands
- **DEV** reviews — taste, requirement fit, ambiguous engine diffs, whether
  visual drift is intended
- *Why:* human gate for what automation can't judge; regression diff belongs
  *inside* the gate so unintended drift blocks merge, not users

---

## Tool→step map

| Step | Tool | Mode |
| ---- | ---- | ---- |
| 1 | Vitest + RTL, Biome | regular toolchain |
| 2 | Storybook stories | regular (MCP only for external design systems / no conventions) |
| 3 | Storybook Test (`test-storybook`) | regular CLI |
| 4 | chrome-devtools MCP | MCP required |
| 5 | chrome-devtools MCP | MCP required |
| 6 | firefox-devtools MCP (Safari: macOS runner) | MCP required |
| 7 | agent-browser | CLI (baselines + diff) |
| 8 | PR + CI | regular |

## Failure policy (all gates)

Max 3 fix-retry attempts per failing gate, then stop and report
(failing assertion + artifacts). Never declare done with red gates.
