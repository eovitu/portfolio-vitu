/**
 * All copy for the site, in one place.
 *
 * The site is written in English throughout. It used to mix Portuguese body
 * copy with English headings, which reads as an oversight rather than as a
 * choice — the voice is the same either way, so the language is the thing that
 * had to stop wavering.
 *
 * Strings wrapped in [ ... ] are placeholders, marked `descIsPlaceholder` so
 * they render with the placeholder treatment and are trivial to find later.
 * TODO(content): replace before launch.
 */

export interface Project {
  n: string;
  name: string;
  desc: string;
  /** Designer placeholder copy — replace with the real case text. */
  descIsPlaceholder?: boolean;
  role: string;
  tech: string;
  year: string;
  /** Label of the image slot. TODO(assets): swap for a real capture. */
  slot: string;
}

export const projects: Project[] = [
  {
    n: '01',
    name: 'EMPREGA.CO',
    desc: 'A marketplace for home services — search, booking and payment in a single flow. From the data model through to the interface.',
    role: 'DESIGN · PRODUCT · FRONT-END',
    tech: 'JAVA · SPRING · REACT',
    year: '2025',
    slot: 'PLATE 01 · CLOSE TO THE HORIZON',
  },
  {
    n: '02',
    name: 'PROJECT TWO',
    desc: '[ One sentence on the problem, one on the solution, one on the result. Numbers help. ]',
    descIsPlaceholder: true,
    role: 'FULL-STACK',
    tech: 'NEXT · TS · POSTGRES',
    year: '2024',
    slot: 'PLATE 02 · STABLE ORBIT',
  },
  {
    n: '03',
    name: 'PROJECT THREE',
    desc: '[ Replace with the real case. Prefer a project with a measurable result or a clear technical challenge. ]',
    descIsPlaceholder: true,
    role: 'MOBILE',
    tech: 'FLUTTER · FIREBASE',
    year: '2023',
    slot: 'PLATE 03 · DISTANT FIELD',
  },
];

export const hero = {
  metaLeft: 'SINGULARITY / 01',
  metaRight: 'DESIGN × CODE × MATTER',
  /** Split per line so each line gets its own overflow mask. */
  nameLines: [
    ['V', 'I', 'C', 'T', 'O', 'R'],
    ['H', 'U', 'G', 'O'],
  ],
  role: 'CREATIVE DEVELOPER',
  description: 'I turn ideas into digital experiences through code and design.',
  location: 'SÃO PAULO · BRAZIL',
  scroll: '↓ FALL',
  cta: 'COME CLOSER →',
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
  label: 'ABOUT / DILATION',
  titleLines: [
    'Close to enough mass',
    'time runs slower.',
    'That boy is still there.',
  ],
  body: 'Victor Hugo, developer and designer in São Paulo. I work where product, interface and engineering stop being departments — from a Java and Spring Boot backend through to an interface in React and Three.js.',
  bodySecond:
    'The distance between that sandlot and this screen is twenty-odd years. Seen from here, it looks a good deal shorter than it was to cross.',
  photoCaption: 'ARCHIVE · OBSERVER IN FREE FALL · SINGLE RECORD',
  photoAlt:
    'Victor Hugo as a child, in a yellow shirt, holding onto a roundabout in a playground with an empty sandlot behind him.',
  meta: ['SÃO PAULO', 'DEVELOPER', 'DESIGNER', 'CREATIVE TECHNOLOGY'],
} as const;

export const work = {
  label: 'MATTER IN ORBIT',
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
  label: 'FINAL ORBIT',
  titleLines: ["LET'S BUILD", 'SOMETHING THAT', 'HAS GRAVITY.'],
  /** Named in the section as the one thing the collapse does not take. */
  survivorNote: 'THE ONE SIGNAL THAT ESCAPES',
  links: [
    // TODO(content): real GITHUB / LINKEDIN URLs — placeholders in the handoff.
    { label: 'EMAIL', href: 'mailto:hello@example.com', external: false },
    { label: 'GITHUB', href: '#contact', external: false },
    { label: 'LINKEDIN', href: '#contact', external: false },
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
  cta: 'COME CLOSER',
} as const;

export const chat = {
  title: 'COME CLOSER',
  close: 'PULL AWAY ✕',
  intro:
    'Ask anything about my work, my stack, or how I think a project through.',
  prompts: [
    'HOW DO YOU WORK?',
    'WHAT IS YOUR MAIN STACK?',
    'TELL ME ABOUT EMPREGA.CO',
    'ARE YOU AVAILABLE FOR PROJECTS?',
  ],
  note: '[ MOCKUP — in the real implementation, answers are generated from a curated context about you. No coloured bubbles, no avatar: typography only. ]',
  inputPlaceholder: 'TYPE YOUR QUESTION',
} as const;
