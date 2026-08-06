// Alterna a classe no body e salva a preferência
function toggleTema() {
  const body = document.body;
  const btnTema = document.getElementById('btnTema');
  
  // Alterna a classe 'light-theme' que definimos no CSS
  body.classList.toggle('light-theme');
  const eModoClaro = body.classList.contains('light-theme');

  // Troca o ícone do botão
  if (btnTema) {
    btnTema.textContent = eModoClaro ? '☀️' : '🌙';
  }

  // Guarda a escolha do usuário no navegador
  localStorage.setItem('temaSistema', eModoClaro ? 'claro' : 'escuro');
}

// Aplica o tema salvo assim que a página carrega
function carregarTemaSalvo() {
  const temaSalvo = localStorage.getItem('temaSistema');
  const btnTema = document.getElementById('btnTema');

  if (temaSalvo === 'claro') {
    document.body.classList.add('light-theme');
    if (btnTema) btnTema.textContent = '☀️';
  } else {
    document.body.classList.remove('light-theme');
    if (btnTema) btnTema.textContent = '🌙';
  }
}

// Executa automaticamente ao abrir o sistema
document.addEventListener('DOMContentLoaded', carregarTemaSalvo);












// Abrir o Modal e preencher data/hora atuais por padrão
function abrirModalDespesa() {
  
  carregarProfissionaisDespesa();
  
  const modal = document.getElementById("modalDespesa");
  if (!modal) return;

const hoje = new Date();

modalData.value =
hoje.getFullYear() +
"-" +
String(hoje.getMonth()+1).padStart(2,"0") +
"-" +
String(hoje.getDate()).padStart(2,"0");
  document.getElementById("modalHora").value = hoje.toTimeString().substring(0, 5);

  modal.style.display = "flex";
}


const modalData =
document.getElementById("modalData");

const modalHora =
document.getElementById("modalHora");

const modalValor =
document.getElementById("modalValor");

const modalCategoria =
document.getElementById("modalCategoria");

const modalDescricao =
document.getElementById("modalDescricao");

const modalPagamento =
document.getElementById("modalPagamento");

const barbeiroDespesa =
document.getElementById("barbeiroDespesa");

const modalObservacao =
document.getElementById("modalObservacao");




// Fechar o Modal
function fecharModalDespesa() {
  const modal = document.getElementById("modalDespesa");
  if (modal) modal.style.display = "none";
  document.getElementById("formDespesa").reset();
}

async function salvarDespesa(event){

  event.preventDefault();

  abrirLoading("Salvando despesa...");

  const empresaId =
  Number(localStorage.getItem("empresa_id"));

  const dados = {

    empresa_id: empresaId,

    data:
    modalData.value,

    hora:
    modalHora.value,

    categoria:
    modalCategoria.value,

    descricao:
    modalDescricao.value.trim() ||
    "Sem descrição",

    valor:
    Number(modalValor.value || 0),

    forma_pagamento:
    modalPagamento.value,

    barbeiro:
    barbeiroDespesa.value,

    observacao:
    modalObservacao.value.trim()

  };

  const { error } = await db
  .from("despesas")
  .insert([dados]);

  fecharLoading();

  if(error){

    mostrarToast(error.message);

    return;

  }

  mostrarToast("✅ Despesa salva");

  fecharModalDespesa();

  document.getElementById("formDespesa").reset();

  carregarDespesas();

}


 

async function carregarDespesas(){

  abrirLoading("Carregando...");

  const empresaId =
  Number(localStorage.getItem("empresa_id"));


let query = db
.from("despesas")
.select("*")
.eq("empresa_id", empresaId)
.eq(
  "data",
  dataInput.value
)
.order("hora",{ascending:false});


  // FILTRO POR BARBEIRO
  const filtro =
  document.getElementById(
    "filtroBarbeiroDespesa"
  );

  if(
    filtro &&
    filtro.value !== "Todos"
  ){

    query = query.eq(
      "barbeiro",
      filtro.value
    );

  }


  // BUSCA POR DESCRIÇÃO
  const busca =
  document.getElementById(
    "buscaDespesa"
  );

  if(
    busca &&
    busca.value.trim()
  ){

    query = query.ilike(
      "descricao",
      "%" +
      busca.value.trim() +
      "%"
    );

  }


  const { data, error } =
  await query;


  if(error){

    fecharLoading();

    mostrarToast(
      error.message
    );

    console.log(error);

    return;

  }


  const lista =
  document.getElementById(
    "listaDespesas"
  );


  if(!lista){

    fecharLoading();

    console.log(
      "listaDespesas não encontrada"
    );

    return;

  }


  lista.innerHTML = "";
let categorias = {};
let totalMes = 0;

  let total = 0;


  data.forEach(item=>{
totalMes += Number(item.valor);


if(!categorias[item.categoria]){
  categorias[item.categoria] = 0;
}


categorias[item.categoria] +=
Number(item.valor);

    total += Number(
      item.valor
    );


    lista.innerHTML += `

<div class="cardDespesa">

  <div class="topoDespesa">

    <strong>
      ${item.categoria}
    </strong>

    <span>
      R$ ${
        Number(item.valor)
        .toFixed(2)
        .replace(".",",")
      }
    </span>

  </div>


  <div>
    📅 ${item.data} • ${item.hora}
  </div>


  <div>
    👤 ${item.barbeiro}
  </div>


  <div>
    📝 ${item.descricao}
  </div>


  <div class="acoesDespesa">

    <button onclick="editarDespesa(${item.id})">
      ✏️
    </button>

    <button onclick="excluirDespesa(${item.id})">
      🗑️
    </button>

  </div>

</div>

`;

  });
gastosDia.textContent =
"R$ " +
total
.toFixed(2)
.replace(".",",");


quantidadeGastos.textContent =
data.length;


gastosMes.textContent =
"R$ " +
totalMes
.toFixed(2)
.replace(".",",");


mediaGastos.textContent =
"R$ " +
(
 totalMes /
 new Date().getDate()
)
.toFixed(2)
.replace(".",",");

const resumo =
document.getElementById(
"resumoCategorias"
);


resumo.innerHTML = "";


Object.keys(categorias)
.forEach(cat=>{


resumo.innerHTML += `

<div class="linhaCategoria">

<span>
${cat}
</span>

<strong>
R$ ${
categorias[cat]
.toFixed(2)
.replace(".",",")
}
</strong>

</div>

`;


});


  const totalElement =
  document.getElementById(
    "gastoHoje"
  );


  if(totalElement){

    totalElement.textContent =
    "R$ " +
    total
    .toFixed(2)
    .replace(".",",");

  }


  fecharLoading();


}



async function carregarProfissionaisDespesa(){

  const empresaId =
  Number(localStorage.getItem("empresa_id"));

  const select =
  document.getElementById("barbeiroDespesa");

  if(!select) return;

  select.innerHTML =
  '<option value="Todos">Todos</option>';

  const { data, error } = await db
    .from("profissionais")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome");

  if(error) return;

  data.forEach(prof=>{

    select.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });

}

async function carregarProfissionaisFiltroDespesa(){

  const empresaId =
  Number(localStorage.getItem("empresa_id"));

  const filtro =
  document.getElementById(
    "filtroBarbeiroDespesa"
  );

  filtro.innerHTML =
  '<option value="Todos">Todos os barbeiros</option>';

  const { data, error } = await db
    .from("profissionais")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("nome");

  if(error) return;

  data.forEach(prof=>{

    filtro.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });

}