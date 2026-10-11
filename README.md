# eovitu, portfólio de Victor Hugo Araujo

Portfólio de Victor Hugo Araujo, também conhecido como Vitu ou eovitu, em [www.eovitu.com.br](https://www.eovitu.com.br). Apresenta contribuições em backend e interfaces por meio de quatro cases, com textos em português e inglês. O português é o idioma inicial; a preferência salva de inglês é restaurada após a hidratação.

## Executar localmente

Use Node.js 22.6 ou superior e npm. A integração contínua usa Node 22.

```bash
npm ci --legacy-peer-deps
npm run dev
```

Abra a URL indicada pelo Vite. O portfólio não exige chaves de API nem variáveis de ambiente. O painel de conversa usa respostas locais; links de e-mail abrem o aplicativo do visitante.

| Comando                | Finalidade                                       |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Desenvolvimento com recarga de módulos           |
| `npm test`             | Testes Node de conteúdo, rotas, motion e mídia   |
| `npm run typecheck`    | Verificação TypeScript                           |
| `npm run lint`         | Verificação ESLint                               |
| `npm run format:check` | Verificação Prettier                             |
| `npm run build`        | Tipos, bundles e HTML pré-renderizado em `dist/` |
| `npm run preview`      | Servir o build local                             |

Os testes de contratos de fonte não substituem a revisão em navegador. O [estado atual e os limites de validação](docs/STATUS.md) identificam qual rodada foi verificada.

## Conteúdo e navegação

| Rota                    | Conteúdo                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| `/`                     | Abertura, projetos, perfil, sobre e contato                       |
| `/work/emprega-co`      | Projeto voluntário de ONG em desenvolvimento; pagamentos de teste |
| `/work/torneio-pebolim` | Projeto pessoal de torneios                                       |
| `/work/doces-da-pati`   | Vitrine de confeitaria para cliente                               |
| `/work/helppet`         | Projeto acadêmico, com contribuição no gateway Java               |

O menu de projetos oferece os quatro capítulos da home, inclusive a partir de um case ou da 404. No mobile, a lista começa recolhida e expande dentro do diálogo com controle de foco. Rotas diretas, âncoras e voltar/avançar do navegador fazem parte do contrato. O currículo editável está em `/cv/victor-hugo-backend.docx`; e-mail, LinkedIn e GitHub estão disponíveis no conteúdo.

Os quatro vídeos começam pelos posters e exigem reprodução explícita. A fonte MP4 só é anexada após play. Vídeos pausam fora da área visível ou ao ocultar a aba, sem retomada automática. Os cases oferecem busca, nova tentativa e fullscreen. HelpPet usa telas recriadas e dados demonstrativos.

## Interface e implementação

React 18, TypeScript e Vite 5 compõem a aplicação. styled-components define a apresentação; GSAP/ScrollTrigger e Lenis compartilham o relógio de animação. Motion cuida de transições de mídia, e Three.js com React Three Fiber forma a camada visual adiada.

O scroll vertical atravessa as mudanças de cor continuamente. O teatro de projetos usa um palco sticky em desktops compatíveis e artigos no fluxo normal em telas menores ou movimento reduzido. A recarga reconstrói fragmentos da seção visível. O navegador restaura a posição inicialmente; durante a coreografia, o snapshot reconcilia a posição se a hidratação mudar a altura do documento. Um gesto encerra essa reconciliação. As poses existentes usam força 0,32 no scroll, 0,55 na chegada explícita e amplitude 25% maior na recarga, sem novos loops ou duração adicional. Diálogos e abertura mantêm seus bloqueios delimitados. Movimento reduzido usa scroll nativo e remove a coreografia espacial.

A foto de infância usa WebP responsivo e JPEG de fallback. A camada WebGL tem fallback estático, qualidade menor no mobile e pausa em aba oculta. Sem JavaScript, os documentos pré-renderizados mantêm conteúdo e links legíveis. Isso não garante os controles interativos sem JavaScript.

Archivo 400/500 e JetBrains Mono 400 são fontes WOFF2 locais, com `swap` e licenças OFL em `public/fonts/`. Apenas Archivo recebe preload. O chunk adiado de Three.js ainda gera aviso de tamanho no build. As medições locais não comprovam performance em dispositivo real ou produção.

## Publicação e SEO

O build gera HTML da home, dos quatro cases e da 404, com metadados específicos antes de executar JavaScript. O domínio canônico é `https://www.eovitu.com.br`. `vercel.json` define cabeçalhos de segurança e cache; os documentos de rota e `404.html` atendem a navegação sem rewrite genérico. A 404 usa `noindex`.

Ao mudar URLs, alinhe `src/lib/site.ts`, metadados, `public/sitemap.xml`, `public/robots.txt` e `public/llms.txt`. Build local, publicação e verificação de produção são estados distintos. As evidências de motion atualizadas em 11/10 estão em docs/SECTION_MOTION_VALIDATION.md. Para confirmar publicação, compare o SHA da integração contínua com o deploy e o HTML servido.

## Documentação e manutenção

- [Estado atual](docs/STATUS.md): ponto de entrada e pendências.
- [Arquitetura](docs/ARCHITECTURE.md): responsabilidades e contratos.
- [Validação de motion por seção](docs/SECTION_MOTION_VALIDATION.md): medições e limites de 10/10.
- [Guia editorial](docs/EDITORIAL.md): critérios de texto PT/EN.
- [Validação histórica](docs/VALIDATION.md) e [SEO histórico](docs/SEO.md): evidências das rodadas anteriores.

`src/lib/content.ts` concentra projetos, autoria, mídia e ações públicas. Home e cases ficam em `src/components/`; motion em `src/motion/` e `src/hooks/`; a cena em `src/three/`; mídia em `public/media/`. A referência procedural está em `docs/reference/black-hole.html`.

## Licença

MIT, conforme [LICENSE](LICENSE). As fontes mantêm suas próprias licenças OFL.
