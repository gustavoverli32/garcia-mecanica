# Template legado

`template.html` é a fonte extraída do bloco `__bundler/template` presente em
`index.html`. Ele representa o comportamento atual da Garcia Mecânica e existe
para permitir a migração gradual para módulos editáveis.

Não altere este arquivo diretamente para corrigir funcionalidades. Primeiro
extraia novamente com:

```powershell
npm run extract:template
```

Depois de qualquer alteração no bundle, execute:

```powershell
npm run verify:template
```

Este arquivo não é um novo deploy e não altera dados do Supabase.
