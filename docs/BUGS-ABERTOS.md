# Bugs em aberto

Defeitos conhecidos que **não** foram corrigidos, com o motivo de cada um
seguir aberto e o que seria preciso para fechá-lo. A lista existe para que um
bug intermitente não seja redescoberto do zero daqui a três meses.

Um bug só entra aqui quando a instrumentação necessária para investigá-lo já
está no código. Anotar um sintoma sem deixar como capturá-lo é adiar o mesmo
trabalho.

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

## 2. `scrollGuard` nunca reporta engajamento

**Sintoma.** `__introAudit().scrollGuard.corrections` fica em 0 em todas as
sessões observadas, inclusive nas que recarregam de seções internas — onde a
guarda deveria ter trabalho a fazer.

**Duas leituras possíveis, e nada que as separe ainda.** Ou a restauração
nativa de scroll está de fato desligada com sucesso (`scrollRestoration =
'manual'`, inline e síncrono no `<head>`) e a guarda é redundante na prática;
ou o contador não está sendo incrementado no caminho que realmente executa, e a
guarda está silenciosamente inerte — o que faria dela zero proteção contra o
bug 1 acima.

A segunda leitura é a preocupante, e é a que torna este item mais do que
cosmético: os dois bugs podem ser o mesmo.

**O que seria preciso.** Um teste que force uma restauração de scroll —
navegar para fora e voltar pelo histórico, com `scrollRestoration` reposto para
`'auto'` à força — e confirmar que o contador sobe. Se não subir com a
restauração ligada de propósito, o contador está morto e é isso que precisa ser
corrigido antes de qualquer coisa.

---

## 3. Whoosh da intro é inaudível na prática

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
