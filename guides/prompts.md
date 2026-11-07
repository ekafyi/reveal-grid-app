# Prompts — copy-paste blocks for the UI component workflow

`guide-*.md` files explain the flow for humans. This file contains the
executable artifacts: paste each block where indicated. Nothing here is
run automatically — the dev wires it up.

---

## 1. Paste into `AGENTS.md` (repo root) — the standing rule

```markdown
## UI component workflow (MANDATORY)

When asked to build or update a component under `src/components/`, follow
`guides/guide-example-ui-component.md` steps 1–7 in order. Step 8 (PR/merge)
belongs to the dev — prepare everything, but do not open or merge a PR unless
explicitly told.

Gates (all must pass; run in order):

| Gate | Name            | Command / tool                              |
| ---- | --------------- | ------------------------------------------- |
| G1   | lint + unit     | `npm run lint && npm test`                  |
| G2   | stories render  | `npm run test-storybook`                    |
| G3   | invariant test  | play function (part of G2 run)              |
| G4   | real-app check  | chrome-devtools MCP (navigate/snapshot/eval/screenshot/resize/emulate) |
| G5   | performance     | chrome-devtools MCP trace; no long tasks > 50ms during scroll |
| G6   | cross-engine    | firefox-devtools MCP, rerun G4 core checks  |
| G7   | visual baseline | agent-browser; NEW → record `baseline/<Component>/`; UPDATE → `diff` vs baselines |

Rules:
- If a required MCP tool or CLI (chrome-devtools, firefox-devtools,
  agent-browser) is not available in this harness, STOP immediately and report
  which one is missing. Never silently skip a gate.
- Per failing gate: max 3 fix-retry attempts, then halt.
- Scope discipline: G1 = prop logic only; G2 = render matrix; G3 = the single
  scroll-coupling invariant; G4/G6 = page-level integration; G5 = perf;
  G7 = pixels. Do not duplicate assertions across gates.
- Finish every run with the report below, regardless of outcome.

Run report (always emit at the end):

```markdown
## UI workflow run report
- Component: <name> | Mode: NEW | UPDATE
- G1..G7: PASS/FAIL/SKIPPED(reason) — one line each
- Fix-retries used: <n> per failed gate
- Artifacts: <paths: screenshots, traces, baseline diffs>
- Halted at: <gate or none> | Blockers: <missing tools, red gates, ambiguities>
```
```

---

## 2. Initial prompt — NEW component (starts step 1)

```markdown
Build `RevealGrid` in `src/components/RevealGrid/` (dir exists, empty).

A card grid that reveals cards as they scroll into view using CSS
scroll-driven animations (`animation-timeline: view()` + `animation-range`).
Spec: https://developer.chrome.com/docs/css-ui/scroll-driven-animations

Props:
- cards: { title, body, image? }[]
- direction: "up" | "left" | "fade"
- range: "early" | "default" | "late"
- stagger: number (per-card range offset)

Mount it on a new `/gallery` route in `src/routeTree.tsx` (client-side
routing, manual route tree — follow the existing pattern there). Seed with
~12 demo cards. Respect `prefers-reduced-motion` (instant states, no motion).

Follow the UI component workflow in AGENTS.md, steps 1 through 7 (G1–G7),
including the run report at the end. Stop after step 7 — do not open a PR.
```

---

## 3. Initial prompt — UPDATE existing component

```markdown
Update `RevealGrid` in `src/components/RevealGrid/`: <describe change, e.g.
"add prop `columns: 1 | 2 | 3`, default 2">.

Follow the UI component workflow in AGENTS.md, steps 1 through 7 in UPDATE
mode: G7 means `agent-browser diff` against the committed baselines in
`baseline/RevealGrid/`. If the visual change is intended, re-record affected
baselines in the same change set and say so in the run report. Stop after
step 7 — do not open a PR.
```

---

## 4. Harness prerequisites (dev checklist — do once, not a prompt)

```markdown
- [ ] chrome-devtools MCP registered (e.g. `npx chrome-devtools-mcp@latest --headless`)
- [ ] firefox-devtools MCP registered
- [ ] Storybook MCP registered (optional; endpoint http://localhost:6006/mcp
      while `npm run storybook` runs)
- [ ] agent-browser installed (`npm i -g agent-browser && agent-browser install`)
- [ ] Playwright Chromium for story tests (`npx playwright install chromium`)
- [ ] AGENTS.md populated with block 1 above
```
