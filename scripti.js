





window.addEventListener("load", ()=>{

  if(typeof supabase === "undefined"){

    mostrarToast("Supabase não carregou");

  }else{

    mostrarToast("Servidor OK");

  }

});

let editandoId = null;


async function protegerPagina(){

  const { data } = await db.auth.getSession();

  if(!data.session){
    location.href = "login.html";
    return;
  }

  const user = data.session.user;

  const { data: usuario, error } = await db
    .from("usuarios")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("auth_user_id", user.id)
    .single();

  if(error){
    alert("Usuário não encontrado.");
    await db.auth.signOut();
    location.href = "login.html";
    return;
  }

  localStorage.setItem("empresa_id", usuario.empresa_id);
  localStorage.setItem("usuario_id", usuario.id);
  localStorage.setItem("nome_usuario", usuario.nome);
  localStorage.setItem("cargo", usuario.cargo);

}

protegerPagina();

db.auth.onAuthStateChange((event, session) => {

 if(!session){
   location.href = "login.html";
 }

});







let tocandoAnuncio = false;
let contadorMusicas = 0;
let reproduzindoTemporario = false;
let indiceAnterior = 0;
let modoAleatorio = false
let listaAtual = null;
let listaConfigAtual = null;
let diaSelecionado = 0;
let listasDoDia = [];
let planoEditando = null;
let indiceListaAtual = 0;
let listaExcluirId = null; 
let tempoExcluirPlano;
let servicosSelecionados = [];
  
  const somSucesso = new Audio("https://cdechrtprerblmhllqav.supabase.co/storage/v1/object/public/audios/concluido.mp3");
     somSucesso.preload = "auto";
   const exCluir = new Audio("https://cdechrtprerblmhllqav.supabase.co/storage/v1/object/public/audios/excluir.mp3");
     exCluir.preload = "auto";  
     
     document.addEventListener("click", liberarAudio, {
  once:true
 
});

function liberarAudio(){
  somSucesso.play()
  .then(()=>{
    somSucesso.pause();
    somSucesso.currentTime = 0;
  });

  exCluir.play()
  .then(()=>{
    exCluir.pause();
    exCluir.currentTime = 0;
  });

}
     
     
     
     
   
  function vibrar(ms=150){
  if(navigator.vibrate){
    navigator.vibrate(ms);
  }
}   
     
  
 function abrirLoading(texto = "Processando..."){

  document.getElementById("textoLoading").innerText = texto;

  document.getElementById("loading").style.display = "flex";
}

function fecharLoading(){
vibrar();
  document.getElementById("loading").style.display = "none";
}
 function gerarNomeKey(nome){
  return nome
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
} 
  
async function sair(){

  vibrar();

  abrirConfirmacao(
    "Deseja sair da conta?",
    async ()=>{
   if(navigator.vibrate){
     navigator.vibrate(150);
   }
      await db.auth.signOut();

      location.href = "login.html";

    },
    "🚪 Sair"
  );

}

  
const modil = document.getElementById("modalervicos");
const lista = document.getElementById("listaServicos");
const inputValor = document.getElementById("valor");
const inputValorr = document.getElementById("valorr");
const textoResumo =
document.getElementById("textoResumo");

// abrir modal ao clicar no input
inputValor.addEventListener("click", () => {
  modil.style.display = "block";
  carregarervicos();
});

// fechar modal
function fecharModil() {
  modil.style.display = "none";
  sugestoes.innerHTML = "";
}

// buscar serviços no Supabase


async function carregarervicos() {

  lista.innerHTML = "Carregando...";

  const { data, error } = await db
    .from("servicos")
    .select("nome, preco")
    .eq("empresa_id", empresaId)
    .order("nome");

  if (error) {
    lista.innerHTML = "Erro ao carregar";
    return;
  }

  // Recupera os serviços já escritos no input
  const selecionados = inputValor.value
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);

  servicosSelecionados = [];

  lista.innerHTML = "";

  data.forEach(item => {

    const marcado =
      selecionados.includes(item.nome);

    if(marcado){
      servicosSelecionados.push({
        nome: item.nome,
        preco: Number(item.preco)
      });
    }

    const div = document.createElement("div");
    div.className = "item";

div.innerHTML = `
<label class="item-servico">

  <input type="checkbox"
    ${marcado ? "checked" : ""}>

  <span class="nome">${item.nome}</span>

  <span class="preco">
    R$ ${Number(item.preco).toFixed(2).replace(".", ",")}
  </span>

</label>
`;

    const check = div.querySelector("input");

    check.onchange = () => {

      if(check.checked){

        servicosSelecionados.push({
          nome:item.nome,
          preco:Number(item.preco)
        });

      }else{

        servicosSelecionados =
        servicosSelecionados.filter(
          s => s.nome !== item.nome
        );

      }

      atualizarResumoServicos();

    };

    lista.appendChild(div);

  });

  lista.insertAdjacentHTML("beforeend",`

 ">


      

    

    </div>

  `);

  atualizarResumoServicos();

}

function atualizarResumoServicos(){

  const nomes =
  servicosSelecionados.map(x=>x.nome);

  const total =
  servicosSelecionados.reduce(
    (s,x)=>s+x.preco,0
  );

  textoResumo.innerHTML = `
    <strong>${nomes.length} serviço(s)</strong><br>
    ${nomes.join(", ") || "Nenhum"}<br><br>

    <strong>Total:
    R$ ${total.toFixed(2)}</strong>
  `;

}

function confirmarServicos(){

  inputValor.value =
  servicosSelecionados
  .map(x=>x.nome)
  .join(", ");

  inputValorr.value =
  servicosSelecionados
  .reduce((s,x)=>s+x.preco,0)
  .toFixed(2);

  fecharModil();

}


  const statusPlano = document.getElementById("statusPlano");
const adesaoPlano = document.getElementById("adesaoPlano");  
  
const dataInput = document.getElementById('data');
const agenda = document.getElementById('agenda');
const modal = document.getElementById('modal');

const hora = document.getElementById('hora');
const nome = document.getElementById('nome');
const fone = document.getElementById('fone');
const barbeiro = document.getElementById('barbeiro');
const barbeiroSalvo =
localStorage.getItem(
  "barbeiroPadrao"
);

if(barbeiroSalvo){
  barbeiro.value =
  barbeiroSalvo;
}

barbeiro.addEventListener(
  "change",
  ()=>{

    localStorage.setItem(
      "barbeiroPadrao",
      barbeiro.value
    );

  }
);
const tipo = document.getElementById('tipo');
const corte = document.getElementById('corte');
const pag = document.getElementById('pag');
const valor = document.getElementById('valor');
const valorr = document.getElementById('valorr');
const obs = document.getElementById('obs');

const agora = new Date();

const hoje =
agora.getFullYear() + '-' +
String(agora.getMonth()+1).padStart(2,'0') + '-' +
String(agora.getDate()).padStart(2,'0');

dataInput.value = hoje;
dataInput.onchange = carregarHoje;

const horarios = [];

for(let h=8; h<=20; h++){
 ['00','30'].forEach(m=>{
   horarios.push(String(h).padStart(2,'0') + ':' + m);
 });
}

function abrir(h='') {

  modal.style.display = 'flex';
 if(!h){

  const agora = new Date();

  h =
    String(agora.getHours()).padStart(2,"0") +
    ":" +
    String(agora.getMinutes()).padStart(2,"0");

}

hora.value = h;
inputNome.dataset.id = "";
  document.getElementById("boxPlanoAdmin").style.display = "none";

  const adesao = document.getElementById("adesaoPlano");
  const status = document.getElementById("statusPlano");

  if (adesao) adesao.value = "";
  if (status) status.value = "ativo";

  editandoId = null;
  
    
  nome.value = "";
  fone.value = "";
  valor.value = "";
  valorr.value = "";
  obs.value = "";
  corte.value = "";
  pag.value = "Pix";
}

function fechar(){
  modal.style.display = "none";
  editandoId = null;

  hora.value = "";
  nome.value = "";
  fone.value = "";
  valor.value = "";
  valorr.value = "";
  obs.value = "";
  corte.value = "";
  pag.value = "Pix";
  

  document.getElementById("boxPlanoAdmin").style.display = "none";

  const adesao = document.getElementById("adesaoPlano");
  const status = document.getElementById("statusPlano");

  if (adesao) adesao.value = "";
  if (status) status.value = "ativo";

}

function renderSkeleton(){

  agenda.innerHTML = "";

  for(let i=0; i<8; i++){

    agenda.innerHTML += `

    <div class="slot">

      <div class="time skeleton"></div>

      <div class="cell skeleton-card"></div>

    </div>

    `;

  }

}


async function carregarHoje(){

  
abrirLoading();
  renderSkeleton();

  vibrar();

 agenda.innerHTML = '';

 const hoje = dataInput.value;
 const prof = filtro.value;

 let query = db
  .from('atendimentos')
  .select('*')
  .eq("empresa_id", empresaId)
  .eq('data', hoje);

 if(prof !== "Todos"){
   query = query.eq('barbeiro', prof);
 }

 const { data, error } = await query.order('hora');

 if(error){
   mostrarToast(error.message);
    fecharLoading();
   return;
  
   
 }


  const clienteIds = [
  ...new Set(
    data
      .filter(item => item.cliente_id)
      .map(item => item.cliente_id)
  )
];

let clientesPlanos = {};

if(clienteIds.length > 0){

  const { data: clientes } = await db
    .from("clientes")
    .select("id,data_adesao_plano,tipo_plano")
    .eq("empresa_id", empresaId)
    .in("id", clienteIds);

  if(clientes){

    clientes.forEach(cliente => {

clientesPlanos[cliente.id] = {
  data: cliente.data_adesao_plano,
  plano: cliente.tipo_plano
};
    });

  }

}

 // ==========================
// 💰 FATURAMENTO AVULSO DO DIA
// ==========================

let soma = 0;

data.forEach(item => {

  if(item.tipo_cliente !== "plano"){

    soma += Number(item.valor || 0);

  }

});

document.getElementById('totalDia').textContent =
  'R$' + soma.toFixed(2).replace('.', ',');


  
 qtd.textContent = data.length;

 planos.textContent =
 data.filter(x => x.tipo_cliente === 'plano').length;


const horariosAgenda = [...horarios];

data.forEach(item => {

  const h = item.hora.slice(0,5);

  if(!horariosAgenda.includes(h)){
    horariosAgenda.push(h);
  }

});

horariosAgenda.sort((a,b)=>{

  const [ha,ma] = a.split(":").map(Number);
  const [hb,mb] = b.split(":").map(Number);

  return (ha * 60 + ma) - (hb * 60 + mb);

});


const mapa = {};
data.forEach(i => {
 mapa[i.hora.slice(0,5)] = i;
});



 horariosAgenda.forEach(h => {

  

const item = mapa[h];


   let formaPagamentoAbrev = item?.forma_pagamento || "";

if(formaPagamentoAbrev === "Crédito"){
  formaPagamentoAbrev = "CT";
}
else if(formaPagamentoAbrev === "Débito"){
  formaPagamentoAbrev = "DB";
}
else if(formaPagamentoAbrev === "Pix"){
  formaPagamentoAbrev = "PIX";
}
else if(formaPagamentoAbrev === "Dinheiro"){
  formaPagamentoAbrev = "DN";
}


   

const d = document.createElement('div');

let dataAdesao = "";

if(
  item &&
  item.tipo_cliente === "plano" &&
  item.cliente_id
){

const dataPlano =
  clientesPlanos[item.cliente_id]?.data;

if(dataPlano){

  const partes =
    dataPlano.split("-");

  dataAdesao =
    `${partes[2]}/${partes[1]}`;

}

}


   let planoAbrev = "";

const nomePlano =
  item && item.cliente_id
    ? clientesPlanos[item.cliente_id]?.plano || ""
    : "";

if(nomePlano.includes("Básico")){
  planoAbrev = "PB";
}
else if(nomePlano.includes("Intermediário")){
  planoAbrev = "PI";
}
else if(nomePlano.includes("Premium")){
  planoAbrev = "PP";
}
else if(nomePlano.includes("Fléxivel")){
  planoAbrev = "PF";
}




   

d.className = 'slot';

   

   if(item){

     let cor = '#166534';
     let txt = '#fff';

     if(item.tipo_cliente === 'plano'){
       cor = '#eab308';
       txt = '#111';
     }
     else if(Number(item.valor) <= 0){
       cor = '#991b1b';
     }

     d.innerHTML = `
     <div class="time">${h}</div>
   <div
 data-id="${item.id}"
 style="
  background:${cor};
  color:${txt};
  user-select:none;
  -webkit-user-select:none;
  -webkit-touch-callout:none;
"
 class="cell"
 ontouchstart="segurarExcluir(event,'${item.id}')"
 ontouchmove="moverDedo(event)"
 ontouchend="cancelarSegurar()"
 onclick="cliqueCard('${item.id}')">
       ${item.nome_cliente || 'desconhecido'}
${item.tipo_cliente === 'plano' && dataAdesao
  ? ` • ${dataAdesao}`
  : ''
}
<br>

<small style="font-size:11px">
       ${item.tipo_cliente === 'plano'
         ? 'Corte ' + item.numero_corte + '/4 • '
         : ''
       }

    ${item.servico} •
${item.tipo_cliente === 'plano' && planoAbrev
  ? planoAbrev + ' • '
  : ''
}
${formaPagamentoAbrev} •
R$${item.valor}
       </small>
     </div>
     `;
   } else {
     d.innerHTML = `
     <div class="time">${h}</div>
     <div class="cell free" onclick="abrir('${h}')"><span style="margin-right:8px" class="material-symbols-rounded">
calendar_month
</span>Livre
     </div>
     `;
   }

   agenda.appendChild(d);
   aplicarOcultacao();
 });
 
if(window.ultimoAtendimentoId){

  setTimeout(()=>{

    const card =
    document.querySelector(
      `[data-id="${window.ultimoAtendimentoId}"]`
    );

    if(card){

      card.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      card.style.outline =
      "3px solid #22c55e";

      setTimeout(()=>{
        card.style.outline = "";
      },3000);

    }

    window.ultimoAtendimentoId = null;

  },300);

}

fecharLoading();
}


let tempoPlayer;

function pausarPlayer(){

  clearTimeout(tempoPlayer);

  // Verifica se existe player
  if(!player) return;

  // Verifica se existe vídeo carregado
  const videoId =
    player.getVideoData()?.video_id;

  if(!videoId) return;

  // Verifica se estava realmente tocando
  const estavaTocando =
    player.getPlayerState() === YT.PlayerState.PLAYING;

  // Se não estava tocando, não faz nada
  if(!estavaTocando) return;

  // Pausa
  player.pauseVideo();

  tempoPlayer = setTimeout(() => {

    player.playVideo();

  }, 2000);

}




async function salvarAtendimento(){
 
  
  abrirLoading("Processando...")
  
  
let tipoCliente = "avulso";
let planoDetectado = null;
let atendimentoDoPlano = false;
  let renovacaoConfirmadaGratis = false;
  
if(valorr.value.trim() === ""){
  valorr.value = 0;
}  
  
  
let telefoneLimpo = fone.value.replace(/\D/g,'');

if(
  telefoneLimpo !== "" &&
  telefoneLimpo.length !== 11
){
   mostrarToast(
     "Telefone deve ter 11 dígitos."
   );

   fone.focus();
   fecharLoading();
   return;
}

// só depois da validação
if(telefoneLimpo === ""){
   telefoneLimpo = null;
}

 // ==========================
 // 🔥 CLIENTE (CORRIGIDO)
 // ==========================
 let clienteId = inputNome.dataset.id || null;

 let nomeFinal = nome.value.trim() === ""
   ? "desconhecido"
   : nome.value.trim();
console.log(clienteId);
console.log(nomeFinal);
 // cria cliente se não veio do autocomplete
 if(!clienteId && nomeFinal !== "desconhecido"){

   const { data: novoCliente, error } = await db
   .from("clientes")
   .insert([{
     empresa_id: empresaId,
     nome: nomeFinal,
    telefone: fone.value.trim() || null
   }])
   .select()
   .eq("empresa_id", empresaId)
   .single();

   if(error){
     firmacao("Erro ao criar cliente")
   fecharLoading();
     return;
   }

   clienteId = novoCliente.id;
 }

function abrirDecisaoVisual({
  titulo = "Escolha uma opção",
  mensagem = "",
  opcoes = [],
  permitirCancelar = true
}){

  return new Promise(resolve => {

    const modal =
      document.getElementById("modalDecisao");

    const tituloEl =
      document.getElementById("tituloDecisao");

    const mensagemEl =
      document.getElementById("mensagemDecisao");

    const opcoesEl =
      document.getElementById("opcoesDecisao");

    const cancelar =
      document.getElementById("cancelarDecisao");

    tituloEl.textContent = titulo;

    mensagemEl.innerHTML = mensagem;

    opcoesEl.innerHTML = "";

    modal.style.display = "flex";

    function finalizar(valor){

      modal.style.display = "none";

      opcoesEl.innerHTML = "";

      cancelar.onclick = null;

      resolve(valor);
    }

    opcoes.forEach(opcao => {

      const botao =
        document.createElement("button");

      botao.type = "button";

      botao.className =
        "opcaoDecisao";

      botao.innerHTML =
        opcao.texto;

      botao.onclick = () => {

        finalizar(opcao.valor);

      };

      opcoesEl.appendChild(botao);

    });

    if(permitirCancelar){

      cancelar.style.display = "block";

      cancelar.onclick = () => {

        finalizar(null);

      };

    }else{

      cancelar.style.display = "none";

    }

  });

}

modal.addEventListener("selectstart", function(e){
  e.preventDefault();
});





  

  // ==========================
// 🔥 IDENTIFICA PLANO PELO VALOR
// ==========================

const valorTexto =
  String(valorr.value || "0")
    .replace("R$", "")
    .trim();

const valorInformado =
  valorTexto.includes(",")
    ? Number(
        valorTexto
          .replace(/\./g, "")
          .replace(",", ".")
      )
    : Number(valorTexto);

if(valorInformado > 0){

  const { data: planos, error: erroPlanos } = await db
    .from("planos_site")
    .select("id,nome,preco,ativo,quantidade_cortes")
    .eq("empresa_id", empresaId)
    .eq("ativo", true);

  if(erroPlanos){
    console.log("Erro ao buscar planos:", erroPlanos);
  }

  if(planos){

  // Pega TODOS os planos que possuem o valor informado
  const planosCompativeis = planos.filter(plano => {

    const precoPlano =
      Number(
        String(plano.preco || "0")
          .replace("R$", "")
          .replace(/\./g, "")
          .replace(",", ".")
          .trim()
      );

    return precoPlano === valorInformado;

  });


  // Nenhum plano encontrado
  if(planosCompativeis.length === 0){

    console.log(
      "Nenhum plano encontrado para o valor:",
      valorInformado
    );

  }


  // Apenas um plano com esse valor
  else if(planosCompativeis.length === 1){

    planoDetectado =
      planosCompativeis[0];


    console.log(
  "PLANO DETECTADO:",
  planoDetectado
);

    tipoCliente = "plano";
    atendimentoDoPlano = true;

    console.log(
      "Plano identificado:",
      planoDetectado.nome
    );

  }


  // Existem vários planos com o mesmo valor
  else {

    // Busca o plano atual do cliente
    let planoAtual = null;

    if(clienteId){

      const { data: clienteAtual } = await db
        .from("clientes")
        .select("tipo_plano,status_plano")
        .eq("empresa_id", empresaId)
        .eq("id", clienteId)
        .single();

      planoAtual = clienteAtual;

    }


    // Verifica se o plano atual está entre os planos
    // que possuem o mesmo preço
    const planoAtualCompativel =
      planosCompativeis.find(plano =>
        planoAtual?.tipo_plano === plano.nome
      );


    // Se já possui um desses planos,
    // usamos automaticamente o plano atual
    if(planoAtualCompativel){

      planoDetectado =
        planoAtualCompativel;


      console.log(
  "PLANO ATUAL DETECTADO:",
  planoDetectado
);

      tipoCliente = "plano";
      atendimentoDoPlano = true;

  

      console.log(
        "Mantendo plano atual:",
        planoDetectado.nome
      );

      

    }

    else {

      // Mostra as opções para escolher o novo plano
      let opcoes = "";

      planosCompativeis.forEach((plano, index) => {

        opcoes +=
          `${index + 1} - ${plano.nome}\n`;

      });


      const opcoesVisuais =
  planosCompativeis.map((plano, index) => {

    return {
      valor: index,
      texto: `
        📋 ${plano.nome}
        <br>
        <small>${plano.preco}</small>
      `
    };

  });


const escolha =
  await abrirDecisaoVisual({

    titulo: "Escolha o plano",

    mensagem:
      "Existem vários planos com este valor.<br><br>" +
      "Selecione qual plano deve ser utilizado neste atendimento.",

    opcoes: opcoesVisuais,

    permitirCancelar: true

  });


if(escolha === null){

  fecharLoading();

  return;

}


planoDetectado =
  planosCompativeis[escolha];

tipoCliente = "plano";

atendimentoDoPlano = true;


console.log(
  "Novo plano selecionado:",
  planoDetectado.nome
);

      tipoCliente = "plano";
      atendimentoDoPlano = true;


      console.log(
        "Novo plano selecionado:",
        planoDetectado.nome
      );

    }

  }

}
}



  // ==========================
// 🔥 ATENDIMENTO COM R$ 0
// ==========================

if(
  valorInformado === 0 &&
  clienteId
){

  const { data: clientePlano, error: erroClientePlano } =
    await db
      .from("clientes")
      .select("tipo_plano,status_plano")
      .eq("empresa_id", empresaId)
      .eq("id", clienteId)
      .single();

  if(erroClientePlano){

    console.log(
      "Erro ao consultar plano do cliente:",
      erroClientePlano
    );

  }

  // ==========================================
  // CLIENTE TEM PLANO ATIVO E JÁ TEM O PLANO DEFINIDO
  // ==========================================

  if(
    clientePlano?.tipo_plano &&
    clientePlano?.status_plano === "ativo"
  ){

    const usarPlano =
      await abrirDecisaoVisual({

        titulo: "Atendimento do plano?",

        mensagem:
          `Cliente possui o plano <b>"${clientePlano.tipo_plano}"</b>.<br><br>` +
          `Este atendimento será descontado do plano?`,

        opcoes: [

          {
            valor: true,
            texto: "🟢 Sim, usar o plano"
          },

          {
            valor: false,
            texto: "🔵 Não, atendimento avulso"
          }

        ],

        permitirCancelar: true

      });


    if(usarPlano === null){

      fecharLoading();

      return;

    }


    if(usarPlano){

      const { data: planoCliente } =
        await db
          .from("planos_site")
          .select("nome,preco,quantidade_cortes")
          .eq("empresa_id", empresaId)
          .eq("nome", clientePlano.tipo_plano)
          .eq("ativo", true)
          .single();

      if(planoCliente){
  planoDetectado = planoCliente;
      }


      const limiteCortes =
        Number(planoCliente?.quantidade_cortes) === 0
          ? 0
          : Number(planoCliente?.quantidade_cortes) || 4;


      const { data: ultimoAtendimento } =
        await db
          .from("atendimentos")
          .select("numero_corte,data,hora,id")
          .eq("empresa_id", empresaId)
          .eq("cliente_id", clienteId)
          .eq("tipo_cliente", "plano")
          .order("data", { ascending:false })
          .order("hora", { ascending:false })
          .order("id", { ascending:false })
          .limit(1);


      const ultimoCorte =
        Number(
          ultimoAtendimento?.[0]?.numero_corte
        ) || 0;


      // 0 = ilimitado
      if(
        limiteCortes > 0 &&
        ultimoCorte >= limiteCortes
      ){

        const continuarMesmoAssim =
          await abrirDecisaoVisual({

            titulo: "⚠️ Plano consumido",

            mensagem:
              `<b>Cliente:</b> ${nomeFinal}<br>` +
              `<b>Plano:</b> ${clientePlano.tipo_plano}<br><br>` +

              `✂️ Cortes utilizados: ` +
              `<b>${ultimoCorte}/${limiteCortes}</b><br><br>` +

              `O próximo atendimento será o corte ` +
              `<b>1/${limiteCortes}</b>.<br><br>` +

              `💰 Valor para renovação: ` +
              `<b>${planoCliente?.preco || "valor não informado"}</b><br><br>` +

              `Deseja registrar a renovação GRATUITA?`,

            opcoes: [

              {
                valor: true,
                texto: "🟢 Renovar"
              }

            ],

            permitirCancelar: true

          });


        if(continuarMesmoAssim !== true){

  fecharLoading();
  return;

}

renovacaoConfirmadaGratis = true;
      }


      tipoCliente = "plano";

      atendimentoDoPlano = true;

    }

    else{

      tipoCliente = "avulso";

      atendimentoDoPlano = false;

    }

  }


  // ==========================================
  // CLIENTE ANTIGO:
  // PLANO ATIVO, MAS SEM TIPO DE PLANO
  // ==========================================

  else if(
    clientePlano?.status_plano === "ativo" &&
    !clientePlano?.tipo_plano
  ){

    const { data: planosAntigos, error: erroPlanosAntigos } =
      await db
        .from("planos_site")
        .select("id,nome,preco,quantidade_cortes")
        .eq("empresa_id", empresaId)
        .eq("ativo", true)
        .order("ordem", { ascending:true });


    if(
      erroPlanosAntigos ||
      !planosAntigos ||
      planosAntigos.length === 0
    ){

      mostrarToast(
        "⚠️ Cliente possui plano ativo, mas nenhum plano está cadastrado."
      );

      fecharLoading();

      return;

    }


    const opcoesPlanosAntigos =
      planosAntigos.map((plano, index) => {

        return {

          valor: index,

          texto:
            `📋 ${plano.nome}` +
            `<br>` +
            `<small>${plano.preco}</small>`

        };

      });


    const escolhaPlanoAntigo =
      await abrirDecisaoVisual({

        titulo: "📋 Definir plano do cliente",

        mensagem:
          `<b>${nomeFinal}</b> possui um plano ativo, ` +
          `mas o tipo de plano ainda não foi definido.<br><br>` +

          `Selecione qual plano o cliente possui:`,

        opcoes: opcoesPlanosAntigos,

        permitirCancelar: true

      });


    if(escolhaPlanoAntigo === null){

      fecharLoading();

      return;

    }


    const planoEscolhido =
      planosAntigos[escolhaPlanoAntigo];


    // Guarda o plano escolhido
    planoDetectado =
      planoEscolhido;


    tipoCliente = "plano";

    atendimentoDoPlano = true;


    // Salva o tipo de plano no cliente
    const { error: erroSalvarTipoPlano } =
      await db
        .from("clientes")
        .update({
          tipo_plano: planoEscolhido.nome
        })
        .eq("empresa_id", empresaId)
        .eq("id", clienteId);


    if(erroSalvarTipoPlano){

      console.log(
        "Erro ao salvar tipo do plano:",
        erroSalvarTipoPlano
      );

    }

  }

}



  // ==========================
// 🔥 RECOMENDAÇÃO AO RENOVAR
// ==========================

if(
  planoDetectado &&
  clienteId &&
  !editandoId
){

  const { data: ultimoAtendimento } = await db
    .from("atendimentos")
    .select("numero_corte")
    .eq("empresa_id", empresaId)
    .eq("cliente_id", clienteId)
    .eq("tipo_cliente", "plano")
    .order("data", { ascending:false })
    .order("hora", { ascending:false })
    .order("id", { ascending:false })
    .limit(1);

const { data: clientePlanoData } = await db
  .from("clientes")
  .select("data_adesao_plano,ultima_renovacao")
  .eq("empresa_id", empresaId)
  .eq("id", clienteId)
  .single();

const vencimentoPlano =
  clientePlanoData?.data_adesao_plano
    ? calcularVencimentoComRenovacao(
        clientePlanoData.data_adesao_plano,
        clientePlanoData.ultima_renovacao
      )
    : null;

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

const planoEstaVencido =
  vencimentoPlano
    ? hoje > new Date(
        vencimentoPlano.getFullYear(),
        vencimentoPlano.getMonth(),
        vencimentoPlano.getDate()
      )
    : false;

  const ultimoCorte =
    Number(
      ultimoAtendimento?.[0]?.numero_corte
    ) || 0;

  const limiteCortes =
    Number(planoDetectado.quantidade_cortes) === 0
      ? 0
      : Number(planoDetectado.quantidade_cortes) || 4;


  // ==========================
  // VERIFICA SE JÁ É O ÚLTIMO
  // ==========================

  const ultimoDoCiclo =
    limiteCortes > 0 &&
    ultimoCorte >= limiteCortes;


  // ==========================
  // MOSTRA RECOMENDAÇÃO
  // SOMENTE SE:
  // - já existe corte
  // - não é o corte 1
  // - não é o último corte
  // ==========================

  if(
  ultimoDoCiclo ||
  planoEstaVencido
){

    const textoCorte =
      limiteCortes === 0
        ? "1/0"
        : `1/${limiteCortes}`;


    const continuar =
      await abrirDecisaoVisual({

        titulo: "🔄 Renovação do plano",

        mensagem:
          `<b>Cliente:</b> ${nomeFinal}<br>` +
          `<b>Plano:</b> ${planoDetectado.nome}<br><br>` +

          `O último atendimento foi o corte ` +
          `<b>${ultimoCorte}/${limiteCortes}</b>.<br><br>` +

          `Ao renovar, é recomendado iniciar um novo ciclo pelo ` +
          `<b>corte ${textoCorte}</b>.<br><br>` +

          `Deseja alterar o corte para o início do novo ciclo?`,

        opcoes: [

          {
            valor: true,
            texto: `🔄 Alterar para ${textoCorte}`
          },

          {
            valor: false,
            texto: "➡️ Continuar sem alterar"
          }

        ],

        permitirCancelar: true

      });


    // Cancelou
    if(continuar === null){

      fecharLoading();
      return;

    }


    // Usuário aceitou iniciar novo ciclo
    if(continuar === true){

      corte.value = "1";

    }

  }

}


  
  

 // ==========================
 // 🔥 CORTE (PLANO)
 // ==========================
 let numeroCorteFinal = corte.value;
  
if(atendimentoDoPlano && clienteId){

   if(numeroCorteFinal === ""){

     const { data: historico } = await db
     .from("atendimentos")
     .select("numero_corte,data,hora,id")
     .eq("empresa_id", empresaId)
     .eq("cliente_id", clienteId)
     .eq("tipo_cliente", "plano")
     .order("data", { ascending:false })
     .order("hora", { ascending:false })
     .order("id", { ascending:false })
     .limit(1);


if(historico && historico.length > 0){

  let ultimo =
    parseInt(historico[0].numero_corte, 10) || 0;

  // Busca a quantidade de cortes do plano atual
  let limiteCortes = 4;

  let nomePlanoLimite = planoDetectado?.nome || null;

  // Se não veio planoDetectado, pega o plano atual do cliente
  if(!nomePlanoLimite){

    const { data: clientePlanoAtual } = await db
      .from("clientes")
      .select("tipo_plano")
      .eq("empresa_id", empresaId)
      .eq("id", clienteId)
      .single();

    nomePlanoLimite =
      clientePlanoAtual?.tipo_plano || null;
  }

  if(nomePlanoLimite){

    const { data: planoAtual } = await db
      .from("planos_site")
      .select("quantidade_cortes")
      .eq("empresa_id", empresaId)
      .eq("nome", nomePlanoLimite)
      .eq("ativo", true)
      .single();

    limiteCortes =
  Number(planoAtual?.quantidade_cortes) === 0
    ? 0
    : Number(planoAtual?.quantidade_cortes) || 4;
  }

  if(limiteCortes === 0){

  // 0 = ilimitado
  numeroCorteFinal = ultimo + 1;

}else{

  numeroCorteFinal =
    ultimo >= limiteCortes
      ? 1
      : ultimo + 1;

}

} else {

  numeroCorteFinal = 1;

}


     
   }

 } else {
   numeroCorteFinal = "";
 }
 


// ==========================
// 🔥 CONFIRMA TROCA DE PLANO
// ==========================

if(
  planoDetectado &&
  clienteId
){

  const { data: clienteAtual } = await db
    .from("clientes")
    .select("tipo_plano")
    .eq("empresa_id", empresaId)
    .eq("id", clienteId)
    .single();

  if(
    clienteAtual?.tipo_plano &&
    clienteAtual.tipo_plano !== planoDetectado.nome
  ){

const trocarPlano =
  await abrirDecisaoVisual({

    titulo: "🔄 Alterar plano do cliente",

    mensagem:
      `O cliente está atualmente no plano ` +
      `<b>"${clienteAtual.tipo_plano}"</b>.<br><br>` +

      `O valor informado corresponde ao plano ` +
      `<b>"${planoDetectado.nome}"</b>.<br><br>` +

      `Deseja transferir o cliente para este novo plano?`,

    opcoes: [
      {
        valor: true,
        texto: "🟢 Sim, transferir para o novo plano"
      },
      {
        valor: false,
        texto: "🔵 Não, manter o plano atual"
      }
    ],

    permitirCancelar: true

  });


if(trocarPlano === null){

  // Cancelou a operação
  fecharLoading();
  return;

}

if(trocarPlano === false){

  // Não quer transferir.
  // Mantém o plano atual do cliente.

  planoDetectado = null;

  tipoCliente = "plano";

  atendimentoDoPlano = true;

}
  }
}


  



  

 // ==========================
 // 🔥 DADOS
 // ==========================
 let servicoFinal =
  valor.value.trim() === ""
    ? "sem serviço"
    : valor.value.trim();


// ==========================
// 🔄 VERIFICA ÚLTIMA FORMA DE PAGAMENTO
// ==========================

if(
  !editandoId &&
  tipoCliente === "plano" &&
  clienteId &&
  ["Pix", "Crédito", "Débito", "Dinheiro"].includes(pag.value)
){

  const { data: ultimoPagamento, error: erroUltimoPagamento } =
    await db
      .from("atendimentos")
      .select("forma_pagamento")
      .eq("empresa_id", empresaId)
      .eq("cliente_id", clienteId)
      .eq("tipo_cliente", "plano")
      .order("data", { ascending:false })
      .order("hora", { ascending:false })
      .order("id", { ascending:false })
      .limit(1);

  if(erroUltimoPagamento){

    console.log(
      "Erro ao verificar último pagamento:",
      erroUltimoPagamento
    );

  }

  const ultimaFormaPagamento =
    ultimoPagamento?.[0]?.forma_pagamento || null;

  console.log(
    "Última forma de pagamento:",
    ultimaFormaPagamento
  );

  if(ultimaFormaPagamento === "Recorrente"){

    const continuarMesmoAssim =
      await abrirDecisaoVisual({

        titulo: "⚠️ Forma de pagamento diferente",

        mensagem:
          `<b>Este cliente possui uma renovação Recorrente.</b><br><br>` +
          `A última forma de pagamento foi <b>Recorrente</b>.<br><br>` +
          `Agora foi selecionado <b>${pag.value}</b>.<br><br>` +
          `Se continuar, a <b>data de adesão do plano será alterada</b> ` +
          `e o ciclo recorrente poderá ser perdido.<br><br>` +
          `Deseja realmente continuar?`,

        opcoes: [
          {
            valor: false,
            texto: "🔴 Corrigir pagamento"
          },
          {
            valor: true,
            texto: "🟢 Continuar mesmo assim"
          }
        ],

        permitirCancelar: true

      });

    if(continuarMesmoAssim !== true){

      fecharLoading();
      return;

    }

  }

}




  
 
const dados = {
  empresa_id: empresaId,
  cliente_id: clienteId,
  data: dataInput.value,
  hora: hora.value,
  nome_cliente: nomeFinal,
  telefone: telefoneLimpo,
  barbeiro: barbeiro.value,
  tipo_cliente: tipoCliente,
  tipo_plano: planoDetectado?.nome || null,
  numero_corte: numeroCorteFinal === "" ? null : Number(numeroCorteFinal),
  forma_pagamento: pag.value,
  valor: valorr.value,
  observacao: obs.value,
  servico: servicoFinal,
};

 let resposta;

let atendimentoSalvoId = null;

if(editandoId){
   resposta = await db
   .from('atendimentos')
   .update(dados)
    .eq("empresa_id", empresaId)
   .eq('id', editandoId);

   atendimentoSalvoId = editandoId;

} else {

   resposta = await db
   .from('atendimentos')
   .insert([dados])
   .select()
   .eq("empresa_id", empresaId)
   .single();

   atendimentoSalvoId = resposta.data?.id;
}

 if(resposta.error){
   mostrarToast(resposta.error.message);
   fecharLoading();
   return;
}

window.ultimoAtendimentoId =
atendimentoSalvoId;
 


 
 
 
if(clienteId){

  const { error: erroAtualizarCliente } = await db
    .from("clientes")
    .update({
      nome: nomeFinal,
      telefone: telefoneLimpo || null
    })
    .eq("empresa_id", empresaId)
    .eq("id", clienteId);

  if(erroAtualizarCliente){
    console.log(
      "ERRO AO ATUALIZAR TELEFONE DO CLIENTE:",
      erroAtualizarCliente
    );
  }

}


if(tipoCliente === "plano" && clienteId){


const { data: cli } = await db
  .from("clientes")
  .select(
    "data_adesao_plano,status_plano,ultima_renovacao,tipo_plano"
  )


  
   .eq("empresa_id", empresaId)
   .eq("id", clienteId)
   .single();


  
   let dadosUpdate = {
     
   };

if(planoDetectado && atendimentoDoPlano){

  dadosUpdate.tipo_plano =
    planoDetectado.nome;

  dadosUpdate.status_plano =
    "ativo";

}


  

   // 🔥 RENOVAÇÃO AUTOMÁTICA
if(
  !editandoId &&
  planoDetectado &&
  atendimentoDoPlano &&
  valorInformado > 0
){
      dadosUpdate.ultima_renovacao =
       dataInput.value;

     dadosUpdate.status_plano =
       "ativo";
const valorPlano =
Number(valorr.value || 0);

const vencimento =
calcularVencimento(
  dataInput.value
)
.toISOString()
.split("T")[0];

const { data, error } = await db
.from("financeiro")
.insert([{

  empresa_id: empresaId,

  cliente_id: clienteId || null,

  nome_cliente: nomeFinal,

  telefone: telefoneLimpo || null,

  tipo: "plano",

  descricao:
  `Mensalidade ${planoDetectado.nome}`,

  valor: Number(valorr.value || 0),

  vencimento: vencimento,

  status: "pendente",

  forma_pagamento: pag.value,

  observacao:
  "Cobrança automática do plano"

}])
.select();

console.log(data);
console.log(error);


}





   // 🔥 ALTERA ADESÃO EDITANDO
   if(editandoId){

     dadosUpdate.data_adesao_plano =
       adesaoPlano.value || null;

   }

// 🔥 DATA DE ADESÃO DO PLANO

// Renovação manual
if(
  !editandoId &&
  planoDetectado &&
  atendimentoDoPlano &&
  valorInformado > 0
){
  if(
    pag.value === "Pix" ||
    pag.value === "Débito" ||
    pag.value === "Crédito" ||
    pag.value === "Dinheiro"
  ){

    dadosUpdate.data_adesao_plano = dataInput.value;
    dadosUpdate.ultima_renovacao = dataInput.value;

  }
}


// 🔥 RENOVAÇÃO GRATUITA CONFIRMADA
if(
  !editandoId &&
  renovacaoConfirmadaGratis &&
  atendimentoDoPlano
){
  dadosUpdate.data_adesao_plano = dataInput.value;
  dadosUpdate.ultima_renovacao = dataInput.value;
}


// Novo cliente sem data
else if(!cli?.data_adesao_plano){

  dadosUpdate.data_adesao_plano =
    dataInput.value;

}

   await db
   .from("clientes")
   .update(dadosUpdate)
    .eq("empresa_id", empresaId)
   .eq("id", clienteId);
}

pausarPlayer(); 
  
 somSucesso.currentTime = 0;
somSucesso.play().catch(()=>{});
fecharLoading();
mostrarToast("✅ Salvo ")
 editandoId = null;
 modal.style.display = "none";

 carregarHoje();
}








async function editarAtendimento(id){
abrirLoading("Processando...")

if(valorr.value.trim() === ""){
  valorr.value = 0;
}  
 // ==========================
 // BUSCA ATENDIMENTO
 // ==========================
 const { data, error } = await db
 .from('atendimentos')
 .select('*')
 .eq("empresa_id", empresaId)
 .eq('id', id)
 .single();

 if(error){
   abrirConfirmacao(error.message);
   fecharLoading();
   return;
 }

 editandoId = id;
  

 // ==========================
 // ABRE MODAL
 // ==========================
 modal.style.display = "flex";

 document.querySelector(".box h3").innerText =
 "Editar Atendimento";

 // ==========================
 // PREENCHE CAMPOS
 // ==========================
 hora.value      = data.hora || "";
 nome.value = data.nome_cliente || "";
fone.value = data.telefone || "";

// 🔥 ESSENCIAL
inputNome.dataset.id = data.cliente_id || "";
 
 
 corte.value     = data.numero_corte || "";
 pag.value       = data.forma_pagamento || "Pix";
 valor.value     = data.servico || "";
 valorr.value    = data.valor || "0";
 obs.value       = data.observacao || "";

 // ==========================
 // SE FOR PLANO
 // ==========================
 if(data.tipo_cliente === "plano"){

   document.getElementById("boxPlanoAdmin").style.display = "flex";

   const { data: cli } = await db
   .from("clientes")
   .select("data_adesao_plano,status_plano")
   .eq("empresa_id", empresaId)
   .eq("id", data.cliente_id)
   .single();

   if(cli){

     adesaoPlano.value =
       cli.data_adesao_plano || "";

     statusPlano.innerText =
  cli.status_plano === "ativo"
    ? "🟢 Plano Ativo"
    : "🔴 Plano Inativo";

   }else{

     adesaoPlano.value = "";
     statusPlano.value = "ativo";

   }

 }else{

   document.getElementById("boxPlanoAdmin").style.display = "none";

   adesaoPlano.value = "";
   statusPlano.value = "ativo";
 }
  fecharLoading()

}





async function excluirAtendimento(id){
pausarPlayer(); 
abrirLoading("Excluindo...")
 const { error } = await db
 .from('atendimentos')
 .delete()
  .eq("empresa_id", empresaId)
 .eq('id', id);

 if(error){
   abrirConfirmacao(error.message);
   fecharLoading()
   return;
 }

 exCluir.currentTime = 0;
exCluir.play().catch(()=>{});

fecharLoading();

 carregarHoje();

}


const filtro = document.getElementById('filtro');

let profissionalAtual = "Todos";

function filtrarProf(nome){
  profissionalAtual = nome;
  localStorage.setItem("filtroAgenda", nome);
  carregarHoje();
}


// quando carregar o sistema
function iniciarFiltro(){

  const salvo = localStorage.getItem("filtroAgenda");

  if(salvo){

    profissionalAtual = salvo;

    filtro.value = salvo;

  }

  carregarHoje();
}


filtro.addEventListener("change", () => {

  profissionalAtual = filtro.value;

  localStorage.setItem("filtroAgenda", filtro.value);

  carregarHoje();

});



// =========================
// TOGGLE MENU
// =========================



// =========================
// FECHAR MENU
// =========================
function fecharMenu(){

  document
    .getElementById("sidebar")
    .classList.remove("ativo");

  document
    .getElementById("overlayMenu")
    .classList.remove("show");

}
function iniciarAutoFecharMenu(){

  // cancela qualquer timer antigo
  clearTimeout(timerMenu);

  timerMenu = setTimeout(() => {
    fecharMenu();
  }, 30000); // 30 segundos

}


async function calcularPlanos(){
abrirLoading("Calculando...")
 const inicio = document.getElementById("planoInicio").value;
 const fim = document.getElementById("planoFim").value;
 const box = document.getElementById("resultadoPlanos");

 if(!inicio || !fim){
   box.innerHTML = "Escolha as datas";
fecharLoading("")
   return;
 }

 box.innerHTML = "Carregando...";

 const { data, error } = await db
 .from("atendimentos")
 .select("*")
 .eq("empresa_id", empresaId)
 .eq("tipo_cliente", "plano")
 .gte("data", inicio)
 .lte("data", fim)
 .order("data");

 if(error){
   box.innerHTML = error.message;
   fecharLoading("")
   return;
 }

 if(!data.length){
   box.innerHTML = "Nenhum cliente plano no período";
   fecharLoading()
   return;
 }

 let total = 0;
 const profissionais = {};
 let html = "";

 data.forEach(item => {

   const valor = Number(item.valor || 0);
   total += valor;

 const nome =
item.barbeiro || "Sem profissional";

if(!profissionais[nome]){
  profissionais[nome] = 0;
}

profissionais[nome]++;

   html += `
   <div style="background:#111827;padding:10px;margin:6px 0;border-radius:8px">
     <strong>${item.nome_cliente}</strong><br>
     ${item.data} - Corte ${item.numero_corte}/4<br>
     <small>${item.barbeiro} • R$ ${valor.toFixed(2)}</small>
   </div>
   `;
 });
let resumoProfissionais = "";

Object.keys(profissionais)
.sort()
.forEach(nome => {

  resumoProfissionais += `
    <p>
      💈 ${nome}:
      ${profissionais[nome]}
    </p>
  `;

});
 box.innerHTML = `
   <h3>Total recebido: R$ ${total.toFixed(2)}</h3>

   <p>📌 Atendimentos plano: ${data.length}</p>
   ${resumoProfissionais}

   <hr>

   ${html}
 `;
 fecharLoading("sucesso!")
}



async function calcularPeriodo(){
abrirLoading("Calculando...")
 const inicio = document.getElementById("dataInicio").value;
 const fim = document.getElementById("dataFim").value;
 const prof = document.getElementById("calProf").value;
 const resultado = document.getElementById("resultadoPeriodo");

 if(!inicio || !fim){
   resultado.innerHTML = "Selecione as duas datas";
fecharLoading()
   return;
 }

 resultado.innerHTML = "Carregando...";

 let query = db
  .from("atendimentos")
  .select("*")
  .eq("empresa_id", empresaId)
  .gte("data", inicio)   // maior ou igual
  .lte("data", fim);     // menor ou igual

 if(prof !== "Todos"){
   query = query.eq("barbeiro", prof);
 }

 const { data, error } = await query;

 if(error){
   resultado.innerHTML = "Erro ao carregar";
   fecharLoading()
   return;
 }

 if(!data.length){
   resultado.innerHTML = "Nenhum atendimento nesse período";
   fecharLoading()
   return;
 }

 let total = 0;

 let html = "";

 data.forEach(item => {
   total += Number(item.valor || 0);

   html += `
     <div style="background:#111827;margin:5px;padding:10px;border-radius:8px">
       <strong>${item.data}</strong> - ${item.hora}<br>
       ${item.nome_cliente} • ${item.barbeiro}<br>
       <small>R$ ${item.valor}</small>
     </div>
   `;
 });
fecharLoading();
mostrarToast("Concluido!")
 resultado.innerHTML = `
   <h3>💰 Total do período: R$ ${total.toFixed(2)}</h3>
   ${html}
 `;
}






const inputNome = document.getElementById("nome");
const sugestoes = document.getElementById("sugestoes");

inputNome.addEventListener("input", async () => {

 const texto = inputNome.value.trim();

 if(texto.length < 2){
   sugestoes.innerHTML = "";
   return;
 }

 const { data, error } = await db
 .from("clientes")
 .select("id, nome, telefone")
 .eq("empresa_id", empresaId)
 .ilike("nome", `%${texto}%`)
 .limit(5);

 if(error){
   mostrarToast("Erro!")
   return;
 }

 sugestoes.innerHTML = "";

 // ✅ remover duplicados corretamente
 const nomesUnicos = [...new Map(data.map(item => [item.nome, item])).values()];

 nomesUnicos.forEach(cliente => {

   const div = document.createElement("div");

   div.style.padding = "10px";
   div.style.cursor = "pointer";
   div.style.borderBottom = "1px solid #333";
   div.style.color = "#fff";

   div.innerHTML = `
     <strong>${cliente.nome}</strong><br>
     <small>${cliente.telefone || ''}</small>
   `;

   div.onclick = async () => {

  inputNome.value = cliente.nome;
  fone.value = cliente.telefone || "";
  inputNome.dataset.id = cliente.id;

  sugestoes.innerHTML = "";
  inputNome.blur();


  // ==========================
  // 🔥 BUSCA ÚLTIMO ATENDIMENTO
  // ==========================

  const { data: ultimoAtendimento } = await db
    .from("atendimentos")
    .select("servico,valor")
    .eq("empresa_id", empresaId)
    .eq("cliente_id", cliente.id)
    .order("data", { ascending:false })
    .order("hora", { ascending:false })
    .order("id", { ascending:false })
    .limit(1);


     


  if(ultimoAtendimento?.length > 0){

    const ultimo =
      ultimoAtendimento[0];

    // Preenche o último serviço
    valor.value =
      ultimo.servico || "";


    

    // Mantém sempre o valor real do último atendimento
valorr.value =
  ultimo.valor ?? "";

  }

};
   sugestoes.appendChild(div);
 });

});

async function backupCSV(){

 const { data, error } = await db
 .from("atendimentos")
 .select("*")
 .eq("empresa_id", empresaId)
 .order("data", { ascending: true });

 if(error){
   mostrarToast("Erro ao gerar backup");
   return;
 }

 if(!data.length){
   mostrarToast("Nenhum dado encontrado");
   return;
 }

 let csv = "";

 const colunas = Object.keys(data[0]);
 csv += colunas.join(";") + "\n";

 data.forEach(item => {

   const linha = colunas.map(col => {
     let valor = item[col] ?? "";
     valor = String(valor).replace(/;/g, ",");
     return `"${valor}"`;
   }).join(";");

   csv += linha + "\n";
 });

 const blob = new Blob([csv], {
   type: "text/csv;charset=utf-8;"
 });

 const link = document.createElement("a");

 const hoje = new Date().toISOString().slice(0,10);

 link.href = URL.createObjectURL(blob);
 link.download = "backup_atendimentos_" + hoje + ".csv";

 link.click();

}
let timerMenu = null;
let timerPress = null;
let segurando = false;
let iniciouX = 0;
let iniciouY = 0;
let moveu = false;

let ultimoAtendimentoId = null;

function segurarExcluir(event,id){

 const toque = event.touches[0];

 iniciouX = toque.clientX;
 iniciouY = toque.clientY;
 moveu = false;
 segurando = false;

 timerPress = setTimeout(async () => {

   if(moveu) return;

   segurando = true;

   if(navigator.vibrate){
     navigator.vibrate(150);
   }

  abrirConfirmacao(
     "🗑️ Excluir atendimento?",
     async ()=>{

       await excluirAtendimento(id);

       mostrarToast("✅ Excluído");

     }
   );

 }, 700);

}

function moverDedo(event){

 const toque = event.touches[0];

 const dx = Math.abs(toque.clientX - iniciouX);
 const dy = Math.abs(toque.clientY - iniciouY);

 if(dx > 15 || dy > 15){
   moveu = true;
   clearTimeout(timerPress);
 }

}

function cancelarSegurar(){
 clearTimeout(timerPress);
}



 let ultimoClique = 0;

function cliqueCard(id){

 if(segurando){
   segurando = false;
   return;
 }

 const agora = new Date().getTime();

 if(agora - ultimoClique < 400){
   editarAtendimento(id);
 }

 ultimoClique = agora;

}




// ======================
// TOAST
// ======================

function mostrarToast(texto){

  const toast =
  document.getElementById("toast");

  toast.innerText = texto;

  toast.classList.add("show");

  setTimeout(()=>{
    toast.classList.remove("show");
  },2500);

}

// ======================
// CONFIRMAÇÃO
// ======================

let callbackConfirmacao = null;

function abrirConfirmacao(
  texto,
  callback,
  titulo = "Confirmação"
){

  document.getElementById(
    "confirmTitulo"
  ).innerText = titulo;

  document.getElementById(
    "confirmTexto"
  ).innerText = texto;

  callbackConfirmacao = callback;

  document.getElementById(
    "confirmModal"
  ).style.display = "flex";

}

function fecharConfirmacao(){

  document.getElementById(
    "confirmModal"
  ).style.display = "none";

}

document
.getElementById("btnConfirmar")
.onclick = async ()=>{

  if(callbackConfirmacao){
    await callbackConfirmacao();
  }

  fecharConfirmacao();

};

function tratarErro(error){
  console.error(error);
  mostrarToast(error.message || "Erro interno");
  fecharLoading();
}




let oculto = false;

let cacheValores = {
  total: "",
  clientes: "",
  planos: ""
};

function toggleValores(){

  oculto = !oculto;

  const olho =
  document.getElementById("btnOlho");

  const total =
  document.getElementById("totalDia");

  const clientes =
  document.getElementById("qtd");

  const planos =
  document.getElementById("planos");

  if(oculto){

    // salva valores atuais
    cacheValores.total = total.innerText;
    cacheValores.clientes = clientes.innerText;
    cacheValores.planos = planos.innerText;

    // esconde
    total.innerText = "****";
    clientes.innerText = "****";
    planos.innerText = "****";

    olho.innerText = "🙈";

  }else{

    // volta valores
    total.innerText = cacheValores.total;
    clientes.innerText = cacheValores.clientes;
    planos.innerText = cacheValores.planos;

    olho.innerText = "👁️";
  }

}
function aplicarOcultacao(){

  if(!oculto) return;

  totalDia.innerText = "****";
  qtd.innerText = "****";
  planos.innerText = "****";

}

function calcularVencimento(dataAdesao){

  if(!dataAdesao) return null;

  const partes =
    String(dataAdesao).split("-");

  if(partes.length !== 3) return null;

  const ano = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const dia = Number(partes[2]);

  // Primeiro dia do mês seguinte
  const proximoMes =
    new Date(ano, mes + 1, 1);

  // Último dia do mês seguinte
  const ultimoDia =
    new Date(
      proximoMes.getFullYear(),
      proximoMes.getMonth() + 1,
      0
    ).getDate();

  // Mantém o mesmo dia ou usa o último dia disponível
  const diaVencimento =
    Math.min(dia, ultimoDia);

  return new Date(
    proximoMes.getFullYear(),
    proximoMes.getMonth(),
    diaVencimento
  );
}






function planoVencido(dataAdesao){

  const vencimento =
    calcularVencimento(dataAdesao);

  if(!vencimento) return false;

  return new Date() > vencimento;
}


function diasRestantesPlano(dataAdesao){

  const vencimento =
    calcularVencimento(dataAdesao);

  if(!vencimento) return 0;

  const hoje = new Date();

  const diff =
    vencimento - hoje;

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
}

function calcularVencimentoComRenovacao(
  dataAdesao,
  ultimaRenovacao
){

  if(!dataAdesao) return null;

  const partes =
    String(dataAdesao).split("-");

  if(partes.length !== 3) return null;

  const diaFixo = Number(partes[2]);

  const partesRenovacao =
    ultimaRenovacao
      ? String(ultimaRenovacao).split("-")
      : null;

  if(
    !partesRenovacao ||
    partesRenovacao.length !== 3
  ){
    return calcularVencimento(dataAdesao);
  }

  const anoRenovacao =
    Number(partesRenovacao[0]);

  const mesRenovacao =
    Number(partesRenovacao[1]) - 1;

  const proximoMes =
    new Date(
      anoRenovacao,
      mesRenovacao + 1,
      1
    );

  const ultimoDia =
    new Date(
      proximoMes.getFullYear(),
      proximoMes.getMonth() + 1,
      0
    ).getDate();

  const diaVencimento =
    Math.min(
      diaFixo,
      ultimoDia
    );

  return new Date(
    proximoMes.getFullYear(),
    proximoMes.getMonth(),
    diaVencimento
  );
}



async function buscarVencimentos(){

  const { data, error } =
    await db
      .from("clientes")
 .select(`
  id,
  nome,
  data_adesao_plano,
  ultima_renovacao,
  status_plano,
  tipo_plano
`)
      .eq("empresa_id", empresaId)
      .eq("status_plano", "ativo");

  if(error){
    console.log(error);
    return [];
  }

  const { data: planos } =
  await db
    .from("planos_site")
    .select("nome,preco,quantidade_cortes")
    .eq("empresa_id", empresaId)
    .eq("ativo", true);

  const lista = [];


  const { data: atendimentosPlano } =
  await db
    .from("atendimentos")
    .select("cliente_id,data,hora,id,tipo_cliente,numero_corte,forma_pagamento")
    .eq("empresa_id", empresaId)
    .eq("tipo_cliente", "plano");
  

  data.forEach(cliente => {
    
    const plano =
  (planos || []).find(
    p => p.nome === cliente.tipo_plano
  );

const valorPlano =
  plano?.preco || "0";


    const limiteCortes =
  Number(plano?.quantidade_cortes) || 4;

const cortesDoCliente =
  (atendimentosPlano || [])
    .filter(atendimento => {

      if(atendimento.cliente_id !== cliente.id){
        return false;
      }

      if(!cliente.data_adesao_plano){
        return false;
      }

      return (
        atendimento.data >= cliente.data_adesao_plano
      );

    })
    .sort((a, b) => {

      const dataA =
        `${a.data || ""} ${a.hora || ""}`;

      const dataB =
        `${b.data || ""} ${b.hora || ""}`;

      return dataB.localeCompare(dataA);

    });

const ultimoCorte =
  cortesDoCliente[0]?.numero_corte;

const cortesUtilizados =
  Number(ultimoCorte) || 0;

const cortesEsgotados =
  cortesUtilizados >= limiteCortes;

    const renovacaoRecorrente =
  (cortesDoCliente || []).find(
    atendimento =>
      atendimento.forma_pagamento === "Recorrente"
  );

const assinanteRecorrente =
  !!renovacaoRecorrente;

    

    if(!cliente.data_adesao_plano) return;

const vencimentoAtual =
  calcularVencimentoComRenovacao(
    cliente.data_adesao_plano,
    cliente.ultima_renovacao
  );

const hoje = new Date();

const dias =
  Math.ceil(
    (vencimentoAtual - hoje) /
    (1000 * 60 * 60 * 24)
  );

    if(dias <= 7 || cortesEsgotados){

lista.push({

  id: cliente.id,

  nome: cliente.nome,

  plano: cliente.tipo_plano || "Plano não informado",

  valor: valorPlano,

  dataAdesao:
    cliente.data_adesao_plano,
  
  assinanteRecorrente,

  ultimaRenovacao:
  cliente.ultima_renovacao,

  dias,

  cortesUtilizados,
limiteCortes,
cortesEsgotados,

  vencimento:
  vencimentoAtual

});

    }

  });

  return lista;

}

async function abrirVencimentos(){

  const lista =
  document.getElementById(
    "listaVencimentos"
  );

  lista.innerHTML =
  "Carregando...";

  const vencimentos =
  await buscarVencimentos();

  if(!vencimentos.length){

    lista.innerHTML =
    "Nenhum vencimento próximo";

  }else{

    lista.innerHTML = "";

   vencimentos.forEach(c => {

  const venc =
  new Date(c.vencimento);
const vencido =
  c.dias <= 0 || c.cortesEsgotados;

  lista.innerHTML += `

  <div style="
    background:linear-gradient(
      145deg,
      #111827,
      #0f172a
    );
    border:1px solid ${
      vencido ? "#dc2626" : "#1d4ed8"
    };
    border-left:5px solid ${
      vencido ? "#ef4444" : "#3b82f6"
    };
    padding:14px;
    margin-bottom:12px;
    border-radius:16px;
    box-shadow:
      0 4px 15px rgba(0,0,0,.25);
  ">

    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-bottom:10px;
    ">

      <strong style="
        font-size:16px;
        color:#fff;
      ">
        ${c.nome}

<div style="
  margin-top:8px;
  color:#e5e7eb;
  font-size:14px;
  font-weight:600;
">
  📋 ${c.plano}
</div>

<div style="
  margin-top:5px;
  color:#facc15;
  font-size:15px;
  font-weight:700;
">
  💰 ${c.valor}
</div>

        
      </strong>

      <span style="
        background:${
          vencido
          ? "#7f1d1d"
          : "#1e3a8a"
        };
        color:#fff;
        padding:5px 10px;
        border-radius:999px;
        font-size:12px;
        font-weight:700;
      ">

        ${
          vencido
          ? "Vencido"
          : `${c.dias} dias`
        }

      </span>

    </div>

    <div style="
      color:#cbd5e1;
      font-size:14px;
      line-height:1.6;
    ">

    <div>
  🗓️ Adesão:
  <strong style="color:#fff">
    ${new Date(
      c.dataAdesao + "T00:00:00"
    ).toLocaleDateString()}
  </strong>
</div>

${
  c.assinanteRecorrente
  ? `
    <div style="
      margin-top:6px;
      color:#86efac;
      font-weight:700;
    ">
      🔄 Assinante Recorrente
    </div>

    <div style="
      margin-top:6px;
    ">
      🔄 Renovação:
      <strong style="color:#fff">
        ${new Date(
  c.ultimaRenovacao + "T00:00:00"
).toLocaleDateString()}
      </strong>
    </div>
  `
  : ""
}

      <div>
        📅 Vencimento:
        <strong style="color:#fff">
          ${venc.toLocaleDateString()}
        </strong>
      </div>

      <div style="
  margin-top:6px;
  color:#cbd5e1;
  font-weight:600;
">
  ✂️ Cortes:
  <strong style="color:#fff">
    ${c.cortesUtilizados}/${c.limiteCortes}
  </strong>
</div>

      <div style="
        margin-top:6px;
        color:${
          vencido
          ? "#fca5a5"
          : "#93c5fd"
        };
        font-weight:600;
      ">

        ${
          vencido
          ? "⚠️ Cliente precisa renovar"
          : "Plano próximo do vencimento"
        }
         </div>

<button
  onclick="desativarPlanoVencimento('${c.id}', '${c.nome.replace(/'/g, "\\'")}')"
  style="
    margin-top:12px;
    width:100%;
    padding:12px;
    border:none;
    border-radius:12px;
    background:#dc2626;
    color:#fff;
    font-weight:700;
  "
>
  🔴 Desativar plano
</button>


         
         ${
  vencido
  ? `
  <button
    onclick="cobrarCliente('${c.nome}')"
    style="
      margin-top:12px;
      width:100%;
      padding:12px;
      border:none;
      border-radius:12px;
      background:#16a34a;
      color:#fff;
      font-weight:700;
    "
  >
    💬 Cobrar no WhatsApp
  </button>
  `
  : ""
}

    </div>

  </div>

  `;

});

  }

  document
  .getElementById(
    "modalVencimentos"
  )
  .style.display = "block";

}


async function cobrarCliente(nome){

  // 🔎 busca cliente
  const { data, error } = await db
    .from("clientes")
    .select("telefone")
    .eq("empresa_id", empresaId)
    .eq("nome", nome)
    .single();

  if(error || !data){
    mostrarToast("Cliente não encontrado");
    return;
  }

  const telefone = (data.telefone || "").replace(/\D/g,'');

  if(!telefone){
    mostrarToast("Telefone não cadastrado");
    return;
  }

  // 🔎 busca config da empresa
  const config = await getConfiguracao();

  const empresa = config?.nome_empresa || "Empresa";
  const chavePix = config?.chave_pix || "";
  const recebedor = config?.nome_recebedor || "";
  const linkPagamento = config?.link_pagamento || "";

  // 💬 mensagem completa
  const mensagem = `
Olá ${nome},

Aqui é da ${empresa}.

Identificamos que seu plano está em aberto.

💳 Dados para pagamento:
PIX: ${chavePix}
Recebedor: ${recebedor}
${linkPagamento ? `\n🔗 Link de pagamento:\n${linkPagamento}` : ""}

Qualquer dúvida estou à disposição.
`;

  // 📲 abre WhatsApp direto com o número do cliente
  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}


function fecharVencimentos(){

  document
  .getElementById(
    "modalVencimentos"
  )
  .style.display = "none";

}



async function atualizarBadge(){

  const lista =
  await buscarVencimentos();

  document
  .getElementById("badgeNotif")
  .innerText = lista.length;

}


// =========================
// ABRIR TELA
// =========================

function abrirTela(id){

  document
    .querySelectorAll(".telaSistema")
    .forEach(tela => tela.classList.remove("ativa"));

  document
    .getElementById(id)
    .classList.add("ativa");

  fecharMenu(); // usa o padrão único
}

// =========================
// FECHAR TELA
// =========================

function fecharTela(id){

  document
  .getElementById(id)
  .classList.remove("ativa");
  

}

// =========================
// TOGGLE MENU
// =========================

function toggleMenu(){

  const menu = document.getElementById("sidebar");
  const overlay = document.getElementById("overlayMenu");

  menu.classList.toggle("ativo");
  overlay.classList.toggle("show");

  // se abriu o menu, inicia o timer
  if(menu.classList.contains("ativo")){
    iniciarAutoFecharMenu();
  } else {
    clearTimeout(timerMenu);
  }
}

// =========================
// ABRIR HOJE
// =========================





function abrirHoje(){

fecharMenu();

  carregarHoje();

}

function abrirTelaRifa(){
abrirTela("telaRifa");

}





// =========================
// ABRIR FATURAMENTO
// =========================

async function abrirDespesas(){

  abrirTela("telaDespesas");




}

// =========================
// ABRIR PLANOS
// =========================

function abrirPlanos(){

  abrirTela("telaPlanos");

}

function abrirCalculo(){

  abrirTela("telaCalculo");

}





// =========================
// ABRIR CALENDÁRIO
// =========================

function abrirCalendario(){

  abrirTela("telaCalendario");

}

// =========================
// ABRIR CLIENTES
// =========================

function abrirClientes(){

  abrirTela("telaClientes");

}

// =========================
// ABRIR FINANCEIRO
// =========================

async function abrirFinanceiro(){

  abrirTela("telaFinanceiro");

  await carregarFinanceiro();

}


async function abrirFinanceiros(){

  abrirTela("telaFinanceiros");

  

}


function abrirServicos(){

  abrirTela(
    "telaServicos"
  );}

function abrirProfissionais(){

  abrirTela(
    "telaProfissionais"
  );

  carregarProfissionais();

}
async function carregarProfissionaisSelect(){

  const { data, error } = await db
  .from("profissionais")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(error) return;

  barbeiro.innerHTML = "";

  data.forEach(prof => {

    barbeiro.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });

  const barbeiroSalvo =
  localStorage.getItem(
    "barbeiroPadrao"
  );

  if(barbeiroSalvo){
    barbeiro.value =
    barbeiroSalvo;
  }

}

async function carregarProfissionaisCalendario(){

  const select =
  document.getElementById("calProf");

  select.innerHTML =
  '<option value="Todos">Todos</option>';

  const { data, error } = await db
  .from("profissionais")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(error) return;

  data.forEach(prof => {

    select.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });

}

async function carregarProfissionaisFiltro(){

  const filtro =
  document.getElementById("filtro");

  filtro.innerHTML =
  '<option value="Todos">Todos</option>';

  const { data, error } = await db
  .from("profissionais")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(error) return;

  data.forEach(prof => {

    filtro.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });



const filtroSalvo =
localStorage.getItem("filtroAgenda");

if(
  filtroSalvo &&
  [...filtro.options]
  .some(o => o.value === filtroSalvo)
){
  filtro.value = filtroSalvo;
}



}

let clientesCache = [];

async function carregarClientes(){

  const { data: clientes, error } = await db
    .from("clientes")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome");

  if(error){
    console.log(error);
    return;
  }

  clientesCache = clientes || [];

  renderizarClientes();
}


function renderizarClientes(){

  const lista =
    document.getElementById("resultadoClientes");

  const busca =
    document
      .getElementById("buscarCliente")
      .value
      .trim()
      .toLowerCase();

  const filtro =
    document.getElementById("filtroTipoCliente")
      .value;

  let clientesFiltrados =
    clientesCache.filter(cli => {

      // ==========================
      // FILTRO PLANO / AVULSO
      // ==========================

      if(filtro === "plano"){

        if(
          cli.status_plano !== "ativo"
        ){
          return false;
        }

      }

      if(filtro === "avulso"){

        if(
          cli.status_plano === "ativo"
        ){
          return false;
        }

      }

      // ==========================
      // PESQUISA
      // ==========================

      if(!busca){
        return true;
      }

      const nome =
        String(cli.nome || "")
          .toLowerCase();

      const telefone =
        String(cli.telefone || "")
          .toLowerCase();

      return (
        nome.includes(busca) ||
        telefone.includes(busca)
      );

    });


  lista.innerHTML = "";


  if(!clientesFiltrados.length){

    lista.innerHTML = `
      <div class="msgClientes">
        🔎 Nenhum cliente encontrado.
      </div>
    `;

    return;
  }


  // ==========================
  // CARDS
  // ==========================

  clientesFiltrados.forEach(cli => {

    const planoAtivo =
      cli.status_plano === "ativo";

    lista.innerHTML += `

      <div
  class="cardCliente"
  onclick="abrirDetalheCliente('${cli.id}')"
  style="cursor:pointer;"
>

        <div class="nomeCliente">
          👤 ${cli.nome}
        </div>

        <div class="infoCliente">
          📞 ${cli.telefone || "Telefone não informado"}
        </div>

        <hr>

        <div>
          ${
            planoAtivo
            ? "🟢 Cliente com plano ativo"
            : "🔵 Cliente avulso"
          }
        </div>

      </div>

    `;

  });

}





document
  .getElementById("buscarCliente")
  .addEventListener(
    "input",
    renderizarClientes
  );


document
  .getElementById("filtroTipoCliente")
  .addEventListener(
    "change",
    renderizarClientes
  );

async function abrirDetalheCliente(clienteId){

  const tela =
    document.getElementById("telaDetalheCliente");

  const conteudo =
    document.getElementById("conteudoDetalheCliente");

  if(!tela || !conteudo) return;

  conteudo.innerHTML = `
    <div class="msgClientes">
      ⏳ Carregando informações do cliente...
    </div>
  `;

  tela.style.display = "flex";

  // ==========================
  // BUSCA CLIENTE
  // ==========================

  const { data: cliente, error: erroCliente } =
    await db
      .from("clientes")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("id", clienteId)
      .single();

  if(erroCliente || !cliente){

    conteudo.innerHTML = `
      <div class="msgClientes">
        ❌ Não foi possível carregar o cliente.
      </div>
    `;

    return;
  }


  // ==========================
  // BUSCA ATENDIMENTOS
  // ==========================

  const { data: atendimentos, error: erroAtendimentos } =
    await db
      .from("atendimentos")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("cliente_id", clienteId)
      .order("data", { ascending:false })
      .order("hora", { ascending:false })
      .limit(10);


  if(erroAtendimentos){

    console.log(erroAtendimentos);

  }


  const listaAtendimentos =
    atendimentos || [];


  // ==========================
  // PLANO
  // ==========================

  let plano = null;

  if(
    cliente.status_plano === "ativo" &&
    cliente.tipo_plano
  ){

    const { data: planoEncontrado } =
      await db
        .from("planos_site")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("nome", cliente.tipo_plano)
        .eq("ativo", true)
        .single();

    plano = planoEncontrado || null;
  }


  // ==========================
  // CORTES DO PLANO
  // ==========================

  const cortesPlano =
    listaAtendimentos.filter(a =>
      a.tipo_cliente === "plano"
    );

  const limiteCortes =
    Number(plano?.quantidade_cortes) || 4;

  const ultimoCorte =
    cortesPlano.length
      ? Number(cortesPlano[0].numero_corte) || 0
      : 0;


  // ==========================
  // VENCIMENTO
  // ==========================

  let vencimento = null;

  if(cliente.data_adesao_plano){

  vencimento =
    calcularVencimentoComRenovacao(
      cliente.data_adesao_plano,
      cliente.ultima_renovacao
    );

}


  const vencimentoTexto =
    vencimento
      ? vencimento.toLocaleDateString("pt-BR")
      : "-";


  // ==========================
  // TOTAL GASTO
  // ==========================

  const totalGasto =
    listaAtendimentos.reduce(
      (total, atendimento) =>
        total +
        (Number(atendimento.valor) || 0),
      0
    );


  // ==========================
  // HTML
  // ==========================

  conteudo.innerHTML = `

    <!-- ===================== -->
    <!-- DADOS DO CLIENTE -->
    <!-- ===================== -->

    <div class="cardCliente">

      <div class="nomeCliente">
        👤 ${cliente.nome}
      </div>

      <div class="infoCliente">
        📞 ${cliente.telefone || "Telefone não informado"}
      </div>

      <hr>

      ${
        cliente.status_plano === "ativo"

        ? `
          <div>
            🟢 <b>Plano ativo</b>
          </div>

          <div style="margin-top:8px;">
            📋 Plano:
            <b>${cliente.tipo_plano || "-"}</b>
          </div>
        `

        : `
          <div>
            🔵 <b>Cliente avulso</b>
          </div>
        `
      }

    </div>


    <!-- ===================== -->
    <!-- INFORMAÇÕES DO PLANO -->
    <!-- ===================== -->

    ${
      cliente.status_plano === "ativo"

      ? `

        <div class="cardCliente">

          <h3>📋 Informações do plano</h3>

          <div style="margin-top:10px;">
            💰 Valor:
            <b>${plano?.preco || "-"}</b>
          </div>

          <div style="margin-top:8px;">
            ✂️ Cortes:
            <b>${ultimoCorte}/${limiteCortes}</b>
          </div>

          <div style="margin-top:8px;">
            📅 Adesão:
            <b>${cliente.data_adesao_plano || "-"}</b>
          </div>

          <div style="margin-top:8px;">
            🔄 Última renovação:
            <b>${cliente.ultima_renovacao || "-"}</b>
          </div>

          <div style="margin-top:8px;">
            ⏳ Vencimento:
            <b>${vencimentoTexto}</b>
          </div>

        </div>

      `

      : `

        <div class="cardCliente">

          <h3>🎁 Fidelidade</h3>

          <div style="margin-top:10px;">
            📅 Início:
            <b>${cliente.fidelidade_inicio || "-"}</b>
          </div>

          <div style="margin-top:8px;">
            ✂️ Cortes acumulados:
            <b>${cliente.cortes_fidelidade || 0}/10</b>
          </div>

          <div style="margin-top:8px;">
            🎁 Cortes gratuitos usados:
            <b>${cliente.fidelidade_usados || 0}</b>
          </div>

        </div>

      `
    }


    <!-- ===================== -->
    <!-- RESUMO FINANCEIRO -->
    <!-- ===================== -->

    <div class="cardCliente">

      <h3>💰 Resumo</h3>

      <div style="margin-top:10px;">
        👣 Atendimentos registrados:
        <b>${listaAtendimentos.length}</b>
      </div>

      <div style="margin-top:8px;">
        💵 Total dos últimos atendimentos:
        <b>
          R$ ${totalGasto.toFixed(2).replace(".", ",")}
        </b>
      </div>

    </div>


    <!-- ===================== -->
    <!-- HISTÓRICO -->
    <!-- ===================== -->

    <div class="cardCliente">

      <h3>📋 Últimos atendimentos</h3>

      ${
        listaAtendimentos.length

        ? listaAtendimentos.map(a => `

          <div
            style="
              padding:12px 0;
              border-bottom:1px solid #ddd;
            "
          >

            <div>
              📅
              <b>
                ${
                  a.data
                    ? String(a.data).split("-").reverse().join("/")
                    : "-"
                }
              </b>

              ${
                a.hora
                  ? ` • ${a.hora}`
                  : ""
              }
            </div>

            <div style="margin-top:5px;">
  ✂️
  ${a.servico || "Serviço não informado"}

  ${
    a.tipo_cliente === "plano"
      ? ` • Corte: ${a.numero_corte || 0}/${limiteCortes}`
      : ""
  }
</div>

            <div style="margin-top:5px;">
              👨‍💼
              ${a.barbeiro || "Profissional não informado"}
            </div>

            <div style="margin-top:5px;">
              ${
                a.tipo_cliente === "plano"
                  ? "🟢 Plano"
                  : "🔵 Avulso"
              }

              ${
                a.valor != null
                  ? ` • R$ ${Number(a.valor)
                      .toFixed(2)
                      .replace(".", ",")}`
                  : ""
              }
            </div>

            ${
              a.forma_pagamento
                ? `
                  <div style="margin-top:5px;">
                    💳 ${a.forma_pagamento}
                  </div>
                `
                : ""
            }

          </div>

        `).join("")

        : `

          <div
            style="
              padding:15px 0;
              text-align:center;
            "
          >
            Nenhum atendimento encontrado.
          </div>

        `
      }

    </div>

  `;

}

function voltarDaDetalheCliente(){

  const tela =
    document.getElementById("telaDetalheCliente");

  if(tela){
    tela.style.display = "none";
  }

}




function abrirLembrete(){

  abrirTela("telaLembrete");
document.getElementById("lembreteData").value =
new Date().toISOString().split("T")[0];
  
  carregarLembretes();

}


function abrirFidelidade(){

  abrirTela("telaFidelidade");

  carregarFidelidade();

}
async function carregarFidelidade(){

  const busca =
  document.getElementById(
    "buscaFidelidade"
  ).value.trim();

  let query = db
  .from("clientes")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(busca){

    query =
    query.ilike(
      "nome",
      `%${busca}%`
    );

  }

  const {
    data,
    error
  } = await query;

  if(error){

    console.log(error);

    return;

  }
  
const mapaCortes = {};

for(const cli of data){

  if(!cli.tem_fidelidade){
    mapaCortes[cli.id] = 0;
    continue;
  }

  const { data: atendimentosCliente, error: erroAtendimentos } =
    await db
      .from("atendimentos")
      .select("cliente_id,tipo_cliente,data")
      .eq("empresa_id", empresaId)
      .eq("cliente_id", cli.id)
      .eq("tipo_cliente", "avulso");

  if(erroAtendimentos){
    console.log(erroAtendimentos);
    mapaCortes[cli.id] = 0;
    continue;
  }

  const total =
    (atendimentosCliente || []).filter(a =>
      a.data >= cli.fidelidade_inicio
    ).length;

  mapaCortes[cli.id] = total;
}

  const lista =
  document.getElementById(
    "listaFidelidade"
  );

  lista.innerHTML = "";
const premiosDisponiveis =
data.filter(cli => {

  const cortesTotal =
  mapaCortes[cli.id] || 0;

  const premiosGanhos =
  Math.floor(cortesTotal / 11);

  const premiosUsados =
  Number(cli.fidelidade_usados || 0);

  return (
    cli.tem_fidelidade &&
    (premiosGanhos - premiosUsados) > 0
  );

}).length;

const clientesProximoPremio =
data.filter(cli => {

  const cortesTotal =
  mapaCortes[cli.id] || 0;

  const premiosGanhos =
  Math.floor(cortesTotal / 11);

  const premiosUsados =
  Number(cli.fidelidade_usados || 0);

  const premiosDisponiveis =
  premiosGanhos - premiosUsados;

  return (
    cli.tem_fidelidade &&
    cortesTotal % 11 === 10 &&
    premiosDisponiveis === 0
  );

});


const alerta =
document.getElementById(
  "alertaFidelidade"
);

let mensagens = [];

if(clientesProximoPremio.length > 0){

  const nomes =
  clientesProximoPremio
  .map(c => c.nome)
  .join("<br>");

  mensagens.push(`
    ⚠️ Corte grátis na próxima visita:<br><br>
    ${nomes}
  `);

}

if(premiosDisponiveis > 0){

  mensagens.push(
    `🏆 Existem ${premiosDisponiveis} prêmio(s) disponível(is)`
  );

}

if(mensagens.length){

  alerta.style.display = "block";

  alerta.innerHTML =
  mensagens.join("<br><br>");

}else{

  alerta.style.display = "none";

}

const premiados =
data.filter(cli => {

  const cortesTotal =
  mapaCortes[cli.id] || 0;

  const premiosGanhos =
  Math.floor(cortesTotal / 11);

  const premiosUsados =
  Number(cli.fidelidade_usados || 0);

  return (
    cli.tem_fidelidade &&
    (premiosGanhos - premiosUsados) > 0
  );

});

const restantes =
data.filter(cli => {

  const cortesTotal =
  mapaCortes[cli.id] || 0;

  const premiosGanhos =
  Math.floor(cortesTotal / 11);

  const premiosUsados =
  Number(cli.fidelidade_usados || 0);

  return !(
    cli.tem_fidelidade &&
    (premiosGanhos - premiosUsados) > 0
  );

});

const listaFinal = [
  ...premiados,
  ...restantes
];

  listaFinal.forEach(cli=>{

const cortesTotal =
mapaCortes[cli.id] || 0;

const premiosGanhos =
Math.floor(cortesTotal / 11);

const premiosUsados =
Number(cli.fidelidade_usados || 0);

const premiosDisponiveis =
premiosGanhos - premiosUsados;

const cortes =
cortesTotal % 11;

  lista.innerHTML += `

  <div class="
  
  cardFidelidade
${
  cli.tem_fidelidade &&
  premiosDisponiveis > 0

  ?

  "cardPremiado"

  :

  (
    cli.tem_fidelidade &&
    cortesTotal % 11 === 10

    ?

    "cardQuasePremiado"

    :

    ""
  )
}
">

    <div class="nomeFid">
      ${cli.nome}
    </div>
    
    

    <div class="statusFid">

      ${
        cli.tem_fidelidade
        ? "🎁 Fidelidade Ativa"
        : "⭕ Fidelidade Inativa"
      }

    </div>
    

<div class="cortesFid">

  ✂️ ${cortes}/10 cortes

</div>
<center style="margin-bottom:15px;letter-spacing:2px;">${
  cli.tem_fidelidade &&
  cortesTotal % 11 === 10 &&
  premiosDisponiveis === 0

  ?

  `
  <div class="avisoProximoPremio">
    ⚠️ Próxima visita é grátis
  </div>
  `

  :

  ""
}</center>
    <div class="acoesFid">

${
 cli.tem_fidelidade &&
premiosDisponiveis > 0

  ?

  `<button
  onclick="usarPremio('${cli.id}')">

    🎁 Usar Grátis

  </button>`

        :

        ""
      }

      <button
      onclick="
      alternarFidelidade(
        '${cli.id}',
        ${cli.tem_fidelidade}
      )
      ">

        ${
          cli.tem_fidelidade
          ? "❌ Desativar"
          : "🎁 Ativar"
        }

      </button>
      
      

    </div>
<div style="
position:absolute;
right:0;
top:0;
display:flex;
flex-direction:column;
width:80px;


">

<button style="padding:4px 0px; background-color: red; margin-bottom:5px; font-size:10px" onclick="alterarInicioFidelidade('${cli.id}')">
📅 Alterar início
</button>



<input style="padding:6px; background-color:transparent"
 type="date" 
 id="fidData-${cli.id}"
 value="${cli.fidelidade_inicio || ''}"
>


</div>

</div>

  </div>

  `;

});

}


async function alterarInicioFidelidade(id){

  const input =
  document.getElementById(
    `fidData-${id}`
  );

  const novaData = input.value;


  if(!novaData){

    alert("Escolha uma data");

    return;

  }


  const { error } =
  await db
  .from("clientes")
  .update({
    fidelidade_inicio: novaData,
    fidelidade_usados: 0
  })
   .eq("empresa_id", empresaId)
  .eq("id", id);


  if(error){

    console.log(error);

    alert("Erro ao atualizar");

    return;

  }


  alert("Início da fidelidade atualizado!");

  carregarFidelidade();

}


async function usarPremio(id){

  const { data: cli, error } =
  await db
  .from("clientes")
  .select("fidelidade_usados")
  .eq("empresa_id", empresaId)
  .eq("id", id)
  .single();

  if(error){
    mostrarToast(error.message);
    return;
  }

  const usados =
  Number(cli.fidelidade_usados || 0);

  const { error: erroUpdate } =
  await db
  .from("clientes")
  .update({
    fidelidade_usados:
    usados + 1
  })
   .eq("empresa_id", empresaId)
  .eq("id", id);

  if(erroUpdate){
    mostrarToast(erroUpdate.message);
    return;
  }

  mostrarToast(
    "🎁 Prêmio utilizado"
  );

  carregarFidelidade();

}

async function alternarFidelidade(
  id,
  ativo
){

  const dados = {

    tem_fidelidade: !ativo

  };

  if(!ativo){

    dados.fidelidade_inicio =
new Date()
.toLocaleDateString(
  "sv-SE"
);

  }else{

    dados.fidelidade_inicio =
    null;

  }

  const { error } =
  await db
  .from("clientes")
  .update(dados)
   .eq("empresa_id", empresaId)
  .eq("id", id);

  if(error){

    mostrarToast(error.message);
    return;

  }

  mostrarToast(
    !ativo
    ? "🎁 Fidelidade ativada"
    : "❌ Fidelidade removida"
  );

  carregarFidelidade();

}
// =========================
// ABRIR CONFIG
// =========================



async function abrirConfigLista(
  id
){

  listaConfigAtual = id;

  const { data } =
  await db
  .from("listas")
  .select("*")
  .eq("empresa_id", empresaId)
  .eq("id",id)
  .single();

  document.getElementById(
    "tituloConfigLista"
  ).innerText =
  "📁 " + data.nome;

  diaSelecionado =
  data.dia_semana || 0;

  renderizarDias();
console.log(
  document.getElementById(
    "modalConfigLista"
  )
);
  document.getElementById(
    "modalConfigLista"
  ).style.display =
  "flex";

}

function renderizarDias(){

  const nomes = [
    "Nenhum",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
    "Domingo"
  ];

  const div =
  document.getElementById(
    "diasSemana"
  );

  div.innerHTML = "";

  nomes.forEach((nome,i)=>{

    const item =
    document.createElement("div");

    item.className =
    "itemDia";

    item.innerHTML =
    (diaSelecionado === i
      ? "✅ "
      : "") + nome;

    item.onclick = ()=>{

      diaSelecionado = i;

      renderizarDias();

    };

    div.appendChild(item);

  });

}

async function salvarConfigLista(){

  await db
  .from("listas")
  .update({
    dia_semana:
    diaSelecionado
  })
   .eq("empresa_id", empresaId)
  .eq(
    "id",
    listaConfigAtual
  );

  fecharConfigLista();

}

async function salvarProfissional(){

  const nome =
  document.getElementById(
    "nomeProfissional"
  ).value.trim();

  const telefone =
  document.getElementById(
    "foneProfissional"
  ).value.trim();

  const arquivo =
  document.getElementById(
    "fotoProfissional"
  ).files[0];

  if(!nome){
    mostrarToast("Informe o nome");
    return;
  }

  let fotoUrl = null;

  if(arquivo){

    const nomeArquivo =
    Date.now() + "_" +
    arquivo.name;

    const { error: erroUpload } =
    await db.storage
    .from("profissionais")
    .upload(
      nomeArquivo,
      arquivo
    );

    if(erroUpload){

      mostrarToast(
        erroUpload.message
      );

      return;
    }

    const { data } =
    db.storage
    .from("profissionais")
    .getPublicUrl(
      nomeArquivo
    );

    fotoUrl =
    data.publicUrl;

  }

  const { error } =
  await db
  .from("profissionais")
  .insert([{


   empresa_id: empresaId,

    nome,

    telefone,

    foto: fotoUrl

  }]);

  if(error){

    mostrarToast(
      error.message
    );

    return;

  }

  document.getElementById(
    "nomeProfissional"
  ).value = "";

  document.getElementById(
    "foneProfissional"
  ).value = "";

  document.getElementById(
    "fotoProfissional"
  ).value = "";

  carregarProfissionais();

}
async function carregarProfissionais(){

  const { data, error } =
  await db
  .from("profissionais")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(error){
    console.log(error);
    return;
  }

  const lista =
  document.getElementById(
    "listaProfissionais"
  );

  lista.innerHTML = "";

  data.forEach(p => {

lista.innerHTML += `

<div
  class="cardProfissional"

  ontouchstart="
  segurarExcluirProf(
    event,
    '${p.id}'
  )"

  ontouchmove="
  cancelarSegurar2()
  "

  ontouchend="
  cancelarSegurar2()
  ">

  <img
    src="${
      p.foto ||
      'https://via.placeholder.com/70'
    }"

    class="fotoProf">

  <div class="infoProf">

    <div class="nomeProf">
      ${p.nome}
    </div>

    <div class="foneProf">
      📞 ${p.telefone || ""}
    </div>

  </div>

</div>

`;

  });

}
let timerExcluirProf = null;



function segurarExcluirProf(
  event,
  id
){

  timerExcluirProf =
  setTimeout(()=>{

    abrirConfirmacao(
      "🗑️ Excluir profissional?",
      async ()=>{

        await excluirProfissional(id);

      }
    );

  },700);

}

function cancelarSegurar2(){

  clearTimeout(
    timerExcluirProf
  );

}

async function excluirProfissional(id){

  const { error } =
  await db
  .from("profissionais")
  .delete()
   .eq("empresa_id", empresaId)
  .eq("id", id);

  if(error){

    mostrarToast(
      error.message
    );

    console.log(error);

    return;

  }

  mostrarToast(
    "✅ Excluído"
  );

  carregarProfissionais();

}



function fecharConfigLista(){

  document.getElementById(
    "modalConfigLista"
  ).style.display = "none";

}
// =========================
// ABRIR VENCIMENTOS
// =========================

async function abrirTelaVencimentos(){

  abrirTela("telaVencimentos");

  await abrirVencimentos();

}

 function abrirPlayerTV(){

  abrirTela("telaPlayer");

  

     iniciarPlayerTV();

    carregarListas();

    abrirListaAutomatica();

  

}






async function abrirFinanceiro(){

  abrirTela("telaFinanceiro");

  const box =
  document.getElementById(
    "financeiroConteudo"
  );

  box.innerHTML = "Carregando...";

  const { data, error } =
  await db
  .from("financeiro")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("vencimento");

  if(error){

    box.innerHTML = error.message;
    return;

  }

  if(!data.length){

    box.innerHTML =
    "Nenhuma cobrança";

    return;
  }

  box.innerHTML = "";

  data.forEach(item => {

    const vencido =
    new Date(item.vencimento)
    < new Date();

    box.innerHTML += `

    <div class="cardTela">

      <strong>
        ${item.nome_cliente}
      </strong>

      <br><br>

      💰 R$ ${item.valor}

      <br>

      📅 ${item.vencimento}

      <br>

      Status:
      ${
        item.status
      }

      <br><br>

      <button
      onclick="
        marcarPago(${item.id})
      ">

        ✅ Marcar Pago

      </button>

    </div>

    `;

  });

}


async function carregarEntradasPlanos(){

  const dataInicial =
    document.getElementById("dataInicialPlanos").value;

  const dataFinal =
    document.getElementById("dataFinalPlanos").value;

  if(!dataInicial || !dataFinal){

    mostrarToast("⚠️ Informe a data inicial e a data final.");

    return;
  }

  if(dataInicial > dataFinal){

    mostrarToast("⚠️ A data inicial não pode ser maior que a data final.");

    return;
  }

  abrirLoading("Consultando planos...");

  const { data, error } = await db
    .from("atendimentos")
    .select(`
      id,
      data,
      valor,
      tipo_cliente,
      tipo_plano,
      forma_pagamento
    `)
    .eq("empresa_id", empresaId)
    .eq("tipo_cliente", "plano")
    .gte("data", dataInicial)
    .lte("data", dataFinal)
    .order("data", { ascending: true });

  fecharLoading();

  if(error){

    console.log(
      "Erro ao buscar entradas de planos:",
      error
    );

    mostrarToast("❌ Erro ao consultar entradas de planos.");

    return;
  }

  console.log(
    "ENTRADAS DE PLANOS:",
    data
  );

    // ==========================
  // 📋 BUSCA PLANOS ATIVOS
  // ==========================

  const { data: planos, error: erroPlanos } = await db
    .from("planos_site")
    .select("id,nome,preco")
    .eq("empresa_id", empresaId)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if(erroPlanos){

    console.log(
      "Erro ao buscar planos:",
      erroPlanos
    );

    mostrarToast("❌ Erro ao carregar planos.");

    return;
  }

  console.log(
    "PLANOS ATIVOS:",
    planos
  );

    // ==========================
  // 💰 MONTA RESULTADO DINÂMICO
  // ==========================

  let totalGeral = 0;

  let html = "";

  planos.forEach(plano => {

    let totalPlano = 0;

    data.forEach(atendimento => {

      if(atendimento.tipo_plano === plano.nome){

        const valor = Number(atendimento.valor) || 0;

        totalPlano += valor;

      }

    });

    totalGeral += totalPlano;

    html += `
      <div class="linhaPlano">

        <span>${plano.nome}</span>

        <strong>
          ${totalPlano.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
          })}
        </strong>

      </div>
    `;

  });


  html += `
    <hr>

    <div class="totalPlanos">

      <span>Total de planos</span>

      <strong>
        ${totalGeral.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </strong>

    </div>
  `;


  document.getElementById(
    "resultadoEntradasPlanos"
  ).innerHTML = html;

}



async function carregarFinanceiro(){

  const box =
  document.getElementById(
    "listaFinanceiro"
  );

  box.innerHTML = "Carregando...";

  const { data, error } =
  await db
  .from("financeiro")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("vencimento", {
    ascending:true
  });

  if(error){

    box.innerHTML = error.message;

    return;
  }

  if(!data.length){

    box.innerHTML =
    "Nenhuma cobrança";

    return;
  }

  box.innerHTML = "";

  data.forEach(item => {

    const vencido =
    item.status !== "pago" &&
    new Date(item.vencimento)
    < new Date();

    box.innerHTML += `

    <div class="cardTela">

      <strong>
        ${item.nome_cliente}
      </strong>

      <br><br>

      💰 R$ ${item.valor}

      <br>

      📅 ${new Date(
        item.vencimento
      ).toLocaleDateString()}

      <br><br>

      <span style="
        color:${
          item.status === "pago"
          ? "#22c55e"
          : vencido
          ? "#ef4444"
          : "#facc15"
        };
        font-weight:700;
      ">

        ${
          item.status === "pago"
          ? "Pago"
          : vencido
          ? "Vencido"
          : "Pendente"
        }

      </span>

    </div>

    `;

  });

}



async function marcarPago(id){

  await db
  .from("financeiro")
  .update({

    status:"pago",

    data_pagamento:
    new Date()

  })
   .eq("empresa_id", empresaId)
  .eq("id", id);

  mostrarToast("Pagamento confirmado");

  abrirFinanceiro();

}


function cobrarWhatsapp(
 telefone,
 nome,
 valor
){

 if(
   !telefone ||
   telefone === "0"
 ){

   mostrarToast(
     "Telefone não cadastrado"
   );

   return;
 }

 const msg =
`Olá ${nome} 👋

Seu plano da barbearia venceu.

💰 Valor: R$ ${valor}

PIX:
CHAVE_PIX_AQUI

Link:
LINK_AQUI`;

 const url =
`https://wa.me/55${telefone}?text=${
 encodeURIComponent(msg)
}`;

 window.open(url,"_blank");

}

const YOUTUBE_API_KEY = "AIzaSyCPxUdGtcFYtXMha7K5E9JaS2khDJXX8LU";

let player;
let playlist = [];
let indiceAtual = 0;

// =========================
// PLAYER YOUTUBE
// =========================

function onYouTubeIframeAPIReady(){

  player = new YT.Player("player",{
    height:"390",
    width:"100%",
    events:{
      onReady:onPlayerReady,
      onStateChange:onPlayerStateChange
    }
  });

}

async function onPlayerStateChange(event){

  if(event.data !== YT.PlayerState.ENDED)
    return;
if(reproduzindoTemporario){

  reproduzindoTemporario =
  false;

  tocarIndice(
    indiceAnterior
  );

  return;

}


  if(tocandoAnuncio){

    tocandoAnuncio = false;

    tocarProxima();

    return;

  }

  contadorMusicas++;

  if(contadorMusicas >= 3){

    contadorMusicas = 0;

    const anuncio =
    await obterAnuncio();

    if(anuncio){

      tocandoAnuncio = true;

      player.loadVideoById(
        anuncio.video_id
      );

      return;

    }

  }

  tocarProxima();

}


async function obterAnuncio(){

  const { data } =
  await db
  .from("anuncios")
  .select("*")
  .eq("empresa_id", empresaId)
  .eq("ativo", true)
  .limit(1);

  return data?.[0];

}
// =========================
// BUSCA YOUTUBE
// =========================

async function buscarYoutube(){

  const termo =
    document.getElementById("buscaYoutube").value.trim();

  if(!termo) return;

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${encodeURIComponent(termo)}&key=${YOUTUBE_API_KEY}`;

  const resp = await fetch(url);
  const dados = await resp.json();

  const resultados =
    document.getElementById("resultadosYoutube");

  resultados.innerHTML = "";

  dados.items.forEach(item => {

    const div = document.createElement("div");
    div.className = "itemResultado";

    const thumb = `https://img.youtube.com/vi/${item.id.videoId}/hqdefault.jpg`;

    div.innerHTML = `
      <div class="videoBox">

        <img class="thumbYoutube" src="${thumb}">

        <div class="infoVideo">

          <strong>${item.snippet.title}</strong>

          <div class="botoesVideo">

            <button class="btnPlayAgora">
              ▶ Reproduzir
            </button>

            <button class="btnAdicionar">
              ➕ Adicionar
            </button>

          </div>

        </div>

      </div>
    `;

    const botoes = div.querySelectorAll("button");

    botoes[0].onclick = () => {
      reproduzirAgora(item.id.videoId);
    };

    botoes[1].onclick = () => {
      adicionarPlaylist(item.id.videoId, item.snippet.title);
    };

    resultados.appendChild(div);

  });

}

// =========================
// PLAYLIST
// =========================

async function adicionarPlaylist(
  videoId,
  titulo
){

  musicaPendente = {
    videoId,
    titulo
  };

  const { data } =
  await db
  .from("listas")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  const lista =
  document.getElementById(
    "listaDestino"
  );

  lista.innerHTML = "";

  data.forEach(item=>{

    const div =
    document.createElement("div");

    div.innerHTML =
    `📁 ${item.nome}`;

    div.onclick = ()=>{

      salvarNaLista(
        item.id
      );

    };

    lista.appendChild(div);

  });

  document.getElementById(
    "modalListas"
  ).style.display = "flex";

}

async function carregarPlaylist(){
// Função antiga.
// Não usar mais com o sistema de pastas.
  const { data } =
  await db
  .from("playlist")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("id");

  playlist =
  data || [];

  renderizarPlaylist();

  if(
    playlist.length &&
    !player.getVideoData()?.video_id
  ){

    tocarIndice(0);

  }

}




async function salvarNaLista(
  listaId
){

  await db
  .from("playlist")
  .insert({
    
    empresa_id: empresaId,

    video_id:
    musicaPendente.videoId,

    titulo:
    musicaPendente.titulo,

    lista_id:
    listaId

  });

  document.getElementById(
    "modalListas"
  ).style.display = "none";

  document.getElementById(
    "resultadosYoutube"
  ).innerHTML = "";

if(listaId === listaAtual){

  await abrirLista(
    listaAtual
  );

}

}



function renderizarPlaylist(){

  const lista =
  document.getElementById(
    "listaPlaylist"
  );

  lista.innerHTML = "";

  playlist.forEach((item,index)=>{

    const div =
    document.createElement("div");

        div.className =
index === indiceAtual
? "itemPlaylist musicaAtual"
: "itemPlaylist";

div.innerHTML = `
  <span
    onclick="tocarDaPlaylist(${index})"
    style="cursor:pointer">

    ${index+1}. ${item.titulo}

  </span>

  <button class="btnRemoverPlaylist">
    ❌
  </button>
`;

    div.querySelector("button")
    .onclick = ()=>{

      removerMusica(
        item.id
      );

    };

    lista.appendChild(div);

  });

}

async function removerMusica(id){

  await db
  .from("playlist")
  .delete()
   .eq("empresa_id", empresaId)
  .eq("id",id);

  await abrirLista(
    listaAtual
  );

}

// =========================
// REPRODUÇÃO
// =========================

async function tocarIndice(
  indice
){

  if(
    indice >= playlist.length
  ) return;

  indiceAtual =
  indice;
  renderizarPlaylist();
  const musica =
  playlist[indice];

  player.loadVideoById(
    musica.video_id
  );

  await db
  .from("player_status")
  .upsert({
    id:1,
    video_id:
    musica.video_id,
    indice:indice
  });

}

async function tocarProxima(){

  if(!playlist.length)
    return;

  if(modoAleatorio){

    let proximo;

    do{

      proximo =
      Math.floor(
        Math.random() *
        playlist.length
      );

    }while(
      playlist.length > 1 &&
      proximo === indiceAtual
    );

    tocarIndice(
      proximo
    );

    return;

  }

  const proximo =
  indiceAtual + 1;

  if(
    proximo >=
    playlist.length
  ){

    await abrirProximaListaOuLoop();

    return;

  }

  tocarIndice(
    proximo
  );

}



function tocarDaPlaylist(indice){

  indiceAtual = indice;
renderizarPlaylist();
  player.loadVideoById(
    playlist[indice].video_id
  );

}
// =========================
// RECUPERAR STATUS
// =========================

async function restaurarPlayer(){

  const { data } =
  await db
  .from("player_status")
  .select("*")
  .eq("empresa_id", empresaId)
  .eq("id",1)
  .single();

  if(!data) return;

  indiceAtual =
  data.indice || 0;

  if(
    playlist[indiceAtual]
  ){

    tocarIndice(
      indiceAtual
    );

  }

}

// =========================
// INICIALIZAÇÃO
// =========================

async function iniciarPlayerTV(){

  await abrirListaAutomatica();

}

function reproduzirAgora(videoId){

  indiceAnterior =
  indiceAtual;

  reproduzindoTemporario =
  true;

  player.loadVideoById(
    videoId
  );
  document.getElementById(
    "resultadosYoutube"
  ).innerHTML = "";


}

function alternarAleatorio(){

  modoAleatorio =
  !modoAleatorio;

  mostrarToast(
   modoAleatorio
    ? "Modo aleatório ligado"
    : "Modo aleatório desligado"
  );
  }
  
  
  
  
function onPlayerReady(){

  document.getElementById(
    "loadingPlayer"
  ).style.display = "none";

}


async function carregarListas(){

  const { data, error } =
  await db
  .from("listas")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(error){

    console.error(error);
    return;

  }

  renderizarListas(
    data || []
  );

}



async function criarLista(nome){

  await db
  .from("listas")
  .insert({
   empresa_id: empresaId,
    nome:nome
  });

  carregarListas();

}

function renderizarListas(listas){

  const container =
  document.getElementById(
    "listaPastas"
  );

  container.innerHTML = "";

  listas.forEach(lista=>{

    const div =
    document.createElement("div");

    div.className =
    "itemPasta";
div.className =
lista.id === listaAtual
? "pastaAtiva"
: "pasta";
    div.innerHTML = `
      <span  style="display:flex;

  align-items:center;

  gap:10px;

  padding:10px;

  border:1px solid #ddd;

  border-radius:8px;

  margin-bottom:8px;

">
        📁 ${lista.nome}
      
      <button style="margin-left:auto;"
      onclick="event.stopPropagation();abrirConfigLista(${lista.id})">
        ⚙️
      </button>
      
      </span>

    `;

    div.onclick = ()=>{

      abrirLista(
        lista.id
      );

    };

    div.ondblclick = ()=>{

      excluirLista(
        lista.id
      );

    };

    container.appendChild(div);

  });

}

function fecharModalListas(){

  document.getElementById(
    "modalListas"
  ).style.display = "none";

}
async function excluirLista(id){

  if(
    !confirm(
      "Excluir esta lista?"
    )
  ) return;

  await db
  .from("listas")
  .delete()
   .eq("empresa_id", empresaId)
  .eq("id",id);

  carregarListas();

}

async function abrirLista(id){

  listaAtual = id;

  await carregarListas();

  const { data } =
  await db
  .from("playlist")
  .select("*")
  .eq("empresa_id", empresaId)
  .eq("lista_id", id)
  .order("id");

  playlist = data || [];

  renderizarPlaylist();

}

function novaLista(){

  document.getElementById(
    "nomeNovaLista"
  ).value = "";

  document.getElementById(
    "modalNovaLista"
  ).style.display = "flex";

}

async function salvarNovaLista(){

  const nome =
  document.getElementById(
    "nomeNovaLista"
  ).value.trim();

  if(!nome)
    return;

  await db
  .from("listas")
  .insert({
    
    empresa_id: empresaId,
    nome:nome
  });

  fecharNovaLista();

  carregarListas();

}

function fecharNovaLista(){

  document.getElementById(
    "modalNovaLista"
  ).style.display = "none";

}

async function abrirListaAutomatica(){

  let diaHoje =
  new Date().getDay();

  if(diaHoje === 0){

    diaHoje = 7;

  }

  const { data } =
  await db
  .from("listas")
  .select("*")
  .eq("empresa_id", empresaId)
  .eq("dia_semana", diaHoje)
  .order("id");

  listasDoDia =
  data || [];

  indiceListaAtual = 0;

  if(
    listasDoDia.length
  ){

    await abrirLista(
      listasDoDia[0].id
    );

  }else{

    await abrirLista(1);

  }

  if(
    playlist.length
  ){

    tocarIndice(0);

  }

}

async function abrirProximaListaOuLoop(){

  if(
    listasDoDia.length <= 1
  ){

    tocarIndice(0);
    return;

  }

  indiceListaAtual++;

  if(
    indiceListaAtual >=
    listasDoDia.length
  ){

    indiceListaAtual = 0;

  }

  await abrirLista(
    listasDoDia[
      indiceListaAtual
    ].id
  );

  tocarIndice(0);

}
async function excluirLista(id){

  listaExcluirId = id;

  const { data } =
  await db
  .from("listas")
  .select("nome")
  .eq("empresa_id", empresaId)
  .eq("id", id)
  .single();

  document.getElementById(
    "nomeListaExcluir"
  ).innerText =
   "📁 " + data.nome;

  document.getElementById(
    "modalExcluirLista"
  ).style.display =
  "flex";

}
async function confirmarExcluirLista(){

  await db
  .from("listas")
  .delete()
   .eq("empresa_id", empresaId)
  .eq("id", listaExcluirId);

  fecharExcluirLista();

  carregarListas();

}
function fecharExcluirLista(){

  document.getElementById(
    "modalExcluirLista"
  ).style.display =
  "none";

}
function abrirPlayerExistente(){

  abrirTela("telaPlayer");

  document.getElementById(
    "bolhaPlayer"
  ).style.display = "none";

}
function fecharPlayerTV(){

  fecharTela("telaPlayer");

  document.getElementById(
    "bolhaPlayer"
  ).style.display = "flex";

}
function abrirConfig(){
  abrirTela("telaConfig");
}




function abrirConfigPlanos(){
document.getElementById("telaConfigPlanos").style.display = "block";
  
}
function abrirConfigPopup(){
document.getElementById("telaConfigPopup").style.display = "block";
  
}

function fecharTelaConfigPopup(){

  const tela = document.getElementById("telaConfigPopup");

  if(!tela){
    console.log("TelaConfig Popup não encontrada");
    return;
  }
   tela.style.display = "none";
}

function fecharTelaConfigPlanos(){

  const tela = document.getElementById("telaConfigPlanos");

  if(!tela){
    console.log("TelaConfigEmpresaPlanos não encontrada");
    return;
  }

  tela.style.display = "none";
}

function abrirConfigEmpresa(){
document.getElementById("telaConfigEmpresa").style.display = "block";
  carregarConfiguracoes();
}

function fecharTelaConfig(){

  const tela = document.getElementById("telaConfigEmpresa");

  if(!tela){
    console.log("TelaConfigEmpresa não encontrada");
    return;
  }

  tela.style.display = "none";
}

async function getConfiguracao(){

  const { data, error } = await db
    .from("configuracoes_empresa")
    .select("*")
    .eq("empresa_id", empresaId)
    .limit(1)
    .maybeSingle();

  if(error || !data){
    console.log(error);
    return null;
  }

  return data;
}

async function carregarConfiguracoes(){

  const { data, error } = await db
    .from("configuracoes_empresa")
    .select("*")
    .eq("empresa_id", empresaId)
    .limit(1)
    .single();

  if(error || !data){
    console.log(error);
    return;
  }

  document.getElementById("nomeEmpresa").value = data.nome_empresa || "";
  document.getElementById("chavePix").value = data.chave_pix || "";
  document.getElementById("tipoPix").value = data.tipo_pix || "";
  document.getElementById("nomeRecebedor").value = data.nome_recebedor || "";
  document.getElementById("whatsappConfig").value = data.whatsapp || "";
  document.getElementById("emailConfig").value = data.email || "";
  document.getElementById("linkPagamento").value = data.link_pagamento || "";
 
}

async function salvarConfiguracoes(){

  const nome_empresa = document.getElementById("nomeEmpresa").value;
  const chave_pix = document.getElementById("chavePix").value;
  const tipo_pix = document.getElementById("tipoPix").value;
  const nome_recebedor = document.getElementById("nomeRecebedor").value;
  const whatsapp = document.getElementById("whatsappConfig").value;
  const email = document.getElementById("emailConfig").value;
  const link_pagamento = document.getElementById("linkPagamento").value;

  // 🔎 busca se já existe configuração
  const { data, error: err1 } = await db
    .from("configuracoes_empresa")
    .select("id")
    .eq("empresa_id", empresaId)
    .limit(1)
    .maybeSingle();

  if(err1){
    console.log(err1);
    alert(err1.message);
    return;
  }

  // 🟢 SE NÃO EXISTE → INSERE
  if(!data){

    const { error } = await db
      .from("configuracoes_empresa")
      .insert([{
        empresa_id: empresaId,
        nome_empresa,
        chave_pix,
        tipo_pix,
        nome_recebedor,
        whatsapp,
        email,
        link_pagamento
      }]);

    if(error){
      console.log(error);
      alert(error.message);
      return;
    }

  } else {

    // 🟡 SE EXISTE → ATUALIZA
    const { error } = await db
      .from("configuracoes_empresa")
      .update({
        nome_empresa,
        chave_pix,
        tipo_pix,
        nome_recebedor,
        whatsapp,
        email,
        link_pagamento
      })
       .eq("empresa_id", empresaId)
      .eq("id", data.id);

    if(error){
      console.log(error);
      alert(error.message);
      return;
    }
  }

  alert("Configurações salvas com sucesso");
}


async function salvarPlano(){

  const nome =
  document.getElementById("planoNome").value.trim();

  const subtitulo =
  document.getElementById("planoSubtitulo").value.trim();

  const descricao =
  document.getElementById("planoDescricao").value.trim();

  const preco =
  document.getElementById("planoPreco").value.trim();

  const quantidadeCortes =
  Number(
    document.getElementById(
      "planoQuantidadeCortes"
    ).value
  ) || 0;

  const linkPagamento =
  document.getElementById("planoLinkPagamento").value.trim();

  const linkDetalhes =
  document.getElementById("planoLinkDetalhes").value.trim();

  const ordem =
  Number(document.getElementById("planoOrdem").value) || 0;

  const ativo =
  document.getElementById("planoAtivo").checked;

  // Validações

  if(nome === ""){
    alert("Informe o nome do plano.");
    return;
  }

  if(subtitulo === ""){
    alert("Informe o subtítulo.");
    return;
  }

  if(descricao === ""){
    alert("Informe a descrição do plano.");
    return;
  }

  if(preco === ""){
    alert("Informe o preço.");
    return;
  }

if(quantidadeCortes < 0){
  alert("Informe uma quantidade de cortes válida.");
  return;
}

  if(linkPagamento === ""){
    alert("Informe o link de pagamento.");
    return;
  }

if(planoEditando){

    const { error } = await db
    .from("planos_site")
    .update({

        nome,
        subtitulo,
        descricao,
        preco,
    quantidade_cortes: quantidadeCortes,
    link_pagamento: linkPagamento,
        link_detalhes: linkDetalhes,
        ordem,
        ativo

    })
     .eq("empresa_id", empresaId)
    .eq("id", planoEditando);

    if(error){
        alert(error.message);
        return;
    }

    alert("Plano atualizado!");

    planoEditando = null;

}else{

    const { error } = await db
    .from("planos_site")
    .insert([{
       empresa_id: empresaId,
        nome,
        subtitulo,
        descricao,
        preco,
quantidade_cortes: quantidadeCortes,
link_pagamento: linkPagamento,
        link_detalhes: linkDetalhes,
        ordem,
        ativo

    }]);

    if(error){
        alert(error.message);
        return;
    }

    alert("Plano salvo!");

}

  limparFormularioPlano();

  carregarPlanos();

}

function limparFormularioPlano(){

  document.getElementById("planoNome").value = "";
  document.getElementById("planoSubtitulo").value = "";
  document.getElementById("planoDescricao").value = "";
  document.getElementById("planoPreco").value = "";
  document.getElementById("planoLinkPagamento").value = "";
  document.getElementById("planoLinkDetalhes").value = "";
  document.getElementById("planoOrdem").value = "";
  document.getElementById("planoAtivo").checked = true;
  carregarPlanos();
}

async function carregarPlanos(){

  

  const { data, error } = await db
  .from("planos_site")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("ordem");

  if(error){
    console.log(error);
    return;
  }

  document.getElementById("totalPlanos").textContent =
  `(${data.length})`;

  const lista =
  document.getElementById("listaPlanos");

  lista.innerHTML = "";

  data.forEach(plano=>{

    lista.innerHTML += `
     <div
class="cardPlano"
onclick="editarPlano(${plano.id})"
ontouchstart="iniciarExcluirPlano(${plano.id})"
ontouchend="cancelarExcluirPlano()"
ontouchcancel="cancelarExcluirPlano()"

onmousedown="iniciarExcluirPlano(${plano.id})"
onmouseup="cancelarExcluirPlano()"
onmouseleave="cancelarExcluirPlano()">



        <div class="tituloPlano">
          ${plano.nome}
        </div>

        <div class="subPlano">
          ${plano.subtitulo}
        </div>

        <div class="precoPlano">
          ${plano.preco}
        </div>

        <div class="subPlano">
  ✂️${plano.quantidade_cortes === 0
  ? "Ilimitado"
  : (plano.quantidade_cortes || 4) + " cortes por mês"
}
</div>

        <div class="statusPlano">
          ${plano.ativo ? "🟢 Ativo" : "🔴 Inativo"}
        </div>

      </div>
    `;

  });

}





async function editarPlano(id){

    const { data, error } = await db
    .from("planos_site")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("id", id)
    .single();

    if(error) return;

    planoEditando = id;

    document.getElementById("planoNome").value = data.nome;
    document.getElementById("planoSubtitulo").value = data.subtitulo;
    document.getElementById("planoDescricao").value = data.descricao;
    document.getElementById("planoPreco").value = data.preco;

  document.getElementById("planoQuantidadeCortes").value =
  data.quantidade_cortes ?? 4;

  
    document.getElementById("planoLinkPagamento").value = data.link_pagamento;
    document.getElementById("planoLinkDetalhes").value = data.link_detalhes;
    document.getElementById("planoOrdem").value = data.ordem;
    document.getElementById("planoAtivo").checked = data.ativo;

    window.scrollTo({
        top:0,
        behavior:"smooth"
    });

}


function iniciarExcluirPlano(id){

    tempoExcluirPlano = setTimeout(()=>{

        if(confirm("Deseja excluir este plano?")){

            excluirPlano(id);

        }

    },3000);

}

function cancelarExcluirPlano(){

    clearTimeout(tempoExcluirPlano);

}

async function excluirPlano(id){

    const { error } = await db
    .from("planos_site")
    .delete()
     .eq("empresa_id", empresaId)
    .eq("id",id);

    if(error){

        alert(error.message);
        return;

    }

    if(planoEditando == id){

        planoEditando = null;
        limparFormularioPlano();

    }

    carregarPlanos();

}

async function salvarAviso(){

  const aviso_ativo =
  document.getElementById(
    "avisoAtivo"
  ).checked;

  const aviso_titulo =
  document.getElementById(
    "avisoTitulo"
  ).value.trim();

  const aviso_texto =
  document.getElementById(
    "avisoTexto"
  ).value.trim();

  const aviso_botao =
  document.getElementById(
    "avisoBotao"
  ).value.trim() || "Entendi";

  const { error } = await db
  .from("configuracoes_empresa")
  .update({

    aviso_ativo,

    aviso_titulo,

    aviso_texto,

    aviso_botao

  })
   .eq("empresa_id", empresaId)
  .eq("id", 1);

  if(error){
    console.log(error);
    alert("Erro ao salvar.");
    return;
  }

  mostrarToast("Aviso salvo com sucesso!");

}

async function carregarAviso(){

  const { data, error } = await db
  .from("configuracoes_empresa")
  .select(`
    aviso_ativo,
    aviso_titulo,
    aviso_texto,
    aviso_botao
  `)
  .eq("empresa_id", empresaId)
  .eq("id",1)
  .single();

  if(error) return;

  document.getElementById("avisoAtivo").checked =
  data.aviso_ativo;

  document.getElementById("avisoTitulo").value =
  data.aviso_titulo || "";

  document.getElementById("avisoTexto").value =
  data.aviso_texto || "";

  document.getElementById("avisoBotao").value =
  data.aviso_botao || "Entendi";

}


async function salvarLembrete(){

  const barbeiro =
  document.getElementById("lembreteBarbeiro").value;

  const data_inicial =
  document.getElementById("lembreteData").value;

  const mensagem =
  document.getElementById("lembreteMensagem").value.trim();

  const ativo =
  document.getElementById("lembreteAtivo").checked;

  const tipo_repeticao =
  document.getElementById("tipoRepeticao").value;

  const intervalo_dias =
  Number(
    document.getElementById("intervaloDias").value || 0
  );

  if(!data_inicial){
    mostrarToast("Escolha a data.");
    return;
  }

  if(mensagem === ""){
    mostrarToast("Digite o lembrete.");
    return;
  }

  const { error } = await db
  .from("lembretes")
  .insert([{
   empresa_id: empresaId,
    barbeiro,
    data_inicial,
    mensagem,
    ativo,
    tipo_repeticao,
    intervalo_dias

  }]);

  if(error){
    console.log(error);
    mostrarToast("Erro ao salvar.");
    return;
  }

  mostrarToast("Lembrete salvo.");

 document.getElementById("lembreteData").value =
new Date().toISOString().split("T")[0];

  document.getElementById("lembreteMensagem").value = "";
  document.getElementById("tipoRepeticao").value = "nenhum";
  document.getElementById("intervaloDias").value = "";
  document.getElementById("lembreteAtivo").checked = true;
  document.getElementById("boxIntervalo").style.display = "none";

  carregarLembretes();

}

async function carregarLembretes(){

  const lista =
  document.getElementById("listaLembretes");

  lista.innerHTML = "Carregando...";

  const { data, error } = await db
  .from("lembretes")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("data_inicial", { ascending: true });

  if(error){

    console.log(error);

    lista.innerHTML =
    "Erro ao carregar lembretes.";

    return;
  }

  if(!data || data.length === 0){

    lista.innerHTML =
    "Nenhum lembrete cadastrado.";

    return;
  }

  lista.innerHTML = "";

  data.forEach(item => {

lista.innerHTML += `

<div class="cardLembrete">

  <div class="topoCard">

    <strong>${item.barbeiro}</strong>

  <button
class="status"
onclick="alternarLembrete(${item.id}, ${item.ativo})">

${item.ativo ? "🟢 Ativo" : "🔴 Desativado"}

</button>

  </div>

  <div class="item" style="color:#d1d5db">
  📅 ${item.data_inicial.split("-").reverse().join("/")}
  </div>

  <div class="item" style="color:#d1d5db">
    📝 ${item.mensagem}
  </div>

  <div class="item" style="color:#d1d5db">
    🔁 ${
      item.tipo_repeticao === "nenhum"
        ? "Não repetir"
      : item.tipo_repeticao === "mensal"
        ? "Mensal"
      : `A cada ${item.intervalo_dias} dias`
    }
  </div>

  <div class="acoes">

    <button onclick="excluirLembrete(${item.id})">
      🗑 Excluir
    </button>

  </div>

</div>

`;

  });

}

async function excluirLembrete(id){

  if(!confirm("Excluir lembrete?"))
    return;

  await db
  .from("lembretes")
  .delete()
   .eq("empresa_id", empresaId)
  .eq("id", id);

  carregarLembretes();

}

async function carregarBarbeirosLembrete(){

  const select =
  document.getElementById("lembreteBarbeiro");

  const { data, error } = await db
  .from("profissionais")
  .select("*")
  .eq("empresa_id", empresaId)
  .order("nome");

  if(error){
    console.log(error);
    return;
  }

  select.innerHTML = `
    <option value="Todos">
      Todos os barbeiros
    </option>
  `;

  data.forEach(prof => {

    select.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });

}


function alterarTipoRepeticao(){

  const tipo =
  document.getElementById("tipoRepeticao").value;

  document.getElementById("boxIntervalo").style.display =
    tipo === "intervalo"
      ? "block"
      : "none";

}

async function alternarLembrete(id, ativo){

  await db
  .from("lembretes")
  .update({
    ativo: !ativo
  })
   .eq("empresa_id", empresaId)
  .eq("id", id);

  carregarLembretes();

}
function mostrarPopupLembrete(texto){

  document.getElementById(
    "textoLembrete"
  ).innerText = texto;

  document.getElementById(
    "popupLembrete"
  ).classList.add("ativo");

}

function fecharPopupLembrete(){

  document.getElementById(
    "popupLembrete"
  ).classList.remove("ativo");

}

async function verificarLembretesHoje(){



  const hoje = dataInput.value;

  const barbeiro = filtro.value;

  const { data, error } = await db
  .from("lembretes")
  .select("*")
  .eq("empresa_id", empresaId)
  .eq("ativo", true);

  if(error){
    console.log(error);
    return;
  }

  const lembretes = [];

  data.forEach(item=>{

    // barbeiro
    if(
      item.barbeiro !== "Todos" &&
      item.barbeiro !== barbeiro
    ) return;

 // sem repetição
if(item.tipo_repeticao === "nenhum"){

  if(item.data_inicial === hoje){
    lembretes.push("• " + item.mensagem);
  }

}

// mensal
else if(item.tipo_repeticao === "mensal"){

  const diaHoje =
  hoje.split("-")[2];

  const diaInicial =
  item.data_inicial.split("-")[2];

  if(diaHoje === diaInicial){
    lembretes.push("• " + item.mensagem);
  }

}

// intervalo de dias
else if(item.tipo_repeticao === "intervalo"){

  const dataInicial =
  new Date(item.data_inicial);

  const dataHoje =
  new Date(hoje);

  const diferencaDias =
  Math.floor(
    (dataHoje - dataInicial) /
    (1000 * 60 * 60 * 24)
  );

  if(
    diferencaDias >= 0 &&
    diferencaDias % item.intervalo_dias === 0
  ){
    lembretes.push("• " + item.mensagem);
  }

}
    
    

  });

  if(lembretes.length){

    mostrarPopupLembrete(
      lembretes.join("\n\n")
    );

  }
  
  
  
  

}
carregarClientes();

carregarPlanos();
carregarProfissionaisFiltro();
carregarProfissionaisSelect();
carregarProfissionaisCalendario();
carregarAviso();
atualizarBadge();
carregarBarbeirosLembrete();

setInterval(() => {

  carregarHoje();

}, 1800000);


setTimeout(()=>{

iniciarFiltro() 

 setTimeout(async () => {

  await verificarLembretesHoje();
   document
  .getElementById("bootLoading")
  .classList.add("hide");

   

}, 1000);

},2000);




document.getElementById("sidebar").addEventListener("mousemove", iniciarAutoFecharMenu);
document.getElementById("sidebar").addEventListener("click", iniciarAutoFecharMenu);


