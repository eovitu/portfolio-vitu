# SEO: implementação e ponto de retomada

Data: 8 de outubro de 2026. Base 57d5dac, worktree portfolio.devitu-backend, branch feat/portfolio-backend, PR #14 existente. Sem merge ou deploy autorizado. Este registro é parcial: o limite de uso interrompeu os subagentes antes da revisão final e da otimização de performance.

## Decisões confirmadas

- Nome público: Victor Hugo Araujo, conforme currículo e resposta do usuário. Aliases: Vitu, eovitu e Victor Hugo.
- Canônico: https://www.eovitu.com.br. A produção já redireciona para www e o Search Console possui essa propriedade HTTPS.
- Português inicial, conservando seleção PT/EN e preferência salva.
- React/Vite mantidos. Pré-render das rotas no build, sem framework ou dependência nova.
- Pebolim existe no código, mas a URL de produção retornou 404. Não entra no sitemap até confirmação de HTTP 200 depois da publicação.

## Baseline confirmado

Produção: home e três cases antigos retornam 200; Pebolim retorna 404. O HTML inicial anterior tem raiz vazia e nenhum H1. Canonical e sitemap antigos usam sem www, contrariando o redirecionamento da hospedagem. Robots e sitemap são acessíveis. A busca site: sem resultados não comprova ausência de indexação; a reescrita da consulta pelo Google não foi reproduzida.

Lighthouse 13.5.0, Chrome local headless, mobile e throttling simulado, uma execução por cenário:

| Cenário anterior    | Performance | LCP      | TBT    | CLS |
| ------------------- | ----------- | -------- | ------ | --- |
| Produção            | 57          | 4.836 ms | 557 ms | 0   |
| Build recente local | 67          | 4.051 ms | 573 ms | 0   |

Não são dados de campo ou medição de INP. Comparação final deve usar a mesma metodologia e distinguir rede local de produção. Meta aprovada: LCP mobile abaixo de 2.500 ms.

## Estado local

O build gera home, quatro cases e 404 com componentes React reais e CSS extraído. Cada documento tem um H1. O sitemap gerado tem quatro URLs previamente confirmadas em produção. O overlay de abertura foi excluído do servidor para não cobrir a home sem JavaScript; a introdução do cliente permanece. O bootstrap espera a história do case inicial antes de montar o cliente.

Entidade e metadados foram ajustados para nome do currículo, aliases, perfis existentes, localização São Paulo, tecnologias presentes e origem www. A identidade do H1 é visível. A imagem OG existente de 1200 × 630 é compartilhada. Esses ajustes de conteúdo ainda precisam de revisão independente.

Gates integrados: 139/139 testes, typecheck, lint, formatação e build passaram. Há avisos de useLayoutEffect no SSR e do chunk Three.js grande. Person e WebSite passaram no validador Schema.org: dois itens, zero erros e zero avisos. CreativeWork e conferência externa do HTML final ainda estão pendentes.

QA local percorreu seis documentos em desktop, mobile e sem JavaScript: um H1 por documento, sem overflow horizontal ou erros de execução. Nos cenários com JavaScript, não houve falhas de rede registradas. Com JavaScript desativado, o navegador bloqueia os modulepreloads com motivo CSP. A home sem JavaScript foi inspecionada e está visível. O servidor estático de teste é necessário: vite preview devolve a home nos caminhos de diretório. Isso não comprova roteamento da hospedagem.

## Auditoria das ferramentas externas

Nenhum instalador, script de fornecedor ou serviço pago foi executado. Nenhuma conta ou chave foi configurada.

- claude-seo: leitura de 96 scripts, SHA 4b99de2. Checklists úteis; instalação global e extensões com APIs, credenciais e custos excedem o escopo. Usado somente como referência seletiva.
- seo-agent: leitura de 22 scripts, SHA e88c7bf. Depende de Anthropic/SearchApi pagos; módulos premium ausentes, TLS ignorado e DOM tratado como HTML original. Não instalado.
- Citedy: leitura de seis scripts, SHA 5dcb31d. Conta, chave, créditos e possibilidade de autopublicação. Não conectado.

## Próximas etapas

1. Revisar independentemente os ajustes de entidade e metadados.
2. Otimizar o bloqueio das fontes preservando Archivo e JetBrains Mono. Medir antes de alterar a cena ou a montagem do cliente. O parágrafo da home é o candidato LCP; substituição do DOM por createRoot é uma hipótese adicional, ainda não quantificada.
3. Repetir Lighthouse comparável, validar CreativeWork, preferência EN, movimento reduzido, teclado e navegação. Atualizar README/ARCHITECTURE aos contratos atuais.
4. Fazer revisão integrada, commits convencionais sem coautor, push e atualização da PR #14. Não fazer merge ou deploy.

## Depois da publicação pelo usuário

- Conferir home, três cases e Pebolim com HTTP 200; robots, sitemap, canonical www e HTML inicial com H1/schema. Testar HTTP e versões www/sem www até a única versão canônica.
- Search Console: selecionar https://www.eovitu.com.br/, abrir Sitemaps e enviar sitemap.xml. Inspeção de URL: inserir a home canônica, testar URL publicada e solicitar indexação. Propriedade Domínio eovitu.com.br via registro TXT DNS é opcional e reúne protocolos/subdomínios.
- Somente após Pebolim retornar 200, adicionar sua rota ao allowlist em src/lib/discovery.ts e publicar essa atualização.
- Bing Webmaster Tools: importar a propriedade do Google Search Console e conferir sitemap.
- GitHub: bio com nome, eovitu e atuação; website canônico; README de perfil com apresentação factual e link. LinkedIn: nome consistente, site e descrição profissional. Alterações de perfis cabem ao usuário.
- Adicionar links legítimos nos repositórios dos projetos e perfis controlados, incluindo SENAI se disponível. Não comprar links.
- Inventariar domínios/subdomínios antigos e configurar 301 para o destino equivalente, quando controlados.
- Acompanhar semanalmente impressões, cliques e posição para eovitu e variações no GSC. Não há garantia de ranking.

## Melhorias opcionais

URLs próprias para inglês, OG específica por case e revisão maior do WebGL ficam fora desta entrega. Para futuras operações Vercel, instalar a CLI oficial com npm i -g vercel facilita env pull, logs e deploy; não é necessária para esta implementação e não foi instalada.

## Medicao do ponto de parada

Lighthouse local com mesma versao e metodologia: performance 50, LCP 5.874 ms, TBT 749 ms, CLS 0. O LCP piorou 1.823 ms frente ao baseline local de 4.051 ms. A meta de 2.500 ms nao foi atingida. Este resultado impede declarar a entrega concluida; investigar remontagem do DOM, sequencia de entrada e fontes antes de publicar.
