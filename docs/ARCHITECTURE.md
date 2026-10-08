# Architecture

## Product boundary

The portfolio is a single-page React application with five stable URLs: home and one route per case study. It deliberately avoids a router dependency because the public route set is small and static. `src/lib/routes.ts` owns pathname parsing, while normal anchors preserve native browser behavior and direct-link support.

The content model in `src/lib/content.ts` is the source of truth for project identity, media, ownership, outcomes, case-study narrative, and public actions. Private work never receives an invented repository or live-product link.

## Rendering layers

The page is split into two independent layers:

1. Semantic React content and navigation, which render immediately.
2. The procedural Three.js singularity, which is deferred until the browser is idle and persists as one fixed scene layer across the public routes.

This separation is intentional. WebGL enriches the identity but never blocks reading, navigation, contact, or case-study media. `src/three/scenePolicy.ts` decides whether continuous rendering is appropriate. Reduced-motion users receive a static visual treatment, and the canvas pauses when the document is hidden.

The singularity itself remains procedural in `src/three/singularityScene.ts`. The reference implementation is retained in `docs/reference/black-hole.html` because additive materials, vertex colors, billboarding, and the core mask do not survive a conventional glTF export faithfully.

## Motion and scroll

`SmoothScrollProvider` coordinates Lenis with GSAP and ScrollTrigger. The experience uses ordinary vertical document flow: there is no horizontal scrolling. Route transitions capture and restore explicit scroll positions, while reload and direct-link scrolling remain under native browser ownership. The first visit also has a bounded singularity entrance sequence with a fail-safe; repeat visits and reduced motion use shorter or static paths. Selected Work is the single bounded sticky exception: `SelectedWorkTheater` owns one CSS-sticky stage and four semantic chapters, then releases naturally into Engineering Profile. It has no independent pins; the shared provider owns the brief color-boundary holds. Motion supports hierarchy and continuity rather than delaying access to content.

The provider briefly holds wheel/touch at measured color edges. Flow edges align with the viewport bottom on forward travel and its top on backward travel. Enhanced theater switches instead use the `top top` / `bottom bottom` progress bands and a half-pixel margin on the current color side. The first and last theater edges remain ordinary flow edges. Contact, footer and whole-page wrappers are not markers; offsets outside the real Lenis scroll range are discarded. A new gesture after 180 ms releases a hold; explicit navigation and native zoom cancel it.

All essential content remains visible under `prefers-reduced-motion: reduce`. WebGL animation and color holds are disabled there rather than merely slowed down.

## Case studies and media

`HomePage` renders the overview and `CaseStudy` renders each project from the same typed data. Four videos and posters are 1920×1080; Pebolim runs for 36 seconds and the others for 38 seconds, without audio. `MediaPlayback` shares accessible play/pause, seek and error/retry controls across home and cases. Case fullscreen retains its controls and contains the full frame.

Sources attach only after explicit play. `mediaPlayback.ts` coordinates offscreen and hidden-tab pauses without automatic resumption. Reduced motion permits intentional playback. Posters remain available initially and on errors. The about portrait uses responsive WebP sources with a JPEG fallback.

`WorkDisclosure` provides ordinary links and an expansion button with hover, keyboard and Escape handling. The mobile dialog exposes the same four projects. Navigation from cases and 404 mounts home before resolving a chapter; `chapterTarget.ts` shares the sticky geometry and the ordinary mobile/reduced-motion fallback. Initial hashes use the same target. The editable general résumé is a static download in `public/cv/`; contact remains directly available.

## Metadata

`src/lib/metadata.ts` derives localized titles, descriptions, canonical URLs, robots rules and Open Graph/Twitter values from the resolved route. Home uses the 1200×630 site preview; each case uses its own poster. Structured data includes verified `Person`, home-only `WebSite` and case-specific `CreativeWork` records. Runtime navigation updates the document head, while `src/lib/seoHtml.ts` and `scripts/generate-route-html.mjs` generate equivalent crawler-visible HTML for home, all four cases and the noindex custom 404. The production origin is `https://eovitu.com.br`.

## Verification boundary

The repository checks content contracts, route parsing, metadata, case rendering, and Three.js policy with Node tests. TypeScript, ESLint, Prettier, and the Vite production build form the static integration gate. Browser review additionally covers desktop, mobile, direct routes, keyboard menu behavior, overflow, console errors, and network errors.

## Current visual system

Project chapters use paired surface and ink tokens: warm orange for Emprega.co,
dark green and orange for Pebolim, cream editorial treatment for Doces da Pati and pale green for HelpPet. The profile
uses blue and lime; about uses warm paper and the original childhood photograph.
The fixed header compresses through dedicated wrapper transforms. It switches to
mobile navigation at 900px, before the desktop labels can collide.

The hero's mobile frame is centered vertically; the desktop frame remains offset
right. Text protection belongs to the hero overlay, independently of scene position.
Reduced motion leaves the contact heading visible instead of collapsing its words.
The repeated footer invitation has been removed; email and header/menu contact
entry points remain.

## Maintenance

Superseded implementation plans and session handoffs are not product documentation.
Durable decisions are consolidated here and in the README; the procedural HTML
reference remains for renderer maintenance. The unused parallax hook was removed.

The project still uses Vite 5. Toolchain upgrades require a separate compatibility
review of manual chunking and the lazy canvas. Run `npm audit` before scheduling
that work; historical audit counts are not a current security guarantee.
Browser viewport checks do not establish real-device FPS or Safari compatibility.
