  _toggleAI(){
    const p=document.getElementById('ai-panel');
    if(!p)return;
    const visible=p.style.display==='flex';
    p.style.display=visible?'none':'flex';
    if(!visible) document.getElementById('ai-input')?.focus();
  }

  async _sendAI(){
    const inp=document.getElementById('ai-input');
    const msgs=document.getElementById('ai-msgs');
    if(!inp||!msgs)return;
    const txt=inp.value.trim();
    if(!txt)return;
    inp.value='';

    // Mensagem do usuário
    const userBubble=document.createElement('div');
    userBubble.style.cssText='background:#FFC107;border-radius:10px;padding:10px 14px;font-size:12px;color:#000;font-weight:600;align-self:flex-end;max-width:85%;margin-left:auto;';
    userBubble.textContent=txt;
    msgs.appendChild(userBubble);
    msgs.scrollTop=msgs.scrollHeight;

    // Loading
    const loadBubble=document.createElement('div');
    loadBubble.style.cssText='background:#fff;border-radius:10px;padding:10px 14px;font-size:12px;color:#9CA3AF;box-shadow:0 1px 3px rgba(0,0,0,.06);max-width:90%;';
    loadBubble.textContent='✦ Pensando...';
    msgs.appendChild(loadBubble);
    msgs.scrollTop=msgs.scrollHeight;

    try {
      const resp=await fetch(this._URL+'/functions/v1/assistente-ia',{
        method:'POST',
        headers:{'Authorization':'Bearer '+this._KEY,'apikey':this._KEY,'Content-Type':'application/json'},
        body:JSON.stringify({pergunta:txt})
      });
      const data=await resp.json();
      if(!resp.ok||data.error) throw new Error(data.error||'Falha ao consultar a IA');
      loadBubble.style.color='#374151';
      loadBubble.innerHTML=(data.resposta||'').replace(/\n/g,'<br>');
    } catch(e) {
      console.error(e);
      loadBubble.style.color='#DC2626';
      loadBubble.textContent='Erro ao conectar com a IA. Tente novamente.';
    }
    msgs.scrollTop=msgs.scrollHeight;
  }

  async _analisarFinanceiro(){
    const btn=document.getElementById('btn-analisar-fin');
    const box=document.getElementById('ai-fin-result');
    if(!btn||!box)return;
    btn.textContent='✦ Analisando...';
    btn.disabled=true;
    box.style.display='block';
    box.innerHTML='<div style="color:#9CA3AF;font-size:12px;padding:8px 0;">Gerando análise inteligente...</div>';

    try {
      const resp=await fetch(this._URL+'/functions/v1/analisar-financeiro',{
        method:'POST',
        headers:{'Authorization':'Bearer '+this._KEY,'apikey':this._KEY,'Content-Type':'application/json'},
        body:JSON.stringify({})
      });
      const data=await resp.json();
      if(!resp.ok||data.error) throw new Error(data.error||'Falha na análise');
      box.innerHTML=this._renderAnaliseHTML(data);
      this.setState({recomendacoesIA:[{analise:data,created_at:new Date().toISOString(),lida:false},...this.state.recomendacoesIA]});
    } catch(e) {
      console.error(e);
      box.innerHTML='<div style="color:#DC2626;font-size:12px;">Erro ao gerar análise: '+(e.message||'tente novamente')+'</div>';
    }
    btn.textContent='✦ Analisar com IA';
    btn.disabled=false;
  }

  _recomCardHTML(){
    const list=this.state.recomendacoesIA||[];
    const latest=list[0];
    const pCor={alta:'#EF4444',media:'#FF8C00',baixa:'#10B981'};
    let body;
    if(!latest){
      body=`<div style="font-size:12px;color:#9CA3AF;padding:6px 0;">Nenhuma análise ainda. Clique em "Analisar agora" para gerar a primeira.</div>`;
    } else {
      const a=latest.analise||{};
      const alertas=(a.alertas||[]).slice(0,3).map(x=>`
        <div style="border-left:3px solid ${pCor[x.prioridade]||'#9CA3AF'};background:#F9FAFB;border-radius:8px;padding:9px 12px;margin-bottom:7px;">
          <div style="font-size:9px;font-weight:700;color:${pCor[x.prioridade]||'#9CA3AF'};text-transform:uppercase;letter-spacing:1px;">${x.prioridade||''}</div>
          <div style="font-size:12px;font-weight:700;color:#111;margin:2px 0;">${x.titulo||''}</div>
          <div style="font-size:11px;color:#6B7280;">${x.detalhe||''}</div>
        </div>`).join('');
      const recs=(a.recomendacoes||[]).slice(0,2).map(r=>`
        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:9px 12px;margin-bottom:7px;">
          <div style="font-size:12px;font-weight:700;color:#111;">${r.titulo||''}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:2px;">${r.acao||''}</div>
        </div>`).join('');
      body=`
        <div style="font-size:9px;color:#9CA3AF;margin-bottom:8px;">${new Date(latest.created_at).toLocaleString('pt-BR')}${latest.lida?'':' · <span style="color:#FFC107;font-weight:700;">novo</span>'}</div>
        <div style="font-size:13px;color:#111;font-weight:600;line-height:1.5;margin-bottom:10px;">${a.resumo||''}</div>
        ${alertas}${recs}
      `;
    }
    return `<div style="background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);padding:18px;margin-top:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;background:linear-gradient(135deg,#FFC107,#FF8C00);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;">✦</div>
          <div><div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">Recomendações IA</div><div style="font-size:10px;color:#9CA3AF;">Análises automáticas 9h e 16h</div></div>
        </div>
        <button onclick="window._garcia._analisarFinanceiroDash()" id="btn-analisar-fin-dash" style="background:#FFC107;border:none;border-radius:8px;padding:7px 14px;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;color:#000;cursor:pointer;">✦ Analisar agora</button>
      </div>
      ${body}
      ${list.length>1?`<div style="font-size:11px;color:#9CA3AF;margin-top:6px;">+${list.length-1} análise(s) anterior(es) no histórico</div>`:''}
    </div>`;
  }

  async _analisarFinanceiroDash(){
    const btn=document.getElementById('btn-analisar-fin-dash');
    if(btn){btn.textContent='Analisando...';btn.disabled=true;}
    try {
      const resp=await fetch(this._URL+'/functions/v1/analisar-financeiro',{
        method:'POST',
        headers:{'Authorization':'Bearer '+this._KEY,'apikey':this._KEY,'Content-Type':'application/json'},
        body:JSON.stringify({})
      });
      const data=await resp.json();
      if(!resp.ok||data.error) throw new Error(data.error||'Falha na análise');
      this.setState({recomendacoesIA:[{analise:data,created_at:new Date().toISOString(),lida:false},...this.state.recomendacoesIA]},()=>this._render());
    } catch(e) {
      console.error(e);
      alert('Erro ao gerar análise: '+(e.message||'tente novamente'));
      if(btn){btn.textContent='✦ Analisar agora';btn.disabled=false;}
    }
  }

  _renderAnaliseHTML(data){
    const pCor={alta:'#EF4444',media:'#FF8C00',baixa:'#10B981'};
    const alertas=(data.alertas||[]).map(a=>`
      <div style="border-left:3px solid ${pCor[a.prioridade]||'#9CA3AF'};background:#F9FAFB;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="font-size:9px;font-weight:700;color:${pCor[a.prioridade]||'#9CA3AF'};text-transform:uppercase;letter-spacing:1px;">${a.prioridade||''}</div>
        <div style="font-size:12px;font-weight:700;color:#111;margin:2px 0;">${a.titulo||''}</div>
        <div style="font-size:11px;color:#6B7280;">${a.detalhe||''}</div>
        ${a.impacto_estimado?`<div style="font-size:10px;color:#374151;margin-top:4px;">Impacto estimado: ${this._fmt(a.impacto_estimado)}</div>`:''}
      </div>`).join('');
    const recs=(data.recomendacoes||[]).map(r=>`
      <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
        <div style="font-size:12px;font-weight:700;color:#111;">${r.titulo||''}</div>
        <div style="font-size:11px;color:#6B7280;margin-top:2px;">${r.acao||''}</div>
        <div style="font-size:10px;color:#9CA3AF;margin-top:4px;">${r.motivo||''}</div>
      </div>`).join('');
    const forns=(data.fornecedores||[]).map(f=>`
      <div style="font-size:11px;color:#374151;margin-bottom:4px;"><strong>${f.nome||''}</strong> — ${f.insight||''}</div>`).join('');
    return `
      <div style="font-size:13px;color:#111;font-weight:600;line-height:1.6;margin-bottom:10px;">${data.resumo||''}</div>
      ${typeof data.lucro_estimado==='number'?`<div style="font-size:12px;color:#374151;margin-bottom:12px;">Lucro estimado: <strong>${this._fmt(data.lucro_estimado)}</strong></div>`:''}
      ${alertas?`<div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Alertas</div>${alertas}`:''}
      ${recs?`<div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px;">Recomendações</div>${recs}`:''}
      ${forns?`<div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px;">Fornecedores</div>${forns}`:''}
    `;
  }

  renderVals(){
    const {loggedIn,loginErr,page,ordens,clientes,connected,osFilter,recomendacoesIA}=this.state;
    const recomPend=recomendacoesIA.filter(r=>!r.lida).length;
    const nFalhas=this._falhas().length;
    const na=(p)=>({s:`display:flex;align-items:center;gap:10px;padding:9px 12px;${page===p?'background:rgba(255,193,7,.08);border-radius:8px;border-left:3px solid #FFC107;':'border-radius:8px;'}cursor:pointer;`,t:`font-size:${page===p?'13':'12'}px;font-weight:${page===p?'700':'500'};color:${page===p?'#FFC107':'#777'};`});
    const pages={dashboard:{title:'Dashboard',sub:'Visão geral da oficina',btn:'+ Nova OS',action:()=>this._modalOS()},os:{title:'Ordens de Serviço',sub:ordens.length+' registros',btn:'+ Nova OS',action:()=>this._modalOS()},clientes:{title:'Clientes',sub:clientes.length+' cadastrados',btn:'+ Novo Cliente',action:()=>this._modalCli()},receitas:{title:'Receitas',sub:'Faturamentos registrados',btn:'+ Nova Receita',action:()=>this._modalRec()},despesas:{title:'Despesas',sub:'Lançamentos do período',btn:'+ Nova Despesa',action:()=>this._modalDep()},financeiro:{title:'Financeiro',sub:'Análise financeira completa',btn:'+ Nova Despesa',action:()=>this._modalDep()},'financeiro-detalhes':{title:'Financeiro',sub:'Detalhes e rankings completos',btn:'',action:()=>{}},funcionarios:{title:'Funcionários',sub:this.state.funcionarios.length+' cadastrados',btn:'+ Novo Funcionário',action:()=>this._modalFunc()},configuracoes:{title:'Configurações',sub:'Ajustes e cadastros da plataforma',btn:'',action:()=>{}}};
    const pg=pages[page]||pages.dashboard;
    const osAb=ordens.filter(o=>o.status!=='Concluída').length;
    const ni=(svg,active)=>React.createElement('span',{dangerouslySetInnerHTML:{__html:svg},style:{display:'flex',alignItems:'center',justifyContent:'center',width:'16px',height:'16px',flexShrink:0,opacity:active?.9:.5}});
    const icons={
      dashboard:`<svg width="16" height="16" viewBox="0 0 24 24" fill="${page==='dashboard'?'#FFC107':'#9CA3AF'}"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
      os:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='os'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
      clientes:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='clientes'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
      receitas:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='receitas'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
      despesas:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='despesas'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
      financeiro:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='financeiro'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
      funcionarios:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='funcionarios'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      configuracoes:`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='configuracoes'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    };
    const goTo=(p)=>{ this.setState({page:p},()=>this._render()); this._toggleSidebar(false); };
    const navItems=[
      {...na('dashboard'),label:'Dashboard',badge:false,badgeVal:'',iconEl:ni(icons.dashboard,page==='dashboard'),go:()=>goTo('dashboard')},
      {...na('os'),label:'Ordens de Serviço',badge:osAb>0,badgeVal:osAb,iconEl:ni(icons.os,page==='os'),go:()=>goTo('os')},
      {...na('clientes'),label:'Clientes',badge:false,badgeVal:'',iconEl:ni(icons.clientes,page==='clientes'),go:()=>goTo('clientes')},
      {...na('receitas'),label:'Receitas',badge:false,badgeVal:'',iconEl:ni(icons.receitas,page==='receitas'),go:()=>goTo('receitas')},
      {...na('despesas'),label:'Despesas',badge:false,badgeVal:'',iconEl:ni(icons.despesas,page==='despesas'),go:()=>goTo('despesas')},
      {...na('financeiro'),label:'Financeiro',badge:false,badgeVal:'',iconEl:ni(icons.financeiro,page==='financeiro'),go:()=>goTo('financeiro')},
      {...na('funcionarios'),label:'Funcionários',badge:false,badgeVal:'',iconEl:ni(icons.funcionarios,page==='funcionarios'),go:()=>goTo('funcionarios')},
      {...na('configuracoes'),label:'Configurações',badge:false,badgeVal:'',iconEl:ni(icons.configuracoes,page==='configuracoes'),go:()=>goTo('configuracoes')},
    ];
    window._garcia = this;
    setTimeout(()=>this._render(),0);
    return {
      notLoggedIn:!loggedIn, isLoggedIn:loggedIn,
      showErr:!!loginErr, loginErr, doLogin:this.doLogin, loginEnter:this.loginEnter,
      logout:this.logout,
      navItems,
      connStyle:`font-size:9px;font-weight:700;color:${nFalhas?'#F59E0B':(connected?'#10B981':'#9CA3AF')};${nFalhas?'cursor:pointer;':''}`,
      connText:nFalhas?`⚠ ${nFalhas} não salvo(s) na nuvem`:(connected?'● Online — Supabase':'○ Conectando...'),
      connClick:nFalhas?(()=>this._modalFalhas()):(()=>{}),
      pageTitle:pg.title, pageSub:pg.sub, pageBtn:pg.btn, pageAction:pg.action, pageBtnDisplay:pg.btn?'block':'none',
      isDash:page==='dashboard',
      openSidebar:()=>this._toggleSidebar(true),
      closeSidebar:()=>this._toggleSidebar(false),
      toggleAI:()=>this._toggleAI(),
      sendAI:()=>this._sendAI(),
      aiInputKeyDown:(e)=>{ if(e.key==='Enter') this._sendAI(); },
    };
  }
}
