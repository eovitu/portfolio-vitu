# Validação local de motion por seção

Data: 10/10/2026. Branch feat/section-motion. Alterações locais, sem commit, push, merge ou deploy.

As quatro capas foram extraídas dos MP4 atuais pelo FFmpeg 9.0.2 no timestamp 00:02.000, com libwebp quality 85 e 1920×1080. A composição de cada candidato foi inspecionada em contato visual e aprovada pelo controlador antes da substituição. Os caminhos existentes foram preservados. SHA-256 e tamanho dos quatro vídeos são iguais antes e depois.

| Mídia         | Poster anterior (bytes) | Poster atual (bytes) | MP4 (bytes) |
| ------------- | ----------------------: | -------------------: | ----------: |
| Emprega.co    |                   60858 |                56100 |     7289072 |
| Pebolim       |                   61432 |                61940 |     7277533 |
| Doces da Pati |                   56988 |                58474 |     8026238 |
| HelpPet       |                   76094 |                78648 |     7502057 |

O gate integrado executou 141 testes, sem falha ou skip. Typecheck e lint passaram. O lint detectou a expressão regular de caracteres de controle do validador local de mídia; a detecção foi expressa por códigos de caracteres, preservando os testes de sanitização. Prettier ajustou cinco arquivos antecedentes e aprovou a árvore final.

A validação de navegador usa Chrome headless em produção local. A matriz extensa das Tasks 1–3 continua como evidência das coreografias, cancelamento, teclado, reload por seção/case e PT/EN. O smoke final cobre a árvore compilada e as capas novas. Resultados ficam registrados no relatório da Task4.

Lighthouse final é responsabilidade do controlador e não foi executado simultaneamente nesta tarefa. Gestos físicos em dispositivo, Safari e FPS real continuam sem verificação. Nenhum resultado está publicado.

Build/prerender aprovado: seis documentos e cinco URLs de sitemap verificadas. Avisos do build: chunk Three.js acima de 500 kB e useLayoutEffect no SSR. Esses avisos não constituem prova de mismatch de hidratação; a verificação do navegador é registrada separadamente.

Smoke final: desktop 1440×1000 PT, mobile 390×844 EN salvo e reduced PT. Overflow=0, quatro vídeos pausados/sem src inicialmente, reload perfil conserva exatamente y=5212/3319/5127; sem lock ou ghosts. Wheel desktop 5212→5627→5217. Reduced percorreu quatro destinos; EN recheck aguardou expansão de 1200 ms, confirmou quatro destinos e clicou Doces. 0 pageerror. Recheck console: 404 de recurso sem mensagem de hydration/React/uncaught; não afirmar console inteiramente limpo. Os snapshots/screenshots task4-*.png registram a árvore final.

Sem JavaScript, a home permanece legível. Os HTMLs pré-renderizados dos quatro cases estão presentes no build; o servidor estático final resolve seus caminhos diretamente. A expansão EN foi conferida novamente após concluir a animação, confirmando quatro destinos.

Servidor final em scratch, sem mudança na configuração do produto: task4-server.mjs resolve /work/slug para dist/work/slug/index.html. URL http://localhost:4173, sessão 50750. HTTP 200 e conteúdo case-hero confirmados nos quatro caminhos sem barra. O 404 identificado é /_vercel/insights/script.js (Analytics indisponível no servidor estático local). Recheck EN confirma quatro destinos e nenhuma mensagem hydration/React/uncaught. Browser encerrado após QA, CPU liberada para Lighthouse controlador.

## Performance local

Lighthouse 13.5, mobile, throttling simulate, perfil novo por execução, mesmo servidor estático na porta 4188. Cinco execuções por estado, sem QA concorrente.

| Execução | LCP antes (ms) | LCP depois (ms) | TBT antes (ms) | TBT depois (ms) | Performance antes | Performance depois |
| -------- | -------------: | --------------: | -------------: | --------------: | ----------------: | -----------------: |
| 1        |         6094,5 |          3760,7 |          658,0 |          1980,0 |                54 |                 57 |
| 2        |         6085,1 |          3161,5 |          546,0 |          2134,9 |                58 |                 61 |
| 3        |         5942,6 |          3156,9 |          574,0 |          2840,3 |                58 |                 60 |
| 4        |         6103,7 |          3902,3 |          596,5 |          2240,0 |                56 |                 55 |
| 5        |         6089,5 |          6100,3 |          557,0 |           778,5 |                57 |                 51 |

Medianas: LCP 6089,5 → 3760,7 ms, melhora de 38,2%; TBT 574,0 → 2134,9 ms, piora de aproximadamente 272%; score de performance 57 → 57. O LCP variou de 5942,6 a 6103,7 ms antes e de 3156,9 a 6100,3 ms depois. A variância final é ampla e a meta de LCP de 2,5 s não foi atingida. Performance permanece pendente; estes dados não identificam a causa do TBT maior.

Evidência: baseline-lh-summary.json e final-lh-summary.json no scratch da tarefa. Resultados locais não provam comportamento em dispositivo físico ou produção.

## Ajustes autorizados em 11/10/2026

O usuário confirmou que a foto sumia e pediu animações mais fortes nos padrões existentes, com scroll responsivo, autorizando publicação ao terminar. Nenhum commit, push, merge ou deploy foi executado nesta etapa.

A reprodução em produção local confirmou a imagem carregada HTTP 200 em desktop, mobile EN e reduced, sem pageerror. Em desktop, a recarga mudou y=6521 para 7219. O trace registrou altura do documento 9253 → 8553 px durante a hidratação do teatro; a foto saiu da viewport apesar de opacity=1 e visibility=visible. A correção usa a API de scroll existente para reconciliar o snapshot durante a coreografia, com um ResizeObserver temporário do root. Gestos, conclusão e cleanup desconectam o observador.

As poses mantêm direções e sequências: força do scroll 0,18 → 0,32, chegada explícita 0,35 → 0,55 e amplitude da recarga +25%. A escala da recarga tem piso 0,1 para evitar inversão do contato. Não adiciona loop, tween, espera ou duração; teto de recarga 3,2 s e caminho reduced estático permanecem. Configuração Lenis, easing e integração GSAP continuam iguais à auditoria de 10/10.

Quatro testes focados passaram. Build e QA de produção posteriores aos ajustes permanecem pendentes até registro abaixo. A reconstrução temporária da foto ainda não representa a moldura completa; o asset original e a composição real não foram alterados.

### QA de produção posterior aos ajustes

Build final servido em localhost:4173. Chrome headless, desktop PT 1440×1000, mobile EN 390×844, reduced PT 390×844 e noJS mobile. A foto carregou em todos, HTTP 200, sem pageerror. Desktop conserva y=6523 → 6523 durante e após recarga; mobile EN y=6801 → 6801 e reduced y=6804 → 6804. Foto permaneceu na viewport em todos os cenários de recarga finais. Fim sem ghosts, lock ou overflow horizontal. A screenshot desktop pós-recarga foi inspecionada: foto, moldura, legenda e inclinação presentes.

Wheel durante recarga encerrou a coreografia e a reconciliação sem reposicionar a página nos 2,8 s seguintes. Na primeira rodada desse QA, o primeiro wheel foi consumido pelo bloqueio Lenis da abertura anterior. O listener de cancelamento foi antecipado para capture, com cleanup correspondente, para liberar a abertura antes de Lenis tratar o mesmo evento. A rodada posterior desse ajuste está registrada abaixo. Contact desktop/mobile EN teve palavras dentro dos limites horizontais e zero overflow, com scroll posterior desktop 7212 → 6899 e mobile 7953 → 7641. Screenshot mobile do contato foi inspecionada sem corte horizontal do texto.

Artefatos: photo-final-qa.json, photo-final-_.png, motion-final-qa.json e motion-final-_.png. Ambos scripts encerraram exit 0; browsers fechados. Não houve Lighthouse concorrente.

### Primeiro gesto após antecipar o cancelamento

A rodada final no build registrado em release-*.log encerrou exit 0. Um único wheel de -240 durante a coreografia moveu desktop y=6523 → 6271 e mobile EN y=6801 → 6549. Essas posições permaneceram idênticas nos 2,8 s seguintes, sem restauração posterior. Foto visível, HTTP 200, zero pageerror, overflow, ghosts ou lock finais. A mesma rodada repetiu recarga desktop 6523 → 6523, mobile EN 6801 → 6801 e reduced 6804 → 6804, além de noJS. Os listeners capture preservam o bloqueio delimitado da abertura e liberam antes de Lenis processar o gesto; não alteram bloqueios de outros diálogos. Touch e teclado têm o mesmo cancelamento no código, mas gesto físico touch não foi verificado.
