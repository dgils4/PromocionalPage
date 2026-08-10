// 

let despesaEditandoId = null;


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
function abrirModalDespesa(){

  const modal =
    document.getElementById("modalDespesa");

  if(!modal) return;

  // Limpa qualquer edição anterior
  limparModalDespesa();

  // Restaura título
  const titulo =
    document.querySelector(
      "#modalDespesa .modal-header h2"
    );

  if(titulo){
    titulo.textContent =
      "Lançar Nova Despesa";
  }

  // Restaura botão
  const botao =
    document.querySelector(
      "#modalDespesa .btn-salvar"
    );

  if(botao){
    botao.textContent =
      "Salvar Despesa";
  }

  // Carrega profissionais
  carregarProfissionaisDespesa();

  // Data atual
  const hoje = new Date();

  modalData.value =
    hoje.getFullYear() +
    "-" +
    String(
      hoje.getMonth() + 1
    ).padStart(2,"0") +
    "-" +
    String(
      hoje.getDate()
    ).padStart(2,"0");

  // Hora atual
  modalHora.value =
    hoje.toTimeString()
    .substring(0,5);

  modal.style.display =
    "flex";

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
function fecharModalDespesa(){

  const modal =
    document.getElementById("modalDespesa");

  limparModalDespesa();

  if(modal){
    modal.style.display = "none";
  }

  const titulo =
    document.querySelector(
      "#modalDespesa .modal-header h2"
    );

  if(titulo){
    titulo.textContent =
      "Lançar Nova Despesa";
  }

  const botao =
    document.querySelector(
      "#modalDespesa .btn-salvar"
    );

  if(botao){
    botao.textContent =
      "Salvar Despesa";
  }

}

async function salvarDespesa(event){

  event.preventDefault();

  abrirLoading(
    despesaEditandoId
      ? "Salvando alterações..."
      : "Salvando despesa..."
  );

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


  let error = null;


  // =========================
  // EDITANDO
  // =========================

  if(despesaEditandoId){

    const resposta =
      await db
      .from("despesas")
      .update(dados)
      .eq("id", despesaEditandoId)
      .eq("empresa_id", empresaId);

    error = resposta.error;

  }


  // =========================
  // NOVA DESPESA
  // =========================

  else{

    const resposta =
      await db
      .from("despesas")
      .insert([dados]);

    error = resposta.error;

  }

carregarDespesas();
  fecharLoading();


  if(error){

    mostrarToast(
      error.message
    );

    return;

  }


  if(despesaEditandoId){

    mostrarToast(
      "✅ Despesa atualizada"
    );

  }else{

    mostrarToast(
      "✅ Despesa salva"
    );

  }


  // Volta para modo nova despesa
  despesaEditandoId = null;


  fecharModalDespesa();


  document
    .getElementById("formDespesa")
    .reset();


  carregarDespesas();

}


 

async function carregarDespesas(){

  abrirLoading("Carregando...");

  const empresaId =
    Number(localStorage.getItem("empresa_id"));

const campoData =
  document.getElementById(
    "dataDespesa"
  );

if(!campoData){

  fecharLoading();

  console.log(
    "Campo dataDespesa não encontrado"
  );

  return;

}


// Se ainda estiver vazio,
// coloca a data de hoje.

if(!campoData.value){

  const hoje =
    new Date();

  campoData.value =
    hoje.getFullYear() +
    "-" +
    String(
      hoje.getMonth() + 1
    ).padStart(2,"0") +
    "-" +
    String(
      hoje.getDate()
    ).padStart(2,"0");

}


const dataSelecionada =
  campoData.value;

  // ==========================================
  // DATA BASE
  // ==========================================

  const dataBase =
    new Date(
      dataSelecionada + "T00:00:00"
    );

  const ano =
    dataBase.getFullYear();

  const mes =
    dataBase.getMonth();

  const diaSelecionado =
    dataBase.getDate();


  // ==========================================
  // PRIMEIRO E ÚLTIMO DIA DO MÊS
  // ==========================================

  const inicioMes =
    `${ano}-${String(mes + 1).padStart(2,"0")}-01`;

  const ultimoDia =
    new Date(
      ano,
      mes + 1,
      0
    ).getDate();

  const fimMes =
    `${ano}-${String(mes + 1).padStart(2,"0")}-${String(ultimoDia).padStart(2,"0")}`;


  // ==========================================
  // FILTRO DE BARBEIRO
  // ==========================================

  const filtro =
    document.getElementById(
      "filtroBarbeiroDespesa"
    );

  const barbeiroSelecionado =
    filtro
      ? filtro.value
      : "Todos";


  // ==========================================
  // BUSCA AS DESPESAS DO DIA
  // ==========================================

  let query = db
    .from("despesas")
    .select("*")
    .eq("empresa_id", empresaId)
    .eq("data", dataSelecionada)
    .order("hora", {
      ascending: false
    });


  // Filtro de barbeiro na tabela

  if(
    barbeiroSelecionado !== "Todos"
  ){

    query = query.eq(
      "barbeiro",
      barbeiroSelecionado
    );

  }


  // ==========================================
  // BUSCA POR DESCRIÇÃO
  // ==========================================

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


  // ==========================================
  // EXECUTA BUSCA DO DIA
  // ==========================================

  const {
    data,
    error
  } = await query;


  if(error){

    fecharLoading();

    mostrarToast(
      error.message
    );

    console.log(error);

    return;

  }


  // ==========================================
  // BUSCA TODAS AS DESPESAS DO MÊS
  // ==========================================

  const {
    data: despesasMes,
    error: erroMes
  } = await db

    .from("despesas")

    .select(
      "valor, barbeiro, data, categoria"
    )

    .eq(
      "empresa_id",
      empresaId
    )

    .gte(
      "data",
      inicioMes
    )

    .lte(
      "data",
      fimMes
    );


  if(erroMes){

    fecharLoading();

    mostrarToast(
      erroMes.message
    );

    console.log(erroMes);

    return;

  }


  // ==========================================
  // FILTRA O MÊS PELO BARBEIRO
  // ==========================================

  let despesasMesFiltradas =
    despesasMes || [];


  if(
    barbeiroSelecionado !== "Todos"
  ){

    despesasMesFiltradas =
      despesasMesFiltradas.filter(
        item =>
          item.barbeiro ===
          barbeiroSelecionado
      );

  }


  // ==========================================
  // LISTA DA TABELA
  // ==========================================

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


  // ==========================================
  // TOTAIS
  // ==========================================

  let totalDia = 0;

  let totalMes = 0;

  let categorias = {};


  // ==========================================
  // DESPESAS DO DIA
  // ==========================================

  data.forEach(item => {

    const valor =
      Number(item.valor);


    totalDia += valor;


    // Categoria




    // ========================================
    // LINHA DA TABELA
    // ========================================

    lista.innerHTML += `

      <div class="cardDespesa">

        <div class="topoDespesa">

          <strong>
            ${item.categoria}
          </strong>

          <span>
            R$
            ${valor
              .toFixed(2)
              .replace(".",",")}
          </span>

        </div>

        <div>
          📅 ${item.data}
          •
          ${item.hora || ""}
        </div>

        <div>
          👤 ${item.barbeiro || ""}
        </div>

        <div>
          📝 ${item.descricao || ""}
        </div>

        <div>
          💳 ${item.forma_pagamento || ""}
        </div>

        <div class="acoesDespesa">

          <button
            onclick="editarDespesa(${item.id})">

            ✏️

          </button>

          <button
            onclick="excluirDespesa(${item.id})">

            🗑️

          </button>

        </div>

      </div>

    `;

  });


  // ==========================================
  // TOTAL DO MÊS
  // ==========================================

  despesasMesFiltradas.forEach(item => {

    totalMes +=
      Number(item.valor);

  });// ==========================================
// GASTOS POR CATEGORIA DO MÊS
// ==========================================



despesasMesFiltradas.forEach(item => {

  const categoria =
    item.categoria &&
    item.categoria.trim()
      ? item.categoria.trim()
      : "Outros";

  const valor =
    Number(item.valor) || 0;

  if(!categorias[categoria]){
    categorias[categoria] = 0;
  }

  categorias[categoria] += valor;

});


  // ==========================================
  // GASTOS DO DIA
  // ==========================================

  const gastosDia =
    document.getElementById(
      "gastosDia"
    );

  if(gastosDia){

    gastosDia.textContent =
      "R$ " +
      totalDia
        .toFixed(2)
        .replace(".",",");

  }


  // ==========================================
  // QUANTIDADE DE DESPESAS
  // ==========================================

  const quantidadeGastos =
    document.getElementById(
      "quantidadeGastos"
    );

  if(quantidadeGastos){

    quantidadeGastos.textContent =
      data.length;

  }


  // ==========================================
  // GASTOS DO MÊS
  // ==========================================

  const gastosMes =
    document.getElementById(
      "gastosMes"
    );

  if(gastosMes){

    gastosMes.textContent =
      "R$ " +
      totalMes
        .toFixed(2)
        .replace(".",",");

  }


  // ==========================================
  // MÉDIA DIÁRIA
  // ==========================================

  const mediaGastos =
    document.getElementById(
      "mediaGastos"
    );

  if(mediaGastos){

    const media =
      totalMes /
      Math.max(
        1,
        diaSelecionado
      );

    mediaGastos.textContent =
      "R$ " +
      media
        .toFixed(2)
        .replace(".",",");

  }


  // ==========================================
  // RESUMO POR CATEGORIA
  // ==========================================

  const resumo =
  document.getElementById(
    "resumoCategorias"
  );

if(resumo){

  resumo.innerHTML = "";

  Object.entries(categorias)
    .forEach(([categoria, valor]) => {

      resumo.innerHTML += `

        <div class="linhaCategoria">

          <span>
            ${categoria}
          </span>

          <strong>
            R$ ${valor
              .toFixed(2)
              .replace(".",",")}
          </strong>

        </div>

      `;

    });


  }


  // ==========================================
  // FINAL
  // ==========================================

  fecharLoading();

}












async function carregarProfissionaisDespesa(){

  const empresaId =
    Number(localStorage.getItem("empresa_id"));

  const select =
    document.getElementById(
      "barbeiroDespesa"
    );

  if(!select) return;

  select.innerHTML =
    '<option value="" disabled>Selecione o barbeiro</option>';

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

  data.forEach(prof => {

    select.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });


  // ==========================================
  // RECUPERA BARBEIRO SALVO
  // ==========================================

  const barbeiroSalvo =
    localStorage.getItem(
      "barbeiroDespesa"
    );

  if(
    barbeiroSalvo &&
    [...select.options].some(
      option =>
        option.value === barbeiroSalvo
    )
  ){

    select.value =
      barbeiroSalvo;

  } else {

    select.value = "";

  }

}

async function carregarProfissionaisFiltroDespesa(){

  const empresaId =
    Number(localStorage.getItem("empresa_id"));

  const filtro =
    document.getElementById(
      "filtroBarbeiroDespesa"
    );

  if(!filtro) return;

  filtro.innerHTML = `
    <option value="Todos">
      Todos os barbeiros
    </option>
  `;

  const { data, error } = await db
    .from("profissionais")
    .select("nome")
    .eq("empresa_id", empresaId)
    .order("nome");

  if(error){

    console.log(
      "Erro ao carregar barbeiros:",
      error
    );

    return;
  }

  data.forEach(prof => {

    filtro.innerHTML += `
      <option value="${prof.nome}">
        ${prof.nome}
      </option>
    `;

  });

}

async function excluirDespesa(id){

  const confirmar =
    confirm("Deseja realmente excluir esta despesa?");

  if(!confirmar) return;

  abrirLoading("Excluindo...");

  const empresaId =
    Number(localStorage.getItem("empresa_id"));

  const { error } = await db
    .from("despesas")
    .delete()
    .eq("id", id)
    .eq("empresa_id", empresaId);

  if(error){

    fecharLoading();

    mostrarToast(error.message);

    return;
  }

  fecharLoading();

  mostrarToast("🗑️ Despesa excluída");

  carregarDespesas();
}


async function editarDespesa(id){

  abrirLoading("Carregando despesa...");

  const empresaId =
    Number(localStorage.getItem("empresa_id"));


  // ==========================================
  // BUSCA A DESPESA
  // ==========================================

  const {
    data,
    error
  } = await db
    .from("despesas")
    .select("*")
    .eq("id", id)
    .eq("empresa_id", empresaId)
    .single();


  if(error){

    fecharLoading();

    mostrarToast(
      error.message
    );

    console.log(error);

    return;

  }


  // ==========================================
  // MODO EDIÇÃO
  // ==========================================

  despesaEditandoId = id;


  // ==========================================
  // ABRE O MODAL
  // ==========================================

  const modal =
    document.getElementById(
      "modalDespesa"
    );

  if(!modal){

    fecharLoading();

    return;

  }

  modal.style.display = "flex";


  // ==========================================
  // CARREGA PROFISSIONAIS PRIMEIRO
  // ==========================================

  await carregarProfissionaisDespesa();


  // ==========================================
  // PREENCHER CAMPOS
  // ==========================================

  modalData.value =
    data.data || "";

  modalHora.value =
    data.hora || "";

  modalValor.value =
    data.valor || "";

  modalCategoria.value =
    data.categoria || "";

  modalDescricao.value =
    data.descricao || "";

  modalPagamento.value =
    data.forma_pagamento || "";


  // ==========================================
  // BARBEIRO
  // ==========================================

  if(barbeiroDespesa){

    barbeiroDespesa.value =
      data.barbeiro || "";

  }


  modalObservacao.value =
    data.observacao || "";


  // ==========================================
  // ALTERA TÍTULO
  // ==========================================

  const titulo =
    document.querySelector(
      "#modalDespesa .modal-header h2"
    );

  if(titulo){

    titulo.textContent =
      "Editar Despesa";

  }


  // ==========================================
  // ALTERA BOTÃO
  // ==========================================

  const botao =
    document.querySelector(
      "#modalDespesa .btn-salvar"
    );

  if(botao){

    botao.textContent =
      "Salvar Alterações";

  }


  fecharLoading();

}


function limparModalDespesa(){

  const ids = [
    "modalData",
    "modalHora",
    "modalValor",
    "modalCategoria",
    "modalDescricao",
    "modalPagamento",
    "barbeiroDespesa",
    "modalObservacao"
  ];

  ids.forEach(id => {

    const campo =
      document.getElementById(id);

    if(!campo) return;

    if(campo.tagName === "SELECT"){
      campo.selectedIndex = 0;
    }else{
      campo.value = "";
    }

  });

  despesaEditandoId = null;

}

function inicializarDataDespesas(){

  const input =
    document.getElementById(
      "dataDespesa"
    );

  if(!input) return;

  const hoje =
    new Date();

  const data =
    hoje.getFullYear() +
    "-" +
    String(
      hoje.getMonth() + 1
    ).padStart(2,"0") +
    "-" +
    String(
      hoje.getDate()
    ).padStart(2,"0");

  input.value = data;

}

function alterarDataDespesa(dias){

  const input =
    document.getElementById(
      "dataDespesa"
    );

  if(!input || !input.value)
    return;

  const data =
    new Date(
      input.value + "T00:00:00"
    );

  data.setDate(
    data.getDate() + dias
  );

  input.value =
    data.getFullYear() +
    "-" +
    String(
      data.getMonth() + 1
    ).padStart(2,"0") +
    "-" +
    String(
      data.getDate()
    ).padStart(2,"0");

  carregarDespesas();

}


function salvarBarbeiroDespesa(){

  const select =
    document.getElementById(
      "barbeiroDespesa"
    );

  if(!select) return;

  if(select.value){

    localStorage.setItem(
      "barbeiroDespesa",
      select.value
    );

  }

}

carregarProfissionaisFiltroDespesa()