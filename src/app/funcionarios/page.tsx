import { createReadRepositoryFromEnv } from '../../data/create-read-repository';
import type { Funcionario } from '../../domain/entities';

export default async function FuncionariosPage() {
  let funcionarios: Funcionario[] = [];
  let status: 'online' | 'unavailable' | 'not-configured' = 'not-configured';
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try { funcionarios = (await createReadRepositoryFromEnv().loadSnapshot()).funcionarios; status = 'online'; } catch { status = 'unavailable'; }
  }
  return <main className="func-page"><header><a href="/" className="back">← Dashboard</a><p className="eyebrow">EQUIPE DA OFICINA</p><h1>Funcionários</h1><p className="sub">{funcionarios.length} cadastrados · modo somente leitura</p></header><section className="card"><div className="head"><span>Nome</span><span>Comissão</span><span>ID</span></div>{funcionarios.length ? funcionarios.map((item) => <div className="row" key={String(item.id)}><strong>{item.nome}</strong><span>{item.comissao == null ? '—' : `${item.comissao}%`}</span><span>#{item.id}</span></div>) : <div className="empty">Nenhum funcionário carregado. Status: {status === 'online' ? 'online' : 'sem conexão'}.</div>}</section><style>{styles}</style></main>;
}

const styles = `*{box-sizing:border-box}body{margin:0;background:#f4f4f5;color:#111827;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.func-page{min-height:100vh;max-width:1000px;margin:auto;padding:34px clamp(20px,5vw,58px)}.back{color:#6b7280;font-size:12px;text-decoration:none}.eyebrow{color:#9ca3af;font-size:10px;letter-spacing:.14em;font-weight:700;margin:24px 0 6px}h1{margin:0;font-size:30px}.sub{color:#6b7280;font-size:13px;margin-top:8px}.card{margin-top:28px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden}.head,.row{display:grid;grid-template-columns:1.5fr 1fr .6fr;gap:18px;padding:15px 20px;align-items:center}.head{background:#fafafa;color:#9ca3af;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.row{border-top:1px solid #f0f0f0;font-size:13px}.row span{color:#6b7280}.empty{padding:40px 20px;text-align:center;color:#9ca3af;font-size:13px}@media(max-width:700px){.head{display:none}.row{grid-template-columns:1fr;gap:5px}}`;
