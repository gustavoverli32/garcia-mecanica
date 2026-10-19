  _months6(){ return this._monthsN(6); }
  _monthsN(n){
    const out=[];const now=new Date();
    for(let i=n-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),label:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''),cur:i===0});}
    return out;
  }
  _clientesTicketRanking(){
    const {ordens,faturamentos,clientes}=this.state;
    const byCliOS={};
    ordens.forEach(o=>{ if(!o.cliente_id)return; if(!byCliOS[o.cliente_id]) byCliOS[o.cliente_id]={count:0,total:0}; byCliOS[o.cliente_id].count++; byCliOS[o.cliente_id].total+=parseFloat(o.valor||0); });
    return Object.entries(byCliOS).map(([cid,v])=>({nome:clientes.find(c=>c.id==cid)?.nome||'—',count:v.count,total:v.total,ticket:v.total/v.count})).sort((a,b)=>b.ticket-a.ticket);
  }
  _despesasPorCategoria(){
    const map={};
    (this.state.despesas||[]).forEach(d=>{ const k=d.cat||'Outros'; map[k]=(map[k]||0)+parseFloat(d.valor||0); });
    return Object.entries(map).map(([cat,total])=>({cat,total})).sort((a,b)=>b.total-a.total);
  }

  _render(){
    const el=document.getElementById('main-content');
    if(!el)return;
    const {page,ordens,clientes,faturamentos,despesas,osFilter,osMonthFilter}=this.state;
    const now=new Date();
    const curKey=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
    const fatM=faturamentos.filter(f=>this._mkey(f.data)===curKey);
    const depM=despesas.filter(d=>this._mkey(d.data)===curKey);
    const rec=fatM.reduce((s,f)=>s+parseFloat(f.valor||0),0);
    const dep=depM.reduce((s,d)=>s+d.valor,0);
    const lucro=rec-dep;
    const TH='padding:9px 16px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;';
    const TD='padding:10px 16px;font-size:12px;';
    const card=(icon,label,val,sub,color)=>`<div class="gm-kpi" style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;align-items:center;gap:12px;"><div style="width:42px;height:42px;background:${color}1a;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${icon}</div><div><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${label}</div><div style="font-family:'Rajdhani',sans-serif;font-size:21px;font-weight:700;color:#111;line-height:1;">${val}</div><div style="font-size:10px;color:${color};margin-top:3px;">${sub}</div></div></div>`;

    if(page==='dashboard'){
      const osAb=ordens.filter(o=>o.status!=='Concluída').length;
      const osRows=ordens.slice(0,6).map(o=>`<tr style="border-bottom:1px solid #F9F9F9;"><td style="${TD}color:#FFC107;font-weight:700;">#${o.id}</td><td style="${TD}color:#374151;font-weight:600;">${o.clientes?.nome||'—'}</td><td style="${TD}color:#9CA3AF;font-size:11px;">${o.veiculo||'—'}</td><td style="${TD}">${this._parseSrv(o.servico)}</td><td style="${TD}text-align:right;font-weight:700;">${this._fmt(o.valor)}</td><td style="padding:10px 16px;text-align:center;"><span style="${this._stStyle(o.status)}">${o.status}</span></td></tr>`).join('');
      const m6=this._months6();const maxR=Math.max(...m6.map(m=>faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0)),1);
      const bars=m6.map(m=>{const v=faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0);const h=Math.max(Math.round(v/maxR*100),v>0?6:2);return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;"><div style="width:100%;flex:1;display:flex;align-items:flex-end;background:#F9FAFB;border-radius:4px;overflow:hidden;"><div style="width:100%;height:${h}%;background:${m.cur?'#FFC107':'#E5E7EB'};border-radius:4px 4px 0 0;"></div></div><span style="font-size:9px;color:${m.cur?'#FFC107':'#9CA3AF'};font-weight:${m.cur?'700':'400'};">${m.label}</span></div>`;}).join('');
      const pix=fatM.filter(f=>f.forma==='Pix').reduce((s,f)=>s+parseFloat(f.valor||0),0);
      const car=fatM.filter(f=>f.forma==='Cartão').reduce((s,f)=>s+parseFloat(f.valor||0),0);
      const din=fatM.filter(f=>f.forma==='Dinheiro').reduce((s,f)=>s+parseFloat(f.valor||0),0);
      const tot=rec||1;const pP=Math.round(pix/tot*100),pC=Math.round(car/tot*100),pD=Math.round(din/tot*100);
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
          ${card('📈','Receitas/Mês',this._fmt(rec),'mês atual','#10B981')}
          ${card('📉','Despesas/Mês',this._fmt(dep),'mês atual','#EF4444')}
          ${card('🔧','OS em Aberto',osAb,ordens.filter(o=>o.status==='Aguardando Peça').length+' aguard. peça','#FF8C00')}
          ${card('👥','Clientes',clientes.length,'cadastrados','#818CF8')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 264px;gap:12px;margin-bottom:16px;">
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:18px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:14px;"><div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">Receita Mensal</div><div style="font-size:10px;color:#9CA3AF;margin-top:1px;">Últimos 6 meses</div></div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#FFC107;">${this._fmt(rec)}</div></div>
            <div style="display:flex;align-items:flex-end;gap:8px;height:84px;">${bars}</div>
          </div>
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:18px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#111;">Lucro do Mês</div>
            <div style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:${lucro>=0?'#10B981':'#EF4444'};line-height:1;margin:4px 0 2px;">${this._fmt(lucro)}</div>
            <div style="font-size:9px;color:#9CA3AF;margin-bottom:16px;">receitas − despesas</div>
            <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Forma de Pagamento</div>
            ${['PIX','Cartão','Dinheiro'].map((l,i)=>{const p=[pP,pC,pD][i];const c=['#10B981','#FFC107','#9CA3AF'][i];return`<div style="margin-bottom:9px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:11px;font-weight:600;color:#374151;">${l}</span><span style="font-size:11px;color:#9CA3AF;">${p}%</span></div><div style="height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden;"><div style="height:100%;width:${p}%;background:${c};border-radius:3px;"></div></div></div>`;}).join('')}
          </div>
        </div>
        <div class="gm-tw" style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;">
          <div style="padding:13px 18px;border-bottom:1px solid #F3F4F6;display:flex;justify-content:space-between;align-items:center;"><span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">OS Recentes</span><span style="font-size:11px;color:#FFC107;font-weight:700;cursor:pointer;" onclick="window._garcia.goOS()">Ver todas →</span></div>
          <table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#FAFAFA;"><th style="${TH}">OS#</th><th style="${TH}">Cliente</th><th style="${TH}">Veículo</th><th style="${TH}">Serviço</th><th style="${TH}text-align:right">Valor</th><th style="${TH}text-align:center">Status</th></tr></thead><tbody>${osRows}</tbody></table>
        </div>
        ${this._recomCardHTML()}
        </div>`;
    }

    else if(page==='os'){
      this._renderOSFlow(el);
    }

    else if(page==='clientes'){
      const rows=clientes.map(c=>{
        const cOs=ordens.filter(o=>o.cliente_id===c.id);
        const cFat=faturamentos.filter(f=>f.cliente_id===c.id);
        const totalGasto=cFat.reduce((s,f)=>s+parseFloat(f.valor||0),0);
        const obs=this._getObs(c.id);
        const devido=this._devidoCliente(c.id);
        const revisaoDevida=this._revisaoDevida(c.id);
        return `<tr data-busca="${((c.nome||'')+' '+(c.telefone||'')+' '+(c.email||'')).toLowerCase().replace(/"/g,'')}" style="border-bottom:1px solid #F9F9F9;cursor:pointer;" onclick="window._garcia._modalHistoricoCliente(${c.id})">
          <td style="padding:12px 18px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;background:#FFC107;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#000;flex-shrink:0;">${(c.nome||'?')[0].toUpperCase()}</div>
              <div><div style="font-size:13px;color:#374151;font-weight:600;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">${c.nome}${devido>0?`<span style="background:#FEF2F2;color:#DC2626;font-size:8px;font-weight:700;padding:2px 7px;border-radius:20px;">💰 Devedor</span>`:''}${revisaoDevida?`<span style="background:#FFFBEB;color:#92400E;font-size:8px;font-weight:700;padding:2px 7px;border-radius:20px;">🔧 Revisão</span>`:''}</div><div style="font-size:10px;color:#9CA3AF;margin-top:1px;">${obs?'📝 '+obs.substring(0,30)+(obs.length>30?'...':''):'Sem observações'}</div></div>
            </div>
          </td>
          <td style="${TD}color:#6B7280;">${c.telefone||'—'}</td>
          <td style="${TD}color:#6B7280;">${c.email||'—'}</td>
          <td style="padding:10px 18px;text-align:center;"><span style="background:#F3F4F6;color:#374151;font-size:12px;font-weight:700;padding:3px 10px;border-radius:20px;">${cOs.length}</span></td>
          <td style="padding:10px 18px;text-align:right;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">${this._fmt(totalGasto)}</td>
          <td style="padding:10px 18px;text-align:center;">
            <button onclick="event.stopPropagation();window._garcia._modalHistoricoCliente(${c.id})" style="background:#EEF2FF;color:#4338CA;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;margin-right:5px;">📋 Ver</button>
            <button onclick="event.stopPropagation();window._garcia.excluirCli(${c.id},'${c.nome.replace(/'/g,"\\'")}')" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;">Excluir</button>
          </td>
        </tr>`;
      }).join('');
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:10px 14px;margin-bottom:12px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input id="cli-busca" value="${(this._cliBusca||'').replace(/"/g,'&quot;')}" oninput="window._garcia._buscarCli(this.value)" placeholder="Buscar cliente por nome, telefone ou email..." style="flex:1;border:none;outline:none;font-size:13px;color:#374151;font-family:inherit;background:transparent;" />
          <span id="cli-busca-cont" style="font-size:10px;font-weight:700;color:#9CA3AF;white-space:nowrap;"></span>
        </div>
        <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;overflow-x:auto;"><table style="width:100%;border-collapse:collapse;min-width:700px;"><thead><tr style="background:#FAFAFA;"><th style="${TH}">Cliente</th><th style="${TH}">Telefone</th><th style="${TH}">Email</th><th style="${TH}text-align:center">OS's</th><th style="${TH}text-align:right">Total Gasto</th><th style="${TH}text-align:center">Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="6" style="padding:24px;text-align:center;color:#9CA3AF;">Nenhum cliente cadastrado</td></tr>'}<tr id="cli-vazio" style="display:none;"><td colspan="6" style="padding:24px;text-align:center;color:#9CA3AF;">Nenhum cliente encontrado</td></tr></tbody></table></div></div>`;
      if(this._cliBusca) this._buscarCli(this._cliBusca);
    }

    else if(page==='receitas'){
      const rf=this.state.recFilter||curKey;
      const fatF=faturamentos.filter(f=>this._mkey(f.data)===rf);
      const pagoF=fatF.filter(f=>f.status==='Pago').reduce((s,f)=>s+parseFloat(f.valor||0),0);
      const pendF=fatF.filter(f=>f.status==='Pendente').reduce((s,f)=>s+parseFloat(f.valor||0),0);
      const totalF=fatF.reduce((s,f)=>s+parseFloat(f.valor||0),0);
      const monthOpts=this._monthOptions().map(m=>`<option value="${m.key}" ${m.key===rf?'selected':''}>${m.label}</option>`).join('');
      const rows=fatF.map(f=>{
        const os=f.os_id?ordens.find(o=>o.id===f.os_id):null;
        return `<tr style="border-bottom:1px solid #F9F9F9;">
        <td style="${TD}color:#9CA3AF;font-size:11px;">${this._dfmt(f.data)}</td>
        <td style="${TD}font-weight:600;color:#374151;">${f.clientes?.nome||'—'}</td>
        <td style="padding:10px 16px;">${os?`<span style="background:#EEF2FF;color:#4338CA;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;cursor:pointer;" onclick="window._garcia.goOS()">OS #${os.id} · ${os.veiculo||''}</span>`:f.os_id?`<span style="background:#EEF2FF;color:#4338CA;font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;">OS #${f.os_id}</span>`:`<span style="background:#F3F4F6;color:#6B7280;font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;">Manual</span>`}</td>
        <td style="${TD}text-align:right;font-weight:700;">${this._fmt(f.valor)}</td>
        <td style="${TD}color:#6B7280;">${f.forma||'—'}</td>
        <td style="padding:10px 16px;text-align:center;"><span style="background:${f.status==='Pago'?'#ECFDF5':'#FEF3C7'};color:${f.status==='Pago'?'#059669':'#B45309'};font-size:9px;font-weight:700;padding:3px 9px;border-radius:20px;">${f.status}</span></td>
        <td style="padding:10px 16px;text-align:center;"><button onclick="window._garcia.excluirRec(${f.id})" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;">Excluir</button></td>
      </tr>`;}).join('');
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:12px;">
            <div style="background:#fff;border-radius:10px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07);border-left:3px solid #10B981;min-width:130px;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Total</div><div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(totalF)}</div></div>
            <div style="background:#fff;border-radius:10px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07);border-left:3px solid #FFC107;min-width:130px;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Recebido</div><div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(pagoF)}</div></div>
            <div style="background:#fff;border-radius:10px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07);border-left:3px solid #EF4444;min-width:130px;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">A Receber</div><div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(pendF)}</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:11px;color:#9CA3AF;font-weight:600;">Período:</span>
            <select onchange="window._garcia.setRecFilter(this.value)" style="padding:8px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;">${monthOpts}</select>
          </div>
        </div>
        <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#FAFAFA;"><th style="${TH}">Data</th><th style="${TH}">Cliente</th><th style="${TH}">Origem</th><th style="${TH}text-align:right">Valor</th><th style="${TH}">Pagamento</th><th style="${TH}text-align:center">Status</th><th style="${TH}text-align:center">Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="7" style="padding:32px;text-align:center;color:#9CA3AF;font-size:13px;">Nenhum registro neste período</td></tr>'}</tbody></table>
        </div></div>`;
    }

    else if(page==='despesas'){
      const df=this.state.depFilter||curKey;
      const depF=despesas.filter(d=>this._mkey(d.data)===df);
      const dFixa=depF.filter(d=>d.tipo==='Fixa').reduce((s,d)=>s+d.valor,0);
      const dVar=depF.filter(d=>d.tipo!=='Fixa').reduce((s,d)=>s+d.valor,0);
      const totalDep=dFixa+dVar;
      const monthOptsDep=this._monthOptions().map(m=>`<option value="${m.key}" ${m.key===df?'selected':''}>${m.label}</option>`).join('');
      const rows=[...depF].reverse().map(d=>`<tr style="border-bottom:1px solid #F9F9F9;">
        <td style="${TD}color:#9CA3AF;font-size:11px;">${this._dfmt(d.data)}</td>
        <td style="${TD}font-weight:600;color:#374151;">
          ${d.descricao||d.desc||'—'}
          ${d.recorrente?'<span style="background:#ECFDF5;color:#059669;font-size:8px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:6px;">🔄 RECORRENTE</span>':''}
          ${d.comprovante?'<span style="background:#EEF2FF;color:#4338CA;font-size:8px;font-weight:700;padding:2px 6px;border-radius:10px;margin-left:6px;">📎 COMPROVANTE</span>':''}
        </td>
        <td style="${TD}color:#6B7280;">${d.cat}</td>
        <td style="${TD}text-align:right;font-weight:700;color:#EF4444;">${this._fmt(d.valor)}</td>
        <td style="padding:10px 16px;text-align:center;"><span style="background:${d.tipo==='Fixa'?'#EEF2FF':'#FFF7ED'};color:${d.tipo==='Fixa'?'#4338CA':'#C2410C'};font-size:9px;font-weight:700;padding:3px 9px;border-radius:20px;">${d.tipo}</span></td>
        <td style="padding:10px 16px;text-align:center;white-space:nowrap;">
          <button onclick="window._garcia._modalDep(${d.id})" style="background:#EEF2FF;color:#4338CA;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;margin-right:5px;">Editar</button>
          <button onclick="window._garcia.excluirDep(${d.id})" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;">Excluir</button>
        </td>
      </tr>`).join('');
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:12px;">
            <div style="background:#fff;border-radius:10px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07);border-left:3px solid #EF4444;min-width:130px;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Total</div><div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(totalDep)}</div></div>
            <div style="background:#fff;border-radius:10px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07);border-left:3px solid #818CF8;min-width:130px;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Fixas</div><div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(dFixa)}</div></div>
            <div style="background:#fff;border-radius:10px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07);border-left:3px solid #FF8C00;min-width:130px;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Variáveis</div><div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(dVar)}</div></div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <button onclick="window._garcia._gerarRecorrentes()" style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:8px;padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;">🔄 Gerar Recorrentes do Mês</button>
            ${this._bloqRec().length?`<button onclick="window._garcia._modalPausadas()" style="background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;border-radius:8px;padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;">⏸ ${this._bloqRec().length} recorrente(s) pausada(s)</button>`:''}
            <button onclick="window._garcia._modalComprovantes()" style="background:#EEF2FF;color:#4338CA;border:1px solid #C7D2FE;border-radius:8px;padding:8px 14px;font-size:11px;font-weight:700;cursor:pointer;">📎 Histórico de Comprovantes</button>
            <span style="font-size:11px;color:#9CA3AF;font-weight:600;">Período:</span>
            <select onchange="window._garcia.setDepFilter(this.value)" style="padding:8px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;">${monthOptsDep}</select>
          </div>
        </div>
        <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#FAFAFA;"><th style="${TH}">Data</th><th style="${TH}">Descrição</th><th style="${TH}">Categoria</th><th style="${TH}text-align:right">Valor</th><th style="${TH}text-align:center">Tipo</th><th style="${TH}text-align:center">Ações</th></tr></thead><tbody>${rows||'<tr><td colspan="6" style="padding:32px;text-align:center;color:#9CA3AF;font-size:13px;">Nenhuma despesa neste período</td></tr>'}</tbody></table>
        </div></div>`;
    }

    else if(page==='funcionarios'){
      const {funcionarios}=this.state;
      const mecanicos=funcionarios.filter(f=>f.cargo==='mecanico');
      const ajudantes=funcionarios.filter(f=>f.cargo==='ajudante');
      const administrativos=funcionarios.filter(f=>f.cargo==='administrativo');
      const cargoTag=(c)=>`background:${c==='mecanico'?'#FFFBEB':c==='administrativo'?'#ECFDF5':'#EEF2FF'};color:${c==='mecanico'?'#92400E':c==='administrativo'?'#047857':'#4338CA'};font-size:9px;font-weight:700;padding:3px 9px;border-radius:20px;`;
      const cargoLabel=(c)=>c==='mecanico'?'🔧 Mecânico':c==='administrativo'?'📋 Administrativo':'🪛 Ajudante';
      const cargoIcon=(c)=>c==='mecanico'?'🔧':c==='administrativo'?'📋':'🪛';
      const cargoBg=(c)=>c==='mecanico'?'#FFFBEB':c==='administrativo'?'#ECFDF5':'#EEF2FF';
      const rows=funcionarios.map(f=>`<tr style="border-bottom:1px solid #F9F9F9;cursor:pointer;" onclick="window._garcia._modalFuncionario(${f.id})">
        <td style="padding:13px 18px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:${cargoBg(f.cargo)};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${cargoIcon(f.cargo)}</div>
            <div><div style="font-size:13px;font-weight:700;color:#374151;">${f.nome}</div><div style="font-size:10px;color:#9CA3AF;margin-top:1px;">Desde ${this._dfmt(f.criado)}</div></div>
          </div>
        </td>
        <td style="padding:13px 18px;font-size:12px;color:#6B7280;">${f.tel||'—'}</td>
        <td style="padding:13px 18px;text-align:center;"><span style="${cargoTag(f.cargo)}">${cargoLabel(f.cargo)}</span></td>
        <td style="padding:13px 18px;text-align:right;font-weight:700;color:#374151;">${this._fmt(f.salario)}</td>
        <td style="padding:13px 18px;text-align:right;color:${(f.vale||0)>0?'#DC2626':'#9CA3AF'};font-weight:600;">${this._fmt(f.vale)}</td>
        <td style="padding:13px 18px;text-align:right;font-weight:700;color:#059669;">${this._fmt((parseFloat(f.salario||0))-(parseFloat(f.vale||0)))}</td>
        <td style="padding:13px 18px;text-align:center;white-space:nowrap;">
          <button onclick="event.stopPropagation();window._garcia._modalVale(${f.id})" style="background:#FFFBEB;color:#92400E;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;margin-right:5px;">💰 Vale</button>
          <button onclick="event.stopPropagation();window._garcia._excluirFunc(${f.id})" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:600;cursor:pointer;">Remover</button>
        </td>
      </tr>`).join('');
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:18px;">
          <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:#FFFBEB;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;">🔧</div>
            <div><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Mecânicos</div><div style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:#111;">${mecanicos.length}</div></div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:#EEF2FF;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;">🪛</div>
            <div><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Ajudantes</div><div style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:#111;">${ajudantes.length}</div></div>
          </div>
          <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:#ECFDF5;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;">📋</div>
            <div><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Administrativo</div><div style="font-family:'Rajdhani',sans-serif;font-size:26px;font-weight:700;color:#111;">${administrativos.length}</div></div>
          </div>
        </div>
        <div class="gm-tw" style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#FAFAFA;">
              <th style="${TH}">Funcionário</th>
              <th style="${TH}">Telefone</th>
              <th style="${TH}text-align:center">Cargo</th>
              <th style="${TH}text-align:right">Salário</th>
              <th style="${TH}text-align:right">Vale</th>
              <th style="${TH}text-align:right">A Receber</th>
              <th style="${TH}text-align:center">Ações</th>
            </tr></thead>
            <tbody>${rows||'<tr><td colspan="7" style="padding:32px;text-align:center;color:#9CA3AF;font-size:13px;">Nenhum funcionário cadastrado.<br><span style="font-size:11px;">Clique em "+ Novo Funcionário" para começar.</span></td></tr>'}</tbody>
          </table>
        </div></div>`;
    }

    else if(page==='configuracoes'){
      const {servicos}=this.state;
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div onclick="window._garcia._modalServicos()" style="background:#fff;border-radius:12px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;align-items:center;gap:14px;cursor:pointer;max-width:320px;">
          <div style="width:46px;height:46px;background:#FFFBEB;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">🛠️</div>
          <div style="flex:1;"><div style="font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#111;">Serviços</div><div style="font-size:11px;color:#9CA3AF;margin-top:2px;">${servicos.length} cadastrado(s) · editar, excluir ou adicionar</div></div>
          <div style="font-size:16px;color:#9CA3AF;">›</div>
        </div>
      </div>`;
    }

    else if(page==='financeiro'){
      const m6=this._months6();
      const maxF=Math.max(...m6.map(m=>{const r=faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0);const d=despesas.filter(d=>this._mkey(d.data)===m.key).reduce((s,d)=>s+d.valor,0);return Math.max(r,d);}),1);
      const bars=m6.map(m=>{
        const r=faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0);
        const d=despesas.filter(dx=>this._mkey(dx.data)===m.key).reduce((s,dx)=>s+dx.valor,0);
        const rh=Math.max(Math.round(r/maxF*100),r>0?5:2);const dh=Math.max(Math.round(d/maxF*100),d>0?5:2);
        return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;"><div style="width:100%;flex:1;display:flex;align-items:flex-end;gap:3px;"><div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;"><div style="width:100%;height:${rh}%;background:#10B981;border-radius:3px 3px 0 0;"></div></div><div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;"><div style="width:100%;height:${dh}%;background:#EF4444;border-radius:3px 3px 0 0;"></div></div></div><span style="font-size:9px;color:${m.cur?'#FFC107':'#9CA3AF'};font-weight:${m.cur?'700':'400'};">${m.label}</span></div>`;
      }).join('');
      const tableRows=[...m6].reverse().map(m=>{
        const r=faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0);
        const d=despesas.filter(dx=>this._mkey(dx.data)===m.key).reduce((s,dx)=>s+dx.valor,0);
        const l=r-d;const mar=r>0?Math.round(l/r*100):0;
        return`<tr style="border-bottom:1px solid #F9F9F9;"><td style="${TD}font-weight:600;">${m.label} ${m.key.split('-')[0]}</td><td style="${TD}color:#10B981;font-weight:700;text-align:right;">${this._fmt(r)}</td><td style="${TD}color:#EF4444;font-weight:600;text-align:right;">${this._fmt(d)}</td><td style="${TD}text-align:right;"><span style="font-weight:700;color:${l>=0?'#10B981':'#EF4444'};">${this._fmt(l)}</span></td><td style="${TD}color:#9CA3AF;font-size:11px;text-align:right;">${mar}%</td></tr>`;
      }).join('');
      const mar=rec>0?Math.round(lucro/rec*100):0;
      const srvStats=this._servicosStats();
      const maisVendido=[...srvStats].sort((a,b)=>b.count-a.count)[0];
      const maiorTicket=[...srvStats].filter(s=>s.count>=1).sort((a,b)=>b.ticket-a.ticket)[0];
      const ticketMedioOS=ordens.length?ordens.reduce((s,o)=>s+parseFloat(o.valor||0),0)/ordens.length:0;
      const formaCount={};
      faturamentos.forEach(f=>{ const k=f.forma||'—'; formaCount[k]=(formaCount[k]||0)+parseFloat(f.valor||0); });
      const formaTop=Object.entries(formaCount).sort((a,b)=>b[1]-a[1])[0];
      const clienteRec={};
      faturamentos.forEach(f=>{ if(!f.cliente_id)return; clienteRec[f.cliente_id]=(clienteRec[f.cliente_id]||0)+parseFloat(f.valor||0); });
      const topClientes=Object.entries(clienteRec).map(([cid,total])=>({nome:clientes.find(c=>c.id==cid)?.nome||'—',total})).sort((a,b)=>b.total-a.total).slice(0,5);
      const insightCard=(icon,label,val,sub)=>`<div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.07);display:flex;align-items:flex-start;gap:12px;min-width:0;overflow:hidden;"><div style="width:42px;height:42px;background:#FFFBEB;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${icon}</div><div style="min-width:0;flex:1;overflow:hidden;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${label}</div><div title="${String(val).replace(/"/g,'&quot;')}" style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;line-height:1.3;min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${val}</div><div style="font-size:10px;color:#9CA3AF;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${sub}</div></div></div>`;
      const topClientesRows=topClientes.map((c,i)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;${i<topClientes.length-1?'border-bottom:1px solid #F9F9F9;':''}"><div style="display:flex;align-items:center;gap:10px;"><div style="width:22px;height:22px;background:#FFFBEB;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#92400E;">${i+1}</div><span style="font-size:12px;font-weight:600;color:#374151;">${c.nome}</span></div><span style="font-size:12px;font-weight:700;color:#10B981;">${this._fmt(c.total)}</span></div>`).join('')||'<div style="text-align:center;color:#9CA3AF;font-size:12px;padding:16px;">Sem receitas registradas ainda</div>';
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <div style="background:#1A1A1A;border-radius:14px;padding:24px 28px;margin-bottom:16px;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:16px;">
            <div><div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;font-weight:600;">Resultado — ${now.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}</div><div style="font-family:'Rajdhani',sans-serif;font-size:40px;font-weight:700;color:#FFC107;line-height:1;">${this._fmt(lucro)}</div><div style="font-size:14px;color:#AAA;margin-top:8px;">Receitas: ${this._fmt(rec)} · Despesas: ${this._fmt(dep)}</div></div>
            <div style="display:flex;gap:22px;align-items:center;">
              <div style="text-align:center;"><div style="font-family:'Rajdhani',sans-serif;font-size:30px;font-weight:700;color:#fff;">${mar}%</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-top:4px;font-weight:600;">Margem</div></div>
              <div style="width:1px;height:36px;background:#2A2A2A;"></div>
              <div style="text-align:center;"><div style="font-family:'Rajdhani',sans-serif;font-size:30px;font-weight:700;color:#fff;">${clientes.length}</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-top:4px;font-weight:600;">Clientes</div></div>
              <div style="width:1px;height:36px;background:#2A2A2A;"></div>
              <div style="text-align:center;"><div style="font-family:'Rajdhani',sans-serif;font-size:30px;font-weight:700;color:#FFC107;">${ordens.length}</div><div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-top:4px;font-weight:600;">OS Total</div></div>
            </div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px;">
          ${insightCard('🏆','Serviço Mais Vendido',maisVendido?maisVendido.nome:'—',maisVendido?maisVendido.count+' OS realizadas':'Sem dados ainda')}
          ${insightCard('💎','Maior Ticket Médio',maiorTicket?(maiorTicket.nome.length>48?maiorTicket.nome.slice(0,45)+'…':maiorTicket.nome):'—',maiorTicket?this._fmt(maiorTicket.ticket)+' em média':'Sem dados ainda')}
          ${insightCard('🧾','Ticket Médio por OS',this._fmt(ticketMedioOS),'valor médio geral')}
          ${insightCard('💳','Forma de Pagto. Preferida',formaTop?formaTop[0]:'—',formaTop?this._fmt(formaTop[1])+' recebidos':'Sem dados ainda')}
        </div>
        <div style="display:grid;grid-template-columns:1fr 300px;gap:12px;margin-bottom:16px;">
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:20px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Receitas × Despesas</div>
            <div style="font-size:10px;color:#9CA3AF;margin-bottom:18px;">Comparativo últimos 6 meses</div>
            <div style="display:flex;align-items:flex-end;gap:12px;height:110px;">${bars}</div>
            <div style="display:flex;gap:16px;margin-top:12px;"><div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;background:#10B981;border-radius:2px;"></div><span style="font-size:10px;color:#6B7280;">Receitas</span></div><div style="display:flex;align-items:center;gap:6px;"><div style="width:10px;height:10px;background:#EF4444;border-radius:2px;"></div><span style="font-size:10px;color:#6B7280;">Despesas</span></div></div>
          </div>
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:18px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;margin-bottom:10px;">Top 5 Clientes (receita)</div>
            ${topClientesRows}
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;">
          <div></div>
          <button onclick="window._garcia.goTo('financeiro-detalhes')" style="background:#1A1A1A;color:#FFC107;border:none;border-radius:8px;padding:9px 16px;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;cursor:pointer;letter-spacing:.5px;margin-bottom:14px;">📊 Ver Detalhes Completos →</button>
        </div>
        <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;">
          <div style="padding:13px 18px;border-bottom:1px solid #F3F4F6;"><span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">Histórico Mensal</span></div>
          <table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#FAFAFA;"><th style="${TH}">Mês</th><th style="${TH}text-align:right">Receitas</th><th style="${TH}text-align:right">Despesas</th><th style="${TH}text-align:right">Lucro</th><th style="${TH}text-align:right">Margem</th></tr></thead><tbody>${tableRows}</tbody></table>
        </div></div>`;
    }

    else if(page==='financeiro-detalhes'){
      const srvStats=[...this._servicosStats()];
      const porQtd=[...srvStats].sort((a,b)=>b.count-a.count);
      const porTicket=[...srvStats].sort((a,b)=>b.ticket-a.ticket);
      const cliRank=this._clientesTicketRanking();
      const depCat=this._despesasPorCategoria();
      const totalDepAll=depCat.reduce((s,d)=>s+d.total,0)||1;
      const m12=this._monthsN(12);
      const maxF12=Math.max(...m12.map(m=>{const r=faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0);const d=despesas.filter(dx=>this._mkey(dx.data)===m.key).reduce((s,dx)=>s+dx.valor,0);return Math.max(r,d);}),1);
      const bars12=m12.map(m=>{
        const r=faturamentos.filter(f=>this._mkey(f.data)===m.key).reduce((s,f)=>s+parseFloat(f.valor||0),0);
        const d=despesas.filter(dx=>this._mkey(dx.data)===m.key).reduce((s,dx)=>s+dx.valor,0);
        const rh=Math.max(Math.round(r/maxF12*100),r>0?5:2);const dh=Math.max(Math.round(d/maxF12*100),d>0?5:2);
        return`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;min-width:0;"><div style="width:100%;flex:1;display:flex;align-items:flex-end;gap:2px;"><div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;"><div style="width:100%;height:${rh}%;background:#10B981;border-radius:3px 3px 0 0;"></div></div><div style="flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;"><div style="width:100%;height:${dh}%;background:#EF4444;border-radius:3px 3px 0 0;"></div></div></div><span style="font-size:8px;color:${m.cur?'#FFC107':'#9CA3AF'};font-weight:${m.cur?'700':'400'};">${m.label}</span></div>`;
      }).join('');
      const rankTable=(items,cols)=>`<table style="width:100%;border-collapse:collapse;"><thead><tr style="background:#FAFAFA;">${cols.map(c=>`<th style="${TH}${c.right?'text-align:right':''}">${c.label}</th>`).join('')}</tr></thead><tbody>${items.length?items.map((it,i)=>`<tr style="border-bottom:1px solid #F9F9F9;">${cols.map(c=>`<td style="${TD}${c.right?'text-align:right':''}">${c.fmt(it,i)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}" style="padding:20px;text-align:center;color:#9CA3AF;font-size:12px;">Sem dados ainda</td></tr>`}</tbody></table>`;
      const depCatRows=depCat.map(d=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="width:120px;font-size:11px;color:#374151;flex-shrink:0;">${d.cat}</span><div style="flex:1;background:#F3F4F6;border-radius:4px;height:16px;overflow:hidden;"><div style="width:${Math.round(d.total/totalDepAll*100)}%;height:100%;background:#EF4444;"></div></div><span style="width:90px;text-align:right;font-size:11px;font-weight:700;color:#374151;flex-shrink:0;">${this._fmt(d.total)}</span></div>`).join('')||'<div style="text-align:center;color:#9CA3AF;font-size:12px;padding:16px;">Sem despesas registradas</div>';
      el.innerHTML=`<div style="animation:fadeIn .25s ease;">
        <button onclick="window._garcia.goTo('financeiro')" style="background:#F3F4F6;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;margin-bottom:16px;">← Voltar</button>

        <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:20px;margin-bottom:16px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">Evolução — Últimos 12 Meses</div>
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:16px;">Receitas × Despesas</div>
          <div style="display:flex;align-items:flex-end;gap:6px;height:120px;">${bars12}</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;">
            <div style="padding:13px 18px;border-bottom:1px solid #F3F4F6;"><span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">🏆 Ranking — Serviços Mais Vendidos</span></div>
            ${rankTable(porQtd,[{label:'#',fmt:(it,i)=>i+1},{label:'Serviço',fmt:it=>it.nome},{label:'Qtd',right:true,fmt:it=>it.count},{label:'Receita',right:true,fmt:it=>this._fmt(it.total)}])}
          </div>
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;">
            <div style="padding:13px 18px;border-bottom:1px solid #F3F4F6;"><span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">💎 Ranking — Maior Ticket Médio (Serviço)</span></div>
            ${rankTable(porTicket,[{label:'#',fmt:(it,i)=>i+1},{label:'Serviço',fmt:it=>it.nome},{label:'Qtd',right:true,fmt:it=>it.count},{label:'Ticket Médio',right:true,fmt:it=>this._fmt(it.ticket)}])}
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);overflow:hidden;">
            <div style="padding:13px 18px;border-bottom:1px solid #F3F4F6;"><span style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">👤 Ranking — Ticket Médio por Cliente</span></div>
            ${rankTable(cliRank,[{label:'#',fmt:(it,i)=>i+1},{label:'Cliente',fmt:it=>it.nome},{label:'OS',right:true,fmt:it=>it.count},{label:'Ticket Médio',right:true,fmt:it=>this._fmt(it.ticket)},{label:'Total Gasto',right:true,fmt:it=>this._fmt(it.total)}])}
          </div>
          <div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:18px;">
            <div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;margin-bottom:14px;">📉 Despesas por Categoria (total)</div>
            ${depCatRows}
          </div>
        </div>
      </div>`;
    }
  }

  concluirOS(id){ this._modalPagamento(id); }

