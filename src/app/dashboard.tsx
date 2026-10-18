import type { GarciaDataSnapshot } from '../domain/entities';
import { LogoutButton } from './logout-button';

type Props = {
  snapshot: GarciaDataSnapshot | null;
  connection: 'online' | 'not-configured' | 'unavailable';
};

const number = new Intl.NumberFormat('pt-BR');

function labelForConnection(connection: Props['connection']): string {
  if (connection === 'online') return '● Online — leitura ativa';
  if (connection === 'unavailable') return '○ Supabase indisponível';
  return '○ Configure o ambiente';
}

export function Dashboard({ snapshot, connection }: Props) {
  const data = snapshot ?? { clientes: [], ordens: [], faturamentos: [], despesas: [], funcionarios: [] };
  const abertas = data.ordens.filter((ordem) => ordem.status !== 'Concluída').length;
  const receita = data.faturamentos.reduce((sum, item) => sum + Number(item.valor ?? 0), 0);
  const despesa = data.despesas.reduce((sum, item) => sum + Number(item.valor ?? 0), 0);

  const cards = [
    ['Clientes', number.format(data.clientes.length), '#FFC107'],
    ['OS em aberto', number.format(abertas), '#10B981'],
    ['Receitas', receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '#818CF8'],
    ['Despesas', despesa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '#EF4444'],
  ];

  return (
    <main className="gm-shell">
      <aside className="gm-sidebar">
        <div className="gm-brand"><span className="gm-mark">G</span><span>GARCIA</span></div>
        <p className="gm-caption">AUTO MECÂNICA</p>
        <nav><a className="gm-active" href="/">Dashboard</a><a href="/os">Ordens de Serviço</a><a href="/clientes">Clientes</a><a href="/financeiro">Receitas</a><a href="/financeiro">Despesas</a><a href="/funcionarios">Funcionários</a><a href="/configuracoes">Configurações</a></nav>
      </aside>
      <section className="gm-content">
        <header className="gm-header">
          <div><p className="gm-kicker">VISÃO GERAL DA OFICINA</p><h1>Dashboard</h1></div>
          <div className="gm-actions"><span className={`gm-connection gm-${connection}`}>{labelForConnection(connection)}</span><LogoutButton /></div>
        </header>
        <div className="gm-grid">{cards.map(([title, value, color]) => <article className="gm-card" key={title}><span style={{ color }}>{title}</span><strong>{value}</strong></article>)}</div>
        <article className="gm-panel"><p className="gm-kicker">MIGRAÇÃO SEGURA</p><h2>Modo somente leitura</h2><p>Esta tela usa os dados existentes sem executar gravações. O sistema legado continua preservado para a operação da oficina.</p></article>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #f4f4f5; color: #111827; }
  .gm-shell { min-height: 100vh; display: flex; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .gm-sidebar { width: 230px; flex: 0 0 230px; padding: 28px 18px; background: #171717; color: #fff; }
  .gm-brand { display: flex; align-items: center; gap: 10px; font-weight: 800; letter-spacing: .08em; }
  .gm-mark { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 9px; background: #ffc107; color: #111; }
  .gm-caption, .gm-kicker { color: #9ca3af; font-size: 10px; letter-spacing: .14em; font-weight: 700; }
  .gm-caption { margin: 8px 0 38px 44px; }
  nav { display: grid; gap: 6px; } nav a { padding: 12px; border-radius: 8px; color: #a1a1aa; font-size: 13px; } nav .gm-active { color: #ffc107; background: rgba(255,193,7,.1); border-left: 3px solid #ffc107; }
  .gm-content { width: min(100%, 1180px); padding: 34px clamp(20px, 5vw, 58px); }
  .gm-header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 28px; } h1 { margin: 6px 0 0; font-size: 30px; } .gm-connection { font-size: 11px; font-weight: 700; } .gm-online { color: #10b981; } .gm-not-configured, .gm-unavailable { color: #f59e0b; }
  .gm-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; } .gm-card, .gm-panel { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.07); } .gm-card { padding: 20px; } .gm-card span { display: block; font-size: 11px; font-weight: 700; } .gm-card strong { display: block; margin-top: 12px; font-size: 23px; }
  .gm-panel { margin-top: 20px; padding: 24px; } .gm-panel h2 { margin: 8px 0; font-size: 18px; } .gm-panel p:last-child { color: #6b7280; line-height: 1.6; font-size: 13px; }
  .gm-actions { display:flex; align-items:center; gap:14px; } .logout-button { border:1px solid #e5e7eb; background:#fff; color:#374151; border-radius:7px; padding:7px 11px; font-size:11px; font-weight:700; cursor:pointer; } .logout-button:disabled { opacity:.6; }
  @media (max-width: 800px) { .gm-sidebar { width: 76px; flex-basis: 76px; padding: 20px 10px; } .gm-brand span:last-child, .gm-caption, nav a { font-size: 0; } .gm-brand { justify-content: center; } .gm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;
