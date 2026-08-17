# Singularity — portfólio de Victor Hugo

Portfólio pessoal construído em torno de um conceito só: **gravidade**. Um
buraco negro renderizado em tempo real não é o plano de fundo do site — é o
personagem. Ele consome a página no reload e a devolve, puxa a tipografia da
hero, curva o campo estelar, deixa a cena quando cada seção precisa de mundo
próprio, e volta no fim para engolir tudo menos um sinal.

A leitura inteira é enquadrada como uma queda: um HUD permanente marca a
distância até o horizonte de eventos em raios de Schwarzschild, o scroll fica
progressivamente mais pesado conforme o leitor desce, e a temperatura de cor da
página desloca para o vermelho no caminho.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **Three.js** / **@react-three/fiber** — a cena é procedural, não um asset
- **GSAP** + **ScrollTrigger** — timelines scrubadas
- **Lenis** — scroll suave, com um único frame loop para tudo
- **styled-components**

## Rodando localmente

```bash
npm install
npm run dev
```

Build de produção e verificação:

```bash
npm run build      # tsc --noEmit + vite build
npm run typecheck
npm run lint
npm run preview
```

## Estrutura

```
src/
  components/
    layout/       HUD, grão, redshift, cursor, palco 3D, toggle de som
    navigation/   header
    providers/    SmoothScrollProvider — o único frame loop da aplicação
    sections/     Hero, Work, About, Skills, Contact
    chat/         widget de conversa (mock)
  hooks/          scroll horizontal, intro, campo gravitacional, colapso
  lib/            campo gravitacional, horizonte, presença do objeto,
                  véu, snapshot de reload, fantasmas, auditoria
  three/          cena procedural, qualidade de render, campo estelar
  styles/         tokens e estilo global
docs/
  ARCHITECTURE.md decisões técnicas e as descobertas por trás delas
  reference/      protótipo de origem da cena 3D
public/
  victor-2010.jpg a única fotografia do site
```

## A cena 3D

O buraco negro é **gerado em código** por `src/three/singularityScene.ts`. Um
GLB do mesmo objeto foi tentado e descartado: o formato glTF perde o blending
aditivo, as cores de vértice em HDR, o billboard do halo de lente e o shader que
mascara o núcleo — ou seja, tudo que faz o objeto funcionar. O importado parecia
uma foto do objeto, não o objeto.

O protótipo de onde os valores foram transcritos está em
[`docs/reference/black-hole.html`](docs/reference/black-hole.html). Ele é fonte
de verdade, não histórico: se algum dia a cena precisar ser reconstruída, é dali
que os números saem. A semente `1337` mantém a geometria determinística.

Detalhes em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Trocando o conteúdo

**Projetos.** Editar o array `projects` em `src/lib/content.ts`. Cada projeto
recebe uma órbita pelo índice — `0` perto do horizonte (quente, comprimido),
`1` órbita estável (neutro), `2` distante (frio, vazio) — e o layout, a paleta e
o ambiente mudam junto. As placas de mídia são placeholders compostos por
órbita; para colocar imagens reais, trocar o bloco de fundo em `MediaInner` por
um `<img>`, mantendo `data-panel-image` para o parallax continuar funcionando.

**A fotografia.** `public/victor-2010.jpg`. É a única imagem do site, e a
escassez é o que dá peso a ela. Todo o tratamento (alto contraste, duotom,
grão) é CSS em `src/components/sections/About/About.tsx` — o arquivo original
nunca é editado. Para trocar, substituir o arquivo e ajustar o `alt` em
`about.photoAlt`.

**Textos.** Tudo em `src/lib/content.ts`.

## Scroll e intro

Um relógio só governa o site: `Lenis → ticker do GSAP → ScrollTrigger →
animações → R3F`. Não existe um segundo `requestAnimationFrame`.

Todo carregamento termina na hero com `scrollY` 0. No reload, a posição de cada
palavra visível é capturada no `pagehide`, os fragmentos são remontados antes do
React renderar, e o objeto os suga enquanto a câmera volta ao topo. A sequência
tem teto de 3,2s.

## Acessibilidade

- WCAG AA verificado em todas as seções (4.5:1 texto normal, 3:1 texto grande).
- `prefers-reduced-motion: reduce` desliga dilatação temporal, inércia das
  letras, redshift, grão, a queda entre painéis, o colapso e o brinquedo da
  hero — mantendo o site inteiro utilizável.
- Estados de foco visíveis no acento dourado.
- O espectro de habilidades é navegável por teclado, com o detalhe anunciado por
  `aria-live` e uma lista agrupada como leitura alternativa.

## Licença

MIT — ver [LICENSE](LICENSE).
