# Validação visual e testes — etapas 3 e 4

> Registro histórico do protótipo Next.js, anterior à correção de escopo. Os
> resultados abaixo não demonstram equivalência visual com a Garcia publicada.
> Para a versão atual, o build original passa em `npm run check:original` e
> `npm run check:published`. A validação interativa atual está registrada abaixo.

## Validação do bundle original — branch `codex/preserve-original-ui`

Em 18/10/2026, o preview já aberto em `http://localhost:3000/` foi comparado
com a aba existente do endereço público. Não houve recarga de página nem
acionamento de botões de salvar, excluir, concluir OS ou analisar IA.

- Dashboard: os totais, indicadores, menu, cards, gráfico, tabela e
  recomendações coincidiram nas duas abas. Os viewports observados tinham
  larguras diferentes; esta não foi uma comparação pixel a pixel.
- Navegação em leitura: Ordens de Serviço, Clientes, Receitas, Despesas,
  Financeiro, Funcionários e Configurações abriram com títulos e dados esperados.
- Interações sem escrita: filtro de OS e retorno a Todos, busca vazia de cliente,
  histórico de cliente e abertura/fechamento dos formulários Nova OS, Novo
  Cliente, Nova Receita, Nova Despesa e Novo Funcionário.
- Console do preview: nenhum erro registrado durante a navegação.
- Consulta SQL somente leitura após o teste: as contagens das cinco tabelas
  operacionais permaneceram iguais às levantadas antes do teste.

Limites: gravação, exclusão, login/logout e análise de IA não foram testados,
pois poderiam alterar registros ou a sessão. A tentativa de aplicar viewport
de 390 px no navegador interno manteve a largura real em 946 px; o breakpoint
mobile continua sem validação interativa nesta rodada.

## Escopo

Validação feita no clone oficial do GitHub, sem alteração de identidade visual, layout ou dados do Supabase.

## Matriz visual

| Rota | Resultado | Observação |
|---|---|---|
| `/` | OK | Painel, navegação lateral, cartões e estado de conexão renderizados. |
| `/os` | OK | Tela operacional em modo somente leitura. |
| `/clientes` | OK | Lista em modo somente leitura. |
| `/financeiro` | OK | Receitas e despesas separadas, sem ações destrutivas. |
| `/funcionarios` | OK | Lista em modo somente leitura. |
| `/configuracoes` | OK | Status da migração e autenticação modular exibidos. |
| `/login` | OK | Formulário de autenticação separado. |

Viewport validado: navegador local, aproximadamente 710×715 px. A validação preserva a paleta, a navegação e a hierarquia visual existentes; não houve mudança de CSS ou de dados.

## Testes automatizados

`npm test` cobre a camada somente leitura, autenticação obrigatória das escritas futuras, existência das rotas, middleware e destinos de navegação. A validação completa também executa `typecheck`, `verify:readonly`, `verify:template`, `validate` e `build`.
