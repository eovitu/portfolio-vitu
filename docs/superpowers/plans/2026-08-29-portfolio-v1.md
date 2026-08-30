# Singularity Portfolio v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:subagent-driven-development` (recommended) or
> `superpowers:executing-plans` to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an English-first, mobile-ready portfolio v1 with three honest
cases, direct contact, a styled 404 and a materially lighter Three.js runtime.

**Architecture:** Preserve the existing React/Vite single-page scrollytelling
architecture and its shared Lenis/GSAP/R3F clock. Move portfolio truth into a
strongly typed content model, let the current sections consume it, and isolate
launch-only routing and loading behavior at the application boundary.

**Tech Stack:** React 18, TypeScript, Vite, styled-components, GSAP,
ScrollTrigger, Lenis, Three.js and React Three Fiber.

**Spec:** `docs/V1-SPEC.md`

## Global Constraints

- Work only on `codex/v1-launch`, never `main`.
- Do not introduce claims that are not supported by inspected repositories or
  Figma flows.
- Keep all visible portfolio content in English.
- Preserve `frameloop="never"` and the single animation clock.
- No new runtime dependency without a measured benefit.
- Every animation must have a reduced-motion path and cleanup.
- Run the full verification suite before every completion claim and final push.

---

### Task 1: Collaboration and specification baseline

**Files:**

- Create: `docs/V1-SPEC.md`
- Create: `docs/superpowers/plans/2026-08-29-portfolio-v1.md`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Modify: `AGENTS.md`

**Interfaces:**

- Produces: the source of truth for every later task and the PR quality gate.

- [ ] Verify the branch with `git branch --show-current` and require
      `codex/v1-launch`.
- [ ] Add the v1 product/design specification with evidence boundaries.
- [ ] Add this executable implementation plan.
- [ ] Add a PR template covering product behavior, visual verification,
      accessibility, performance evidence and Conventional Commits.
- [ ] Run `npx prettier --check AGENTS.md docs .github`.
- [ ] Commit with `docs: define portfolio v1 launch specification`.

### Task 2: Real, typed portfolio content

**Files:**

- Modify: `src/lib/content.ts`
- Modify: `src/components/sections/Work/ProjectPanel.tsx`
- Modify: `src/components/sections/Work/Work.styles.ts`
- Modify: `src/components/sections/Hero/Hero.tsx`
- Modify: `src/components/sections/About/About.tsx`
- Modify: `src/components/sections/Skills/Skills.tsx`
- Modify: `src/components/sections/Contact/Contact.tsx`
- Modify: `src/components/navigation/Header.tsx`
- Test: `src/lib/content.test.mjs`

**Interfaces:**

- Produces: `Project`, `ProjectLink`, `projects`, `hero`, `about`, `skills`,
  `contact`, `nav` and `getProjectBySlug`.
- Consumes: verified Emprega.co, Doces da Pati and HelpPet evidence in the spec.

- [ ] Add a content test that rejects placeholders, missing English contact
      data, duplicate slugs and projects without highlights.
- [ ] Run the content test and confirm it fails against the placeholder model.
- [ ] Replace the placeholder project contract with stable slugs, status,
      highlights and optional verified links.
- [ ] Reposition the hero and about copy around backend engineering.
- [ ] Replace simulated chat CTAs with the prefilled email action.
- [ ] Render honest highlights and project links in each panel.
- [ ] Run the content test and `npm run typecheck`.
- [ ] Commit with `feat(content): publish verified portfolio cases`.

### Task 3: Editorial v1 experience and route fallback

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/styles/theme.ts`
- Modify: `src/styles/GlobalStyle.ts`
- Modify: `src/components/sections/Hero/Hero.styles.ts`
- Modify: `src/components/sections/Work/Work.styles.ts`
- Modify: `src/components/navigation/Header.tsx`
- Create: `src/components/layout/LaunchIntro.tsx`
- Create: `src/components/layout/NotFound.tsx`
- Modify: `index.html`

**Interfaces:**

- Produces: `LaunchIntro`, `NotFound` and a pathname gate in `App`.
- Consumes: existing intro readiness, warp hooks and content contracts.

- [ ] Add immediately visible HTML copy and English metadata.
- [ ] Implement a short first-visit launch transition with no forced wait and
      a reduced-motion bypass.
- [ ] Add a semantic styled 404 with home and email actions.
- [ ] Refine the project panels for real editorial evidence and mobile flow.
- [ ] Remove chat runtime wiring and dead launch placeholders.
- [ ] Verify keyboard focus and route behavior manually.
- [ ] Run format, typecheck and lint.
- [ ] Commit with `feat(ui): deliver editorial launch experience`.

### Task 4: Three.js and motion performance

**Files:**

- Modify: `src/three/renderQuality.ts`
- Modify: `src/three/SingularityCanvas.tsx`
- Modify: `src/three/singularityScene.ts`
- Modify: `src/components/providers/SmoothScrollProvider.tsx`
- Test: `src/three/renderQuality.test.ts`

**Interfaces:**

- Produces: `QualityTier`, `detectTier(capabilities?)`, tier settings and a
  visibility-aware frame driver.
- Consumes: the existing shared frame registration and stage presence signal.

- [ ] Write tier tests for constrained mobile, balanced and high-capability
      devices.
- [ ] Run tests and confirm the new balanced tier cases fail.
- [ ] Implement three quality tiers with bounded DPR and geometry budgets.
- [ ] Pause canvas advancement on `document.hidden` and heavily throttle when
      its visual contribution is absent.
- [ ] Remove the ineffective fixed-wrapper intersection observer.
- [ ] Reduce sphere segments and consolidate safe decorative draw calls without
      changing the core visual mechanism.
- [ ] Run tests, typecheck, lint and a production build; record chunk sizes.
- [ ] Commit with `perf(three): scale the singularity across devices`.

### Task 5: Launch verification and repository handoff

**Files:**

- Modify: `README.md`
- Modify: `docs/ARCHITECTURE.md`
- Modify: `docs/BUGS-ABERTOS.md` only when evidence changed

**Interfaces:**

- Consumes: the complete v1 behavior.
- Produces: verified operating documentation and review-ready branch.

- [ ] Run all unit tests, format check, typecheck, lint and production build.
- [ ] Inspect desktop and mobile in-browser screenshots, console and network.
- [ ] Verify keyboard navigation, reduced motion, WebGL fallback and 404.
- [ ] Run a simplicity pass and remove only code orphaned by this v1.
- [ ] Update documentation with the actual, measured implementation.
- [ ] Run `git diff --check` and inspect the complete diff.
- [ ] Commit with `docs: prepare portfolio v1 handoff` when documentation
      changed.
- [ ] Push `codex/v1-launch` and prepare a PR using the repository template.
