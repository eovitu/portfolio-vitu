# Diretrizes do projeto — Singularity Portfolio

## Fontes e precedência

Estas diretrizes foram derivadas das instruções globais fornecidas pelo autor,
de `README.md`, de `docs/ARCHITECTURE.md` e de `docs/BUGS-ABERTOS.md`.
O arquivo `claude.md` mencionado no briefing não estava presente neste checkout
em 29/08/2026; não atribua a ele decisões que não possam ser verificadas.

Em caso de conflito, use esta ordem:

1. requisito ou decisão explicitamente aprovada pelo autor;
2. este arquivo e documentação arquitetural atual;
3. contratos e testes executáveis;
4. implementação existente;
5. inferência, sempre identificada como tal.

## Processo obrigatório

Antes de alterar comportamento:

1. leia o fluxo completo afetado, não apenas o componente visível;
2. confira Git e preserve mudanças locais não relacionadas;
3. identifique contratos entre DOM, GSAP/ScrollTrigger, Lenis e R3F;
4. proponha a menor mudança coerente e peça aprovação para mudanças relevantes;
5. implemente sem refatorações paralelas;
6. execute typecheck, lint e verificações proporcionais ao risco;
7. valide desktop, mobile, teclado e `prefers-reduced-motion` quando aplicável;
8. registre o que foi alterado, verificado e o que continua pendente.

## Invariantes de arquitetura e Three.js

- Existe um único relógio: Lenis → ticker do GSAP → ScrollTrigger → animações
  → `advance()` do R3F. Não crie outro loop permanente.
- O canvas usa `frameloop="never"`; mudanças nisso exigem evidência de medição e
  aprovação explícita.
- A singularidade é procedural. Não substitua a cena por GLB sem preservar e
  comparar blending aditivo, cores HDR, billboard, máscara do núcleo e visual.
- `docs/reference/black-hole.html` é a fonte dos parâmetros visuais da cena.
- Preserve a semente determinística `1337`.
- Materiais, geometrias, texturas, listeners, timelines e probes precisam de
  teardown/dispose explícito e verificável.
- Não aloque objetos, arrays, materiais ou geometrias por frame sem necessidade.
  Reuse scratch objects e meça antes de otimizar.
- Qualidade deve respeitar tier do dispositivo, DPR, viewport, mobile e redução
  de movimento. Uma melhoria visual não pode tornar o fallback inutilizável.
- `gravityField.ts`, `horizon.ts` e `stagePresence.ts` são fontes de verdade de
  seus respectivos domínios; não duplique esses estados em componentes.
- Camadas de grão e redshift não podem levantar o preto absoluto da cena.

## UI, UX e conteúdo

- O conceito central é gravidade; movimento deve explicar esse conceito ou
  orientar a leitura, não apenas decorar.
- Todo fluxo assíncrono deve considerar loading, sucesso, vazio, erro e retry.
- Use HTML semântico, foco visível, navegação por teclado, touch targets
  adequados e alternativas para gestos.
- `prefers-reduced-motion` deve produzir uma experiência completa, não apenas
  uma versão quebrada sem animações.
- Preserve o contraste e o black point; valide visualmente em pixels compostos.
- Conteúdo de projetos vive em `src/lib/content.ts`; evite duplicá-lo na UI.
- O portfólio deve provar decisões e resultados. Não publique claims de
  performance, acessibilidade ou produto sem evidência reproduzível.

## Performance e verificação

- Meça com a janela em primeiro plano; throttling de aba invalida timings da
  intro e do frame loop.
- Preserve o teto atual de 3,2 s para a intro, salvo decisão explícita diferente.
- Avalie primeiro: bundle inicial, tempo até conteúdo útil, FPS/frame time,
  memória GPU, draw calls, triângulos, DPR e custo de listeners/ScrollTriggers.
- Não faça micro-otimização sem gargalo identificado.
- Para mudanças relevantes, rode no mínimo `npm run typecheck`, `npm run lint`
  e `npm run build`; complemente com inspeção de console, rede, mobile,
  acessibilidade e regressão visual conforme o risco.
- Bugs intermitentes exigem reprodução ou instrumentação; não corrija por
  tentativa aleatória. Atualize `docs/BUGS-ABERTOS.md` quando a evidência mudar.

## Escopo e segurança

- Não adicionar dependências, reestruturar a arquitetura, mudar contratos ou
  remover instrumentação sem benefício concreto e aprovação.
- Não expor secrets, dados pessoais ou detalhes privados de organizações.
- Não fazer commits, pushes, migrations destrutivas ou operações Git com perda
  de trabalho sem solicitação explícita.
- Melhorias fora do objetivo principal devem ser marcadas como opcionais.

## Git e colaboração da v1

- A implementação da v1 ocorre em `codex/v1-launch`; não altere `main`.
- Use Conventional Commits e mantenha cada commit revisável por finalidade.
- Não adicione trailer de co-author automatizado.
- Antes de push ou PR, rode a verificação completa e use
  `.github/PULL_REQUEST_TEMPLATE.md`.
- A especificação aprovada vive em `docs/V1-SPEC.md`; decisões de implementação
  não podem contradizê-la silenciosamente.
