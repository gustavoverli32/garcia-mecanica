  _modalOS(){
    const box=document.getElementById('modal-box');
    if(box){box.style.maxHeight='90vh';box.style.overflowY='auto';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Nova Ordem de Serviço</span>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:13px;">

        <div>
          <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Telefone do Cliente *</div>
          <div style="position:relative;">
            <input id="f-tel-os" placeholder="(22) 99999-9999" maxlength="20"
              style="width:100%;padding:10px 44px 10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"
              oninput="window._garcia._buscaCliente()">
            <div id="tel-ico" style="position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;"></div>
          </div>
          <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin:12px 0 6px;">Nome e Sobrenome do Cliente *</div>
          <div style="position:relative;">
            <input id="f-nome-os" list="os-clientes-datalist" placeholder="Ex: João Silva" autocomplete="off"
              style="width:100%;padding:10px 44px 10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"
              oninput="window._garcia._buscaCliente()">
            <div id="nome-ico" style="position:absolute;right:13px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none;"></div>
          </div>
          <datalist id="os-clientes-datalist">${(this.state.clientes||[]).map(c=>`<option value="${(c.nome||'').replace(/"/g,'&quot;')}">`).join('')}</datalist>
          <div id="cli-card" style="display:none;margin-top:8px;background:#F0FDF4;border:1.5px solid #10B981;border-radius:8px;padding:10px 13px;align-items:center;gap:10px;">
            <div id="cli-ini" style="width:32px;height:32px;background:#10B981;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;">?</div>
            <div><div id="cli-nome-show" style="font-size:13px;font-weight:700;color:#065F46;"></div><div style="font-size:10px;color:#6B7280;margin-top:1px;">Cliente cadastrado ✓</div></div>
          </div>
          <div id="cli-novo" style="display:none;margin-top:8px;background:#FEF3C7;border:1.5px solid #FCD34D;border-radius:8px;padding:10px 13px;">
            <div style="font-size:11px;font-weight:600;color:#92400E;">Cliente não encontrado — será cadastrado com o telefone e o nome informados acima.</div>
          </div>
          <input type="hidden" id="f-cli-id" value="">
        </div>

        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Veículo</div><input id="f-vei" placeholder="Ex: Honda Civic 2020" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Placa do Veículo</div><input id="f-placa" placeholder="Ex: LQO9D82" maxlength="8" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()"></div>
        <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Mecânico Responsável</div><select id="f-mec" onchange="window._garcia._onMecSel(this.value)" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;"><option value="">Selecione o mecânico...</option>${this.state.funcionarios.filter(f=>f.cargo==='mecanico').map(f=>`<option value="${f.nome}">${f.nome}</option>`).join('')}</select></div>
        <div id="f-com-wrap" style="display:none;"><div style="font-size:10px;font-weight:700;color:#92400E;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Comissão do Mecânico (%)</div><input id="f-com-pct" type="number" value="15" min="0" max="100" style="width:100%;padding:10px 12px;border:2px solid #FCD34D;border-radius:8px;font-size:13px;background:#FFFBEB;"><div style="font-size:10px;color:#9CA3AF;margin-top:4px;">Sobre a mão de obra (sem peças). Preenchido com o % padrão do mecânico — edite se for diferente nesta OS.</div></div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;">Serviços *</div>
            <button onclick="window._garcia._addSrvRow()" style="background:#FFC107;border:none;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#000;cursor:pointer;">+ Serviço</button>
          </div>
          <div id="os-srv-rows"></div>
          <datalist id="os-servicos-datalist">${(this.state.servicos||[]).map(s=>`<option value="${(s.nome||'').replace(/"/g,'&quot;')}">`).join('')}</datalist>
        </div>

        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;">Peças Compradas</div>
            <button onclick="window._garcia._addPecaRow()" style="background:#FFC107;border:none;border-radius:6px;padding:3px 10px;font-size:11px;font-weight:700;color:#000;cursor:pointer;">+ Peça</button>
          </div>
          <div style="font-size:10px;color:#9CA3AF;margin-bottom:6px;">Peças compradas em lojas parceiras (oficina não vende peças)</div>
          <div id="os-peca-rows"></div>
        </div>

        <div>
          <div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Nota Fiscal da Peça (foto/PDF)</div>
          <input id="f-nf-peca" type="file" accept="image/*,.pdf" style="width:100%;padding:8px;border:2px dashed #E5E7EB;border-radius:8px;font-size:12px;background:#FAFAFA;">
          <div id="nf-peca-preview" style="font-size:11px;color:#10B981;margin-top:4px;"></div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Valor Total (R$)</div><input id="f-val" type="number" placeholder="0,00" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;" oninput=""></div>
          <div><div style="font-size:10px;font-weight:700;color:#374151;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Status</div><select id="f-st" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:13px;background:#fff;"><option>Aguardando Peça</option><option>Em Andamento</option><option>Orçamento</option></select></div>
        </div>
        <button id="btn-save-os" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;margin-top:4px;">SALVAR OS</button>
      </div>`);
    document.getElementById('btn-save-os').onclick = () => this._saveOS();
    this._addSrvRow();
    this._addSrvRow();
    this._addPecaRow();
    document.getElementById('f-nf-peca').addEventListener('change',(e)=>this._handleNFUpload(e,'nf-peca-preview'));
  }

  _addPecaRow(){
    const c=document.getElementById('os-peca-rows');if(!c)return;
    const id='p'+Date.now()+Math.round(Math.random()*9999);
    const d=document.createElement('div');
    d.id=id;d.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;align-items:center;';
    d.innerHTML=`<input placeholder="Peça (ex: pastilha de freio)" class="peca-nome" style="flex:2 1 120px;min-width:0;padding:9px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><input placeholder="Loja fornecedora" class="peca-loja" style="flex:1.5 1 100px;min-width:0;padding:9px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><input placeholder="R$" type="number" class="peca-val" style="width:70px;min-width:0;padding:9px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><button onclick="document.getElementById('${id}').remove()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:8px 10px;cursor:pointer;font-size:13px;flex-shrink:0;">✕</button>`;
    c.appendChild(d);
  }

  _getPecasList(prefix){
    const c=document.getElementById(prefix||'os-peca-rows');if(!c)return[];
    return [...c.children].map(row=>({
      nome:row.querySelector('.peca-nome')?.value.trim()||'',
      loja:row.querySelector('.peca-loja')?.value.trim()||'',
      valor:parseFloat(row.querySelector('.peca-val')?.value)||0
    })).filter(p=>p.nome||p.loja);
  }

  _getPecasList2(){
    const c=document.getElementById('edit-peca-list');if(!c)return[];
    return [...c.children].map(row=>({
      nome:row.querySelector('.peca-nome')?.value.trim()||'',
      loja:row.querySelector('.peca-loja')?.value.trim()||'',
      valor:parseFloat(row.querySelector('.peca-val')?.value)||0
    })).filter(p=>p.nome||p.loja);
  }

  _handleNFUpload(e,previewId,cb){
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      this._nfDataUrl=reader.result;
      const el=document.getElementById(previewId);
      if(el)el.textContent='✓ '+file.name+' anexado';
      if(cb)cb(reader.result);
    };
    reader.readAsDataURL(file);
  }

  _onMecSel(nome){
    const wrap=document.getElementById('f-com-wrap');
    const inp=document.getElementById('f-com-pct');
    const f=this.state.funcionarios.find(x=>x.nome===nome&&x.cargo==='mecanico');
    if(wrap)wrap.style.display=nome?'block':'none';
    if(inp&&f)inp.value=this._getCom(f);
  }
  _parseComPct(s){
    if(!s)return null;
    try{ const arr=JSON.parse(s); if(Array.isArray(arr)){ const c=arr.find(x=>x.comissao_pct!=null); if(c)return parseFloat(c.comissao_pct); } }catch(e){}
    const m=s.match(/\[Com:\s*([\d.,]+)%?\]/);
    return m?parseFloat(m[1].replace(',','.')):null;
  }

  _normNome(s){ return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim(); }

  _buscaCliente(){
    const telEl=document.getElementById('f-tel-os');
    const nomeEl=document.getElementById('f-nome-os');
    const card=document.getElementById('cli-card');
    const novo=document.getElementById('cli-novo');
    const ico=document.getElementById('tel-ico');
    const icoN=document.getElementById('nome-ico');
    const idEl=document.getElementById('f-cli-id');
    if(!telEl||!card||!novo||!ico||!idEl)return;
    const tel=(telEl.value||'').replace(/\D/g,'');
    const nomeN=this._normNome(nomeEl?nomeEl.value:'');
    let found=null;
    if(tel.length>=7){
      found=this.state.clientes.find(c=>{
        const ct=(c.telefone||'').replace(/\D/g,'');
        if(!ct)return false;
        return ct===tel || ct.endsWith(tel) || tel.endsWith(ct);
      });
    }
    if(!found&&nomeN.length>=3){
      found=this.state.clientes.find(c=>this._normNome(c.nome)===nomeN)
         || this.state.clientes.find(c=>this._normNome(c.nome).includes(nomeN))
         || null;
    }
    if(!found&&tel.length<7&&nomeN.length<3){
      card.style.display='none'; novo.style.display='none';
      ico.textContent=''; if(icoN)icoN.textContent=''; idEl.value=''; return;
    }
    if(found){
      card.style.display='flex'; novo.style.display='none';
      if(icoN){ icoN.textContent='✓'; icoN.style.color='#10B981'; }
      if(nomeEl&&!nomeEl.value.trim()) nomeEl.value=found.nome||'';
      if(!tel&&found.telefone) telEl.value=found.telefone;
      ico.textContent='✓'; ico.style.color='#10B981';
      document.getElementById('cli-ini').textContent=(found.nome||'?')[0].toUpperCase();
      document.getElementById('cli-nome-show').textContent=found.nome;
      idEl.value=found.id;
      /* Auto-preenche veículo e placa da última OS do cliente (editável) */
      const ultOS=this.state.ordens.find(o=>o.cliente_id===found.id&&o.veiculo);
      const veiEl=document.getElementById('f-vei');
      const plEl=document.getElementById('f-placa');
      if(ultOS&&veiEl&&!veiEl.value.trim()){ veiEl.value=ultOS.veiculo||''; }
      if(ultOS&&plEl&&!plEl.value.trim()){ plEl.value=ultOS.placa||''; }
    } else {
      card.style.display='none';
      novo.style.display=(tel.length>=7||nomeN.length>=3)?'block':'none';
      ico.textContent=tel.length>=7?'✕':''; ico.style.color='#EF4444';
      if(icoN){ icoN.textContent=nomeN.length>=3?'✕':''; icoN.style.color='#EF4444'; }
      idEl.value='';
    }
  }

  _addSrvRow(){
    const c=document.getElementById('os-srv-rows');if(!c)return;
    const id='s'+Date.now()+Math.round(Math.random()*9999);
    const d=document.createElement('div');
    d.id=id;d.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:center;';
    d.innerHTML=`<input list="os-servicos-datalist" placeholder="Buscar ou digitar um serviço..." style="flex:1;padding:9px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><button onclick="document.getElementById('${id}').remove()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:8px 10px;cursor:pointer;font-size:13px;flex-shrink:0;">✕</button>`;
    c.appendChild(d);
  }

  _getSrvList(){
    const c=document.getElementById('os-srv-rows');if(!c)return[];
    return [...c.querySelectorAll('input')].map(i=>i.value.trim()).filter(Boolean);
  }

  async _saveOS(){
    const tel=(document.getElementById('f-tel-os')?.value||'').trim();
    const cliId=document.getElementById('f-cli-id')?.value;
    const nomeNovo=(document.getElementById('f-nome-os')?.value||'').trim();
    const vei=(document.getElementById('f-vei')?.value||'').trim();
    const placa=(document.getElementById('f-placa')?.value||'').trim();
    const srvList=this._getSrvList();
    const mec=document.getElementById('f-mec')?.value||'';
    const val=parseFloat(document.getElementById('f-val')?.value||0);
    const st=document.getElementById('f-st')?.value;
    if(!tel){this._toast('Informe o telefone',false);return;}
    if(!nomeNovo){this._toast('Informe o nome e sobrenome do cliente',false);return;}
    if(!vei){this._toast('Preencha o veículo',false);return;}
    if(srvList.length===0){this._toast('Adicione pelo menos um serviço',false);return;}
    const srv=srvList.join(' | ')+(mec?' [Mec: '+mec+']':'')+(mec?' [Com: '+(parseFloat(document.getElementById('f-com-pct')?.value||15))+'%]':'');
    const pecas=this._getPecasList('os-peca-rows');
    try{
      let finalCliId=cliId?parseInt(cliId):null;
      if(!cliId&&nomeNovo){
        const {data:novoCli,error:errCli}=await this._db.from('clientes').insert({nome:nomeNovo,telefone:tel,email:''}).select();
        if(errCli)throw errCli;
        finalCliId=novoCli?.[0]?.id||null;
      }
      const dataOS=this._today();
      const {data:novaOS,error}=await this._db.from('ordens').insert({
        cliente_id:finalCliId,
        veiculo:vei,
        placa:placa||null,
        servico:srv,
        valor:val,
        status:st,
        data:dataOS,
        hora:new Date().toTimeString().slice(0,8),
        pecas:pecas.length?JSON.stringify(pecas):null,
        nota_fiscal:this._nfDataUrl||null,
      }).select();
      if(error)throw error;
      await this._processarRevisoes(finalCliId, srvList, novaOS?.[0]?.id, dataOS);
      this._closeModal();
      this._nfDataUrl=null;
      this._toast('OS criada!');
      await this._load();
      if(novaOS?.[0]) this._modalChecklist(novaOS[0]);
    }catch(e){ alert(this._msgErro(e)); }
  }

  _printViaIframe(html){
    let ifr=document.getElementById('__print-iframe');
    if(!ifr){ ifr=document.createElement('iframe'); ifr.id='__print-iframe'; ifr.style.cssText='position:fixed;width:0;height:0;border:0;visibility:hidden;'; document.body.appendChild(ifr); }
    ifr.onload=()=>{ setTimeout(()=>{ try{ ifr.contentWindow.focus(); ifr.contentWindow.print(); }catch(e){ this._toast('Erro ao abrir impressão',false); } },150); };
    ifr.srcdoc=html;
  }
  _notaOSHTML(o){
    const esc=value=>this._osEscape(value);
    const c=this.state.clientes.find(x=>x.id==o.cliente_id)||o.clientes||{};
    const pagamentos=(this.state.faturamentos||[]).filter(f=>f.os_id==o.id&&f.status==='Pago');
    const formas=[...new Set(pagamentos.map(f=>f.forma).filter(Boolean))].join(', ');
    const logoSrc=document.querySelector('img[alt="Garcia Logo"]')?.src||'uploads/logo.png';
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>OS ${esc(o.id)} finalizada - Garcia Auto Mecânica</title><style>
      @page{size:A4;margin:18mm}body{font:14px Arial,sans-serif;color:#171717;max-width:760px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;border-bottom:4px solid #FFC107;padding-bottom:18px}header img{max-height:54px;max-width:110px}h1{font-size:23px;margin:4px 0}.muted{color:#666;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 26px;margin:28px 0}.grid div{border-bottom:1px solid #ddd;padding-bottom:8px}.grid small{display:block;color:#777;font-size:10px;text-transform:uppercase;letter-spacing:.7px;margin-bottom:5px}section{border-top:1px solid #ddd;padding:18px 0}section h2{font-size:14px;margin:0 0 10px}section p{line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}.total{display:flex;justify-content:space-between;background:#FFF9E6;padding:15px;font-size:17px;font-weight:700}.paid{font-size:15px;color:#087c56;font-weight:700;margin-top:12px}footer{border-top:1px solid #ddd;color:#666;font-size:11px;margin-top:50px;padding-top:12px}@media print{body{max-width:none}}
    </style></head><body><header><div><h1>Ordem de serviço finalizada</h1><div>Garcia Auto Mecânica · OS #${esc(o.id)}</div></div><img src="${esc(logoSrc)}" alt="Garcia Auto Mecânica"></header>
    <div class="grid"><div><small>Cliente</small>${esc(c.nome||'Não informado')}</div><div><small>Telefone</small>${esc(c.telefone||'Não informado')}</div><div><small>Veículo</small>${esc(o.veiculo||'Não informado')}</div><div><small>Placa</small>${esc(o.placa||'Não informada')}</div><div><small>Data da OS</small>${esc(this._dfmt(o.data))}</div><div><small>Situação</small>Concluída · Pago</div></div>
    <section><h2>Serviços executados</h2><p>${esc(this._parseSrv(o.servico)||'Não informado')}</p></section>
    ${o.pecas?`<section><h2>Peças</h2><p>${esc(o.pecas)}</p></section>`:''}
    ${o.observacoes?`<section><h2>Observações</h2><p>${esc(o.observacoes)}</p></section>`:''}
    <div class="total"><span>Valor total</span><span>${esc(this._fmt(o.valor))}</span></div><div class="paid">PAGO · ${esc(this._fmt(o.valor_pago))}${formas?' · '+esc(formas):''}</div>
    <footer>Documento gerado a partir dos dados da OS na Garcia Auto Mecânica. Guarde o PDF antes de enviá-lo ao cliente.</footer></body></html>`;
  }
  _imprimirNotaOS(id){
    const o=this.state.ordens.find(x=>x.id==id);
    if(!o||o.status!=='Concluída'||o.status_pagamento!=='Pago'||Number(o.valor_pago||0)<Number(o.valor||0))return;
    this._printViaIframe(this._notaOSHTML(o));
  }
  _modalNotaOS(id){
    const o=this.state.ordens.find(x=>x.id==id);
    if(!o||o.status!=='Concluída'||o.status_pagamento!=='Pago'||Number(o.valor_pago||0)<Number(o.valor||0))return;
    const esc=value=>this._osEscape(value);
    const c=this.state.clientes.find(x=>x.id==o.cliente_id)||o.clientes||{};
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='480px';}
    this._openModal(`<div class="gm-os-note"><h2>OS #${esc(o.id)} finalizada</h2><p>Pagamento confirmado. A nota está pronta para salvar em PDF e enviar ao cliente.</p><div class="gm-os-note-paid">PAGO · ${esc(this._fmt(o.valor_pago))}</div><p>${esc(c.nome||'Cliente')} · ${esc(o.veiculo||'Veículo')}</p><div class="gm-os-detail-actions"><button type="button" class="gm-os-action" onclick="window._garcia._imprimirNotaOS(${Number(o.id)})">Imprimir / salvar PDF</button><button type="button" class="gm-os-action gm-os-action-secondary" onclick="window._garcia._whatsappNotaOS(${Number(o.id)})">Abrir WhatsApp</button></div><p class="gm-os-note-help">No WhatsApp, anexe manualmente o PDF salvo. O documento não é enviado automaticamente.</p><button type="button" class="gm-os-action gm-os-action-secondary" onclick="window._garcia._closeModal()">Fechar</button></div>`);
  }
  _whatsappNotaOS(id){
    const o=this.state.ordens.find(x=>x.id==id);
    if(!o||o.status!=='Concluída'||o.status_pagamento!=='Pago')return;
    const c=this.state.clientes.find(x=>x.id==o.cliente_id)||o.clientes||{};
    const tel=String(c.telefone||'').replace(/\D/g,'');
    const numero=tel.startsWith('55')?tel:'55'+tel;
    const msg=`Olá ${c.nome||''}! Sua ordem de serviço #${o.id} da Garcia Auto Mecânica foi finalizada e o pagamento confirmado. Vamos enviar o documento em PDF nesta conversa.`;
    window.open(`https://wa.me/${tel?numero:''}?text=${encodeURIComponent(msg)}`,'_blank','noopener');
  }
  _checklistHTML(os){
    const nome=os?.clientes?.nome||this.state.clientes.find(x=>x.id===os?.cliente_id)?.nome||'';
    const veiculo=os?.veiculo||'';
    const placa=os?.placa||'';
    const logoSrc=document.querySelector('img[alt="Garcia Logo"]')?.src||'uploads/logo.png';
    const field=(label,val)=>`<div style="flex:1;min-width:200px;"><span style="font-weight:700;">${label}:</span> <span style="border-bottom:1px solid #999;display:inline-block;min-width:160px;padding:0 4px 2px;">${val||''}</span></div>`;
    const carsRow=`<div style="padding:14px 10px;border:1px solid #ccc;border-top:none;text-align:center;">
      <img src="${this._CAR_IMG}" style="max-width:100%;height:auto;">
    </div>`;
    const cb=(label)=>`<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:11px;"><span style="width:13px;height:13px;border:1.5px solid #333;display:inline-block;flex-shrink:0;"></span>${label}</div>`;
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Checklist - ${nome||'Cliente'}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12px;color:#111;margin:24px 30px;}
      .sec-title{background:#1E3A5F;color:#fff;font-weight:700;padding:6px 12px;font-size:12px;margin:14px 0 0;}
      table{border-collapse:collapse;width:100%;}
      @media print{body{margin:14px 18px}}
    </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #1E3A5F;padding-bottom:10px;">
        <div style="font-size:24px;font-weight:700;flex:1;text-align:center;">Checklist de Entrada</div>
        <img src="${logoSrc}" style="height:46px;object-fit:contain;">
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px 24px;padding:14px 4px;border-bottom:1px solid #ccc;">
        ${field('Nome do cliente',nome)}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px 24px;padding:14px 4px;border-bottom:1px solid #ccc;">
        ${field('Veículo marca',veiculo)}
        ${field('Modelo','')}
        ${field('Placa do veículo',placa)}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:10px 24px;padding:14px 4px;">
        ${field('Hora de início','')}
      </div>

      <div class="sec-title">Marcas e observações na carroceria</div>
      ${carsRow}


      <div class="sec-title">Serviços solicitados (inspeção/manutenção/reparação) &amp; Observações</div>
      <div style="border:1px solid #ccc;border-top:none;min-height:80px;padding:10px;"></div>

      <div class="sec-title">Checklist rápido</div>
      <div style="display:flex;gap:16px;padding:10px 4px;">
        <div style="flex:1;"><div style="font-weight:700;font-size:11px;margin-bottom:4px;">Dentro do veículo</div>
          ${cb('Instrumentos do painel e lâmpadas de controle')}${cb('Iluminação dos instrumentos do painel')}${cb('Lâmpadas internas')}${cb('Setas de direção e luzes de sinalização')}${cb("Jato d'água dos limpadores de para-brisa")}${cb('Ar-condicionado / ar-quente / ventilação')}${cb('Buzina')}${cb('Etiqueta de óleo')}${cb('Vidro elétrico')}${cb('Freio de estacionamento')}${cb('Cinto de segurança e fixação')}
        </div>
        <div style="flex:1;"><div style="font-weight:700;font-size:11px;margin-bottom:4px;">Fora do veículo</div>
          ${cb('Palhetas dos limpadores de para-brisa e vidro traseiro')}${cb('Sistema de iluminação (faróis, setas, freio, placa, ré)')}${cb('Condições dos pneus / pressão (inclusive estepe)')}${cb('Chave de roda, macaco e triângulo de segurança')}
        </div>
        <div style="flex:1;"><div style="font-weight:700;font-size:11px;margin-bottom:4px;">Capô levantado</div>
          ${cb('Líquido de arrefecimento (vazamento, nível, aditivo)')}${cb('Fluido de freio: nível, qualidade')}${cb('Nível do óleo do motor')}${cb('Nível do óleo hidráulico (óleo de direção)')}${cb('Sistema de limpa-vidros / completar reservatório')}${cb('Reservatório de partida a frio')}${cb('Vazamentos gerais')}
        </div>
      </div>

      <div style="margin-top:30px;display:flex;justify-content:center;">
        <div style="text-align:center;width:60%;"><div style="border-top:1px solid #333;padding-top:6px;font-size:11px;">Assinatura cliente</div></div>
      </div>
    </body></html>`;
  }
  _modalChecklist(os){
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='820px';box.style.maxHeight='90vh';box.style.overflowY='auto';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <span style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">Checklist de Entrada</span>
        <div style="display:flex;gap:8px;">
          <button onclick="window._garcia._imprimirChecklist(${os.id})" style="background:#FFC107;border:none;border-radius:8px;padding:9px 16px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#000;cursor:pointer;">🖨️ Imprimir</button>
          <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:34px;height:34px;cursor:pointer;font-size:16px;color:#6B7280;">×</button>
        </div>
      </div>
      <iframe id="checklist-iframe" style="width:100%;height:70vh;border:1px solid #E5E7EB;border-radius:8px;background:#fff;"></iframe>
    `);
    setTimeout(()=>{ const f=document.getElementById('checklist-iframe'); if(f) f.srcdoc=this._checklistHTML(os); },30);
  }
  _imprimirChecklist(id){
    const os=this.state.ordens.find(x=>x.id===id)||{id};
    const html=this._checklistHTML(os);
    this._printViaIframe(html);
  }
  _modalPagamento(osId,somentePagamento=false){
    const o=this.state.ordens.find(x=>x.id===osId);
    if(!o)return;
    const jaPago=parseFloat(o.valor_pago||0);
    const falta=Math.max((parseFloat(o.valor||0))-jaPago,0);
    const mec=this._mecDaOS(o);
    const jaTemCom=mec?this._getFPags(mec).some(p=>p.tipo==='Comissão'&&p.os_id===o.id):false;
    const comBase=mec?this._maoDeObraOS(o):0;
    const comPct=mec?(this._parseComPct(o.servico)??this._getCom(mec)):0;
    const comBlock=(mec&&!jaTemCom)?`
        <div style="background:#FFFBEB;border:1.5px solid #FCD34D;border-radius:10px;padding:12px 14px;margin-bottom:16px;text-align:left;">
          <div style="font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">🔧 Comissão — ${mec.nome}</div>
          <div style="display:grid;grid-template-columns:1fr 80px;gap:8px;margin-bottom:8px;">
            <div><div style="font-size:9px;color:#92400E;font-weight:600;margin-bottom:3px;">Mão de obra (R$)</div><input id="pg-com-base" type="number" value="${comBase.toFixed(2)}" oninput="window._garcia._updComPrev()" style="width:100%;padding:8px 10px;border:1.5px solid #FCD34D;border-radius:7px;font-size:12px;box-sizing:border-box;background:#fff;"></div>
            <div><div style="font-size:9px;color:#92400E;font-weight:600;margin-bottom:3px;">%</div><input id="pg-com-pct" type="number" value="${comPct}" min="0" max="100" oninput="window._garcia._updComPrev()" style="width:100%;padding:8px 10px;border:1.5px solid #FCD34D;border-radius:7px;font-size:12px;box-sizing:border-box;background:#fff;"></div>
          </div>
          <div style="font-size:12px;color:#92400E;">Comissão: <b id="pg-com-prev">${this._fmt(comBase*comPct/100)}</b> — registrada quando a OS for totalmente paga.</div>
        </div>`:'';
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='400px';}
    this._openModal(`
      <div style="text-align:center;padding:8px 0 16px;">
        <div style="width:56px;height:56px;background:#ECFDF5;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:26px;">✓</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;margin-bottom:6px;">Registrar pagamento da OS #${o.id}</div>
        <div style="font-size:12px;color:#6B7280;margin-bottom:20px;">${o.clientes?.nome||'Cliente'} · ${o.veiculo||''}</div>
        <div style="background:#F9FAFB;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #F0F0F0;display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:left;">
          <div><div style="font-size:10px;color:#9CA3AF;">Valor da OS</div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">${this._fmt(o.valor)}</div></div>
          <div><div style="font-size:10px;color:#9CA3AF;">Falta pagar</div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:${falta>0?'#EF4444':'#10B981'};">${this._fmt(falta)}</div></div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;text-align:left;">Valor pago agora (R$)</div>
        <input id="pg-valor" type="number" value="${falta.toFixed(2)}" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:14px;margin-bottom:14px;">
        ${comBlock}
        <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Forma de pagamento</div>
        <div style="display:flex;gap:8px;margin-bottom:16px;">
          <button onclick="window._garcia._setPgForma('Pix')" id="pg-b-pix" style="flex:1;padding:9px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;">PIX</button>
          <button onclick="window._garcia._setPgForma('Cartão')" id="pg-b-car" style="flex:1;padding:9px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;">Cartão</button>
          <button onclick="window._garcia._setPgForma('Dinheiro')" id="pg-b-din" style="flex:1;padding:9px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-weight:600;color:#374151;background:#fff;cursor:pointer;">Dinheiro</button>
        </div>
        <input type="hidden" id="pg-forma-sel" value="">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button onclick="${somentePagamento?'window._garcia._closeModal()':`window._garcia._confirmarPagamento(${osId},false)`}" style="padding:11px;background:#F3F4F6;border:none;border-radius:9px;font-size:13px;font-weight:600;color:#6B7280;cursor:pointer;">${somentePagamento?'Cancelar':'Concluir sem pagamento'}</button>
          <button onclick="window._garcia._confirmarPagamento(${osId},true)" style="padding:11px;background:#10B981;border:none;border-radius:9px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#fff;cursor:pointer;letter-spacing:.5px;">REGISTRAR PAGAMENTO</button>
        </div>
      </div>`);
    this._pgOsId=osId;
  }

  _updComPrev(){
    const base=parseFloat(document.getElementById('pg-com-base')?.value||0);
    const pct=parseFloat(document.getElementById('pg-com-pct')?.value||0);
    const el=document.getElementById('pg-com-prev');
    if(el)el.textContent=this._fmt(base*pct/100);
  }

  _setPgForma(forma){
    document.getElementById('pg-forma-sel').value=forma;
    ['pix','car','din'].forEach(k=>{
      const btn=document.getElementById('pg-b-'+k);
      if(btn){btn.style.borderColor='#E5E7EB';btn.style.background='#fff';btn.style.color='#374151';}
    });
    const map={Pix:'pix',Cartão:'car',Dinheiro:'din'};
    const btn=document.getElementById('pg-b-'+map[forma]);
    if(btn){btn.style.borderColor='#10B981';btn.style.background='#ECFDF5';btn.style.color='#065F46';}
  }

  async _confirmarPagamento(osId,recebido){
    const o=this.state.ordens.find(x=>x.id===osId);
    if(!o)return;
    if(this._pagamentoEmAndamento)return;
    const jaPago=parseFloat(o?.valor_pago||0);
    const valorOS=parseFloat(o?.valor||0);
    const entrada=Number(document.getElementById('pg-valor')?.value||0);
    const recebidoArredondado=Math.round(entrada*100)/100;
    if(recebido&&(!Number.isFinite(entrada)||entrada<=0||Math.abs(entrada-recebidoArredondado)>0.000001||recebidoArredondado>Math.max(valorOS-jaPago,0)+0.000001)){this._toast('Informe um valor válido até o saldo da OS, com no máximo duas casas decimais.',false);return;}
    if(recebido&&!document.getElementById('pg-forma-sel')?.value){this._toast('Selecione a forma de pagamento.',false);return;}
    const recebidoAgora=recebido?recebidoArredondado:0;
    const novoPago=Math.min(jaPago+recebidoAgora,valorOS);
    const statusPg=novoPago<=0?'Pendente':(novoPago>=valorOS?'Pago':'Parcial');
    /* captura dados de comissão antes de fechar o modal */
    const comBase=parseFloat(document.getElementById('pg-com-base')?.value||0);
    const comPct=parseFloat(document.getElementById('pg-com-pct')?.value||0);
    this._pagamentoEmAndamento=true;
    try{
    const {error:errOS}=await this._db.from('ordens').update({status:'Concluída',valor_pago:novoPago,status_pagamento:statusPg}).eq('id',osId);
    if(errOS){this._toast('Erro ao concluir OS',false);return;}
    let receitaRegistrada=true;
    if(recebidoAgora>0){
      const forma=document.getElementById('pg-forma-sel')?.value;
      const {error:errFat}=await this._db.from('faturamentos').insert({
        cliente_id:o?.cliente_id||null,
        os_id:o?.id||null,
        valor:recebidoAgora,
        data:this._today(),
        forma,
        status:'Pago',
      });
      if(errFat){receitaRegistrada=false;this._toast('OS concluída, mas erro ao registrar receita: '+errFat.message,false);}
      else{this._toast(statusPg==='Parcial'?'Pagamento parcial registrado! Falta '+this._fmt(valorOS-novoPago):'OS concluída e receita registrada!');}
    } else {
      this._toast('OS marcada como concluída!'+(statusPg!=='Pago'?' Pagamento pendente.':''));
    }
    /* Comissão do mecânico — registrada quando a OS fica totalmente paga */
    if(statusPg==='Pago'&&receitaRegistrada){
      const mec=this._mecDaOS(o);
      const comVal=comBase*comPct/100;
      if(mec&&comVal>0&&!this._getFPags(mec).some(p=>p.tipo==='Comissão'&&p.os_id===osId)){
        const desp={descricao:`Comissão — ${mec.nome} (OS #${osId})`,cat:'Salários',tipo:'Fixa',valor:comVal,data:this._today(),recorrente:false};
        const pagCom={id:Date.now(),data:this._today(),tipo:'Comissão',valor:comVal,os_id:osId,obs:`OS #${osId} · ${comPct}% de ${this._fmt(comBase)}`};
        try{
          const {data:dd,error:de}=await this._db.from('despesas').insert([desp]).select();
          if(!de&&dd?.[0])pagCom.despesa_id=dd[0].id; else throw de;
        }catch(e){
          pagCom.despesa_id='l'+Date.now();
          const dep=[...this.state.despesas,{id:pagCom.despesa_id,...desp}];
          localStorage.setItem('g_dep',JSON.stringify(dep));
          this.setState({despesas:dep});
          this._falhaNuvem('Comissão de '+mec.nome+' (OS #'+osId+')',e);
        }
        await this._saveFPags(mec.id,[...this._getFPags(mec),pagCom]);
        this._toast(`Comissão de ${this._fmt(comVal)} registrada para ${mec.nome}! 🔧`);
      }
    }
    this._closeModal();
    await this._load();
    if(statusPg==='Pago'&&receitaRegistrada)setTimeout(()=>this._modalNotaOS(osId),0);
    }catch(e){this._toast('Falha ao registrar pagamento. Confira a OS e o financeiro antes de tentar novamente.',false);}
    finally{this._pagamentoEmAndamento=false;}
  }

