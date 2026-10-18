# Cronograma

> Atualização: o protótipo Next.js listado abaixo foi produzido antes da correção
> de escopo e não reproduz a Garcia atual. O trabalho ativo usa o código original
> em `src/legacy/source/`, com o mesmo bundle, visual e endereço GitHub Pages.
> O preview padrão agora serve essa aplicação original. As caixas abaixo registram
> o histórico do protótipo e não significam aprovação para substituir o site.

## Semana 1 — Fundação

- [x] Identificar o repositório e preservar o bundle atual.
- [x] Documentar a arquitetura existente.
- [x] Criar validação automatizada do bundle.
- [x] Definir stack e fluxo de migração.
- [x] Criar scripts de inspeção e extração da fonte embutida.
- [x] Criar contratos TypeScript somente leitura para os dados existentes.
- [x] Criar shell Next.js paralelo e validar typecheck/build.
- [x] Criar primeira tela modular de Clientes em modo somente leitura.
- [x] Criar primeira tela modular de Ordens de Serviço em modo somente leitura.
- [x] Criar área modular de Receitas e Despesas em modo somente leitura.
- [x] Criar telas modulares de Funcionários e Configurações em modo somente leitura.
- [x] Automatizar typecheck, build e proteção da camada somente leitura.
- [x] Auditar autenticação legada sem reproduzir senha fixa na nova aplicação.
- [x] Criar tela de login modular usando Supabase Auth, ainda não ativada como guarda global.
- [x] Adicionar sessão SSR por cookies e proteção das rotas modulares.
- [x] Adicionar encerramento seguro da sessão modular.
- [x] Criar adaptador de escritas protegido por Supabase Auth, ainda isolado das telas.

## Semana 2 — Fonte editável

- [ ] Criar aplicação Next.js + TypeScript sem alterar o bundle de produção.
- [ ] Definir tokens de design da Garcia a partir do padrão EconGNV.
- [ ] Montar layout base responsivo.
- [ ] Configurar ambiente Supabase sem alterar tabelas existentes.

## Semana 3 — Operação principal

- [ ] Migrar autenticação.
- [ ] Migrar clientes, veículos e ordens de serviço.
- [ ] Cobrir fluxos com testes de fumaça.

## Semana 4 — Financeiro e publicação

- [ ] Migrar receitas, despesas e funcionários.
- [ ] Configurar preview na Vercel.
- [ ] Validar produção e manter rollback do bundle antigo.
