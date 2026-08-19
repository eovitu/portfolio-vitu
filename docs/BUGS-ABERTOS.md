# Bugs em aberto

Defeitos conhecidos que **não** foram corrigidos, com o motivo de cada um
seguir aberto e o que seria preciso para fechá-lo. A lista existe para que um
bug intermitente não seja redescoberto do zero daqui a três meses.

Um bug só entra aqui quando a instrumentação necessária para investigá-lo já
está no código. Anotar um sintoma sem deixar como capturá-lo é adiar o mesmo
trabalho.

**Fechados nesta revisão.** "`scrollGuard` nunca reporta engajamento" saiu da
lista: `src/lib/reloadSnapshot.ts` mostra o contador de fato incrementado num
listener de `scroll` instalado incondicionalmente por `initReloadSnapshot()`
— não é código morto, a dúvida original do item está respondida. "Distância
do HUD sobe durante scroll contínuo" também saiu: o mecanismo descrito como
correção (`lib/refreshGate` gating a re-medição atrás de uma janela de
silêncio) está integralmente presente em `useHorizontalScroll.ts` e
`refreshGate.ts`, coerente ponta a ponta com o commit `ad7f183` que o
introduziu. Vale rodar a validação com `?debug=scroll` descrita no doc
original uma vez para confirmar em runtime, mas a revisão de código não deixa
dúvida sobre o mecanismo estar implementado e ligado.

---

## 1. Reload intermitente não termina na hero (~1 em 10)

**Sintoma.** Recarregar a página de dentro de uma seção interna termina, em
torno de uma vez a cada dez, com a leitura em algum ponto que não é o topo. As
outras nove terminam na hero com `scrollY` 0, que é o comportamento
especificado.

**Por que segue aberto.** Não há amostra suficiente. Uma taxa de ~10% num
evento que exige recarregar a página torna a reprodução cara, e nenhuma das
tentativas capturou o estado no momento da falha — sem isso, qualquer correção
seria um palpite sobre um sistema (guarda de scroll, remontagem de fantasmas,
construção do pin-spacer) onde já houve regressão por palpite antes.

**O que já está instrumentado.** `window.__introAudit()` reporta:

| Campo | O que significa |
| --- | --- |
| `scrollGuard.corrections` | Quantas vezes a guarda puxou `scrollY` de volta a 0 |
| `scrollGuard.worst` | O maior offset que ela precisou corrigir |
| `scrollGuard.released` | Se a guarda chegou a ser liberada por gesto real |
| `ghostLayer` | Se a camada de fantasmas existia neste carregamento |
| `scrollY` | Onde a leitura efetivamente parou |
| `duration` | Duração total da sequência de intro |

**Como capturar quando reproduzir.** Recarregar de dentro do WORK ou do
CONTACT, repetidamente. Assim que um carregamento terminar fora da hero, rodar
`copy(JSON.stringify(__introAudit()))` **antes de tocar na roda do mouse** — o
primeiro gesto libera a guarda e apaga a evidência.

**Hipótese não verificada.** O pin-spacer do WORK só é construído depois da
montagem, e é ele que dá ao documento a altura final. Um `scrollY` restaurado
antes disso aterrissa na seção errada. A guarda existe justamente para cobrir
essa janela, então a suspeita é que em ~10% dos carregamentos algo a libera
cedo demais — o que `scrollGuard.released` combinado com `corrections` deve
distinguir. Ver `docs/ARCHITECTURE.md`, seção "Intro, reload e a continuidade".

---

## 2. Whoosh da intro é inaudível na prática

**Sintoma.** `whoosh('in')` e `whoosh('out')` estão ligados aos pontos certos
da timeline da intro, mas nunca soam.

**Causa raiz, já confirmada.** Não é um bug de ligação — é a política de
autoplay contra a arquitetura do som. `SoundToggle` lê a preferência guardada
mas deliberadamente **não** age sobre ela: o `AudioContext` só é construído a
partir de um gesto real do leitor. Como a intro roda no carregamento, o som
está sempre desligado no momento em que ela toca.

**Por que não foi "corrigido".** A correção óbvia — restaurar o som ligado a
partir do `sessionStorage` — desfaz uma decisão documentada que existe por um
motivo melhor do que este efeito. A ligação fica nos pontos corretos para o dia
em que houver um caminho legítimo (por exemplo, um replay da intro disparado
por um gesto do leitor, que teria o gesto exigido pela política).

Ver `src/lib/audio.ts` e `src/hooks/useSingularityIntro.ts`.
