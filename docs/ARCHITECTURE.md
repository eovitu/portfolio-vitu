# Architecture

## Product boundary

The portfolio is a single-page React application with four stable URLs: home and one route per case study. It deliberately avoids a router dependency because the public route set is small and static. `src/lib/routes.ts` owns pathname parsing, while normal anchors preserve native browser behavior and direct-link support.

The content model in `src/lib/content.ts` is the source of truth for project identity, media, ownership, outcomes, case-study narrative, and public actions. Private work never receives an invented repository or live-product link.

## Rendering layers

The page is split into two independent layers:

1. Semantic React content and navigation, which render immediately.
2. The procedural Three.js singularity, which is deferred until the browser is idle and appears only on the homepage.

This separation is intentional. WebGL enriches the identity but never blocks reading, navigation, contact, or case-study media. `src/three/scenePolicy.ts` decides whether continuous rendering is appropriate. Reduced-motion users receive a static visual treatment, and the canvas pauses when the document is hidden.

The singularity itself remains procedural in `src/three/singularityScene.ts`. The reference implementation is retained in `docs/reference/black-hole.html` because additive materials, vertex colors, billboarding, and the core mask do not survive a conventional glTF export faithfully.

## Motion and scroll

`SmoothScrollProvider` coordinates Lenis with GSAP and ScrollTrigger. The experience uses ordinary vertical document flow: there is no wheel resistance, forced scroll restoration, horizontal project pinning, or reload choreography. Motion supports hierarchy and continuity rather than delaying access to content.

All essential content remains visible under `prefers-reduced-motion: reduce`. WebGL animation is disabled there rather than merely slowed down.

## Case studies and media

`HomePage` renders the overview and `CaseStudy` renders each long-form project route from the same typed data. Videos are muted, inline, looped previews with poster frames. The current compressed files are intentionally small enough to avoid making the first viewport depend on multi-megabyte media.

## Metadata

`src/lib/metadata.ts` derives English titles, descriptions, canonical URLs, Open Graph values, and verified `Person` JSON-LD from the resolved route. The production origin is `https://devitu.vercel.app`. The social preview is a 1200×630 raster image for broad crawler compatibility.

## Verification boundary

The repository checks content contracts, route parsing, metadata, case rendering, and Three.js policy with Node tests. TypeScript, ESLint, Prettier, and the Vite production build form the static integration gate. Browser review additionally covers desktop, mobile, direct routes, keyboard menu behavior, overflow, console errors, and network errors.
