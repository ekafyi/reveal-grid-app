# Test inventory — `RevealGrid` workflow

Every test layer in the workflow, one modality per step, no overlap.
Steps 4–6 checks are enumerated as IDs (G4-1 … G6-2) in the initial prompt
(`prompts.md` block 2) so the run report can show PASS/FAIL per check.

```yaml
- step: 1
  test_type: unit                    # jsdom, React Testing Library
  summary: Prop logic only — direction/range/stagger map to correct
    class/style output; cards edge counts (0/1/50); reduced-motion class logic.
    No render-matrix (step 2 owns it), no animation assertions (jsdom has
    no layout/animation engine).
  cases_defined_in: src/components/RevealGrid/RevealGrid.test.tsx
  how_to_run: npm test

- step: 2
  test_type: unit-render             # stories auto-run as smoke tests, real Chromium
  summary: Render/smoke matrix — every story (direction × range matrix,
    stagger variants, scroll-container wrapper, edge counts, reduced motion)
    mounts without errors. No separate unit render tests for the same matrix.
  cases_defined_in: src/components/RevealGrid/RevealGrid.stories.tsx
  how_to_run: npm run test-storybook

- step: 3
  test_type: integration             # play function in real Chromium
  summary: The single committed behavioral invariant — scroll the wrapper,
    animation progress is scroll-coupled not time-driven; a11y check on the
    same story. No visual assertions (step 7 owns pixels), no perf (step 5).
  cases_defined_in: RevealGrid.stories.tsx (play fn on scroll-container story)
  how_to_run: npm run test-storybook

- step: 4
  test_type: e2e                     # ad-hoc agent session, chrome-devtools MCP; not committed
  summary: Real-app integration on /gallery route. Checks enumerated in the
    initial prompt —
    G4-1 take_snapshot: all cards in a11y tree, count matches cards length
    G4-2 evaluate_script: getAnimations() uses view() timelines, animation-range
      reflects range prop, stagger applied per card
    G4-3 evaluate_script: scroll to 25/50/75% → animation.currentTime advances
      proportionally, monotonic, no self-advance at rest
    G4-4 take_screenshot: cards mid-reveal render correctly at each stop
    G4-5 resize_page + emulate: mobile viewport + reduced motion → instant
      final states, no mid-animation holds
  cases_defined_in: prompts.md block 2 (verification spec, natural language)
  how_to_run: chrome-devtools MCP tools during agent run

- step: 5
  test_type: performance             # DevTools trace, chrome-devtools MCP; not committed
  summary: Compositor + jank gates under scripted scroll —
    G5-1 scroll-driven animations run on compositor (no main-thread
      layout/paint spikes from the animation)
    G5-2 no long tasks > 50ms during the scroll sequence
  cases_defined_in: prompts.md block 2 (verification spec, natural language)
  how_to_run: performance_start_trace → scripted scrolls → performance_stop_trace

- step: 6
  test_type: compatibility           # firefox-devtools MCP; not committed
  summary: Engine parity for step-4 checks in Firefox —
    G6-1 rerun G4-2 and G4-3; identical outcomes
    G6-2 screenshots at scroll stops; no visual divergence from G4-4 captures
  cases_defined_in: prompts.md block 2 (verification spec, natural language)
  how_to_run: firefox-devtools MCP tools during agent run

- step: 7
  test_type: visual-regression       # agent-browser screenshots vs committed baselines
  summary: NEW → record golden baselines in baseline/RevealGrid/. UPDATE →
    diff vs baselines; unexpected drift fails, intended changes re-record
    in the same change set.
  cases_defined_in: baseline/RevealGrid/ (committed captures)
  how_to_run: agent-browser open/screenshot/diff (re-runnable in CI)

- step: 8
  test_type: aggregation             # merge gate: all committed layers
  summary: Lint + unit + storybook tests + visual diff re-run before merge.
  cases_defined_in: package.json scripts (CI workflow not yet configured)
  how_to_run: npm run lint && npm test && npm run test-storybook
    (+ agent-browser diff on updates)
```
