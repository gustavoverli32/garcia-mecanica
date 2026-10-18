# Dados

`SupabaseReadRepository` é a primeira integração da nova camada modular com o
Supabase. Ele é deliberadamente somente leitura: não contém métodos de inserção,
edição ou exclusão.

O cliente real do `@supabase/supabase-js` será injetado pela aplicação quando a
estrutura Next.js for criada. Essa separação permite testar o domínio com um
cliente falso sem acessar ou modificar o banco de produção.

As credenciais são lidas de `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Chaves `service_role` e secretas nunca devem ser
usadas no frontend.

## Escritas protegidas

`SupabaseWriteRepository` exige uma sessão válida do Supabase Auth antes de cada
gravação. A primeira versão não expõe exclusão de registros e ainda não está
ligada às telas, permitindo revisão dos payloads antes da ativação operacional.
