  _modalCli(){
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Novo Cliente</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Nome *</div><input id="f-nome" placeholder="Nome completo" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Telefone</div><input id="f-tel" placeholder="(22) 99999-9999" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Email</div><input id="f-email" placeholder="email@exemplo.com" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <button id="btn-save-cli" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">SALVAR</button>
      </div>`);
    document.getElementById('btn-save-cli').onclick = () => this._saveCli();
  }

  async _saveCli(){
    const nome=document.getElementById('f-nome')?.value?.trim();
    const tel=document.getElementById('f-tel')?.value?.trim();
    const email=document.getElementById('f-email')?.value?.trim();
    if(!nome){this._toast('Nome obrigatório',false);return;}
    try{
      const {error}=await this._db.from('clientes').insert({nome,telefone:tel,email});
      if(error)throw error;
      this._closeModal();this._toast('Cliente cadastrado!');await this._load();
    }catch(e){this._toast('Erro: '+e.message,false);}
  }

  _modalRec(){
    const opts=this.state.clientes.map(c=>`<option value="${c.id}">${c.nome}</option>`).join('');
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Nova Receita</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Cliente</div><select id="f-rcli" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;"><option value="">Selecione...</option>${opts}</select></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Valor (R$) *</div><input id="f-rval" type="number" placeholder="0,00" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Data *</div><input id="f-rdat" type="date" value="${this._today()}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Forma</div><select id="f-rfor" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;"><option>Pix</option><option>Cartão</option><option>Dinheiro</option></select></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Status</div><select id="f-rst" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;"><option>Pago</option><option>Pendente</option></select></div>
        </div>
        <button id="btn-save-rec" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">SALVAR</button>
      </div>`);
    document.getElementById('btn-save-rec').onclick = () => this._saveRec();
  }

  async _saveRec(){
    const cli=document.getElementById('f-rcli')?.value;
    const val=parseFloat(document.getElementById('f-rval')?.value||0);
    const dat=document.getElementById('f-rdat')?.value;
    const forma=document.getElementById('f-rfor')?.value;
    const status=document.getElementById('f-rst')?.value;
    if(!val||!dat){this._toast('Preencha valor e data',false);return;}
    try{
      const {error}=await this._db.from('faturamentos').insert({cliente_id:cli?parseInt(cli):null,valor:val,data:dat,forma:forma,status});
      if(error)throw error;
      this._closeModal();this._toast('Receita registrada!');await this._load();
    }catch(e){this._toast('Erro: '+e.message,false);}
  }

  _modalDep(id){
    const d=id?this.state.despesas.find(x=>x.id===id):null;
    this._editDepId=id||null;
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">${d?'Editar Despesa':'Nova Despesa'}</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Descrição *</div><input id="f-ddesc" placeholder="Ex: Compra de peças" value="${(d?.descricao||'').replace(/"/g,'&quot;')}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Categoria</div><select id="f-dcat" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;">${['Peças','Salários','Aluguel','Energia','Água','Internet','Alimentação','Limpeza','Outros'].map(c=>`<option ${d?.cat===c?'selected':''}>${c}</option>`).join('')}</select></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Tipo</div><select id="f-dtipo" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;">${['Variável','Fixa'].map(t=>`<option ${d?.tipo===t?'selected':''}>${t}</option>`).join('')}</select></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Valor (R$) *</div><input id="f-dval" type="number" placeholder="0,00" value="${d?.valor||''}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Data *</div><input id="f-ddat" type="date" value="${d?.data||this._today()}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Comprovante (foto/PDF)</div>
          <input id="f-dcomp" type="file" accept="image/*,.pdf" style="width:100%;padding:8px;border:2px dashed #E5E7EB;border-radius:8px;font-size:12px;background:#FAFAFA;">
          <div id="dcomp-preview" style="font-size:11px;color:#10B981;margin-top:4px;">${d?.comprovante?'✓ '+(d.comprovante_nome||'comprovante')+' já anexado (escolha outro arquivo para substituir)':''}</div>
        </div>
        <!-- Recorrente toggle -->
        <div onclick="window._garcia._toggleRecorrente()" id="rec-toggle-wrap" style="display:flex;align-items:center;justify-content:space-between;background:#F9FAFB;border:2px solid #E5E7EB;border-radius:10px;padding:12px 16px;cursor:pointer;transition:border-color .2s;">
          <div>
            <div style="font-size:12px;font-weight:700;color:#374151;">🔄 Despesa Recorrente</div>
            <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">Luz, água, aluguel — lançada todo mês automaticamente</div>
          </div>
          <div id="rec-toggle" style="width:40px;height:22px;background:${d?.recorrente?'#10B981':'#E5E7EB'};border-radius:11px;position:relative;transition:background .2s;flex-shrink:0;">
            <div id="rec-knob" style="position:absolute;top:3px;left:${d?.recorrente?'21px':'3px'};width:16px;height:16px;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:left .2s;"></div>
          </div>
        </div>
        <button id="btn-save-dep" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">${d?'SALVAR ALTERAÇÕES':'SALVAR'}</button>
      </div>`);
    document.getElementById('btn-save-dep').onclick = () => this._saveDep();
    window._recorrente = !!d?.recorrente;
    if(d){ const wrap=document.getElementById('rec-toggle-wrap'); if(wrap) wrap.style.borderColor=d.recorrente?'#10B981':'#E5E7EB'; }
    this._nfDataUrl=null; this._depCompNome=null;
    document.getElementById('f-dcomp').addEventListener('change',(e)=>this._handleNFUpload(e,'dcomp-preview',()=>{this._depCompNome=e.target.files[0]?.name||null;}));
  }

  _toggleRecorrente(){
    window._recorrente = !window._recorrente;
    const tog=document.getElementById('rec-toggle');
    const knob=document.getElementById('rec-knob');
    const wrap=document.getElementById('rec-toggle-wrap');
    if(tog) tog.style.background=window._recorrente?'#10B981':'#E5E7EB';
    if(knob) knob.style.left=window._recorrente?'21px':'3px';
    if(wrap) wrap.style.borderColor=window._recorrente?'#10B981':'#E5E7EB';
  }

  async _saveDep(){
    const desc=document.getElementById('f-ddesc')?.value?.trim();
    const cat=document.getElementById('f-dcat')?.value;
    const tipo=document.getElementById('f-dtipo')?.value;
    const val=parseFloat(document.getElementById('f-dval')?.value||0);
    const dat=document.getElementById('f-ddat')?.value;
    const recorrente=window._recorrente||false;
    if(!desc||!val||!dat){this._toast('Preencha todos os campos',false);return;}
    const editId=this._editDepId;
    const antiga=editId?this.state.despesas.find(x=>x.id===editId):null;
    const comprovanteFinal=this._nfDataUrl||antiga?.comprovante||null;
    const comprovanteNomeFinal=this._depCompNome||antiga?.comprovante_nome||null;
    const nova={descricao:desc,cat,tipo,valor:val,data:dat,recorrente,comprovante:comprovanteFinal,comprovante_nome:comprovanteNomeFinal};
    this._desbloquearRec(desc);
    try {
      if(editId){
        const {error}=await this._db.from('despesas').update(nova).eq('id',editId);
        if(!error){ this._nfDataUrl=null;this._depCompNome=null;this._editDepId=null; await this._load(); this._closeModal(); this._toast('Despesa atualizada!'); return; }
      } else {
        const {data,error}=await this._db.from('despesas').insert([nova]).select();
        if(!error && data?.[0]) { this._nfDataUrl=null;this._depCompNome=null; await this._load(); this._closeModal(); this._toast(recorrente?'Despesa recorrente salva! 🔄':'Despesa lançada!'); return; }
        this._errNuvem=error;
      }
    } catch(e){ this._errNuvem=e; }
    /* fallback localStorage */
    this._nfDataUrl=null;this._depCompNome=null;
    let dep;
    if(editId){ dep=this.state.despesas.map(x=>x.id===editId?{...x,...nova}:x); this._editDepId=null; }
    else { dep=[...this.state.despesas,{id:Date.now(),...nova}]; }
    localStorage.setItem('g_dep',JSON.stringify(dep));
    this.setState({despesas:dep},()=>this._render());
    this._closeModal();
    this._falhaNuvem('Despesa "'+(nova.descricao||'')+'" de '+this._fmt(nova.valor),this._errNuvem);
  }

  _modalComprovantes(){
    const list=(this.state.despesas||[]).filter(d=>d.comprovante).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='560px';box.style.maxHeight='80vh';box.style.overflowY='auto';}
    const rows=list.map(d=>{
      const isImg=(d.comprovante||'').startsWith('data:image');
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border:1px solid #F3F4F6;border-radius:10px;margin-bottom:8px;">
        ${isImg?`<img src="${d.comprovante}" style="width:44px;height:44px;object-fit:cover;border-radius:8px;flex-shrink:0;">`:`<div style="width:44px;height:44px;background:#F3F4F6;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📄</div>`}
        <div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:700;color:#374151;">${d.descricao||'—'}</div><div style="font-size:10px;color:#9CA3AF;margin-top:2px;">${this._dfmt(d.data)} · ${d.cat||''} · ${this._fmt(d.valor)}</div></div>
        <button onclick="window._garcia._verComprovanteDep(${d.id})" style="background:#EEF2FF;color:#4338CA;border:none;border-radius:6px;padding:6px 10px;font-size:10px;font-weight:700;cursor:pointer;flex-shrink:0;">Ver</button>
        <button onclick="window._garcia._excluirComprovanteDep(${d.id})" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:6px 10px;font-size:10px;font-weight:700;cursor:pointer;flex-shrink:0;">Excluir</button>
      </div>`;
    }).join('');
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">📎 Histórico de Comprovantes</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      ${rows||'<div style="text-align:center;color:#9CA3AF;font-size:12px;padding:24px;">Nenhum comprovante anexado ainda.</div>'}
    `);
  }

  async _gerarRecorrentes(){
    const {despesas}=this.state;
    const now=new Date();
    const curKey=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
    const hoje=this._today();
    // Pega todas recorrentes únicas (por descrição)
    const recorrentes=[...new Map(despesas.filter(d=>d.recorrente&&!this._isBloq(d.descricao)).map(d=>[d.descricao,d])).values()];
    if(!recorrentes.length){this._toast('Nenhuma despesa recorrente cadastrada');return;}
    // Filtra as que já existem no mês atual
    const existentes=despesas.filter(d=>this._mkey(d.data)===curKey).map(d=>d.descricao);
    const novas=recorrentes.filter(d=>!existentes.includes(d.descricao));
    if(!novas.length){this._toast('Todas as recorrentes já foram lançadas este mês ✅');return;}
    let criadas=0;
    for(const d of novas){
      const nova={descricao:d.descricao,cat:d.cat,tipo:d.tipo,valor:d.valor,data:hoje,recorrente:true};
      try{
        const {error}=await this._db.from('despesas').insert([nova]);
        if(!error) criadas++;
      }catch(e){
        const dep=[...this.state.despesas,{id:Date.now(),...nova}];
        localStorage.setItem('g_dep',JSON.stringify(dep));
        this.setState({despesas:dep});
        this._falhaNuvem('Despesa recorrente "'+(nova.descricao||'')+'"',e);
        criadas++;
      }
    }
    await this._load();
    this._toast(`${criadas} despesa(s) recorrente(s) gerada(s)! 🔄`);
  }

