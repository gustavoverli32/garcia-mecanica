# Modo demonstração (teste com dados de exemplo)

O modo demonstração abre a Garcia **exatamente como ela é**, mas com dados
inventados. Ele serve para testar telas e melhorias sem nenhum risco para os dados
reais da oficina.

- Os clientes, OS, receitas e despesas são fictícios (todos com "(exemplo)" no nome).
- O sistema **não se conecta** ao Supabase real.
- Qualquer tentativa de salvar, editar ou excluir é recusada e aparece o aviso
  "modo demonstração, gravações desativadas. Nada foi salvo."
- Uma faixa roxa no topo da tela lembra que você está no modo demonstração.

## Primeira vez (instalação)

1. Instale o **Node.js** (versão 20 ou mais nova): https://nodejs.org (botão "LTS").
2. Instale o **Git**: https://git-scm.com/downloads
3. Abra o **PowerShell** e rode:

```powershell
git clone https://github.com/gustavoverli32/garcia-mecanica.git
cd garcia-mecanica
npm install
```

## Abrir o modo demonstração

Dentro da pasta `garcia-mecanica`, no PowerShell:

```powershell
npm run demo
```

Depois abra no navegador: **http://localhost:3100/**

Entre com a mesma senha do sistema. Para fechar, volte ao PowerShell e aperte
`Ctrl + C`.

Para pegar a versão mais nova do código antes de testar:

```powershell
git pull
npm install
npm run demo
```

## Diferença para `npm run dev`

| Comando | Endereço | Dados |
|---|---|---|
| `npm run demo` | http://localhost:3100/ | Fictícios, nada é salvo |
| `npm run dev` | http://localhost:3000/ | **Reais da oficina**, grava de verdade |

Use `npm run demo` para testar. Use `npm run dev` só quando precisar conferir algo
com os dados reais.

## Observações

- O assistente de IA não é chamado no modo demonstração.
- Algumas telas guardam cópia de despesas e funcionários no próprio navegador. No
  modo demonstração essa cópia fica separada da do sistema real (endereço diferente)
  e pode ser limpa a qualquer momento pelo navegador.
- Os dados de exemplo ficam em `scripts/demo-data.mjs` e podem ser alterados à vontade.

## Assistente de melhorias e acesso de desenvolvedor

- Usuário comum (senha do sistema): abre o botão flutuante e descreve um problema ou sugestão. No modo demonstração a
  "IA" é simulada por palavras-chave e o relato fica só na memória do servidor (some ao reiniciar `npm run demo`).
- Desenvolvedor: clique no ícone discreto no canto inferior direito do cartão de login e use a senha **DEV**. O app entra já com o relatório aberto. A senha DEV vale **só no modo demonstração**;
  em produção o acesso é o usuário admin criado no Supabase Auth (ver `supabase/melhorias_plataforma.sql`).
