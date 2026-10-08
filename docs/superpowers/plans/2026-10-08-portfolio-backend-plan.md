# Portfolio backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Comunicar competências reais de backend em PT/EN, preservando a identidade visual e adicionando Pebolim, quatro vídeos e acesso aos capítulos pela navegação.
**Architecture:** Manter React/Vite e o registro tipado de conteúdo. Compartilhar resolução de capítulos com a navegação existente. Mídia anexada somente por intenção do visitante, sem serviço adicional.
**Tech Stack:** React, TypeScript, styled-components, GSAP, Lenis, Three.js, Node test runner.
**Spec:** docs/superpowers/specs/2026-10-08-portfolio-backend-design.md

## Global Constraints

- Aprovação do usuário em 08/10/2026 permite execução do design. NÃO permite commit, staging final, push, merge ou deploy. Não criar artefatos com o termo reservado indicado no AGENTS global.
- Ler docs/EDITORIAL.md; prosa nova sem travessões, slogans vazios, números inventados ou senioridade presumida. PT/EN com fatos equivalentes. Inglês inicial preservado.
- Preservar marca, buraco negro, tipografia, paleta existente e composição. Referências e currículo original somente leitura.
- Ordem única: emprega-co, torneio-pebolim, helppet, doces-da-pati. Navegação anterior/próximo e números acompanham essa ordem.
- Sem novas dependências de produto. Implementadores não delegam agentes. Relatórios devem registrar verificações e limites.

## Review Focus

1. Link de capítulo partindo de case/404 deve montar home antes de resolver posição sticky. Task 3 testa resolução e verifica navegador.
2. Mobile e movimento reduzido devem permitir todos os vídeos por intenção. Task 2 testa política de reprodução e estados.
3. Falha de vídeo deve preservar poster e permitir nova tentativa explícita. Task 2 testa erro/retry e ausência de source inicial.
4. Navegação por teclado não deve perder foco ao fechar painel/menu. Task 3 verifica Escape, Tab, foco e clique modificado.
5. Quarto slug deve chegar a todos os registros e HTML estático. Task 1 testa quatro rotas, idiomas e geração; Task 4 verifica artefatos reais.

### Task 1: Conteúdo factual, Pebolim e descoberta

**Files:** src/lib/content.ts, src/lib/routes.ts, src/lib/metadata.ts, src/motion/projectThemes.ts, consumidores com union antiga em src/hooks/useInternalNavigation.ts, src/components/cases/CaseStudy.tsx e componentes especializados de cases quando contenham copy própria; scripts/generate-route-html.mjs, public/sitemap.xml, public/llms.txt, .github/workflows/ci.yml, testes relacionados em src/lib e src/motion. Verificar outros consumidores de três slugs e copy pública em src antes de encerrar.
**Interfaces:** ProjectSlug inclui 'torneio-pebolim'. ProjectMedia acrescenta durationSeconds: number e hasAudio: boolean; todos os quatro 1920x1080, durações 38/36/38/38 e hasAudio false. Usar URLs /media/emprega-co.mp4, /media/pebolim.mp4, /media/helppet.mp4, /media/doces-da-pati.mp4 e posters correspondentes -poster.webp. Task 2 fornece arquivos finais. Manter interfaces de UI existentes; acrescentar strings PT/EN necessárias aos controles se útil, avisando no relatório.

- [ ] Ler spec e editorial; escrever testes para quatro slugs válidos, ordem/paridade em contentFor e metadata localizada. Executar e confirmar falha antes da implementação.
- [ ] Reescrever todos os textos públicos PT/EN com fontes da spec. Hero foca Java/Spring/dados/integrações, competências ligadas a cases. Chat continua respostas locais, sem pretensão de IA conectada. Atualizar alt, labels, contato, perfil e microcopy sem redesenho.
- [ ] Criar case Pebolim com domínio puro, eventos, classificação/chaves, Supabase/RLS/Realtime e testes 153 como snapshot datado. Não afirmar autoria exclusiva. Links https://github.com/eovitu/torneio-pebolim e https://torneio-pebolim.vercel.app. Usar composição existente e tokens verde escuro/laranja próprios.
- [ ] Corrigir Emprega.co atuação 2026, ONG/voluntário/equipe, candidatura única e trigger, pagamentos/homologação com limite de verificação. HelpPet gateway Java17/SpringCloud, JWT e cinco grupos, vídeo recriado; Doces cart/WhatsApp sem venda/pagamento automático. Sem afirmar produção auditada.
- [ ] Incluir rota/SEO/HTML/sitemap/llms e quatro projetos nos consumidores. CI executa npm run build. Rodar npm test, typecheck e build. Formatar apenas arquivos alterados.
- [ ] Fazer autorrevisão de fatos e paridade. Escrever relatório com arquivos, testes, interfaces acrescentadas, dúvidas e limitações. Não commit.

### Task 2: Quatro mídias sob demanda

**Files:** src/components/home/ProjectMediaSurface.tsx e styles; src/components/cases/CaseMedia.tsx e styles; src/components/home/SelectedWorkTheater.tsx apenas ligação de mídia se necessário; novos helpers/testes em src/lib/mediaPlayback.ts e .test.mjs; public/media/* e novos assets. Não reescrever conteúdo da Task 1, salvo UI de controles em módulo localizado próprio.
**Interfaces:** Consome ProjectMedia com durationSeconds e hasAudio da Task 1. Copiados em public/media/novos: emprega-co.mp4, pebolim.mp4, help-pet.mp4, doces-da-pati.mp4 e respectivos JPG. Produz URLs finais acordadas, sem duplicatas.

- [ ] Escrever teste comportamental de política source-on-intent, pausa fora de tela/hidden e ausência de retomada automática, reprodução voluntária com reduced motion. Escolher helper pequeno realmente utilizado pelos componentes, sem testes espelhando JSX. Confirmar falha inicial.
- [ ] Integrar os quatro MP4; converter posters JPG para WebP com PIL local mantendo 1920x1080. Verificar SHA MP4 antes/depois, dimensões e refs antes de remover antigos/novos duplicados.
- [ ] Home: poster inicial, botão explícito play e source ausente até intenção, preload none, todos os capítulos mobile reproduzíveis. Preservar bordas/enquadramento/tratamento visual.
- [ ] Case e home: pausa quando offscreen/hidden/desmontagem sem auto resume; controles localizados play/pause, seek, duração conhecida e fullscreen no case. Nenhum mute se hasAudio false. Erro conserva poster e oferece retry deliberado. Inputs/atalhos não conflitam e foco visível.
- [ ] Executar testes, typecheck/lint e registrar cenários de browser a validar pelo controlador. Não declarar validação visual sem fazê-la. Relatório e não commit.

### Task 3: Work disclosure e resolução de capítulos

**Files:** src/components/navigation/Header.tsx/styles, MobileMenu.tsx/styles; src/motion/routeIntent.ts, theaterChapters.ts e testes; src/components/routing/RouteTransitionProvider.tsx; src/components/home/SelectedWorkTheater.tsx; src/hooks/useInternalNavigation.ts se necessário; novo helper localizado em src/motion se isolar DOM.
**Interfaces:** Links /#work-${slug} consumindo content.projects na ordem existente. Reutilizar chapterScrollTarget({runTop,runHeight,viewportHeight,index,count}) para sticky, mesma lógica dos números. Mobile/reduced usa artigo real com offset da barra. Não duplicar cálculo.

- [ ] Escrever teste do resolvedor para quarto projeto, rota case->home, fallback mobile/reduced e hash inválido; executar falha antes de alterar.
- [ ] Manter link Work seção e adicionar disclosure compacto de quatro links por hover ponteiro fino, botão teclado/toque, aria-expanded/controls, sem role menu. Hover/foco sustentam abertura, Escape fecha e devolve foco, fora/saída foco fecha. Preservar cliques modificados.
- [ ] Mobile menu inclui sublista com quatro projetos, fecha dialog/scroll lock antes de finalizar navegação. Integrar alvo compartilhado à transição após montar home. Links devem funcionar de case e 404 e focar capítulo correto.
- [ ] Verificar testes/typecheck/lint. Relatar comportamento, arquivos, comandos e pendências de browser. Não commit.

### Task 4: Currículo geral e integração final

**Files:** public/cv/victor-hugo-backend.docx (novo), src/lib/content.ts somente URL/copy de download se necessário, README.md, docs/ARCHITECTURE.md; ajustes de composição estritamente necessários em arquivos afetados pelo conteúdo após inspeção; testes de integração pertinentes.
**Interfaces:** Consome conteúdo factual Task 1, controles Task 2 e resolução Task 3. Currículo original C:/Users/vitu/Downloads/Curriculo_Victor_Hugo_Daycoval.docx somente leitura. Download /cv/victor-hugo-backend.docx.

- [ ] Ler skill documents e extrair currículo original. Preparar DOCX geral sem Daycoval, sem novos dados pessoais ou domínio/impacto inventado. Manter formação, cursos, B1 e experiências verificadas. Revisar documento renderizado com ferramentas locais; se render indisponível, registrar limite, não afirmar visual validado.
- [ ] Conectar download sem remover contato direto; revisar README/arquitetura para quatro cases, vídeos e navegação.
- [ ] Executar npm test, npm run typecheck, npm run lint, npm run format:check e npm run build; verificar home/quatro HTML/404 e metadata. Corrigir apenas regressões desta mudança. Não ampliar infraestrutura.
- [ ] Relatório com resultados reais e limites, sem commit.

## Validação integrada do controlador

- Desktop 1440x900, mobile 390x844 e regiões 900/1000 px: quatro capítulos, traduções, ausência de overflow e identidade preservada.
- Submenu hover/teclado/Escape, mobile, links de case/404 e capítulo sticky correto.
- Cache frio sem MP4 antes de play na home e case. Play/pause/seek/fullscreen/erro, pausa fora/hidden, reduced motion quando emulação disponível; comunicar limites reais.
- Links externos, CV, rotas diretas e 404 noindex. Revisão final independente sobre diff integral, sem commits.
- Abrir localhost visível para usuário. Esperar revisão para qualquer commit; sugerir separação conteúdo/cases, mídia, navegação e currículo/documentação quando autorizado.

## Autorização final e integração

Em 8 de outubro de 2026, o usuário autorizou a correção geométrica, documentação, commits separados em Conventional Commits sem coautor, push e abertura de PR. O remoto não possui develop; a base existente é origin/main, confirmada por fetch. A PR será direcionada a main por essa ausência. Isso não autoriza merge nem deploy. Gates finais: 138/138 testes e 10/10 focados, typecheck, lint, formatação, build e diff check aprovados. QA visual final permanece limitado pelo navegador, conforme VALIDATION.md.
