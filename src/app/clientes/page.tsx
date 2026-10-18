import { createReadRepositoryFromEnv } from '../../data/create-read-repository';
import type { Cliente } from '../../domain/entities';

export default async function ClientesPage() {
  let clientes: Cliente[] = [];
  let status: 'online' | 'unavailable' | 'not-configured' = 'not-configured';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      clientes = await createReadRepositoryFromEnv().loadSnapshot().then((snapshot) => snapshot.clientes);
      status = 'online';
    } catch {
      status = 'unavailable';
    }
  }

  return <ClientesView clientes={clientes} status={status} />;
}

function ClientesView({ clientes, status }: { clientes: Cliente[]; status: string }) {
  return (
    <main className="clientes-page">
      <header className="clientes-header">
        <div><a href="/" className="back">← Dashboard</a><p className="eyebrow">CADASTRO OPERACIONAL</p><h1>Clientes</h1><p className="sub">{clientes.length} cadastrados · modo somente leitura</p></div>
        <span className={`status status-${status}`}>{status === 'online' ? '● Online' : '○ Sem conexão'}</span>
      </header>
      <section className="table-card">
        <div className="table-head"><span>Nome</span><span>Telefone</span><span>E-mail</span></div>
        {clientes.length === 0 ? <div className="empty">Nenhum cliente carregado. Configure o ambiente ou confirme o acesso de leitura.</div> : clientes.map((cliente) => <div className="table-row" key={String(cliente.id)}><strong>{cliente.nome}</strong><span>{cliente.telefone || '—'}</span><span>{cliente.email || '—'}</span></div>)}
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
  * { box-sizing: border-box; } body { margin: 0; background: #f4f4f5; color: #111827; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
  .clientes-page { min-height: 100vh; max-width: 1180px; margin: auto; padding: 34px clamp(20px, 5vw, 58px); }
  .clientes-header { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:28px; } .back { color:#6b7280; font-size:12px; text-decoration:none; } .eyebrow { color:#9ca3af; font-size:10px; letter-spacing:.14em; font-weight:700; margin:24px 0 6px; } h1 { margin:0; font-size:30px; } .sub { color:#6b7280; font-size:13px; margin-top:8px; } .status { font-size:11px; font-weight:700; } .status-online { color:#10b981; } .status-unavailable, .status-not-configured { color:#f59e0b; }
  .table-card { overflow:hidden; background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.07); } .table-head, .table-row { display:grid; grid-template-columns:1.2fr 1fr 1.4fr; gap:18px; padding:15px 20px; align-items:center; } .table-head { background:#fafafa; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; } .table-row { border-top:1px solid #f0f0f0; font-size:13px; } .table-row span { color:#6b7280; } .empty { padding:40px 20px; text-align:center; color:#9ca3af; font-size:13px; }
  @media (max-width:700px) { .table-head { display:none; } .table-row { grid-template-columns:1fr; gap:5px; } }
`;
