# Etapas 5, 6 e 7

> Histórico do protótipo Next.js. Essas etapas não equivalem à aprovação do
> visual da Garcia atual. O fluxo ativo usa o bundle original e o preview padrão
> passou a servir o `index.html` publicado.

## Etapa 5 — Tokens de design

Tokens da identidade atual foram documentados para permitir futuras alterações controladas, sem aplicar redesign.

## Etapa 6 — Layout responsivo

O shell existente foi validado nos pontos compacto e amplo: sidebar reduzida abaixo de 800px e grade de cartões em duas colunas no modo compacto. Nenhum estilo visual foi alterado nesta etapa.

## Etapa 7 — Ambiente Supabase

Foi adicionado um contrato de validação que aceita somente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no frontend e rejeita chaves secretas. Nenhuma tabela, política, função ou registro foi alterado.
