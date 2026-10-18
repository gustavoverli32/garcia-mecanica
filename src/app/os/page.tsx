import { createReadRepositoryFromEnv } from '../../data/create-read-repository';
import type { OrdemServico } from '../../domain/entities';

export default async function OrdensPage() {
  let ordens: OrdemServico[] = [];
  let status: 'online' | 'unavailable' | 'not-configured' = 'not-configured';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      ordens = await createReadRepositoryFromEnv().loadSnapshot().then((snapshot) => snapshot.ordens);
      status = 'online';
    } catch {
      status = 'unavailable';
    }
  }

  return <OrdensView ordens={ordens} status={status} />;
}

function clientName(ordem: OrdemServico): string {
  const nested = ordem.clientes;
  if (nested && typeof nested === 'object' && 'nome' in nested) return String(nested.nome);
  return ordem.cliente_id ? `Cliente #${ordem.cliente_id}` : 'Sem cliente';
}

function OrdensView({ ordens, status }: { ordens: OrdemServico[]; status: string }) {
  return (
    <main className="os-page">
      <header className="os-header">
        <div><a href="/" className="back">← Dashboard</a><p className="eyebrow">OPERAÇÃO DA OFICINA</p><h1>Ordens de Serviço</h1><p className="sub">{ordens.length} registros · modo somente leitura</p></div>
        <span className={`status status-${status}`}>{status === 'online' ? '● Online' : '○ Sem conexão'}</span>
      </header>
      <section className="os-card">
        <div className="os-head"><span>Cliente</span><span>Status</span><span>Valor</span><span>ID</span></div>
        {ordens.length === 0 ? <div className="empty">Nenhuma ordem carregada. Configure o ambiente ou confirme o acesso de leitura.</div> : ordens.map((ordem) => <div className="os-row" key={String(ordem.id)}><strong>{clientName(ordem)}</strong><span className="pill">{ordem.status || 'Sem status'}</span><span>{ordem.valor == null ? '—' : Number(ordem.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span><span>#{ordem.id}</span></div>)}
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; } body { margin: 0; background: #f4f4f5; color: #111827; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .os-page { min-height: 100vh; max-width: 1180px; margin: auto; padding: 34px clamp(20px, 5vw, 58px); } .os-header { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:28px; } .back { color:#6b7280; font-size:12px; text-decoration:none; } .eyebrow { color:#9ca3af; font-size:10px; letter-spacing:.14em; font-weight:700; margin:24px 0 6px; } h1 { margin:0; font-size:30px; } .sub { color:#6b7280; font-size:13px; margin-top:8px; } .status { font-size:11px; font-weight:700; } .status-online { color:#10b981; } .status-unavailable, .status-not-configured { color:#f59e0b; }
  .os-card { overflow:hidden; background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.07); } .os-head, .os-row { display:grid; grid-template-columns:1.5fr 1fr 1fr .6fr; gap:18px; padding:15px 20px; align-items:center; } .os-head { background:#fafafa; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; } .os-row { border-top:1px solid #f0f0f0; font-size:13px; } .os-row span:not(.pill) { color:#6b7280; } .pill { width:max-content; padding:5px 9px; border-radius:99px; background:#fff8df; color:#a16207; font-size:11px; font-weight:700; } .empty { padding:40px 20px; text-align:center; color:#9ca3af; font-size:13px; }
  @media (max-width:700px) { .os-head { display:none; } .os-row { grid-template-columns:1fr; gap:6px; } }
`;
