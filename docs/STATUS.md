# Estado atual do portfólio

Consolidado em 11/10/2026. Este documento orienta a leitura do repositório; os registros datados de validação e SEO preservam o histórico.

## Identidade e contratos

A identidade pública é Victor Hugo Araujo, Vitu/eovitu, com domínio canônico `https://www.eovitu.com.br`. O site usa React/Vite, português inicial e inglês salvo após hidratação. Há quatro cases, reprodução explícita de vídeo, menu mobile com projetos expansíveis e scroll contínuo nas mudanças de cor. Arquitetura e locais de edição: [README](../README.md) e [ARCHITECTURE](ARCHITECTURE.md).

Em 11/10 o usuário autorizou a publicação após concluir os ajustes de motion. A implementação reúne coreografia de entrada e recarga por seção, chegadas de navegação, posters e preservação do ângulo original da foto. O estado de publicação deve ser confirmado pelo SHA da integração contínua, deploy e HTML servido. O [registro de validação](SECTION_MOTION_VALIDATION.md) separa as rodadas de 10/10 da reprodução, correção e QA de produção local de 11/10.

## Evidências e pendências

O gate integrado de 11/10, executado pelo controlador após a correção de recarga e intensificação, registrou 141 testes sem falha ou skip, typecheck, lint e formatação aprovados. O build final aprovou seis documentos e cinco URLs do sitemap. Os logs release-_.log no scratch registram a rodada final, posterior aos logs publish-_.log. O QA de produção local posterior está registrado em SECTION_MOTION_VALIDATION.

Performance permanece pendente. Cinco execuções Lighthouse por estado tiveram medianas LCP 6089,5 → 3760,7 ms, TBT 574,0 → 2134,9 ms e score 57 → 57. Não há causa comprovada do TBT ou gargalo atribuído ao Lenis. Gestos físicos, Safari e FPS real não foram verificados. O QA de produção local de 11/10 confirmou a foto visível após recarga mobile EN e reduced. No desktop reproduziu deslocamento de scroll de 6521 para 7219, após redução de 700 px na altura do teatro durante hidratação. A imagem carregava HTTP 200 e permanecia visível no DOM; saía da viewport. A correção reconcilia a coordenada salva durante a abertura e desconecta o observador ao terminar ou receber gesto. O QA do build posterior preservou exatamente y=6523 no desktop e manteve a foto visível. Mobile EN conservou y=6801 e reduced y=6804. No QA final, o primeiro wheel durante a coreografia moveu desktop 6523 → 6271 e mobile EN 6801 → 6549, sem reiniciar a posição nos 2,8 s seguintes.

A representação temporária da recarga reconstrói imagem e legenda, mas não a moldura completa do figure. Esse limite está separado da restauração de posição e da preservação angular do figure real.

## Como consultar o histórico

[VALIDATION](VALIDATION.md) registra rodadas anteriores com contratos que podem ter sido substituídos, incluindo autoplay e alinhamento de scroll. [SEO](SEO.md) preserva experimentos e evidência de produção de 8 e 9/10; afirmações de estado ali são datadas. Os planos de 8/10 descrevem autorização e decisões daquela entrega e não autorizam publicação da frente atual.

Resultados históricos de projetos apresentados, incluindo PostgreSQL e Flyway, devem ser atribuídos ao respectivo projeto. O frontend do portfólio não executa migrações de banco.
