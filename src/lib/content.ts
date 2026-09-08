/**
 * The site's content, and the only source of truth for it.
 *
 * Everything here is published copy with a live consumer. Nothing is kept
 * "for later": an export with no reader is dead weight that the next person
 * has to prove is dead before they can safely touch anything near it.
 */

export type ProjectSlug = 'emprega-co' | 'doces-da-pati' | 'helppet';

interface ProjectMedia {
  video: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
}

interface ProjectSection {
  title: string;
  body: string;
}

interface ProjectAction {
  label: 'Live Project' | 'View Source';
  href: string;
}

export interface Project {
  slug: ProjectSlug;
  n: string;
  name: string;
  eyebrow: string;
  summary: string;
  outcome: string;
  ownership: readonly string[];
  media: ProjectMedia;
  sections: readonly ProjectSection[];
  actions: readonly ProjectAction[];
  role: string;
  tech: string;
  year: string;
  /**
   * The relationship the work came out of, not a client name.
   *
   * "NGO project", "Client work", "Personal project" all say something true
   * without naming a party nobody authorised us to name. Empty means unknown,
   * and the case header omits the row rather than guessing.
   */
  context: string;
  status: 'In development' | 'Live' | 'Academic build';
}

export const projects: Project[] = [
  {
    slug: 'emprega-co',
    n: '01',
    name: 'Emprega.co',
    eyebrow: 'Two-sided employment platform',
    summary:
      'A connected candidate and employer experience designed around discovery, applications and hiring workflows.',
    outcome:
      'Defined the product journeys and system structure for candidates and employers across one platform.',
    ownership: ['Backend architecture', 'Product flows', 'Interface direction'],
    media: {
      video: '/media/emprega-co.mp4',
      poster: '/media/emprega-co-poster.webp',
      alt: 'Emprega.co candidate and employer product flow screens',
      width: 1280,
      height: 720,
    },
    sections: [
      {
        title: 'Context',
        body: 'Employment products serve two audiences with different goals. The work maps candidate discovery and application states alongside employer publishing and management flows.',
      },
      {
        title: 'What I owned',
        body: 'I worked across backend structure, product decisions and interface direction, keeping the two journeys separate while sharing one domain model.',
      },
      {
        title: 'Engineering approach',
        body: 'The architecture centers explicit Java and Spring contracts, predictable state transitions and a React interface that makes loading, empty and recovery states visible.',
      },
    ],
    actions: [],
    role: 'BACKEND · PRODUCT · INTERFACE',
    tech: 'JAVA 21 · SPRING BOOT · POSTGRESQL · REACT NATIVE · EXPO',
    year: '2025',
    context: 'NGO project',
    status: 'In development',
  },
  {
    slug: 'doces-da-pati',
    n: '02',
    name: 'Doces da Pati',
    eyebrow: 'Mobile-first local storefront',
    summary:
      'A lightweight storefront that turns a small confectionery catalogue into a clear mobile ordering journey.',
    outcome:
      'Shipped a public catalogue experience with product discovery and a direct path from selection to contact.',
    ownership: ['Product design', 'Frontend engineering', 'Deployment'],
    media: {
      video: '/media/doces-da-pati.mp4',
      poster: '/media/doces-da-pati-poster.webp',
      alt: 'Doces da Pati mobile storefront and product catalogue',
      width: 1280,
      height: 720,
    },
    sections: [
      {
        title: 'Context',
        body: 'The business needed a simple public catalogue that works well on phones and does not introduce operational infrastructure the owner cannot maintain.',
      },
      {
        title: 'What I owned',
        body: 'I designed and built the storefront, structured the catalogue and shaped the ordering path around the tools already used by the business.',
      },
      {
        title: 'Engineering approach',
        body: 'The implementation prioritizes mobile rendering, legible product information, low-friction contact and a deployment model that stays inexpensive to operate.',
      },
    ],
    actions: [{ label: 'Live Project', href: 'https://doces-da-pati.vercel.app/' }],
    role: 'PRODUCT · FRONT-END',
    tech: 'NEXT.JS · TYPESCRIPT · FIREBASE',
    year: '2026',
    context: 'Client work',
    status: 'Live',
  },
  {
    slug: 'helppet',
    n: '03',
    name: 'HelpPet',
    eyebrow: 'Pet care, connected through code',
    summary:
      'An academic pet-care build exploring API consumption, a gateway and the connection between frontend and backend.',
    outcome:
      'Built the academic project and its interface system while learning to connect frontend and backend. No public deployment is available.',
    ownership: ['Design system', 'Product flows', 'Interaction architecture'],
    media: {
      video: '/media/helppet.mp4',
      poster: '/media/helppet-poster.webp',
      alt: 'HelpPet design system components and connected care flows',
      width: 1280,
      height: 720,
    },
    sections: [
      {
        title: 'Context',
        body: 'A third-semester integrator project: bring a pet-care experience together while learning API consumption and frontend/backend integration.',
      },
      {
        title: 'What I owned',
        body: 'I organized the page flows and created the component rules, variants and visual foundations needed for the product to grow consistently.',
      },
      {
        title: 'Connecting the system',
        body: 'The learning focus was the boundary between the interface, a gateway and the API. The Figma material documents the interface; it is not presented as footage of a deployed product.',
      },
    ],
    actions: [
      {
        label: 'View Source',
        href: 'https://github.com/orgs/HelpPetSENAI/repositories',
      },
    ],
    role: 'PRODUCT · UI/UX',
    tech: 'API INTEGRATION · GATEWAY · DESIGN SYSTEMS',
    year: '2026',
    context: 'Academic, integrator project',
    status: 'Academic build',
  },
];

export const footer = {
  items: [
    '© 2026, VICTOR HUGO',
    'BASED IN SÃO PAULO · WORKING WORLDWIDE',
    'BUILT WITH INTENTION.',
  ],
} as const;

export const nav = {
  brand: 'VITU / ENGINEERING',
  links: [
    { label: 'WORK', href: '#work' },
    { label: 'PROFILE', href: '#profile' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ],
  cta: 'START A CONVERSATION',
} as const;

export const chat = {
  title: 'TALK TO ME',
  close: 'CLOSE',
  intro: 'Ask about my work, my stack or how I approach a product.',
  prompts: [
    {
      id: 'process',
      question: 'How do you work?',
      answer:
        'I start with product behavior and constraints, then make the domain, interfaces and delivery path explicit. The goal is a small, reliable system with enough visual character to feel intentional.',
      keywords: ['work', 'process', 'approach', 'build'],
    },
    {
      id: 'stack',
      question: 'What is your main stack?',
      answer:
        'My center of gravity is Java, Spring Boot and PostgreSQL. I also build typed interfaces with React and TypeScript, using Three.js and GSAP when motion or real-time visuals improve the product.',
      keywords: ['stack', 'java', 'spring', 'react', 'typescript', 'three', 'gsap'],
    },
    {
      id: 'emprega',
      question: 'Tell me about Emprega.co.',
      answer:
        'Emprega.co is a two-sided employment platform. I worked across backend structure, candidate and employer journeys, product decisions and interface direction so both sides could share one coherent domain model.',
      keywords: ['emprega', 'employment', 'job', 'case'],
    },
    {
      id: 'availability',
      question: 'Are you available for projects?',
      answer:
        'Yes. I am open to backend, product engineering and creative development opportunities, working remotely from São Paulo with teams worldwide.',
      keywords: ['available', 'availability', 'project', 'hire', 'freelance', 'contact'],
    },
  ],
  fallback:
    'This preview uses curated answers rather than AI. Ask about my process, stack, Emprega.co or availability, or email me directly for anything else.',
  note: 'CURATED RESPONSES · NO AI CONNECTED',
  inputPlaceholder: 'TYPE YOUR QUESTION…',
} as const;
