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
  _osEscape(value){
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  _osCard(o,compact=false){
    const esc=(value)=>this._osEscape(value);
    const nome=o.clientes?.nome||this.state.clientes.find(c=>c.id==o.cliente_id)?.nome||'Cliente não informado';
    const servico=this._parseSrv(o.servico);
    return `<button type="button" class="gm-os-card${compact?' gm-os-card-history':''}" onclick="window._garcia._abrirAtendimento(${Number(o.id)})" aria-label="Abrir atendimento da OS ${Number(o.id)} de ${esc(nome)}">
      <span class="gm-os-card-top"><strong>#${esc(o.id)}</strong><span>${esc(this._dfmt(o.data))}</span></span>
      <span class="gm-os-card-vehicle">${esc(o.veiculo||'Veículo não informado')}</span>
      ${o.placa?`<span class="gm-os-plate">${esc(o.placa)}</span>`:''}
      <span class="gm-os-card-service">${esc(servico)}</span>
      <span class="gm-os-card-bottom"><span>${esc(nome)}</span><strong>${esc(this._fmt(o.valor))}</strong></span>
      ${compact?`<span class="gm-os-card-payment">${esc(o.status_pagamento||'Concluída')}</span>`:''}
    </button>`;
  }
  _renderOSFlow(el){
    const ordens=this.state.ordens||[];
    const abertas=ordens.filter(o=>o.status!=='Concluída');
    const concluidas=ordens.filter(o=>o.status==='Concluída');
    const etapas=[
      {status:'Aguardando',label:'Aguardando',color:'#818CF8'},
      {status:'Em Andamento',label:'Em andamento',color:'#FFC107'},
      {status:'Aguardando Peça',label:'Aguardando peça',color:'#FF8C00'},
      {status:'Aguardando Pagamento',label:'Aguardando pagamento',color:'#EF4444'},
    ];
    const conhecidos=etapas.map(e=>e.status);
    const mes=this.state.osMonthFilter||'all';
    const periodo=this.state.osPeriodFilter||'todos';
    const hoje=this._today();
    const limite=(dias)=>{const d=new Date();d.setDate(d.getDate()-dias);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
    const dias={hoje:0,semana:7,q15:15};
    const historico=concluidas.filter(o=>{
      if(mes!=='all'&&this._mkey(o.data)!==mes)return false;
      if(periodo!=='todos'&&((o.data||'')<limite(dias[periodo])||(o.data||'')>hoje))return false;
      return true;
    });
    const colunas=etapas.map((etapa,index)=>{
      const itens=abertas.filter(o=>o.status===etapa.status||(index===0&&!conhecidos.includes(o.status)));
      return `<section class="gm-os-stage" aria-label="${etapa.label}">
        <div class="gm-os-stage-title"><span class="gm-os-stage-dot" style="background:${etapa.color}"></span><h3>${etapa.label}</h3><span class="gm-os-stage-count">${itens.length}</span></div>
        <div class="gm-os-stage-list">${itens.length?itens.map(o=>this._osCard(o)).join(''):'<p class="gm-os-stage-empty">Nenhuma OS nesta etapa</p>'}</div>
      </section>`;
    }).join('');
    const meses=`<option value="all" ${mes==='all'?'selected':''}>Todos os meses</option>`+this._monthOptions().map(m=>`<option value="${m.key}" ${m.key===mes?'selected':''}>${m.label}</option>`).join('');
    const periodos=[['todos','Todos'],['hoje','Hoje'],['semana','Últimos 7 dias'],['q15','Últimos 15 dias']].map(([key,label])=>`<button type="button" class="gm-os-period${periodo===key?' active':''}" aria-pressed="${periodo===key}" onclick="window._garcia.setOSPeriodFilter('${key}')">${label}</button>`).join('');
    el.innerHTML=`<div class="gm-os-page" style="animation:fadeIn .25s ease;">
      <section class="gm-os-flow-panel" aria-label="Fluxo de atendimento">
        <div class="gm-os-section-head"><div><h2>Fluxo de atendimento</h2><p>Abra um card para ver os detalhes. Para mudar a etapa, use “Editar OS e status”.</p></div><span class="gm-os-total">${abertas.length} ${abertas.length===1?'OS aberta':'OS abertas'}</span></div>
        <div class="gm-os-flow-scroll"><div class="gm-os-flow">${colunas}</div></div>
      </section>
      <section class="gm-os-history-panel" aria-label="Histórico de ordens concluídas">
        <div class="gm-os-section-head"><div><h2>Histórico de OS concluídas</h2><p>Atendimentos encerrados continuam disponíveis para consulta.</p></div><span class="gm-os-total">${concluidas.length} concluídas</span></div>
        <div class="gm-os-history-filters"><label class="gm-os-search-label">Buscar no histórico<input id="gm-os-history-search" type="search" placeholder="Cliente, veículo, placa ou serviço" value="${this._osEscape(this._osHistoricoBusca||'')}" oninput="window._garcia._buscarOSHistorico(this.value)"></label><label class="gm-os-month-label">Mês<select onchange="window._garcia.setOSMonthFilter(this.value)">${meses}</select></label></div>
        <div class="gm-os-periods"><span>Período:</span>${periodos}</div>
        <div class="gm-os-history-list">${historico.map(o=>`<div class="gm-os-history-item">${this._osCard(o,true)}</div>`).join('')}</div>
        <p id="gm-os-history-empty" class="gm-os-history-empty" ${historico.length?'hidden':''}>Nenhuma OS concluída encontrada para este filtro.</p>
      </section>
    </div>`;
    if(this._osHistoricoBusca)this._buscarOSHistorico(this._osHistoricoBusca);
  }
  _buscarOSHistorico(value){
    this._osHistoricoBusca=value;
    const query=String(value||'').toLocaleLowerCase('pt-BR').trim();
    let shown=0;
    document.querySelectorAll('.gm-os-history-item').forEach(item=>{
      const match=!query||item.textContent.toLocaleLowerCase('pt-BR').includes(query);
      item.hidden=!match;
      if(match)shown++;
    });
    const empty=document.getElementById('gm-os-history-empty');
    if(empty)empty.hidden=shown>0;
  }
  _abrirAtendimento(id){
    const o=this.state.ordens.find(x=>x.id==id);
    if(!o)return;
    const c=this.state.clientes.find(x=>x.id==o.cliente_id)||o.clientes||{};
    const esc=(value)=>this._osEscape(value);
    const servico=this._parseSrv(o.servico);
    const mecanico=this._parseMec(o.servico);
    const clienteId=Number(c.id||o.cliente_id);
    const clienteAction=Number.isFinite(clienteId)?`<button type="button" class="gm-os-action gm-os-action-secondary" onclick="window._garcia._modalHistoricoCliente(${clienteId})">Ver histórico completo do cliente</button>`:'';
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='680px';box.style.maxHeight='85vh';box.style.overflowY='auto';}
    this._openModal(`<div class="gm-os-detail">
      <div class="gm-os-detail-head"><div><span class="gm-os-detail-number">OS #${esc(o.id)}</span><h2>${esc(c.nome||'Cliente não informado')}</h2><p>${esc(o.veiculo||'Veículo não informado')}${o.placa?' · '+esc(o.placa):''}</p></div><button type="button" class="gm-os-detail-close" onclick="window._garcia._closeModal()" aria-label="Fechar atendimento">×</button></div>
      <div class="gm-os-detail-grid">
        <div><span>Telefone</span><strong>${esc(c.telefone||'Não informado')}</strong></div>
        <div><span>Email</span><strong>${esc(c.email||'Não informado')}</strong></div>
        <div><span>Data da OS</span><strong>${esc(this._dfmt(o.data))}</strong></div>
        <div><span>Status</span><strong>${esc(o.status||'Não informado')}</strong></div>
        <div><span>Mecânico</span><strong>${esc(mecanico)}</strong></div>
        <div><span>Placa</span><strong>${esc(o.placa||'Não informada')}</strong></div>
        <div><span>Pagamento</span><strong>${esc(o.status_pagamento||'Não informado')}</strong></div>
        <div><span>Valor pago</span><strong>${esc(this._fmt(o.valor_pago))}</strong></div>
      </div>
      <div class="gm-os-detail-section"><h3>Serviços</h3><p>${esc(servico)}</p></div>
      ${c.id&&this._getObs(c.id)?`<div class="gm-os-detail-section"><h3>Observações do cliente</h3><p>${esc(this._getObs(c.id))}</p></div>`:''}
      ${o.observacoes?`<div class="gm-os-detail-section"><h3>Observações da OS</h3><p>${esc(o.observacoes)}</p></div>`:''}
      <div class="gm-os-detail-total"><span>Valor da OS</span><strong>${esc(this._fmt(o.valor))}</strong></div>
      <div class="gm-os-detail-actions">${clienteAction}<button type="button" class="gm-os-action" onclick="window._garcia._editarOS(${Number(o.id)})">Editar OS e status</button></div>
      <div class="gm-os-detail-actions gm-os-detail-more">
        <button type="button" class="gm-os-action gm-os-action-secondary" onclick="window._garcia._modalOrcamento(${Number(o.id)})">Gerar orçamento</button>
        <button type="button" class="gm-os-action gm-os-action-secondary" onclick="window._garcia._modalPIX(${Number(o.id)})">Cobrar via PIX</button>
        ${o.status!=='Concluída'||parseFloat(o.valor_pago||0)<parseFloat(o.valor||0)?`<button type="button" class="gm-os-action gm-os-action-secondary" onclick="window._garcia.concluirOS(${Number(o.id)})">${o.status==='Aguardando Pagamento'||o.status==='Concluída'?'Registrar pagamento restante':'Concluir OS'}</button>`:''}
        <button type="button" class="gm-os-action gm-os-action-danger" onclick="window._garcia.excluirOS(${Number(o.id)})">Excluir OS</button>
      </div>
    </div>`);
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
