# Template legado

`source/` contém a aplicação Garcia atual separada por áreas de código. O build
concatena essas partes na ordem de `scripts/original-parts.mjs` e reinclui a imagem
de `assets/car-image.base64`. Nenhum wrapper novo é adicionado ao runtime.

`template.html` é a cópia gerada do bloco `__bundler/template` em `index.html`.
Edite os arquivos em `source/`, depois execute:

```powershell
npm run build
npm run check:original
```

As partes JavaScript são fragmentos contíguos da classe `Component`; não devem ser
carregadas individualmente no navegador. A extração inicial só pode ser repetida
após remover manualmente as fontes, para impedir a perda de mudanças futuras.
