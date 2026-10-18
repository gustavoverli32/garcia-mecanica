# Validação visual e testes — etapas 3 e 4

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
