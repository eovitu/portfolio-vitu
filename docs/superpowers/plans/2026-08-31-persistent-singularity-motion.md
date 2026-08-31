# Persistent Singularity Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing evidence-led portfolio into a cinematic, route-connected experience with one persistent singularity, deterministic navigation, distinct project worlds, and a fully accessible static fallback.

**Architecture:** Keep one Lenis/GSAP ticker as the global clock. Add a pure route-transition state machine, a React route shell, a central Motion Director, and an allocation-free signal store consumed by the persistent R3F scene. DOM content remains semantic and immediately available; motion layers progressively enhance it and always restore a valid route, scroll position, focus target, and unlocked interface.

**Tech Stack:** React 18, TypeScript, Vite, styled-components, GSAP 3, ScrollTrigger, Lenis, Three.js, `@react-three/fiber`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-portfolio-rebuild-design.md`

## Global Constraints

- Work only on `codex/portfolio-rebuild`; never modify `main` directly.
- Public interface copy, metadata, and accessible names remain English.
- Preserve the four public URLs and verified project/contact data.
- Preserve one animation clock: Lenis -> GSAP ticker -> ScrollTrigger -> Motion Director -> R3F.
- Do not add another smooth-scroll engine or global `requestAnimationFrame`.
- Do not add a router or animation dependency unless the existing stack cannot satisfy a verified requirement.
- No progressive wheel resistance, forced scroll-to-top reload, fragile horizontal scrolling, or long animation on every visit.
- Modified clicks, native links, direct URLs, back/forward, hashes, and no-JavaScript navigation must remain valid.
- WebGL, full motion, pointer effects, and shared-media transitions are progressive enhancements.
- Every timeline, listener, observer, overlay, clone, temporary style, and Three.js resource needs explicit cleanup.
- Reduced motion presents complete content and deterministic navigation without scrubbed or continuous decorative motion.
- Use Conventional Commits with no co-author trailer.

---

### Task 1: Transition state machine and route intent contracts

**Files:**

- Create: `src/motion/routeTransitionMachine.ts`
- Create: `src/motion/routeTransitionMachine.test.mjs`
- Create: `src/motion/routeIntent.ts`
- Create: `src/motion/routeIntent.test.mjs`
- Modify: `src/lib/routes.ts`

**Interfaces:**

- Produces: `type TransitionPhase = 'idle' | 'anticipating' | 'occluding' | 'swapping' | 'revealing'`
- Produces: `type NavigationCause = 'link' | 'popstate' | 'brand' | 'previous' | 'next' | 'hash'`
- Produces: `interface RouteIntent { id: number; from: RouteLocation; to: RouteLocation; cause: NavigationCause; projectSlug?: ProjectSlug; savedScrollY?: number }`
- Produces: `createTransitionMachine(callbacks): TransitionMachine`
- Produces: `isEligibleInternalClick(event, anchor): boolean`
- Produces: `scrollTargetFor(intent): ScrollTarget`

- [ ] **Step 1: Write failing state-machine tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { createTransitionMachine } from './routeTransitionMachine.ts';

test('moves through the only valid successful sequence', async () => {
  const phases = [];
  const machine = createTransitionMachine({
    onPhase: (phase) => phases.push(phase),
    restore: () => phases.push('restored'),
  });
  const run = machine.begin({ id: 1 });
  machine.advance('occluding');
  machine.advance('swapping');
  machine.advance('revealing');
  machine.complete();
  await run;
  assert.deepEqual(phases, [
    'anticipating',
    'occluding',
    'swapping',
    'revealing',
    'idle',
    'restored',
  ]);
});

test('deduplicates double click and restores exactly once after cancellation', async () => {
  let restores = 0;
  const machine = createTransitionMachine({ restore: () => restores++ });
  const first = machine.begin({ id: 7 });
  const duplicate = machine.begin({ id: 7 });
  assert.equal(first, duplicate);
  machine.cancel('superseded');
  await assert.rejects(first, /superseded/);
  assert.equal(machine.phase(), 'idle');
  assert.equal(restores, 1);
});
```

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `node --experimental-strip-types --test src/motion/routeTransitionMachine.test.mjs`

Expected: FAIL because the state-machine module does not exist.

- [ ] **Step 3: Implement the pure finite-state machine**

```ts
export type TransitionPhase =
  'idle' | 'anticipating' | 'occluding' | 'swapping' | 'revealing';

const NEXT: Record<Exclude<TransitionPhase, 'idle'>, TransitionPhase> = {
  anticipating: 'occluding',
  occluding: 'swapping',
  swapping: 'revealing',
  revealing: 'idle',
};

export interface TransitionMachine {
  phase(): TransitionPhase;
  begin(intent: { id: number }): Promise<void>;
  advance(next: TransitionPhase): void;
  complete(): void;
  cancel(reason: string): void;
}
```

The implementation owns one active promise, one active intent ID, one timeout, and one idempotent `restoreOnce()` closure. `begin()` returns the existing promise for the same intent ID and rejects a different intent while the current transition is between cancellation boundaries. Invalid `advance()` calls throw without changing phase.

- [ ] **Step 4: Write route-intent and deterministic-scroll tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { scrollTargetFor } from './routeIntent.ts';

test('defines deterministic scroll targets for every route relationship', () => {
  assert.deepEqual(scrollTargetFor({ from: 'home', to: 'case', slug: 'helppet' }), {
    kind: 'top',
  });
  assert.deepEqual(scrollTargetFor({ from: 'case', to: 'case', slug: 'emprega-co' }), {
    kind: 'top',
  });
  assert.deepEqual(scrollTargetFor({ from: 'case', to: 'home', slug: 'doces-da-pati' }), {
    kind: 'selector',
    value: '[data-project="doces-da-pati"]',
  });
  assert.deepEqual(scrollTargetFor({ from: 'home', to: 'home', hash: '#about' }), {
    kind: 'selector',
    value: '#about',
  });
});

test('accepts a finite saved history position and rejects invalid values', () => {
  assert.deepEqual(scrollTargetFor({ cause: 'popstate', savedScrollY: 840 }), {
    kind: 'saved',
    value: 840,
  });
  assert.notEqual(
    scrollTargetFor({ cause: 'popstate', savedScrollY: Number.NaN }).kind,
    'saved',
  );
});
```

- [ ] **Step 5: Implement route intent parsing and click eligibility**

`isEligibleInternalClick` returns false for a prevented event, any modifier, any button other than `0`, non-`_self` targets, downloads, external origins, and mail links. `scrollTargetFor` implements the six approved scroll rules and never reads the DOM.

- [ ] **Step 6: Run tests, typecheck, and commit**

Run: `npm test && npm run typecheck`

Expected: all tests and TypeScript pass.

```bash
git add src/motion src/lib/routes.ts
git commit -m "feat(navigation): define transition state contracts"
```

### Task 2: Persistent route shell, history, scroll, and focus restoration

**Files:**

- Create: `src/components/routing/RouteTransitionProvider.tsx`
- Create: `src/components/routing/RouteTransitionOverlay.tsx`
- Create: `src/components/routing/RouteTransitionOverlay.styles.ts`
- Create: `src/hooks/useInternalNavigation.ts`
- Create: `src/motion/historyState.ts`
- Create: `src/motion/historyState.test.mjs`
- Modify: `src/App.tsx`
- Modify: `src/components/navigation/Header.tsx`
- Modify: `src/components/cases/CaseStudy.tsx`
- Modify: `src/components/home/HomePage.tsx`
- Modify: `src/components/providers/SmoothScrollProvider.tsx`

**Interfaces:**

- Consumes: transition machine and route intents from Task 1.
- Produces: `RouteTransitionProvider({ children })`
- Produces: `useRouteTransition(): { navigate(href, context): Promise<void>; phase: TransitionPhase }`
- Produces: `readHistoryLocation`, `writeHistoryLocation`, `recordCurrentScroll`
- Extends: `SmoothScrollApi` with `scrollToImmediate(target)` and idempotent `stop/start` locking.

- [ ] **Step 1: Write failing history-state tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeHistoryState } from './historyState.ts';

test('keeps only valid route and finite scroll state', () => {
  assert.deepEqual(normalizeHistoryState({ path: '/work/helppet', scrollY: 420 }), {
    path: '/work/helppet',
    scrollY: 420,
  });
  assert.deepEqual(normalizeHistoryState({ path: '/work/helppet', scrollY: Infinity }), {
    path: '/work/helppet',
  });
});
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `node --experimental-strip-types --test src/motion/historyState.test.mjs`

Expected: FAIL because `historyState.ts` does not exist.

- [ ] **Step 3: Implement the provider lifecycle**

The provider owns current route state, active `AbortController`, transition overlay, current media representation, timeout, and queued `popstate` intent. It records the current position with `history.replaceState` before leaving, swaps React route state only during `swapping`, then applies the approved scroll target after the new primary heading exists.

```ts
interface NavigationContext {
  cause: NavigationCause;
  trigger?: HTMLElement;
  mediaFrame?: HTMLElement;
  projectSlug?: ProjectSlug;
}

interface RouteTransitionApi {
  phase: TransitionPhase;
  navigate(href: string, context: NavigationContext): Promise<void>;
}
```

The single `finally` path removes overlays, aborts pending asset work, starts Lenis, clears temporary inert/ARIA state, restores focus, and sets the machine to `idle`.

- [ ] **Step 4: Integrate link interception without breaking native behavior**

`useInternalNavigation` attaches one delegated click listener at the route shell. It calls the Task 1 eligibility function, reads `data-transition-project`, and leaves the browser untouched for ineligible clicks. Header brand, case CTAs, Previous, Next, and Back to Work retain real `href` attributes.

- [ ] **Step 5: Implement deterministic scroll and focus**

After route mount:

- top targets call `scrollToImmediate(0)`;
- project targets query `[data-project="slug"]` and scroll to it;
- hash targets query the decoded ID after mount;
- saved targets clamp to `0..documentHeight - viewportHeight`;
- case focus targets `[data-route-heading]` with temporary `tabIndex=-1`;
- home project return focuses the original link when still connected, otherwise the project heading.

- [ ] **Step 6: Add component contract tests**

Extend `src/components/cases/CaseStudy.test.mjs` and add `src/components/routing/RouteTransitionProvider.test.mjs` source-contract tests asserting real hrefs, `data-route-heading`, `popstate`, `pushState`, abort cleanup, and absence of direct `location.href` assignment for eligible navigation.

- [ ] **Step 7: Run static gates and commit**

Run: `npm test && npm run typecheck && npm run lint`

Expected: all checks pass.

```bash
git add src/App.tsx src/components/routing src/components/navigation src/components/cases src/components/home src/components/providers src/hooks/useInternalNavigation.ts src/motion
git commit -m "feat(navigation): add interruptible route transitions"
```

### Task 3: Shared-media representation with safe video fallback

**Files:**

- Create: `src/motion/sharedMedia.ts`
- Create: `src/motion/sharedMedia.test.mjs`
- Create: `src/components/routing/SharedMediaLayer.tsx`
- Modify: `src/components/home/HomePage.tsx`
- Modify: `src/components/cases/CaseStudy.tsx`
- Modify: `src/lib/content.ts`

**Interfaces:**

- Produces: `selectSharedMediaSource(input): SharedMediaSource | null`
- Produces: `measureMediaFrame(element): MediaRect`
- Produces: `createSharedMediaRepresentation(source, rect, signal): HTMLElement | null`
- Consumes: project poster URLs and route transition abort signal.

- [ ] **Step 1: Write failing source-priority tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { selectSharedMediaSource } from './sharedMedia.ts';

test('prefers a loaded poster and never selects a live video clone', () => {
  assert.deepEqual(
    selectSharedMediaSource({
      posterLoaded: true,
      poster: '/media/helppet.webp',
      frameReady: true,
    }),
    { kind: 'poster', src: '/media/helppet.webp' },
  );
});

test('falls back to a static frame surface or no shared element', () => {
  assert.deepEqual(selectSharedMediaSource({ posterLoaded: false, frameReady: true }), {
    kind: 'frame-surface',
  });
  assert.equal(selectSharedMediaSource({ posterLoaded: false, frameReady: false }), null);
});
```

- [ ] **Step 2: Run focused test and confirm failure**

Run: `node --experimental-strip-types --test src/motion/sharedMedia.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement static representation creation**

For `poster`, create a positioned `<img>` with explicit source dimensions and decoded-image timeout. For `frame-surface`, clone only the styled media container, remove `video`, `source`, controls, and interactive descendants, then apply the poster as a background if available. Never call `cloneNode(true)` on an active video subtree.

- [ ] **Step 4: Animate between measured rectangles**

Batch source and destination `getBoundingClientRect()` reads before GSAP writes. Animate translation, scale, border radius, clip path, and opacity inside the route overlay. On abort or failure, remove the representation and allow eclipse/reveal to continue.

- [ ] **Step 5: Run tests and commit**

Run: `npm test && npm run typecheck && npm run lint`

```bash
git add src/motion/sharedMedia.ts src/motion/sharedMedia.test.mjs src/components/routing/SharedMediaLayer.tsx src/components/home/HomePage.tsx src/components/cases/CaseStudy.tsx src/lib/content.ts
git commit -m "feat(motion): add safe shared media transitions"
```

### Task 4: Persistent scene signal store and project themes

**Files:**

- Create: `src/motion/sceneSignals.ts`
- Create: `src/motion/sceneSignals.test.mjs`
- Create: `src/motion/projectThemes.ts`
- Create: `src/motion/projectThemes.test.mjs`
- Modify: `src/App.tsx`
- Modify: `src/components/layout/SingularityStage.tsx`
- Modify: `src/three/SingularityCanvas.tsx`
- Modify: `src/three/Scene.tsx`
- Modify: `src/three/DustField.tsx`
- Modify: `src/three/SingularityModel.tsx`
- Modify: `src/three/renderQuality.ts`

**Interfaces:**

- Produces: mutable `sceneSignals` with route, chapter, transition, energy, presence, transform, flare, particles, theme, and velocity fields.
- Produces: `setSceneTarget(partial)` and `resetTransientSceneSignals()`.
- Produces: `PROJECT_THEMES: Record<ProjectSlug, ProjectMotionTheme>`.
- Consumes: signals from Motion and Route Transition Directors.

- [ ] **Step 1: Write failing signal and theme tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resetTransientSceneSignals,
  sceneSignals,
  setSceneTarget,
} from './sceneSignals.ts';
import { PROJECT_THEMES } from './projectThemes.ts';

test('updates signals in place and resets transition-only fields', () => {
  const identity = sceneSignals;
  setSceneTarget({ energy: 0.8, transitionProgress: 0.5, projectTheme: 'helppet' });
  assert.equal(sceneSignals, identity);
  resetTransientSceneSignals();
  assert.equal(sceneSignals.transitionProgress, 0);
  assert.equal(sceneSignals.energy, 0);
});

test('defines a distinct complete theme for every project', () => {
  assert.deepEqual(Object.keys(PROJECT_THEMES), ['emprega-co', 'doces-da-pati', 'helppet']);
  assert.equal(new Set(Object.values(PROJECT_THEMES).map((theme) => theme.accent)).size, 3);
});
```

- [ ] **Step 2: Implement allocation-free signals and explicit theme fields**

```ts
export interface ProjectMotionTheme {
  accent: string;
  dust: string;
  particleSpread: number;
  orbitOrder: number;
  mediaDepth: number;
  temperature: number;
}
```

Theme colors must be sampled from existing project media or the existing portfolio palette and documented next to the value. They may not imply product branding that is absent from the media.

- [ ] **Step 3: Move `SingularityStage` above the route outlet**

Render it once for home and cases. Remove route-kind conditional mounting from `App.tsx`. Keep useful DOM ahead of the lazy Three.js chunk and preserve poster fallback behavior.

- [ ] **Step 4: Consume signals inside the existing R3F loop**

Interpolate camera, group position, scale, energy, flare, dust color, density, and spread inside `useFrame` without React state updates or per-frame allocations. Continue using the provider-driven `advance()` call and pause when hidden.

- [ ] **Step 5: Verify renderer persistence and commit**

Add a browser-verifiable `data-scene-instance` identifier created once per mount in development. Route swaps must not change it.

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add src/App.tsx src/components/layout/SingularityStage.tsx src/motion src/three
git commit -m "feat(three): persist the singularity across routes"
```

### Task 5: Central Motion Director, loading sequence, and kinetic hero

**Files:**

- Create: `src/components/motion/MotionDirector.tsx`
- Create: `src/components/motion/EntrySequence.tsx`
- Create: `src/components/motion/EntrySequence.styles.ts`
- Create: `src/hooks/useHomeMotion.ts`
- Create: `src/motion/tokens.ts`
- Create: `src/motion/visitState.ts`
- Create: `src/motion/visitState.test.mjs`
- Modify: `src/App.tsx`
- Modify: `src/components/home/HomePage.tsx`
- Modify: `src/components/home/HomePage.styles.ts`
- Modify: `src/components/navigation/Header.tsx`
- Modify: `src/hooks/useGravityLetters.ts`

**Interfaces:**

- Produces: `MOTION_DURATION`, `MOTION_EASE`, `MOTION_STAGGER`.
- Produces: `visitMode(storage, reducedMotion): 'first' | 'repeat' | 'static'`.
- Produces: one scoped homepage timeline and chapter ScrollTriggers.
- Consumes: scene signals and shared provider frame clock.

- [ ] **Step 1: Write failing visit-mode tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { visitMode } from './visitState.ts';

test('uses full entry once, short repeat entry later, and static reduced motion', () => {
  assert.equal(visitMode({ seen: false, reduced: false }), 'first');
  assert.equal(visitMode({ seen: true, reduced: false }), 'repeat');
  assert.equal(visitMode({ seen: false, reduced: true }), 'static');
});
```

- [ ] **Step 2: Implement the bounded entry lifecycle**

EntrySequence renders accessible-hidden fragments and an eclipse core above already-rendered HTML. It waits only for the first of scene-ready, poster-ready, or 2200 ms timeout. First entry targets 1.2-1.8 seconds; repeat entry targets 250-450 ms; static mode removes the overlay synchronously.

- [ ] **Step 3: Split hero typography into non-conflicting transform channels**

Use outer `[data-hero-word]` nodes for entrance/exit and inner `[data-hero-glyph]` nodes for gravity. Screen readers receive one intact heading string through a visually hidden span while animated glyph wrappers are `aria-hidden`.

- [ ] **Step 4: Refactor gravity letters**

Retain cached glyph measurements, damped pull, lean, and inertial response. Remove pointer capture, drag, falling, and reconstitution states. Activate only for fine pointers, visible hero, full scene mode, and no reduced-motion preference.

- [ ] **Step 5: Build hero entrance and exit timelines**

The scoped `gsap.context` sequence performs preparation, convergence, disc flare, word expulsion, navigation reveal, CTA settlement, and ambient handoff. Scroll exit compresses hero words toward the measured core and updates scene signals without changing scroll travel.

- [ ] **Step 6: Add focused source-contract tests and commit**

Add `src/components/motion/MotionDirector.test.mjs` asserting the 2200 ms fail-safe, `ctx.revert`, reduced-motion branch, and distinct transform selectors.

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add src/App.tsx src/components/motion src/components/home src/components/navigation src/hooks/useHomeMotion.ts src/hooks/useGravityLetters.ts src/motion
git commit -m "feat(home): choreograph entry and kinetic hero"
```

### Task 6: Three distinct Selected Work chapters

**Files:**

- Create: `src/components/home/ProjectChapter.tsx`
- Create: `src/components/home/ProjectChapter.styles.ts`
- Create: `src/hooks/useProjectChapterMotion.ts`
- Modify: `src/components/home/HomePage.tsx`
- Modify: `src/components/home/HomePage.styles.ts`
- Modify: `src/lib/content.ts`

**Interfaces:**

- Consumes: `Project`, `PROJECT_THEMES`, route transition API, scene signals.
- Produces: `ProjectChapter({ project, index })` with stable `data-project`, `data-project-media`, and `data-project-link` hooks.

- [ ] **Step 1: Add a failing project-composition contract test**

Create `src/components/home/ProjectChapter.test.mjs` that asserts three named composition variants, real video/poster use, explicit CTA hrefs, and a static semantic reading order.

- [ ] **Step 2: Replace repeated alternating rows with chapter variants**

- Emprega.co uses perspective media planes, compressed headings, and organized orbital detail.
- Doces da Pati uses close media, layered warm surfaces, vertical flow, and expansion.
- HelpPet uses modular media fields, greater depth spacing, cooler light, and connected points.

All variants collapse to the same semantic single-column order below 768 px.

- [ ] **Step 3: Implement chapter-specific motion**

Create one scoped timeline per chapter in document order. Use ScrollTrigger for entrance, media parallax, chapter progress, and scene theme interpolation. Do not pin the section. Use transforms and opacity; apply and clear `will-change` on enter/leave.

- [ ] **Step 4: Add progress and interaction states**

Expose current chapter in the fixed navigation only when it improves orientation. Add fast CTA press/release, directional link treatment, media depth on fine-pointer hover, and route preload on case-link hover/focus. Keyboard focus must receive an equivalent visible state without pointer motion.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add src/components/home src/hooks/useProjectChapterMotion.ts src/lib/content.ts
git commit -m "feat(work): create distinct project chapters"
```

### Task 7: Distinct case-study worlds and case navigation choreography

**Files:**

- Create: `src/components/cases/CaseHero.tsx`
- Create: `src/components/cases/CaseSection.tsx`
- Create: `src/components/cases/CaseNavigation.tsx`
- Create: `src/components/cases/themes/EmpregaCase.styles.ts`
- Create: `src/components/cases/themes/DocesCase.styles.ts`
- Create: `src/components/cases/themes/HelpPetCase.styles.ts`
- Create: `src/hooks/useCaseMotion.ts`
- Modify: `src/components/cases/CaseStudy.tsx`
- Modify: `src/components/cases/CaseStudy.styles.ts`
- Modify: `src/lib/content.ts`

**Interfaces:**

- Consumes: `Project`, route transition API, project motion theme, scene signals.
- Produces: shared semantic case structure with theme-specific composition.
- Produces: Previous, Next, and Back to Work links with real hrefs and transition context.

- [ ] **Step 1: Expand case tests before changing markup**

Assert one `h1`, ordered section headings, real media, verified external actions, theme selection by slug, adjacent navigation, Back to Work project context, and no invented metrics.

- [ ] **Step 2: Split semantic structure from visual theme**

`CaseStudy` owns content order and accessible landmarks. Theme modules control layout, CSS variables, media framing, and motion hooks without branching the factual content model.

- [ ] **Step 3: Build Emprega.co case composition**

Use an architectural grid, relationship lines tied to real content groupings, media planes, firm type compression, and organized dust behavior. Do not add decorative technical metrics.

- [ ] **Step 4: Build Doces da Pati case composition**

Use warmer media-derived variables, closer crops, layered transitions, and slower vertical parallax. Preserve professional typography and avoid generic bakery motifs.

- [ ] **Step 5: Build HelpPet case composition**

Use cooler media-derived variables, modular interface arrangements, spatial connections, and more open particle distribution. Connections may only represent existing sections and flows.

- [ ] **Step 6: Connect case-to-case and case-to-home transitions**

Previous and Next supply cause and slug to the director, use the shorter transition range, set next scroll to top, and focus the new `h1`. Back to Work supplies the current slug so the home returns to the correct chapter.

- [ ] **Step 7: Verify every route and commit**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add src/components/cases src/hooks/useCaseMotion.ts src/lib/content.ts
git commit -m "feat(cases): give each project a distinct world"
```

### Task 8: Editorial Profile and material-transform About

**Files:**

- Create: `src/components/home/EngineeringProfile.tsx`
- Create: `src/components/home/EngineeringProfile.styles.ts`
- Create: `src/components/home/AboutChapter.tsx`
- Create: `src/components/home/AboutChapter.styles.ts`
- Create: `src/hooks/useMaterialTransition.ts`
- Modify: `src/components/home/HomePage.tsx`
- Modify: `src/components/home/HomePage.styles.ts`

**Interfaces:**

- Consumes: existing capability and About content.
- Produces: complete non-interactive reading order plus progressive focus/hover/scroll enhancement.
- Produces: one dark-to-light material transition and an explicit return to the dark Contact chapter.

- [ ] **Step 1: Add source-contract tests**

Create `src/components/home/HomeEditorialSections.test.mjs` asserting four visible capability headings, the real photograph and dimensions, no required hover state, and reduced-motion-safe markup.

- [ ] **Step 2: Recompose Engineering Profile**

Replace the equal grid with an asymmetric relationship map. Backend occupies the primary visual axis; product, interface, and motion connect through real capability labels. Focus and hover illuminate a relationship but never reveal hidden copy.

- [ ] **Step 3: Recompose About as an editorial chapter**

Use an asymmetric image field, headline, short narrative, and working-context copy. Avoid the existing two-column split. Preserve `/victor-2010.jpg`, explicit dimensions, alt text, and source pixels.

- [ ] **Step 4: Implement material transition**

Compress the dark field, sweep one luminous line, reveal the light surface, expose the photograph, then settle text. Use one scoped scrubbed timeline and a completed static light surface under reduced motion.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add src/components/home src/hooks/useMaterialTransition.ts
git commit -m "feat(profile): add editorial engineering and about chapters"
```

### Task 9: Final collapse with guaranteed email survivor

**Files:**

- Create: `src/components/home/ContactCollapse.tsx`
- Create: `src/components/home/ContactCollapse.styles.ts`
- Create: `src/hooks/useContactCollapse.ts`
- Create: `src/motion/collapseTargets.ts`
- Create: `src/motion/collapseTargets.test.mjs`
- Modify: `src/components/home/HomePage.tsx`
- Modify: `src/components/navigation/Header.tsx`

**Interfaces:**

- Produces: `collectCollapseTargets(section, survivor): HTMLElement[]`.
- Produces: word-level outer/inner transform channels.
- Consumes: scene signals and `[data-contact-survivor]` email.

- [ ] **Step 1: Write failing survivor tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { isSurvivorTarget } from './collapseTargets.ts';

test('excludes the email, its descendants, and ancestors from collapse', () => {
  const child = { contains: () => false };
  const parent = { contains: (node) => node === survivor };
  const survivor = { contains: (node) => node === child };
  assert.equal(isSurvivorTarget(survivor, survivor), false);
  assert.equal(isSurvivorTarget(child, survivor), false);
  assert.equal(isSurvivorTarget(parent, survivor), false);
});
```

- [ ] **Step 2: Build semantic contact markup**

Render `WHEN EVERYTHING COLLAPSES, ONE SIGNAL ESCAPES.` as the visible heading. Keep email as a normal `mailto:` anchor with visible text, `data-contact-survivor`, and z-index above scene and collapse overlays.

- [ ] **Step 3: Implement vector collapse**

Measure target centers and core origin once per refresh. Animate outer words toward the core with directional x/y movement, inner words with scaleX stretch and rotation, then accelerate opacity only near the horizon. Navigation and secondary links join late. The email receives a small counter-motion but no destructive transform or opacity.

- [ ] **Step 4: Guarantee interaction after completion**

The collapse overlay is pointer-transparent. The survivor keeps `pointer-events: auto`, selection, focus outline, and activation. Reduced motion renders the final composition with no consumed content and the same email.

- [ ] **Step 5: Verify and commit**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

```bash
git add src/components/home src/components/navigation/Header.tsx src/hooks/useContactCollapse.ts src/motion/collapseTargets.ts src/motion/collapseTargets.test.mjs
git commit -m "feat(contact): add the final signal collapse"
```

### Task 10: Remove orphan infrastructure and enforce adaptive performance

**Files:**

- Modify: `src/main.tsx`
- Modify: `src/components/providers/SmoothScrollProvider.tsx`
- Modify: `src/three/scenePolicy.ts`
- Modify: `src/three/scenePolicy.test.mjs`
- Modify: `src/three/renderQuality.ts`
- Modify: `src/styles/GlobalStyle.ts`
- Modify: `src/styles/theme.ts`
- Delete after `rg` proves zero consumers: obsolete horizontal Work, old contact collapse, reload guard, ghost audit, HUD, redshift, sound, chat, and drag-only modules.

**Interfaces:**

- Consumes: final Motion Director, Route Transition Director, and persistent scene.
- Produces: no pre-React ghost or forced-scroll side effect unless the approved short reload continuity has an active consumer.

- [ ] **Step 1: Audit every legacy module before deletion**

Run:

```bash
rg -n "useHorizontalScroll|useSingularityIntro|useCollapse|reloadSnapshot|ghosts|introAudit|Hud|Redshift|SoundToggle|ChatWidget" src
```

For each result, classify it as active, replaced, or debug-only. Delete only replaced modules with zero runtime consumers. Preserve the procedural reference scene and any active signal/math utilities.

- [ ] **Step 2: Remove forced reload behavior**

`main.tsx` must not set manual restoration, force `window.scrollTo(0, 0)`, mount an unconsumed ghost layer, or hide the current route. If short reload continuity remains, initialize it only through the active Route Transition Director and release it with the same restoration path.

- [ ] **Step 3: Extend scene policy tests**

Cover hidden document, reduced motion, coarse pointer, narrow viewport, Save-Data, WebGL unavailable, and route content visible before the 3D lazy chunk.

- [ ] **Step 4: Enforce adaptive work limits**

Cap DPR per quality tier, reduce particle count and pointer response on economy mode, pause route-inactive chapter loops, and stop continuous R3F advancement when hidden. Apply `content-visibility: auto` only to below-fold case sections whose intrinsic size is explicitly reserved.

- [ ] **Step 5: Run full static verification and commit**

Run: `npm test && npm run format:check && npm run typecheck && npm run lint && npm run build && git diff --check`

Expected: all commands exit zero; Three.js remains a lazy chunk; no deleted import remains.

```bash
git add -A src
git commit -m "perf: remove orphan motion and bound scene cost"
```

### Task 11: Browser verification, visual correction, and documentation

**Files:**

- Create: `docs/verification/2026-08-31-motion-verification.md`
- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `.github/PULL_REQUEST_TEMPLATE.md` only if its current checklist cannot record the required verification.

**Interfaces:**

- Consumes: completed application and all verification contracts.
- Produces: evidence-backed release notes and a preserved local review branch.

- [ ] **Step 1: Run the full static gate from a clean worktree**

Run:

```bash
npm test
npm run format:check
npm run typecheck
npm run lint
npm run build
git diff --check
git status --short
```

Record command, exit status, test count, and build chunk sizes in the verification document.

- [ ] **Step 2: Verify route and history flows in the browser**

Test direct `/`, all three direct case URLs, Home -> Case, Case -> Home, Previous, Next, back, forward, hash links, brand return, refresh on every home chapter, and refresh on every case. Confirm URL, route heading, scroll destination, focus target, transition phase returning to `idle`, and unchanged scene instance.

- [ ] **Step 3: Verify interaction edge cases**

Test double-click, rapid different case clicks, popstate during anticipation, transition timeout, poster failure, media not loaded, Cmd/Ctrl-click, middle-click, keyboard activation, Escape where applicable, and tabbing after final collapse. Confirm Lenis is running or intentionally absent and no overlay intercepts input.

- [ ] **Step 4: Verify responsive and capability states**

Capture and compare 390x844, 768x1024, 1280x720, and 1920x1080 for home and all cases. Repeat critical flows with reduced motion, touch/coarse pointer, Save-Data/economy mode, WebGL unavailable, hidden/visible document, and delayed media. Assert `scrollWidth <= innerWidth` and no visible layout shift.

- [ ] **Step 5: Inspect runtime errors and cleanup**

Record console errors, warnings, required network failures, active ScrollTrigger count before/after repeated route transitions, global listener cleanup evidence, R3F scene instance identity, and email click/focus after collapse. Required error collections must be empty.

- [ ] **Step 6: Perform visual narrative review**

Watch one uninterrupted journey from entry through all home chapters, into every case, between cases, back to Work, and through Contact. Remove or reduce any effect that competes with reading, repeats another chapter's grammar, or causes frame instability. Re-run affected screenshots and flows after each correction.

- [ ] **Step 7: Update truthful documentation and commit**

Document the transition state machine, scroll contract, persistent scene, signal store, project themes, loading fail-safe, shared-media fallback, reduced-motion behavior, and verified performance boundaries.

```bash
git add README.md docs .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: verify the persistent singularity experience"
```

## Execution order and checkpoints

- Checkpoint A after Task 2: navigation state, history, scroll, and focus work without cinematic styling.
- Checkpoint B after Task 5: persistent scene, loading, and hero work as one coherent opening.
- Checkpoint C after Task 7: Home -> Case, Case -> Home, case-to-case, and three project identities work.
- Checkpoint D after Task 9: the homepage narrative and final email survivor work end to end.
- Release checkpoint after Task 11: static gates, browser matrix, cleanup evidence, and documentation are complete.

Do not begin a later visual checkpoint while its navigation or cleanup prerequisite is failing.
