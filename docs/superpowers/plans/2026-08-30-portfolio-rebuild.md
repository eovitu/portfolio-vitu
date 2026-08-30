# Portfolio Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio into an English, evidence-led professional site with a clear homepage, three navigable case studies, direct contact, and a progressively loaded procedural singularity.

**Architecture:** Keep React 18, Vite, styled-components, GSAP, Lenis, and the existing procedural Three.js scene. Centralize verified content in typed records, use a dependency-free pathname route boundary for four static routes, render useful HTML before lazy WebGL, and make motion an enhancement over native vertical reading.

**Tech Stack:** React 18, TypeScript, Vite, styled-components, GSAP/ScrollTrigger, Lenis, Three.js, @react-three/fiber, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-30-portfolio-rebuild-design.md`

## Global Constraints

- Work only on `codex/portfolio-rebuild`; never modify `main` directly.
- UI, metadata, accessible names, and case content are English only.
- Do not invent metrics, clients, outcomes, public links, or production status.
- Preserve the procedural singularity and the single animation clock.
- Do not add a routing, UI, animation, or state dependency without demonstrated necessity.
- Native scrolling remains unmodified on touch devices and no progressive wheel resistance is allowed.
- Contact content, project actions, and navigation must remain usable without WebGL or animation.
- Use Conventional Commits with no co-author trailer.

---

### Task 1: Typed content and pathname contract

**Files:**

- Create: `src/lib/routes.ts`
- Create: `src/lib/routes.test.mjs`
- Create: `src/lib/content.test.mjs`
- Modify: `src/lib/content.ts`
- Modify: `package.json`

**Interfaces:**

- Produces: `type Route = { kind: 'home' } | { kind: 'case'; slug: ProjectSlug }`
- Produces: `resolveRoute(pathname: string): Route`
- Produces: `hrefForCase(slug: ProjectSlug): string`
- Produces: `type ProjectSlug = 'emprega-co' | 'doces-da-pati' | 'helppet'`
- Produces: `projects: readonly Project[]`, with summary, ownership, verified links, media, and case sections.

- [ ] **Step 1: Add route and content contract tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { hrefForCase, resolveRoute } from './routes.ts';

test('resolves home and every public case path', () => {
  assert.deepEqual(resolveRoute('/'), { kind: 'home' });
  assert.deepEqual(resolveRoute('/work/emprega-co'), { kind: 'case', slug: 'emprega-co' });
  assert.equal(hrefForCase('helppet'), '/work/helppet');
});

test('unknown paths fall back to home without inventing a route', () => {
  assert.deepEqual(resolveRoute('/missing'), { kind: 'home' });
});
```

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { projects } from './content.ts';

test('publishes exactly three complete, unique cases', () => {
  assert.deepEqual(
    projects.map((project) => project.slug),
    ['emprega-co', 'doces-da-pati', 'helppet'],
  );
  for (const project of projects) {
    assert.ok(project.summary.length > 30);
    assert.ok(project.ownership.length >= 2);
    assert.ok(project.media.poster.startsWith('/'));
    assert.ok(project.sections.length >= 3);
  }
});
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run: `node --experimental-strip-types --test src/lib/routes.test.mjs src/lib/content.test.mjs`

Expected: failure because `routes.ts` and the new project fields do not exist.

- [ ] **Step 3: Implement exact typed contracts and English content**

`routes.ts` normalizes trailing slashes and returns only the four supported route states. `content.ts` exports typed `site`, `navigation`, `hero`, `projects`, `profile`, `about`, and `contact` records. External actions are omitted when no verified URL exists. GitHub uses `https://github.com/eovitu`; email uses `mailto:eovitu7@gmail.com`; LinkedIn remains omitted until its verified URL is available.

- [ ] **Step 4: Add the test script and run the contract suite**

Add to `package.json`:

```json
"test": "node --experimental-strip-types --test src/**/*.test.mjs"
```

Run: `npm test`

Expected: all route and content contract tests pass.

- [ ] **Step 5: Commit**

```bash
git add package.json src/lib/content.ts src/lib/routes.ts src/lib/routes.test.mjs src/lib/content.test.mjs
git commit -m "feat(content): define portfolio cases and routes"
```

### Task 2: Global foundation, metadata, and navigation

**Files:**

- Create: `src/components/navigation/MobileMenu.tsx`
- Create: `src/lib/metadata.ts`
- Create: `src/lib/metadata.test.mjs`
- Modify: `index.html`
- Modify: `src/App.tsx`
- Modify: `src/components/navigation/Header.tsx`
- Modify: `src/styles/GlobalStyle.ts`
- Modify: `src/styles/theme.ts`

**Interfaces:**

- Consumes: `resolveRoute`, `navigation`, `site`, `contact`
- Produces: `applyMetadata(route: Route): void`
- Produces: `Header({ route, onNavigate }: HeaderProps)` with desktop links and an accessible mobile dialog menu.

- [ ] **Step 1: Write metadata tests**

```js
import assert from 'node:assert/strict';
import test from 'node:test';
import { metadataFor } from './metadata.ts';

test('uses professional English metadata for home and cases', () => {
  const home = metadataFor({ kind: 'home' });
  assert.equal(home.lang, 'en');
  assert.match(home.title, /Backend Developer/);
  const caseMeta = metadataFor({ kind: 'case', slug: 'doces-da-pati' });
  assert.match(caseMeta.canonical, /\/work\/doces-da-pati$/);
});
```

- [ ] **Step 2: Run the metadata test and confirm failure**

Run: `node --experimental-strip-types --test src/lib/metadata.test.mjs`

Expected: failure because `metadata.ts` does not exist.

- [ ] **Step 3: Implement document and navigation foundation**

Implement `metadataFor` as a pure function and `applyMetadata` as the DOM writer. Set `<html lang="en">`, English description, canonical, `og:url`, `og:locale=en_US`, and JSON-LD `Person`. Add `color-scheme: dark`, section `scroll-margin-top`, visible focus, dynamic viewport tokens, and a 12 px utility floor. The mobile menu must expose Work, Profile, About, and Contact; Escape closes it and focus returns to the trigger.

- [ ] **Step 4: Verify foundation**

Run: `npm test && npm run typecheck && npm run lint`

Expected: all commands pass.

- [ ] **Step 5: Commit**

```bash
git add index.html src/App.tsx src/components/navigation src/lib/metadata.ts src/lib/metadata.test.mjs src/styles
git commit -m "feat(navigation): establish accessible site foundation"
```

### Task 3: Evidence-led homepage

**Files:**

- Create: `src/components/sections/Profile/Profile.tsx`
- Create: `src/components/sections/Profile/Profile.styles.ts`
- Modify: `src/components/sections/Hero/Hero.tsx`
- Modify: `src/components/sections/Hero/Hero.styles.ts`
- Modify: `src/components/sections/Work/Work.tsx`
- Modify: `src/components/sections/Work/Work.styles.ts`
- Modify: `src/components/sections/Work/ProjectPanel.tsx`
- Modify: `src/components/sections/About/About.tsx`
- Modify: `src/components/sections/Contact/Contact.tsx`
- Modify: `src/App.tsx`

**Interfaces:**

- Consumes: `hero`, `projects`, `profile`, `about`, `contact`, `hrefForCase`
- Produces: vertical `Selected Work` previews with `View Case Study` and verified external actions.
- Produces: readable capability groups before any optional spectral enhancement.

- [ ] **Step 1: Add homepage source regression tests**

Create `src/lib/homepage.test.mjs` that reads rendered-source contracts and asserts English CTA strings, links to all three case paths, visible email content, and absence of progressive wheel resistance assignments.

```js
assert.match(workSource, /View Case Study/);
assert.match(contactSource, /eovitu7@gmail\.com/);
assert.doesNotMatch(scrollSource, /wheelMultiplier\s*=/);
```

- [ ] **Step 2: Run the homepage test and confirm failure**

Run: `node --experimental-strip-types --test src/lib/homepage.test.mjs`

Expected: failure because the current homepage uses Portuguese copy, horizontal work panels, and placeholder actions.

- [ ] **Step 3: Rebuild the homepage sections**

Use a normal vertical document flow. Keep the hero singularity stage, but make the text and two CTAs immediately readable. Each work preview uses a real `<video>` or `<img>` element with poster, explicit dimensions, muted `playsInline`, and no autoplay audio. Build Profile as four semantic capability groups. Shorten About copy while preserving `victor-2010.jpg`. Make Contact display availability, email, GitHub, and future résumé omission explicitly through absent data rather than disabled UI.

- [ ] **Step 4: Remove homepage-only obsolete wiring**

Remove imports and runtime calls made obsolete by the new vertical Work and direct Contact flow, including horizontal panel orchestration and contact collapse consumers. Do not delete reusable files until `rg` confirms no consumer remains.

- [ ] **Step 5: Verify homepage**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Expected: all commands pass and the build contains no placeholder project names.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/sections src/lib/homepage.test.mjs
git commit -m "feat(home): rebuild portfolio around proof of work"
```

### Task 4: Three individual case-study routes

**Files:**

- Create: `src/components/cases/CaseStudy.tsx`
- Create: `src/components/cases/CaseStudy.styles.ts`
- Create: `src/components/cases/CaseMedia.tsx`
- Create: `src/components/cases/CaseNavigation.tsx`
- Create: `src/components/cases/CaseStudy.test.mjs`
- Modify: `src/App.tsx`
- Modify: `src/lib/content.ts`
- Create: `public/media/emprega-co-poster.webp`
- Create: `public/media/doces-da-pati-poster.webp`
- Create: `public/media/helppet-poster.webp`
- Create: optimized preview videos under `public/media/`

**Interfaces:**

- Consumes: `Project`, `ProjectSlug`, `projects`, `hrefForCase`
- Produces: `CaseStudy({ project }: { project: Project })`
- Produces: `CaseMedia({ media }: { media: ProjectMedia })`

- [ ] **Step 1: Write case structure tests**

```js
test('case component exposes one heading, factual sections and adjacent navigation', () => {
  assert.match(source, /project\.sections\.map/);
  assert.match(source, /CaseNavigation/);
  assert.match(source, /<h1/);
});
```

- [ ] **Step 2: Run the case test and confirm failure**

Run: `node --experimental-strip-types --test src/components/cases/CaseStudy.test.mjs`

Expected: failure because case components do not exist.

- [ ] **Step 3: Prepare real media assets**

Use the supplied recordings as sources:

- `C:/Users/vitu/Videos/Captures/Emprega.co - Page Flow - Google Chrome 2026-08-30 12-22-23.mp4`
- `C:/Users/vitu/Videos/Captures/Os Doces da Pati — Doces artesanais na zona sul de SP - Google Chrome 2026-08-30 12-16-24.mp4`
- `C:/Users/vitu/Videos/Captures/HelpPet - Design System - Page Flow - Google Chrome 2026-08-30 12-23-32.mp4`

Encode muted H.264 previews at a maximum width of 1440 px and create WebP posters from representative frames. Keep source recordings outside Git. Record final byte sizes in the commit message body when a preview exceeds 3 MB.

- [ ] **Step 4: Implement case composition and navigation**

Render project thesis, real media, context, ownership, decisions, architecture, constraints, factual outcome, verified actions, and previous/next cases. On pathname navigation, update metadata, scroll to the top for an explicit case navigation action, and focus the case `h1`. Direct refresh must render the same case.

- [ ] **Step 5: Verify every route**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Expected: all four route contracts pass and media paths exist in `dist/media`.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/cases src/lib/content.ts public/media
git commit -m "feat(cases): add navigable project case studies"
```

### Task 5: Motion simplification and progressive WebGL

**Files:**

- Create: `src/three/scenePolicy.ts`
- Create: `src/three/scenePolicy.test.mjs`
- Modify: `src/components/layout/SingularityStage.tsx`
- Modify: `src/components/providers/SmoothScrollProvider.tsx`
- Modify: `src/hooks/useSingularityIntro.ts`
- Modify: `src/three/SingularityCanvas.tsx`
- Modify: `src/three/Scene.tsx`
- Modify: `src/three/renderQuality.ts`
- Modify: `src/App.tsx`
- Delete only after consumer audit: obsolete HUD, redshift, sound, collapse, and horizontal-scroll files.

**Interfaces:**

- Produces: `sceneMode(input: ScenePolicyInput): 'poster' | 'economy' | 'full'`
- Produces: `shouldRenderScene(input: { visible: boolean; documentVisible: boolean; reducedMotion: boolean }): boolean`
- Consumes: existing single-clock `advance()` ownership.

- [ ] **Step 1: Write scene policy tests**

```js
test('falls back before WebGL and uses economy mode on constrained devices', () => {
  assert.equal(
    sceneMode({ webgl: false, coarse: false, width: 1440, saveData: false }),
    'poster',
  );
  assert.equal(
    sceneMode({ webgl: true, coarse: true, width: 390, saveData: false }),
    'economy',
  );
});

test('does not render while the document is hidden', () => {
  assert.equal(
    shouldRenderScene({ visible: true, documentVisible: false, reducedMotion: false }),
    false,
  );
});
```

- [ ] **Step 2: Run the policy tests and confirm failure**

Run: `node --experimental-strip-types --test src/three/scenePolicy.test.mjs`

Expected: failure because policy functions do not exist.

- [ ] **Step 3: Implement progressive scene loading**

Paint the hero poster and useful HTML first. Lazy import `SingularityCanvas` after the initial content commit, subject to the policy. Preserve `frameloop="never"` and the one GSAP-driven clock. Pause advancement on `visibilitychange`, lower DPR and dust count in economy mode, and provide a permanent poster fallback after WebGL failure.

- [ ] **Step 4: Simplify global motion**

Remove wheel-multiplier mutation, forced top restoration, reload ghosts, persistent telemetry, and contact consumption. Retain one motivated hero entrance, section reveals, and the singularity-to-first-case transition. Every retained timeline must have cleanup and a reduced-motion completion state.

- [ ] **Step 5: Verify motion and build budgets**

Run: `npm test && npm run typecheck && npm run lint && npm run build`

Expected: all checks pass; WebGL remains a lazy chunk; initial HTML and main CSS do not depend on the canvas resolving.

- [ ] **Step 6: Commit**

```bash
git add src package.json
git commit -m "perf(three): load the singularity progressively"
```

### Task 6: Browser verification, SEO assets, and delivery

**Files:**

- Create: `public/og.png`
- Create: `public/resume/.gitkeep` only if the empty directory is needed by build tooling; otherwise create no résumé artifact.
- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `.github/PULL_REQUEST_TEMPLATE.md` if absent or inaccurate.

**Interfaces:**

- Consumes: all public routes and progressive scene states.
- Produces: documented architecture and a reviewable pull request.

- [ ] **Step 1: Run the complete static verification**

Run: `npm test && npm run format:check && npm run typecheck && npm run lint && npm run build`

Expected: every command exits zero.

- [ ] **Step 2: Start the production preview**

Run: `npm run preview -- --host 127.0.0.1`

Expected: Vite reports a local HTTP URL and all four direct paths return the app shell.

- [ ] **Step 3: Verify desktop and responsive layouts in a browser**

Check 390×844, 768×1024, 1280×720, and 1920×1080. At every size assert no horizontal overflow. Verify mobile menu open/close/focus return, homepage anchors, all case links, previous/next case navigation, email, GitHub, media posters, video controls, and visible Contact.

- [ ] **Step 4: Verify alternate capability states**

Test `prefers-reduced-motion`, a failed canvas import/WebGL context, document hidden/visible transitions, keyboard-only navigation, direct case refresh, browser back, and a touch-sized viewport. Capture console errors and required network failures; both collections must be empty.

- [ ] **Step 5: Update truthful documentation**

Document the new information architecture, route boundary, progressive scene policy, verified commands, media handling, and remaining absent public data. Remove descriptions of forced reload-to-top, progressive scroll resistance, horizontal work, and contact collapse.

- [ ] **Step 6: Commit documentation and social asset**

```bash
git add public/og.png README.md docs/ARCHITECTURE.md .github/PULL_REQUEST_TEMPLATE.md
git commit -m "docs: document the rebuilt portfolio"
```

- [ ] **Step 7: Push and open the review pull request**

```bash
git push -u origin codex/portfolio-rebuild
gh pr create --base main --head codex/portfolio-rebuild --title "feat: rebuild the portfolio around project evidence" --body-file .github/PULL_REQUEST_TEMPLATE.md
```

Expected: branch protection checks pass and the Vercel preview deployment completes without modifying `main`.
