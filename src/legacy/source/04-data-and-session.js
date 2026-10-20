
class Component extends DCLogic {
  _PWD = '123456';
  /* Usuário do Supabase Auth do desenvolvedor: a tela pede só a senha. */
  _ADMIN_EMAIL = 'dev@garcia-mecanica.app';
  _CAR_IMG = 'data:image/png;base64,__GARCIA_CAR_IMAGE_BASE64__';
  _URL = 'https://qjdvrqlcblkynheitkuk.supabase.co';
  _KEY = 'sb_publishable_WtViyZbjpmkjxjP5MFB3mw_-qCQwEXf';
  _db = null;

  state = {
    loggedIn: false, loginErr: '', page: 'dashboard', devMode: false,
    ordens: [], clientes: [], faturamentos: [], despesas: [], funcionarios: [], recomendacoesIA: [], agendamentos: [], servicos: [],
    connected: false, osFilter: 'todos', osMonthFilter: '', osPeriodFilter: 'todos', recFilter: '', depFilter: '',
  };

  componentDidMount() {
    this._mobWatch();
    if (localStorage.getItem('g_sess') === '1') {
      this.setState({ loggedIn: true }, () => this._init());
    }
    try {
      const dep = localStorage.getItem('g_dep');
      if (dep) this.setState({ despesas: JSON.parse(dep) });
      const func = localStorage.getItem('g_func');
      if (func) this.setState({ funcionarios: JSON.parse(func) });
    } catch(e) {}
  }

  async _waitForSupabase(maxMs=8000) {
    const step=50; let waited=0;
    while (!window.supabase && waited<maxMs) { await new Promise(r=>setTimeout(r,step)); waited+=step; }
    if (!window.supabase) throw new Error('Supabase SDK não carregou');
  }

  async _init() {
    try {
      await this._waitForSupabase();
      this._db = window.supabase.createClient(this._URL, this._KEY);
      if(!this._acessoReg){ this._acessoReg=true; this._adminBotao(); setTimeout(()=>this._registrarAcesso('abertura',this.state.page),1200); }
      await this._load();
    } catch(e) {
      console.error(e);
      setTimeout(()=>this._init(), 1500);
    }
  }

  async _load() {
    try {
      const [r1, r2, r3] = await Promise.all([
        this._db.from('ordens').select('*,clientes!inner(nome)').order('id',{ascending:false}),
        this._db.from('clientes').select('*').order('nome'),
        this._db.from('faturamentos').select('*,clientes!inner(nome)').order('data',{ascending:false}),
      ]);
      this.setState({ ordens: r1.data||[], clientes: r2.data||[], faturamentos: r3.data||[], connected: true });
    } catch(e) { console.error(e); }
    /* Despesas — tenta Supabase, cai no localStorage */
    try {
      const {data,error}=await this._db.from('despesas').select('*').order('data',{ascending:false});
      if(!error && data) { const del=this._depDel(); const lim=data.filter(d=>!del.includes(String(d.id))); this.setState({despesas:lim}); localStorage.setItem('g_dep',JSON.stringify(lim)); }
      else throw error;
    } catch(e) {
      try { const d=localStorage.getItem('g_dep'); if(d){ const del=this._depDel(); this.setState({despesas:JSON.parse(d).filter(x=>!del.includes(String(x.id)))}); } } catch(_){}
    }
    /* Funcionários — tenta Supabase, cai no localStorage */
    try {
      const {data,error}=await this._db.from('funcionarios').select('*').order('nome');
      if(!error && data) { this.setState({funcionarios:data}); localStorage.setItem('g_func',JSON.stringify(data)); }
      else throw error;
    } catch(e) {
      try { const f=localStorage.getItem('g_func'); if(f) this.setState({funcionarios:JSON.parse(f)}); } catch(_){}
    }
    /* Recomendações da IA */
    try {
      const {data,error}=await this._db.from('recomendacoes_ia').select('*').order('created_at',{ascending:false}).limit(30);
      if(!error && data) this.setState({recomendacoesIA:data});
    } catch(e) {}
    /* Agendamentos de revisão (tabela opcional) */
    try {
      const {data,error}=await this._db.from('agendamentos').select('*').order('data_agendada',{ascending:true});
      if(!error && data) this.setState({agendamentos:data});
    } catch(e) {}
    /* Catálogo de serviços (tabela opcional) */
    try {
      const {data,error}=await this._db.from('servicos').select('*').order('nome');
      if(!error && data) this.setState({servicos:data});
    } catch(e) {}
    await this._autoSalarios();
    this._render();
  }

  /* Traduz erros crus do Postgres para algo acionável */
  _msgErro(error){
    const m=String(error?.message||error||'');
    if(/too long for type character varying/i.test(m))
      return 'Não foi possível salvar: os nomes dos serviços passaram do limite de 255 caracteres do banco.\n\nSolução definitiva (1 minuto): Supabase → SQL Editor → cole e rode o arquivo "automacao/sql-corrigir-limite-texto.sql".\n\nPara salvar agora: encurte a descrição dos serviços ou separe em duas linhas de serviço.';
    if(/violates foreign key/i.test(m)) return 'Não foi possível salvar: o cliente ou funcionário vinculado não existe mais no banco.';
    if(/column .* does not exist/i.test(m)) return 'Não foi possível salvar: falta uma coluna na tabela do Supabase.\n\nDetalhe técnico: '+m;
    return 'Erro ao salvar: '+m;
  }

  /* Recorrências pausadas: descrições que o usuário excluiu e não devem voltar sozinhas */
  _bloqRec(){ try{ return JSON.parse(localStorage.getItem('g_dep_bloq')||'[]'); }catch(e){ return []; } }
  /* Despesas excluídas: ids que não devem reaparecer mesmo se a nuvem recusar o delete */
  _depDel(){ try{ return JSON.parse(localStorage.getItem('g_dep_del')||'[]').map(String); }catch(e){ return []; } }
  _addDepDel(id){ const l=this._depDel(); const k=String(id); if(!l.includes(k)){ l.push(k); localStorage.setItem('g_dep_del',JSON.stringify(l)); } }
  _isBloq(desc){ return this._bloqRec().includes(String(desc||'').trim().toLowerCase()); }
  _bloquearRec(desc){
    const k=String(desc||'').trim().toLowerCase(); if(!k) return;
    const l=this._bloqRec(); if(!l.includes(k)){ l.push(k); localStorage.setItem('g_dep_bloq',JSON.stringify(l)); }
  }
  _desbloquearRec(desc){
    const k=String(desc||'').trim().toLowerCase(); if(!k) return;
    localStorage.setItem('g_dep_bloq',JSON.stringify(this._bloqRec().filter(x=>x!==k)));
  }

  /* Lança automaticamente o salário de cada funcionário como despesa recorrente do mês (1x por mês) */
  async _autoSalarios(){
    // O preview local consulta dados reais; nunca deve gerar despesas durante testes visuais.
    if(['localhost','127.0.0.1'].includes(location.hostname))return;
    if(this._autoSalRunning)return; this._autoSalRunning=true;
    try{
      const {funcionarios,despesas}=this.state;
      const now=new Date();
      const curKey=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
      const hoje=this._today();
      const pend=(funcionarios||[]).filter(f=>f.ativo!==false&&parseFloat(f.salario||0)>0&&!this._isBloq(`Salário — ${f.nome}`)&&!(despesas||[]).some(d=>d.descricao===`Salário — ${f.nome}`&&this._mkey(d.data)===curKey));
      if(!pend.length)return;
      let dep=[...this.state.despesas];
      for(const f of pend){
        const nova={descricao:`Salário — ${f.nome}`,cat:'Salários',tipo:'Fixa',valor:parseFloat(f.salario),data:hoje,recorrente:true};
        try{
          const {data,error}=await this._db.from('despesas').insert([nova]).select();
          if(!error&&data?.[0]){dep.push(data[0]);continue;} throw error;
        }catch(e){
          dep.push({id:Date.now()+Math.floor(Math.random()*1000),...nova});
          localStorage.setItem('g_dep',JSON.stringify(dep));
        }
      }
      this.setState({despesas:dep});
      this._toast(`Salário de ${pend.length} funcionário(s) lançado em Despesas 🔄`);
    }finally{this._autoSalRunning=false;}
  }

  async _marcarLidaRecom(id){
    this.setState({recomendacoesIA:this.state.recomendacoesIA.map(r=>r.id===id?{...r,lida:true}:r)});
    try { await this._db.from('recomendacoes_ia').update({lida:true}).eq('id',id); } catch(e) {}
    this._render();
  }

  doLogin = () => {
    const v = (document.getElementById('login-senha')?.value||'').trim();
    if (v === this._PWD) {
      localStorage.setItem('g_sess','1');
      this.setState({ loggedIn:true, loginErr:'' }, () => this._init());
    } else {
      this.setState({ loginErr:'Senha incorreta. Tente novamente.' });
      if(document.getElementById('login-senha')) document.getElementById('login-senha').value='';
    }
  };

  loginEnter = (e) => { if(e.key==='Enter') this.doLogin(); };

  /* Acesso administrador: login do Supabase Auth (ver _adminDb). Entra no app e abre o relatório de melhorias. */
  adminToggle = () => {
    const b=document.getElementById('adm-login-box');
    if(!b)return;
    b.style.display=b.style.display==='block'?'none':'block';
    if(b.style.display==='block') document.getElementById('adm-login-senha')?.focus();
  };

  adminLogin = async () => {
    const senha=document.getElementById('adm-login-senha')?.value||'';
    const err=document.getElementById('adm-login-err');
    const btn=document.getElementById('adm-login-btn');
    const erro=(m)=>{ if(err){ err.textContent=m; err.style.display='block'; } if(btn){ btn.textContent='ENTRAR COMO DESENVOLVEDOR'; btn.disabled=false; } };
    if(!senha) return erro('Informe a senha.');
    if(btn){ btn.textContent='ENTRANDO...'; btn.disabled=true; }
    try {
      await this._waitForSupabase();
      const {error}=await this._adminDb().auth.signInWithPassword({email:this._ADMIN_EMAIL,password:senha});
      if(error) return erro('Senha inválida.');
    } catch(e) { console.error(e); return erro('Não foi possível conectar. Tente novamente.'); }
    localStorage.setItem('g_sess','1');
    this._devData=null;
    this.setState({ loggedIn:true, loginErr:'', devMode:true, page:'dev' }, () => this._init());
  };

  adminEnter = (e) => { if(e.key==='Enter') this.adminLogin(); };

  logout = () => {
    localStorage.removeItem('g_sess');
    try{ this._admDb?.auth.signOut(); }catch(_){}
    this._acessoReg=false; this._ultimaTela=null; this._devData=null;
    this.setState({ loggedIn:false, loginErr:'', page:'dashboard', devMode:false });
  };

  _nav(p){ return ()=>{ this.setState({page:p},()=>this._render()); }; }
  _goOS = this._nav('os'); _goCli = this._nav('clientes'); _goRec = this._nav('receitas');
  _goDep = this._nav('despesas'); _goFin = this._nav('financeiro'); _goDash = this._nav('dashboard'); _goRecom = this._nav('recomendacoes');

  _fmt(v){ return 'R$\u00a0'+Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  _mkey(d){ if(!d)return''; const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'); }
  _dfmt(d){ if(!d)return'—'; return new Date(d+'T12:00:00').toLocaleDateString('pt-BR'); }
  _stStyle(s){ const m={'Aguardando':'background:#EEF2FF;color:#4338CA','Em Andamento':'background:#FFFBEB;color:#B45309','Aguardando Peça':'background:#FFF7ED;color:#C2410C','Aguardando Pagamento':'background:#FEF2F2;color:#DC2626','Concluída':'background:#ECFDF5;color:#059669','Orçamento':'background:#F5F3FF;color:#6D28D9'}; return (m[s]||'background:#F3F4F6;color:#374151')+';font-size:9px;font-weight:700;padding:3px 9px;border-radius:20px;'; }
  _today(){ const n=new Date(); return n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0'); }

  /* ══════════ Revisões automáticas ══════════ */
  _normalize(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  _revisaoRegras(){
    return [
      {chave:'oleo', servico:'Troca de Óleo', meses:6},
      {chave:'pastilha', servico:'Troca de Pastilha de Freio', meses:12},
      {chave:'correia', servico:'Verificação de Correia Dentada', meses:12},
    ];
  }
  async _processarRevisoes(clienteId, srvList, osId, dataBase){
    if(!clienteId) return;
    const regras=this._revisaoRegras();
    for(const srvTxt of (srvList||[])){
      const norm=this._normalize(srvTxt);
      const regra=regras.find(r=>norm.includes(r.chave));
      if(!regra) continue;
      const d=new Date(dataBase+'T12:00:00');
      d.setMonth(d.getMonth()+regra.meses);
      const dataAgendada=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      try{
        await this._db.from('agendamentos').insert({cliente_id:clienteId, os_id:osId||null, tipo:regra.chave, servico:regra.servico, data_agendada:dataAgendada, status:'pendente'});
      }catch(e){ console.error('Não foi possível criar o agendamento de revisão (crie a tabela "agendamentos")', e); }
    }
  }
  _revisoesCliente(cid){ return (this.state.agendamentos||[]).filter(a=>a.cliente_id===cid && a.status!=='concluido'); }
  _revisaoDevida(cid){ const hoje=this._today(); return this._revisoesCliente(cid).some(a=>a.data_agendada<=hoje); }
  _devidoCliente(cid){
    const os=this.state.ordens.filter(o=>o.cliente_id===cid && o.status==='Concluída' && o.status_pagamento && o.status_pagamento!=='Pago');
    return os.reduce((s,o)=>s+((parseFloat(o.valor||0))-(parseFloat(o.valor_pago||0))),0);
  }
  _enviarLembreteRevisao(id){
    const a=(this.state.agendamentos||[]).find(x=>x.id===id);
    if(!a)return;
    const c=this.state.clientes.find(x=>x.id===a.cliente_id);
    const tel=(c?.telefone||'').replace(/\D/g,'');
    const msg=`Olá ${c?.nome||''}! 👋\n\nPassando para lembrar que está na hora de fazer: *${a.servico}* do seu veículo. 🔧\n\nQuer agendar um horário na Garcia Auto Mecânica?`;
    const url=tel?`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank');
    this._db.from('agendamentos').update({status:'enviado'}).eq('id',id).then(()=>this._load()).then(()=>{ if(this._clienteModalId) this._modalHistoricoCliente(this._clienteModalId); });
  }
  async _marcarRevisaoFeita(id){
    try{ await this._db.from('agendamentos').update({status:'concluido'}).eq('id',id); }catch(e){}
    await this._load();
    this._toast('Revisão marcada como feita!');
    if(this._clienteModalId) this._modalHistoricoCliente(this._clienteModalId);
  }

  /* Parseia serviços — suporta JSON array [{nome,valor}] e string legada */
  _servicosStats(){
    const map={};
    (this.state.ordens||[]).forEach(o=>{
      let items=[];
      try{
        const arr=JSON.parse(o.servico);
        if(Array.isArray(arr)&&arr.length>0) items=arr.map(x=>({nome:(x.nome||x.descricao||'').trim(),valor:parseFloat(x.valor)||0}));
      }catch(e){}
      if(items.length===0){
        const names=(o.servico||'').replace(/\s*\[Mec:[^\]]*\]/g,'').split('|').map(s=>s.trim()).filter(Boolean);
        const share=names.length?parseFloat(o.valor||0)/names.length:0;
        items=names.map(n=>({nome:n,valor:share}));
      }
      items.forEach(it=>{
        if(!it.nome)return;
        if(!map[it.nome]) map[it.nome]={count:0,total:0};
        map[it.nome].count++; map[it.nome].total+=it.valor;
      });
    });
    return Object.entries(map).map(([nome,v])=>({nome,count:v.count,total:v.total,ticket:v.total/v.count}));
  }
  _parseSrv(s){
    if(!s)return'—';
    try{
      const arr=JSON.parse(s);
      if(Array.isArray(arr) && arr.length>0){
        return arr.map(x=>x.nome||x.descricao||'').filter(Boolean).join(' · ')||'—';
      }
    }catch(e){}
    return s.replace(/\s*\[Mec:[^\]]*\]/g,'').trim()||'—';
  }
  _parseMec(s){
    if(!s)return'—';
    try{
      const arr=JSON.parse(s);
      if(Array.isArray(arr) && arr.length>0){
        const mec=arr.find(x=>x.mecanico);
        return mec?mec.mecanico:'—';
      }
    }catch(e){}
    const m=s.match(/\[Mec:\s*([^\]]+)\]/);
    return m?m[1].trim():'—';
  }

  /* Meses para select de filtro */
  _monthOptions(){
    const opts=[]; const now=new Date();
    for(let i=0;i<12;i++){
      const d=new Date(now.getFullYear(),now.getMonth()-i,1);
      const key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
      const label=d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
      opts.push({key,label});
    }
    return opts;
  }

  _toast(msg,ok=true){
    const el=document.getElementById('toast');
    if(!el)return;
    el.textContent=(ok?'✓ ':'✕ ')+msg;
    el.style.borderLeft='3px solid '+(ok?'#10B981':'#EF4444');
    el.style.display='block';
    clearTimeout(this._tTimer);
    this._tTimer=setTimeout(()=>{el.style.display='none';},3000);
  }

  _falhaNuvem(oQue,err){
    const msg=(err&&(err.message||err.details))||'sem resposta do Supabase';
    console.error('[NÃO SALVO NA NUVEM]',oQue,err);
    try{ const l=JSON.parse(localStorage.getItem('g_falhas')||'[]'); l.push({quando:new Date().toISOString(),oQue,erro:msg}); localStorage.setItem('g_falhas',JSON.stringify(l.slice(-50))); }catch(_){}
    const el=document.getElementById('toast');
    if(el){
      el.textContent='⚠ '+oQue+' ficou só neste navegador — não foi salvo na nuvem. Motivo: '+msg;
      el.style.borderLeft='3px solid #F59E0B';
      el.style.display='block';
      clearTimeout(this._tTimer);
      this._tTimer=setTimeout(()=>{el.style.display='none';},9000);
    }
    this._render();
  }
  _falhas(){ try{return JSON.parse(localStorage.getItem('g_falhas')||'[]');}catch(e){return [];} }
  _modalFalhas(){
    const l=this._falhas().slice().reverse();
    const linhas=l.length?l.map(f=>`<div style="border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:8px;padding:9px 12px;margin-bottom:7px;"><div style="font-size:12px;font-weight:700;color:#111;">${f.oQue}</div><div style="font-size:11px;color:#6B7280;">${f.erro}</div><div style="font-size:10px;color:#9CA3AF;margin-top:3px;">${new Date(f.quando).toLocaleString('pt-BR')}</div></div>`).join(''):'<div style="font-size:12px;color:#9CA3AF;">Nenhuma falha registrada.</div>';
    this._openModal(`<div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;margin-bottom:4px;">Dados não salvos na nuvem</div>
      <div style="font-size:11px;color:#6B7280;margin-bottom:14px;">Estes registros estão apenas neste navegador. Corrija a causa no Supabase e lance novamente.</div>
      ${linhas}
      <div style="display:flex;gap:8px;margin-top:14px;">
        <button onclick="localStorage.removeItem('g_falhas');window._garcia._closeModal();window._garcia._render();" style="flex:1;background:#F3F4F6;border:none;border-radius:8px;padding:10px;font-family:'Rajdhani',sans-serif;font-weight:700;cursor:pointer;">Limpar avisos</button>
        <button onclick="window._garcia._closeModal()" style="flex:1;background:#FFC107;border:none;border-radius:8px;padding:10px;font-family:'Rajdhani',sans-serif;font-weight:700;cursor:pointer;">Fechar</button>
      </div>`);
  }

  _buscarCli(v){
    this._cliBusca=v||'';
    const termo=this._cliBusca.toLowerCase().trim();
    const so=termo.replace(/\D/g,'');
    const linhas=document.querySelectorAll('tr[data-busca]');
    let visiveis=0;
    linhas.forEach(tr=>{
      const alvo=tr.getAttribute('data-busca')||'';
      const alvoNum=alvo.replace(/\D/g,'');
      const bate=!termo || alvo.includes(termo) || (so.length>=3 && alvoNum.includes(so));
      tr.style.display=bate?'':'none';
      if(bate)visiveis++;
    });
    const vazio=document.getElementById('cli-vazio');
    if(vazio)vazio.style.display=(termo&&visiveis===0)?'':'none';
    const cont=document.getElementById('cli-busca-cont');
    if(cont)cont.textContent=termo?`${visiveis} de ${linhas.length}`:'';
  }

  _verNotaFiscalOS(id){
    const o=this.state.ordens.find(x=>x.id===id);
    if(o?.nota_fiscal) this._verArquivo(o.nota_fiscal,'nota-fiscal');
  }
  async _excluirNotaFiscalOS(id){
    if(!confirm('Excluir a nota fiscal anexada?'))return;
    try{ await this._db.from('ordens').update({nota_fiscal:null}).eq('id',id); await this._load(); this._toast('Nota fiscal removida!'); this._editarOS(id); }catch(e){ this._toast('Erro ao excluir',false); }
  }
  _verComprovanteDep(id){
    const d=this.state.despesas.find(x=>x.id===id);
    if(d?.comprovante) this._verArquivo(d.comprovante,d.comprovante_nome||'comprovante');
  }
  async _excluirComprovanteDep(id){
    if(!confirm('Excluir o comprovante anexado?'))return;
    try{ await this._db.from('despesas').update({comprovante:null,comprovante_nome:null}).eq('id',id); await this._load(); this._toast('Comprovante removido!'); this._modalComprovantes(); }catch(e){ this._toast('Erro ao excluir',false); }
  }
  _verArquivo(url,nome){
    if(!url)return;
    const isImg=/\.(png|jpe?g|gif|webp)$/i.test(nome||'')||url.startsWith('data:image');
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
    ov.onclick=(e)=>{ if(e.target===ov) ov.remove(); };
    ov.innerHTML=(isImg
      ?`<img src="${url}" style="max-width:92vw;max-height:88vh;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.4);">`
      :`<iframe src="${url}" style="width:90vw;height:88vh;border:none;border-radius:8px;background:#fff;"></iframe>`)
      +`<button id="close-viewer-btn" style="position:absolute;top:20px;right:20px;background:#fff;border:none;border-radius:8px;width:36px;height:36px;font-size:20px;cursor:pointer;">×</button>
      <a href="${url}" download="${nome||'arquivo'}" style="position:absolute;top:20px;right:66px;background:#FFC107;color:#000;text-decoration:none;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;">⬇</a>`;
    document.body.appendChild(ov);
    ov.querySelector('#close-viewer-btn').onclick=()=>ov.remove();
  }
  _mobLabels(){
    document.querySelectorAll('#main-content table,#modal-box table').forEach(t=>{
      const hs=[...t.querySelectorAll('thead th')].map(th=>(th.textContent||'').trim());
      if(!hs.length)return;
      t.querySelectorAll('tbody tr').forEach(tr=>{
        [...tr.children].forEach((td,i)=>{
          if(td.hasAttribute('colspan')||!hs[i])return;
          if(td.getAttribute('data-l')!==hs[i])td.setAttribute('data-l',hs[i]);
        });
      });
    });
  }

  _mobWatch(){
    if(this._mobObs)return;
    this._mobObs=new MutationObserver(()=>{clearTimeout(this._mobT);this._mobT=setTimeout(()=>this._mobLabels(),30);});
    const go=()=>{
      const a=document.getElementById('main-content'),b=document.getElementById('modal-box');
      if(a)this._mobObs.observe(a,{childList:true,subtree:true});
      if(b)this._mobObs.observe(b,{childList:true,subtree:true});
      this._mobLabels();
    };
    setTimeout(go,300);
  }

  _openModal(html){
    const bg=document.getElementById('modal-bg');
    const box=document.getElementById('modal-box');
    if(!bg||!box)return;
    box.innerHTML=html;
    bg.style.display='flex';
    bg.onclick=(e)=>{ if(e.target===bg) this._closeModal(); };
  }
  _closeModal(){ const bg=document.getElementById('modal-bg'); if(bg) bg.style.display='none'; }

