# Segurança da migração

## Achado atual

O bundle legado contém autenticação local com senha fixa e sessão em
`localStorage`. Esse comportamento não será reproduzido na aplicação modular.

## Decisão

A nova aplicação deverá usar sessão do Supabase Auth, com cookies seguros e
validação no servidor. A migração da autenticação só será ativada depois de:

- confirmar o provedor de login atual;
- validar as políticas RLS existentes;
- testar login, logout e expiração de sessão;
- confirmar que usuários atuais continuam acessando o sistema;
- manter o bundle legado como rollback.

Até lá, as rotas modulares são uma camada de validação e não substituem a
autenticação de produção.

## Implementação inicial

A rota `/login` usa `signInWithPassword` do Supabase Auth e não grava credenciais
no `localStorage`. Quando as variáveis públicas estão configuradas, o middleware
protege as rotas modulares e redireciona usuários sem sessão para `/login`.
O bundle legado continua fora desse middleware.

O Dashboard modular também oferece logout pelo Supabase Auth. O logout encerra
somente a sessão da nova camada; não altera dados operacionais.

## Dados

Nenhuma consulta ou alteração de schema foi feita como parte deste registro.
