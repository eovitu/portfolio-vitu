# Portfolio Rebuild - Persistent Singularity Experience

## Status

Approved by Victor Hugo on 31 August 2026, including the explicit transition-state, scroll-restoration, and safe shared-media contracts. This document supersedes the motion and route-transition decisions in the 30 August version while preserving its product, content, accessibility, and evidence requirements.

Implementation must remain on `codex/portfolio-rebuild`. Application code may be edited only after the detailed implementation plan has been presented and Victor authorizes execution.

## Product objective

The portfolio must let a recruiter or potential client understand within 30 seconds that Victor Hugo:

- is a backend developer with product and interface capability;
- builds reliable systems with Java, Spring, TypeScript, and React;
- has worked on Emprega.co, Doces da Pati, and HelpPet;
- accepts opportunities worldwide;
- can be contacted directly.

The primary positioning remains:

> Backend developer building reliable products from system architecture to expressive interfaces.

Public interface copy and metadata use English. Claims must remain factual. No metric, client relationship, production status, feature, or result may be invented.

## Design read

This is a preserve-mode redesign of an experimental developer portfolio for international recruiters, companies, and clients.

- `DESIGN_VARIANCE: 9`
- `MOTION_INTENSITY: 9`
- `VISUAL_DENSITY: 6`
- Personality: cinematic, premium, technological, experimental
- Motion vocabulary: gravity, orbit, emission, compression, matter, collapse
- Ambition reference: Shopify Editions Winter 2026, without copying its identity

The current information hierarchy, responsive structure, factual project presentation, English copy, and direct contact paths are preserved. The redesign must restore tension, life, motion, and authored composition across the entire experience.

## Experience principle

The singularity is both the visual character and the continuity system of the site. It remains mounted across home, route transitions, case studies, navigation between cases, return to home, and the final collapse.

The experience follows this order:

> impact -> evidence -> depth -> human context -> direct signal

Spectacle must never make content harder to reach, read, activate, or revisit. The complete experience remains understandable without WebGL, with reduced motion, on a modest mobile device, and through direct URLs.

## Information architecture

The public structure remains stable:

```text
/
|- Hero
|- Selected Work
|  |- Emprega.co
|  |- Doces da Pati
|  `- HelpPet
|- Engineering Profile
|- About
`- Contact

/work/emprega-co
/work/doces-da-pati
/work/helppet
```

Route slugs, primary navigation labels, project order, verified actions, and public contact details remain unchanged.

## Architectural model

The application uses a hybrid, centralized motion architecture:

```text
Lenis
  -> GSAP ticker
  -> ScrollTrigger
  -> Motion Director
  -> Route Transition Director
  -> shared numeric signals
  -> React DOM + persistent R3F scene
```

There is one animation clock. No feature may create a competing global `requestAnimationFrame`, another smooth-scroll engine, or an independent global timeline.

### Motion Director

The Motion Director owns page-level choreography, not component content. Its responsibilities are:

- first-entry and repeat-entry timelines;
- chapter presence and section transitions;
- Lenis velocity sampling and scroll-linked tension;
- DOM animation lifecycle and cleanup;
- shared motion tokens and reduced-motion completion states;
- numeric signals sent to the Three.js scene;
- activation and release of temporary `will-change` layers.

Section components expose stable data attributes or refs. They do not create overlapping authorities over the same transform.

### Route Transition Director

The Route Transition Director owns eligible internal navigation:

- intercept unmodified primary-button clicks only;
- preserve real `href` values and non-JavaScript fallback;
- preserve Cmd/Ctrl-click, Shift-click, Alt-click, middle-click, download links, external links, and new-tab behavior;
- update the URL with `history.pushState` after visual occlusion;
- respond to `popstate` without creating another history entry;
- update route metadata;
- restore or set scroll according to the navigation context;
- move focus to the new primary heading after the transition;
- unlock scrolling and remove overlays on completion, interruption, timeout, or error.

The View Transitions API may enhance supported browsers, but navigation correctness and the principal visual transition cannot depend on it.

The director is an explicit finite-state machine:

```text
idle -> anticipating -> occluding -> swapping -> revealing -> idle
```

Only `idle` accepts an ordinary new transition. Double-clicks are deduplicated. A competing navigation or `popstate` is queued as the next valid intent or replaces the current intent only at a safe cancellation boundary. Every state has a bounded timeout and an `AbortController` owned by the active transition.

One idempotent restoration path runs after success, cancellation, error, timeout, or application teardown. It must:

- kill the active timeline and associated ScrollTriggers;
- remove media representations, clones, masks, and eclipse overlays;
- clear temporary inline styles and `will-change`;
- unlock Lenis and body interaction;
- settle on one valid route and URL;
- apply the route's deterministic scroll target;
- restore focus to a valid destination;
- return the machine to `idle`.

The director never leaves an intermediate route visually exposed or an invisible overlay intercepting input.

### Deterministic scroll contract

- Home -> Case: scroll to the top of the selected case.
- Case -> Case: scroll to the top of the next case.
- Case -> Home: scroll to the corresponding project chapter.
- Hash or deep link: resolve the requested target after the route DOM is ready.
- Back or forward: restore the registered position when it is finite and valid for the mounted document; otherwise use the route default.
- Reload: retain native browser behavior and never force `scrollY = 0`.

History entries store route identity and an optional finite scroll position. Positions are recorded before a route leaves and clamped against the mounted document before restoration.

### Persistent scene

`SingularityStage` remains mounted at the application shell level for all public routes. Route content changes beneath or above the persistent scene without recreating its renderer.

The scene receives numeric signals and has no direct knowledge of DOM structure:

```text
route
chapter
transitionProgress
transitionOrigin
energy
presence
scale
position
flare
particleDensity
projectTheme
scrollVelocity
```

The signal store is mutable and allocation-free in the frame path. React state is not used for continuous pointer, scroll, camera, or transition values.

The scene must:

- reuse the existing procedural singularity;
- retain `frameloop="never"` and advance from the shared ticker;
- pause while the document is hidden;
- reduce DPR, particles, and post-processing cost on modest devices;
- avoid renderer reconstruction during route changes;
- dispose of geometries, materials, textures, listeners, and observers at the real application teardown boundary;
- expose a poster/static fallback if WebGL or the lazy chunk fails.

## Motion identity

### Timing palette

- quick: 120-180 ms
- standard: 280-450 ms
- slow: 650-1100 ms
- first entry: 1200-1800 ms, with a 2200 ms absolute fail-safe
- home to case: 900-1200 ms
- case to case: 650-900 ms

The main on-screen curve is a controlled premium ease. Attraction accelerates inward, expulsion decelerates outward, collapse accelerates, and environmental motion uses a low-amplitude sine character.

Every major motion contains:

1. preparation;
2. primary action;
3. secondary response;
4. resolution.

Movement is organized into three layers:

- primary: the action that guides attention;
- secondary: typography, media, controls, and light responding to it;
- ambient: particles, dust, subtle oscillation, and low-frequency scene life.

No more than one primary action competes for attention at a time.

## Loading and first entry

Useful HTML renders before the WebGL bundle resolves. The loader is a temporary visual layer, not a prerequisite for application correctness.

First visit:

1. the screen begins nearly empty;
2. small signals and fragments appear;
3. matter converges toward the transition origin;
4. the core forms;
5. the accretion disc receives energy and flare;
6. expelled energy reveals navigation and hero typography;
7. the loader settles into the exact hero composition without a cut.

The sequence lasts 1.2-1.8 seconds only when the required assets are genuinely becoming ready. A repeat visit receives a 250-450 ms pulse. Reduced motion paints the final composition immediately. WebGL failure, timeout, or interrupted loading always releases the interface.

## Homepage choreography

### Hero

The hero remains professionally understandable within a few seconds, but no longer resembles a generic minimalist SaaS landing page.

- asymmetric composition;
- continuous low-amplitude singularity motion;
- kinetic typography with dedicated outer and inner transform channels;
- gravitational tension on nearby glyphs;
- moderate pointer response on fine pointers;
- touch receives a cheaper non-pointer alternative;
- scene energy reacts to scroll velocity without changing scroll distance;
- CTA press, release, focus, and magnetic response remain fast and interruptible;
- editorial metadata may reinforce positioning only when it contains real information.

The old draggable-letter toy is not restored. It behaves as an isolated gimmick and conflicts with the single-author transform model.

### Hero to Work

The first project appears as matter expelled by the singularity:

1. hero typography compresses toward the core;
2. the disc changes scale and screen position;
3. particles establish a directional path;
4. the Emprega.co media is revealed through an emission-shaped mask;
5. atmosphere resolves into the first project theme.

The document remains vertical. No horizontal scroll trap or progressive wheel resistance returns.

### Selected Work

The three project previews share content contracts but not composition. Each is a distinct chapter with its own media scale, reading rhythm, particle behavior, transition, and relationship between text and image.

The section retains:

- real project media;
- clear name, summary, ownership, role, stack, and actions;
- a visible case-study CTA;
- verified public actions only;
- keyboard, touch, reduced-motion, and fallback completeness.

It gains:

- chapter progress;
- controlled media depth and parallax;
- atmosphere transitions;
- scene signals derived from the active project;
- preload on eligible link hover or focus;
- non-repeating entrance choreography.

### Engineering Profile

Backend remains the center of gravity. The section becomes an editorial system map rather than a four-card grid.

- every capability is visible without interaction;
- relationships between backend, product, interface, and motion are expressed spatially;
- technologies respond to focus, hover, and chapter progress;
- no dashboard-style scoring or fabricated precision;
- no essential information exists only on hover.

### About

About is a deliberate material transformation:

1. the dark field compresses;
2. a luminous line crosses the viewport;
3. a light editorial surface is exposed;
4. the photograph develops like an image being printed;
5. text enters with a slower, human rhythm.

The composition must not fall back to a generic image-left/text-right split. The original photograph remains the real visual asset and receives an editorial crop and treatment without modifying the source file.

### Contact and final collapse

The closing statement is:

> WHEN EVERYTHING COLLAPSES, ONE SIGNAL ESCAPES.

During the final scroll range:

- navigation loses presence;
- the title, supporting copy, and secondary links feel attraction;
- words tilt, stretch, accelerate, and are consumed by the core;
- optional fragments from previous chapters may return only if measurements show acceptable cost;
- the singularity grows and recovers the loader's energy;
- the viewport approaches a controlled visual collapse.

The email is excluded from absorption targets and remains visible, selectable, clickable, keyboard-focusable, above the scene, present under reduced motion, and available when WebGL fails.

## Internal route choreography

### Home to case

1. Anticipation, 80-140 ms
   - CTA compresses slightly.
   - selected media motion settles.
   - nearby particles change direction.
   - the scene receives the click origin.
2. Attraction, 300-450 ms
   - core moves partially toward the selected project.
   - title, metadata, and media edges stretch toward it.
   - a visual clone of the media begins the shared transition when available.
3. Eclipse, 180-260 ms
   - event horizon covers the viewport.
   - Lenis locks only for the occluded route swap.
   - URL, route content, metadata, and scroll state update.
4. Expulsion, 450-700 ms
   - case media emerges from the disc.
   - shared media clone resolves into the case hero rectangle.
   - title and supporting content arrive in layers.
   - scene settles into the selected project theme.

The shared-media representation must not depend on directly cloning or replaying an active `<video>`, because browsers may produce a black or unavailable frame. The source priority is:

1. the project's poster image when loaded;
2. a safe captured visual representation when the browser supports it and capture succeeds;
3. a clone of the static media-frame surface without the live video node;
4. no shared element.

A failed or unavailable representation falls back immediately to the same eclipse and case reveal without shared media.

### Case to home

The transition is a semantic inverse, not a literal reversed timeline:

- case matter compresses;
- the route swaps while occluded;
- the selected project returns to its home orbit;
- scroll settles at that project chapter;
- focus returns to the initiating link when the navigation originated there, otherwise to the home primary heading.

### Case to case

Previous and Next use a shorter 650-900 ms transition:

- current project loses matter;
- core pulses;
- project theme and particle field interpolate;
- next media is expelled;
- scroll returns to the top;
- focus moves to the new `h1`.

### Back, forward, direct URLs, and reload

- Direct case URLs render the complete case without requiring a home visit.
- Browser back and forward trigger a route-aware transition without creating new history entries.
- Modified clicks retain native behavior.
- Reload preserves normal browser behavior and never forces a long first-entry sequence.
- A reload may use a short visible-state absorption only when a valid snapshot exists.
- The previous forced `scrollY = 0` guard is removed.
- Explicit return to the brand/home may perform the full absorb-and-reconstruct behavior.

## Project identity system

All cases consume a shared semantic content contract and accessibility structure, but each uses its own CSS variables, layout composition, media behavior, and scene theme.

### Emprega.co: system and orbit

- structural, precise, dense, architectural;
- relationship grids and orbital lines;
- media arranged in perspective planes;
- controlled horizontal type compression;
- firm movement with low overshoot;
- black, mineral, warm gold, and white light;
- organized particle paths;
- emphasis on platform architecture, contracts, backend, and product flow.

### Doces da Pati: matter and heat

- tactile, warm, human, fluid;
- closer media composition;
- layered forms inspired by preparation, packaging, and transformation;
- expansion, folding, and vertical flow;
- warmer tones derived from the real media;
- singularity interpreted as heat and transformation;
- no generic confectionery styling or invented commercial outcomes.

### HelpPet: connection and living field

- clear, connected, trustworthy, technological;
- points, connections, and depth;
- elements approach as a care network;
- cooler palette derived from the real project;
- more spacious particles;
- modular interface compositions instead of generic cards;
- no invented functionality, metrics, or production claims.

## Lenis and scroll behavior

Lenis contributes fluency and synchronized motion, never resistance.

- desktop receives consistent smooth scrolling;
- touch retains natural behavior;
- reduced motion may omit Lenis entirely;
- ScrollTrigger stays synchronized with Lenis;
- programmatic scroll uses the provider API;
- route transitions lock only during visual occlusion;
- scroll velocity can drive tension, skew, particles, and scene energy where motivated;
- no progressive wheel resistance;
- no exaggerated duration or reduced travel distance;
- anchors, deep links, and browser history remain functional.

## Performance and accessibility contract

- one frame loop;
- useful content before the 3D chunk;
- adaptive DPR and particle count;
- no heavy infinite animation outside visible chapters;
- transforms and opacity as primary animated properties;
- layout reads batched before animation writes;
- `will-change` applied temporarily;
- scoped GSAP contexts with complete cleanup;
- no orphan listeners, timelines, ScrollTriggers, clones, or overlays;
- renderer paused while hidden;
- explicit Three.js disposal;
- static WebGL fallback;
- no horizontal overflow;
- dynamic viewport and safe-area support;
- one ordered heading structure per route;
- semantic anchors and controls;
- visible focus throughout every composited state;
- focus management after route transitions;
- reduced-motion completion states, not merely shorter durations;
- contact and project actions available without animation;
- contrast preserved during theme and eclipse transitions.

## Existing infrastructure decisions

The current source contains valuable motion work, but it is not reactivated blindly.

- `SmoothScrollProvider`: preserved as the single clock and Lenis boundary.
- `SingularityStage`: promoted to the persistent application shell.
- `SingularityCanvas`: preserved and extended to consume route/chapter signals.
- `useReveal`: retained after aligning selectors with current markup.
- `useParallax`: retained for measured media depth.
- `useGravityLetters`: simplified to gravitational tension; drag/fall toy removed.
- `useCollapse`: reworked for word-level vector stretch and survivor guarantees.
- `useSingularityIntro`: decomposed into entry and route-transition responsibilities.
- `stagePresence`: rewritten around current chapters and routes; old pin-spacer assumptions removed.
- `reloadSnapshot` and `ghosts`: reduced to valid short reload continuity or removed if verification cannot justify their cost.
- old horizontal Work, progressive resistance, telemetry, sound, and unrelated effects are not restored.

## Delivery sequence

1. Update this specification and obtain approval.
2. Write a task-level implementation plan.
3. Correct orphan infrastructure and establish shared motion signals.
4. Keep the singularity mounted across all routes.
5. Implement route state and transition director with history, focus, and fallback behavior.
6. Implement first entry and hero choreography.
7. Recompose Selected Work into three visual chapters.
8. Give each case a distinct themed layout and scene response.
9. Redesign Engineering Profile and About.
10. Implement final collapse and email survivor.
11. Complete mobile, reduced-motion, fallback, and adaptive-quality behavior.
12. Remove effects and legacy code that do not contribute.
13. Verify the whole experience as one narrative.

Implementation uses small Conventional Commits with no co-author trailer. `main` is not modified directly.

## Verification contract

Static gates:

- tests;
- formatting;
- typecheck;
- lint;
- production build.

Browser and experience gates:

- direct navigation to all four public routes;
- Home -> Case, Case -> Home, Previous, Next;
- browser back and forward;
- Cmd/Ctrl-click and middle-click;
- route metadata and focus management;
- anchors and explicit return to top;
- reload on Hero, Work, Profile, About, Contact, and every case;
- 390x844, 768x1024, 1280x720, and 1920x1080;
- touch-sized viewport and keyboard-only navigation;
- reduced motion;
- WebGL unavailable;
- slow connection and delayed media;
- hidden/visible document transitions;
- console and required network errors;
- horizontal overflow and layout shift;
- timeline, listener, overlay, and WebGL resource cleanup;
- email activation after final collapse;
- screenshots before and after each major chapter;
- complete comprehension with motion disabled.

The task is complete only when the singularity connects the whole experience, each project reads as a distinct world, the site remains professionally clear, and no navigation, accessibility, or performance regression is introduced.

## Explicit non-goals

- No copied Shopify visual identity.
- No router, animation, UI, or state dependency without demonstrated need.
- No return of fragile horizontal scroll or progressive wheel resistance.
- No fabricated metrics, testimonials, production claims, or features.
- No unrelated 3D objects added for complexity.
- No WebGL requirement for reading, navigation, or contact.
- No long route animation on every visit.
- No CMS, backend, authentication, analytics platform, or localization system.
