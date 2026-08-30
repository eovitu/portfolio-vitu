/**
 * All copy for the site, in one place.
 *
 * The site is written in English throughout. It used to mix Portuguese body
 * copy with English headings, which reads as an oversight rather than as a
 * choice — the voice is the same either way, so the language is the thing that
 * had to stop wavering.
 *
 * Product claims in this file are limited to evidence inspected in the source
 * repositories and Figma flows before the v1 launch.
 */

export interface ProjectLink {
  label: 'LIVE' | 'SOURCE' | 'FIGMA';
  href: string;
}

export interface Project {
  n: string;
  slug: string;
  name: string;
  desc: string;
  role: string;
  tech: string;
  year: string;
  status: string;
  highlights: readonly string[];
  links: readonly ProjectLink[];
  /** Editorial surface label. It never implies the surface is a screenshot. */
  slot: string;
}

export const projects: Project[] = [
  {
    n: '01',
    slug: 'emprega-co',
    name: 'EMPREGA.CO',
    desc: 'An employment platform shaped around two connected journeys: people finding work and companies finding the right people.',
    role: 'BACKEND · PRODUCT · UI/UX',
    tech: 'JAVA · SPRING · REACT',
    year: '2025 / 26',
    status: 'PRIVATE PRODUCT',
    highlights: [
      'Separate candidate and employer journeys',
      'Loading, empty, offline and recovery states',
      'Privacy, subscription and payment flows',
    ],
    links: [
      {
        label: 'FIGMA',
        href: 'https://www.figma.com/design/jUbSm99igNN5NcA1qXqM2A/Emprega.co?node-id=0-1&p=f',
      },
    ],
    slot: 'PRODUCT FLOW · TWO-SIDED PLATFORM',
  },
  {
    n: '02',
    slug: 'doces-da-pati',
    name: 'DOCES DA PATI',
    desc: 'A mobile-first storefront that turns a small local catalog into a clear, manageable ordering flow without adding paid infrastructure.',
    role: 'BACKEND · FRONTEND · PRODUCT',
    tech: 'NEXT.JS · FIREBASE · GSAP',
    year: '2026',
    status: 'LIVE COMMERCE',
    highlights: [
      'Catalog, featured products and stock managed in Firebase',
      'Persistent cart with a guided WhatsApp checkout',
      'Local SEO, structured data and consent-aware analytics',
    ],
    links: [
      { label: 'LIVE', href: 'https://doces-da-pati.vercel.app/' },
      { label: 'SOURCE', href: 'https://github.com/eovitu/doces-da-pati' },
    ],
    slot: 'LIVE SYSTEM · LOCAL COMMERCE',
  },
  {
    n: '03',
    slug: 'helppet',
    name: 'HELPPET',
    desc: 'A connected pet-care product explored across mobile and desktop, supported by a broad component language and end-to-end service flows.',
    role: 'BACKEND · PRODUCT · DESIGN SYSTEM',
    tech: 'JAVA · SPRING · FLUTTER',
    year: '2025',
    status: 'PRIVATE PRODUCT',
    highlights: [
      'Mobile and desktop journeys in one product language',
      'Reusable components, variants and interaction states',
      'Service discovery, care records and operational flows',
    ],
    links: [
      {
        label: 'FIGMA',
        href: 'https://www.figma.com/design/7vKBl18lns0tSIQ21GU4tZ/HelpPet---Design-System?node-id=151-74&p=f',
      },
    ],
    slot: 'DESIGN SYSTEM · CONNECTED CARE',
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export const hero = {
  metaLeft: 'BACKEND / PRODUCT ENGINEERING',
  metaRight: 'AVAILABLE WORLDWIDE',
  /** Split per line so each line gets its own overflow mask. */
  nameLines: [
    ['V', 'I', 'C', 'T', 'O', 'R'],
    ['H', 'U', 'G', 'O'],
  ],
  role: 'BACKEND DEVELOPER',
  description:
    'I build reliable systems and carry them through to a clear product experience.',
  location: 'SÃO PAULO · REMOTE WORLDWIDE',
  scroll: 'VIEW SELECTED WORK',
  cta: 'START A CONVERSATION',
} as const;

/**
 * ABOUT — written to inhabit the time-dilation idea rather than explain it.
 *
 * The section never says "this is a metaphor for a black hole". It talks
 * about time running at different rates and about a distance that looks
 * shorter from here, and lets the object standing behind the rest of the page
 * do the arguing.
 */
export const about = {
  label: 'HOW I BUILD',
  titleLines: ['Close to enough mass', 'time runs slower.', 'Good systems make room.'],
  body: 'I am a backend developer in São Paulo who works across the product boundary: domain modelling, APIs, data, interfaces and the decisions connecting them.',
  bodySecond:
    'I care about the quiet parts that make software trustworthy: explicit contracts, useful failure states, measured performance and an interface people can understand.',
  photoCaption: 'ARCHIVE · THE START OF THE LONG ROUTE',
  photoAlt:
    'Victor Hugo as a child, in a yellow shirt, holding onto a roundabout in a playground with an empty sandlot behind him.',
  meta: ['BACKEND', 'PRODUCT ENGINEERING', 'SYSTEM DESIGN', 'CREATIVE TECHNOLOGY'],
} as const;

export const work = {
  label: 'SELECTED WORK',
} as const;

/**
 * SKILLS as an emission spectrum.
 *
 * Astronomy reads what a body is made of from the lines in its spectrum. The
 * section states composition the same way: one band, one line per technology,
 * placed by domain and weighted by how much of the work it actually carries.
 *
 * `at` is the position along the band, 0 → 1, and doubles as the "wavelength".
 * Domains occupy contiguous stretches so the band reads as four regions rather
 * than as scattered ticks. `weight` drives the line's brightness and width.
 */
export interface SpectralLine {
  name: string;
  domain: 'BACKEND' | 'FRONTEND' | 'TRIDIMENSIONAL' | 'DESIGN';
  at: number;
  weight: number;
  detail: string;
}

export const skills = {
  label: 'WHAT SURVIVES THE PRESSURE',
  labelRight: 'SPECTRAL READING',
  intro:
    'Every line is an emission. Position gives the domain, brightness gives how much of the work it carries.',
  hint: 'HOVER A LINE',
  lines: [
    {
      name: 'Java',
      domain: 'BACKEND',
      at: 0.05,
      weight: 0.95,
      detail: 'Long-running services, with the domain modelled before any screen exists.',
    },
    {
      name: 'Spring Boot',
      domain: 'BACKEND',
      at: 0.12,
      weight: 0.9,
      detail: 'APIs, authentication, and the dull layer that simply must not fail.',
    },
    {
      name: 'PostgreSQL',
      domain: 'BACKEND',
      at: 0.19,
      weight: 0.75,
      detail: 'Relational modelling. The schema is the part that outlives the product.',
    },
    {
      name: 'REST / APIs',
      domain: 'BACKEND',
      at: 0.26,
      weight: 0.7,
      detail: 'Contracts between systems — where most product bugs are actually born.',
    },
    {
      name: 'TypeScript',
      domain: 'FRONTEND',
      at: 0.38,
      weight: 1,
      detail: 'Types as executable documentation. Nothing ships without them.',
    },
    {
      name: 'React',
      domain: 'FRONTEND',
      at: 0.45,
      weight: 0.95,
      detail: 'Interface composition, and the real cost of every re-render.',
    },
    {
      name: 'Next.js',
      domain: 'FRONTEND',
      at: 0.52,
      weight: 0.7,
      detail: 'Server rendering for when the first paint is what matters.',
    },
    {
      name: 'Flutter',
      domain: 'FRONTEND',
      at: 0.58,
      weight: 0.55,
      detail: 'Mobile for when a single codebase is the right call.',
    },
    {
      name: 'Three.js',
      domain: 'TRIDIMENSIONAL',
      at: 0.68,
      weight: 0.85,
      detail: 'Geometry, materials and a frame budget. This site is the evidence.',
    },
    {
      name: 'GLSL',
      domain: 'TRIDIMENSIONAL',
      at: 0.74,
      weight: 0.6,
      detail: 'Shaders for when the effect will not fit inside what the DOM can do.',
    },
    {
      name: 'GSAP',
      domain: 'TRIDIMENSIONAL',
      at: 0.79,
      weight: 0.8,
      detail: 'Scrubbed timelines. Motion the reader drives rather than watches.',
    },
    {
      name: 'Figma',
      domain: 'DESIGN',
      at: 0.87,
      weight: 0.85,
      detail: 'Where the decision happens before it costs implementation time.',
    },
    {
      name: 'Design Systems',
      domain: 'DESIGN',
      at: 0.93,
      weight: 0.8,
      detail: 'One token, one source of truth. Consistency is infrastructure.',
    },
    {
      name: 'Motion',
      domain: 'DESIGN',
      at: 0.98,
      weight: 0.65,
      detail: 'Weight, friction and anticipation — physics, not duration.',
    },
  ] satisfies SpectralLine[] as SpectralLine[],
} as const;

/**
 * The band that crosses the WORK -> ABOUT boundary. Written in the site's own
 * voice: statements about matter and light, not a job title on repeat.
 */
export const marquee = {
  items: [
    { text: 'MATTER IN ORBIT' },
    { text: '•', accent: true },
    { text: 'LIGHT ARRIVES BENT' },
    { text: '•', accent: true },
    { text: 'TIME RUNS SLOWER HERE' },
    { text: '•', accent: true },
    { text: 'NOTHING COMES BACK THE SAME' },
    { text: '•', accent: true },
  ] as { text: string; accent?: boolean }[],
} as const;

/**
 * The two full-bleed screens.
 *
 * They exist for rhythm before they exist for copy. Every section of this site
 * used to be the same length at the same density, and a descent with no
 * variation of pressure reads as one long section however good each part is.
 * One is saturation — a hot field with a statement and a strip of instrument
 * data over it. The other is breath — a cold field, one line, nothing else,
 * placed immediately before the collapse so the collapse has silence to break.
 */
export const interludes = {
  matter: {
    id: 'interlude-matter',
    lines: ['MATTER ARRIVES', 'WHOLE.'],
    lead: 'SOMETHING ELSE LEAVES.',
    metrics: [
      ['MASS ABSORBED', '3 PROJECTS'],
      ['PROPER TIME', '2023 — 2026'],
      ['STATE', 'IN ORBIT'],
    ] as [string, string][],
  },
  fall: {
    id: 'interlude-fall',
    lines: ['FROM HERE ON,', 'ONLY THE FALL.'],
  },
} as const;

export const contact = {
  label: 'OPEN TO OPPORTUNITIES',
  titleLines: ["LET'S BUILD", 'SOMETHING', 'RELIABLE.'],
  /** Named in the section as the one thing the collapse does not take. */
  survivorNote: 'THE DIRECT LINE',
  links: [
    {
      label: 'EMAIL',
      href: 'mailto:eovitu7@gmail.com?subject=Opportunity%20for%20Victor%20Hugo&body=Hi%20Victor%2C%0A%0AI%20found%20your%20portfolio%20and%20would%20like%20to%20talk%20about...',
      external: false,
    },
    { label: 'GITHUB', href: 'https://github.com/eovitu', external: true },
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/eovitu/', external: true },
  ],
} as const;

export const footer = {
  items: [
    '© 2026 — VICTOR HUGO',
    'SÃO PAULO — 23.5505° S / 46.6333° W',
    'SINGULARITY / END OF TRANSMISSION',
  ],
} as const;

export const nav = {
  brand: 'VITU / SINGULARITY',
  links: [
    { label: 'WORK', href: '#work' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ],
  cta: 'CONTACT',
} as const;

/** Legacy chat copy kept typed until the launch UI removes the old module. */
export const chat = {
  title: 'CONTACT',
  close: 'CLOSE',
  intro: 'The fastest route is a direct email.',
  prompts: ['OPEN EMAIL'],
  note: '',
  inputPlaceholder: 'TYPE YOUR MESSAGE',
} as const;
