/**
 * All copy, transcribed verbatim from the approved handoff.
 *
 * Strings wrapped in [ ... ] are the designer's placeholders and are marked
 * `placeholder: true` so they render with the placeholder treatment and are
 * trivial to find later. TODO(content): replace before launch.
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
    desc: 'Marketplace de serviços domésticos — busca, agendamento e pagamento em um fluxo só. Do modelo de dados à interface.',
    role: 'DESIGN · PRODUCT · FRONT-END',
    tech: 'JAVA · SPRING · REACT',
    year: '2025',
    slot: 'PLACA 01 · PRÓXIMA DO HORIZONTE',
  },
  {
    n: '02',
    name: 'PROJETO DOIS',
    desc: '[ Uma frase sobre o problema, uma sobre a solução, uma sobre o resultado. Números ajudam. ]',
    descIsPlaceholder: true,
    role: 'FULL-STACK',
    tech: 'NEXT · TS · POSTGRES',
    year: '2024',
    slot: 'PLACA 02 · ÓRBITA ESTÁVEL',
  },
  {
    n: '03',
    name: 'PROJETO TRÊS',
    desc: '[ Substituir pelo case real. Prefira um projeto com resultado mensurável ou desafio técnico claro. ]',
    descIsPlaceholder: true,
    role: 'MOBILE',
    tech: 'FLUTTER · FIREBASE',
    year: '2023',
    slot: 'PLACA 03 · CAMPO DISTANTE',
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

/**
 * The band that crosses the WORK -> ABOUT boundary. Written in the site's own
 * voice: statements about matter and light, not a job title on repeat.
 */
export const marquee = {
  items: [
    { text: 'MATÉRIA EM ÓRBITA' },
    { text: '•', accent: true },
    { text: 'A LUZ CHEGA CURVADA' },
    { text: '•', accent: true },
    { text: 'O TEMPO ANDA MAIS DEVAGAR AQUI' },
    { text: '•', accent: true },
    { text: 'NADA QUE ENTRA VOLTA IGUAL' },
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
    lines: ['A MATÉRIA CHEGA', 'INTEIRA.'],
    lead: 'SAI OUTRA COISA.',
    metrics: [
      ['MASSA ABSORVIDA', '3 PROJETOS'],
      ['TEMPO PRÓPRIO', '2023 — 2026'],
      ['ESTADO', 'EM ÓRBITA'],
    ] as [string, string][],
  },
  fall: {
    id: 'interlude-fall',
    lines: ['DAQUI EM DIANTE,', 'SÓ QUEDA.'],
  },
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
