# GARCIA MECÂNICA

Plataforma de gestão da oficina Garcia Auto Mecânica.

## Status

O site usado pelo cliente continua sendo o bundle original em `index.html`, publicado em
`https://gustavoverli32.github.io/garcia-mecanica/`. O código desse mesmo bundle foi
separado em partes editáveis em `src/legacy/source/`; o build recompõe a aplicação
sem trocar a interface, as operações ou o projeto Supabase.

## Estado atual

O deploy atual é um bundle estático gerado por uma ferramenta visual. A aplicação
fica dentro de `index.html`, no bloco `script[type="__bundler/template"]`, e usa
um runtime de empacotamento no próprio arquivo. O arquivo é publicado diretamente
por GitHub Pages.

O código separado mantém a ordem, o texto e os recursos originais. A imagem grande
embutida no JavaScript foi colocada em `src/legacy/assets/car-image.base64` para
deixar os métodos legíveis; o build a reinsere sem alterar o resultado.

## Contratos de preservação

- Não alterar registros, tabelas, colunas, políticas RLS ou funções do Supabase.
- Não alterar cores, tipografia, textos, navegação ou layout visível da Garcia.
- Não substituir o bundle de produção até a nova implementação ser validada.
- Toda mudança deve ser reversível e passar por validação antes do deploy.

## Código-fonte e build

Edite as partes em `src/legacy/source/` mantendo a ordem indicada em
`scripts/original-parts.mjs`. Os arquivos `.js` são trechos contíguos da classe
original, concatenados pelo build. `src/legacy/template.html` e `index.html` são
artefatos gerados. Para recompô-los e validar:

```powershell
npm run build
npm run check:original
npm run check:published
npm run validate
```

`scripts/split-original.mjs` serviu somente para a primeira extração e recusa
sobrescrever as partes editáveis. O controle de versão guarda o bundle anterior.

## Fluxo de desenvolvimento

1. Criar uma branch `codex/<nome>` a partir de `main`.
2. Implementar uma entrega pequena e testável.
3. Abrir Pull Request com checklist.
4. Validar preview e fluxo principal.
5. Fazer merge somente após revisão e validação.

## Plataforma em uso

- HTML/JavaScript original com o runtime do exportador.
- Supabase existente, com os mesmos dados e operações.
- GitHub Pages no mesmo endereço público.
- Preview local do próprio `index.html`.

O protótipo em `src/app/` usa Next.js, mas não corresponde ao sistema atual e não
participa do preview padrão nem do build da aplicação usada pelo cliente.

## Documentação

- [Cronograma](CRONOGRAMA.md)
- [Escopo do MVP](docs/ESCOPO-MVP.md)
- [Decisões da Semana 1](docs/DECISOES-SEMANA-1.md)

## Validação local

No PowerShell:

```powershell
./scripts/validate-bundle.ps1
```

O validador verifica a presença dos marcadores obrigatórios do bundle, o manifesto
PWA e o risco de um `</script>` literal quebrar o HTML exportado.

Com Node.js 20 ou superior, também é possível inspecionar o bundle:

```powershell
npm run inspect:bundle
```

`npm run dev` abre a Garcia original em `http://localhost:3000/`:

```powershell
npm run dev
```

O preview executa a aplicação original; ações nela têm os mesmos efeitos no
Supabase que no endereço público. Para consultar sem alterar dados, navegue pelas
telas sem salvar, excluir ou concluir registros.

## Dados

As ordens de serviço, clientes, receitas, despesas e funcionários permanecem no
Supabase. Mudanças de interface e infraestrutura devem continuar separadas das
funções de persistência.
