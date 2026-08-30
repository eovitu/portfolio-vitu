# Portfolio Rebuild — Product and Experience Design

## Status

Approved by Victor Hugo on 30 August 2026. This document defines the product,
content, visual, motion, accessibility, and technical direction for the
portfolio rebuild. Implementation must happen on `codex/portfolio-rebuild` and
must not modify `main` directly.

## Product objective

The portfolio must let a recruiter or potential client understand within 30
seconds that Victor Hugo:

- is a backend developer with product and frontend capability;
- builds with Java, Spring, TypeScript, and expressive interfaces;
- has worked on Emprega.co, Doces da Pati, and HelpPet;
- accepts opportunities worldwide;
- can be contacted directly.

The primary positioning is:

> Backend developer building reliable products from system architecture to
> expressive interfaces.

The interface and metadata use English only. Claims must be factual. No metric,
result, client relationship, or production status may be invented.

## Experience principle

The singularity remains the signature character, but it no longer governs the
effort required to read the site. The experience follows this order:

> visual impact → proof of work → professional context → direct contact

The rebuild is selective rather than a rewrite. It preserves the procedural
scene, childhood photograph, black/bone palette, warm gold accent, large
typography, and single-clock animation architecture. It replaces navigation,
content hierarchy, project presentation, excessive interface chrome, and
motion that obstructs reading.

## Information architecture

The public structure is:

```text
/
├── Hero
├── Selected Work
│   ├── Emprega.co
│   ├── Doces da Pati
│   └── HelpPet
├── Engineering Profile
├── About
└── Contact

/work/emprega-co
/work/doces-da-pati
/work/helppet
```

The project uses a small pathname-based route boundary and the existing Vercel
SPA rewrite. It does not add a routing dependency unless implementation proves
that history, focus, or nested navigation cannot be handled correctly without
one. Direct visits and refreshes on every case path must render the correct
case.

## Homepage

### Hero

The hero states the professional proposition directly and offers two actions:
`View Selected Work` and `Start a Conversation`. The singularity is the visual
thesis. The first visit may use a short orchestrated entrance; repeat visits
must reach useful content almost immediately. Reload preserves normal browser
scroll behavior and never forces a return to the top.

### Selected Work

The homepage presents three navigable cases in this order:

1. Emprega.co
2. Doces da Pati
3. HelpPet

Each preview contains real media, a one-sentence factual outcome, role, stack,
ownership summary, and explicit actions. `View Case Study` is always present.
`Live Project` and `View Source` appear only when a verified public URL exists.
The section does not require horizontal scroll and does not use abstract media
placeholders.

### Engineering Profile

The section leads with four readable capabilities:

- Backend Systems
- Product Engineering
- Interface Architecture
- 3D & Motion

Each capability pairs technologies with evidence of how Victor uses them. The
existing spectral interaction may survive as an enhancement, but the complete
information must be available without interacting with it.

### About

The childhood photograph and personal thread remain. Copy is shorter and
connects the story to the current professional profile. The section must not
obscure role, location, or working style behind metaphor.

### Contact

Contact content remains visible through the end of the page. It includes:

- availability for worldwide opportunities;
- `eovitu7@gmail.com` as visible text and a mail link;
- verified GitHub and LinkedIn links;
- a résumé link only after a real PDF exists.

The mock chat may remain as a clearly secondary experiment. It is not the
primary conversion path. Contact content is never swallowed or hidden by the
closing animation.

## Individual case studies

Every case follows the same information contract while retaining its own visual
composition:

```text
Project thesis
Real interface media
Context and problem
Role and ownership
System and product decisions
Technical architecture
Constraints and trade-offs
Factual outcome
Verified links
Previous/next project navigation
```

Emprega.co emphasizes a two-sided platform, backend architecture, and product
flows. Doces da Pati emphasizes a real mobile-first storefront and local
operational flow. HelpPet emphasizes its design system, connected journey, and
product structure. Private implementation details, organization data, and
unverified claims stay out of the public site.

The supplied project recordings may be edited and encoded for previews. The
case pages must provide poster images and avoid autoplay audio. Media loading
must not block case text.

## Content model

Content remains centralized rather than duplicated inside components. The model
must distinguish:

- homepage summary from long-form case content;
- internal case routes from external actions;
- verified links from unavailable actions;
- image, video, poster, alt text, and dimensions;
- facts from optional metrics.

Unavailable data produces omission, not placeholder copy. There are no fake
buttons, `#contact` substitutes for external profiles, or invented performance
figures.

## Visual direction

The palette uses deep black, bone, mineral grey, and warm gold. Typography is
large and editorial but sized by content rather than viewport spectacle. Layout
is asymmetric, precise, and media-led. It avoids generic SaaS cards, repeated
rounded containers, decorative metrics, and fake technical labels.

The singularity is the only permanent spectacular element. The deliberate
visual risk is its transition from the hero into the first project reveal, as
if it exposes the work. Other sections reduce visual signal and vary in density
so evidence remains readable.

Persistent UI is limited to navigation and a restrained progress indication.
The following are removed or confined to the hero unless they convey live,
useful state:

- Schwarzschild-distance and delta metrics;
- permanent vertical event-horizon labels;
- decorative technical telemetry;
- custom cursor on touch or where it adds no feedback;
- sound controls when audio is not an essential part of the experience.

## Motion and Three.js

Motion communicates hierarchy, continuity, feedback, or state. It never
increases the physical effort required to reach content.

- Preserve the single clock: Lenis → GSAP ticker → ScrollTrigger → R3F.
- Remove progressive wheel resistance and forced scroll restoration.
- Use one short first-visit entrance and a near-immediate repeat path.
- Keep native scrolling on touch devices.
- Respect `prefers-reduced-motion` with a complete static experience.
- Load useful HTML before hydrating the WebGL scene.
- Present an optimized poster while the scene loads or when WebGL is unsuitable.
- Reduce DPR, particle density, and model cost for modest devices.
- Suspend rendering while the document is hidden.
- Preserve explicit disposal and teardown of GPU and animation resources.

Performance work must be measurement-led. The initial budgets are directional
targets, not claims: useful text should paint before WebGL is ready, CLS should
remain below 0.1, and mobile must remain usable on a modest GPU.

## Responsive behavior

Desktop and mobile share content but not forced composition. Mobile uses a
normal vertical reading flow, a cheaper singularity treatment, no custom cursor,
and no altered touch scroll.

The header exposes Work, Profile, About, and Contact at every viewport. On
mobile it becomes an accessible menu with escape, outside-click, focus return,
and scroll-lock behavior. Utility text is at least 12 px. Sections use dynamic
viewport units where appropriate and provide enough scroll margin for the fixed
header.

## Accessibility

The rebuild must provide:

- one `h1`, followed by ordered section and case headings;
- semantic links and buttons with explicit accessible names;
- visible focus without relying on browser outline removal;
- keyboard-complete navigation and dialogs;
- correctly associated media alternatives;
- explicit image dimensions to avoid layout shift;
- sufficient contrast in every composited state;
- reduced-motion behavior for CSS, GSAP, and WebGL;
- no content that exists only on hover;
- route changes that update title and move focus to the case heading.

## SEO and professional presentation

The default title is `Victor Hugo — Backend Developer & Product Engineer`.
Descriptions describe professional capability instead of the singularity
concept. The site includes canonical URLs, `og:url`, a raster 1200×630 social
image, English locale metadata, and JSON-LD `Person` data containing only public,
verified properties. Each case has unique title, description, canonical URL,
and social metadata.

## Delivery sequence

1. Establish the content model, pathname boundary, English copy, and metadata.
2. Rebuild navigation and homepage information hierarchy.
3. Build individual case studies with real media.
4. Simplify HUD, scroll behavior, intro, and closing motion.
5. Add progressive WebGL loading and device-quality policies.
6. Complete mobile behavior, accessibility, and SEO.
7. Verify desktop, mobile, keyboard, reduced motion, direct routes, console,
   network, build output, and performance behavior.

Changes use small Conventional Commits on `codex/portfolio-rebuild`. A pull
request is opened for review; `main` is not modified directly.

## Verification contract

At minimum, completion requires:

- typecheck, lint, tests, and production build passing;
- all four public routes working by direct navigation and internal navigation;
- no horizontal overflow at 390×844, 768×1024, 1280×720, and 1920×1080;
- mobile navigation verified with keyboard-equivalent focus behavior;
- no browser console errors or failed required requests;
- `prefers-reduced-motion` verified as a complete experience;
- project links and contact links checked against their actual destinations;
- media posters and dimensions preventing visible layout shifts;
- WebGL fallback verified with the canvas unavailable;
- visual review confirming that projects and contact remain readable without
  depending on animation.

## Explicit non-goals

- No CMS, backend, authentication, analytics platform, or localization system.
- No fabricated metrics, testimonials, clients, or employment claims.
- No recreation of Shopify Editions styling.
- No replacement of the procedural singularity with an unrelated 3D asset.
- No new dependency without a demonstrated need that existing code cannot meet.
