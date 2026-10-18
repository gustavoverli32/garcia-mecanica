# GARCIA MECÂNICA

Plataforma de gestão da oficina Garcia Auto Mecânica.

## Status

Fundação do refatoramento concluída — documentação, validação do bundle e plano de migração publicados.

## Estado atual

O deploy atual é um bundle estático gerado por uma ferramenta visual. A aplicação
fica dentro de `index.html`, no bloco `script[type="__bundler/template"]`, e usa
um runtime de empacotamento no próprio arquivo. O arquivo é publicado diretamente
por GitHub Pages.

Esse formato funciona em produção, mas dificulta manutenção, testes e evolução do
código. O refatoramento será feito em etapas, preservando integralmente os dados,
as integrações existentes com Supabase e a interface visual atual da Garcia.

## Contratos de preservação

- Não alterar registros, tabelas, colunas, políticas RLS ou funções do Supabase.
- Não alterar cores, tipografia, textos, navegação ou layout visível da Garcia.
- Não substituir o bundle de produção até a nova implementação ser validada.
- Toda mudança deve ser reversível e passar por validação antes do deploy.

## Plano de modernização

1. Documentar escopo e decisões do produto.
2. Criar fonte editável e rotina reprodutível de build.
3. Extrair tokens de design e componentes de layout.
4. Separar autenticação, dados, navegação e apresentação.
5. Migrar a interface para o padrão visual do EconGNV, mantendo a identidade da Garcia.

## Fluxo de desenvolvimento

1. Criar uma branch `feature/<nome>` a partir de `main`.
2. Implementar uma entrega pequena e testável.
3. Abrir Pull Request com checklist.
4. Validar preview e fluxo principal.
5. Fazer merge somente após revisão e validação.

## Stack alvo

- Next.js + TypeScript
- Supabase (PostgreSQL, Auth e Row Level Security)
- Vercel (preview e produção)
- GitHub (Issues e Pull Requests)

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

`npm run extract:template` extrai uma cópia de trabalho do template embutido para
`src/legacy/template.html`. Essa cópia é uma etapa de migração e não deve ser
publicada nem editada para alterar o comportamento de produção sem revisão.

## Shell modular

O novo shell Next.js roda em paralelo ao bundle legado:

```powershell
npm install
npm run dev
```

Ele ainda não substitui a produção nem executa gravações no Supabase.

Para habilitar apenas a leitura no ambiente local, copie `.env.example` para
`.env.local` e preencha as credenciais públicas do projeto existente. Nenhuma
operação de escrita é feita por essa camada.

## Dados

As ordens de serviço, clientes, receitas, despesas e funcionários permanecem no
Supabase. Mudanças de interface e infraestrutura devem continuar separadas das
funções de persistência.
