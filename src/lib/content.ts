/**
 * The site's content, and the only source of truth for it.
 *
 * Everything here is published copy with a live consumer. Nothing is kept
 * "for later": an export with no reader is dead weight that the next person
 * has to prove is dead before they can safely touch anything near it.
 */

export type ProjectSlug = 'emprega-co' | 'torneio-pebolim' | 'helppet' | 'doces-da-pati';

export interface ProjectMedia {
  video: string;
  poster: string;
  alt: string;
  width: number;
  height: number;
  durationSeconds: number;
  hasAudio: boolean;
}

export interface ProjectSection {
  title: string;
  body: string;
}

export interface ProjectAction {
  label: string;
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
  status: string;
}

export type Locale = 'en' | 'pt';

export interface ChatPrompt {
  id: string;
  question: string;
  answer: string;
  keywords: readonly string[];
}

export interface ChatContent {
  title: string;
  close: string;
  intro: string;
  prompts: readonly ChatPrompt[];
  fallback: string;
  note: string;
  inputPlaceholder: string;
}

export const projects: Project[] = [
  {
    slug: 'emprega-co',
    n: '01',
    name: 'Emprega.co',
    eyebrow: 'Two-sided employment platform',
    summary:
      'Volunteer team contribution to an NGO employment platform, with Java/Spring APIs and an app for jobs and applications.',
    outcome:
      'One application per person and job, checked in the API and by a PostgreSQL trigger. Payments and staging are implemented for testing; this case does not demonstrate real payments or current production operation.',
    ownership: ['APIs and persistence', 'App and application flows', 'Volunteer teamwork'],
    media: {
      video: '/media/emprega-co.mp4',
      poster: '/media/emprega-co-poster.webp',
      alt: 'Emprega.co candidate and employer product flow screens',
      width: 1920,
      height: 1080,
      durationSeconds: 38,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Context and contribution',
        body: 'Since July 2026, I have volunteered as a technical lead and full-stack developer on the NGO project. Alongside Java/Spring Boot APIs, PostgreSQL and React Native flows, I review pull requests and help coordinate the team using ClickUp and Figma.',
      },
      {
        title: 'Applications and persistence',
        body: 'A person can apply to a job only once. The API checks this rule and a PostgreSQL trigger prevents another record, including after state changes. Flyway migrations track the data model.',
      },
      {
        title: 'Integrations and delivery',
        body: 'Mercado Pago payments, monetary calculations and a staging pipeline are implemented for a test environment. The implementation presented here does not demonstrate real payments or current production operation.',
      },
    ],
    actions: [],
    role: 'BACKEND · REACT NATIVE · TEAM',
    tech: 'JAVA 21 · SPRING BOOT · POSTGRESQL · REACT NATIVE · EXPO',
    year: '2026',
    context: 'Volunteer NGO contribution',
    status: 'In development',
  },
  {
    slug: 'torneio-pebolim',
    n: '02',
    name: 'Torneio Pebolim',
    eyebrow: 'Tournament and match domain',
    summary:
      'A personal tournament project with event-derived scores, standings and brackets, connected to PostgreSQL through Supabase.',
    outcome:
      'Snapshot from October 8, 2026: 153 domain tests passed across 11 files. This is not complete coverage or remote validation of RLS and Realtime.',
    ownership: ['Domain and events', 'Standings and brackets', 'Persistence and updates'],
    media: {
      video: '/media/pebolim.mp4',
      poster: '/media/pebolim-poster.webp',
      alt: 'Torneio Pebolim: matches, standings and brackets with demonstration data',
      width: 1920,
      height: 1080,
      durationSeconds: 36,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Organizing a tournament',
        body: 'The application organizes matches, standings and brackets in one tournament. Match events keep score changes traceable when a goal needs correcting.',
      },
      {
        title: 'Domain model',
        body: 'Match rules, standings and brackets live in a pure domain without React or Supabase dependencies. The interface consumes the results of that model.',
      },
      {
        title: 'Events and corrections',
        body: 'Scores are calculated from match events. Correcting a goal preserves the original event in the history, so the result can be reconstructed from events.',
      },
      {
        title: 'Persistence and updates',
        body: 'PostgreSQL, functions, RLS policies and Supabase Realtime provide persistence and updates. The 153 tests presented cover the local domain; they do not demonstrate RLS permissions or Realtime synchronization in production.',
      },
    ],
    actions: [
      {
        label: 'Live project',
        href: 'https://torneio-pebolim.vercel.app',
      },
      {
        label: 'View source',
        href: 'https://github.com/eovitu/torneio-pebolim',
      },
    ],
    role: 'DOMAIN · DATA · INTERFACE',
    tech: 'TYPESCRIPT · REACT · POSTGRESQL · SUPABASE',
    year: '2026',
    context: 'Personal project',
    status: 'Personal project',
  },
  {
    slug: 'helppet',
    n: '03',
    name: 'HelpPet',
    eyebrow: 'Gateway for pet-care services',
    summary:
      'A Java and Spring Cloud API Gateway that routes the HelpPet microservices and authenticates protected requests with JWT.',
    outcome:
      'Centralized routing, request security and aggregated health visibility for five service groups while contributing to the wider academic product. No public deployment is available.',
    ownership: ['Gateway engineering', 'JWT authentication', 'Service health'],
    media: {
      video: '/media/helppet.mp4',
      poster: '/media/helppet-poster.webp',
      alt: 'HelpPet presentation with recreated screens and demonstration data',
      width: 1920,
      height: 1080,
      durationSeconds: 38,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Context',
        body: 'A third-semester integrator project split across pet-care microservices. The gateway became the single entry point for auth, users, pets, adoption, chat and notifications.',
      },
      {
        title: 'What I owned',
        body: 'My contribution was the reactive Java 17 and Spring Cloud gateway: declarative routes, Bearer JWT validation, authorization rules, GET retries and circuit-breaker fallbacks.',
      },
      {
        title: 'Operational visibility',
        body: 'Aggregated health checks cover five service groups. The video is a presentation with recreated screens and demonstration data. This case presents the gateway implementation. The video with recreated screens does not demonstrate the services operating together.',
      },
    ],
    actions: [
      {
        label: 'View gateway source',
        href: 'https://github.com/HelpPetSENAI/gateway-help-pet-g8',
      },
    ],
    role: 'BACKEND · API GATEWAY',
    tech: 'JAVA 17 · SPRING BOOT · SPRING CLOUD GATEWAY · JWT',
    year: '2026',
    context: 'Academic, integrator project',
    status: 'Academic build',
  },
  {
    slug: 'doces-da-pati',
    n: '04',
    name: 'Doces da Pati',
    eyebrow: 'Mobile-first local storefront',
    summary:
      'A client storefront with a catalogue and cart that prepare a WhatsApp message for the customer to review and send.',
    outcome:
      'Catalogue, authenticated admin and WhatsApp cart handoff. Free tiers were part of the delivery context and remain subject to quotas; payment and message sending are not automatic.',
    ownership: ['Product design', 'Frontend engineering', 'Firebase architecture'],
    media: {
      video: '/media/doces-da-pati.mp4',
      poster: '/media/doces-da-pati-poster.webp',
      alt: 'Doces da Pati mobile storefront and product catalogue',
      width: 1920,
      height: 1080,
      durationSeconds: 38,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Context',
        body: 'The client needed a mobile catalogue and cart. The site prepares a WhatsApp message for the customer to review and send. Assembling it does not establish a sent message, payment or completed sale.',
      },
      {
        title: 'What I owned',
        body: 'I designed and built the storefront, Firebase email authentication and an admin panel for creating, editing, ordering and deactivating products without a developer.',
      },
      {
        title: 'Engineering approach',
        body: 'The admin uses Firebase Auth and Firestore rules to protect catalogue writes. Metadata, sitemap and structured data describe products. GA4 depends on the consent choice. Free tiers have limits and are not a permanent zero-cost guarantee.',
      },
    ],
    actions: [
      {
        label: 'Live Project',
        href: 'https://doces-da-pati.vercel.app/',
      },
    ],
    role: 'PRODUCT · FRONT-END · FIREBASE',
    tech: 'NEXT.JS · TYPESCRIPT · FIREBASE',
    year: '2026',
    context: 'Client work',
    status: 'Live',
  },
];
export const footer = {
  socialLabel: 'FIND ME ONLINE',
  links: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/eovitu/',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/eovitu',
    },
    {
      label: 'Email',
      href: 'mailto:eovitu7@gmail.com',
    },
  ],
  items: [
    '© 2026, VICTOR HUGO',
    'SÃO PAULO · BACKEND DEVELOPMENT',
    'JAVA · SPRING BOOT · POSTGRESQL',
  ],
} as const;
export const nav = {
  brand: 'VITU / ENGINEERING',
  links: [
    {
      label: 'WORK',
      href: '#work',
    },
    {
      label: 'PROFILE',
      href: '#profile',
    },
    {
      label: 'ABOUT',
      href: '#about',
    },
    {
      label: 'CONTACT',
      href: '#contact',
    },
  ],
  cta: 'START A CONVERSATION',
} as const;
export const chat: ChatContent = {
  title: 'TALK TO ME',
  close: 'CLOSE',
  intro: 'Local answers about projects, stack and opportunities.',
  prompts: [
    {
      id: 'process',
      question: 'How do you work?',
      answer:
        'I work from product rules, API contracts and persistence. In Emprega.co, that includes checking an application in both the API and database.',
      keywords: ['work', 'process', 'approach', 'build'],
    },
    {
      id: 'stack',
      question: 'What is your main stack?',
      answer:
        'My main stack is Java, Spring Boot and PostgreSQL. React, React Native and TypeScript support my interface work. Three.js and GSAP are used in this portfolio.',
      keywords: ['stack', 'java', 'spring', 'react', 'typescript', 'three', 'gsap'],
    },
    {
      id: 'emprega',
      question: 'Tell me about Emprega.co.',
      answer:
        'I contribute as a volunteer on the Emprega.co team in 2026, working on APIs, data and app flows. Payments and staging are implemented in a test environment; the case does not demonstrate real payments.',
      keywords: ['emprega', 'employment', 'job', 'case'],
    },
    {
      id: 'availability',
      question: 'Are you available for projects?',
      answer:
        'I’m looking for backend and software development opportunities. Email me or reach out on LinkedIn about a role or project.',
      keywords: ['available', 'availability', 'project', 'hire', 'freelance', 'contact'],
    },
  ],
  fallback:
    'This preview uses curated answers rather than AI. Ask about my process, stack, Emprega.co or availability, or email me directly for anything else.',
  note: 'CURATED RESPONSES · NO AI CONNECTED',
  inputPlaceholder: 'TYPE YOUR QUESTION…',
};
const projectsPt: Project[] = [
  {
    slug: 'emprega-co',
    n: '01',
    name: 'Emprega.co',
    eyebrow: 'Plataforma de empregos para dois públicos',
    summary:
      'Contribuição voluntária em equipe para uma plataforma de ONG, com APIs Java/Spring e aplicativo para vagas e candidaturas.',
    outcome:
      'Candidatura única por pessoa e vaga, validada na API e por trigger no PostgreSQL. Pagamentos e homologação implementados em ambiente de teste, este case não demonstra pagamentos reais ou operação atual em produção.',
    ownership: [
      'APIs e persistência',
      'Aplicativo e fluxos de candidatura',
      'Trabalho voluntário em equipe',
    ],
    media: {
      video: '/media/emprega-co.mp4',
      poster: '/media/emprega-co-poster.webp',
      alt: 'Telas dos fluxos de candidatos e empregadores do Emprega.co',
      width: 1920,
      height: 1080,
      durationSeconds: 38,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Contexto e contribuição',
        body: 'Desde julho de 2026, atuo como líder técnico e desenvolvedor full-stack voluntário no projeto da ONG. Além das APIs Java/Spring Boot, PostgreSQL e fluxos React Native, reviso pull requests e ajudo a organizar o trabalho da equipe com ClickUp e Figma.',
      },
      {
        title: 'Candidatura e persistência',
        body: 'Uma pessoa pode se candidatar uma única vez à mesma vaga. A API verifica a regra e uma trigger no PostgreSQL impede novos registros, inclusive após mudanças de estado. Migrações Flyway registram a evolução do modelo.',
      },
      {
        title: 'Integrações e entrega',
        body: 'Pagamentos com Mercado Pago, cálculo monetário e pipeline de homologação estão implementados em ambiente de teste. A implementação apresentada não demonstra pagamentos reais ou operação atual em produção.',
      },
    ],
    actions: [],
    role: 'BACKEND · REACT NATIVE · EQUIPE',
    tech: 'JAVA 21 · SPRING BOOT · POSTGRESQL · REACT NATIVE · EXPO',
    year: '2026',
    context: 'Contribuição voluntária para ONG',
    status: 'Em desenvolvimento',
  },
  {
    slug: 'torneio-pebolim',
    n: '02',
    name: 'Torneio Pebolim',
    eyebrow: 'Domínio de torneios e partidas',
    summary:
      'Projeto pessoal de torneios com placar derivado de eventos, classificação e chaves, conectado ao PostgreSQL pelo Supabase.',
    outcome:
      'Snapshot de 8 de outubro de 2026: 153 testes de domínio aprovados em 11 arquivos. Isso não representa cobertura completa nem validação remota de RLS e Realtime.',
    ownership: [
      'Domínio e eventos',
      'Classificação e chaves',
      'Persistência e atualização',
    ],
    media: {
      video: '/media/pebolim.mp4',
      poster: '/media/pebolim-poster.webp',
      alt: 'Torneio Pebolim: partidas, classificação e chaves com dados de demonstração',
      width: 1920,
      height: 1080,
      durationSeconds: 36,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Organizar um torneio',
        body: 'A aplicação reúne partidas, classificação e chaves de um torneio. O registro de lances permite acompanhar as mudanças no placar quando um gol precisa ser corrigido.',
      },
      {
        title: 'Modelo de domínio',
        body: 'As regras de partidas, classificação e chaves vivem em um domínio puro, sem dependência de React ou Supabase. A interface consome os resultados desse modelo.',
      },
      {
        title: 'Eventos e correções',
        body: 'O placar é calculado a partir dos lances. Corrigir um gol preserva o evento original no histórico, permitindo reconstruir o resultado a partir dos eventos.',
      },
      {
        title: 'Persistência e atualização',
        body: 'PostgreSQL, funções, políticas RLS e Supabase Realtime compõem a persistência e a atualização. Os 153 testes apresentados cobrem o domínio local; não demonstram permissões RLS ou sincronização Realtime em produção.',
      },
    ],
    actions: [
      {
        label: 'Ver projeto',
        href: 'https://torneio-pebolim.vercel.app',
      },
      {
        label: 'Ver código',
        href: 'https://github.com/eovitu/torneio-pebolim',
      },
    ],
    role: 'DOMÍNIO · DADOS · INTERFACE',
    tech: 'TYPESCRIPT · REACT · POSTGRESQL · SUPABASE',
    year: '2026',
    context: 'Projeto pessoal',
    status: 'Projeto pessoal',
  },
  {
    slug: 'helppet',
    n: '03',
    name: 'HelpPet',
    eyebrow: 'Gateway para serviços de cuidado animal',
    summary:
      'Um API Gateway em Java e Spring Cloud que roteia os microsserviços do HelpPet e autentica requisições protegidas com JWT.',
    outcome:
      'Centralizei roteamento, segurança das requisições e visibilidade de saúde para cinco grupos de serviços, contribuindo também com o produto acadêmico mais amplo. Não há deploy público.',
    ownership: ['Engenharia do gateway', 'Autenticação JWT', 'Saúde dos serviços'],
    media: {
      video: '/media/helppet.mp4',
      poster: '/media/helppet-poster.webp',
      alt: 'Apresentação HelpPet com telas recriadas e dados de demonstração',
      width: 1920,
      height: 1080,
      durationSeconds: 38,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Contexto',
        body: 'Um projeto integrador do terceiro semestre dividido em microsserviços de cuidado animal. O gateway se tornou a entrada única para autenticação, usuários, pets, adoção, chat e notificações.',
      },
      {
        title: 'Minha responsabilidade',
        body: 'Minha contribuição foi o gateway reativo em Java 17 e Spring Cloud: rotas declarativas, validação JWT Bearer, regras de autorização, retentativas GET e fallbacks com circuit breakers.',
      },
      {
        title: 'Visibilidade operacional',
        body: 'Health agregado verifica cinco grupos de serviços. O vídeo é uma apresentação com telas recriadas e dados de demonstração. O case apresenta a implementação do gateway. O vídeo com telas recriadas não demonstra os serviços operando juntos.',
      },
    ],
    actions: [
      {
        label: 'Ver código do gateway',
        href: 'https://github.com/HelpPetSENAI/gateway-help-pet-g8',
      },
    ],
    role: 'BACKEND · API GATEWAY',
    tech: 'JAVA 17 · SPRING BOOT · SPRING CLOUD GATEWAY · JWT',
    year: '2026',
    context: 'Projeto acadêmico integrador',
    status: 'Projeto acadêmico',
  },
  {
    slug: 'doces-da-pati',
    n: '04',
    name: 'Doces da Pati',
    eyebrow: 'Vitrine local pensada para mobile',
    summary:
      'Vitrine para cliente com catálogo e carrinho que prepara uma mensagem de WhatsApp para revisão e envio pela pessoa.',
    outcome:
      'Catálogo, admin autenticado e carrinho com transição ao WhatsApp. Planos gratuitos foram contexto da entrega, sujeitos a cotas; não há pagamento ou envio automático.',
    ownership: ['Design de produto', 'Engenharia frontend', 'Arquitetura Firebase'],
    media: {
      video: '/media/doces-da-pati.mp4',
      poster: '/media/doces-da-pati-poster.webp',
      alt: 'Vitrine mobile e catálogo de produtos da Doces da Pati',
      width: 1920,
      height: 1080,
      durationSeconds: 38,
      hasAudio: false,
    },
    sections: [
      {
        title: 'Contexto',
        body: 'A cliente precisava de catálogo e carrinho no celular. O site monta uma mensagem de WhatsApp; a pessoa revisa e envia. Montar o pedido não comprova envio, pagamento ou venda concluída.',
      },
      {
        title: 'Minha responsabilidade',
        body: 'Projetei e desenvolvi a vitrine, a autenticação por e-mail no Firebase e um painel administrativo para criar, editar, ordenar e desativar produtos sem depender de um desenvolvedor.',
      },
      {
        title: 'Abordagem de engenharia',
        body: 'O admin usa Firebase Auth e regras do Firestore para proteger escritas no catálogo. Metadata, sitemap e dados estruturados apresentam os produtos. O GA4 depende da escolha de consentimento. Planos gratuitos têm limites e não são garantia permanente de custo zero.',
      },
    ],
    actions: [
      {
        label: 'Ver projeto',
        href: 'https://doces-da-pati.vercel.app/',
      },
    ],
    role: 'PRODUTO · FRONTEND · FIREBASE',
    tech: 'NEXT.JS · TYPESCRIPT · FIREBASE',
    year: '2026',
    context: 'Trabalho para cliente',
    status: 'No ar',
  },
];
const sharedUiEn = {
  locale: {
    label: 'Language',
    english: 'English',
    portuguese: 'Português',
  },
  skipToContent: 'Skip to content',
  menu: {
    open: 'MENU',
    close: 'CLOSE',
    label: 'Site menu',
    navigation: 'Mobile navigation',
    primary: 'Primary navigation',
  },
  talkToMe: 'Talk to me',
  home: {
    hero: {
      title: 'VITU Dev Backend',
      lines: ['VITU', 'Dev', 'Backend'],
      note: 'Java · Spring Boot · PostgreSQL',
      kicker: 'Backend developer in São Paulo',
      copy: 'I build APIs with Java and Spring Boot, model data and integrate services. I also work on the apps and interfaces that use those APIs.',
      workCta: 'View selected work',
      contactCta: 'Start a conversation',
    },
    work: {
      kicker: 'Selected work',
      title: ['Projects and', 'technical decisions.'],
      intro:
        'Four projects: jobs and applications, tournaments, a service gateway and a client catalogue. Each case explains the domain, the implementation and the work behind it.',
      role: 'Role',
      stack: 'Stack',
      caseCta: 'View case study',
      progressLabel: 'Selected work chapters',
    },
    profile: {
      kicker: 'Engineering profile',
      title: ['APIs, data', 'and integrations.'],
      intro:
        'Java and Spring in Emprega.co and HelpPet, domain rules and data in Pebolim, client delivery in Doces da Pati.',
      capabilities: [
        [
          'APIs',
          'Emprega.co: applications and contracts. HelpPet: JWT validation and gateway routes.',
          'Java · REST APIs · Spring Boot · Docker',
        ],
        [
          'Data',
          'PostgreSQL and Flyway in Emprega.co. MySQL in spring-ecommerce-api; MongoDB in marketplace-digital.',
          'PostgreSQL · Flyway · MySQL · MongoDB',
        ],
        [
          'Tests and delivery',
          'Cypress in 4dm-cypress. GitHub Actions, Azure staging and Mercado Pago test payments in Emprega.co.',
          'Cypress · GitHub Actions · Azure · Mercado Pago',
        ],
        [
          'Interfaces',
          'React Native in Emprega.co; React in Doces da Pati and this portfolio. TypeScript in Pebolim.',
          'React · React Native · Next.js · TypeScript',
        ],
      ],
    },
    about: {
      kicker: 'About',
      title: ['Victor Hugo.', 'Backend developer.'],
      body: [
        'I’m Victor Hugo, a backend developer in São Paulo. I work with Java, Spring Boot and PostgreSQL, as well as the interfaces that use those APIs. The cases describe my contribution and the technical decisions involved.',
        'I’m looking for backend and software development opportunities. I’m studying Systems Development at SENAI Suíço-Brasileira, with completion expected in December 2026. English B1; AWS fundamentals coursework. Reach me through email, LinkedIn or GitHub.',
      ],
      imageAlt: 'Victor Hugo as a child at a playground',
      caption: 'Victor, before the code.',
    },
    contact: {
      kicker: 'Roles and projects',
      words: ['Let’s talk', 'about your', 'project.'],
    },
  },
  caseStudy: {
    back: 'Selected work',
    navigation: 'Case study navigation',
    context: 'Context',
    role: 'Role',
    year: 'Year',
    stack: 'Stack',
    loading: 'Loading the project story…',
    outcome: 'Outcome',
    previous: 'Previous case',
    next: 'Next case',
    filmLabel: 'project film',
    pause: 'Pause film',
    play: 'Play film',
    seek: 'Seek film',
    of: 'of',
    unmute: 'Unmute film',
    mute: 'Mute film',
    muted: 'MUTED',
    sound: 'SOUND',
  },
  conversation: {
    heading: 'Local answers about my work.',
    suggested: 'Suggested questions',
    empty: 'Select a question or write your own.',
    you: 'You',
    curated: 'Vitu · Curated',
    receiving: 'RECEIVING…',
    ask: 'Ask a question',
    send: 'Send',
    close: 'Close conversation',
  },
  notFound: {
    title: 'Page not found.',
    beforePath: 'There is no page at',
    afterPath: 'Check the address or return to the home page.',
    survived: 'The four projects are linked below.',
    back: 'Back to the start',
    work: 'See the work',
    cases: 'Case studies',
  },
  employment: {
    title: ['Jobs and', 'applications.'],
    intro: 'Product behavior and persistence decisions developed with a team.',
    decisions: [
      [
        'Two audiences',
        'Candidates find jobs; employers publish listings and track applications.',
      ],
      ['Explicit contracts', 'The API defines the data and states consumed by the app.'],
      [
        'Location',
        'Location still uses simulated postal-code data, without a connected postal-code service.',
      ],
      [
        'Job data',
        'The interface presents requirements and conditions available in the listing.',
      ],
      [
        'One application',
        'API validation and a database trigger prevent another record for the same person and job.',
      ],
      ['Tracking', 'State transitions follow domain and persistence rules.'],
    ],
  },
  commerce: {
    kicker: 'Catalogue, cart and administration',
    title: 'From catalogue to WhatsApp message.',
    intro:
      'A client delivery that leaves message review and sending to the customer. There is no automatic payment.',
    steps: [
      ['Discover', 'A catalogue with metadata and structured data to describe products.'],
      [
        'Assemble',
        'The cart collects quantities, options and totals before preparing the message.',
      ],
      [
        'Hand off',
        'One action opens WhatsApp with the complete order ready for the customer to review and send.',
      ],
      [
        'Operate',
        'Firebase Auth and Firestore rules protect admin writes. Free tiers are subject to quotas.',
      ],
    ],
    note: 'GA4 measures the journey only after Consent Mode v2 records the visitor’s choice.',
  },
  integration: {
    title: 'One entry point. Five service groups.',
    intro:
      'The gateway concentrates the cross-cutting decisions that should not be repeated across every HelpPet service.',
    areasLabel: 'Gateway responsibilities',
    areas: ['Route', 'Authenticate', 'Observe'],
    note: 'Java 17 · Spring Boot · Spring Cloud Gateway · WebFlux',
    body: 'Java 17 and Spring Cloud Gateway connect five service groups. JWT validates protected requests; GET retries and circuit breakers handle failures; aggregated health reports service state. The video uses recreated screens and demonstration data. This case presents the gateway implementation. The video with recreated screens does not demonstrate the services operating together.',
  },
};
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? WidenStrings<Item>[]
    : T extends object
      ? { [Key in keyof T]: WidenStrings<T[Key]> }
      : T;

export type SiteUi = WidenStrings<typeof sharedUiEn>;

const sharedUiPt: SiteUi = {
  locale: {
    label: 'Idioma',
    english: 'Inglês',
    portuguese: 'Português',
  },
  skipToContent: 'Pular para o conteúdo',
  menu: {
    open: 'MENU',
    close: 'FECHAR',
    label: 'Menu do site',
    navigation: 'Navegação mobile',
    primary: 'Navegação principal',
  },
  talkToMe: 'Fale comigo',
  home: {
    hero: {
      title: 'VITU Dev Backend',
      lines: ['VITU', 'Dev', 'Backend'],
      note: 'Java · Spring Boot · PostgreSQL',
      kicker: 'Desenvolvedor backend em São Paulo',
      copy: 'Desenvolvo APIs com Java e Spring Boot, modelo dados e integro serviços. Também trabalho no aplicativo e nas interfaces que consomem essas APIs.',
      workCta: 'Ver projetos',
      contactCta: 'Iniciar conversa',
    },
    work: {
      kicker: 'Projetos selecionados',
      title: ['Projetos e', 'decisões técnicas.'],
      intro:
        'Quatro projetos: vagas e candidaturas, torneios, gateway de serviços e catálogo para cliente. Cada case explica o domínio, a implementação e o trabalho envolvido.',
      role: 'Papel',
      stack: 'Stack',
      caseCta: 'Ver case',
      progressLabel: 'Projetos selecionados',
    },
    profile: {
      kicker: 'Perfil de engenharia',
      title: ['APIs, dados', 'e integrações.'],
      intro:
        'Java e Spring no Emprega.co e no HelpPet, domínio e dados no Pebolim, entrega para cliente na Doces da Pati.',
      capabilities: [
        [
          'APIs',
          'Emprega.co: candidaturas e contratos. HelpPet: validação JWT e rotas do gateway.',
          'Java · REST APIs · Spring Boot · Docker',
        ],
        [
          'Dados',
          'PostgreSQL e Flyway no Emprega.co. MySQL no spring-ecommerce-api; MongoDB no marketplace-digital.',
          'PostgreSQL · Flyway · MySQL · MongoDB',
        ],
        [
          'Testes e entrega',
          'Cypress no 4dm-cypress. GitHub Actions, homologação Azure e pagamentos de teste Mercado Pago no Emprega.co.',
          'Cypress · GitHub Actions · Azure · Mercado Pago',
        ],
        [
          'Interfaces',
          'React Native no Emprega.co; React na Doces da Pati e neste portfólio. TypeScript no Pebolim.',
          'React · React Native · Next.js · TypeScript',
        ],
      ],
    },
    about: {
      kicker: 'Sobre',
      title: ['Victor Hugo.', 'Desenvolvedor backend.'],
      body: [
        'Sou Victor Hugo, desenvolvedor backend em São Paulo. Trabalho com Java, Spring Boot e PostgreSQL e também com as interfaces que usam essas APIs. Os cases mostram minha contribuição e as decisões técnicas envolvidas.',
        'Busco oportunidades de backend e desenvolvimento de software. Formação técnica em Desenvolvimento de Sistemas no SENAI Suíço-Brasileira, com conclusão prevista para dezembro de 2026. Inglês B1 e curso de fundamentos AWS. Para conversar, use e-mail, LinkedIn ou GitHub.',
      ],
      imageAlt: 'Victor Hugo criança em um parquinho',
      caption: 'Victor, antes do código.',
    },
    contact: {
      kicker: 'Vagas e projetos',
      words: ['Vamos conversar', 'sobre o seu', 'projeto.'],
    },
  },
  caseStudy: {
    back: 'Projetos selecionados',
    navigation: 'Navegação entre cases',
    context: 'Contexto',
    role: 'Papel',
    year: 'Ano',
    stack: 'Stack',
    loading: 'Carregando a história do projeto…',
    outcome: 'Resultado',
    previous: 'Case anterior',
    next: 'Próximo case',
    filmLabel: 'vídeo de apresentação',
    pause: 'Pausar vídeo',
    play: 'Reproduzir vídeo',
    seek: 'Navegar pelo vídeo',
    of: 'de',
    unmute: 'Ativar som',
    mute: 'Silenciar vídeo',
    muted: 'SEM SOM',
    sound: 'SOM',
  },
  conversation: {
    heading: 'Respostas locais sobre meu trabalho.',
    suggested: 'Perguntas sugeridas',
    empty: 'Escolha uma pergunta ou escreva a sua.',
    you: 'Você',
    curated: 'Vitu · Selecionado',
    receiving: 'RECEBENDO…',
    ask: 'Faça uma pergunta',
    send: 'Enviar',
    close: 'Fechar conversa',
  },
  notFound: {
    title: 'Página não encontrada.',
    beforePath: 'Não existe uma página em',
    afterPath: 'Confira o endereço ou volte para a página inicial.',
    survived: 'Os quatro projetos estão nos links abaixo.',
    back: 'Voltar ao início',
    work: 'Ver projetos',
    cases: 'Cases',
  },
  employment: {
    title: ['Vagas e', 'candidaturas.'],
    intro: 'Comportamentos do produto e decisões de persistência, desenvolvidos em equipe.',
    decisions: [
      [
        'Dois públicos',
        'Candidatos procuram vagas; empregadores publicam e acompanham candidaturas.',
      ],
      ['Contratos explícitos', 'A API define os dados e estados que o aplicativo consome.'],
      [
        'Localização',
        'A localização ainda usa dados simulados de CEP, sem integração com um serviço de consulta.',
      ],
      [
        'Dados da vaga',
        'A interface apresenta requisitos e condições disponíveis no cadastro.',
      ],
      [
        'Candidatura única',
        'Validação na API e trigger no banco impedem outro registro para a mesma pessoa e vaga.',
      ],
      [
        'Acompanhamento',
        'Transições de estado seguem as regras do domínio e da persistência.',
      ],
    ],
  },
  commerce: {
    kicker: 'Catálogo, carrinho e administração',
    title: 'Do catálogo à mensagem de WhatsApp.',
    intro:
      'Entrega para cliente que mantém a revisão e o envio da mensagem com a pessoa. Não há pagamento automático.',
    steps: [
      [
        'Descobrir',
        'Catálogo com metadata e dados estruturados para apresentar os produtos.',
      ],
      [
        'Montar',
        'O carrinho reúne quantidades, opções e total antes de preparar a mensagem.',
      ],
      [
        'Transferir',
        'Uma ação abre o WhatsApp com o pedido completo para a pessoa revisar e enviar.',
      ],
      [
        'Operar',
        'Firebase Auth e regras do Firestore protegem escritas do admin. Planos gratuitos estão sujeitos a cotas.',
      ],
    ],
    note: 'O GA4 mede a jornada somente depois que o Consent Mode v2 registra a escolha da pessoa visitante.',
  },
  integration: {
    title: 'Uma entrada. Cinco grupos de serviços.',
    intro:
      'O gateway concentra decisões transversais que não devem ser repetidas em cada serviço do HelpPet.',
    areasLabel: 'Responsabilidades do gateway',
    areas: ['Rotear', 'Autenticar', 'Observar'],
    note: 'Java 17 · Spring Boot · Spring Cloud Gateway · WebFlux',
    body: 'Java 17 e Spring Cloud Gateway conectam cinco grupos de serviços. JWT valida requisições protegidas; retentativas GET e circuit breakers tratam falhas; health agregado reúne o estado dos serviços. O vídeo usa telas recriadas e dados de demonstração. O case apresenta a implementação do gateway. O vídeo com telas recriadas não demonstra os serviços operando juntos.',
  },
};
export interface SiteContent {
  projects: Project[];
  footer: {
    socialLabel: string;
    links: readonly { label: string; href: string }[];
    items: readonly string[];
  };
  nav: {
    brand: string;
    links: readonly { label: string; href: string }[];
    cta: string;
  };
  chat: ChatContent;
  ui: SiteUi;
}

const contentByLocale: Record<Locale, SiteContent> = {
  en: { projects, footer, nav, chat, ui: sharedUiEn },
  pt: {
    projects: projectsPt,
    footer: {
      socialLabel: 'ENCONTRE-ME EM',
      links: [
        {
          label: 'LinkedIn',
          href: 'https://www.linkedin.com/in/eovitu/',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/eovitu',
        },
        {
          label: 'Email',
          href: 'mailto:eovitu7@gmail.com',
        },
      ],
      items: [
        '© 2026, VICTOR HUGO',
        'SÃO PAULO · DESENVOLVIMENTO BACKEND',
        'JAVA · SPRING BOOT · POSTGRESQL',
      ],
    },
    nav: {
      brand: 'VITU / ENGENHARIA',
      links: [
        {
          label: 'PROJETOS',
          href: '#work',
        },
        {
          label: 'PERFIL',
          href: '#profile',
        },
        {
          label: 'SOBRE',
          href: '#about',
        },
        {
          label: 'CONTATO',
          href: '#contact',
        },
      ],
      cta: 'VAMOS CONVERSAR',
    },
    chat: {
      title: 'FALE COMIGO',
      close: 'FECHAR',
      intro: 'Respostas locais sobre projetos, stack e oportunidades.',
      prompts: [
        {
          id: 'process',
          question: 'Como você trabalha?',
          answer:
            'Trabalho a partir das regras do produto, dos contratos da API e da persistência. No Emprega.co, isso inclui validar a candidatura na API e no banco.',
          keywords: ['trabalha', 'trabalho', 'processo', 'abordagem', 'construir', 'work'],
        },
        {
          id: 'stack',
          question: 'Qual é a sua stack principal?',
          answer:
            'Minha stack principal é Java, Spring Boot e PostgreSQL. React, React Native e TypeScript complementam o trabalho nas interfaces. Three.js e GSAP aparecem neste portfólio.',
          keywords: ['stack', 'java', 'spring', 'react', 'typescript', 'three', 'gsap'],
        },
        {
          id: 'emprega',
          question: 'Conte sobre o Emprega.co.',
          answer:
            'Contribuo como voluntário em equipe no Emprega.co em 2026, com APIs, dados e fluxos do aplicativo. Pagamentos e homologação estão implementados em ambiente de teste; o case não demonstra pagamentos reais.',
          keywords: ['emprega', 'emprego', 'vaga', 'case'],
        },
        {
          id: 'availability',
          question: 'Você está disponível para projetos?',
          answer:
            'Busco oportunidades de backend e desenvolvimento de software. Entre em contato por e-mail ou LinkedIn para conversar sobre uma vaga ou projeto.',
          keywords: [
            'disponível',
            'disponivel',
            'projeto',
            'contratar',
            'freelance',
            'contato',
          ],
        },
      ],
      fallback:
        'Esta experiência usa respostas selecionadas, não IA. Pergunte sobre meu processo, stack, Emprega.co ou disponibilidade. Para outros assuntos, envie um e-mail.',
      note: 'RESPOSTAS SELECIONADAS · SEM IA',
      inputPlaceholder: 'DIGITE SUA PERGUNTA…',
    },
    ui: sharedUiPt,
  },
};
export function parseLocale(value: string | null): Locale | null {
  return value === 'en' || value === 'pt' ? value : null;
}

export function contentFor(locale: Locale): SiteContent {
  return contentByLocale[locale];
}
