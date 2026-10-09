# SEO: validação local e pendências

Data: 8 de outubro de 2026. Branch local `wip/seo-prerender`, WIP `a79192a` protegendo a implementação SEO anterior. As correções desta rodada permanecem no diff local. Nenhum push, alteração da PR #14, merge ou deploy. Nenhuma dependência nova, conta ou credencial. Trabalho sequencial, sem subagentes.

## Estado e limites

Nome público Victor Hugo Araujo, aliases Vitu/eovitu/Victor Hugo, perfis existentes, canônico https://www.eovitu.com.br e português inicial. A preferência EN é restaurada após hidratação. Pebolim existe no código, mas continua fora do sitemap até HTTP 200 confirmado em produção depois de publicação autorizada. A 404 mantém noindex e nenhum JSON-LD.

A mediana final satisfaz o limite de não piorar o baseline, mas não a meta de LCP abaixo de 2.500 ms. O flash de cobertura da abertura permanece e exige decisão do usuário. Não declarar concluído.

## Metodologia

Lighthouse 13.5.0, Chrome instalado, mobile, throttling simulado, cinco processos/perfis novos por variante, mesma sessão e Vite preview em 127.0.0.1:4173. Sem QA ou build concorrente durante as séries. Baseline original exportado de 57d5dac, mesmas dependências via junction. Cada mediana é calculada separadamente; nenhum resultado foi descartado. Não são CWV de campo, INP ou medição física de rede móvel.

```powershell
npm exec --yes --package=lighthouse@13.5.0 -- lighthouse http://127.0.0.1:4173/ --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" --chrome-flags="--headless=new" --form-factor=mobile --throttling-method=simulate --output=json --output-path="<variante-N.json>" --quiet
```

A primeira rodada usou exportação do HEAD e depois o build SEO WIP. A usa hydrateRoot com markup inicial igual, preferências lidas após hidratação e renderização isolada de estilos por rota. B elimina stylesheet remoto, serve Latin WOFF2 Archivo 400/500 e JetBrains Mono 400 com swap, fallbacks existentes e preload apenas de Archivo. C retorna do effect de inicialização antes de fechar revealing/released, por uma flag de build temporária removida da fonte e do build final. D separa React/App do bootstrap e espera duas animation frames, permitindo uma pintura antes do download. Não altera CSS nem duração da abertura.

## Medianas de cinco execuções

| Variante                           | LCP (ms) | TBT (ms) | Performance |      CLS |
| ---------------------------------- | -------: | -------: | ----------: | -------: |
| HEAD 57d5dac                       |  4793.66 |   766.33 |          56 | 0.000000 |
| SEO WIP a79192a                    |  4751.14 |   961.00 |          53 | 0.000000 |
| A: hidratação                      |  5181.19 |   868.00 |          54 | 0.000570 |
| B: A + fontes locais               |  4110.22 |   719.50 |          66 | 0.000570 |
| C: B sem abertura, temporário      |  4104.50 |   693.50 |          67 | 0.000570 |
| D: B + bootstrap separado, mantido |  3940.31 |   720.39 |          69 | 0.000570 |

## Execuções individuais

| Variante                           | Execução | LCP (ms) | TBT (ms) | Performance |      CLS |
| ---------------------------------- | -------: | -------: | -------: | ----------: | -------: |
| HEAD 57d5dac                       |        1 |  4230.80 |   966.00 |          58 | 0.000000 |
| HEAD 57d5dac                       |        2 |  4793.66 |   766.33 |          54 | 0.000000 |
| HEAD 57d5dac                       |        3 |  5175.98 |   813.98 |          51 | 0.000000 |
| HEAD 57d5dac                       |        4 |  4997.63 |   598.50 |          56 | 0.000000 |
| HEAD 57d5dac                       |        5 |  3624.29 |   516.13 |          72 | 0.000000 |
| SEO WIP a79192a                    |        1 |  5294.59 |  1026.97 |          52 | 0.000000 |
| SEO WIP a79192a                    |        2 |  4452.73 |   802.50 |          60 | 0.000000 |
| SEO WIP a79192a                    |        3 |  5717.83 |   906.50 |          53 | 0.000000 |
| SEO WIP a79192a                    |        4 |  4751.14 |   961.00 |          55 | 0.000000 |
| SEO WIP a79192a                    |        5 |  4719.05 |  1237.50 |          53 | 0.000000 |
| A: hidratação                      |        1 |  5181.19 |   894.00 |          54 | 0.000570 |
| A: hidratação                      |        2 |  6094.90 |   908.68 |          47 | 0.000000 |
| A: hidratação                      |        3 |  4986.31 |   868.00 |          55 | 0.000570 |
| A: hidratação                      |        4 |  4597.67 |   776.00 |          60 | 0.000570 |
| A: hidratação                      |        5 |  6064.63 |   861.32 |          50 | 0.000570 |
| B: A + fontes locais               |        1 |  4110.22 |   719.50 |          66 | 0.000570 |
| B: A + fontes locais               |        2 |  4103.91 |   722.00 |          66 | 0.000570 |
| B: A + fontes locais               |        3 |  4412.03 |   784.00 |          63 | 0.000570 |
| B: A + fontes locais               |        4 |  4151.00 |   680.00 |          66 | 0.000570 |
| B: A + fontes locais               |        5 |  4100.96 |   716.50 |          66 | 0.000570 |
| C: B sem abertura, temporário      |        1 |  4147.96 |   748.00 |          65 | 0.000570 |
| C: B sem abertura, temporário      |        2 |  4101.40 |   693.50 |          67 | 0.000570 |
| C: B sem abertura, temporário      |        3 |  4100.28 |   684.00 |          67 | 0.000570 |
| C: B sem abertura, temporário      |        4 |  4104.50 |   666.00 |          67 | 0.000570 |
| C: B sem abertura, temporário      |        5 |  4127.95 |   819.00 |          65 | 0.000570 |
| D: B + bootstrap separado, mantido |        1 |  3935.34 |   720.39 |          69 | 0.000570 |
| D: B + bootstrap separado, mantido |        2 |  3947.92 |  1022.40 |          64 | 0.000570 |
| D: B + bootstrap separado, mantido |        3 |  2710.34 |   708.00 |          79 | 0.000570 |
| D: B + bootstrap separado, mantido |        4 |  3940.31 |   923.55 |          66 | 0.000570 |
| D: B + bootstrap separado, mantido |        5 |  3942.73 |   718.87 |          69 | 0.000570 |

## Interpretação e diagnóstico

D reduz a mediana de LCP em 853 ms (17,8%) frente ao HEAD e em 170 ms (4,1%) frente a B. TBT final 720 ms contra 766 ms do HEAD; frente a B permaneceu praticamente igual. Ainda faltam 1.440 ms para 2.500 ms. As séries variam; os números mostram ganho observado neste ambiente, sem alegação de significância estatística.

A isolada não melhorou LCP: 5.181 ms contra 4.751 ms do SEO WIP. B ganhou 1.071 ms frente a A. C mudou LCP em apenas 6 ms frente a B e TBT em 26 ms. Isso não sustenta atribuir o LCP simulado à abertura, nem removê-la para atingir a meta. O filmstrip de C confirma ausência de cobertura; o de B mostra a abertura sobre o conteúdo.

Uma execução suplementar B com --save-assets, excluída das medianas, produziu trace e devtools log. FunctionCall agregados: GSAP 696 ms, React 199 ms, Three 0,365 ms. São durações de parede de chamadas no trace, não TBT simulado ou custo de importação; callbacks entram nessa atribuição. O relatório também atribui execução prolongada ao ticker GSAP. O chunk Three permanece 794 kB e foi solicitado cedo (~230 ms), mas o trace não sustenta culpá-lo sozinho pelo bloqueio.

Bootstrap B: 301.526 bytes, com React e GSAP entre dependências iniciais. Bootstrap D: 13.129 bytes; client-entry 289.034 bytes, React 145.972 bytes e GSAP 114.852 bytes ficam no carregamento posterior. O peso total não desapareceu. Não adiar WebGL nem mudar animações sem novo experimento dirigido. O LCP observado no trace B1 foi 131 ms; o LCP simulado foi 4.110 ms. Não intercambiar as duas métricas.

## Validação

139/139 testes, typecheck, lint e format passaram nesta rodada. Build e verificador geram seis documentos com um H1 cada e sitemap com quatro URLs. Não há supressão de avisos de hidratação.

Build de desenvolvimento: 35 navegações (sete URLs, cinco modos). Zero avisos de hydration mismatch ou exceções JS. Aviso informativo Motion em reduced motion e HTTP 404 esperado na URL inexistente foram registrados. Build de produção: outras 35 navegações nos mesmos modos, sem hydration mismatch, exceções JS ou overflow. Conteúdo estático, PT inicial, EN salvo, navegação entre home/case e menu mobile conferidos. Reduced motion manteve os vídeos pausados. curl confirmou os seis HTMLs com um H1; home e quatro cases têm schema, enquanto a 404 não tem e permanece noindex. Fontes 400/500 e acentos PT foram conferidos, além de fallback legível com fontes bloqueadas. O nó do H1 foi preservado na hidratação. Um diagnóstico com atraso artificial de 1.200 ms no client-entry confirmou conteúdo visível, depois cobertura, depois remoção da cobertura; não integra as métricas Lighthouse. A flag temporária de C foi removida e o build final restaurou a abertura.

No localhost, o endpoint /_vercel/insights/script.js não existe e retorna 404 no build de produção. Já ocorria antes. Não foi simulado nem ocultado para declarar rede limpa. Conferir na hospedagem depois da publicação. Person/WebSite foram validados na rodada SEO anterior, com zero erros e avisos; CreativeWork ainda precisa de validação externa.

## Arquivos e motivos

- src/main.tsx e src/client-entry.tsx: bootstrap leve, carga posterior do runtime e hydrateRoot; createRoot fica para o dev sem HTML pré-renderizado.
- src/App.tsx e CaseStudy.tsx: evitar fronteira Suspense na rota/história inicial já preparadas, conservando lazy nas demais rotas.
- scripts/entry-server.jsx e generate-route-html.mjs: imports iguais ao acesso direto do cliente, worker isolado por rota e caminho 404 consistente.
- LanguageProvider.tsx, useMediaQuery.ts e MediaPlayback.tsx: snapshot inicial igual ao servidor e restauração de preferências após hidratação, sem mudar a política de vídeo.
- MotionDirector.tsx: estado inicial igual ao HTML e início do fluxo existente após hidratação; nenhuma opção visual nova aplicada.
- SingularityStage.tsx: useId em vez do contador global de diagnóstico. NotFound.tsx: restaurar o caminho real após hidratar a 404 compartilhada.
- index.html e public/fonts/: fontes locais, pesos/subset utilizados e licenças OFL oficiais. Fontes obtidas de fonts.gstatic.com; licenças de google/fonts, ofl/archivo e ofl/jetbrainsmono.
- README.md e ARCHITECTURE.md: origem www, OG compartilhada e contrato real de renderização/fontes.

## Decisão pendente: abertura

Não foi removida, encurtada ou redesenhada. Opções para aprovação: (1) preservar a abertura e preparar sua camada antes da primeira pintura, com fallback que mantenha conteúdo legível sem JS; elimina a troca visível, mas pode atrasar LCP e precisa de nova medição; (2) abertura sem cobertura opaca, mantendo conteúdo legível, com alteração visual a aprovar; (3) remover ou encurtar, também com aprovação. A já existente diferença entre primeira visita e repetição não resolve o caso de perfil novo. Não há evidência para prometer ganho de LCP com remoção, pois C ficou praticamente igual a B. Recomenda-se preservar a abertura e testar a sincronização inicial antes de redesenhá-la.

## Auditoria das ferramentas SEO

Nenhum instalador ou script de fornecedor executado; nenhuma conta ou chave configurada. claude-seo (96 scripts, SHA 4b99de2): checklists seletivos, sem instalação global por excesso de superfície/API/credenciais. seo-agent (22 scripts, e88c7bf): APIs pagas, módulos premium ausentes, TLS ignorado e DOM tratado como HTML original; não instalado. Citedy (seis scripts, 5dcb31d): conta, créditos e autopublicação; não conectado.

## Depois de publicação autorizada pelo usuário

- [ ] Conferir HTTP 200, canonical www, H1/schema sem JS, robots e sitemap na produção. Verificar HTTP/HTTPS, www/sem www, redirects e 404.
- [ ] Search Console: selecionar https://www.eovitu.com.br/, abrir Sitemaps e enviar sitemap.xml. Inspeção de URL: home canônica, testar URL publicada, solicitar indexação. Propriedade Domínio eovitu.com.br via TXT DNS reúne protocolos/subdomínios e é opcional.
- [ ] Somente após Pebolim retornar 200, adicionar /work/torneio-pebolim em src/lib/discovery.ts numa atualização autorizada.
- [ ] Bing Webmaster Tools: importar propriedade do GSC e conferir sitemap.
- [ ] Padronizar nome, eovitu e website www no GitHub, bio/README de perfil, LinkedIn e demais perfis controlados.
- [ ] Adicionar backlinks legítimos nos repositórios e perfis controlados; SENAI somente se houver perfil disponível. Não comprar links.
- [ ] Inventariar domínios/subdomínios antigos e redirecionar 301 para destino equivalente, quando controlados.
- [ ] Validar CreativeWork externamente no Schema.org e conferir HTML publicado.
- [ ] Repetir Lighthouse mobile em produção com cinco execuções e mesma metodologia. Conferir endpoint Analytics, console/rede e dados de campo quando disponíveis.
- [ ] Acompanhar semanalmente impressões, cliques e posição para eovitu e variações no GSC, sem promessa de ranking.

## Melhorias opcionais

Medir rede móvel real, coletar CWV de campo, investigar callbacks do GSAP com perfil específico, separar URLs EN e criar OG própria por case. São frentes separadas; nenhuma foi aplicada. CLI Vercel oficial opcional (npm i -g vercel) facilita operações futuras; não instalada e não necessária para este trabalho.
