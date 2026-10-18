# Decisões da Semana 1

## D1 — Migração incremental

O bundle atual continuará como fallback até que a nova aplicação cubra os fluxos
críticos. A primeira entrega não altera as operações de persistência do Supabase.

## D2 — Stack alvo

Decisão revista: a Garcia original é a base da refatoração. O formato de código
do EconGNV pode orientar a organização interna, mas a plataforma e o link atuais
continuam em GitHub Pages. O protótipo Next.js permanece separado e não substitui
o sistema usado pelo cliente.

## D3 — Identidade visual

O visual atual da Garcia é a referência exata. Cores, textos, logo, layout,
navegação e comportamento devem permanecer iguais.

## D4 — Fonte da verdade

Durante a transição, o bundle exportado permanece o artefato de produção. A nova
fonte editável será promovida somente após validação dos fluxos operacionais.

## D5 — Dados protegidos

Os dados existentes no Supabase são críticos e não serão migrados, reformatados,
apagados ou sobrescritos. A nova camada de código deverá consumir o schema atual
de forma compatível. Qualquer mudança estrutural futura exigirá uma solicitação
separada, backup e aprovação explícita.

## D6 — Visual preservado

O refatoramento não é um redesign. A interface atual da Garcia Mecânica será
preservada; a modernização ficará restrita à organização interna, tipagem, testes,
build, performance e manutenção do código.

## D7 — Primeiro adaptador somente leitura

A nova camada recebeu um adaptador de leitura com o cliente Supabase injetado.
Ele consulta apenas as tabelas existentes e não possui métodos de escrita. As
gravações continuam exclusivamente no bundle legado até que cada fluxo tenha
testes, revisão e aprovação explícita.
