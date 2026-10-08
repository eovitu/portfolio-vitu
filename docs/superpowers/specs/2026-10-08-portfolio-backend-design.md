# Evolução do portfólio para oportunidades de backend

Data: 8 de outubro de 2026.
Estado: design aprovado pelo usuário em 8 de outubro de 2026, com autorização explícita para iniciar a implementação. Commits dependem de revisão visual posterior.
Processo: brainstorming arquitetural. Depois da aprovação deste documento, elaborar o plano técnico com writing-plans. A implementação do plano aprovado usará subagent-driven-development. Na aprovação inicial, commit e publicação ficaram suspensos. A autorização posterior permite commit, push e PR; merge e deploy continuam fora do escopo.

## Objetivo e limites

Apresentar Victor Hugo como desenvolvedor com foco em backend, usando o currículo e projetos reais para explicar suas competências. Reescrever todos os textos públicos em português e inglês, substituir os vídeos e adicionar Torneio Pebolim. Tornar os quatro projetos acessíveis pelo item Work da navegação.

Preservar a marca vitu, a cena do buraco negro, a tipografia, a paleta existente, a composição editorial, o comportamento responsivo e as transições que continuam úteis. Mudanças de quebra de linha e espaçamento podem acomodar o conteúdo novo. Não trocar o sistema visual nem introduzir outra infraestrutura.

Projetos de referência são somente leitura. O currículo original não será alterado. Não acrescentar dados pessoais, senioridade, métricas de negócio ou responsabilidades sem fonte. As alterações de produto ficarão no portfólio.

## Base investigada

- Portfólio: checkout fix/footer-social-contact, 018453b. Comparação com main remoto 12ecc15 mostrou zero diferenças de arquivos.
- Baseline: 109 testes passaram e npm run build gerou home, três cases e 404. Há aviso de chunk Three.js com 794,02 kB antes de gzip; isso não mede o download inicial nem exige migração nesta tarefa.
- Browser: desktop 1440 por 900 e mobile 390 por 844, com home, menu, troca de idioma, case Emprega.co e rota inexistente. Sem overflow nos recortes examinados. Não equivale a auditoria completa de acessibilidade.
- Currículo Daycoval: fonte de experiência, competências, formação e limites. A candidatura ao banco não será transportada para o posicionamento geral.
- Emprega.co API: develop 3a55045 e comparação com a branch mais recente, feature/cancelamento-contrato 1720795. A funcionalidade dessa branch não será anunciada como integrada. Candidatura única, cálculo monetário e pipeline de homologação foram examinados.
- HelpPet gateway: main/master 75bb160, código de JWT, rotas e health agregado. Sem execução ponta a ponta dos serviços nesta investigação.
- Pebolim: worktree de publicação d6ea949, igual ao SHA público consultado. Testes de domínio executados sem cache: 153 aprovados em 11 arquivos. O checkout principal 0d5ba2f é anterior e não serve como fonte atual.
- Doces da Pati: main remoto 52f7c55 e fontes do fluxo atual presentes no material do vídeo. O carrinho prepara mensagem de WhatsApp; não afirmar pagamento ou envio automático.

## Abordagens consideradas

1. Recomendada: preservar o visual e melhorar conteúdo, evidências, navegação e mídia. Atende ao foco em backend sem custo de reconstruir a experiência inteira.
2. Trocar apenas textos e vídeos: menor esforço, mas deixa a descoberta dos projetos e a apresentação técnica limitadas. Não cobre o submenu solicitado.
3. Reformular toda a home: maior custo e maior risco visual. Contraria a preferência atual por preservar a identidade.

## Regra editorial e conteúdo

O guia docs/EDITORIAL.md governa a redação nova. Reescrever hero, introduções, resumos, responsabilidades, resultados, perfil, sobre, contato, conversa local, microcopy, alt text e metadata afetada. Conteúdo técnico do README será ajustado apenas onde a mudança tornar a documentação incorreta.

Manter inglês como idioma inicial nesta proposta para evitar mudança de comportamento não solicitada. A seleção PT/EN continua persistida. Os textos devem ter redação natural em cada idioma, com os mesmos fatos.

Direção proposta para a abertura:

PT: "Victor Hugo. Desenvolvimento backend." Descrição: "Desenvolvo APIs com Java e Spring Boot, modelo dados e integro serviços. Também trabalho no aplicativo e nas interfaces que consomem essas APIs."

EN: "Victor Hugo. Backend development." Descrição: "I build APIs with Java and Spring Boot, model data and integrate services. I also work on the apps and interfaces that use those APIs."

As frases são propostas de copy. Ajustar quebras de linha na composição atual sem reduzir legibilidade nem esconder o foco profissional.

Perfil: dar prioridade a APIs Java/Spring, modelagem SQL e Flyway, testes e entrega, integrações e trabalho em equipe. Relacionar competências aos cases. React, React Native e TypeScript permanecem como capacidade complementar. 3D e movimento aparecem como parte deste portfólio, sem ocupar o mesmo destaque que backend. AWS permanece como fundamentos; não inventar certificação. Formação e inglês B1 podem aparecer de forma compacta no sobre.

Não criar uma longa parede de logos, barras de nível ou porcentagens de domínio. Não prometer escala, disponibilidade, segurança auditada ou impacto social sem medição.

## Cases e ordem

Ordem proposta: Emprega.co, Torneio Pebolim, HelpPet, Doces da Pati. Numeração, submenu, home e navegação anterior/próximo devem concordar.

Cada case deve permitir leitura rápida com problema, contribuição, decisão técnica, evidência e estado atual. O conteúdo pode aprofundar sem forçar todos os projetos ao mesmo número de blocos.

Emprega.co: mostrar contribuição voluntária em equipe, descoberta de vagas, candidaturas e responsabilidades confirmadas no currículo. Explicar uma candidatura por vaga com verificação na API e trigger no banco, políticas de transição e persistência. Descrever pagamentos e homologação como implementação e ambiente de teste, sem afirmar operação atual verificada. Corrigir a data da atuação para 2026; não inventar a data de fundação do produto. Remover afirmações de CEP integrado enquanto a fonte é mock.

Pebolim: adicionar /work/torneio-pebolim, links públicos e vídeo. Mostrar domínio puro sem React/Supabase, placar derivado de eventos, correções com histórico, classificação e chaves. Explicar PostgreSQL, funções, RLS e atualização Realtime, distinguindo código de validação remota. Referenciar 153 testes como snapshot de 8 de outubro de 2026, sem apresentar como cobertura completa. Usar uma composição existente com tokens de verde escuro e laranja derivados da identidade do produto, sem criar outro sistema visual. A autoria será descrita como projeto pessoal listado no currículo; não declarar autoria exclusiva ou uso por uma empresa sem confirmação.

HelpPet: focar contribuição no gateway Java 17/Spring Cloud, validação JWT, rotas, retentativas GET, circuit breakers e health agregado de cinco grupos. Link direto para gateway-help-pet-g8. Vídeo identificado como apresentação com telas recriadas e dados de demonstração. Não atribuir toda a interface ou todos os microsserviços a Victor.

Doces da Pati: explicar entrega para cliente, catálogo, carrinho e transição ao WhatsApp, além da administração e regras de acesso sustentadas por código. Custos gratuitos são contexto da entrega, não garantia perpétua. Não tratar pedido montado como pedido pago, mensagem enviada ou venda concluída.

## Navegação de projetos

O item Work da barra atual mantém acesso à seção de projetos. Adicionar um botão de expansão associado para teclado e toque; o grupo abre também por hover em dispositivos com ponteiro fino. Mostrar os quatro nomes numa lista compacta sob o item, usando tipografia e tokens atuais. Não criar uma mega navegação com vídeos ou cards.

O painel permanece aberto enquanto ponteiro ou foco estiverem no grupo. Escape fecha e devolve foco ao botão. Clique fora e saída de foco fecham. Enter/Espaço operam o botão, Tab alcança os links. Usar links e botão sem role menu artificial, conforme orientação WAI para navegação comum.

Cada projeto leva ao seu capítulo da home, não diretamente à página de case. O case continua acessível pelo CTA do capítulo. A partir de um case ou da página 404, o link volta à home e posiciona o capítulo depois de montar a rota.

No desktop sticky, usar a mesma geometria de chapterScrollTarget para localizar o meio da faixa do projeto. Um hash sozinho não resolve: os capítulos sobrepostos têm a mesma posição física. Não criar um segundo cálculo divergente.

Em mobile e movimento reduzido, usar a posição real do artigo, compensando a barra fixa. No menu mobile, apresentar os quatro links como sublista de Projetos, sem depender de hover. Fechar o menu antes de finalizar scroll e foco. Respeitar cliques modificados e navegação nativa.

## Vídeos e posters

Assets copiados para public/media/novos, com igualdade de SHA-256 entre origem e destino. Quatro vídeos H.264, 1920 por 1080, 30 fps, sem áudio e com faststart. Pebolim tem 36 segundos; os demais têm 38 segundos. Total dos MP4: 30.094.900 bytes.

Na implementação, integrar os arquivos com nomes identificáveis e atualizar as dimensões do conteúdo. Gerar posters WebP a partir dos JPG locais, sem cortar informações relevantes. Não sobrescrever mídia sem primeiro ajustar suas referências. Evitar duplicatas antigas no resultado final após verificar que não possuem consumidores.

Home: poster com ação explícita para reproduzir a prévia. Só anexar o source do vídeo após intenção de reprodução; preload none. Isso evita baixar os quatro vídeos na abertura e permite assistir aos capítulos mobile que não são o primeiro. Preservar o tratamento visual da mídia.

Case: reprodução deliberada, controles de play/pause e busca, indicação de duração e possibilidade de tela cheia por ação do usuário. Omitir controle de mute em arquivos sem áudio. Anexar source na primeira reprodução; não baixar o filme apenas para preencher duração. A duração conhecida pode constar nos dados tipados.

Pausar quando fora de tela, ao trocar de rota e quando a aba ficar oculta. Não retomar automaticamente. Em erro, manter poster e oferecer tentativa explícita, com mensagem localizada. Movimento reduzido não bloqueia reprodução solicitada, mas remove animação automática. Textos dos cases devem conter as informações técnicas essenciais presentes no vídeo; não exigir que o visitante assista para entendê-las.

## Currículo e contato

Preparar um currículo geral para download com base no anexo, sem menção à candidatura específica ao Daycoval e sem acrescentar dados. Preservar o original. O documento novo precisa de revisão de conteúdo e visual própria. Manter e-mail, LinkedIn e GitHub existentes; contato não pode depender da conversa de respostas selecionadas.

## Áreas afetadas e ordem proposta

1. Conteúdo factual e redação PT/EN: src/lib/content.ts, metadata e conversa local. Se o arquivo de conteúdo dificultar revisão, separar projetos e copy por responsabilidade sem duplicar dados.
2. Registro de Pebolim: tipos de slug, routes.ts, temas, consumidores dos temas, CaseStudy e navegação. Incluir o quarto capítulo e conferir todos os lugares que presumem três projetos.
3. Navegação: Header, MobileMenu, SelectedWorkTheater, hooks de navegação e transição. Compartilhar resolução do alvo do capítulo.
4. Mídia: ProjectMediaSurface, CaseMedia, modelo de mídia e public/media. Usar os quatro arquivos novos.
5. Descoberta: metadata, seoHtml, scripts/generate-route-html.mjs, sitemap.xml e llms.txt. Preservar 404 noindex.
6. Currículo geral e acesso na interface. Rever contato e microcopy.
7. Ajustes necessários de composição e contraste, testes, revisão editorial e revisão final no navegador. CI deve executar npm run build para incluir geração de HTML.

Essa sequência é o roteiro do design. O plano técnico posterior definirá tarefas, arquivos exatos, dependências e instruções para os agentes após aprovação deste documento.

## Critérios de aceite

- Marca, cena, paleta existente e linguagem visual continuam reconhecíveis.
- Quatro projetos na ordem acordada em ambos os idiomas, sem texto legado dizendo três.
- Todos os textos públicos revisados, sem travessões na prosa nova e sem experiência inventada.
- Competências ligadas a exemplos reais; limites de autoria e estado apresentados com clareza.
- Pebolim abre diretamente, tem metadata própria, vídeo correto e links públicos.
- Submenu funciona com mouse, teclado e toque; cada link mostra o projeto correto na home, inclusive partindo de outra rota.
- Nenhum MP4 solicitado na abertura da home ou de um case antes de intenção de reprodução, confirmado em rede com cache frio.
- Reprodução, pausa, busca, erro e fullscreen verificados; ausência de controle de áudio em filme sem áudio.
- Português e inglês sem divergência factual, truncamento ou mistura involuntária.
- Sem overflow em 390 por 844 e 1440 por 900, com verificação adicional em torno dos breakpoints de navegação e theater.
- Contraste AA para texto e controles afetados, foco visível, alvos de toque adequados e conteúdo disponível com movimento reduzido.
- Rotas existentes, nova rota e 404 verificadas; HTML gerado contém metadata correta antes de executar JavaScript.
- npm test, typecheck, lint, format:check e build aprovados, com resultados reais reportados.
- Testes novos verificam comportamentos relevantes, principalmente navegação entre rotas e carregamento sob demanda; não apenas presença de strings no código.

## Execução posterior

Usar workspace isolado após conferir base atual e alterações. Não assumir develop no portfólio: a consulta remota encontrou apenas main. Conferir novamente antes de escolher base; não criar develop por inferência. Preservar os assets já copiados ao preparar o workspace.

Após aprovação do plano técnico, delegar tarefas sequenciais a implementadores com escopo de arquivos explícito. Fazer revisão de conformidade e qualidade por tarefa, seguida de revisão geral. Não permitir commits dos agentes; as regras do usuário prevalecem sobre o fluxo padrão da skill. Preparar pacotes de revisão a partir dos diffs não commitados. Não apagar o ledger antes da entrega, pois não haverá histórico de commits como registro.

## Pendências e itens fora do escopo

Autoria detalhada e público original de Pebolim ainda não foram confirmados pelo usuário. Isso não impede o design: até a confirmação, limitar a copy à descrição do projeto pessoal e ao comportamento comprovado, sem histórias ou impacto inventados.

Fora do escopo: reescrever projetos de referência, publicar infraestrutura, conectar IA ao chat local, migração de framework, novo serviço de vídeo, blog, certificações presumidas, auditoria completa de segurança e métricas de produção.

Opcional separado: case completo da API de e-commerce, ensaio em dispositivos físicos, otimização adicional do WebGL e fontes locais. Nenhum desses itens entra silenciosamente na implementação.

## Referências de design

- docs/EDITORIAL.md: pesquisa e regra de redação.
- [WAI Disclosure Navigation](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/): semântica de navegação, teclado e fechamento por Escape.
- README.md e docs/ARCHITECTURE.md: limites atuais de conteúdo, movimento e rotas.

## Revisão interna da proposta

Conferidos: escopo restrito ao portfólio, quatro projetos, paridade PT/EN, distinção entre fatos e autoria, navegação no sticky, mídia sem áudio, ausência de download antecipado, base sem develop, revisão sem commits e preservação da identidade. Pendências têm tratamento conservador explícito e não autorizam invenção.
