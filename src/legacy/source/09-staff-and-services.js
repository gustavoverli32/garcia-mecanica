  _modalFunc(){
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Novo Funcionário</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Nome *</div><input id="fn-nome" placeholder="Nome completo" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Telefone</div><input id="fn-tel" placeholder="(22) 99999-9999" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div>
          <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Cargo *</div>
          <div style="display:flex;gap:10px;">
            <label onclick="window._garcia._selCargo('mecanico')" id="cargo-mec" style="flex:1;padding:12px;border:2px solid #FFC107;border-radius:10px;background:#FFFBEB;cursor:pointer;text-align:center;">
              <div style="font-size:20px;margin-bottom:4px;">🔧</div>
              <div style="font-size:12px;font-weight:700;color:#92400E;">Mecânico</div>
            </label>
            <label onclick="window._garcia._selCargo('ajudante')" id="cargo-aj" style="flex:1;padding:12px;border:2px solid #E5E7EB;border-radius:10px;background:#fff;cursor:pointer;text-align:center;">
              <div style="font-size:20px;margin-bottom:4px;">🪛</div>
              <div style="font-size:12px;font-weight:700;color:#374151;">Ajudante</div>
            </label>
            <label onclick="window._garcia._selCargo('administrativo')" id="cargo-adm" style="flex:1;padding:12px;border:2px solid #E5E7EB;border-radius:10px;background:#fff;cursor:pointer;text-align:center;">
              <div style="font-size:20px;margin-bottom:4px;">📋</div>
              <div style="font-size:12px;font-weight:700;color:#374151;">Administrativo</div>
            </label>
          </div>
          <input type="hidden" id="fn-cargo" value="mecanico">
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Salário (R$)</div><input id="fn-salario" type="number" placeholder="0,00" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Vale adiantado (R$)</div><input id="fn-vale" type="number" placeholder="0,00" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        </div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Comissão (%) — só mecânico</div><input id="fn-comissao" type="number" value="15" min="0" max="100" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"><div style="font-size:10px;color:#9CA3AF;margin-top:4px;">Percentual sobre a mão de obra das OS concluídas.</div></div>
        <button id="btn-save-func" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">SALVAR</button>
      </div>`);
    document.getElementById('btn-save-func').onclick = () => this._saveFunc();
  }

  _modalServicos(editId){
    const servicos=this.state.servicos||[];
    const editing=editId?servicos.find(s=>s.id===editId):null;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='560px';box.style.maxHeight='85vh';box.style.overflowY='auto';}
    const rows=[...servicos].sort((a,b)=>(a.nome||'').localeCompare(b.nome||'')).map(s=>`
      <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;border:1px solid #F3F4F6;border-radius:9px;margin-bottom:6px;">
        <div style="flex:1;font-size:12px;font-weight:600;color:#374151;">${s.nome}</div>
        <button onclick="window._garcia._modalServicos(${s.id})" style="background:#EEF2FF;color:#4338CA;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer;">Editar</button>
        <button onclick="window._garcia._excluirServico(${s.id})" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer;">Excluir</button>
      </div>`).join('');
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Serviços</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <input id="f-serv-nome" placeholder="Nome do serviço" value="${editing?editing.nome.replace(/"/g,'&quot;'):''}" style="flex:1;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;">
        <button onclick="window._garcia._salvarServico(${editing?editing.id:'null'})" style="background:#FFC107;border:none;border-radius:8px;padding:0 16px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#000;cursor:pointer;white-space:nowrap;">${editing?'Salvar':'+ Adicionar'}</button>
      </div>
      ${servicos.length===0?`<button onclick="window._garcia._seedServicos()" style="width:100%;padding:10px;background:#FFFBEB;border:1px dashed #FDE68A;border-radius:8px;font-size:12px;font-weight:700;color:#92400E;cursor:pointer;margin-bottom:14px;">📋 Carregar catálogo padrão da Garcia</button>`:''}
      <div>${rows||'<div style="text-align:center;color:#9CA3AF;font-size:12px;padding:20px;">Nenhum serviço cadastrado ainda.</div>'}</div>
    `);
  }
  async _salvarServico(id){
    const nome=document.getElementById('f-serv-nome')?.value?.trim();
    if(!nome){this._toast('Nome obrigatório',false);return;}
    try{
      if(id){ const {error}=await this._db.from('servicos').update({nome}).eq('id',id); if(error)throw error; }
      else { const {error}=await this._db.from('servicos').insert([{nome,ativo:true}]); if(error)throw error; }
      await this._load(); this._toast(id?'Serviço atualizado!':'Serviço adicionado!'); this._modalServicos();
    }catch(e){ this._toast('Erro: '+(e.message||e)+' (crie a tabela "servicos")',false); }
  }
  async _excluirServico(id){
    if(!confirm('Excluir este serviço do catálogo?'))return;
    try{ await this._db.from('servicos').delete().eq('id',id); await this._load(); this._toast('Serviço removido!'); this._modalServicos(); }catch(e){ this._toast('Erro ao excluir',false); }
  }
  async _seedServicos(){
    const nomes=["Escaneamento (diagnóstico eletrônico)","Teste de sonda lambda","Teste dos bicos injetores","Limpeza do sistema de arrefecimento","Troca de óleo e filtro de óleo","Troca de filtro de combustível","Troca de junta da tampa de tucho","Troca de bicos injetores","Troca de bobina","Troca de junta do cárter","Troca da boia de combustível","Troca de mangueira de combustível","Troca de tampa de combustível","Troca de atuador do motor","Troca de calço do motor","Conectar fio de arranque","Troca de vela de ignição","Troca de válvula termostática","Troca de sensor de ABS","Troca de pivô","Troca de ponteira","Troca de pastilha de freio","Troca de rolamento","Troca de flange de água","Troca de filtro de cabine","Troca de lona de freio","Troca de cilindro de freio","Sangria de freio (4 rodas)","Troca de sensor ABS traseiro","Troca de bomba de óleo","Troca de pistão","Troca de anéis do motor","Troca de bronzina de biela","Troca de bronzina fixa","Troca de jogo de junta do motor","Troca de retentores","Troca de óleo de freio","Troca de correia elástica","Troca de tensor poli V","Montagem/desmontagem de câmbio","Manutenção de embreagem","Troca de coifa da trizeta","Troca de coifa da homocinética","Troca de balancim"];
    try{
      await this._db.from('servicos').insert(nomes.map(nome=>({nome,ativo:true})));
      await this._load(); this._toast('Catálogo carregado!'); this._modalServicos();
    }catch(e){ this._toast('Erro: '+(e.message||e)+' (crie a tabela "servicos")',false); }
  }
  _selCargo(cargo){
    document.getElementById('fn-cargo').value=cargo;
    const els={mecanico:document.getElementById('cargo-mec'),ajudante:document.getElementById('cargo-aj'),administrativo:document.getElementById('cargo-adm')};
    const on={mecanico:['#FFC107','#FFFBEB'],ajudante:['#818CF8','#EEF2FF'],administrativo:['#34D399','#ECFDF5']};
    Object.entries(els).forEach(([k,e])=>{ if(!e)return; if(k===cargo){e.style.borderColor=on[k][0];e.style.background=on[k][1];} else {e.style.borderColor='#E5E7EB';e.style.background='#fff';} });
  }

  async _saveFunc(){
    const nome=document.getElementById('fn-nome')?.value?.trim();
    const tel=document.getElementById('fn-tel')?.value?.trim();
    const cargo=document.getElementById('fn-cargo')?.value||'mecanico';
    const salario=parseFloat(document.getElementById('fn-salario')?.value||0);
    const vale=parseFloat(document.getElementById('fn-vale')?.value||0);
    const comissao=parseFloat(document.getElementById('fn-comissao')?.value||15);
    if(!nome){this._toast('Nome obrigatório',false);return;}
    const novo={nome,tel,cargo,ativo:true,criado:this._today(),salario,vale};
    try {
      const {data,error}=await this._db.from('funcionarios').insert([{...novo,comissao}]).select();
      if(!error && data?.[0]) { await this._load(); this._closeModal(); this._toast('Funcionário cadastrado!'); return; }
      /* coluna comissao pode não existir — tenta sem ela */
      const {data:d2,error:e2}=await this._db.from('funcionarios').insert([novo]).select();
      if(!e2 && d2?.[0]) { this._setComLocal(d2[0].id,comissao); await this._load(); this._closeModal(); this._toast('Funcionário cadastrado!'); return; }
      this._errNuvem=e2;
    } catch(e){ this._errNuvem=e; }
    /* fallback localStorage */
    const func=[...this.state.funcionarios,{id:Date.now(),...novo,comissao}];
    localStorage.setItem('g_func',JSON.stringify(func));
    this.setState({funcionarios:func},()=>this._render());
    this._closeModal();
    this._falhaNuvem('Funcionário "'+nome+'"',this._errNuvem);
  }

  _modalVale(id){
    const f=this.state.funcionarios.find(x=>x.id===id);
    if(!f)return;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='380px';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Vale — ${f.nome}</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="font-size:11px;color:#9CA3AF;margin-bottom:10px;">Salário: ${this._fmt(f.salario)} · Vale atual: ${this._fmt(f.vale)}</div>
      <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Novo valor do vale adiantado (R$)</div>
      <input id="fn-vale-edit" type="number" value="${f.vale||0}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;margin-bottom:14px;">
      <button onclick="window._garcia._salvarVale(${id})" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">SALVAR</button>
    `);
  }

  async _salvarVale(id){
    const vale=parseFloat(document.getElementById('fn-vale-edit')?.value||0);
    try{ const {error}=await this._db.from('funcionarios').update({vale}).eq('id',id); if(error)throw error; await this._load(); this._closeModal(); this._toast('Vale atualizado!'); return; }catch(e){ this._errNuvem=e; }
    const func=this.state.funcionarios.map(f=>f.id===id?{...f,vale}:f);
    localStorage.setItem('g_func',JSON.stringify(func));
    this.setState({funcionarios:func},()=>this._render());
    this._closeModal();
    this._falhaNuvem('Vale de '+this._fmt(vale),this._errNuvem);
  }

  /* ===== Perfil do Funcionário ===== */
  _fCargoLabel(c){return c==='mecanico'?'🔧 Mecânico':c==='administrativo'?'📋 Administrativo':'🪛 Ajudante';}
  _getCom(f){ if(f&&f.comissao!=null&&f.comissao!=='')return parseFloat(f.comissao); try{const m=JSON.parse(localStorage.getItem('g_func_com')||'{}');return m[f.id]!=null?parseFloat(m[f.id]):15;}catch(e){return 15;} }
  _setComLocal(id,v){ try{const m=JSON.parse(localStorage.getItem('g_func_com')||'{}');m[id]=v;localStorage.setItem('g_func_com',JSON.stringify(m));}catch(e){} }
  _maoDeObraOS(o){
    try{ const arr=JSON.parse(o.servico); if(Array.isArray(arr)){ const s=arr.reduce((t,x)=>t+parseFloat(x.valor||0),0); if(s>0)return s; } }catch(e){}
    let pecas=0; try{ const p=JSON.parse(o.pecas||'[]'); if(Array.isArray(p))pecas=p.reduce((t,x)=>t+parseFloat(x.valor||0),0); }catch(e){}
    return Math.max(parseFloat(o.valor||0)-pecas,0);
  }
  _mecDaOS(o){
    const {funcionarios}=this.state;
    let f=o.mecanico_id?funcionarios.find(x=>x.id==o.mecanico_id):null;
    if(!f){ const nome=this._parseMec(o.servico); if(nome&&nome!=='—') f=funcionarios.find(x=>x.nome===nome); }
    return f&&f.cargo==='mecanico'?f:null;
  }
  _getFPags(f){ if(Array.isArray(f.pagamentos))return f.pagamentos; try{const all=JSON.parse(localStorage.getItem('g_func_pags')||'{}');return all[f.id]||[];}catch(e){return[];} }
  async _saveFPags(id,list){
    try{ const {error}=await this._db.from('funcionarios').update({pagamentos:list}).eq('id',id); if(error)throw error; await this._load(); return; }catch(e){ this._errNuvem=e; }
    try{const all=JSON.parse(localStorage.getItem('g_func_pags')||'{}');all[id]=list;localStorage.setItem('g_func_pags',JSON.stringify(all));}catch(e){}
    const func=this.state.funcionarios.map(f=>f.id===id?{...f}:f);
    this.setState({funcionarios:func});
    this._falhaNuvem('Histórico de pagamentos do funcionário',this._errNuvem);
  }
  _getFObs(f){ if(f.obs!=null&&f.obs!=='')return f.obs; try{const all=JSON.parse(localStorage.getItem('g_func_obs')||'{}');return all[f.id]||'';}catch(e){return'';} }
  async _salvarFObs(id){
    const txt=document.getElementById('fp-obs')?.value||'';
    try{ const {error}=await this._db.from('funcionarios').update({obs:txt}).eq('id',id); if(error)throw error; await this._load(); this._toast('Observações salvas!'); return; }catch(e){ this._errNuvem=e; }
    try{const all=JSON.parse(localStorage.getItem('g_func_obs')||'{}');all[id]=txt;localStorage.setItem('g_func_obs',JSON.stringify(all));}catch(e){}
    this._falhaNuvem('Observações do funcionário',this._errNuvem);
  }

  _modalFuncionario(id){
    const f=this.state.funcionarios.find(x=>x.id===id);
    if(!f)return;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='600px';box.style.maxHeight='88vh';box.style.overflowY='auto';}
    const pags=[...this._getFPags(f)].sort((a,b)=>(b.data||'').localeCompare(a.data||''));
    const tipoTag=(t)=>t==='Salário'?'background:#ECFDF5;color:#059669;':t==='Vale'?'background:#FEF3C7;color:#B45309;':t==='Comissão'?'background:#FFFBEB;color:#92400E;':'background:#EEF2FF;color:#4338CA;';
    const pagRows=pags.map(p=>`<tr style="border-bottom:1px solid #F9F9F9;">
      <td style="padding:8px 12px;font-size:11px;color:#6B7280;white-space:nowrap;">${this._dfmt(p.data)}</td>
      <td style="padding:8px 12px;text-align:center;"><span style="${tipoTag(p.tipo)}font-size:9px;font-weight:700;padding:3px 9px;border-radius:20px;">${p.tipo}</span></td>
      <td style="padding:8px 12px;font-size:11px;color:#6B7280;">${p.obs||'—'}</td>
      <td style="padding:8px 12px;font-size:12px;font-weight:700;color:#059669;text-align:right;white-space:nowrap;">${this._fmt(p.valor)}</td>
      <td style="padding:8px 12px;text-align:center;"><button onclick="window._garcia._delPagFunc(${id},${p.id})" title="Excluir" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;width:22px;height:22px;cursor:pointer;font-size:11px;">✕</button></td>
    </tr>`).join('');
    const bg=f.cargo==='mecanico'?'#FFFBEB':f.cargo==='administrativo'?'#ECFDF5':'#EEF2FF';
    const ic=f.cargo==='mecanico'?'🔧':f.cargo==='administrativo'?'📋':'🪛';
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:48px;height:48px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${ic}</div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${f.nome}</div>
              <button onclick="window._garcia._modalEditarFunc(${id})" title="Editar informações" style="background:#F3F4F6;border:none;border-radius:6px;width:22px;height:22px;cursor:pointer;font-size:11px;">✎</button>
            </div>
            <div style="font-size:11px;color:#9CA3AF;margin-top:3px;">${this._fCargoLabel(f.cargo)}${f.cargo==='mecanico'?` · Comissão ${this._getCom(f)}%`:''} · ${f.tel||'sem telefone'} · Desde ${this._dfmt(f.criado)}</div>
          </div>
        </div>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;flex-shrink:0;">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr${f.cargo==='mecanico'?' 1fr':''};gap:10px;margin-bottom:16px;">
        <div style="background:#FAFAFA;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Salário</div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">${this._fmt(f.salario)}</div></div>
        <div style="background:#FAFAFA;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Vale</div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:${(f.vale||0)>0?'#DC2626':'#111'};">${this._fmt(f.vale)}</div></div>
        <div style="background:#FAFAFA;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">A Receber</div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#059669;">${this._fmt((parseFloat(f.salario||0))-(parseFloat(f.vale||0)))}</div></div>
        ${f.cargo==='mecanico'?`<div style="background:#FFFBEB;border-radius:10px;padding:12px;text-align:center;"><div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Comissões (mês)</div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#92400E;">${this._fmt(pags.filter(p=>p.tipo==='Comissão'&&this._mkey(p.data)===new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0')).reduce((s,p)=>s+parseFloat(p.valor||0),0))}</div></div>`:''}
      </div>
      <div style="display:flex;gap:8px;margin-bottom:20px;">
        <button onclick="window._garcia._modalVale(${id})" style="flex:1;padding:10px;background:#FFFBEB;color:#92400E;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">💰 Editar Vale</button>
        <button onclick="window._garcia._modalPagFunc(${id})" style="flex:1;padding:10px;background:#FFC107;color:#000;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">➕ Registrar Pagamento</button>
      </div>
      <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Histórico de Pagamentos</div>
      <div style="border:1px solid #F3F4F6;border-radius:10px;overflow:hidden;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="background:#FAFAFA;">
            <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;text-align:left;">Data</th>
            <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;text-align:center;">Tipo</th>
            <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;text-align:left;">Descrição</th>
            <th style="padding:8px 12px;font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;text-align:right;">Valor</th>
            <th style="padding:8px 12px;"></th>
          </tr></thead>
          <tbody>${pagRows||'<tr><td colspan="5" style="padding:20px;text-align:center;color:#9CA3AF;font-size:12px;">Nenhum pagamento registrado.</td></tr>'}</tbody>
        </table>
      </div>
      <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Observações</div>
      <textarea id="fp-obs" rows="3" placeholder="Anotações sobre o funcionário..." style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:inherit;resize:vertical;box-sizing:border-box;">${(this._getFObs(f)||'').replace(/</g,'&lt;')}</textarea>
      <button onclick="window._garcia._salvarFObs(${id})" style="width:100%;margin-top:8px;padding:10px;background:#F3F4F6;color:#374151;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">Salvar Observações</button>
    `);
  }

  _modalEditarFunc(id){
    const f=this.state.funcionarios.find(x=>x.id===id);
    if(!f)return;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='380px';box.style.maxHeight='';box.style.overflowY='visible';}
    const opt=(v,l)=>`<option value="${v}" ${f.cargo===v?'selected':''}>${l}</option>`;
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Editar Funcionário</div>
        <button onclick="window._garcia._modalFuncionario(${id})" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Nome *</div><input id="fe-nome" value="${(f.nome||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Telefone</div><input id="fe-tel" value="${(f.tel||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Cargo</div><select id="fe-cargo" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;">${opt('mecanico','🔧 Mecânico')}${opt('ajudante','🪛 Ajudante')}${opt('administrativo','📋 Administrativo')}</select></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Salário (R$)</div><input id="fe-salario" type="number" value="${f.salario||0}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Comissão (%) — só mecânico</div><input id="fe-comissao" type="number" value="${this._getCom(f)}" min="0" max="100" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
        <button onclick="window._garcia._salvarEdicaoFunc(${id})" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">SALVAR</button>
      </div>`);
  }

  async _salvarEdicaoFunc(id){
    const nome=document.getElementById('fe-nome')?.value?.trim();
    const tel=document.getElementById('fe-tel')?.value?.trim();
    const cargo=document.getElementById('fe-cargo')?.value||'mecanico';
    const salario=parseFloat(document.getElementById('fe-salario')?.value||0);
    const comissao=parseFloat(document.getElementById('fe-comissao')?.value||15);
    if(!nome){this._toast('Nome obrigatório',false);return;}
    const upd={nome,tel,cargo,salario};
    try{ const {error}=await this._db.from('funcionarios').update({...upd,comissao}).eq('id',id); if(error)throw error; await this._load(); }
    catch(e){
      try{ const {error:e2}=await this._db.from('funcionarios').update(upd).eq('id',id); if(e2)throw e2; this._setComLocal(id,comissao); await this._load(); }
      catch(e3){
        const func=this.state.funcionarios.map(f=>f.id===id?{...f,...upd,comissao}:f);
        localStorage.setItem('g_func',JSON.stringify(func));
        this.setState({funcionarios:func},()=>this._render());
        this._falhaNuvem('Cadastro do funcionário '+nome,e3);
        this._closeModal();
        return;
      }
    }
    this._toast('Funcionário atualizado!');
    this._modalFuncionario(id);
  }

  _modalPagFunc(id){
    const f=this.state.funcionarios.find(x=>x.id===id);
    if(!f)return;
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='380px';box.style.maxHeight='';box.style.overflowY='visible';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Pagamento — ${f.nome}</span>
        <button onclick="window._garcia._modalFuncionario(${id})" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Data</div><input id="fp-data" type="date" value="${this._today()}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Tipo</div><select id="fp-tipo" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;"><option>Salário</option><option>Vale</option><option>Extra</option></select></div>
        </div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Valor (R$) *</div><input id="fp-valor" type="number" placeholder="0,00" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Descrição (opcional)</div><input id="fp-desc" placeholder="Ex: salário de julho" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;box-sizing:border-box;"></div>
        <button onclick="window._garcia._salvarPagFunc(${id})" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">REGISTRAR</button>
      </div>`);
  }

  async _salvarPagFunc(id){
    const f=this.state.funcionarios.find(x=>x.id===id);
    if(!f)return;
    const valor=parseFloat(document.getElementById('fp-valor')?.value||0);
    if(!valor){this._toast('Informe o valor',false);return;}
    const pag={id:Date.now(),data:document.getElementById('fp-data')?.value||this._today(),tipo:document.getElementById('fp-tipo')?.value||'Salário',valor,obs:document.getElementById('fp-desc')?.value?.trim()||''};
    /* Salário já é lançado automaticamente todo mês; Vale/Extra entram como despesa aqui */
    if(pag.tipo!=='Salário'){
    const desp={descricao:`${pag.tipo} — ${f.nome}${pag.obs?' ('+pag.obs+')':''}`,cat:'Salários',tipo:'Fixa',valor,data:pag.data,recorrente:false};
    try{
      const {data,error}=await this._db.from('despesas').insert([desp]).select();
      if(!error && data?.[0]) pag.despesa_id=data[0].id;
      else throw error;
    }catch(e){
      pag.despesa_id='l'+Date.now();
      const dep=[...this.state.despesas,{id:pag.despesa_id,...desp}];
      localStorage.setItem('g_dep',JSON.stringify(dep));
      this.setState({despesas:dep});
      this._falhaNuvem(pag.tipo+' de '+f.nome,e);
    }
    }
    await this._saveFPags(id,[...this._getFPags(f),pag]);
    this._toast(pag.tipo==='Salário'?'Pagamento registrado!':'Pagamento registrado e lançado em Despesas!');
    this._modalFuncionario(id);
  }

  async _delPagFunc(id,pagId){
    if(!confirm('Excluir este pagamento? A despesa vinculada também será removida.'))return;
    const f=this.state.funcionarios.find(x=>x.id===id);
    if(!f)return;
    const pag=this._getFPags(f).find(p=>p.id===pagId);
    if(pag?.despesa_id){
      try{ await this._db.from('despesas').delete().eq('id',pag.despesa_id); }catch(e){}
      const dep=this.state.despesas.filter(d=>d.id!==pag.despesa_id);
      localStorage.setItem('g_dep',JSON.stringify(dep));
      this.setState({despesas:dep});
    }
    await this._saveFPags(id,this._getFPags(f).filter(p=>p.id!==pagId));
    this._toast('Pagamento excluído!');
    this._modalFuncionario(id);
  }

  async _excluirFunc(id){
    if(!confirm('Remover este funcionário?'))return;
    try { await this._db.from('funcionarios').delete().eq('id',id); await this._load(); this._toast('Funcionário removido!'); return; } catch(e){}
    const func=this.state.funcionarios.filter(f=>f.id!==id);
    localStorage.setItem('g_func',JSON.stringify(func));
    this.setState({funcionarios:func},()=>this._render());
    this._toast('Funcionário removido!');
  }
