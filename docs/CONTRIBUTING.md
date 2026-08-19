# Contribuindo

Como este repositório nomeia commits e branches, e como o GitHub está
organizado em volta disso. Não é estilo por preferência: commits pesquisáveis
por tipo e escopo são o que torna `git log --grep` e `git bisect` úteis num
projeto que já tem bugs intermitentes documentados em
[`BUGS-ABERTOS.md`](BUGS-ABERTOS.md).

---

## Commits

Formato [Conventional Commits](https://www.conventionalcommits.org/), em
português:

```
tipo(escopo): descrição no imperativo, minúscula, sem ponto final
```

- **tipo** — o que o commit faz, não onde. Ver tabela abaixo.
- **escopo** — a área afetada, em kebab-case: o nome de um componente, hook,
  seção ou domínio (`scroll`, `hud`, `work`, `contact`, `deps`, `build`).
  Opcional só quando a mudança é transversal e não tem um dono só.
- **descrição** — imperativo (`corrigir`, não `corrigido` nem `corrige`),
  minúscula, sem ponto final. Diz o efeito, não o mecanismo — o mecanismo vai
  no corpo.

### Tipos

| Tipo | Quando usar | Exemplo real do histórico |
| --- | --- | --- |
| `feat` | Comportamento novo, visível para quem usa o site | `feat(intro): ligar o whoosh à absorção e à expulsão, e dar dono ao dispose` |
| `fix` | Corrige um comportamento errado | `fix(scroll): só re-medir a página quando o leitor tiver parado de rolar` |
| `perf` | Mesmo comportamento, mais rápido ou mais leve | `perf(build): tirar os 806kB do Three.js do primeiro paint` |
| `refactor` | Mesmo comportamento, código diferente | `refactor(scroll): separar os hooks do provider e zerar os warnings de lint` |
| `docs` | Só documentação (`README.md`, `docs/`, comentários) | `docs: registrar os bugs em aberto com a instrumentação para retomá-los` |
| `chore` | Dependências, config, tooling — nada de código de produto | `chore(deps): ressincronizar o lockfile para destravar o npm ci` |
| `test` | Testes, quando existirem | — |
| `ci` | `.github/workflows/`, pipeline | — |
| `style` | Formatação pura, sem mudança de lógica (raro — Prettier já cobre isso) | — |

### Corpo do commit

Obrigatório quando a causa não é óbvia a partir do diff — a mesma régua usada
em [`ARCHITECTURE.md`](ARCHITECTURE.md) e em `BUGS-ABERTOS.md`: registrar a
causa raiz, não só o sintoma corrigido. Um commit como
`fix(hud): desacoplar a distância até o horizonte da altura viva do documento`
sem corpo obriga quem ler daqui a um ano a reconstruir o raciocínio do zero.

```
fix(scroll): só re-medir a página quando o leitor tiver parado de rolar

O refresh do ScrollTrigger soltava a re-medição represada dentro do
onLeave do pin do WORK, no meio do gesto — reintroduzindo o salto de Rs
que o gate existia para evitar. A liberação virou uma condição (janela
de silêncio sem movimento) em vez de um evento.
```

### Breaking changes

Ainda não aconteceu neste repositório, mas se um commit mudar um contrato
público (por exemplo, a assinatura de algo exportado de `src/lib/`), marcar
com `!` depois do tipo/escopo e explicar no rodapé:

```
refactor(gravity-field)!: trocar a assinatura de subscribe() para (cb) => unsubscribe

BREAKING CHANGE: consumidores que guardavam o id de assinatura para
cancelar precisam guardar a função de retorno em vez disso.
```

### Trailers

Sem trailer de co-autoria de ferramenta nos commits — decisão já tomada em
`chore(git): parar de anexar trailer de co-autoria aos commits`. `Fixes #N` /
`Closes #N` são bem-vindos quando o commit fecha uma issue do GitHub.

---

## Branches

`main` é o trunk: todo PR mira nela. Nome de branch usa o mesmo vocabulário
dos tipos de commit acima:

```
tipo/slug-curto-em-kebab-case
```

- **tipo** — o mesmo da tabela de commits: `feat`, `fix`, `docs`, `chore`,
  `refactor`, `perf`, `test`, `ci`. Uma branch mistura tipos internamente com
  frequência (ex.: um `fix` que carrega um `docs` junto); o prefixo reflete a
  intenção dominante, não uma regra de que só um tipo de commit pode entrar.
- **slug** — 2 a 5 palavras descrevendo *o quê*, não o número de uma tarefa
  externa (`fix/scroll-hud-stutter`, não `fix/JIRA-482`).

Branches abertas por agentes (`claude/...`, nomes gerados automaticamente)
são renomeadas para esse padrão antes do PR — é o que faz a branch dizer o
que ela faz só de aparecer em `git branch -a`.

`develop` existe no remoto mas não faz parte do fluxo ativo: os merges reais
vão direto de branches de feature para `main` (ver `git log --merges`). Não
abrir PR contra `develop` a menos que isso mude deliberadamente.

---

## Estrutura no GitHub

| Onde | O que é |
| --- | --- |
| `main` | Trunk. Todo PR mira aqui; CI roda em cada push e em cada PR. |
| `.github/workflows/ci.yml` | Typecheck (`tsc --noEmit`), lint (ESLint) e build (`vite build`) — os três têm que passar antes do merge. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Preenchido ao abrir PR — ver seção abaixo. |
| `docs/ARCHITECTURE.md` | Decisões técnicas e as descobertas caras por trás delas. |
| `docs/BUGS-ABERTOS.md` | Defeitos conhecidos, não corrigidos, com a instrumentação para reproduzi-los. |
| `docs/CONTRIBUTING.md` | Este arquivo. |

Merges usam commit de merge (não squash) — o histórico granular por tipo e
escopo é o que faz `git log --oneline --grep '^fix'` funcionar como changelog
depois. Não fazer squash de PRs com commits já bem separados.

Bugs conhecidos e reproduzíveis vivem em `docs/BUGS-ABERTOS.md`, junto da
instrumentação para investigá-los — não em Issues do GitHub. Um commit que
fecha um item de lá deve remover a seção correspondente no mesmo PR.

---

## Antes de abrir o PR

```bash
npm run typecheck
npm run lint
npm run build
```

Os três são o que a CI roda; rodar local evita um ciclo de vermelho–correção
só para descobrir o que `ci.yml` já teria dito.
