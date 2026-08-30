# Fluid Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portfolio feel visually premium and continuously responsive while eliminating the reported Three.js transition, cursor, CONTACT and mobile defects.

**Architecture:** Keep one persistent R3F Canvas and one shared GSAP ticker. Consolidate stage updates into the frame driver, derive render and gravity activity from the same stage state, simplify competing ambient effects, and make responsive behavior depend on input capability and viewport height as well as width.

**Tech Stack:** React 18, TypeScript, styled-components, Three.js, React Three Fiber, GSAP/ScrollTrigger, Lenis, Node test runner, Vite.

**Spec:** `docs/superpowers/specs/2026-08-30-fluid-visual-overhaul-design.md`

## Global Constraints

- Preserve one Canvas, one WebGL context, one Lenis instance and one GSAP ticker.
- Keep `frameloop="never"`; do not add an independent RAF.
- Preserve the procedural singularity, deterministic seed `1337` and explicit disposal.
- Public copy remains English.
- No unfinished project video is shipped.
- Mobile and reduced-motion paths must remain complete without hover.
- Work only on `codex/v1-launch`; do not merge into `main`.

---

### Task 1: Make stage activity explicit and testable

**Status:** Complete in `b4e0479`.

**Files:**

- Create: `src/three/stagePolicy.ts`
- Create: `src/three/stagePolicy.test.mjs`
- Modify: `src/lib/stagePresence.ts`

**Interfaces:**

- Produces: `stageMode(presence: number): 'active' | 'ambient' | 'dormant'`
- Produces: `gravityEnabled(presence: number, projected: boolean): boolean`
- Produces: `frameInterval(mode, reduced): number`

- [ ] **Step 1: Write failing policy tests**

```ts
assert.equal(stageMode(1), 'active');
assert.equal(stageMode(0.16), 'ambient');
assert.equal(stageMode(0), 'dormant');
assert.equal(gravityEnabled(0, true), false);
assert.equal(gravityEnabled(0.16, true), false);
assert.equal(gravityEnabled(1, true), true);
assert.equal(frameInterval('dormant', false), 250);
```

- [ ] **Step 2: Run `npm test` and confirm the missing module failure**
- [ ] **Step 3: Implement pure thresholds in `stagePolicy.ts` without DOM or Three.js dependencies**
- [ ] **Step 4: Run `npm test` and confirm all policy tests pass**
- [ ] **Step 5: Commit with `test(three): define stage activity budgets`**

### Task 2: Remove duplicate stage work and gate Three.js correctly

**Status:** Complete in `dc82146` and `7d297ce`.

**Files:**

- Modify: `src/three/SingularityCanvas.tsx`
- Modify: `src/three/Scene.tsx`
- Modify: `src/three/DustField.tsx`
- Modify: `src/lib/gravityField.ts`

**Interfaces:**

- Consumes: `stageMode`, `gravityEnabled`, `frameInterval`
- Preserves: `Canvas frameloop="never"`

- [ ] **Step 1: Add a regression assertion that `Scene.tsx` does not call `updateStage`**
- [ ] **Step 2: Run `npm test` and confirm it fails against the duplicate call**
- [ ] **Step 3: Make `FrameDriver` the only stage updater and advance immediately when presence changes**
- [ ] **Step 4: Gate the projected gravity core with `gravityEnabled(stage().presence, projected.z < 1)`**
- [ ] **Step 5: Reduce dormant cadence to 4 FPS and keep ambient cadence at 12 FPS**
- [ ] **Step 6: Run tests, typecheck and lint**
- [ ] **Step 7: Commit with `perf(three): unify stage and render scheduling`**

### Task 3: Stabilize and simplify the custom cursor

**Status:** Complete in `16297d4`.

**Files:**

- Create: `src/lib/cursorMotion.ts`
- Create: `src/lib/cursorMotion.test.mjs`
- Modify: `src/components/layout/Cursor.tsx`

**Interfaces:**

- Produces: `seedCursor(x, y, trailLength)` returning initialized position records
- Consumes: `gravityField.isActive()` after stage gating

- [ ] **Step 1: Write a failing test proving every trail point starts at the first pointer coordinates**
- [ ] **Step 2: Run `npm test` and confirm failure**
- [ ] **Step 3: Seed position and trail on the first valid pointer event instead of `-9999` interpolation**
- [ ] **Step 4: Remove the multi-node visible trail and retain one precise cursor dot with bounded hero-only attraction**
- [ ] **Step 5: Reset hover state on pointer leave and avoid stale transforms on re-entry**
- [ ] **Step 6: Run tests, typecheck and lint**
- [ ] **Step 7: Commit with `fix(cursor): prevent gravity jumps across sections`**

### Task 4: Remove artificial scroll latency and coordinate CONTACT

**Status:** Complete in `91383e6`.

**Files:**

- Modify: `src/components/providers/SmoothScrollProvider.tsx`
- Modify: `src/components/layout/Hud.tsx`
- Modify: `src/hooks/useCollapse.ts`
- Modify: `src/lib/motion.ts`

**Interfaces:**

- Preserves: `horizonProgress()` for the visual HUD
- Removes: per-frame mutation of Lenis duration and wheel/touch multipliers

- [ ] **Step 1: Add a source regression test that Lenis options are not mutated inside the shared tick**
- [ ] **Step 2: Run `npm test` and confirm it fails**
- [ ] **Step 3: Keep Lenis response uniform and remove the dilation rate from the HUD**
- [ ] **Step 4: Start the CONTACT collapse only after the entrance reveal has completed (`start: 'top top'`)**
- [ ] **Step 5: Reduce global skew to a subtle maximum and stop deforming long body copy**
- [ ] **Step 6: Run tests, typecheck and lint**
- [ ] **Step 7: Commit with `fix(motion): keep the closing transition responsive`**

### Task 5: Make Skills and fixed chrome responsive by capability

**Status:** Complete in `ecfbc41` and `7eabc70`.

**Files:**

- Modify: `src/components/sections/Skills/Skills.tsx`
- Modify: `src/components/layout/SoundToggle.tsx`
- Modify: `src/components/layout/Hud.tsx`
- Modify: `src/components/navigation/Header.tsx`
- Modify: `src/components/sections/Hero/Hero.styles.ts`
- Modify: `src/styles/theme.ts`

**Interfaces:**

- Produces: `theme.media.short`, `theme.media.touch`, `theme.media.landscapeMobile`

- [ ] **Step 1: Add media tokens for coarse pointers, short viewports and mobile landscape**
- [ ] **Step 2: Remove perpetual spectral-line emission animation and keep only active/focus feedback**
- [ ] **Step 3: Use grouped Skills lists as the primary mobile presentation; hide the spectrum/readout below 560px**
- [ ] **Step 4: Hide the inactive sound toggle and full HUD on touch/mobile where they overlap content**
- [ ] **Step 5: Adjust hero/header sizing for short and landscape viewports without horizontal clipping**
- [ ] **Step 6: Run format, typecheck, lint and build**
- [ ] **Step 7: Commit with `feat(ui): refine the responsive visual hierarchy`**

### Task 6: Prepare the project media contract without shipping video

**Status:** Deferred because the user explicitly paused all video work on
2026-08-30. No speculative media contract was added.

**Files:**

- Modify: `src/lib/content.ts`
- Modify: `src/components/sections/Work/Work.tsx`

**Interfaces:**

- Produces: optional `media?: { videoSrc: string; posterSrc: string }` on a project
- Preserves: existing `MatterField` when `media` is absent

- [ ] **Step 1: Extend the project content test to accept an optional complete media pair and reject partial media**
- [ ] **Step 2: Run `npm test` and confirm the new validation fails**
- [ ] **Step 3: Add the optional typed contract without assigning media to current projects**
- [ ] **Step 4: Add a private media renderer boundary that falls back to `MatterField` when no source exists**
- [ ] **Step 5: Run tests, typecheck and lint**
- [ ] **Step 6: Commit with `refactor(work): prepare project media delivery`**

### Task 7: Browser performance and UX verification

**Status:** Complete locally; push and pull-request update remain.

**Files:**

- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/BUGS-ABERTOS.md` only when evidence closes or changes a bug

**Interfaces:**

- Consumes: completed Tasks 1–6
- Produces: measured release evidence in the pull request

- [ ] **Step 1: Run `npm test`, format check, typecheck, lint, build and `git diff --check`**
- [ ] **Step 2: Measure project 03 → WORK exit → Skills and confirm no long transition stall**
- [ ] **Step 3: Hover/focus every Skills line repeatedly and verify cursor coordinates remain viewport-bounded**
- [ ] **Step 4: Measure “FROM HERE ON” → CONTACT with uniform input response**
- [ ] **Step 5: Validate 1280 desktop, 390×844 mobile, 844×390 landscape and a short desktop viewport**
- [ ] **Step 6: Verify one Canvas, no horizontal overflow, no console errors and no duplicate ticker/listener growth**
- [ ] **Step 7: Update architecture/bug evidence and commit with `docs: record fluidity verification`**
- [ ] **Step 8: Push `codex/v1-launch` and update the existing pull request**
