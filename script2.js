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




// ==========================================
// DECLARAÇÃO DAS VARIÁVEIS GLOBAIS DO DOM
// ==========================================
const listaDespesas = document.getElementById("listaDespesas");
const gastoHoje = document.getElementById("gastoHoje");
const gastoSemana = document.getElementById("gastoSemana");
const gastoMes = document.getElementById("gastoMes");
const mediaDia = document.getElementById("mediaDia");

const dataInput = document.getElementById("dataInput");
const filtroBarbeiroDespesa = document.getElementById("filtroBarbeiroDespesa");
const buscaDespesa = document.getElementById("buscaDespesa");

// Define a data atual padrão no input
if (dataInput && !dataInput.value) {
  dataInput.value = new Date().toISOString().split("T")[0];
}

// ==========================================
// FUNÇÃO PARA CARREGAR E EXIBIR AS DESPESAS
// ==========================================
async function carregarDespesas() {
  if (typeof abrirLoading === "function") abrirLoading("Carregando...");

  const empresaId = Number(localStorage.getItem("empresa_id")) || 1;
  const barbeiro = filtroBarbeiroDespesa ? filtroBarbeiroDespesa.value : "Todos";
  const busca = buscaDespesa ? buscaDespesa.value.trim() : "";

  // Monta a consulta no Supabase
  let query = db
    .from("despesas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("data", { ascending: false })
    .order("hora", { ascending: false });

  if (barbeiro !== "Todos") {
    query = query.eq("barbeiro", barbeiro);
  }

  if (busca) {
    query = query.ilike("descricao", `%${busca}%`);
  }

  const { data, error } = await query;

  if (typeof fecharLoading === "function") fecharLoading();

  if (error) {
    console.error("Erro Supabase:", error);
    if (typeof mostrarToast === "function") mostrarToast(error.message);
    return;
  }

  // Se não houver dados, exibe mensagem na tabela
  if (!data || data.length === 0) {
    listaDespesas.innerHTML = `
      <tr>
        <td colSpan="8" style="text-align: center; padding: 20px; color: #888;">
          Nenhuma despesa encontrada.
        </td>
      </tr>
    `;
    return;
  }

  // Limpa o conteúdo atual da tabela
  listaDespesas.innerHTML = "";

  let totalHoje = 0;
  let totalSemana = 0;
  let totalMes = 0;

  const hoje = new Date();

  data.forEach((item) => {
    // Tratamento de data
    const partesData = item.data.split("-");
    const dataDespesa = new Date(partesData[0], partesData[1] - 1, partesData[2]);

    // Totais de Hoje, Mês e Semana
    if (item.data === dataInput.value) {
      totalHoje += Number(item.valor || 0);
    }

    if (
      dataDespesa.getMonth() === hoje.getMonth() &&
      dataDespesa.getFullYear() === hoje.getFullYear()
    ) {
      totalMes += Number(item.valor || 0);
    }

    const diferencaDias = (hoje - dataDespesa) / (1000 * 60 * 60 * 24);
    if (diferencaDias >= 0 && diferencaDias <= 6) {
      totalSemana += Number(item.valor || 0);
    }

    // Formata data DD/MM/AAAA
    const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

    // Adiciona a linha (tr) na tabela
    listaDespesas.innerHTML += `
      <tr>
        <td>
          <strong>${dataFormatada}</strong><br/>
          <small style="color: #666;">${item.hora || "--:--"}</small>
        </td>
        <td>${item.categoria || "Geral"}</td>
        <td><strong>${item.descricao || "-"}</strong></td>
        <td>${item.barbeiro || "-"}</td>
        <td>${item.forma_pagamento || "-"}</td>
        <td>${item.observacao || "-"}</td>
        <td style="text-align: right; color: #dc2626; font-weight: bold;">
          - R$ ${Number(item.valor || 0).toFixed(2).replace(".", ",")}
        </td>
        <td style="text-align: center;">
          <button onclick="editarDespesa(${item.id})">✏️</button>
          <button onclick="excluirDespesa(${item.id})">🗑️</button>
        </td>
      </tr>
    `;
  });

  // Atualiza os valores dos cards no topo
  if (gastoHoje) gastoHoje.textContent = "R$ " + totalHoje.toFixed(2).replace(".", ",");
  if (gastoSemana) gastoSemana.textContent = "R$ " + totalSemana.toFixed(2).replace(".", ",");
  if (gastoMes) gastoMes.textContent = "R$ " + totalMes.toFixed(2).replace(".", ",");
  if (mediaDia) {
    const media = totalMes / Math.max(1, new Date().getDate());
    mediaDia.textContent = "R$ " + media.toFixed(2).replace(".", ",");
  }
}

// ==========================================
// EXECUTA AUTOMATICAMENTE AO CARREGAR A PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDespesas();
});

// Atualiza a tabela quando mudar a data ou o filtro de busca
if (dataInput) dataInput.addEventListener("change", carregarDespesas);
if (filtroBarbeiroDespesa) filtroBarbeiroDespesa.addEventListener("change", carregarDespesas);
if (buscaDespesa) buscaDespesa.addEventListener("input", carregarDespesas);

// ==========================================
// DECLARAÇÃO DAS VARIÁVEIS GLOBAIS DO DOM
// ==========================================
const listaDespesas = document.getElementById("listaDespesas");
const gastoHoje = document.getElementById("gastoHoje");
const gastoSemana = document.getElementById("gastoSemana");
const gastoMes = document.getElementById("gastoMes");
const mediaDia = document.getElementById("mediaDia");

const dataInput = document.getElementById("dataInput");
const filtroBarbeiroDespesa = document.getElementById("filtroBarbeiroDespesa");
const buscaDespesa = document.getElementById("buscaDespesa");

// Define a data atual padrão no input
if (dataInput && !dataInput.value) {
  dataInput.value = new Date().toISOString().split("T")[0];
}

// ==========================================
// FUNÇÃO PARA CARREGAR E EXIBIR AS DESPESAS
// ==========================================
async function carregarDespesas() {
  if (typeof abrirLoading === "function") abrirLoading("Carregando...");

  const empresaId = Number(localStorage.getItem("empresa_id")) || 1;
  const barbeiro = filtroBarbeiroDespesa ? filtroBarbeiroDespesa.value : "Todos";
  const busca = buscaDespesa ? buscaDespesa.value.trim() : "";

  // Monta a consulta no Supabase
  let query = db
    .from("despesas")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("data", { ascending: false })
    .order("hora", { ascending: false });

  if (barbeiro !== "Todos") {
    query = query.eq("barbeiro", barbeiro);
  }

  if (busca) {
    query = query.ilike("descricao", `%${busca}%`);
  }

  const { data, error } = await query;

  if (typeof fecharLoading === "function") fecharLoading();

  if (error) {
    console.error("Erro Supabase:", error);
    if (typeof mostrarToast === "function") mostrarToast(error.message);
    return;
  }

  // Se não houver dados, exibe mensagem na tabela
  if (!data || data.length === 0) {
    listaDespesas.innerHTML = `
      <tr>
        <td colSpan="8" style="text-align: center; padding: 20px; color: #888;">
          Nenhuma despesa encontrada.
        </td>
      </tr>
    `;
    return;
  }

  // Limpa o conteúdo atual da tabela
  listaDespesas.innerHTML = "";

  let totalHoje = 0;
  let totalSemana = 0;
  let totalMes = 0;

  const hoje = new Date();

  data.forEach((item) => {
    // Tratamento de data
    const partesData = item.data.split("-");
    const dataDespesa = new Date(partesData[0], partesData[1] - 1, partesData[2]);

    // Totais de Hoje, Mês e Semana
    if (item.data === dataInput.value) {
      totalHoje += Number(item.valor || 0);
    }

    if (
      dataDespesa.getMonth() === hoje.getMonth() &&
      dataDespesa.getFullYear() === hoje.getFullYear()
    ) {
      totalMes += Number(item.valor || 0);
    }

    const diferencaDias = (hoje - dataDespesa) / (1000 * 60 * 60 * 24);
    if (diferencaDias >= 0 && diferencaDias <= 6) {
      totalSemana += Number(item.valor || 0);
    }

    // Formata data DD/MM/AAAA
    const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;

    // Adiciona a linha (tr) na tabela
    listaDespesas.innerHTML += `
      <tr>
        <td>
          <strong>${dataFormatada}</strong><br/>
          <small style="color: #666;">${item.hora || "--:--"}</small>
        </td>
        <td>${item.categoria || "Geral"}</td>
        <td><strong>${item.descricao || "-"}</strong></td>
        <td>${item.barbeiro || "-"}</td>
        <td>${item.forma_pagamento || "-"}</td>
        <td>${item.observacao || "-"}</td>
        <td style="text-align: right; color: #dc2626; font-weight: bold;">
          - R$ ${Number(item.valor || 0).toFixed(2).replace(".", ",")}
        </td>
        <td style="text-align: center;">
          <button onclick="editarDespesa(${item.id})">✏️</button>
          <button onclick="excluirDespesa(${item.id})">🗑️</button>
        </td>
      </tr>
    `;
  });

  // Atualiza os valores dos cards no topo
  if (gastoHoje) gastoHoje.textContent = "R$ " + totalHoje.toFixed(2).replace(".", ",");
  if (gastoSemana) gastoSemana.textContent = "R$ " + totalSemana.toFixed(2).replace(".", ",");
  if (gastoMes) gastoMes.textContent = "R$ " + totalMes.toFixed(2).replace(".", ",");
  if (mediaDia) {
    const media = totalMes / Math.max(1, new Date().getDate());
    mediaDia.textContent = "R$ " + media.toFixed(2).replace(".", ",");
  }
}

// ==========================================
// EXECUTA AUTOMATICAMENTE AO CARREGAR A PÁGINA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDespesas();
});

// Atualiza a tabela quando mudar a data ou o filtro de busca
if (dataInput) dataInput.addEventListener("change", carregarDespesas);
if (filtroBarbeiroDespesa) filtroBarbeiroDespesa.addEventListener("change", carregarDespesas);
if (buscaDespesa) buscaDespesa.addEventListener("input", carregarDespesas);
