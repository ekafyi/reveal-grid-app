# Example: UI Component Workflow — `RevealGrid` (scroll-driven animation)

Demonstrates adding a new UI component with a coding agent: steps 1–8, actor
labeled per step (DEV / AGENT / CI). Example case: a card grid that reveals
cards as they scroll into view (`animation-timeline: view()` + `animation-range`).
Spec: https://developer.chrome.com/docs/css-ui/scroll-driven-animations

Props: `cards` (title/body/image), `direction` (`up | left | fade`),
`range` (`early | default | late`), `stagger` (number).

MCP tools referenced: chrome-devtools MCP, firefox-devtools MCP, agent-browser.
Storybook MCP only where noted. The component dir `src/components/RevealGrid/`
exists and is empty — the agent creates everything in it.

One-time setup (deps, harness registrations, AGENTS.md): see
[`guide-initial-setup.md`](guide-initial-setup.md). Copy-paste prompts:
[`prompts.md`](prompts.md). Test inventory: [`tests.md`](tests.md).

---

## (II) NEW UI COMPONENT

**Step 1 — component + unit tests (logic layer, jsdom)**
- **DEV** provides instructions ("RevealGrid, scroll-driven reveal via `view()`,
  props: cards/direction/range/stagger ...")
- **AGENT** writes component + Vitest/Testing Library unit tests in
  `src/components/RevealGrid/`; runs quality gate (`npm run lint`, `npm test`) → green
- *Scope:* prop logic and render output only. Do NOT render the full prop matrix
  here (step 2's stories are the render layer) and do NOT assert animation
  behavior (jsdom has no layout/animation engine — that's step 3+)
- *Why:* fast, deterministic feedback on logic; catches structural bugs before
  any browser is involved

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
- *Why:* every story is automatically a render test (Vitest addon) — this is the
  render/smoke layer across the full prop matrix (no separate unit render tests
  needed for the same matrix); stories double as living docs

**Step 3 — interaction test in real browser (committed regression layer)**
- **AGENT** adds ONE play function, in the scroll-container story only, pinning
  the core invariant: scroll the wrapper → animation progress is scroll-coupled,
  not time-driven; include an a11y check (same story — no separate a11y suite)
- *Scope:* the single behavioral invariant, committed. Skip visual assertions
  (step 7's diff owns pixels) and perf assertions (step 5 owns those)
- **AGENT** runs `npm run test-storybook` (real Chromium) → green; CI re-runs it forever
- *Why:* the core invariant as a permanent regression test — survives this PR,
  protects every future one

**Step 4 — real-app verification (chrome-devtools MCP)**
- **AGENT** mounts RevealGrid on a route (e.g. `/gallery` in `src/routeTree.tsx`),
  starts dev server (`npm run dev`), then via MCP:
  `navigate_page` → `take_snapshot` → `evaluate_script` scroll-stop assertions →
  `take_screenshot` → `resize_page` (mobile) → `emulate` reduced motion → fix + re-run
- *Scope:* page-level integration checks (real route, data, layout, viewport).
  Ad-hoc session — findings to fix now, not committed tests. Do not re-assert
  what step 3 already pinned; check what only the real page can show
  (integration with router/layout/data, mobile viewport, reduced motion)
- *Why:* not reproducible in Storybook's isolated iframe

**Step 5 — performance gate (chrome-devtools MCP)**
- **AGENT**: `performance_start_trace` → scripted scrolls → `performance_stop_trace`
  → assert compositor-driven, no long tasks > threshold
- *Why:* DevTools trace insight exists nowhere else in the pipeline

**Step 6 — cross-engine (firefox-devtools MCP; Safari if macOS runner)**
- **AGENT** reruns the step-4 core assertions + screenshots in Firefox → fix CSS
  fallbacks → re-verify
- *Scope:* engine parity for what step 4 checked — not new test types
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
- **CI** re-runs: unit tests, Storybook tests, agent-browser diff (on updates)
- **DEV** reviews — taste, requirement fit, ambiguous engine diffs, whether
  visual drift is intended
- *Why:* human gate for what automation can't judge; regression diff belongs
  *inside* the gate so unintended drift blocks merge, not users

> [!NOTE]
> CI above is hypothetical — no workflow exists in this repo yet. Local gate:
> `npm run lint && npm test && npm run test-storybook` (+ diff on updates). Add a
> GitHub Actions workflow when the component lands.

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
