  _editarOS(id){
    const o=this.state.ordens.find(x=>x.id===id)||{};
    const mecanicos=this.state.funcionarios||[];
    const mecNomeAtual=this._parseMec(o.servico);
    const mecOpts=mecanicos.map(m=>`<option value="${m.id}" ${(o.mecanico_id==m.id||m.nome===mecNomeAtual)?'selected':''}>${m.nome} (${m.cargo||'Mecânico'})</option>`).join('');

    // Parse serviços existentes
    let servicos=[];
    try{ const p=JSON.parse(o.servico||'[]'); servicos=(Array.isArray(p)?p:[{nome:o.servico||'',valor:''}]).filter(x=>x.mecanico==null&&x.comissao_pct==null); }
    catch(e){ servicos=[{nome:o.servico||'',valor:''}]; }

    const srvRows=servicos.map((s,i)=>`
      <div class="edit-srv-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
        <input class="edit-srv-nome" list="os-servicos-datalist" placeholder="Descrição do serviço" value="${(s.nome||s.descricao||'').replace(/"/g,'&quot;')}" style="flex:1;padding:8px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
        <input class="edit-srv-val" placeholder="R$" value="${s.valor||''}" style="width:90px;padding:8px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
        <button onclick="this.closest('.edit-srv-row').remove();window._garcia._calcEditTotal()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:14px;flex-shrink:0;">×</button>
      </div>`).join('');

    let pecasExist=[];
    try{ const pp=JSON.parse(o.pecas||'[]'); pecasExist=Array.isArray(pp)?pp:[]; }catch(e){ pecasExist=[]; }
    const pecaRows=pecasExist.map((p,i)=>`
      <div class="edit-peca-row" style="display:flex;gap:8px;margin-bottom:8px;align-items:center;">
        <input class="peca-nome" placeholder="Peça" value="${(p.nome||'').replace(/"/g,'&quot;')}" style="flex:2;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;">
        <input class="peca-loja" placeholder="Loja fornecedora" value="${(p.loja||'').replace(/"/g,'&quot;')}" style="flex:1.5;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;">
        <input class="peca-val" type="number" placeholder="R$" value="${p.valor||''}" style="width:80px;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;">
        <button onclick="this.closest('.edit-peca-row').remove()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:8px 10px;cursor:pointer;font-size:13px;flex-shrink:0;">✕</button>
      </div>`).join('');

    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='580px';box.style.maxHeight='90vh';box.style.overflowY='auto';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">✏️ Editar OS #${o.id}</div>
          <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">Edite os dados e salve as alterações</div>
        </div>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Cliente</div>
          <input id="edit-os-cli" value="${(o.clientes?.nome||'').replace(/"/g,'&quot;')}" placeholder="Nome do cliente" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Veículo</div>
          <input id="edit-os-vei" value="${(o.veiculo||'').replace(/"/g,'&quot;')}" placeholder="Ex: Honda Civic 2020" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Placa</div>
          <input id="edit-os-placa" value="${(o.placa||'').replace(/"/g,'&quot;')}" placeholder="Ex: ABC1D23" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;text-transform:uppercase;">
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Status</div>
          <select id="edit-os-status" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
            ${['Aguardando','Em Andamento','Aguardando Peça','Aguardando Pagamento','Concluída'].map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Mecânico</div>
          <select id="edit-os-mec" onchange="window._garcia._onMecSelEdit(this.value)" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
            <option value="">Selecione...</option>
            ${mecOpts}
          </select>
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Comissão do Mecânico (%)</div>
          <input id="edit-os-com" type="number" min="0" max="100" value="${this._parseComPct(o.servico)??(this._mecDaOS(o)?this._getCom(this._mecDaOS(o)):15)}" style="width:100%;padding:9px 12px;border:2px solid #FCD34D;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;background:#FFFBEB;">
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Data</div>
          <input id="edit-os-data" type="date" value="${o.data||''}" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
        </div>
        <div>
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Observações</div>
          <input id="edit-os-obs" value="${(o.observacoes||'').replace(/"/g,'&quot;')}" placeholder="Observações gerais" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">🔧 Serviços</div>
          <button onclick="window._garcia._addEditSrvRow()" style="background:#FFC107;border:none;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;color:#000;cursor:pointer;">+ Serviço</button>
        </div>
        <div id="edit-srv-list">${srvRows}</div>
        <datalist id="os-servicos-datalist">${(this.state.servicos||[]).map(s=>`<option value="${(s.nome||'').replace(/"/g,'&quot;')}">`).join('')}</datalist>
      </div>

      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">🛒 Peças Compradas</div>
          <button onclick="window._garcia._addEditPecaRow()" style="background:#FFC107;border:none;border-radius:6px;padding:4px 12px;font-size:11px;font-weight:700;color:#000;cursor:pointer;">+ Peça</button>
        </div>
        <div id="edit-peca-list">${pecaRows}</div>
      </div>

      <div style="margin-bottom:16px;">
        <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">📎 Nota Fiscal da Peça</div>
        ${o.nota_fiscal?`<div style="font-size:11px;color:#10B981;margin-bottom:6px;display:flex;align-items:center;gap:8px;">✓ Nota fiscal anexada — <button onclick="window._garcia._verNotaFiscalOS(${id})" style="background:none;border:none;color:#065F46;text-decoration:underline;cursor:pointer;font-size:11px;padding:0;">visualizar</button><button onclick="window._garcia._excluirNotaFiscalOS(${id})" style="background:none;border:none;color:#DC2626;text-decoration:underline;cursor:pointer;font-size:11px;padding:0;">excluir</button></div>`:''}
        <input id="edit-nf-peca" type="file" accept="image/*,.pdf" style="width:100%;padding:8px;border:2px dashed #E5E7EB;border-radius:8px;font-size:12px;background:#FAFAFA;">
        <div id="edit-nf-preview" style="font-size:11px;color:#10B981;margin-top:4px;"></div>
      </div>

      <div style="background:#F9FAFB;border-radius:10px;padding:12px 14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:12px;font-weight:600;color:#374151;">Total da OS</span>
        <span id="edit-os-total" style="font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;color:#111;">${this._fmt(o.valor)}</span>
      </div>

      <button onclick="window._garcia._salvarEdicaoOS(${id})" style="width:100%;padding:13px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:15px;font-weight:700;color:#000;cursor:pointer;letter-spacing:1px;">💾 SALVAR ALTERAÇÕES</button>
    `);
    if(box){box.style.maxWidth='580px';box.style.maxHeight='90vh';box.style.overflowY='auto';}
    this._nfDataUrl=null;
    document.getElementById('edit-nf-peca').addEventListener('change',(e)=>this._handleNFUpload(e,'edit-nf-preview'));
    // Calc total on input
    setTimeout(()=>{
      document.querySelectorAll('.edit-srv-val').forEach(i=>i.addEventListener('input',()=>window._garcia._calcEditTotal()));
    },100);
  }

  _addEditPecaRow(){
    const c=document.getElementById('edit-peca-list');if(!c)return;
    const id='ep'+Date.now()+Math.round(Math.random()*9999);
    const d=document.createElement('div');
    d.id=id;d.className='edit-peca-row';d.style.cssText='display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px;align-items:center;';
    d.innerHTML=`<input placeholder="Peça" class="peca-nome" style="flex:2 1 120px;min-width:0;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><input placeholder="Loja fornecedora" class="peca-loja" style="flex:1.5 1 100px;min-width:0;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><input placeholder="R$" type="number" class="peca-val" style="width:70px;min-width:0;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;"><button onclick="document.getElementById('${id}').remove()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:8px 10px;cursor:pointer;font-size:13px;flex-shrink:0;">✕</button>`;
    c.appendChild(d);
  }

  _onMecSelEdit(mecId){
    const inp=document.getElementById('edit-os-com');
    const f=this.state.funcionarios.find(x=>x.id==mecId);
    if(inp&&f&&f.cargo==='mecanico')inp.value=this._getCom(f);
  }

  _addEditSrvRow(){
    const list=document.getElementById('edit-srv-list');
    if(!list)return;
    const row=document.createElement('div');
    row.className='edit-srv-row';
    row.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:center;';
    row.innerHTML=`
      <input class="edit-srv-nome" list="os-servicos-datalist" placeholder="Descrição do serviço" style="flex:1;padding:8px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
      <input class="edit-srv-val" placeholder="R$" style="width:90px;padding:8px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;">
      <button onclick="this.closest('.edit-srv-row').remove();window._garcia._calcEditTotal()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:14px;flex-shrink:0;">×</button>
    `;
    list.appendChild(row);
    row.querySelector('.edit-srv-val').addEventListener('input',()=>this._calcEditTotal());
  }

  _calcEditTotal(){
    const vals=[...document.querySelectorAll('.edit-srv-val')].map(i=>parseFloat(i.value)||0);
    const total=vals.reduce((s,v)=>s+v,0);
    const el=document.getElementById('edit-os-total');
    if(el)el.textContent=this._fmt(total);
  }

  async _salvarEdicaoOS(id){
    const nomes=[...document.querySelectorAll('.edit-srv-nome')].map(i=>i.value.trim());
    const vals=[...document.querySelectorAll('.edit-srv-val')].map(i=>parseFloat(i.value)||0);
    const servicos=nomes.map((n,i)=>({nome:n,valor:vals[i]})).filter(s=>s.nome);
    const total=vals.reduce((s,v)=>s+v,0);
    const status=document.getElementById('edit-os-status')?.value||'Aguardando';
    const veiculo=document.getElementById('edit-os-vei')?.value||'';
    const placa=document.getElementById('edit-os-placa')?.value?.trim().toUpperCase()||'';
    const data=document.getElementById('edit-os-data')?.value||'';
    const obs=document.getElementById('edit-os-obs')?.value||'';
    const mecId=document.getElementById('edit-os-mec')?.value||null;
    const comPct=parseFloat(document.getElementById('edit-os-com')?.value||15);
    const mecF=mecId?this.state.funcionarios.find(x=>x.id==mecId):null;
    const servicoFull=[...servicos];
    if(mecF)servicoFull.push({mecanico:mecF.nome});
    servicoFull.push({comissao_pct:comPct});
    const pecas=this._getPecasList2();
    const updates={
      veiculo, placa, status, data,
      servico:JSON.stringify(servicoFull),
      valor:total,
      pecas:pecas.length?JSON.stringify(pecas):null,
    };
    const osAtual=this.state.ordens.find(x=>x.id===id);
    if(status==='Aguardando Pagamento'){ updates.valor_pago=0; updates.status_pagamento='Pendente'; }
    else if(osAtual && parseFloat(osAtual.valor_pago||0)>total){ updates.valor_pago=total; }
    if(this._nfDataUrl) updates.nota_fiscal=this._nfDataUrl;
    if(obs) updates.observacoes=obs;
    const {error}=await this._db.from('ordens').update(updates).eq('id',id);
    if(error){alert(this._msgErro(error));return;}
    document.getElementById('modal-bg').style.display='none';
    this._toast('OS #'+id+' atualizada com sucesso!');
    await this._load();
    const updated=this.state.ordens.find(x=>x.id===id);
    if(updated) this._modalChecklist(updated);
  }

  /* ═══════════════ PIX ═══════════════ */
  _crc16(str){
    let crc=0xFFFF;
    for(let i=0;i<str.length;i++){
      crc^=str.charCodeAt(i)<<8;
      for(let j=0;j<8;j++) crc=crc&0x8000?(crc<<1)^0x1021:crc<<1;
    }
    return((crc&0xFFFF).toString(16).toUpperCase()).padStart(4,'0');
  }

  _buildPixPayload(key,amount,name,city,txid='***'){
    const f=(id,v)=>`${id}${String(v.length).padStart(2,'0')}${v}`;
    const gui=f('00','BR.GOV.BCB.PIX')+f('01',key);
    const amt=parseFloat(amount).toFixed(2);
    const n=(name||'GARCIA MECANICA').substring(0,25).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const c=(city||'CAMPOS DOS GOYT').substring(0,15).toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const add=f('62',f('05',txid));
    const body=f('00','01')+f('26',gui)+f('52','0000')+f('53','986')+f('54',amt)+f('58','BR')+f('59',n)+f('60',c)+add+'6304';
    return body+this._crc16(body);
  }

  _modalPIX(osId){
    const o=this.state.ordens.find(x=>x.id===osId)||{};
    const pixKey=localStorage.getItem('garcia_pix_key')||'';
    const valor=Math.max(parseFloat(o.valor||0)-parseFloat(o.valor_pago||0),0);
    const clienteNome=o.clientes?.nome||'Cliente';
    const veiculo=o.veiculo||'';

    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='480px';box.style.maxHeight='90vh';box.style.overflowY='auto';}

    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div>
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">💚 Cobrar via PIX</div>
          <div style="font-size:10px;color:#9CA3AF;margin-top:2px;">OS #${o.id} · ${clienteNome} · ${veiculo}</div>
        </div>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
      </div>

      ${!pixKey?`
      <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:14px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;color:#C2410C;margin-bottom:8px;">⚠️ Chave PIX não configurada</div>
        <div style="font-size:11px;color:#374151;margin-bottom:10px;">Insira sua chave PIX para gerar cobranças:</div>
        <input id="pix-key-input" placeholder="CPF, CNPJ, telefone, email ou chave aleatória" style="width:100%;padding:9px 12px;border:2px solid #FED7AA;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;margin-bottom:8px;">
        <button onclick="window._garcia._salvarPixKey(${osId})" style="width:100%;padding:9px;background:#FFC107;border:none;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#000;cursor:pointer;">SALVAR E GERAR QR CODE</button>
      </div>
      `:`
      <div style="text-align:center;margin-bottom:16px;">
        <div style="background:#F0FDF4;border-radius:12px;padding:16px;display:inline-block;margin-bottom:12px;">
          <div id="pix-qr" style="display:inline-block;"></div>
        </div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:700;color:#059669;margin-bottom:4px;">R$ ${valor.toFixed(2).replace('.',',')}</div>
        <div style="font-size:11px;color:#9CA3AF;">Escaneie o QR Code ou copie o código</div>
      </div>

      <div style="background:#F9FAFB;border-radius:10px;padding:12px;margin-bottom:14px;position:relative;">
        <div style="font-size:9px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Código PIX (Copia e Cola)</div>
        <div id="pix-code-txt" style="font-size:10px;color:#374151;word-break:break-all;line-height:1.6;max-height:60px;overflow:hidden;"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <button onclick="window._garcia._copiarPIX()" style="padding:12px;background:#1A1A1A;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#FFC107;cursor:pointer;letter-spacing:.5px;">📋 COPIAR CÓDIGO</button>
        <button onclick="window._garcia._whatsappPIX(${osId})" style="padding:12px;background:#25D366;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;color:#fff;cursor:pointer;letter-spacing:.5px;">📱 WHATSAPP</button>
      </div>
      <button onclick="window._garcia._modalPagamento(${osId},true)" style="width:100%;padding:10px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:8px;font-size:11px;font-weight:700;color:#047857;cursor:pointer;margin-bottom:10px;">✓ Recebi o pagamento — registrar como pago</button>
      <button onclick="window._garcia._configurarChavePIX()" style="width:100%;padding:8px;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;font-size:10px;font-weight:600;color:#9CA3AF;cursor:pointer;">⚙️ Alterar chave PIX configurada</button>
      `}
    `);

    if(pixKey && valor>0){
      if(box){box.style.maxWidth='480px';}
      setTimeout(()=>{
        const payload=this._buildPixPayload(pixKey,valor,'GARCIA MECANICA','CAMPOS DOS GOYT','OS'+osId);
        const qrEl=document.getElementById('pix-qr');
        const codeEl=document.getElementById('pix-code-txt');
        if(qrEl && typeof QRCode!=='undefined'){
          try{ new QRCode(qrEl,{text:payload,width:180,height:180,colorDark:'#000',colorLight:'#F0FDF4'}); }
          catch(e){ qrEl.innerHTML='<div style="font-size:11px;color:#DC2626;">Erro ao gerar QR Code</div>'; }
        }
        if(codeEl) codeEl.textContent=payload;
        window._pixPayload=payload;
        window._pixOsId=osId;
        window._pixValor=valor;
        window._pixCliente=clienteNome;
        window._pixTel=o.clientes?.telefone||'';
      },150);
    }
  }

  _salvarPixKey(osId){
    const inp=document.getElementById('pix-key-input');
    if(!inp||!inp.value.trim()){alert('Digite a chave PIX!');return;}
    localStorage.setItem('garcia_pix_key',inp.value.trim());
    this._toast('Chave PIX salva!');
    document.getElementById('modal-bg').style.display='none';
    setTimeout(()=>this._modalPIX(osId),200);
  }

  _configurarChavePIX(){
    document.getElementById('modal-bg').style.display='none';
    setTimeout(()=>{
      const box=document.getElementById('modal-box');
      if(box){box.style.maxWidth='420px';}
      const atual=localStorage.getItem('garcia_pix_key')||'';
      this._openModal(`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">⚙️ Configurar Chave PIX</div>
          <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;">×</button>
        </div>
        <div style="font-size:11px;color:#6B7280;margin-bottom:14px;">Esta chave será usada em todas as cobranças PIX geradas pela plataforma.</div>
        <div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Chave PIX atual</div>
        <input id="pix-key-cfg" value="${atual}" placeholder="CPF, CNPJ, telefone, email ou chave aleatória" style="width:100%;padding:10px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;font-family:'Montserrat',sans-serif;margin-bottom:16px;">
        <button onclick="localStorage.setItem('garcia_pix_key',document.getElementById('pix-key-cfg').value.trim());window._garcia._toast('Chave PIX atualizada!');document.getElementById('modal-bg').style.display='none';" style="width:100%;padding:12px;background:#FFC107;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#000;cursor:pointer;">SALVAR</button>
      `);
    },150);
  }

  _copiarPIX(){
    const p=window._pixPayload||'';
    if(!p)return;
    navigator.clipboard.writeText(p).then(()=>this._toast('Código PIX copiado!')).catch(()=>{
      const ta=document.createElement('textarea');
      ta.value=p; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      this._toast('Código PIX copiado!');
    });
  }

  _whatsappPIX(osId){
    const o=this.state.ordens.find(x=>x.id===osId)||{};
    const tel=(o.clientes?.telefone||'').replace(/\D/g,'');
    const valor=Math.max(parseFloat(o.valor||0)-parseFloat(o.valor_pago||0),0).toFixed(2).replace('.',',');
    const payload=window._pixPayload||'';
    const srvs=this._parseSrv(o.servico||'');
    const msg=`Olá ${o.clientes?.nome||''}! 👋\n\nSeu veículo *${o.veiculo||''}* está pronto! ✅\n\n*Valor total: R$ ${valor}*\n\nPague via PIX (Copia e Cola):\n\`${payload}\`\n\nGarcia Auto Mecânica 🔧\nCampos dos Goytacazes - RJ`;
    const url=tel?`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url,'_blank');
  }

  _modalOrcamento(id){
    const o=this.state.ordens.find(x=>x.id===id)||{};
    const box=document.getElementById('modal-box');
    if(box){box.style.maxWidth='620px';box.style.maxHeight='90vh';box.style.overflowY='auto';}
    this._openModal(`
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
        <div><div style="font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#111;">📄 Gerar Orçamento</div><div style="font-size:10px;color:#9CA3AF;margin-top:2px;">Preencha, gere o PDF e envie pelo WhatsApp</div></div>
        <button onclick="document.getElementById('modal-bg').style.display='none'" style="background:#F3F4F6;border:none;border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:18px;color:#6B7280;flex-shrink:0;">×</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;">
        <div><div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Cliente</div><input id="orc-cli" value="${(o.clientes?.nome||'').replace(/"/g,'&quot;')}" placeholder="Nome do cliente" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;"></div>
        <div><div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Telefone</div><input id="orc-tel" placeholder="(22) 99999-9999" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;"></div>
        <div><div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Veículo</div><input id="orc-vei" value="${(o.veiculo||'').replace(/"/g,'&quot;')}" placeholder="Ex: Peugeot 208" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;"></div>
        <div><div style="font-size:9px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px;">Placa</div><input id="orc-placa" placeholder="LQO9D82" style="width:100%;padding:9px 12px;border:2px solid #E5E7EB;border-radius:8px;font-size:12px;"></div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">🔧 Mão de Obra</div>
          <button onclick="window._garcia._addOrcRow('srv')" style="background:#FFC107;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:700;color:#000;cursor:pointer;">+ Item</button>
        </div>
        <div id="srv-rows"></div>
      </div>
      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;">⚙️ Peças</div>
          <button onclick="window._garcia._addOrcRow('pec')" style="background:#E5E7EB;border:none;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#374151;cursor:pointer;">+ Item</button>
        </div>
        <div id="pec-rows"></div>
      </div>
      <div id="orc-totais" style="background:#F9FAFB;border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #F0F0F0;"></div>
      <div style="margin-bottom:18px;">
        <div style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Formas de Pagamento</div>
        <div style="display:flex;gap:20px;">
          <label style="display:flex;align-items:center;gap:7px;font-size:13px;color:#374151;cursor:pointer;"><input type="checkbox" id="pg-din" style="width:15px;height:15px;accent-color:#FFC107;"> Dinheiro</label>
          <label style="display:flex;align-items:center;gap:7px;font-size:13px;color:#374151;cursor:pointer;"><input type="checkbox" id="pg-pix" style="width:15px;height:15px;accent-color:#FFC107;"> PIX</label>
          <label style="display:flex;align-items:center;gap:7px;font-size:13px;color:#374151;cursor:pointer;"><input type="checkbox" id="pg-car" style="width:15px;height:15px;accent-color:#FFC107;"> Cartão</label>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <button onclick="window._garcia._printOrcamento()" style="padding:12px;background:#1A1A1A;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#FFC107;cursor:pointer;letter-spacing:.5px;">🖨️ GERAR PDF</button>
        <button onclick="window._garcia._compartilharOrcamentoPDF()" style="padding:12px;background:#25D366;border:none;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#fff;cursor:pointer;letter-spacing:.5px;">📱 ENVIAR PDF WHATSAPP</button>
      </div>`);
    if(box){box.style.maxWidth='620px';box.style.maxHeight='90vh';box.style.overflowY='auto';}
    this._addOrcRow('srv',o.servico||'');
    this._addOrcRow('pec');
    this._updTotais();
  }

  _addOrcRow(type,desc=''){
    const c=document.getElementById(type+'-rows');if(!c)return;
    const id='r'+Date.now()+Math.round(Math.random()*9999);
    const d=document.createElement('div');
    d.id=id;d.style.cssText='display:flex;gap:8px;margin-bottom:8px;align-items:center;';
    d.innerHTML=`<input value="${desc.replace(/"/g,'&quot;')}" placeholder="${type==='srv'?'Descrição do serviço':'Nome da peça'}" style="flex:1;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;" oninput="window._garcia._updTotais()"><input type="number" placeholder="0,00" style="width:100px;padding:8px 10px;border:1.5px solid #E5E7EB;border-radius:7px;font-size:12px;text-align:right;" oninput="window._garcia._updTotais()"><button onclick="document.getElementById('${id}').remove();window._garcia._updTotais()" style="background:#FEF2F2;color:#DC2626;border:none;border-radius:6px;padding:6px 8px;cursor:pointer;font-size:13px;">✕</button>`;
    c.appendChild(d);
  }

  _getRows(cid){
    const c=document.getElementById(cid);if(!c)return{items:[],total:0};
    const items=[];let total=0;
    c.querySelectorAll('div[id^="r"]').forEach(row=>{
      const inp=row.querySelectorAll('input');
      const desc=(inp[0]?.value||'').trim();const val=parseFloat(inp[1]?.value||0);
      if(desc){items.push({desc,val});total+=val;}
    });
    return{items,total};
  }

  _updTotais(){
    const el=document.getElementById('orc-totais');if(!el)return;
    const s=this._getRows('srv-rows');const p=this._getRows('pec-rows');const g=s.total+p.total;
    el.innerHTML=`<div style="display:flex;flex-direction:column;gap:7px;">
      <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:#6B7280;">Total Mão de Obra:</span><span style="font-weight:700;color:#111;">${this._fmt(s.total)}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;"><span style="color:#6B7280;">Total Peças:</span><span style="font-weight:700;color:#111;">${this._fmt(p.total)}</span></div>
      <div style="border-top:2px solid #E5E7EB;padding-top:8px;display:flex;justify-content:space-between;align-items:center;"><span style="font-size:13px;font-weight:700;color:#111;">TOTAL GERAL:</span><span style="font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#FFC107;">${this._fmt(g)}</span></div>
    </div>`;
  }

  _getOrcData(){
    const cli=document.getElementById('orc-cli')?.value||'';
    const tel=document.getElementById('orc-tel')?.value||'';
    const vei=document.getElementById('orc-vei')?.value||'';
    const placa=document.getElementById('orc-placa')?.value||'';
    const s=this._getRows('srv-rows');const p=this._getRows('pec-rows');
    const pgs=[];
    if(document.getElementById('pg-din')?.checked)pgs.push('Dinheiro');
    if(document.getElementById('pg-pix')?.checked)pgs.push('PIX');
    if(document.getElementById('pg-car')?.checked)pgs.push('Cartão');
    return{cli,tel,vei,placa,srv:s,pec:p,pgs,grand:s.total+p.total,data:new Date().toLocaleDateString('pt-BR')};
  }

  _nextOrcNum(){
    const numKey='g_orc_num';
    const num=parseInt(localStorage.getItem(numKey)||'0')+1;
    localStorage.setItem(numKey,String(num));
    return String(num).padStart(4,'0');
  }
  _orcamentoHTML(d,numFmt){
    const r2=(v)=>'R$ '+v.toFixed(2).replace('.',',');
    const logoSrc=document.querySelector('img[alt="Garcia Logo"]')?.src||'uploads/logo.png';
    const itemRows=(items,empty)=>items.length?items.map(i=>`<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;">${i.desc}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;font-weight:600;">${r2(i.val)}</td></tr>`).join(''):`<tr><td colspan="2" style="padding:10px 12px;color:#999;font-style:italic;">${empty}</td></tr>`;
    const pgBox=(label,active)=>`<div style="display:flex;align-items:center;gap:6px;"><span style="width:15px;height:15px;border:1.5px solid #1E3A5F;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#1E3A5F;">${active?'X':''}</span><span style="font-size:12px;">${label}</span></div>`;
    const html=`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Orçamento #${numFmt} - Garcia Auto Mecânica</title><style>
      *{box-sizing:border-box}body{font-family:'Georgia',serif;font-size:13px;color:#1a1a1a;margin:0;padding:36px 48px;line-height:1.5}
      table{width:100%;border-collapse:collapse;}
      .section-label{font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1E3A5F;border-bottom:2px solid #1E3A5F;padding-bottom:4px;margin:22px 0 8px;}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;font-family:Arial,sans-serif;font-size:12.5px;}
      .info-grid b{color:#1E3A5F;}
      @media print{body{padding:20px 34px}}
    </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1E3A5F;padding-bottom:16px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:14px;">
          <img src="${logoSrc}" style="height:56px;object-fit:contain;">
          <div>
            <div style="font-family:Arial,sans-serif;font-size:19px;font-weight:700;color:#1E3A5F;letter-spacing:.5px;">GARCIA AUTO MECÂNICA</div>
            <div style="font-family:Arial,sans-serif;font-size:11px;color:#666;margin-top:2px;">Rio das Ostras — RJ · douglasgarcia.automecanica@gmail.com</div>
          </div>
        </div>
        <div style="text-align:right;font-family:Arial,sans-serif;">
          <div style="background:#1E3A5F;color:#fff;padding:7px 16px;font-weight:700;font-size:13px;letter-spacing:1px;border-radius:3px;">ORÇAMENTO</div>
          <div style="margin-top:6px;font-size:11px;color:#666;">Data: ${d.data}</div>
        </div>
      </div>

      <div class="section-label">Dados do Cliente e Veículo</div>
      <div class="info-grid">
        <div><b>Cliente:</b> ${d.cli.toUpperCase()||'—'}</div>
        <div><b>Telefone:</b> ${d.tel||'—'}</div>
        <div><b>Veículo:</b> ${d.vei.toUpperCase()||'—'}</div>
        <div><b>Placa:</b> ${d.placa.toUpperCase()||'—'}</div>
      </div>

      <div class="section-label">Mão de Obra</div>
      <table><thead><tr><th style="font-family:Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#666;text-align:left;padding:0 12px 6px;">Descrição</th><th style="font-family:Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#666;text-align:right;padding:0 12px 6px;">Valor</th></tr></thead>
      <tbody>${itemRows(d.srv.items,'Nenhum serviço informado')}</tbody></table>
      <div style="text-align:right;font-family:Arial,sans-serif;font-size:12px;font-weight:700;padding:8px 12px;">Total Mão de Obra: ${r2(d.srv.total)}</div>

      <div class="section-label">Peças</div>
      <table><thead><tr><th style="font-family:Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#666;text-align:left;padding:0 12px 6px;">Descrição</th><th style="font-family:Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#666;text-align:right;padding:0 12px 6px;">Valor</th></tr></thead>
      <tbody>${itemRows(d.pec.items,'Nenhuma peça informada')}</tbody></table>
      <div style="text-align:right;font-family:Arial,sans-serif;font-size:12px;font-weight:700;padding:8px 12px;">Total Peças: ${r2(d.pec.total)}</div>

      <div style="display:flex;justify-content:flex-end;margin-top:10px;">
        <div style="background:#F7F3E8;border:1.5px solid #1E3A5F;border-radius:4px;padding:12px 26px;text-align:right;">
          <div style="font-family:Arial,sans-serif;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;">Total Geral</div>
          <div style="font-family:Arial,sans-serif;font-size:24px;font-weight:700;color:#1E3A5F;">${r2(d.grand)}</div>
        </div>
      </div>

      <div class="section-label">Forma de Pagamento</div>
      <div style="display:flex;gap:28px;padding:4px 12px;">
        ${pgBox('Dinheiro',d.pgs.includes('Dinheiro'))}
        ${pgBox('PIX',d.pgs.includes('PIX'))}
        ${pgBox('Cartão',d.pgs.includes('Cartão'))}
      </div>

      <div style="margin-top:60px;display:flex;justify-content:center;">
        <div style="text-align:center;width:60%;">
          <div style="border-top:1px solid #333;padding-top:6px;font-family:Arial,sans-serif;font-size:11px;">Responsável Técnico (Mecânico)</div>
          <div style="font-family:Arial,sans-serif;font-size:12px;font-weight:700;margin-top:2px;">DOUGLAS GARCIA FERREIRA</div>
        </div>
      </div>

      <div style="margin-top:34px;border-top:1px solid #ddd;padding-top:12px;text-align:center;font-family:Arial,sans-serif;font-size:10px;color:#888;">
        <div style="font-weight:700;color:#1E3A5F;">Garantia de 3 (três) meses sobre os serviços prestados</div>
        <div style="margin-top:2px;">Válido somente com a apresentação desta nota</div>
      </div>
    </body></html>`;
    return html;
  }
  _printOrcamento(){
    const d=this._getOrcData();
    const html=this._orcamentoHTML(d,this._nextOrcNum());
    this._printViaIframe(html);
  }
  async _compartilharOrcamentoPDF(){
    if(typeof html2canvas==='undefined'||typeof window.jspdf==='undefined'){this._toast('Bibliotecas de PDF ainda carregando, tente novamente em instantes',false);return;}
    const d=this._getOrcData();
    const html=this._orcamentoHTML(d,this._nextOrcNum());
    this._toast('Gerando PDF...');
    let ifr=document.getElementById('__pdf-render-iframe');
    if(!ifr){ ifr=document.createElement('iframe'); ifr.id='__pdf-render-iframe'; ifr.style.cssText='position:fixed;left:-9999px;top:0;width:820px;height:1400px;border:0;'; document.body.appendChild(ifr); }
    await new Promise(res=>{ ifr.onload=res; ifr.srcdoc=html; });
    await new Promise(res=>setTimeout(res,200));
    try{
      const canvas=await html2canvas(ifr.contentDocument.body,{scale:2,useCORS:true});
      const {jsPDF}=window.jspdf;
      const pageW=595.28;
      const imgW=pageW;
      const imgH=canvas.height*imgW/canvas.width;
      const pdf=new jsPDF('p','pt',[pageW,imgH]);
      const imgData=canvas.toDataURL('image/png');
      pdf.addImage(imgData,'PNG',0,0,imgW,imgH);
      const fileName=`Orcamento-${d.cli.replace(/\s+/g,'_')||'Garcia'}.pdf`;
      const blob=pdf.output('blob');
      const file=new File([blob],fileName,{type:'application/pdf'});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:'Orçamento Garcia Auto Mecânica',text:`Orçamento para ${d.cli||'cliente'} — ${d.vei||''}`});
        this._toast('PDF compartilhado!');
      } else {
        pdf.save(fileName);
        this._toast('PDF baixado! Anexe o arquivo na conversa do WhatsApp.');
        const tel=(d.tel||'').replace(/\D/g,'');
        const url=tel?`https://wa.me/55${tel}`:`https://wa.me/`;
        window.open(url,'_blank');
      }
    }catch(e){ this._toast('Erro ao gerar PDF: '+(e.message||e),false); }
  }

  _whatsappOrcamento(){
    const d=this._getOrcData();
    const r2=(v)=>'R$ '+v.toFixed(2).replace('.',',');
    const srvTxt=d.srv.items.map(i=>`  • ${i.desc}: ${r2(i.val)}`).join('\n')||'  —';
    const pecTxt=d.pec.items.map(i=>`  • ${i.desc}: ${r2(i.val)}`).join('\n')||'  —';
    const pgTxt=d.pgs.join(' / ')||'A definir';
    const msg=`🔧 *GARCIA AUTOMECÂNICA*
━━━━━━━━━━━━━━━━━━━━
📋 *ORÇAMENTO — ${d.data}*

👤 *Cliente:* ${d.cli}
🚗 *Veículo:* ${d.vei}${d.placa?' | Placa: '+d.placa:''}

🔩 *MÃO DE OBRA*
${srvTxt}
*Subtotal MO: ${r2(d.srv.total)}*

⚙️ *PEÇAS*
${pecTxt}
*Subtotal Peças: ${r2(d.pec.total)}*

━━━━━━━━━━━━━━━━━━━━
💰 *TOTAL GERAL: ${r2(d.grand)}*

💳 *Formas de pagamento:* ${pgTxt}

✅ *Garantia:* 3 meses
📞 *Contato:* (22) 97400-7557

_Garcia Auto Mecânica — Campos dos Goytacazes RJ_`;
    const phone=d.tel.replace(/\D/g,'');
    window.open('https://wa.me/'+(phone?'55'+phone:'')+'?text='+encodeURIComponent(msg),'_blank');
  }

