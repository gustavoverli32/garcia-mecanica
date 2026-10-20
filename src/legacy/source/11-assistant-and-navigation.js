  _toggleAI(){
    const p=document.getElementById('ai-panel');
    if(!p)return;
    const visible=p.style.display==='flex';
    p.style.display=visible?'none':'flex';
    if(!visible){ document.getElementById('ai-input')?.focus(); this._adminBotao(); }
  }

  /* Admin: login próprio pelo Supabase Auth, em cliente separado (storageKey próprio) para não
     trocar o papel das consultas do app. A leitura dos relatos é liberada pela RLS só para o admin. */
  _adminDb(){
    if(!this._admDb && window.supabase) this._admDb=window.supabase.createClient(this._URL,this._KEY,{auth:{storageKey:'g_admin_auth',persistSession:true}});
    return this._admDb;
  }

  async _adminSessao(){
    try{ const {data}=await this._adminDb().auth.getSession(); return data?.session||null; }catch(_){ return null; }
  }

  async _adminBotao(){
    const dev=!!(await this._adminSessao());
    const b=document.getElementById('ai-rel-btn');
    if(b) b.style.display=dev?'block':'none';
    if(dev!==!!this.state.devMode) this.setState({devMode:dev,page:!dev&&this.state.page==='dev'?'dashboard':this.state.page},()=>this._render());
  }

  async _adminSair(){
    try{ await this._adminDb().auth.signOut(); }catch(_){}
    this._adminBotao();
    this._aiBubble('Você saiu do acesso de administrador.');
  }

  _adminLoginForm(){
    const f=this._aiBubble(`<strong>🔒 Acesso do administrador</strong><br><span style="color:#6B7280;">Digite a senha de desenvolvedor para ver o relatório.</span>
      <input id="adm-senha" type="password" placeholder="Senha" style="display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:8px 10px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;outline:none;">
      <div id="adm-err" style="color:#DC2626;font-size:11px;margin-top:6px;display:none;"></div>
      <button id="adm-entrar" style="margin-top:8px;background:#1A1A1A;color:#FFC107;border:none;border-radius:6px;padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer;">Entrar</button>`);
    if(!f)return;
    const entrar=async()=>{
      const senha=f.querySelector('#adm-senha')?.value||'';
      const err=f.querySelector('#adm-err');
      const btn=f.querySelector('#adm-entrar');
      if(!senha){ err.textContent='Informe a senha.'; err.style.display='block'; return; }
      btn.textContent='Entrando...'; btn.disabled=true;
      const {error}=await this._adminDb().auth.signInWithPassword({email:this._ADMIN_EMAIL,password:senha});
      if(error){ err.textContent='Senha inválida.'; err.style.display='block'; btn.textContent='Entrar'; btn.disabled=false; return; }
      f.innerHTML='✅ Acesso de administrador liberado.';
      this._adminBotao();
      this._relatorioMelhorias();
    };
    f.querySelector('#adm-entrar')?.addEventListener('click',entrar);
    f.querySelector('#adm-senha')?.addEventListener('keydown',e=>{ if(e.key==='Enter') entrar(); });
    f.querySelector('#adm-senha')?.focus();
  }

  _aiBubble(html,user=false){
    const msgs=document.getElementById('ai-msgs');
    if(!msgs)return null;
    const b=document.createElement('div');
    b.style.cssText=user
      ?'background:#FFC107;border-radius:10px;padding:10px 14px;font-size:12px;color:#000;font-weight:600;align-self:flex-end;max-width:85%;margin-left:auto;'
      :'background:#fff;border-radius:10px;padding:10px 14px;font-size:12px;color:#374151;box-shadow:0 1px 3px rgba(0,0,0,.06);max-width:90%;';
    if(user) b.textContent=html; else b.innerHTML=html;
    msgs.appendChild(b);
    msgs.scrollTop=msgs.scrollHeight;
    return b;
  }

  _esc(t){ return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  async _perguntarIA(pergunta){
    const resp=await fetch(this._URL+'/functions/v1/assistente-ia',{
      method:'POST',
      headers:{'Authorization':'Bearer '+this._KEY,'apikey':this._KEY,'Content-Type':'application/json'},
      body:JSON.stringify({pergunta})
    });
    const data=await resp.json();
    if(!resp.ok||data.error) throw new Error(data.error||'Falha ao consultar a IA');
    return data.resposta||'';
  }

  /* Assistente de melhorias: cada mensagem vira um relato (problema/sugestão/dúvida)
     salvo em melhorias_plataforma, com uma proposta de melhoria gerada pela IA. */
  async _sendAI(){
    const inp=document.getElementById('ai-input');
    if(!inp)return;
    const txt=inp.value.trim();
    if(!txt)return;
    inp.value='';
    this._aiBubble(txt,true);
    const load=this._aiBubble('✦ Registrando seu relato...');
    if(load) load.style.color='#9CA3AF';

    const titulos={dashboard:'Dashboard',os:'Ordens de Serviço',clientes:'Clientes',receitas:'Receitas',despesas:'Despesas',financeiro:'Financeiro','financeiro-detalhes':'Financeiro',funcionarios:'Funcionários',configuracoes:'Configurações'};
    const pagina=titulos[this.state.page]||this.state.page||'';
    const reg={relato:txt.slice(0,4000),pagina,tipo:'sugestao',area:pagina,resumo:txt.slice(0,200),proposta:null};

    try {
      const resposta=await this._perguntarIA(
        'Você agora atua como analista de melhorias do sistema de gestão da Garcia Auto Mecânica '+
        '(telas: Dashboard, Ordens de Serviço, Clientes, Receitas, Despesas, Financeiro, Funcionários, Configurações). '+
        'Um usuário do sistema escreveu o relato abaixo enquanto estava na tela "'+pagina+'". '+
        'Classifique e proponha uma melhoria concreta para a plataforma que resolva o problema ou atenda a sugestão. '+
        'Responda SOMENTE com um JSON válido, sem nenhum texto antes ou depois, no formato: '+
        '{"tipo":"problema|sugestao|duvida","area":"tela ou funcionalidade afetada","resumo":"uma frase curta","proposta":"proposta de melhoria em até 3 frases"}\n\n'+
        'Relato do usuário: """'+txt+'"""'
      );
      const m=resposta.match(/\{[\s\S]*\}/);
      const j=m?JSON.parse(m[0]):null;
      if(j){
        const tipo=String(j.tipo||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
        if(['problema','sugestao','duvida'].includes(tipo)) reg.tipo=tipo;
        if(j.area) reg.area=String(j.area).slice(0,120);
        if(j.resumo) reg.resumo=String(j.resumo).slice(0,300);
        if(j.proposta) reg.proposta=String(j.proposta).slice(0,2000);
      } else if(resposta) reg.proposta=resposta.slice(0,2000);
    } catch(e) { console.error('[melhorias] IA indisponível, relato salvo sem proposta',e); }

    let salvo=false;
    try {
      const {error}=await this._db.from('melhorias_plataforma').insert(reg);
      if(error) throw error;
      salvo=true;
    } catch(e) {
      try{ const l=JSON.parse(localStorage.getItem('g_melhorias')||'[]'); l.push({...reg,created_at:new Date().toISOString()}); localStorage.setItem('g_melhorias',JSON.stringify(l.slice(-100))); }catch(_){}
      this._falhaNuvem('Relato de melhoria',e);
    }

    const rot={problema:'⚠️ Problema',sugestao:'💡 Sugestão',duvida:'❓ Dificuldade'};
    if(load){
      load.style.color='#374151';
      load.innerHTML=`<strong>${salvo?'✅ Relato registrado!':'⚠ Relato guardado neste aparelho'}</strong><br><br>`+
        `<span style="color:#6B7280;">Tipo:</span> ${rot[reg.tipo]}<br>`+
        `<span style="color:#6B7280;">Área:</span> ${this._esc(reg.area)}<br>`+
        `<span style="color:#6B7280;">Resumo:</span> ${this._esc(reg.resumo)}<br><br>`+
        `Obrigado! A equipe vai analisar. Se quiser, conte mais detalhes ou registre outro relato.`;
    }
    const msgs=document.getElementById('ai-msgs');
    if(msgs) msgs.scrollTop=msgs.scrollHeight;
  }

  /* Métricas de uso: cada abertura do app e cada troca de tela vira uma linha em acessos_plataforma.
     Sem nome, senha ou IP. Falha (ex.: tabela ainda não criada) é silenciosa. */
  _registrarAcesso(evento,pagina){
    if(!this._db)return;
    const ua=navigator.userAgent||'';
    const nav=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'Outro';
    if(!this._sessaoId) this._sessaoId=Date.now().toString(36)+Math.random().toString(36).slice(2,8);
    const row={evento,pagina:pagina||null,tipo:this.state.devMode?'dev':'equipe',dispositivo:window.innerWidth<=860?'celular':'computador',navegador:nav,sessao:this._sessaoId};
    try{ this._db.from('acessos_plataforma').insert(row).then(()=>{},()=>{}); }catch(_){}
  }

  _devTitulo(p){ return {dashboard:'Dashboard',os:'Ordens de Serviço',clientes:'Clientes',receitas:'Receitas',despesas:'Despesas',financeiro:'Financeiro','financeiro-detalhes':'Financeiro',funcionarios:'Funcionários',configuracoes:'Configurações',dev:'Dashboard DEV'}[p]||p; }

  async _devCarregar(force=false){
    if(this._devLoading) return;
    if(!force && this._devData && Date.now()-this._devData.em<60000) return;
    this._devLoading=true;
    const db=this._adminDb();
    const ler=async(t)=>{ try{ const {data,error}=await db.from(t).select('*').order('created_at',{ascending:false}).limit(5000); return error?null:(data||[]); }catch(_){ return null; } };
    const [acessos,relatos]=await Promise.all([ler('acessos_plataforma'),ler('melhorias_plataforma')]);
    this._devData={em:Date.now(),acessos,relatos};
    this._devLoading=false;
    if(this.state.page==='dev') this._render();
  }

  _renderDev(el){
    if(!this.state.devMode){ this.setState({page:'dashboard'},()=>this._render()); return; }
    if(!this._devData){ el.innerHTML='<div style="color:#9CA3AF;font-size:13px;padding:24px;">Carregando métricas da plataforma...</div>'; this._devCarregar(); return; }
    this._devCarregar();
    const {acessos,relatos}=this._devData;
    const {ordens,clientes,faturamentos}=this.state;
    const esc=(t)=>this._esc(t);
    const box='background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.07);';
    const h=(t,sub='')=>`<div style="font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#111;">${t}</div>${sub?`<div style="font-size:10px;color:#9CA3AF;margin-bottom:12px;">${sub}</div>`:'<div style="height:12px;"></div>'}`;
    const kpi=(icon,label,val,sub,color)=>`<div class="gm-kpi" style="${box}padding:16px;display:flex;align-items:center;gap:12px;"><div style="width:42px;height:42px;background:${color}1a;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${icon}</div><div><div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${label}</div><div style="font-family:'Rajdhani',sans-serif;font-size:21px;font-weight:700;color:#111;line-height:1;">${val}</div><div style="font-size:10px;color:${color};margin-top:3px;">${sub}</div></div></div>`;
    const barras=(itens,cor)=>{ const max=Math.max(...itens.map(i=>i.v),1); return itens.map(i=>`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span style="width:130px;font-size:11px;color:#374151;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(i.k)}</span><div style="flex:1;background:#F3F4F6;border-radius:4px;height:14px;overflow:hidden;"><div style="width:${Math.round(i.v/max*100)}%;height:100%;background:${cor};"></div></div><span style="width:44px;text-align:right;font-size:11px;font-weight:700;color:#374151;flex-shrink:0;">${i.v}</span></div>`).join('')||'<div style="color:#9CA3AF;font-size:12px;padding:8px 0;">Sem dados ainda</div>'; };
    const contar=(arr,fn)=>{ const m={}; arr.forEach(x=>{ const k=fn(x); if(k) m[k]=(m[k]||0)+1; }); return Object.entries(m).map(([k,v])=>({k,v})).sort((a,b)=>b.v-a.v); };
    const dia=(d)=>{ const x=new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); };
    const hoje=dia(new Date());
    const desde=(dias)=>Date.now()-dias*864e5;

    let blocoAcessos;
    if(acessos===null){
      blocoAcessos=`<div style="${box}padding:18px;margin-bottom:16px;border-left:3px solid #F59E0B;font-size:12px;color:#374151;">⚠ As métricas de acesso ainda não estão disponíveis. Rode o script <b>supabase/melhorias_plataforma.sql</b> no Supabase para começar a registrar os acessos.</div>`;
    } else {
      const ab=acessos.filter(a=>a.evento==='abertura');
      const tl=acessos.filter(a=>a.evento==='tela');
      const sess=(arr)=>new Set(arr.map(a=>a.sessao)).size;
      const hojeAb=ab.filter(a=>dia(a.created_at)===hoje);
      const d7=ab.filter(a=>new Date(a.created_at)>=desde(7));
      const d30=ab.filter(a=>new Date(a.created_at)>=desde(30));
      const dias14=[...Array(14)].map((_,i)=>{ const d=new Date(Date.now()-(13-i)*864e5); return {key:dia(d),label:String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0'),cur:i===13}; });
      const porDia=dias14.map(d=>({...d,v:ab.filter(a=>dia(a.created_at)===d.key).length}));
      const maxD=Math.max(...porDia.map(d=>d.v),1);
      const colunas=porDia.map(d=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;"><span style="font-size:9px;color:#6B7280;font-weight:700;">${d.v||''}</span><div style="width:100%;flex:1;display:flex;align-items:flex-end;background:#F9FAFB;border-radius:4px;overflow:hidden;"><div style="width:100%;height:${Math.max(Math.round(d.v/maxD*100),d.v?6:2)}%;background:${d.cur?'#FFC107':'#E5E7EB'};border-radius:4px 4px 0 0;"></div></div><span style="font-size:8px;color:${d.cur?'#FFC107':'#9CA3AF'};">${d.label}</span></div>`).join('');
      const horas=[...Array(24)].map((_,i)=>({k:String(i).padStart(2,'0')+'h',v:ab.filter(a=>new Date(a.created_at).getHours()===i).length})).filter(x=>x.v).sort((a,b)=>b.v-a.v).slice(0,6);
      const ultimo=acessos.find(a=>a.tipo==='equipe');
      blocoAcessos=`
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px;">
          ${kpi('👥','Acessos hoje',hojeAb.length,sess(hojeAb)+' sessão(ões)','#3B82F6')}
          ${kpi('📅','Acessos 7 dias',d7.length,'média '+(d7.length/7).toFixed(1)+'/dia','#10B981')}
          ${kpi('🗓️','Acessos 30 dias',d30.length,tl.filter(a=>new Date(a.created_at)>=desde(30)).length+' telas abertas','#8B5CF6')}
          ${kpi('🕒','Último acesso da equipe',ultimo?new Date(ultimo.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'—',ultimo?new Date(ultimo.created_at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · '+esc(ultimo.dispositivo||''):'sem registro','#F59E0B')}
        </div>
        <div style="${box}padding:20px;margin-bottom:16px;">
          ${h('Acessos por dia','Últimos 14 dias · cada abertura do sistema')}
          <div style="display:flex;align-items:flex-end;gap:6px;height:120px;">${colunas}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="${box}padding:18px;">${h('Tipos de acesso','Equipe × desenvolvedor')}${barras(contar(ab,a=>a.tipo==='dev'?'Desenvolvedor':'Equipe'),'#3B82F6')}
            <div style="height:10px;"></div>${h('Aparelho')}${barras(contar(ab,a=>a.dispositivo==='celular'?'Celular':'Computador'),'#10B981')}
            <div style="height:10px;"></div>${h('Navegador')}${barras(contar(ab,a=>a.navegador),'#8B5CF6')}</div>
          <div style="${box}padding:18px;">${h('Telas mais usadas','Quantas vezes cada tela foi aberta')}${barras(contar(tl.filter(a=>a.tipo!=='dev'),a=>this._devTitulo(a.pagina)).slice(0,8),'#FFC107')}
            <div style="height:10px;"></div>${h('Horários de pico','Horas com mais acessos')}${barras(horas,'#F97316')}</div>
        </div>`;
    }

    const rel=relatos||[];
    const cont={problema:0,sugestao:0,duvida:0}; rel.forEach(r=>{ cont[r.tipo]=(cont[r.tipo]||0)+1; });
    const rot={problema:'⚠️ Problema',sugestao:'💡 Sugestão',duvida:'❓ Dificuldade'};
    const fmtD=(d)=>{ try{ return new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch(_){ return ''; } };
    const listaRel=rel.slice(0,20).map(r=>`<div style="border-top:1px solid #F3F4F6;padding:12px 0;">
        <div style="display:flex;justify-content:space-between;gap:4px 8px;flex-wrap:wrap;"><span style="font-weight:700;font-size:12px;color:#111;">${rot[r.tipo]||'💡 Sugestão'} — ${esc(r.area||'')}</span><span style="font-size:10px;color:#9CA3AF;flex-shrink:0;">${fmtD(r.created_at)} · ${esc(r.pagina||'')}</span></div>
        <div style="font-size:12px;color:#374151;margin-top:4px;"><span style="color:#6B7280;">Relato:</span> ${esc(r.relato)}</div>
        <div style="font-size:12px;color:#374151;margin-top:3px;"><span style="color:#6B7280;">Proposta:</span> ${r.proposta?esc(r.proposta):'<em style="color:#9CA3AF;">sem proposta</em>'}</div></div>`).join('')||'<div style="color:#9CA3AF;font-size:12px;padding:8px 0;">Nenhum relato registrado ainda.</div>';

    const curKey=new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0');
    const osMes=ordens.filter(o=>this._mkey(o.data)===curKey).length;
    const fatMes=faturamentos.filter(f=>this._mkey(f.data)===curKey).reduce((s,f)=>s+parseFloat(f.valor||0),0);
    const falhas=this._falhas().length;

    el.innerHTML=`<div style="animation:fadeIn .25s ease;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:10px;flex-wrap:wrap;">
        <div style="font-size:11px;color:#6B7280;">Atualizado às ${new Date(this._devData.em).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
        <div style="display:flex;gap:8px;">
          <button onclick="window._garcia._devCarregar(true)" style="background:#F3F4F6;border:none;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">↻ Atualizar</button>
          <button onclick="window._garcia._toggleAI();window._garcia._relatorioMelhorias();" style="background:#1A1A1A;border:none;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;color:#FFC107;cursor:pointer;">Baixar relatório de relatos</button>
        </div>
      </div>
      ${blocoAcessos}
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px;">
        ${kpi('⚠️','Problemas relatados',cont.problema,'total registrado','#EF4444')}
        ${kpi('💡','Sugestões',cont.sugestao,'total registrado','#10B981')}
        ${kpi('❓','Dificuldades',cont.duvida,'total registrado','#3B82F6')}
        ${kpi('☁️','Falhas de sincronização',falhas,'neste aparelho',falhas?'#F59E0B':'#10B981')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
        <div style="${box}padding:18px;">${h('Relatos por área','Onde estão os problemas')}${barras(contar(rel,r=>r.area||'Geral').slice(0,8),'#EF4444')}
          <div style="height:10px;"></div>${h('Uso do sistema','Dados já existentes')}
          <div style="font-size:12px;color:#374151;line-height:1.9;">OS no mês: <b>${osMes}</b> · OS no total: <b>${ordens.length}</b><br>Clientes cadastrados: <b>${clientes.length}</b><br>Faturamento do mês: <b>${this._fmt(fatMes)}</b></div></div>
        <div style="${box}padding:18px;">${h('Últimos relatos','Problemas e sugestões com a proposta de melhoria da IA')}${listaRel}</div>
      </div>
    </div>`;
  }

  async _relatorioMelhorias(){
    if(!(await this._adminSessao())){ this._adminLoginForm(); return; }
    const load=this._aiBubble('✦ Montando relatório de problemas e sugestões...');
    if(!load)return;
    load.style.color='#9CA3AF';
    let lista=[];
    try {
      const {data,error}=await this._adminDb().from('melhorias_plataforma').select('*').order('created_at',{ascending:false}).limit(200);
      if(error) throw error;
      lista=data||[];
    } catch(e) { console.error('[melhorias] falha ao ler relatos',e); }
    let locais=[];
    try{ locais=JSON.parse(localStorage.getItem('g_melhorias')||'[]').map(x=>({...x,_local:true})); }catch(_){}
    lista=[...locais,...lista];
    load.style.color='#374151';
    if(!lista.length){ load.innerHTML='Ainda não há relatos registrados.'; return; }

    const rot={problema:'⚠️ Problema',sugestao:'💡 Sugestão',duvida:'❓ Dificuldade'};
    const cont={problema:0,sugestao:0,duvida:0};
    lista.forEach(r=>{ cont[r.tipo]=(cont[r.tipo]||0)+1; });
    const fmt=(d)=>{ try{ return new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}); }catch(_){ return ''; } };
    const itens=lista.map(r=>`
      <div style="border-top:1px solid #F3F4F6;padding:8px 0;">
        <div style="font-size:10px;color:#9CA3AF;">${fmt(r.created_at)} · ${this._esc(r.pagina||'')}${r._local?' · só neste aparelho':''}</div>
        <div style="font-weight:700;margin:2px 0;">${rot[r.tipo]||'💡 Sugestão'} — ${this._esc(r.area||'')}</div>
        <div><span style="color:#6B7280;">Relato:</span> ${this._esc(r.relato)}</div>
        <div style="margin-top:3px;"><span style="color:#6B7280;">Proposta:</span> ${r.proposta?this._esc(r.proposta):'<em style="color:#9CA3AF;">sem proposta gerada</em>'}</div>
      </div>`).join('');
    load.innerHTML=`<strong>📊 Relatório de uso — melhorias da plataforma</strong><br>`+
      `<div style="margin:6px 0 4px;color:#6B7280;">${lista.length} relato(s): ${cont.problema} problema(s), ${cont.sugestao} sugestão(ões), ${cont.duvida} dificuldade(s)</div>`+
      itens+
      `<button id="ai-rel-dl" style="margin-top:8px;background:#1A1A1A;color:#FFC107;border:none;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;">Baixar relatório (.txt)</button>`+
      `<button id="ai-adm-sair" style="margin:8px 0 0 6px;background:none;color:#6B7280;border:1px solid #E5E7EB;border-radius:6px;padding:6px 10px;font-size:11px;font-weight:600;cursor:pointer;">Sair do admin</button>`;
    load.querySelector('#ai-adm-sair')?.addEventListener('click',()=>this._adminSair());
    load.querySelector('#ai-rel-dl')?.addEventListener('click',()=>{
      const txt=['RELATÓRIO DE MELHORIAS DA PLATAFORMA — GARCIA AUTO MECÂNICA','Gerado em '+fmt(new Date()),
        `${lista.length} relato(s): ${cont.problema} problema(s), ${cont.sugestao} sugestão(ões), ${cont.duvida} dificuldade(s)`,'',
        ...lista.map((r,i)=>`${i+1}. [${(rot[r.tipo]||'Sugestão').replace(/^\S+\s/,'')}] ${r.area||''} — ${fmt(r.created_at)} (tela: ${r.pagina||'-'})\n   Relato: ${r.relato}\n   Proposta: ${r.proposta||'-'}\n`)].join('\n');
      const a=document.createElement('a');
      a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain;charset=utf-8'}));
      a.download='relatorio-melhorias-garcia.txt';
      a.click();
      setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    });
    const msgs=document.getElementById('ai-msgs');
    if(msgs) msgs.scrollTop=load.offsetTop-msgs.offsetTop-10;
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
    const pages={dashboard:{title:'Dashboard',sub:'Visão geral da oficina',btn:'+ Nova OS',action:()=>this._modalOS()},os:{title:'Ordens de Serviço',sub:ordens.filter(o=>o.status!=='Concluída').length+' em atendimento',btn:'+ Nova OS',action:()=>this._modalOS()},clientes:{title:'Clientes',sub:clientes.length+' cadastrados',btn:'+ Novo Cliente',action:()=>this._modalCli()},receitas:{title:'Receitas',sub:'Faturamentos registrados',btn:'+ Nova Receita',action:()=>this._modalRec()},despesas:{title:'Despesas',sub:'Lançamentos do período',btn:'+ Nova Despesa',action:()=>this._modalDep()},financeiro:{title:'Financeiro',sub:'Análise financeira completa',btn:'+ Nova Despesa',action:()=>this._modalDep()},'financeiro-detalhes':{title:'Financeiro',sub:'Detalhes e rankings completos',btn:'',action:()=>{}},funcionarios:{title:'Funcionários',sub:this.state.funcionarios.length+' cadastrados',btn:'+ Novo Funcionário',action:()=>this._modalFunc()},configuracoes:{title:'Configurações',sub:'Ajustes e cadastros da plataforma',btn:'',action:()=>{}},dev:{title:'Dashboard DEV',sub:'Métricas da plataforma · visível só para o desenvolvedor',btn:'',action:()=>{}}};
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
      ...(this.state.devMode?[{...na('dev'),label:'Dashboard DEV',badge:false,badgeVal:'',iconEl:ni(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${page==='dev'?'#FFC107':'#9CA3AF'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,page==='dev'),go:()=>goTo('dev')}]:[]),
    ];
    window._garcia = this;
    setTimeout(()=>this._render(),0);
    return {
      notLoggedIn:!loggedIn, isLoggedIn:loggedIn,
      showErr:!!loginErr, loginErr, doLogin:this.doLogin, loginEnter:this.loginEnter,
      adminToggle:this.adminToggle, adminLogin:this.adminLogin, adminEnter:this.adminEnter,
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
      reportAI:()=>this._relatorioMelhorias(),
      aiInputKeyDown:(e)=>{ if(e.key==='Enter') this._sendAI(); },
    };
  }
}
