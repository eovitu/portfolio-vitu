# Victor Hugo — Portfolio

An English-language portfolio for a backend developer who also works across product and interface engineering. The experience leads with evidence: three focused case studies, clear ownership, real product media, and direct contact paths.

The procedural singularity is a progressive visual layer. Content and navigation remain usable before WebGL loads, on modest devices, and when reduced motion is enabled.

## Stack

- React 18, TypeScript, and Vite
- Three.js and `@react-three/fiber`
- GSAP, ScrollTrigger, and Lenis
- styled-components
- Node's built-in test runner

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run format:check
npm run typecheck
npm run lint
npm run build
```

## Content model

Portfolio data lives in `src/lib/content.ts`. Every project defines its slug, summary, ownership, outcomes, media, case-study sections, and verified actions. Route resolution and document metadata are isolated in `src/lib/routes.ts` and `src/lib/metadata.ts`.

Current routes:

- `/` — homepage and selected work
- `/work/emprega-co`
- `/work/doces-da-pati`
- `/work/helppet`

Project videos and poster frames live in `public/media/`. The Doces da Pati live site and source repository are the only public project links currently presented; private products are labeled accordingly.

## Experience principles

- Evidence before decoration
- Vertical, native scrolling with no artificial resistance
- Mobile-first reading order and touch targets
- Semantic navigation, visible focus, and reduced-motion support
- One deferred WebGL scene, paused when the tab is hidden
- English copy throughout the public experience

The implementation decisions and performance boundaries are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## License

MIT — see [LICENSE](LICENSE).
