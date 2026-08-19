<!--
Título do PR: mesmo formato do commit principal — tipo(escopo): descrição no imperativo.
Ex.: fix(scroll): só re-medir a página quando o leitor tiver parado de rolar
-->

## O que muda

<!-- Uma ou duas frases. O efeito, não a lista de arquivos — isso o diff já mostra. -->

## Por quê

<!--
Causa raiz, não só o sintoma. Se este PR fecha um item de docs/BUGS-ABERTOS.md,
linkar a seção e remover o item de lá no mesmo PR.
-->

## Como validar

<!--
Passos reproduzíveis: comando, rota no site, flag de debug (`?debug=scroll`,
`?dilation=off`), o que observar no `window.__introAudit()` ou equivalente.
Se for visual, uma captura de tela ou GIF antes/depois.
-->

## Checklist

- [ ] `npm run typecheck` passa
- [ ] `npm run lint` passa
- [ ] `npm run build` passa
- [ ] Commits seguem `tipo(escopo): descrição` — ver [`docs/CONTRIBUTING.md`](../docs/CONTRIBUTING.md)
- [ ] Testado com `prefers-reduced-motion: reduce`, se a mudança tocar animação/scroll
- [ ] `docs/ARCHITECTURE.md` ou `docs/BUGS-ABERTOS.md` atualizados, se a mudança alterar uma decisão documentada ou fechar um bug de lá

## Breaking changes

<!-- Só preencher se algum contrato público mudou. Caso contrário, apagar esta seção. -->
