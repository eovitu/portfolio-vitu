/**
 * All copy, transcribed verbatim from the approved handoff.
 *
 * Strings wrapped in [ ... ] are the designer's placeholders and are marked
 * `placeholder: true` so they render with the placeholder treatment and are
 * trivial to find later. TODO(content): replace before launch.
 */

export type ProjectSlug = 'emprega-co' | 'doces-da-pati' | 'helppet';

export interface ProjectMedia {
  video: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProjectSection {
  title: string;
  body: string;
}

export interface ProjectAction {
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
    slug: 'emprega-co',
    n: '01',
    name: 'EMPREGA.CO',
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
      width: 1440,
      height: 900,
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
    desc: 'Marketplace de serviços domésticos — busca, agendamento e pagamento em um fluxo só. Do modelo de dados à interface.',
    role: 'DESIGN · PRODUCT · FRONT-END',
    tech: 'JAVA · SPRING · REACT',
    year: '2025',
    slot: 'PLACA 01 · PRÓXIMA DO HORIZONTE',
  },
  {
    slug: 'doces-da-pati',
    n: '02',
    name: 'DOCES DA PATI',
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
      width: 1440,
      height: 900,
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
    actions: [
      { label: 'Live Project', href: 'https://doces-da-pati.vercel.app/' },
      { label: 'View Source', href: 'https://github.com/eovitu/doces-da-pati' },
    ],
    desc: '[ Uma frase sobre o problema, uma sobre a solução, uma sobre o resultado. Números ajudam. ]',
    role: 'PRODUCT · FRONT-END',
    tech: 'NEXT.JS · TYPESCRIPT · FIREBASE',
    year: '2026',
    slot: 'STOREFRONT · MOBILE COMMERCE',
  },
  {
    slug: 'helppet',
    n: '03',
    name: 'HELPPET',
    eyebrow: 'Connected pet-care product system',
    summary:
      'A product and design-system study connecting pet owners, care information and service journeys.',
    outcome:
      'Structured a reusable interface language and the principal journeys for a connected care experience.',
    ownership: ['Design system', 'Product flows', 'Interaction architecture'],
    media: {
      video: '/media/helppet.mp4',
      poster: '/media/helppet-poster.webp',
      alt: 'HelpPet design system components and connected care flows',
      width: 1440,
      height: 900,
    },
    sections: [
      {
        title: 'Context',
        body: 'Pet-care journeys combine recurring information, service discovery and trust. The project explores how those needs can share a coherent product language.',
      },
      {
        title: 'What I owned',
        body: 'I organized the page flows and created the component rules, variants and visual foundations needed for the product to grow consistently.',
      },
      {
        title: 'System approach',
        body: 'Reusable tokens and components connect the interface states while the flow model keeps navigation and feedback understandable across the journey.',
      },
    ],
    actions: [],
    desc: '[ Substituir pelo case real. Prefira um projeto com resultado mensurável ou desafio técnico claro. ]',
    role: 'PRODUCT · UI/UX',
    tech: 'FIGMA · DESIGN SYSTEMS · PROTOTYPING',
    year: '2026',
    slot: 'DESIGN SYSTEM · CONNECTED CARE',
  },
];

export const hero = {
  metaLeft: 'SINGULARITY / 01',
  metaRight: 'DESIGN × CÓDIGO × MATÉRIA',
  /** Split per line so each line gets its own overflow mask. */
  nameLines: [
    ['V', 'I', 'C', 'T', 'O', 'R'],
    ['H', 'U', 'G', 'O'],
  ],
  role: 'CREATIVE DEVELOPER',
  description: 'Eu transformo ideias em experiências digitais através de código e design.',
  location: 'SÃO PAULO · BRAZIL',
  scroll: '↓ CAIR',
  cta: 'CHEGUE MAIS PERTO →',
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
  label: 'ABOUT / DILATAÇÃO',
  titleLines: [
    'Perto de massa suficiente',
    'o tempo anda mais devagar.',
    'Esse menino ainda está lá.',
  ],
  body: 'Victor Hugo, desenvolvedor e designer em São Paulo. Trabalho onde produto, interface e engenharia param de ser departamentos — do backend em Java e Spring Boot à interface em React e Three.js.',
  bodySecond:
    'A distância entre aquele campo de areia e esta tela é de vinte e poucos anos. Vista daqui, ela parece bem menor do que foi para atravessar.',
  photoCaption: 'ARQUIVO · OBSERVADOR EM QUEDA · REGISTRO ÚNICO',
  photoAlt:
    'Victor Hugo criança, de camisa amarela, segurando um gira-gira num parquinho com um campo de areia vazio ao fundo.',
  meta: ['SÃO PAULO', 'DESENVOLVEDOR', 'DESIGNER', 'TECNOLOGIA CRIATIVA'],
} as const;

export const work = {
  label: 'MATÉRIA EM ÓRBITA',
  mediaNote: 'REGISTRO PENDENTE',
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
  label: 'O QUE SOBREVIVE À PRESSÃO',
  labelRight: 'LEITURA ESPECTRAL',
  intro:
    'Cada linha é uma emissão. A posição diz o domínio, o brilho diz o quanto ela carrega do trabalho.',
  hint: 'PASSE SOBRE UMA LINHA',
  lines: [
    {
      name: 'Java',
      domain: 'BACKEND',
      at: 0.05,
      weight: 0.95,
      detail: 'Serviços de longa duração, domínio modelado antes de qualquer tela.',
    },
    {
      name: 'Spring Boot',
      domain: 'BACKEND',
      at: 0.12,
      weight: 0.9,
      detail: 'APIs, autenticação e a camada chata que precisa não falhar.',
    },
    {
      name: 'PostgreSQL',
      domain: 'BACKEND',
      at: 0.19,
      weight: 0.75,
      detail: 'Modelagem relacional. O esquema é a parte que sobrevive ao produto.',
    },
    {
      name: 'REST / APIs',
      domain: 'BACKEND',
      at: 0.26,
      weight: 0.7,
      detail: 'Contratos entre sistemas — onde a maioria dos bugs de produto nasce.',
    },
    {
      name: 'TypeScript',
      domain: 'FRONTEND',
      at: 0.38,
      weight: 1,
      detail: 'O tipo como documentação executável. Nada de produção sem ele.',
    },
    {
      name: 'React',
      domain: 'FRONTEND',
      at: 0.45,
      weight: 0.95,
      detail: 'Composição de interface e o custo real de cada re-render.',
    },
    {
      name: 'Next.js',
      domain: 'FRONTEND',
      at: 0.52,
      weight: 0.7,
      detail: 'Renderização no servidor quando a primeira pintura importa.',
    },
    {
      name: 'Flutter',
      domain: 'FRONTEND',
      at: 0.58,
      weight: 0.55,
      detail: 'Mobile quando uma base de código só é a decisão certa.',
    },
    {
      name: 'Three.js',
      domain: 'TRIDIMENSIONAL',
      at: 0.68,
      weight: 0.85,
      detail: 'Geometria, materiais e orçamento de frame. Este site é a evidência.',
    },
    {
      name: 'GLSL',
      domain: 'TRIDIMENSIONAL',
      at: 0.74,
      weight: 0.6,
      detail: 'Shaders quando o efeito não cabe no que o DOM sabe fazer.',
    },
    {
      name: 'GSAP',
      domain: 'TRIDIMENSIONAL',
      at: 0.79,
      weight: 0.8,
      detail: 'Timelines scrubadas. Movimento que o leitor controla, não assiste.',
    },
    {
      name: 'Figma',
      domain: 'DESIGN',
      at: 0.87,
      weight: 0.85,
      detail: 'Onde a decisão acontece antes de custar tempo de implementação.',
    },
    {
      name: 'Design Systems',
      domain: 'DESIGN',
      at: 0.93,
      weight: 0.8,
      detail: 'Token único, uma fonte de verdade. Consistência é infraestrutura.',
    },
    {
      name: 'Motion',
      domain: 'DESIGN',
      at: 0.98,
      weight: 0.65,
      detail: 'Peso, atrito e antecipação — física, não duração.',
    },
  ] satisfies SpectralLine[] as SpectralLine[],
} as const;

export const contact = {
  label: 'ÚLTIMA ÓRBITA',
  titleLines: ["LET'S BUILD", 'SOMETHING THAT', 'HAS GRAVITY.'],
  /** Named in the section as the one thing the collapse does not take. */
  survivorNote: 'O ÚNICO SINAL QUE ESCAPA',
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
    'SINGULARITY / FIM DA TRANSMISSÃO',
  ],
} as const;

export const nav = {
  brand: 'VITU / SINGULARITY',
  links: [
    { label: 'WORK', href: '#work' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CONTACT', href: '#contact' },
  ],
  cta: 'CHEGUE MAIS PERTO',
} as const;

export const chat = {
  title: 'CHEGUE MAIS PERTO',
  close: 'AFASTAR ✕',
  intro:
    'Pergunte qualquer coisa sobre o meu trabalho, minha stack ou como eu penso um projeto.',
  prompts: [
    'COMO VOCÊ TRABALHA?',
    'QUAL SUA STACK PRINCIPAL?',
    'ME CONTE SOBRE O EMPREGA.CO',
    'ESTÁ DISPONÍVEL PARA PROJETOS?',
  ],
  note: '[ MOCKUP — na implementação, respostas geradas a partir de um contexto curado sobre você. Sem bolhas coloridas, sem avatar: só tipografia. ]',
  inputPlaceholder: 'DIGITE SUA PERGUNTA',
} as const;
