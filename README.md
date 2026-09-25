# devitu, Victor Hugo's portfolio

A portfolio for backend and product engineering, built around three case studies and a persistent procedural black hole. The homepage combines large typography, distinct project colors, an engineering profile and direct contact.

## Run locally

Use Node.js 22.6 or later (CI uses Node 22) and npm.

```bash
npm ci --legacy-peer-deps
npm run dev
```

Open the localhost URL printed by Vite. No API keys or environment variables are required for the portfolio. The conversation panel uses local curated responses, not an AI service. Email links open the visitor's email application.

## Commands

| Command                | Purpose                                                     |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Local development with hot reload                           |
| `npm test`             | Node tests for content, routing, motion and media contracts |
| `npm run typecheck`    | TypeScript validation                                       |
| `npm run lint`         | ESLint checks                                               |
| `npm run format:check` | Repository formatting checks                                |
| `npm run build`        | Validate types and generate route HTML in `dist/`           |
| `npm run preview`      | Serve the production output locally                         |

Run all checks before opening a pull request. CI installs from the lockfile and checks types, lint, tests, formatting and build. Some tests inspect source contracts; they do not replace browser testing.

## Projects and routes

| Route                 | Project                                         | Status                     |
| --------------------- | ----------------------------------------------- | -------------------------- |
| `/`                   | Home, selected work, profile, about and contact | Portfolio                  |
| `/work/emprega-co`    | Candidate and employer journeys                 | NGO project in development |
| `/work/doces-da-pati` | Confectionery storefront                        | Live client project        |
| `/work/helppet`       | Pet-care product and API integration            | Academic build             |

Unknown paths show a dedicated recovery page. The application supports direct case URLs, browser back/forward and section anchors.

Emprega.co's media is provisional. HelpPet's presentation media shows Figma work; the academic build explored frontend/backend integration and a gateway. Public links are listed only when available in the project data.

## Where to edit

- `src/lib/content.ts`: project descriptions, ownership, media paths, navigation and footer.
- `src/components/home/`: hero, project chapters, profile, about and contact.
- `src/components/cases/`: case layouts, project narratives and accessible film controls.
- `src/components/navigation/`: compact header and mobile menu.
- `src/components/conversation/` and `src/lib/conversation.ts`: the local contact panel and responses.
- `src/motion/` and `src/hooks/`: transition state, shared motion signals and lifecycle hooks.
- `src/three/`: procedural scene, rendering policy, camera and device quality settings.
- `public/media/`: project videos and poster images.
- `src/lib/site.ts`, `src/lib/metadata.ts` and `src/lib/seoHtml.ts`: production origin, route metadata and generated route documents. Keep `public/sitemap.xml`, `public/robots.txt` and `public/llms.txt` aligned when changing URLs.

## Design and performance

React 18, TypeScript and Vite render the site, with styled-components for presentation. GSAP/ScrollTrigger and Lenis share the animation clock; Motion handles shared-media transitions. Three.js and React Three Fiber form the deferred visual layer.

Selected work uses one sticky stage on suitable desktops and ordinary stacked articles on smaller screens or under reduced motion. Each chapter has a different composition. Mobile navigation has its own color tokens, scrollable content, safe-area padding and keyboard focus handling.

Posters remain available when preview autoplay is blocked. Preview videos do not preload until their surface is both active and visible. The childhood photograph uses responsive WebP sources with the original JPEG as fallback. The WebGL scene has a static fallback, lower mobile rendering quality and a hidden-tab policy. Three.js stays in a separate deferred chunk; its size still produces a Vite warning. Do not interpret the main bundle size as the total download.

## Deployment

The production output is `dist/`. The build creates static HTML entry documents for home, each case route and the custom 404, with route-specific search/social metadata and structured data before JavaScript runs. `vercel.json` adds security and cache headers; static route documents and `404.html` provide routing without a catch-all rewrite. The canonical origin is `https://eovitu.com.br`. For another host, preserve clean directory URLs and custom-404 handling, then update the canonical origin and discovery files.

See [Architecture](docs/ARCHITECTURE.md) for motion ownership, data boundaries and verification limitations. The original procedural reference is retained at `docs/reference/black-hole.html` because its scene construction informs the renderer.

## License

MIT, see [LICENSE](LICENSE).
