# SEO: validação local e pendências

Data: 8 de outubro de 2026. Branch local `wip/seo-prerender`, WIP `a79192a` protegendo a implementação SEO anterior. As correções desta rodada permanecem no diff local. Nenhum push, alteração da PR #14, merge ou deploy. Nenhuma dependência nova, conta ou credencial. Trabalho sequencial, sem subagentes.

## Estado e limites

Nome público Victor Hugo Araujo, aliases Vitu/eovitu/Victor Hugo, perfis existentes, canônico https://www.eovitu.com.br e português inicial. A preferência EN é restaurada após hidratação. Pebolim existe no código, mas continua fora do sitemap até HTTP 200 confirmado em produção depois de publicação autorizada. A 404 mantém noindex e nenhum JSON-LD.

A rodada de 8/10 ficou em 3.940 ms e ainda tinha flash. O fechamento de 9/10, abaixo, testa a camada inicial autorizada. A meta de 2.500 ms continua pendente; não declarar performance concluída.

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

## Registro histórico: decisão da abertura em 8/10

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

## Fechamento de 9/10: experimento autorizado da abertura

Correções anteriores protegidas no commit local 35a3d9f (fix(seo): hidratar HTML e servir fontes locais), sobre a79192a. A camada inicial e esta documentação permanecem no diff local. Nenhum push, merge, deploy ou alteração da PR #14.

Cinco execuções por série, mesmo comando mobile/simulate, Chrome e porta 4173; E foi medido e D foi reconstruído do commit e repetido nesta sessão. E foi restaurado no build final. Não houve build ou QA concorrente com Lighthouse. Os dados de 8/10 são históricos identificados; a comparação direta desta rodada é E contra D repetido.

| Variante              |        LCP mín/med/máx (ms) |      TBT mín/med/máx (ms) | Performance mín/med/máx |
| --------------------- | --------------------------: | ------------------------: | ----------------------: |
| Baseline 8/10         | 3624.29 / 4793.66 / 5175.98 |  516.13 / 766.33 / 966.00 |   51.00 / 56.00 / 72.00 |
| SEO anterior 8/10     | 4452.73 / 4751.14 / 5717.83 | 802.50 / 961.00 / 1237.50 |   52.00 / 53.00 / 60.00 |
| A 8/10                | 4597.67 / 5181.19 / 6094.90 |  776.00 / 868.00 / 908.68 |   47.00 / 54.00 / 60.00 |
| B 8/10                | 4100.96 / 4110.22 / 4412.03 |  680.00 / 719.50 / 784.00 |   63.00 / 66.00 / 66.00 |
| C temporário 8/10     | 4100.28 / 4104.50 / 4147.96 |  666.00 / 693.50 / 819.00 |   65.00 / 67.00 / 67.00 |
| D 8/10                | 2710.34 / 3940.31 / 3947.92 | 708.00 / 720.39 / 1022.40 |   64.00 / 69.00 / 79.00 |
| D repetido 9/10       | 2711.81 / 3934.36 / 3944.22 |  654.97 / 711.00 / 894.12 |   64.00 / 70.00 / 79.00 |
| E camada inicial 9/10 | 2716.44 / 2859.40 / 3978.09 | 665.00 / 899.35 / 1122.50 |   63.00 / 74.00 / 79.00 |

| Variante       | Execução |  LCP ms |  TBT ms | Performance |
| -------------- | -------: | ------: | ------: | ----------: |
| D-refresh      |        1 | 3937.72 |  894.12 |          64 |
| D-refresh      |        2 | 3944.22 |  692.00 |          70 |
| D-refresh      |        3 | 3158.92 |  894.00 |          73 |
| D-refresh      |        4 | 2711.81 |  654.97 |          79 |
| D-refresh      |        5 | 3934.36 |  711.00 |          69 |
| E-static-cover |        1 | 2716.44 |  718.74 |          76 |
| E-static-cover |        2 | 2858.78 |  665.00 |          79 |
| E-static-cover |        3 | 2859.40 |  899.35 |          74 |
| E-static-cover |        4 | 3959.58 | 1088.43 |          64 |
| E-static-cover |        5 | 3978.09 | 1122.50 |          63 |

E: mediana LCP 2.859 ms, 1.075 ms abaixo de D repetido; TBT sobe de 711 para 899 ms. Performance mediana passa de 70 para 74. CLS 0,000570 em todas as dez execuções, sem piora. LCP permanece o mesmo parágrafo nas cinco execuções E; a camada sem texto/imagem não se tornou LCP. Há sobreposição e dispersão entre séries; não alegar ganho causal garantido nem que a abertura era o gargalo. E permanece abaixo do baseline histórico de 4.794 ms; faltam 359 ms para a meta. O baseline não foi repetido em 9/10.

B versus D históricos: diferença mediana de 170 ms, com amplitudes 311 e 1.238 ms. Cinco execuções não distinguem com segurança esse ganho do ruído. O bootstrap fica por outra justificativa: remove React/GSAP da dependência estática do módulo inicial e separa a montagem interativa do documento útil; duas frames oferecem oportunidade de pintura, sem garantir que a fonte já esteja pronta. Não foi mantido como prova de melhoria de 170 ms.

### Elemento e fases do LCP

D-1: parágrafo do hero “Desenvolvo APIs com Java e Spring Boot…”, caixa 351×99 px. Insight do Lighthouse: TTFB 5,571 ms; render delay 129,357 ms; load delay e load duration não se aplicam a esse nó de texto sem recurso de imagem. Soma observada 134,928 ms, contra LCP simulado 3.935 ms. E-3: mesmo nó e dimensões, TTFB 5,971 ms e render delay 85,700 ms; LCP simulado 2.859 ms. O relatório não oferece decomposição equivalente dos 2.859 ms simulados; não inventar fases para fechar essa soma. O texto foi candidato antes da cobertura animada posterior em D; não atribuir ausência de efeito da abertura em todos os dispositivos a esse único comportamento.

### Bundle e long tasks

D-1, tamanhos descomprimidos / transferidos: bootstrap 13.129 / 5.810 bytes; client-entry 289.034 / 96.296; React 145.972 / 47.525; GSAP 114.852 / 45.868; HomePage 49.101 / 14.845; MediaPlayback 12.836 / 4.640; canvas 16.228 / 7.582; Three 794.024 / 214.385. Bootstrap inicia em 19 ms, runtime/React/GSAP em 90 ms, HomePage/media em 133 ms; canvas/Three em 231 ms. Pintura observada 135 ms. Portanto Three foi carregado depois da primeira pintura observada nesse relatório e não é prova do gargalo inicial. A maior tarefa atribuída a GSAP durou 680 ms (excesso sobre 50 ms: 630 ms); React teve 353, 104 e 62 ms (excessos: 303, 54 e 12 ms). Esses excessos não são automaticamente a soma do TBT auditado: janelas e simulação diferem. Callbacks do ticker entram na atribuição GSAP; isso não prova custo de download/importação.

### Propostas para segunda rodada, não aplicadas

1. Perfilar os callbacks do GSAP para localizar o trabalho da tarefa de 680 ms e repartir a inicialização não visual. Ganho estimado de LCP: não quantificável com este trace; teto teórico de bloqueio removível dessa tarefa é 630 ms, não promessa de redução de LCP. Risco: sincronização da animação e scroll.
2. Adiar montagem de componentes interativos abaixo da dobra, preservando o HTML estático. Ganho de LCP não medido; tarefas React citadas somam 369 ms de excesso potencial, sem prova de que sejam desses componentes. Risco: hidratação, eventos e navegação. Exige identificar primeiro quais componentes dominam.
3. Testar WebGL após a abertura/ociosidade estável. Pode deslocar 794 kB descomprimidos/214 kB transferidos para depois; ganho de LCP não estimável e possivelmente nulo porque já chega após a pintura. Risco visual elevado: a abertura usa readiness do canvas. Não aplicar sem aprovação.

### Camada inicial e CSP

index.html inclui #entry-cover fora da raiz React: fixed/inset, mesma cor #08080a e nível 115 da abertura. CSS esconde a camada em 1,5 s, sem JS, sem deslocar layout; reduced motion usa display:none. EntrySequence entrega a cobertura no layout effect, quando sua camada já existe. Se o fallback CSS já expirou, MotionDirector deixa a composição estática e não recobre. Nenhuma duração/CSS da animação GSAP foi alterada. O fallback de chegada tardia é parte do experimento autorizado, não uma nova política permanente de primeira visita.

CSP: nenhuma diretiva em vercel.json nem meta no HTML; resposta HTTPS de produção de 9/10 também sem Content-Security-Policy. Nenhum script inline novo, nenhuma política afrouxada. Analytics retornou HTTP 200 em produção nessa consulta; o 404 local continua registrado.

### Revisão sequencial do diff

Nome Victor Hugo Araujo e aliases Vitu/eovitu/Victor Hugo preservados; sameAs contém somente GitHub e LinkedIn já existentes. Não confirmei os nomes atualmente exibidos nos perfis externos, portanto padronização permanece ação do usuário. Canonical, OG, robots e sitemap usam www; OG compartilhada 1200×630. Quatro URLs no sitemap, Pebolim excluído. 404 noindex sem schema. Nenhuma dependência nova nem credencial adicionada; token público de verificação Google não é segredo. Fontes Latin, Archivo 400/500 e JetBrains Mono 400, swap/fallback e duas licenças OFL presentes. Não encontrei desvio adicional nesse checklist.

### Validação final de E

139/139 testes, typecheck, lint, format, build, verificador de seis artefatos/quatro URLs e git diff --check passaram. curl salvou os seis HTMLs: um H1 em cada; home e quatro projetos com dois schemas, 404 com noindex e nenhum schema. Browser de produção local: 35 navegações em desktop/mobile/reduced/saved-EN/no-JS, zero hydration mismatch, exceções JS ou overflow; apenas 404 do Analytics e da URL inexistente esperada. Analytics respondeu 200 na hospedagem atual, que ainda não contém esta implementação.

Amostragem da abertura a cada ~70 ms em cinco contextos: desktop/mobile começaram cobertos e mantiveram a animação; nenhum contexto voltou a cobrir depois de expor o conteúdo. Runtime atrasado 2.200 ms: fallback revela em ~1.603 ms e não reaparece. Sem JS: fallback revela em ~1.584 ms. Reduced motion: sem cobertura desde a primeira amostra (~84 ms). Tempos diagnósticos locais, não métricas simuladas. Navegação home/case/home, menu mobile, EN salvo após reload e vídeos pausados em reduced motion passaram. Fallback sem fontes/JS manteve H1 legível e sem overflow. Screenshots e relatórios brutos em C:/Users/vitu/AppData/Local/Temp/portfolio-seo-performance/.

O experimento foi mantido porque não piorou o LCP mediano contra D repetido e eliminou a recobertura nos cenários testados. TBT maior e dispersão permanecem registrados; não declarar a meta de performance concluída. Não é necessário decidir outra abertura nesta rodada. Segunda rodada de JS, push, merge e deploy continuam fora da autorização atual. Após publicar, conferir também o screenshot renderizado da home na Inspeção de URL do Search Console.

Estado final local: branch wip/seo-prerender, commits a79192a e 35a3d9f sobre 57d5dac; experimento E, guard e documentação no diff sem commit. Nenhuma publicação. Arquivos desta rodada: index.html (camada/CSS), MotionDirector.tsx (não recobrir após fallback), EntrySequence.tsx (handoff), check-prerender.mjs (guard), docs/ARCHITECTURE.md e docs/SEO.md (contrato/evidências).

## Publicação na PR e série de dez execuções

Branch feat/portfolio-backend atualizada por fast-forward, sem merge commit, force push ou deploy manual. Commits preservados a79192a e 35a3d9f; E isolado em c75d21b, docs em 0b5a5de. O remoto estava em 57d5dac antes do push. PR #14 mantida com base main (develop ausente). Os três checks passaram em 0b5a5de; o status do próximo commit de documentação deve ser consultado separadamente.

Preview automática: https://eovitu-git-feat-portfolio-5f96cc-victorhsilva115-7124s-projects.vercel.app/ . curl anônimo recebeu 302 para SSO Vercel e corpo “Protected by Vercel Authentication”. Sem CLI Vercel instalada, token OIDC ou projeto vinculado local para o bypass oficial. Não alterei proteção nem solicitei segredo. Assim, seis rotas, redirects, headers, robots, sitemap e Analytics desse novo build não foram validados remotamente. O 200 do Analytics da produção antiga não valida a preview. Recomendo instalar a CLI oficial (npm i -g vercel) para permitir autenticação e vercel curl em uma próxima validação.

Lighthouse 13.5.0, Chrome/mobile/simulate, fresh profile por processo, porta 4173, dez execuções novas por variante nesta sessão. E do build 0b5a5de/c75d21b foi medido primeiro; D foi exportado de 35a3d9f e construído em cópia temporária, com as mesmas dependências. Nenhum build ou QA durante as séries. Ordem em blocos, sem intercalação ou aleatorização: isso limita inferências causais. Código da aplicação não foi alterado nesta medição.

| Variante |          LCP mín/med/máx ms |       TBT mín/med/máx ms | Performance mín/med/máx |
| -------- | --------------------------: | -----------------------: | ----------------------: |
| D-ten    | 3931.55 / 3938.44 / 3945.70 | 625.96 / 673.26 / 767.32 |   68.00 / 70.00 / 71.00 |
| E-ten    | 2706.88 / 2784.33 / 3948.42 | 597.41 / 682.19 / 944.71 |   69.00 / 78.50 / 81.00 |

| Execução | D LCP ms | D TBT ms | D Perf | E LCP ms | E TBT ms | E Perf |
| -------- | -------: | -------: | -----: | -------: | -------: | -----: |
| 1        |  3944.41 |   749.65 |     68 |  3948.42 |   669.32 |     70 |
| 2        |  3933.58 |   628.26 |     71 |  2857.55 |   694.39 |     78 |
| 3        |  3934.26 |   625.96 |     71 |  2711.41 |   613.40 |     80 |
| 4        |  3934.57 |   674.35 |     70 |  2857.25 |   628.50 |     79 |
| 5        |  3937.48 |   654.00 |     70 |  2710.85 |   944.71 |     75 |
| 6        |  3931.55 |   672.18 |     70 |  2857.49 |   763.00 |     77 |
| 7        |  3945.70 |   760.50 |     68 |  2707.63 |   597.41 |     81 |
| 8        |  3939.41 |   653.50 |     71 |  2707.71 |   670.00 |     79 |
| 9        |  3944.34 |   710.50 |     69 |  2706.88 |   708.50 |     79 |
| 10       |  3942.90 |   767.32 |     68 |  3937.85 |   732.97 |     69 |

Elemento LCP nas vinte execuções: mesmo parágrafo “Desenvolvo APIs com Java e Spring Boot…”, caixa 351×99 px. A cobertura não foi o candidato. CLS idêntico: 0,000570. D: dez resultados no estado ~3,94 s; E: oito resultados entre 2,707 e 2,858 s e dois entre 3,938 e 3,948 s. A diferença de medianas desta série é maior que a dispersão interna de D e não se resume aos antigos 170 ms; porém as faixas se sobrepõem e a ordem em blocos não exclui efeito temporal ou mudança de estado da simulação. Há sinal descritivo a favor de E, sem prova de ganho causal garantido ou de que a abertura resolva performance.

TBT mediano D 673,26 ms, E 682,19 ms: diferença 8,93 ms (~1,3%), sem repetir a piora de 188 ms da série de cinco. As faixas de TBT se sobrepõem amplamente. Nenhuma variante atinge LCP mediano <2,5 s. Não declarar performance concluída. Manter ou reverter c75d21b e fazer merge continuam decisões do usuário; nenhuma nova alteração de aplicação foi aplicada.

Pós-merge: validar cinco rotas e custom 404, redirects para www, HTML sem JS, schema CreativeWork, robots/sitemap e Analytics do novo build. Search Console: enviar sitemap, solicitar indexação e conferir screenshot renderizado por causa da cobertura inicial. Pebolim só entra no sitemap após HTTP 200 confirmado. Padronizar nome/handle/site em GitHub/LinkedIn; acompanhar eovitu no GSC por 2–4 semanas.
