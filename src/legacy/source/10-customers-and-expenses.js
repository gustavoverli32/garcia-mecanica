  excluirOS(id){ if(!confirm('Excluir esta OS?'))return; this._db.from('ordens').delete().eq('id',id).then(()=>{this._toast('OS excluída!');this._load();}); }

  /* Observações por cliente — localStorage */
  _getObs(cid){ try{ const all=JSON.parse(localStorage.getItem('g_obs')||'{}'); return all[cid]||''; }catch(e){return '';} }
  _saveObs(cid,txt){ try{ const all=JSON.parse(localStorage.getItem('g_obs')||'{}'); all[cid]=txt; localStorage.setItem('g_obs',JSON.stringify(all)); }catch(e){} }

  _modalEditarCliente(id){
    const c=this.state.clientes.find(x=>x.id===id);
    if(!c)return;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='380px';box.style.maxHeight='';box.style.overflowY='visible';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Editar Cliente</div>
        <button onclick="window._garcia._modalHistoricoCliente(${id})" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Nome *</div><input id="f-cli-nome" value="${(c.nome||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div><div style="font-size:12px;font-weight:700;color:#B45309;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">📱 Telefone (WhatsApp)</div><input id="f-cli-tel" value="${(c.telefone||'').replace(/"/g,'&quot;')}" placeholder="Ex: 22999998888" style="width:100%;padding:14px 14px;border:2px solid #FFC107;border-radius:8px;font-size:16px;font-weight:700;background:#FFFBEB;"></div>
        <button onclick="window._garcia._salvarEdicaoCliente(${id})" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;margin-top:6px;">Salvar</button>
      </div>`);
  }
  async _salvarEdicaoCliente(id){
    const nome=document.getElementById('f-cli-nome')?.value?.trim();
    const tel=document.getElementById('f-cli-tel')?.value?.trim();
    if(!nome){this._toast('Nome obrigatório',false);return;}
    try{
      const {error}=await this._db.from('clientes').update({nome,telefone:tel}).eq('id',id);
      if(error)throw error;
      await this._load();
      this._toast('Cliente atualizado!');
      this._modalHistoricoCliente(id);
    }catch(e){this._toast('Erro: '+(e.message||e),false);}
  }
  _modalHistoricoCliente(id){
    const {ordens,clientes,faturamentos}=this.state;
    const c=clientes.find(x=>x.id===id);
    if(!c)return;
    const cOs=ordens.filter(o=>o.cliente_id===id);
    const cFat=faturamentos.filter(f=>f.cliente_id===id);
    const totalGasto=cFat.reduce((s,f)=>s+parseFloat(f.valor||0),0);
    const obs=this._getObs(id);
    const devidoTotal=this._devidoCliente(id);
    const revisoes=this._revisoesCliente(id);
    this._clienteModalId=id;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='680px';box.style.maxHeight='85vh';box.style.overflowY='auto';}
    const osRows=cOs.map(o=>`
      <tr style="border-bottom:1px solid #F9F9F9;cursor:pointer;" onclick="window._garcia._editarOS(${o.id})">
        <td style="padding:9px 12px;font-size:11px;color:#FFC107;font-weight:700;">#${o.id}</td>
        <td style="padding:9px 12px;font-size:11px;color:#374151;">${this._parseSrv(o.servico)}</td>
        <td style="padding:9px 12px;font-size:11px;color:#9CA3AF;">${o.veiculo||'—'}</td>
        <td style="padding:9px 12px;font-size:11px;color:#9CA3AF;">${this._dfmt(o.data)}</td>
        <td style="padding:9px 12px;font-size:11px;font-weight:700;text-align:right;">${this._fmt(o.valor)}</td>
        <td style="padding:9px 12px;text-align:center;"><span style="${this._stStyle(o.status)}">${o.status}</span></td>
      </tr>`).join('');
    const fatRows=cFat.map(f=>`
      <tr style="border-bottom:1px solid #F9F9F9;">
        <td style="padding:8px 12px;font-size:11px;color:#9CA3AF;">${this._dfmt(f.data)}</td>
        <td style="padding:8px 12px;font-size:11px;color:#6B7280;">${f.forma||'—'}</td>
        <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#059669;text-align:right;">${this._fmt(f.valor)}</td>
        <td style="padding:8px 12px;text-align:center;"><span style="background:${f.status==='Pago'?'#ECFDF5':'#FEF3C7'};color:${f.status==='Pago'?'#059669':'#B45309'};font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;">${f.status}</span></td>
        <td style="padding:8px 12px;text-align:center;"><button onclick="window._garcia.excluirPagamentoCliente(${f.id},${id})" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:12px;">✕</button></td>
      </tr>`).join('');

    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;background:#FFC107;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;color:#000;flex-shrink:0;">${(c.nome||'?')[0].toUpperCase()}</div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${c.nome}</div>
              <button onclick="window._garcia._modalEditarCliente(${c.id})" title="Editar nome/telefone" style="background:#F3F4F6;border:none;border-radius:6px;width:22px;height:22px;cursor:pointer;font-size:11px;color:#6B7280;flex-shrink:0;">✏️</button>
            </div>
            ${c.telefone?`<div style="font-size:13px;font-weight:700;color:#374151;margin-top:4px;display:flex;align-items:center;gap:5px;">📱 ${c.telefone}${c.email?' · '+c.email:''}</div>`:`<button onclick="window._garcia._modalEditarCliente(${c.id})" style="margin-top:5px;background:#FEF3C7;color:#B45309;border:1px solid #FDE68A;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;">📱 + Adicionar telefone</button>`}
          </div>
        </div>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;flex-shrink:0;">×</button>
      </div>

      <!-- KPIs do cliente -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;">
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Total OS</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#111;">${cOs.length}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Em Aberto</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#FF8C00;">${cOs.filter(o=>o.status!=='Concluída').length}</div>
        </div>
        <div style="background:#F9FAFB;border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Total Gasto</div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#10B981;">${this._fmt(totalGasto)}</div>
        </div>
      </div>

      ${devidoTotal>0?`<div style="background:#FEF2F2;border:1.5px solid #FCA5A5;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <div><div style="font-size:11px;font-weight:700;color:#DC2626;">💰 Cliente devedor</div><div style="font-size:10px;color:#991B1B;margin-top:2px;">Pagamento pendente de OS concluídas</div></div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#DC2626;">${this._fmt(devidoTotal)}</div>
      </div>`:''}
      ${revisoes.length?`<div style="margin-bottom:18px;">
        <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🔔 Revisões Programadas</div>
        ${revisoes.map(r=>{
          const devida=r.data_agendada<=this._today();
          return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:${devida?'#FFFBEB':'#F9FAFB'};border:1px solid ${devida?'#FDE68A':'#F3F4F6'};border-radius:10px;padding:10px 14px;margin-bottom:8px;">
            <div><div style="font-size:12px;font-weight:700;color:#374151;">${r.servico}</div><div style="font-size:10px;color:${devida?'#92400E':'#9CA3AF'};margin-top:2px;">${devida?'Na hora de fazer — ':'Previsto para '}${this._dfmt(r.data_agendada)}</div></div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <button onclick="event.stopPropagation();window._garcia._enviarLembreteRevisao(${r.id})" style="background:#25D366;color:#fff;border:none;border-radius:6px;padding:6px 10px;font-size:10px;font-weight:700;cursor:pointer;">WhatsApp</button>
              <button onclick="event.stopPropagation();window._garcia._marcarRevisaoFeita(${r.id})" style="background:#F3F4F6;color:#374151;border:none;border-radius:6px;padding:6px 10px;font-size:10px;font-weight:700;cursor:pointer;">Feita</button>
            </div>
          </div>`;
        }).join('')}
      </div>`:''}

      <!-- Ordens de Serviço -->
      <div style="margin-bottom:18px;">
        <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🔧 Ordens de Serviço</div>
        <div class="gm-tw" style="border:1px solid #F3F4F6;border-radius:10px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#FAFAFA;">
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;">OS#</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;">Serviço</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;">Veículo</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;">Data</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:right;letter-spacing:1px;text-transform:uppercase;">Valor</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:center;letter-spacing:1px;text-transform:uppercase;">Status</th>
            </tr></thead>
            <tbody>${osRows||'<tr><td colspan="6" style="padding:16px;text-align:center;color:#9CA3AF;font-size:12px;">Nenhuma OS registrada</td></tr>'}</tbody>
          </table>
        </div>
      </div>

      <!-- Pagamentos -->
      <div style="margin-bottom:18px;">
        <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">💳 Pagamentos</div>
        <div class="gm-tw" style="border:1px solid #F3F4F6;border-radius:10px;overflow:hidden;">
          <table style="width:100%;border-collapse:collapse;">
            <thead><tr style="background:#FAFAFA;">
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;">Data</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:left;letter-spacing:1px;text-transform:uppercase;">Forma</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:right;letter-spacing:1px;text-transform:uppercase;">Valor</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:center;letter-spacing:1px;text-transform:uppercase;">Status</th>
              <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-align:center;letter-spacing:1px;text-transform:uppercase;">Ações</th>
            </tr></thead>
            <tbody>${fatRows||'<tr><td colspan="5" style="padding:16px;text-align:center;color:#9CA3AF;font-size:12px;">Nenhum pagamento registrado</td></tr>'}</tbody>
          </table>
        </div>
      </div>

      <!-- Observações -->
      <div>
        <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📝 Observações</div>
        <textarea id="cli-obs" placeholder="Adicione observações sobre este cliente: preferências, histórico de problemas, veículos, etc..." style="width:100%;min-height:80px;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;resize:vertical;line-height:1.5;">${obs}</textarea>
        <button onclick="window._garcia._salvarObs(${id})" style="margin-top:8px;padding:9px 18px;background:#FFC107;border:none;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">SALVAR OBSERVAÇÃO</button>
      </div>`);
  }

  _salvarObs(cid){
    const txt=document.getElementById('cli-obs')?.value||'';
    this._saveObs(cid,txt);
    this._toast('Observação salva!');
    this._render();
  }

  excluirCli(id,nome){ if(!confirm('Excluir '+nome+'?'))return; this._db.from('clientes').delete().eq('id',id).then(()=>{this._toast('Cliente excluído!');this._load();}); }
  excluirRec(id){ if(!confirm('Excluir este registro?'))return; this._db.from('faturamentos').delete().eq('id',id).then(()=>{this._toast('Registro excluído!');this._load();}); }
  async excluirPagamentoCliente(id,cid){
    if(!confirm('Excluir este pagamento?'))return;
    try{ await this._db.from('faturamentos').delete().eq('id',id); await this._load(); this._toast('Pagamento excluído!'); this._modalHistoricoCliente(cid); }catch(e){ this._toast('Erro ao excluir',false); }
  }
  _modalPausadas(){
    const l=this._bloqRec();
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='460px';box.style.maxHeight='90vh';box.style.overflowY='auto';}
    const linhas=l.length?l.map(k=>`<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:10px 12px;margin-bottom:7px;">
        <span style="font-size:12px;font-weight:700;color:#374151;text-transform:capitalize;">${k}</span>
        <button onclick="window._garcia._reativarRec('${k.replace(/'/g,"\\'")}')" style="background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer;flex-shrink:0;">Reativar</button>
      </div>`).join(''):'<div style="font-size:12px;color:#9CA3AF;">Nenhuma recorrência pausada.</div>';
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">⏸ Recorrências pausadas</span>
        <button onclick="window._garcia._closeModal()" style="background:none;border:none;font-size:22px;color:#9CA3AF;cursor:pointer;line-height:1;">×</button>
      </div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:14px;">Estas despesas foram excluídas e não são mais lançadas automaticamente. Reativar volta a gerar nos próximos meses.</div>
      ${linhas}`);
  }
  _reativarRec(k){ this._desbloquearRec(k); this._toast('Recorrência reativada 🔄'); this._render(); this._modalPausadas(); }

  async excluirDep(id){
    const alvo=this.state.despesas.find(d=>String(d.id)===String(id));
    const ehRec=!!(alvo&&alvo.recorrente);
    if(!confirm(ehRec?`Excluir "${alvo.descricao||'despesa'}"?\n\nEla é recorrente — ao excluir, deixa de ser lançada automaticamente nos próximos meses.`:'Excluir esta despesa?'))return;
    if(ehRec) this._bloquearRec(alvo.descricao);
    return this._excluirDepDb(id);
  }
  async _excluirDepDb(id){
    /* Marca como excluída localmente antes de tudo: se a nuvem recusar o delete (RLS, id inexistente),
       a despesa não volta no próximo _load(). */
    this._addDepDel(id);
    let apagouNaNuvem=false;
    try {
      let {data,error}=await this._db.from('despesas').delete().eq('id',id).select();
      if(!error && (!data||!data.length) && !isNaN(Number(id))){
        const r2=await this._db.from('despesas').delete().eq('id',Number(id)).select();
        data=r2.data; error=r2.error;
      }
      apagouNaNuvem = !error && !!data && data.length>0;
    } catch(e){}
    const dep=this.state.despesas.filter(d=>String(d.id)!==String(id));
    localStorage.setItem('g_dep',JSON.stringify(dep));
    this.setState({despesas:dep},()=>this._render());
    if(apagouNaNuvem){ await this._load(); this._toast('Despesa excluída!'); }
    else this._toast('Despesa excluída (somente neste dispositivo — a nuvem recusou o delete)',false);
  }
  _toggleAcoesMenu(id,ev){
    const menu=document.getElementById('acoes-menu-'+id);
    if(!menu)return;
    const isOpen=menu.style.display==='block';
    document.querySelectorAll('[id^="acoes-menu-"]').forEach(m=>m.style.display='none');
    if(!isOpen){
      const rect=ev.currentTarget.getBoundingClientRect();
      menu.style.display='block';
      const menuW=170;
      let left=rect.right-menuW;
      if(left<8)left=8;
      let top=rect.bottom+6;
      if(top+220>window.innerHeight) top=rect.top-6-220;
      menu.style.left=left+'px';
      menu.style.top=top+'px';
      const close=(e)=>{ if(!menu.contains(e.target)){ menu.style.display='none'; document.removeEventListener('click',close); } };
      setTimeout(()=>document.addEventListener('click',close),0);
    }
  }
  setFilter(f){ this.setState({osFilter:f},()=>this._render()); }
  setOSPeriodFilter(f){ this.setState({osPeriodFilter:f},()=>this._render()); }
  setOSMonthFilter(f){ this.setState({osMonthFilter:f},()=>this._render()); }
  setRecFilter(f){ this.setState({recFilter:f},()=>this._render()); }
  setDepFilter(f){ this.setState({depFilter:f},()=>this._render()); }
  goOS(){ this.setState({page:'os'},()=>this._render()); }
  goTo(p){ this.setState({page:p},()=>this._render()); }

  _toggleSidebar(open){
    const sb=document.getElementById('gm-sidebar');
    const ov=document.getElementById('gm-overlay');
    if(!sb||!ov)return;
    const shouldOpen = open!==undefined ? open : !sb.classList.contains('gm-open');
    sb.classList.toggle('gm-open',shouldOpen);
    ov.classList.toggle('gm-open',shouldOpen);
  }

  /* ══════════ IA ══════════ */
