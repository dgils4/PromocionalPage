const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const state={page:"dashboard",profile:null,empresaId:null,cache:{},editing:null};
const meta={
 clientes:{title:"Clientes",table:"clientes",singular:"cliente",fields:[
  ["nome","Nome completo","text",1],["tipo","Tipo","select",0,["pf","Pessoa Física","pj","Pessoa Jurídica"]],
  ["cpf_cnpj","CPF/CNPJ","text"],["data_nascimento","Data de nascimento","date"],["telefone","Telefone","tel"],["whatsapp","WhatsApp","tel"],
  ["email","E-mail","email"],["endereco","Endereço","text",1],["cidade","Cidade","text"],["estado","Estado","text"],
  ["profissao","Profissão","text"],["observacoes","Observações","textarea",1]]},
 processos:{title:"Processos",table:"processos",singular:"processo",fields:[
  ["numero","Número do processo","text",1],["cliente","Cliente","relation","clientes","nome"],["advogado","Advogado responsável","relation","usuarios","nome"],
  ["tribunal","Tribunal","text"],["vara","Vara","text"],["comarca","Comarca","text"],["area","Área do direito","text"],["tipo_acao","Tipo de ação","text"],
  ["polo_ativo","Polo ativo","text",1],["polo_passivo","Polo passivo","text",1],["data_distribuicao","Data de distribuição","date"],
  ["status","Status","select",0,["novo","Novo","em_andamento","Em andamento","aguardando","Aguardando","audiencia","Audiência","sentenca","Sentença","recurso","Recurso","encerrado","Encerrado","arquivado","Arquivado"]],
  ["valor_causa","Valor da causa","number"],["observacoes","Observações","textarea",1]]},
 prazos:{title:"Prazos",table:"prazos",singular:"prazo",fields:[
  ["descricao","Descrição do prazo","text",1],["processo","Processo","relation","processos","numero"],["data_inicial","Data inicial","date"],["data_final","Data final","date",1],
  ["responsavel","Responsável","relation","usuarios","nome"],["prioridade","Prioridade","select",0,["baixa","Baixa","media","Média","alta","Alta","urgente","Urgente"]],
  ["status","Status","select",0,["pendente","Pendente","concluido","Concluído","vencido","Vencido"]],["observacao","Observação","textarea",1]]},
 audiencias:{title:"Audiências",table:"audiencias",singular:"audiência",fields:[
  ["tipo","Tipo de audiência","text",1],["processo","Processo","relation","processos","numero"],["cliente","Cliente","relation","clientes","nome"],["data","Data","date",1],
  ["horario","Horário","text"],["local","Local","text",1],["link_online","Link online","url",1],["advogado","Advogado responsável","relation","usuarios","nome"],["observacoes","Observações","textarea",1]]},
 eventos:{title:"Agenda",table:"eventos",singular:"evento",fields:[
  ["titulo","Título","text",1],["tipo","Tipo","select",0,["reuniao","Reunião","compromisso","Compromisso","outro","Outro"]],["data","Data","date",1],["horario","Horário","text"],
  ["descricao","Descrição","textarea",1],["responsavel","Responsável","relation","usuarios","nome"]]},
 tarefas:{title:"Tarefas",table:"tarefas",singular:"tarefa",fields:[
  ["titulo","Título","text",1],["descricao","Descrição","textarea",1],["responsavel","Responsável","relation","usuarios","nome"],["cliente","Cliente","relation","clientes","nome"],
  ["processo","Processo","relation","processos","numero"],["data_vencimento","Data de vencimento","date"],["prioridade","Prioridade","select",0,["baixa","Baixa","media","Média","alta","Alta","urgente","Urgente"]],
  ["status","Status","select",0,["pendente","Pendente","em_andamento","Em andamento","concluida","Concluída","cancelada","Cancelada"]]]},
 receitas:{title:"Receitas",table:"receitas",singular:"receita",fields:[
  ["cliente","Cliente","relation","clientes","nome"],["processo","Processo","relation","processos","numero"],["descricao","Descrição","text",1],["valor","Valor","number",1],["data","Data","date",1],
  ["forma_pagamento","Forma de pagamento","select",0,["pix","Pix","boleto","Boleto","cartao","Cartão","dinheiro","Dinheiro","transferencia","Transferência"]],
  ["status","Status","select",0,["pendente","Pendente","recebido","Recebido","cancelado","Cancelado"]]]},
 despesas:{title:"Despesas",table:"despesas",singular:"despesa",fields:[
  ["descricao","Descrição","text",1],["categoria","Categoria","text"],["valor","Valor","number",1],["data","Data","date",1],
  ["forma_pagamento","Forma de pagamento","select",0,["pix","Pix","boleto","Boleto","cartao","Cartão","dinheiro","Dinheiro","transferencia","Transferência"]]]},
 contratos:{title:"Contratos",table:"contratos",singular:"contrato",fields:[
  ["cliente","Cliente","relation","clientes","nome"],["processo","Processo","relation","processos","numero"],["tipo","Tipo de contrato","text"],["valor","Valor","number"],
  ["forma_pagamento","Forma de pagamento","select",0,["pix","Pix","boleto","Boleto","cartao","Cartão","dinheiro","Dinheiro","transferencia","Transferência"]],
  ["num_parcelas","Número de parcelas","number"],["data_inicio","Data de início","date"],["data_vencimento","Data de vencimento","date"],
  ["status","Status","select",0,["ativo","Ativo","concluido","Concluído","cancelado","Cancelado"]],["observacoes","Observações","textarea",1]]},
 atendimentos:{title:"Atendimentos",table:"atendimentos",singular:"atendimento",fields:[
  ["cliente","Cliente","relation","clientes","nome",1],["data","Data","date",1],["usuario","Usuário responsável","relation","usuarios","nome"],["assunto","Assunto","text",1],
  ["descricao","Descrição","textarea",1],["observacoes","Observações","textarea",1],["proxima_acao","Próxima ação","text",1]]},
 documentos:{title:"Documentos",table:"documentos",singular:"documento",fields:[
  ["nome","Nome do documento","text",1],["categoria","Categoria","select",0,["pessoais","Documentos pessoais","procuracao","Procuração","contrato","Contrato","peticao","Petição","comprovantes","Comprovantes","decisoes","Decisões","sentencas","Sentenças","outros","Outros"]],
  ["cliente","Cliente","relation","clientes","nome"],["processo","Processo","relation","processos","numero"],["arquivo","Arquivo","file",1],["observacoes","Observações","textarea",1]]}
};

const pageNames={dashboard:"Dashboard",clientes:"Clientes",processos:"Processos",agenda:"Agenda",prazos:"Prazos",tarefas:"Tarefas",audiencias:"Audiências",documentos:"Documentos",financeiro:"Financeiro",contratos:"Contratos",atendimentos:"Atendimentos",relatorios:"Relatórios",configuracoes:"Configurações"};

function toast(msg,ok=true){const e=document.getElementById("toast");e.textContent=msg;e.className=ok?"show success":"show danger";setTimeout(()=>e.className="",3000)}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function brl(v){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(v||0))}
function dateBR(v){if(!v)return "—";return new Date(v+"T00:00:00").toLocaleDateString("pt-BR")}
function monthStart(){const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10)}
function monthEnd(){const d=new Date();return new Date(d.getFullYear(),d.getMonth()+1,0).toISOString().slice(0,10)}
function valLabel(options,v){if(!options)return v??"—";for(let i=0;i<options.length;i+=2)if(options[i]===v)return options[i+1];return v??"—"}

async function loadProfile(){
 const {data:{user}}=await db.auth.getUser(); if(!user)return null;
 const {data,error}=await db.from("usuarios").select("*,empresas(*)").eq("auth_user_id",user.id).maybeSingle();
 if(error) throw error; state.profile=data; state.empresaId=data?.empresa_id; return data;
}
async function query(table, extra={}){let q=db.from(table).select("*"); if(state.empresaId)q=q.eq("empresa_id",state.empresaId); if(extra.order)q=q.order(extra.order,{ascending:false}); if(extra.limit)q=q.limit(extra.limit); const r=await q; if(r.error)throw r.error; return r.data||[]}
async function relationData(collection){if(state.cache[collection])return state.cache[collection];const d=await db.from(collection).select("id,nome").eq("empresa_id",state.empresaId).order("nome");if(d.error)throw d.error;state.cache[collection]=d.data||[];return state.cache[collection]}
async function insert(table,payload){payload.empresa_id=state.empresaId;const r=await db.from(table).insert(payload).select().single();if(r.error)throw r.error;state.cache={};return r.data}
async function update(table,id,payload){delete payload.empresa_id;const r=await db.from(table).update(payload).eq("id",id).eq("empresa_id",state.empresaId).select().single();if(r.error)throw r.error;state.cache={};return r.data}
async function remove(table,id){const r=await db.from(table).delete().eq("id",id).eq("empresa_id",state.empresaId);if(r.error)throw r.error;state.cache={}}

async function openModal(type,record=null){
 const m=meta[type];state.editing=record;document.getElementById("modalTitle").textContent=(record?"Editar ":"Novo ")+m.singular;
 const form=document.getElementById("modalForm");form.innerHTML='<div class="form-grid"></div><div class="form-actions"><button type="button" class="secondary" id="cancelModal">Cancelar</button><button class="primary">Salvar</button></div>';
 const grid=form.querySelector(".form-grid");
 for(const f of m.fields){
   const [name,label,t,full,opts,required]=f;const wrap=document.createElement("div");if(full)wrap.className="full-field";
   let html=`<label>${label}${required||f[3]===1?" *":""}`;
   const val=record?.[name]??"";
   if(t==="select"){html+=`<select name="${name}"><option value="">Selecione</option>`;for(let i=0;i<opts.length;i+=2)html+=`<option value="${opts[i]}" ${val===opts[i]?"selected":""}>${opts[i+1]}</option>`;html+="</select>"}
   else if(t==="relation"){const data=await relationData(f[3]);html+=`<select name="${name}"><option value="">Selecione</option>${data.map(x=>`<option value="${x.id}" ${val===x.id?"selected":""}>${esc(x[f[4]]||x.nome)}</option>`).join("")}</select>`}
   else if(t==="textarea")html+=`<textarea name="${name}">${esc(val)}</textarea>`;
   else if(t==="file")html+=`<input name="${name}" type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png">`;
   else html+=`<input name="${name}" type="${t}" value="${esc(val)}">`;
   html+="</label>";wrap.innerHTML=html;grid.appendChild(wrap);
 }
 form.onsubmit=async e=>{e.preventDefault();try{const fd=new FormData(form),payload={};for(const f of m.fields){const name=f[0],t=f[2];if(t==="file"){const file=fd.get(name);if(file?.name)payload._file=file}else{const x=fd.get(name);payload[name]=x===""?null:(t==="number"?Number(x):x)}}if(payload._file){const file=payload._file;delete payload._file;const path=`${state.empresaId}/${crypto.randomUUID()}-${file.name}`;const up=await db.storage.from("documentos").upload(path,file);if(up.error)throw up.error;payload.arquivo=path}if(record)await update(m.table,record.id,payload);else await insert(m.table,payload);closeModal();toast("Salvo com sucesso");render();}catch(err){toast(err.message||"Erro ao salvar",false)}};
 document.getElementById("cancelModal").onclick=closeModal;document.getElementById("modal").classList.remove("hidden")
}
function closeModal(){document.getElementById("modal").classList.add("hidden");state.editing=null}

async function crudPage(type){
 const m=meta[type];const rows=await query(m.table,{order:"criado_em"});let search="";
 document.getElementById("page").innerHTML=`<div class="page-head"><div><h2>${m.title}</h2><p class="muted">Cadastre, consulte e organize ${m.title.toLowerCase()}.</p></div><div class="actions"><button class="primary" id="addBtn">+ Novo</button></div></div><div class="toolbar"><input id="filter" placeholder="Pesquisar..."></div><div id="tableBox" class="table-wrap"></div>`;
 document.getElementById("addBtn").onclick=()=>openModal(type);
 const draw=()=>{const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));const cols=m.fields.filter(f=>f[0]!=="observacoes"&&f[2]!=="file").slice(0,5);document.getElementById("tableBox").innerHTML=filtered.length?`<table class="table"><thead><tr>${cols.map(f=>`<th>${f[1]}</th>`).join("")}<th>Ações</th></tr></thead><tbody>${filtered.map(r=>`<tr>${cols.map(f=>{let v=r[f[0]];if(f[2]==="select")v=valLabel(f[4],v);if(f[2]==="date")v=dateBR(v);if(f[2]==="number"&&f[0].includes("valor"))v=brl(v);return `<td>${esc(v||"—")}</td>`}).join("")}<td><button class="secondary edit" data-id="${r.id}">Editar</button> <button class="secondary del" data-id="${r.id}">Excluir</button></td></tr>`).join("")}</tbody></table>`:`<div class="empty">Nenhum registro encontrado.</div>`;
 document.querySelectorAll(".edit").forEach(b=>b.onclick=()=>openModal(type,rows.find(x=>x.id===b.dataset.id)));
 document.querySelectorAll(".del").forEach(b=>b.onclick=async()=>{if(confirm("Excluir este registro?"))try{await remove(m.table,b.dataset.id);toast("Excluído");render()}catch(e){toast(e.message,false)}})};
 document.getElementById("filter").oninput=e=>{search=e.target.value;draw()};draw()
}

async function dashboard(){
 const [c,p,pr,t,a,rec,des]=await Promise.all([query("clientes"),query("processos"),query("prazos"),query("tarefas"),query("audiencias"),query("receitas"),query("despesas")]);
 const today=new Date().toISOString().slice(0,10);const next=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
 const ativos=p.filter(x=>!["encerrado","arquivado"].includes(x.status)).length;
 const prazos=pr.filter(x=>x.data_final>=today&&x.data_final<=next&&x.status==="pendente");
 const aud=a.filter(x=>x.data===today);
 const receitas=rec.filter(x=>x.data>=monthStart()&&x.data<=monthEnd()&&x.status==="recebido").reduce((s,x)=>s+Number(x.valor||0),0);
 const despesas=des.filter(x=>x.data>=monthStart()&&x.data<=monthEnd()).reduce((s,x)=>s+Number(x.valor||0),0);
 document.getElementById("page").innerHTML=`<div class="page-head"><div><h2>Olá, ${esc(state.profile?.nome||"")}</h2><p class="muted">${esc(state.profile?.empresas?.nome||"Seu escritório")}</p></div></div>
 <div class="cards">
 <div class="card"><small>Clientes</small><div class="metric">${c.length}</div></div>
 <div class="card"><small>Processos ativos</small><div class="metric">${ativos}</div></div>
 <div class="card"><small>Prazos próximos</small><div class="metric">${prazos.length}</div></div>
 <div class="card"><small>Recebido no mês</small><div class="metric">${brl(receitas)}</div></div>
 </div>
 <div class="grid2"><div class="card"><h3>Alertas</h3><div class="list">
 <div class="list-item">⏰ <b>${prazos.length}</b> prazo(s) nos próximos 7 dias</div>
 <div class="list-item">📅 <b>${aud.length}</b> audiência(s) hoje</div>
 <div class="list-item">📋 <b>${t.filter(x=>x.status==="pendente").length}</b> tarefa(s) pendente(s)</div></div></div>
 <div class="card"><h3>Financeiro do mês</h3><p>Receitas recebidas <b>${brl(receitas)}</b></p><div class="chartbar"><i style="width:${Math.min(100,receitas?Math.max(5,(receitas/(receitas+despesas))*100):0)}%"></i></div><p>Despesas <b>${brl(despesas)}</b></p><p class="${receitas-despesas>=0?"success":"danger"}">Saldo: <b>${brl(receitas-despesas)}</b></p></div></div>`
}

async function financeiro(){
 const [r,d]=await Promise.all([query("receitas",{order:"data"}),query("despesas",{order:"data"})]);
 const rm=r.filter(x=>x.data>=monthStart()&&x.data<=monthEnd()),dm=d.filter(x=>x.data>=monthStart()&&x.data<=monthEnd());
 document.getElementById("page").innerHTML=`<div class="page-head"><div><h2>Financeiro</h2><p class="muted">Controle de receitas e despesas.</p></div></div>
 <div class="cards"><div class="card"><small>Recebido</small><div class="metric">${brl(rm.filter(x=>x.status==="recebido").reduce((s,x)=>s+Number(x.valor),0))}</div></div><div class="card"><small>A receber</small><div class="metric">${brl(rm.filter(x=>x.status==="pendente").reduce((s,x)=>s+Number(x.valor),0))}</div></div><div class="card"><small>Despesas</small><div class="metric">${brl(dm.reduce((s,x)=>s+Number(x.valor),0))}</div></div><div class="card"><small>Saldo</small><div class="metric">${brl(rm.filter(x=>x.status==="recebido").reduce((s,x)=>s+Number(x.valor),0)-dm.reduce((s,x)=>s+Number(x.valor),0))}</div></div></div>
 <div class="grid2"><div><div class="page-head"><h3>Receitas</h3><button class="primary" id="addRec">+ Receita</button></div><div id="recBox" class="table-wrap"></div></div><div><div class="page-head"><h3>Despesas</h3><button class="primary" id="addDes">+ Despesa</button></div><div id="desBox" class="table-wrap"></div></div></div>`;
 document.getElementById("addRec").onclick=()=>openModal("receitas");document.getElementById("addDes").onclick=()=>openModal("despesas");
 document.getElementById("recBox").innerHTML=`<table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Data</th><th>Status</th></tr></thead><tbody>${rm.map(x=>`<tr><td>${esc(x.descricao)}</td><td>${brl(x.valor)}</td><td>${dateBR(x.data)}</td><td>${esc(valLabel(meta.receitas.fields.find(f=>f[0]==="status")[4],x.status))}</td></tr>`).join("")}</tbody></table>`;
 document.getElementById("desBox").innerHTML=`<table class="table"><thead><tr><th>Descrição</th><th>Valor</th><th>Data</th></tr></thead><tbody>${dm.map(x=>`<tr><td>${esc(x.descricao)}</td><td>${brl(x.valor)}</td><td>${dateBR(x.data)}</td></tr>`).join("")}</tbody></table>`;
}

async function relatorios(){
 const [c,p,r,d]=await Promise.all([query("clientes"),query("processos"),query("receitas"),query("despesas")]);
 const status={};p.forEach(x=>status[x.status]=(status[x.status]||0)+1);
 document.getElementById("page").innerHTML=`<div class="page-head"><div><h2>Relatórios</h2><p class="muted">Visão resumida dos dados do escritório.</p></div></div><div class="cards"><div class="card"><small>Total de clientes</small><div class="metric">${c.length}</div></div><div class="card"><small>Total de processos</small><div class="metric">${p.length}</div></div><div class="card"><small>Receitas cadastradas</small><div class="metric">${brl(r.reduce((s,x)=>s+Number(x.valor||0),0))}</div></div><div class="card"><small>Despesas cadastradas</small><div class="metric">${brl(d.reduce((s,x)=>s+Number(x.valor||0),0))}</div></div></div><div class="card" style="margin-top:14px"><h3>Processos por status</h3>${Object.entries(status).map(([k,v])=>`<p>${esc(valLabel(meta.processos.fields.find(f=>f[0]==="status")[4],k))}: <b>${v}</b></p>`).join("")||"<p class='muted'>Nenhum processo.</p>"}</div>`
}

async function configuracoes(){
 const e=state.profile?.empresas||{};document.getElementById("page").innerHTML=`<div class="page-head"><div><h2>Configurações</h2><p class="muted">Dados do escritório e da conta.</p></div></div><div class="card"><form id="configForm" class="form-grid"><label class="full-field">Nome do escritório<input name="nome" value="${esc(e.nome)}"></label><label>CNPJ<input name="cnpj" value="${esc(e.cnpj)}"></label><label>Telefone<input name="telefone" value="${esc(e.telefone)}"></label><label>WhatsApp<input name="whatsapp" value="${esc(e.whatsapp)}"></label><label>E-mail<input name="email" value="${esc(e.email)}"></label><label class="full-field">Endereço<input name="endereco" value="${esc(e.endereco)}"></label><label>Cidade<input name="cidade" value="${esc(e.cidade)}"></label><label>Estado<input name="estado" maxlength="2" value="${esc(e.estado)}"></label><div class="full-field form-actions"><button class="primary">Salvar</button></div></form></div>`;
 document.getElementById("configForm").onsubmit=async ev=>{ev.preventDefault();const fd=new FormData(ev.target),o=Object.fromEntries(fd);const r=await db.from("empresas").update(o).eq("id",state.empresaId);if(r.error)toast(r.error.message,false);else{state.profile.empresas={...state.profile.empresas,...o};toast("Configurações salvas")}}
}

async function render(){
 document.getElementById("pageTitle").textContent=pageNames[state.page]||"Dashboard";document.getElementById("pageSubtitle").textContent=state.state==="dashboard"?"Visão geral do escritório":"Gestão do escritório";
 document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===state.page));
 try{
  if(state.page==="dashboard")await dashboard();
  else if(state.page==="financeiro")await financeiro();
  else if(state.page==="relatorios")await relatorios();
  else if(state.page==="configuracoes")await configuracoes();
  else if(state.page==="agenda")await crudPage("eventos");
  else await crudPage(state.page);
 }catch(e){console.error(e);document.getElementById("page").innerHTML=`<div class="card"><h3>Não foi possível carregar</h3><p>${esc(e.message)}</p><p class="muted">Verifique o SQL/RLS e se a anon key do Supabase foi configurada no app.js.</p></div>`}
}

async function boot(){
 document.getElementById("showSignup").onclick=()=>{loginBox.classList.add("hidden");signupBox.classList.remove("hidden")};
 document.getElementById("showLogin").onclick=()=>{signupBox.classList.add("hidden");loginBox.classList.remove("hidden")};
 document.getElementById("modalClose").onclick=closeModal;
 document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
 document.getElementById("logoutBtn").onclick=()=>db.auth.signOut();
 document.querySelectorAll("#nav button").forEach(b=>b.onclick=()=>{state.page=b.dataset.page;document.getElementById("sidebar").classList.remove("open");render()});
 document.getElementById("loginBtn").onclick=async()=>{try{const e=loginEmail.value,p=loginPassword.value;if(!e||!p)throw Error("Informe e-mail e senha.");const r=await db.auth.signInWithPassword({email:e,password:p});if(r.error)throw r.error}catch(e){toast(e.message,false)}};
 document.getElementById("signupBtn").onclick=async()=>{try{const nome=signupName.value,escritorio=signupOffice.value,email=signupEmail.value,password=signupPassword.value;if(!nome||!escritorio||!email||!password)throw Error("Preencha todos os campos.");const r=await db.auth.signUp({email,password,options:{data:{nome,escritorio}}});if(r.error)throw r.error;toast("Conta criada. Confirme o e-mail se o projeto exigir.")}catch(e){toast(e.message,false)}};
 document.getElementById("forgotBtn").onclick=async()=>{try{const e=loginEmail.value;if(!e)throw Error("Informe seu e-mail.");const r=await db.auth.resetPasswordForEmail(e,{redirectTo:location.origin+location.pathname});if(r.error)throw r.error;toast("Link de recuperação enviado.")}catch(e){toast(e.message,false)}};
 db.auth.onAuthStateChange(async(_event,session)=>{if(session){try{await loadProfile();if(!state.profile)throw Error("Usuário sem perfil/empresa.");document.getElementById("authView").classList.add("hidden");document.getElementById("appView").classList.remove("hidden");document.getElementById("userMini").textContent=`${state.profile.nome} · ${state.profile.cargo}`;render()}catch(e){toast(e.message,false)}}else{document.getElementById("authView").classList.remove("hidden");document.getElementById("appView").classList.add("hidden")}});
 const s=await db.auth.getSession();if(s.data.session){await loadProfile();if(state.profile){document.getElementById("authView").classList.add("hidden");document.getElementById("appView").classList.remove("hidden");document.getElementById("userMini").textContent=`${state.profile.nome} · ${state.profile.cargo}`;render()}}
}
boot();
