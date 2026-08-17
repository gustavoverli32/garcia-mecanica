# Como reverter, se algo der errado

## Antes de tudo: os dados do cliente não correm risco aqui

Os dados da oficina — ordens de serviço, clientes, faturamentos, despesas, funcionários —
**ficam no Supabase, não neste repositório**. Nenhuma alteração no `index.html` apaga registro.

O único jeito de o código causar perda de dado seria quebrar uma função de gravação. Por isso
**nenhuma função que escreve no Supabase foi tocada** nesta alteração. Todas as mudanças são de
apresentação. As seguintes funções foram verificadas byte a byte como idênticas ao original:

`_saveOS` · `_saveCli` · `_saveRec` · `_saveDep` · `_salvarEdicaoOS` · `_confirmarPagamento` ·
`_saveFunc` · `_salvarServico` · `_saveFPags` · `_salvarEdicaoCliente` · `_salvarEdicaoFunc` ·
`_salvarPagFunc` · `_load` · `_init`

## O checkpoint

A tag `checkpoint-pre-ux` marca o commit `aa87a77` — o estado que estava rodando em produção
antes desta alteração.

## Reverter em 30 segundos

Se o app apresentar qualquer problema depois de publicado:

```bash
git checkout main
git checkout checkpoint-pre-ux -- index.html
git commit -m "Reverte para o checkpoint pre-UX"
git push
```

O GitHub Pages republica em cerca de um minuto. Peça para quem estiver usando **recarregar a
página** — o service worker (`sw.js`) já está configurado para nunca servir o HTML do cache,
então a versão nova chega na primeira recarga.

## Reverter pelo site do GitHub, sem terminal

1. Abra o repositório → aba **Commits**
2. Encontre o commit da revisão de UX
3. Clique em **Revert** e confirme

## Backup dos dados (isto é com você)

Independente desta alteração, vale ter um backup do banco. No painel do Supabase:

- **Database → Backups**, se o projeto for Pro — os backups diários já existem ali
- No plano gratuito, use **Table Editor → Export to CSV** nas tabelas `ordens`, `clientes`,
  `faturamentos`, `despesas`, `funcionarios`
- Ou `pg_dump` com a connection string, se preferir linha de comando

Faça isso **antes de fazer o merge**, por precaução geral — não porque esta alteração ofereça
risco ao banco.

## Aviso importante sobre futuras edições

Este `index.html` é um **bundle exportado do Claude Design**. A aplicação de verdade vive
codificada como JSON na linha 421, dentro de `<script type="__bundler/template">`.

Consequência prática: **se você reeditar o projeto na ferramenta de design e exportar de novo,
estas melhorias são sobrescritas.** Elas estão aplicadas diretamente no bundle, não no projeto
de origem.

Se pretende continuar editando pela ferramenta, aplique as mesmas mudanças lá antes de exportar.
O diff desta branch mostra exatamente o que foi alterado.

## Detalhe técnico, para quem for mexer no bundle

Ao recodificar a linha 421, **toda barra `/` precisa virar `/`**. Sem esse escape, um
`</script>` literal aparece dentro da tag `<script>` e o navegador fecha a tag antes da hora,
quebrando a página inteira. Os scripts usados nesta alteração fazem isso e recusam gravar se
detectarem `</script` no resultado.
