/**
 * The site's content, and the only source of truth for it.
 *
 * Everything here is published copy with a live consumer. Nothing is kept
 * "for later": an export with no reader is dead weight that the next person
 * has to prove is dead before they can safely touch anything near it.
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

export const chat: ChatContent = {
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
};

const projectsPt: Project[] = [
  {
    ...projects[0],
    eyebrow: 'Plataforma de empregos para dois públicos',
    summary:
      'Uma experiência conectada para candidatos e empregadores, criada em torno da descoberta, das candidaturas e dos processos de contratação.',
    outcome:
      'Defini as jornadas de produto e a estrutura do sistema para candidatos e empregadores em uma única plataforma.',
    ownership: ['Arquitetura backend', 'Fluxos de produto', 'Direção de interface'],
    media: {
      ...projects[0].media,
      alt: 'Telas dos fluxos de candidatos e empregadores do Emprega.co',
    },
    sections: [
      {
        title: 'Contexto',
        body: 'Produtos de emprego atendem dois públicos com objetivos diferentes. O trabalho mapeia a descoberta e a candidatura de profissionais junto aos fluxos de publicação e gestão dos empregadores.',
      },
      {
        title: 'Minha responsabilidade',
        body: 'Atuei na estrutura do backend, nas decisões de produto e na direção da interface, mantendo as duas jornadas separadas sobre um único modelo de domínio.',
      },
      {
        title: 'Abordagem de engenharia',
        body: 'A arquitetura prioriza contratos explícitos em Java e Spring, transições de estado previsíveis e uma interface React que torna visíveis os estados de carregamento, vazio e recuperação.',
      },
    ],
    role: 'BACKEND · PRODUTO · INTERFACE',
    context: 'Projeto para ONG',
    status: 'Em desenvolvimento',
  },
  {
    ...projects[1],
    eyebrow: 'Vitrine local pensada para mobile',
    summary:
      'Uma vitrine leve que transforma o catálogo de uma pequena confeitaria em uma jornada clara de pedidos pelo celular.',
    outcome:
      'Entreguei um catálogo público com descoberta de produtos e um caminho direto da escolha ao contato.',
    ownership: ['Design de produto', 'Engenharia frontend', 'Deploy'],
    media: {
      ...projects[1].media,
      alt: 'Vitrine mobile e catálogo de produtos da Doces da Pati',
    },
    sections: [
      {
        title: 'Contexto',
        body: 'O negócio precisava de um catálogo público simples, eficiente em celulares e sem infraestrutura operacional difícil de manter.',
      },
      {
        title: 'Minha responsabilidade',
        body: 'Projetei e desenvolvi a vitrine, organizei o catálogo e desenhei o fluxo de pedidos em torno das ferramentas já usadas pelo negócio.',
      },
      {
        title: 'Abordagem de engenharia',
        body: 'A implementação prioriza renderização mobile, informações legíveis, contato sem atrito e um modelo de deploy barato de operar.',
      },
    ],
    actions: [{ label: 'Ver projeto', href: projects[1].actions[0].href }],
    role: 'PRODUTO · FRONTEND',
    context: 'Trabalho para cliente',
    status: 'No ar',
  },
  {
    ...projects[2],
    eyebrow: 'Cuidado animal conectado por código',
    summary:
      'Um projeto acadêmico de cuidado animal explorando consumo de API, gateway e a conexão entre frontend e backend.',
    outcome:
      'Desenvolvi o projeto acadêmico e seu sistema de interface enquanto aprendia a conectar frontend e backend. Não há uma versão pública disponível.',
    ownership: ['Design system', 'Fluxos de produto', 'Arquitetura de interação'],
    media: {
      ...projects[2].media,
      alt: 'Componentes do design system e fluxos de cuidado conectado do HelpPet',
    },
    sections: [
      {
        title: 'Contexto',
        body: 'Um projeto integrador do terceiro semestre: reunir uma experiência de cuidado animal enquanto aprendíamos consumo de API e integração entre frontend e backend.',
      },
      {
        title: 'Minha responsabilidade',
        body: 'Organizei os fluxos das páginas e criei regras de componentes, variantes e fundamentos visuais para o produto crescer com consistência.',
      },
      {
        title: 'Conectando o sistema',
        body: 'O foco de aprendizado estava na fronteira entre a interface, um gateway e a API. O material do Figma documenta a interface e não é apresentado como gravação de um produto publicado.',
      },
    ],
    actions: [{ label: 'Ver código', href: projects[2].actions[0].href }],
    role: 'PRODUTO · UI/UX',
    context: 'Projeto acadêmico integrador',
    status: 'Projeto acadêmico',
  },
];

const navPt = {
  brand: 'VITU / ENGENHARIA',
  links: [
    { label: 'PROJETOS', href: '#work' },
    { label: 'PERFIL', href: '#profile' },
    { label: 'SOBRE', href: '#about' },
    { label: 'CONTATO', href: '#contact' },
  ],
  cta: 'VAMOS CONVERSAR',
} as const;

const chatPt: ChatContent = {
  title: 'FALE COMIGO',
  close: 'FECHAR',
  intro: 'Pergunte sobre meu trabalho, minha stack ou como penso um produto.',
  prompts: [
    {
      id: 'process',
      question: 'Como você trabalha?',
      answer:
        'Começo pelo comportamento do produto e suas restrições. Depois, torno explícitos o domínio, as interfaces e o caminho de entrega. O objetivo é um sistema pequeno, confiável e com personalidade visual intencional.',
      keywords: ['trabalha', 'trabalho', 'processo', 'abordagem', 'construir', 'work'],
    },
    {
      id: 'stack',
      question: 'Qual é a sua stack principal?',
      answer:
        'Meu centro de gravidade é Java, Spring Boot e PostgreSQL. Também construo interfaces tipadas com React e TypeScript, usando Three.js e GSAP quando movimento ou visuais em tempo real melhoram o produto.',
      keywords: ['stack', 'java', 'spring', 'react', 'typescript', 'three', 'gsap'],
    },
    {
      id: 'emprega',
      question: 'Conte sobre o Emprega.co.',
      answer:
        'O Emprega.co é uma plataforma de empregos para dois públicos. Atuei na estrutura backend, nas jornadas de candidatos e empregadores, nas decisões de produto e na direção da interface para que os dois lados compartilhassem um modelo de domínio coerente.',
      keywords: ['emprega', 'emprego', 'vaga', 'case'],
    },
    {
      id: 'availability',
      question: 'Você está disponível para projetos?',
      answer:
        'Sim. Estou aberto a oportunidades de backend, engenharia de produto e desenvolvimento criativo, trabalhando remotamente de São Paulo com equipes do mundo todo.',
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
};

const sharedUiEn = {
  locale: { label: 'Language', english: 'English', portuguese: 'Português' },
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
      title: 'Code with a human pulse.',
      lines: ['Code with', 'a human', 'pulse.'],
      note: 'Engineer. Curious human.',
      kicker: 'Backend developer. Product-minded.',
      copy: 'Solid systems. Expressive interfaces. I’m Victor, I build the logic behind a product and the details that make it feel alive.',
      workCta: 'View selected work',
      contactCta: 'Start a conversation',
    },
    work: {
      kicker: 'Selected work',
      title: ['Different problems.', 'Different worlds.'],
      intro:
        'Three projects across platform architecture, local commerce and connected care. Each case shows the decisions behind the surface.',
      role: 'Role',
      stack: 'Stack',
      caseCta: 'View case study',
      progressLabel: 'Selected work chapters',
    },
    profile: {
      kicker: 'Engineering profile',
      title: ['Under the hood.', 'Beyond the obvious.'],
      intro:
        'Backend is the center of gravity. Product thinking, interface architecture and real-time visuals extend the same engineering discipline.',
      capabilities: [
        [
          'Backend Systems',
          'Domain models, APIs and persistence shaped around product behavior instead of framework defaults.',
          'Java · Spring Boot · PostgreSQL · REST',
        ],
        [
          'Product Engineering',
          'From ambiguous product flows to explicit states, contracts and implementation decisions.',
          'System design · Product flows · Delivery',
        ],
        [
          'Interface Architecture',
          'Typed React interfaces with accessible states, clear ownership and maintainable motion boundaries.',
          'TypeScript · React · Next.js · Design systems',
        ],
        [
          '3D & Motion',
          'Real-time visual systems used when they clarify the experience, with a measured performance budget.',
          'Three.js · R3F · GSAP · GLSL',
        ],
      ],
    },
    about: {
      kicker: 'About',
      title: ['Still curious.', 'Just building bigger things.'],
      body: [
        'I am Victor Hugo, a backend developer in São Paulo working across system architecture, product decisions and expressive interfaces. I care about the invisible structure that keeps a product reliable, and the visible details that make it understandable.',
        'I work remotely and welcome conversations with teams and clients worldwide.',
      ],
      imageAlt: 'Victor Hugo as a child at a playground',
      caption: 'Victor, before the code.',
    },
    contact: {
      kicker: 'Available worldwide',
      words: ['Build', 'something', 'people can trust.'],
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
    filmLabel: 'case film. Space plays, arrows seek, M mutes.',
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
    heading: 'A direct line into the work.',
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
    title: 'The singularity got there first.',
    beforePath: 'There is no page at',
    afterPath:
      'Either it never existed or it has already crossed the horizon. From out here, the two look identical.',
    survived: 'Everything that survived is one link away.',
    back: 'Back to the start',
    work: 'See the work',
    cases: 'Case studies',
  },
  employment: {
    title: ['Every tap.', 'A decision.'],
    intro:
      'Six moments that shape the journey from looking for work to following an application.',
    decisions: [
      [
        'Two doors, not one funnel',
        'Workers and households arrive for opposite reasons. Splitting them at the first tap meant building two products instead of one compromise.',
      ],
      [
        'A form that matches the job',
        'Social name, available shifts, last employer as a reference. Every field maps to something a household actually asks before hiring, and nothing that it doesn’t.',
      ],
      [
        'When the GPS says no',
        'Location permission gets denied constantly. A postal-code fallback keeps the search alive instead of ending the session there.',
      ],
      [
        'The whole listing, up front',
        'Schedule, duties, requirements, benefits, rate. Holding back the pay until later wastes the time of the person who needs the work most.',
      ],
      [
        'One tap, with the rule stated',
        'Applying is a single confirmation, and that screen says plainly when the household gets to see your data.',
      ],
      [
        'Something to come back to',
        'Applications you can track. The product’s job doesn’t end at the apply button.',
      ],
    ],
  },
  integration: {
    title: 'The interesting part is in between.',
    intro:
      'An interface is one piece of the product. This academic build was an opportunity to learn what happens across its boundaries.',
    areasLabel: 'Integration areas explored in the project',
    areas: ['Interface', 'Gateway', 'API'],
    note: 'Learning to connect the pieces.',
    body: 'The available visual material comes from Figma. It shows the interface system, while the project’s engineering focus was connecting frontend and backend.',
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
  locale: { label: 'Idioma', english: 'Inglês', portuguese: 'Português' },
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
      title: 'Código com pulso humano.',
      lines: ['Código com', 'pulso', 'humano.'],
      note: 'Engenheiro. Humano curioso.',
      kicker: 'Desenvolvedor backend. Visão de produto.',
      copy: 'Sistemas sólidos. Interfaces expressivas. Eu sou Victor e construo a lógica por trás do produto e os detalhes que fazem ele ganhar vida.',
      workCta: 'Ver projetos',
      contactCta: 'Iniciar conversa',
    },
    work: {
      kicker: 'Projetos selecionados',
      title: ['Problemas diferentes.', 'Mundos diferentes.'],
      intro:
        'Três projetos entre arquitetura de plataforma, comércio local e cuidado conectado. Cada case revela as decisões por trás da interface.',
      role: 'Papel',
      stack: 'Stack',
      caseCta: 'Ver case',
      progressLabel: 'Projetos selecionados',
    },
    profile: {
      kicker: 'Perfil de engenharia',
      title: ['Por baixo do capô.', 'Além do óbvio.'],
      intro:
        'Backend é o centro de gravidade. Pensamento de produto, arquitetura de interface e visuais em tempo real ampliam a mesma disciplina de engenharia.',
      capabilities: [
        [
          'Sistemas Backend',
          'Modelos de domínio, APIs e persistência moldados pelo comportamento do produto, não pelos padrões do framework.',
          'Java · Spring Boot · PostgreSQL · REST',
        ],
        [
          'Engenharia de Produto',
          'De fluxos ambíguos a estados, contratos e decisões de implementação explícitos.',
          'Design de sistemas · Fluxos de produto · Entrega',
        ],
        [
          'Arquitetura de Interface',
          'Interfaces React tipadas, com estados acessíveis, responsabilidades claras e fronteiras de movimento sustentáveis.',
          'TypeScript · React · Next.js · Design systems',
        ],
        [
          '3D e Movimento',
          'Sistemas visuais em tempo real usados quando tornam a experiência mais clara, dentro de um orçamento de performance medido.',
          'Three.js · R3F · GSAP · GLSL',
        ],
      ],
    },
    about: {
      kicker: 'Sobre',
      title: ['Ainda curioso.', 'Só construindo coisas maiores.'],
      body: [
        'Sou Victor Hugo, desenvolvedor backend em São Paulo, atuando entre arquitetura de sistemas, decisões de produto e interfaces expressivas. Gosto da estrutura invisível que mantém um produto confiável e dos detalhes visíveis que o tornam compreensível.',
        'Trabalho remotamente e estou aberto a conversas com equipes e clientes do mundo todo.',
      ],
      imageAlt: 'Victor Hugo criança em um parquinho',
      caption: 'Victor, antes do código.',
    },
    contact: {
      kicker: 'Disponível para o mundo',
      words: ['Vamos construir', 'algo em que', 'as pessoas confiem.'],
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
    filmLabel: 'vídeo do case. Espaço reproduz, setas avançam e M silencia.',
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
    heading: 'Uma linha direta para o trabalho.',
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
    title: 'A singularidade chegou primeiro.',
    beforePath: 'Não existe uma página em',
    afterPath:
      'Talvez ela nunca tenha existido ou já tenha cruzado o horizonte. Daqui, as duas coisas parecem iguais.',
    survived: 'Tudo que sobreviveu está a um link de distância.',
    back: 'Voltar ao início',
    work: 'Ver projetos',
    cases: 'Cases',
  },
  employment: {
    title: ['Cada toque.', 'Uma decisão.'],
    intro:
      'Seis momentos que moldam a jornada entre procurar trabalho e acompanhar uma candidatura.',
    decisions: [
      [
        'Duas portas, não um único funil',
        'Profissionais e famílias chegam por motivos opostos. Separá-los no primeiro toque significou construir dois produtos em vez de um compromisso ruim.',
      ],
      [
        'Um formulário que combina com o trabalho',
        'Nome social, turnos disponíveis e último empregador como referência. Cada campo corresponde ao que uma família realmente pergunta antes de contratar.',
      ],
      [
        'Quando o GPS diz não',
        'A permissão de localização é negada com frequência. Uma alternativa por CEP mantém a busca ativa em vez de encerrar a sessão.',
      ],
      [
        'A vaga inteira desde o começo',
        'Horário, tarefas, requisitos, benefícios e valor. Esconder o pagamento desperdiça o tempo de quem mais precisa do trabalho.',
      ],
      [
        'Um toque, com a regra declarada',
        'A candidatura exige uma única confirmação, e a tela explica quando a família poderá ver seus dados.',
      ],
      [
        'Algo para acompanhar',
        'Candidaturas que podem ser acompanhadas. O trabalho do produto não termina no botão de candidatura.',
      ],
    ],
  },
  integration: {
    title: 'A parte interessante está no meio.',
    intro:
      'Uma interface é apenas uma parte do produto. Este projeto acadêmico foi uma oportunidade para aprender o que acontece entre suas fronteiras.',
    areasLabel: 'Áreas de integração exploradas no projeto',
    areas: ['Interface', 'Gateway', 'API'],
    note: 'Aprendendo a conectar as partes.',
    body: 'O material visual disponível vem do Figma e mostra o sistema de interface. O foco de engenharia do projeto foi conectar frontend e backend.',
  },
};

export interface SiteContent {
  projects: Project[];
  footer: { items: readonly string[] };
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
      items: [
        '© 2026, VICTOR HUGO',
        'EM SÃO PAULO · TRABALHANDO PARA O MUNDO',
        'CONSTRUÍDO COM INTENÇÃO.',
      ],
    },
    nav: navPt,
    chat: chatPt,
    ui: sharedUiPt,
  },
};

export function parseLocale(value: string | null): Locale | null {
  return value === 'en' || value === 'pt' ? value : null;
}

export function contentFor(locale: Locale): SiteContent {
  return contentByLocale[locale];
}
