# Prompts — copy-paste blocks for the UI component workflow

Each block below is pasted manually by the dev to the stated target. Nothing
here runs automatically.

**How to use:**

| Block | What | Where it goes | When |
| ----- | ---- | ------------- | ---- |
| 1 | Standing workflow rule | `AGENTS.md` (repo root) | Once, before the first component build; commit it |
| 2 | Initial prompt (NEW) | First message to the coding agent | Every time you start a new component |
| 3 | Initial prompt (UPDATE) | First message to the coding agent | Every time you change an existing component |

One-time machine/harness setup: see [`guide-initial-setup.md`](guide-initial-setup.md).
After block 1 is in place, the agent runs autonomously through step 7 and emits
the run report defined in block 1. You do not paste anything else mid-flow.

---

## 1. → `AGENTS.md` (repo root) — paste once, before the first component build

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
- G1..G3: PASS/FAIL — one line each
- G4..G6: per check ID (G4-1..G4-5, G5-1..G5-2, G6-1..G6-2): PASS/FAIL —
  use the check IDs from the verification spec in the initial prompt;
  SKIPPED(reason) only if the spec genuinely doesn't apply
- G7: PASS/FAIL (+ diff summary on UPDATE)
- Fix-retries used: <n> per failed gate
- Artifacts: <paths: screenshots, traces, baseline diffs>
- Halted at: <gate or none> | Blockers: <missing tools, red gates, ambiguities>
```
```

---

## 2. → First message to the coding agent — send when starting a NEW component (step 1)

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

Verification spec (G4–G6) — implement each check as a boolean assertion via
the named MCP tools; report each check ID as PASS/FAIL in the run report:

- G4-1 (take_snapshot): all cards present in the accessibility tree; count matches `cards` length
- G4-2 (evaluate_script): `document.getAnimations()` — grid animations use scroll-driven
  timelines (view()), not time-driven; animation-range reflects `range` prop; stagger offsets applied per card
- G4-3 (evaluate_script): set scroll to 25/50/75% of scroller range; at each stop,
  `animation.currentTime` advances proportionally (monotonic, no self-advance at rest)
- G4-4 (take_screenshot): at each scroll stop, cards mid-reveal render correctly
  (opacity/transform between initial and final states; no flicker artifacts)
- G4-5 (resize_page + emulate): at mobile viewport and with reduced motion emulated,
  cards reach final states instantly (no partial/mid-animation holds)
- G5-1 (performance trace, scripted scroll): scroll-driven animations run on
  compositor thread (no main-thread layout/paint spikes attributable to the animation)
- G5-2 (performance trace): no long tasks > 50ms during the scroll sequence
- G6-1 (firefox-devtools MCP): rerun G4-2 and G4-3 in Firefox; identical outcomes
- G6-2 (firefox-devtools MCP): screenshot at scroll stops; no visual divergence
  from the Chromium captures in G4-4

Follow the UI component workflow in AGENTS.md, steps 1 through 7 (G1–G7),
including the run report at the end. Stop after step 7 — do not open a PR.
```

---

## 3. → First message to the coding agent — send when UPDATING an existing component

```markdown
Update `RevealGrid` in `src/components/RevealGrid/`: <describe change, e.g.
"add prop `columns: 1 | 2 | 3`, default 2">.

Apply the G4–G6 verification spec from block 2 of guides/prompts.md (extend
with check IDs for any new behavior, e.g. G4-6 for a new prop).

Follow the UI component workflow in AGENTS.md, steps 1 through 7 in UPDATE
mode: G7 means `agent-browser diff` against the committed baselines in
`baseline/RevealGrid/`. If the visual change is intended, re-record affected
baselines in the same change set and say so in the run report. Stop after
step 7 — do not open a PR.
```
