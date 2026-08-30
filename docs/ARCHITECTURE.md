# Arquitetura

Notas técnicas sobre as partes do site que não são óbvias a partir do código, e
sobre as decisões que custaram caro para chegar até aqui.

## Um único frame loop

Todo movimento do site sai de um relógio só:

```
Lenis → ticker do GSAP → ScrollTrigger → animações → advance() do R3F
```

`SmoothScrollProvider` cria a única instância do Lenis e o único
`requestAnimationFrame` da aplicação. O canvas roda com `frameloop="never"` e é
avançado manualmente por esse mesmo tick.

**Consequência prática para quem for medir performance:** com a aba em segundo
plano o Chrome suspende o `requestAnimationFrame`, e o site inteiro congela — a
intro para no meio e qualquer leitura de tempo vira lixo. Medições precisam da
janela em primeiro plano (`Page.bringToFront`) e, em ambiente automatizado, das
flags `--disable-background-timer-throttling`,
`--disable-backgrounding-occluded-windows` e `--disable-renderer-backgrounding`.

## A cena 3D é procedural, não um asset

`src/three/singularityScene.ts` constrói o buraco negro em código. Isso não é
preferência de estilo: um GLB do mesmo objeto foi tentado e descartado.

O formato glTF não transporta o que faz o objeto funcionar. Na exportação, todos
os materiais saíam como `KHR_materials_unlit`, sem emissivo, e se perdiam:

- o **blending aditivo** de 19 das 20 malhas, que é o mecanismo da luz;
- as **cores de vértice em HDR** (chegando a ~3.1), sem as quais o tone mapping
  ACES não tem o que dobrar em direção ao branco — o tone mapper _é_ o bloom;
- o **billboard** do halo de lente, que mantém o anel fechando em volta da
  silhueta em vez de ficar ao lado dela;
- o **shader de máscara do núcleo** (`onBeforeCompile`), que impede a luz de
  vazar sobre o vazio.

O resultado importado parecia uma fotografia do objeto, não o objeto. O
protótipo de origem está em [`reference/black-hole.html`](reference/black-hole.html)
— é a fonte de verdade de onde os valores foram transcritos, incluindo a semente
`1337`, que mantém a geometria determinística.

`singularityScene.ts` é tratado como fechado para materiais, geometria, tone
mapping e blending. A amplitude de movimento é a única exceção, isolada na
constante `MOTION`.

### Qualidade adaptativa

`src/three/renderQuality.ts` classifica o dispositivo em três tiers com base em
viewport, ponteiro, núcleos lógicos e memória reportada quando disponível. A
decisão é pura e coberta por testes; não depende de user-agent.

| Tier       | DPR máx. | Núcleo   | Ribbon | Strand | Antialias |
| ---------- | -------- | -------- | ------ | ------ | --------- |
| high       | 1.75     | 112 × 72 | 112    | 64     | sim       |
| balanced   | 1.40     | 88 × 56  | 88     | 52     | sim       |
| low/mobile | 1.15     | 64 × 40  | 64     | 36     | não       |

Ribbons, feixes Doppler e acentos violetas de mesmo material são mesclados por
família para reduzir draw calls. As geometrias intermediárias são descartadas
imediatamente, e o teardown final continua centralizado em `scene.dispose()`.
Frustum culling só é desativado no rig de lensing, onde o billboard muda os
bounds; o restante da cena usa o culling padrão.

Quando a aba fica oculta, o driver do canvas para completamente. O estado do
palco é atualizado somente pelo `FrameDriver`: presença ativa usa a cadência
normal, presença ambiente usa aproximadamente 12 FPS e ausência real usa 4
FPS. Mudanças entre esses estados sempre renderizam imediatamente. Nenhum
desses caminhos cria um segundo relógio.

## Intro, reload e a continuidade

O site nunca restaura a posição de scroll. **Todo carregamento termina na hero
com `scrollY` 0**, e isso é deliberado.

- `src/lib/reloadSnapshot.ts` grava, no `pagehide`, a posição de cada palavra
  visível medindo com `Range.getBoundingClientRect()`.
- `src/lib/ghosts.ts` remonta esses fragmentos antes do React renderar, para que
  o primeiro quadro pintado já seja a página que estava lá.
- `src/hooks/useSingularityIntro.ts` suga os fragmentos para dentro do objeto e
  leva a câmera de volta à hero, numa timeline mestre única.
- A restauração nativa é desligada com `scrollRestoration = 'manual'`, inline e
  síncrono no `<head>`.

**Bug histórico que explica a guarda de scroll:** um reload de dentro do WORK
caía no PROJETO 03. Causa raiz: o _pin spacer_ do ScrollTrigger só é criado
depois da montagem, o documento cresce nesse instante, e qualquer offset
restaurado antes disso aterrissa na seção errada. Existe hoje uma guarda que
segura `scrollY` em 0 até haver gesto real do usuário, com contador exposto em
`__introAudit().scrollGuard`.

Orçamento: a sequência inteira tem teto de **3,2s**, medido do primeiro quadro
pintado. Medições recentes ficam entre 2,99s e 3,04s.

## Campo gravitacional

`src/lib/gravityField.ts` é a **única** fonte de verdade sobre onde o núcleo
está em espaço de tela e com que força puxa. O produtor é `src/three/Scene.tsx`,
que projeta uma vez por quadro. Três consumidores leem:

1. **Letras** (`src/hooks/useGravityLetters.ts`)
2. **Cursor** (`src/components/layout/Cursor.tsx`)
3. **Campo estelar** (`src/three/DustField.tsx`, no vertex shader)

A projeção da câmera sozinha não basta para ativar o campo: o núcleo pode estar
matematicamente dentro do frustum e visualmente ausente por decisão do palco.
`src/three/stagePolicy.ts` combina projeção e presença efetiva. Essa regra
impede que o cursor seja atraído em SKILLS por uma singularidade invisível.

Os limites do palco são medidos novamente em todo `ScrollTrigger.refresh`.
Isso é obrigatório porque o pin spacer de WORK altera a posição absoluta de
SKILLS e CONTACT depois da montagem inicial; usar os limites antigos fazia o
objeto retornar uma seção cedo demais.

### Por que as letras têm um wrapper próprio

Três sistemas querem escrever `transform` num glifo da hero: a revelação da
intro, o warp de absorção, e o campo. Em vez de negociar, os canais são
**disjuntos no DOM**: o GSAP é dono de `[data-letter]` e nunca sabe que
`[data-glyph]` existe; o campo é dono de `[data-glyph]` e nunca toca no de fora.
Compor os três num nó só foi o que gerou os transforms órfãos que
`__introAudit()` caça.

## Presença do objeto por seção

`src/lib/stagePresence.ts` decide onde o objeto pode estar:

| Seção   | Presença | Efeito                                   |
| ------- | -------- | ---------------------------------------- |
| hero    | 1.00     | composição completa                      |
| WORK    | 0.16     | ponto distante num canto                 |
| SKILLS  | 0.00     | ausente                                  |
| ABOUT   | 0.00     | ausente (a seção é opaca sobre o canvas) |
| CONTACT | 0 → 1.45 | volta e cresce até o colapso             |

Antes disso o objeto era uma camada fixa atrás de tudo, e por isso nenhuma seção
conseguia ter mundo próprio. A presença dirige véu, escala e posição — nunca
`display: none`.

O **campo estelar é a constante do site**. Como o véu é uma camada preta pintada
por cima do canvas, `DustField` pré-divide a opacidade pelo que o véu vai tirar,
mantendo o resultado _composto_ aproximadamente constante em todas as seções.

## Distância sem latência no scroll

`src/lib/horizon.ts` continua publicando progresso e distância em raios de
Schwarzschild para HUD e redshift. Esse progresso não altera mais `duration`,
`wheelMultiplier` ou `touchMultiplier` do Lenis.

A dilatação temporal foi removida após validação de UX: mesmo quando o efeito
era fisicamente coerente e mensurável, reduzir a distância por gesto e alongar
o assentamento era percebido como travamento exatamente na entrada de CONTACT.
Gravidade permanece como linguagem visual; input direto mantém resposta
uniforme em toda a página.

## Grão e redshift não podem levantar o preto

O objeto é preto absoluto com luz aditiva em cima. Qualquer camada que levante o
black point destrói o mecanismo.

- **Grão** usa `mix-blend-mode: soft-light`. Contra backdrop 0, soft-light
  devolve 0 para qualquer valor de fonte: para `Cs ≤ 0.5` o termo é
  `b − (1−2Cs)·b·(1−b)`; para `Cs > 0.5` é `b + (2Cs−1)·(D(b)−b)` com `D(0) = 0`.
  Máscara sobre a região do canvas foi rejeitada porque deixaria a hero — a
  superfície mais vetorial da página — como o único lugar sem grão.
- **Redshift** usa `multiply`. Multiply contra 0 é 0, e multiply por branco puro
  é identidade, então o topo da página é um no-op real.

Para verificar: `readPixels` **não** enxerga camadas DOM. O black point tem que
ser medido no pixel composto, via `Page.captureScreenshot`.

## Instrumentação

`src/lib/introAudit.ts` expõe `window.__introAudit()` — transforms órfãos, alvos
ocultos, duração da intro, contador da guarda de scroll. O gravador por quadro e
a sonda do renderer ficam atrás de `sessionStorage['singularity:record']`, então
uma sessão normal não paga por eles. É ferramenta de verificação, mantida de
propósito.
