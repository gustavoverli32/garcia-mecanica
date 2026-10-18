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
  const recentes = [...data.ordens].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6);

  const cards = [
    ['Clientes', number.format(data.clientes.length), '#FFC107'],
    ['OS em aberto', number.format(abertas), '#10B981'],
    ['Receitas', receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '#818CF8'],
    ['Despesas', despesa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), '#EF4444'],
  ];

  return (
    <main className="gm-shell">
      <aside className="gm-sidebar">
        <div className="gm-brand"><img src="/icon-192.png" alt="Garcia" /><div><strong>GARCIA</strong><small>AUTO MECÂNICA</small></div></div>
        <p className="gm-caption">AUTO MECÂNICA</p>
        <nav><a className="gm-active" href="/">▦ <span>Dashboard</span></a><a href="/os">⚒ <span>Ordens de Serviço</span><b>{abertas}</b></a><a href="/clientes">♧ <span>Clientes</span></a><a href="/financeiro">↗ <span>Receitas</span></a><a href="/financeiro">↘ <span>Despesas</span></a><a href="/financeiro">▥ <span>Financeiro</span></a><a href="/funcionarios">▣ <span>Funcionários</span></a><a href="/configuracoes">⚙ <span>Configurações</span></a></nav>
      </aside>
      <section className="gm-content">
        <header className="gm-header">
          <div><h1>Dashboard</h1><p>Visão geral da oficina</p></div>
          <div className="gm-actions"><span className={`gm-connection gm-${connection}`}>{labelForConnection(connection)}</span><button className="gm-new" type="button">+ Nova OS</button></div>
        </header>
        <div className="gm-grid">{cards.map(([title, value, color]) => <article className="gm-card" key={title}><span className="gm-card-icon" style={{ color }}>{title === 'Clientes' ? '♟' : title === 'OS em aberto' ? '🔧' : title === 'Receitas' ? '📈' : '📉'}</span><div><small>{title}</small><strong>{value}</strong><em>mês atual</em></div></article>)}</div>
        <div className="gm-main-grid"><article className="gm-panel gm-chart"><div className="gm-panel-head"><div><h2>Receita Mensal</h2><p>Últimos 6 meses</p></div><strong>{number.format(receita)}</strong></div><div className="gm-bars">{['mai','jun','jul','ago','set','out'].map((month, i) => <div className="gm-bar-wrap" key={month}><i className={`gm-bar gm-bar-${i}`} /><small>{month}</small></div>)}</div></article><article className="gm-panel gm-profit"><h2>Lucro do Mês</h2><strong>{(receita - despesa).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><p>receitas − despesas</p><h3>FORMA DE PAGAMENTO</h3><p>PIX <span>100%</span></p><hr /><p>Cartão <span>0%</span></p><hr /><p>Dinheiro <span>0%</span></p><hr /></article></div>
        <article className="gm-panel gm-orders"><div className="gm-panel-head"><h2>OS Recentes</h2><a href="/os">Ver todas →</a></div>{recentes.map((order) => <div className="gm-order" key={String(order.id)}><b>#{order.id}</b><span>{data.clientes.find((client) => String(client.id) === String(order.cliente_id))?.nome ?? 'Cliente'}</span><span>{String(order.veiculo ?? '—')}</span><span>{String(order.servico ?? order.observacoes ?? 'Serviço mecânico')}</span><strong>{Number(order.valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong><em>{order.status ?? 'Aguardando'}</em></div>)}</article>
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
  .gm-sidebar { width: 284px; flex-basis: 284px; padding: 24px 10px 16px; }
  .gm-brand img { width: 48px; height: 48px; border-radius: 12px; } .gm-brand strong { display:block; color:#ffc107; letter-spacing:.16em; font-size:16px; } .gm-brand small { display:block; color:#8e8e8e; letter-spacing:.18em; font-size:9px; margin-top:4px; }
  .gm-sidebar nav a { display:flex; align-items:center; gap:14px; } .gm-sidebar nav a span { font-size:15px; } .gm-sidebar nav a b { margin-left:auto; background:#ff9d00; color:#fff; border-radius:9px; padding:2px 7px; font-size:11px; }
  .gm-header { height:80px; margin:0 -58px 28px; padding:17px 30px; background:#fff; border-bottom:1px solid #e5e5e7; align-items:center; } .gm-header p { margin:3px 0; color:#9ca3af; font-size:13px; } .gm-new { border:0; background:#ffbc05; border-radius:10px; padding:14px 20px; font-weight:800; }
  .gm-content { padding-top:0; } .gm-card { display:flex; align-items:center; gap:14px; } .gm-card-icon { display:grid; place-items:center; width:52px; height:52px; border-radius:14px; background:#f0efff; font-size:22px; } .gm-card small,.gm-card em { display:block; color:#9095a4; font-size:10px; letter-spacing:.12em; font-style:normal; font-weight:700; } .gm-card em { color:#10b981; letter-spacing:0; font-weight:400; } .gm-card strong { margin:5px 0; }
  .gm-main-grid { display:grid; grid-template-columns:minmax(0,2.2fr) minmax(250px,1fr); gap:14px; margin-top:18px; } .gm-panel-head { display:flex; justify-content:space-between; align-items:start; } .gm-panel-head p,.gm-profit>p { margin:4px 0; color:#9ca3af; font-size:12px; } .gm-panel-head>strong { color:#ffb900; font-size:20px; } .gm-bars { height:200px; display:flex; align-items:end; gap:10px; padding-top:28px; } .gm-bar-wrap { height:100%; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:end; gap:8px; } .gm-bar { width:100%; height:42%; border-radius:6px 6px 3px 3px; background:#e5e7eb; } .gm-bar-1{height:36%}.gm-bar-2{height:53%}.gm-bar-3{height:48%}.gm-bar-4{height:62%}.gm-bar-5{height:78%;background:#ffc107}.gm-bar-wrap small{color:#a0a4b0;font-size:11px}.gm-profit>strong{display:block;color:#10b981;font-size:28px;margin-top:10px}.gm-profit h3{color:#8e94a5;font-size:11px;letter-spacing:.12em;margin:28px 0 12px}.gm-profit p span{float:right;color:#a0a4b0}.gm-profit hr{border:0;border-top:6px solid #10b981;border-radius:4px}.gm-profit hr:nth-of-type(n+2){border-color:#eceef1}
  .gm-orders { margin-top:18px; } .gm-panel-head a { color:#f6a900; text-decoration:none; font-size:13px; font-weight:700; } .gm-order { display:grid; grid-template-columns:70px 1.1fr 1fr 3fr 110px 90px; gap:12px; align-items:center; padding:14px 0; border-top:1px solid #f0f0f2; font-size:13px; } .gm-order>b { color:#ffb900; } .gm-order>span:nth-child(3){color:#9ca3af}.gm-order em{background:#e9fbf3;color:#10a876;border-radius:12px;padding:5px 8px;text-align:center;font-style:normal;font-size:11px;font-weight:700}
  @media (max-width:900px) { .gm-header { margin-left:-20px; margin-right:-20px; } .gm-main-grid { grid-template-columns:1fr; } .gm-order { grid-template-columns:55px 1fr 1fr; } .gm-order span:nth-child(4),.gm-order strong,.gm-order em { display:none; } }
`;
