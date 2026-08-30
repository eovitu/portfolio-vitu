# Singularity Portfolio v1 Specification

## Product goal

Launch an English-first portfolio that positions Victor Hugo as a backend
developer who can carry a digital product from domain and data decisions to a
polished interface. The site must work for Brazilian and international hiring
teams without presenting the portfolio itself as a client project.

## Audience and positioning

- Primary audience: engineering leads, recruiters and founders hiring for
  backend, full-stack or product-minded engineering roles.
- Positioning: `Backend developer building complete, reliable digital products.`
- Location: São Paulo, Brazil. Available for remote opportunities worldwide.
- Do not expose age, academic semester or technical-course status.
- Do not invent metrics, users, commercial outcomes or production maturity.
- Mocked data may be discussed as a deliberate product-development constraint,
  never disguised as live production evidence.

## Language and accessibility

- All visible portfolio copy, metadata and document language use English.
- English is the reach strategy; accessibility is delivered independently with
  semantic HTML, keyboard support, visible focus, contrast, touch targets,
  reduced motion and useful non-WebGL fallbacks.
- Copy uses plain international English and avoids decorative jargon.

## Information architecture

The v1 remains a single-page narrative so the existing gravity choreography
stays coherent. The sections are:

1. Hero: name, backend positioning, availability and primary contact action.
2. Selected work: three real cases, ordered Emprega.co, Doces da Pati, HelpPet.
3. About: concise working philosophy and product-to-production range.
4. Capabilities: backend first, with frontend, product and creative technology
   as supporting evidence.
5. Contact: GitHub, LinkedIn and a prefilled email action.
6. Route fallback: a styled English 404 with a lightweight non-WebGL baseline.

The current chat mock is removed from launch scope. Contact must work without a
backend or simulated assistant.

## Case-study contract

Every featured project contains:

- stable slug and project number;
- name, concise problem/solution statement and honest role;
- stack, year, status and project type;
- two to four verified engineering or product highlights;
- optional live, repository and Figma links;
- a real visual when a trustworthy asset is available, otherwise a purposeful
  branded case surface that is not labelled as a screenshot.

### Emprega.co

Lead case. Present it as an employment platform with separate candidate and
employer journeys, a broad product flow and deliberately designed loading,
empty, offline, privacy and payment states. Do not claim a public production
launch without evidence.

### Doces da Pati

Second case and strongest real commercial proof. Present the verified Next.js,
Firebase, catalog administration, stock, persistent cart, WhatsApp checkout,
local SEO, structured data and consent-aware analytics. Do not claim mature
test coverage: the repository contains an isolated unit test but no test script
or CI test gate.

### HelpPet

Third case. Present the design-system breadth, mobile and desktop journeys and
distinctive visual language. Treat divergent Figma explorations as design work,
not as one fully implemented production system.

## Visual system

- Design read: clean editorial developer portfolio with controlled asymmetry
  and premium motion.
- Design variance: 7/10.
- Motion intensity: 6/10.
- Visual density: 3/10.
- Reference use: borrow Shopify Editions' chapter-based discovery and editorial
  pacing, not its branding, copy or visual identity.
- Preserve the singularity as the site's signature character.
- Use one dark theme, one warm gold accent and one radius rule: controls may be
  pill-shaped; editorial surfaces remain square.
- Real content and project evidence take visual priority over decoration.

## Motion and loading

- The opening is a transition, not a fake progress loader.
- Critical text must render immediately; Three.js loads asynchronously.
- First visit may use a 0.8 to 1.4 second branded reveal when assets are ready.
- Repeat visits use a reduced entrance.
- Reduced-motion users get immediate, complete content.
- GSAP animations use scoped contexts and cleanup.
- Lenis, ScrollTrigger and R3F retain a single shared frame loop.

## Three.js performance requirements

- Preserve `frameloop="never"` and the procedural singularity.
- Introduce at least three practical quality tiers based on viewport, pointer,
  core count and device memory when available.
- Cap mobile DPR and avoid mobile MSAA.
- Reduce core sphere segments and decorative geometry where the visual delta is
  negligible.
- Do not globally disable frustum culling without per-object evidence.
- Reduce transparent double-sided material and ribbon draw-call cost.
- Stop or heavily throttle the canvas while the document is hidden and while
  its contribution is visually absent.
- Dispose resources and clean all listeners/timelines.
- The DOM remains useful if WebGL initialization fails.

## Launch quality gates

- No placeholders, mock notes or contradictory language metadata.
- No broken internal or external links.
- `npm run format:check`, `npm run typecheck`, `npm run lint` and
  `npm run build` pass.
- Desktop and mobile are inspected in a real browser with console monitoring.
- Keyboard focus, reduced motion and 404 behavior are verified.
- Bundle output and Three.js chunk size are recorded without unsupported claims.
- Changes are committed on `codex/v1-launch` with Conventional Commits and no
  automated co-author trailers.
