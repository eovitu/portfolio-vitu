# Validação dos ajustes do portfólio

Data: 8 de outubro de 2026. Worktree portfolio.devitu-backend, branch feat/portfolio-backend. Commit, push e PR autorizados pelo usuário nesta entrega; merge e deploy não autorizados.

## Mudanças desta rodada

- Home: título VITU / Dev / Backend nos dois idiomas, competências distribuídas por APIs, dados, testes/entrega e interfaces. Tecnologias associadas aos projetos que as sustentam.
- Home e quatro cases: vídeo limpo com reprodução automática elegível, toque/clique/teclado para alternar pausa, único controle permanente de fullscreen, poster em movimento reduzido, erro ou bloqueio. Fontes anexadas somente quando necessárias.
- Home e cases: composição por viewport com crescimento permitido, cards compactos, blocos técnicos mobile subdivididos e alinhamento leve compartilhado com Lenis. Teatro retorna ao fluxo normal se o conteúdo não couber.
- Nenhuma nova mudança de SEO nesta rodada. Alterações da etapa anterior foram preservadas.

## Áreas alteradas

- src/lib/content.ts: texto PT/EN.
- src/lib/mediaPlayback.ts e teste: elegibilidade, pausa manual e cancelamento.
- src/components/home/MediaPlayback.tsx, ProjectMediaSurface.tsx e SelectedWorkTheater: mídia compartilhada e teatro.
- src/components/home/HomePage.tsx e styles: abertura, competências e composição.
- src/components/cases/CaseMedia.tsx, CaseStudy e styles: mídia, seções e controles.
- src/components/cases/EmploymentJourney.tsx, CommerceStory.tsx e IntegrationStory.tsx: blocos técnicos.
- src/components/providers/SmoothScrollProvider.tsx e src/motion/scrollSettle.ts/test: alinhamento e cancelamento.
- src/hooks/useProjectTheaterMotion.ts: fallback de altura.

## Evidência

- Controlador: 131/131 testes, sem skips; typecheck, lint e formatação passaram antes da correção final de CSS.
- Correção final de CommerceStory: inspeção dirigida da cascata, 3/3 testes focados, typecheck, lint e build passaram. Formatação e git diff --check passaram depois da correção.
- Revisões independentes: mídia aprovada após correção de fallback; revisão integrada não encontrou novo bug crítico/importante. Correção mobile examinada também na revisão integrada.
- Aviso de build preservado: chunk Three.js de aproximadamente 794 kB. Não foi ampliado o escopo para substituir a cena.

## Limites

A ferramenta de navegador recusou acesso ao localhost por política de segurança. Nenhum contorno foi usado. Esta rodada não foi validada visualmente. Permanecem pendentes: encaixe real desktop/mobile e zoom, autoplay/bloqueio no navegador, fullscreen, toque/teclado e sensação do alinhamento. Os testes não substituem essas verificações.

O DOCX geral da etapa anterior teve conteúdo e estrutura conferidos; renderização visual permanece indisponível por ausência de LibreOffice.

## Decisão de processo

Conservar snapshots e registros de revisão enquanto os commits não forem autorizados. O custo é depender desses arquivos locais para rastrear as mudanças até o histórico Git ser criado.

## Refinamento da parada por cor

A pausa alinha o fundo da viewport ao fim da cor no avanço e o topo ao início no retorno. Faixas sticky usam os limites reais de progresso de ScrollTrigger, com margem de 0,5 px para conservar a cor corrente. Inclui Outcome dos cases; Contact, rodapé e wrapper do case não criam pausas. Alvos fora do intervalo real de scroll são descartados. O limite mantém hold mínimo de 180 ms; a cauda inercial do mesmo gesto não o libera, e um novo gesto permite continuar. Teclado, scrollbar, navegação e zoom nativo podem cancelar o hold. Movimento reduzido desativa a política. Não foram alterados textos editoriais, SEO ou mídias neste refinamento.

Regressão geométrica: testes executáveis cobrem alturas de viewport 390, 768 e 900 px, ambos os sentidos, interior livre de painel longo, alvos inalcançáveis e cor sticky ativa comparada à função utilizada pelo hook. Essa prova não substitui inspeção renderizada nem sensação física em dispositivos, que seguem pendentes por bloqueio do navegador.

Gates da correção geométrica: 138/138 testes completos, 10/10 focados, typecheck, lint, build e formatação aprovados. O build mantém aviso de chunk Three.js maior que 500 kB. A revisão independente da correção geométrica está pendente. Sensação física em wheel/trackpad/touch e inspeção visual continuam não verificadas por bloqueio da ferramenta de navegador.

## Resize durante a pausa

Mudanças de altura, limite do documento e layout sticky/fluxo cancelam a pausa ativa e reiniciam o histórico do gesto. Isso impede conservar um alvo antigo após resize. Observers são desconectados no cleanup e não escrevem layout. Validação final: 139/139 testes completos e 17/17 focados; typecheck, lint, formatação e build aprovados. Gestos reais permanecem não verificados.
