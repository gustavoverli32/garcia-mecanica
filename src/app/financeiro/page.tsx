import { createReadRepositoryFromEnv } from '../../data/create-read-repository';
import type { Despesa, Faturamento } from '../../domain/entities';

export default async function FinanceiroPage() {
  let receitas: Faturamento[] = [];
  let despesas: Despesa[] = [];
  let status: 'online' | 'unavailable' | 'not-configured' = 'not-configured';

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const snapshot = await createReadRepositoryFromEnv().loadSnapshot();
      receitas = snapshot.faturamentos;
      despesas = snapshot.despesas;
      status = 'online';
    } catch {
      status = 'unavailable';
    }
  }

  return <FinanceiroView receitas={receitas} despesas={despesas} status={status} />;
}

function FinanceiroView({ receitas, despesas, status }: { receitas: Faturamento[]; despesas: Despesa[]; status: string }) {
  const totalReceitas = receitas.reduce((sum, item) => sum + Number(item.valor ?? 0), 0);
  const totalDespesas = despesas.reduce((sum, item) => sum + Number(item.valor ?? 0), 0);
  const saldo = totalReceitas - totalDespesas;
  const money = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return <main className="finance-page">
    <header className="finance-header"><div><a href="/" className="back">← Dashboard</a><p className="eyebrow">CONTROLE FINANCEIRO</p><h1>Financeiro</h1><p className="sub">Receitas e despesas · modo somente leitura</p></div><span className={`status status-${status}`}>{status === 'online' ? '● Online' : '○ Sem conexão'}</span></header>
    <section className="finance-cards"><article><span>Receitas</span><strong>{money(totalReceitas)}</strong></article><article><span>Despesas</span><strong>{money(totalDespesas)}</strong></article><article><span>Saldo calculado</span><strong className={saldo >= 0 ? 'positive' : 'negative'}>{money(saldo)}</strong></article></section>
    <section className="columns"><article className="table-card"><h2>Últimas receitas</h2><div className="row head"><span>Data</span><span>Valor</span><span>Forma</span></div>{receitas.length ? receitas.slice(0, 12).map((item) => <div className="row" key={String(item.id)}><span>{item.data || '—'}</span><strong>{money(Number(item.valor ?? 0))}</strong><span>{item.forma || '—'}</span></div>) : <div className="empty">Nenhuma receita carregada.</div>}</article><article className="table-card"><h2>Últimas despesas</h2><div className="row head"><span>Data</span><span>Descrição</span><span>Valor</span></div>{despesas.length ? despesas.slice(0, 12).map((item) => <div className="row" key={String(item.id)}><span>{item.data || '—'}</span><span>{item.descricao || '—'}</span><strong>{money(Number(item.valor ?? 0))}</strong></div>) : <div className="empty">Nenhuma despesa carregada.</div>}</article></section>
    <style>{styles}</style>
  </main>;
}

const styles = `
  * { box-sizing:border-box; } body { margin:0; background:#f4f4f5; color:#111827; font-family:Inter,ui-sans-serif,system-ui,sans-serif; } .finance-page { min-height:100vh; max-width:1200px; margin:auto; padding:34px clamp(20px,5vw,58px); } .finance-header { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; margin-bottom:28px; } .back { color:#6b7280; font-size:12px; text-decoration:none; } .eyebrow { color:#9ca3af; font-size:10px; letter-spacing:.14em; font-weight:700; margin:24px 0 6px; } h1 { margin:0; font-size:30px; } h2 { font-size:15px; margin:0 0 18px; } .sub { color:#6b7280; font-size:13px; margin-top:8px; } .status { font-size:11px; font-weight:700; } .status-online { color:#10b981; } .status-unavailable,.status-not-configured { color:#f59e0b; } .finance-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; } .finance-cards article,.table-card { background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.07); } .finance-cards article { padding:20px; } .finance-cards span { color:#6b7280; font-size:11px; font-weight:700; } .finance-cards strong { display:block; margin-top:12px; font-size:22px; } .positive { color:#10b981; } .negative { color:#ef4444; } .columns { display:grid; grid-template-columns:1fr 1fr; gap:20px; } .table-card { padding:20px; overflow:hidden; } .row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; align-items:center; padding:12px 0; border-top:1px solid #f0f0f0; font-size:12px; } .row span { color:#6b7280; } .row.head { border-top:0; padding-top:0; color:#9ca3af; font-size:10px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; } .empty { color:#9ca3af; font-size:12px; padding:20px 0; } @media(max-width:760px) { .finance-cards,.columns { grid-template-columns:1fr; } }
`;
