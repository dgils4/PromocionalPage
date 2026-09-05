const SUPABASE_URL='https://kbdhjmyudlnaqjfhmzox.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGhqbXl1ZGxuYXFqZmhtem94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMzY1MjcsImV4cCI6MjEwMzcxMjUyN30.2FZnISm2sehrr_Z2RimG6qSkF_5Xzk_Igub-XJAMcd4';
let db=null;








let visitanteId = localStorage.getItem('dinheiro_do_mes_visitante');

if(!visitanteId){
  visitanteId = crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now()+'-'+Math.random();

  localStorage.setItem('dinheiro_do_mes_visitante', visitanteId);
}



let sessaoId = sessionStorage.getItem('dinheiro_do_mes_sessao');

if(!sessaoId){
  sessaoId = crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now()+'-'+Math.random();

  sessionStorage.setItem('dinheiro_do_mes_sessao', sessaoId);
}

async function rastrear(evento, pagina='', detalhes={}){

  if(!db)return;

  try{

await db
  .from('uso_app')
  .insert({
    visitante_id:visitanteId,
    sessao_id:sessaoId,
    evento:evento,
    pagina:pagina,
    detalhes:detalhes
  });

  }catch(e){

    console.warn('Erro ao registrar rastreamento:',e);

  }
}





try{ if(window.supabase) db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY); }catch(e){ console.warn('Supabase ainda não está sendo usado no MVP:',e); }

const KEY='dinheiro_do_mes_mvp_v1';
const defaultCategories=[
 {id:'cat-1',name:'Moradia',icon:'🏠'},{id:'cat-2',name:'Alimentação',icon:'🍔'},
 {id:'cat-3',name:'Transporte',icon:'🚗'},{id:'cat-4',name:'Contas',icon:'💡'},
 {id:'cat-5',name:'Saúde',icon:'💊'},{id:'cat-6',name:'Lazer',icon:'🎮'},
 {id:'cat-7',name:'Compras',icon:'🛒'},{id:'cat-8',name:'Educação',icon:'📚'},
 {id:'cat-9',name:'Dívidas',icon:'💳'},{id:'cat-10',name:'Outros',icon:'📦'}
];
let state=loadState();
let currentDate=new Date(); currentDate.setDate(1);

function loadState(){
 const saved=localStorage.getItem(KEY);
 if(saved) return JSON.parse(saved);
 return {
  income:3000,
  rendas:[
    {
mes:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
      valor:3000
    }
  ],
  receitas:[],
  despesas:[],
  categorias:defaultCategories,
  metas:[]
};
}
function save(){localStorage.setItem(KEY,JSON.stringify(state)); render(); }
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random();}
function brl(n){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0)}

function monthKey(date){
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');

  return `${ano}-${mes}`;
}


function selectedMonth(){
  const ano = currentDate.getFullYear();
  const mes = String(currentDate.getMonth() + 1).padStart(2, '0');

  return `${ano}-${mes}`;
}


function dateBR(d){return new Date(d+'T12:00:00').toLocaleDateString('pt-BR')}
function money(v){return Number(String(v).replace(/\./g,'').replace(',','.'))||0}
function isSameMonth(d,m){return String(d).slice(0,7)===m}
function monthLabel(){return currentDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase())}



function despesasMes(){
  const mesAtual=selectedMonth();
  const resultado=[];

  state.despesas.forEach(x=>{
    const parcelas=Number(x.parcelas)||1;

    if(parcelas===1){
      if(isSameMonth(x.data,mesAtual)){
        resultado.push(x);
      }
      return;
    }

    const dataInicial=new Date(x.data+'T12:00:00');
    const anoInicial=dataInicial.getFullYear();
    const mesInicial=dataInicial.getMonth();

    const dataSelecionada=new Date(mesAtual+'-01T12:00:00');
    const anoSelecionado=dataSelecionada.getFullYear();
    const mesSelecionado=dataSelecionada.getMonth();

    const diferencaMeses=
      (anoSelecionado-anoInicial)*12+
      (mesSelecionado-mesInicial);

    if(diferencaMeses>=0 && diferencaMeses<parcelas){
      resultado.push({
        ...x,
        valor:Number(x.valor)/parcelas,
        valorTotal:Number(x.valor),
        parcelaAtual:diferencaMeses+1
      });
    }
  });

  return resultado;
}

function compromissosFuturos(){
  const mesSelecionado=selectedMonth();

  let totalFuturo=0;
  let parcelasRestantes=0;

  state.despesas.forEach(x=>{
    const parcelas=Number(x.parcelas)||1;

    if(parcelas<=1)return;

    const valorParcela=Number(x.valor)/parcelas;

    const dataInicial=new Date(x.data+'T12:00:00');
    const anoInicial=dataInicial.getFullYear();
    const mesInicial=dataInicial.getMonth();

    const dataSelecionada=new Date(mesSelecionado+'-01T12:00:00');
    const anoSelecionado=dataSelecionada.getFullYear();
    const mesSelecionadoNumero=dataSelecionada.getMonth();

    const diferencaMeses=
      (anoSelecionado-anoInicial)*12+
      (mesSelecionadoNumero-mesInicial);

    if(diferencaMeses>=0 && diferencaMeses<parcelas){

      const parcelaAtual=diferencaMeses+1;
      const restantes=parcelas-parcelaAtual+1;

      totalFuturo+=valorParcela*restantes;
      parcelasRestantes+=restantes;
    }
  });

  return {
    total:totalFuturo,
    parcelas:parcelasRestantes
  };
}



function saldoPrevisto(){
  const r=receitasMes();
  const d=despesasMes();

  const renda=state.income+total(r);
  const despesas=total(d);
  const metas=state.metas.reduce(
    (s,m)=>s+(Number(m.valorAtual)||0),
    0
  );

  const compromissos=compromissosFuturos();

  return renda-despesas-metas;
}


function saldoPrevistoProximoMes(){
  const proximoMes=new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()+1,
    1
  );

const mes =
  `${proximoMes.getFullYear()}-${String(proximoMes.getMonth()+1).padStart(2,'0')}`;

  const renda=rendaDoMes(mes);

  const receitasExtrasProximoMes=state.receitas
  .filter(x=>isSameMonth(x.data,mes))
  .reduce((s,x)=>s+Number(x.valor),0);

  const despesasProximoMes=state.despesas.filter(x=>{
    const parcelas=Number(x.parcelas)||1;

    if(parcelas===1){
      return isSameMonth(x.data,mes);
    }

    const dataInicial=new Date(x.data+'T12:00:00');

    const diferencaMeses=
      (proximoMes.getFullYear()-dataInicial.getFullYear())*12+
      (proximoMes.getMonth()-dataInicial.getMonth());

    return diferencaMeses>=0 && diferencaMeses<parcelas;
  }).reduce((s,x)=>{
    const parcelas=Number(x.parcelas)||1;
    return s+(Number(x.valor)/parcelas);
  },0);

  const metas=state.metas.reduce(
    (s,m)=>s+(Number(m.valorAtual)||0),
    0
  );

  return renda+receitasExtrasProximoMes-despesasProximoMes-metas;
}

function receitasMes(){return state.receitas.filter(x=>isSameMonth(x.data,selectedMonth()))}
function total(arr){return arr.reduce((s,x)=>s+Number(x.valor),0)}


function rendaDoMes(mes=selectedMonth()){
  if(!state.rendas || !state.rendas.length){
    return Number(state.income)||0;
  }

  const historico=[...state.rendas]
    .filter(x=>String(x.mes).slice(0,7)<=mes)
    .sort((a,b)=>String(a.mes).localeCompare(String(b.mes)));

  if(!historico.length){
    return 0;
  }

  return Number(historico[historico.length-1].valor)||0;
}



function catName(id){return state.categorias.find(c=>c.id===id)?.name||'Outros'}
function catIcon(id){return state.categorias.find(c=>c.id===id)?.icon||'📦'}

const views={
 dashboard:['Dashboard','Veja para onde seu dinheiro está indo.'],
 receitas:['Receitas','Cadastre o dinheiro que entra.'],
 despesas:['Despesas','Registre cada saída e entenda seus gastos.'],
 categorias:['Categorias','Organize suas despesas.'],
 metas:['Metas','Defina quanto quer economizar.'],
 historico:['Histórico','Consulte suas movimentações.']
};
function setView(v){
 document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
 document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
 document.getElementById('view-'+v).classList.add('active');
 document.getElementById('pageTitle').textContent=views[v][0];
 document.getElementById('pageSubtitle').textContent=views[v][1];
 document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('open');
 render();
  rastrear('tela_acessada',v);
}



function render(){document.getElementById('currentMonthLabel').textContent=monthLabel(); renderDashboard();renderReceitas();renderDespesas();renderCategorias();renderMetas();renderHistorico();}

function renderDashboard(){
 const r=receitasMes();
 const d=despesasMes();
const compromissos=compromissosFuturos();
const saldoPrevistoAtual=saldoPrevistoProximoMes();

 const income=rendaDoMes()+total(r);
 const spent=total(d);

  const hojeString = today();

const despesasHoje = d
  .filter(x => x.data === hojeString)
  .reduce((s,x) => s + Number(x.valor), 0);

  const despesasFixas = d
  .filter(x => x.tipo === 'fixa')
  .reduce((s,x) => s + Number(x.valor), 0);

const despesasVariaveis = d
  .filter(x => x.tipo !== 'fixa')
  .reduce((s,x) => s + Number(x.valor), 0);

  const aposFixas =
  income - despesasFixas;

const percentualComprometidoFixas =
  income > 0
  ? (despesasFixas / income * 100)
  : 0;

  const percentualFixas =
  income > 0
  ? (despesasFixas / income * 100)
  : 0;

const percentualVariaveis =
  income > 0
  ? (despesasVariaveis / income * 100)
  : 0;

  
  
const totalGuardadoMetas=state.metas.reduce(
  (s,m)=>s+(Number(m.valorAtual)||0),
  0
);

const balance=income-spent-totalGuardadoMetas;

 const prev=new Date(currentDate);
 prev.setMonth(prev.getMonth()-1);

const prevMes =
  `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;

const prevD=state.despesas.filter(
  x=>isSameMonth(x.data,prevMes)
);

 const prevSpent=total(prevD);
 const diff=spent-prevSpent;
  let variacaoPercentual=0;

if(prevSpent>0){
  variacaoPercentual=(diff/prevSpent)*100;
}



  let comparacaoMes='';

if(prevSpent===0){

  comparacaoMes=`
    <div class="insight">
      📊 Ainda não há gastos registrados no mês anterior
      para fazer uma comparação.
    </div>
  `;

}else if(diff>0){

  comparacaoMes=`
    <div class="insight">
      📈 Você gastou
      <strong>${brl(diff)}</strong>
      a mais que no mês passado
      (${variacaoPercentual.toFixed(1)}%).
    </div>
  `;

}else if(diff<0){

  comparacaoMes=`
    <div class="insight">
      📉 Você gastou
      <strong>${brl(Math.abs(diff))}</strong>
      a menos que no mês passado
      (${Math.abs(variacaoPercentual).toFixed(1)}%).
    </div>
  `;

}else{

  comparacaoMes=`
    <div class="insight">
      ➖ Seus gastos estão iguais aos do mês passado.
    </div>
  `;
}

 const groups={};

 d.forEach(x=>{
   groups[x.categoria_id]=(groups[x.categoria_id]||0)+Number(x.valor);
 });

 const rows=Object.entries(groups)
   .sort((a,b)=>b[1]-a[1]);

 const max=rows[0]?.[1]||1;



  

  const maiorCategoria =
  rows.length
  ? rows[0][0]
  : null;

const maiorCategoriaValor =
  rows.length
  ? rows[0][1]
  : 0;

const maiorCategoriaPercentual =
  income>0
  ? (maiorCategoriaValor/income*100)
  : 0;

  let alertaCategoria='';

if(maiorCategoria){

  if(maiorCategoriaPercentual>=30){

    alertaCategoria=`
      <div class="insight">
        🚨 <strong>Atenção:</strong>
        ${catIcon(maiorCategoria)}
        ${catName(maiorCategoria)}
        já representa
        <strong>${maiorCategoriaPercentual.toFixed(1)}%</strong>
        da sua renda.
      </div>
    `;

  }else if(maiorCategoriaPercentual>=20){

    alertaCategoria=`
      <div class="insight">
        🟠 <strong>Fique atento:</strong>
        ${catIcon(maiorCategoria)}
        ${catName(maiorCategoria)}
        representa
        <strong>${maiorCategoriaPercentual.toFixed(1)}%</strong>
        da sua renda.
      </div>
    `;

  }else{

    alertaCategoria=`
      <div class="insight">
        🟢 Sua maior categoria de gasto é
        <strong>${catName(maiorCategoria)}</strong>,
        representando
        <strong>${maiorCategoriaPercentual.toFixed(1)}%</strong>
        da sua renda.
      </div>
    `;
  }
}

 /*
  * CÁLCULO DO LIMITE DIÁRIO
  */

 const hoje=new Date();

 let diasRestantes;

 if(
   hoje.getFullYear()===currentDate.getFullYear() &&
   hoje.getMonth()===currentDate.getMonth()
 ){
   const ultimoDia=new Date(
     currentDate.getFullYear(),
     currentDate.getMonth()+1,
     0
   ).getDate();

   diasRestantes=Math.max(
     1,
     ultimoDia-hoje.getDate()+1
   );

 }else{

   /*
    * Para meses diferentes do atual,
    * usamos a quantidade total de dias do mês.
    */

   diasRestantes=new Date(
     currentDate.getFullYear(),
     currentDate.getMonth()+1,
     0
   ).getDate();

 }

 const limiteDiario=
   balance>0 ? balance/diasRestantes : 0;

  let diasDecorridos;

if(
  hoje.getFullYear()===currentDate.getFullYear() &&
  hoje.getMonth()===currentDate.getMonth()
){
  diasDecorridos=hoje.getDate();
}else{
  diasDecorridos=new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()+1,
    0
  ).getDate();
}

const mediaDiaria=
  diasDecorridos>0
  ? spent/diasDecorridos
  : 0;

  const previsaoDespesas =
  mediaDiaria * (diasDecorridos + diasRestantes);

  const previsaoSaldo =
  income - previsaoDespesas;

  const diferencaDiaria =
  Math.abs(limiteDiario - mediaDiaria);

let pontuacao = 100;

if(balance < 0){
  pontuacao -= 40;
}

if(mediaDiaria > limiteDiario && limiteDiario > 0){
  pontuacao -= 20;
}

if(percentualFixas >= 50){
  pontuacao -= 20;
}

if(diff > 0 && prevSpent > 0){
  pontuacao -= 10;
}

pontuacao = Math.max(0, pontuacao);




let nivelPontuacao = '';

if(balance < 0){
  nivelPontuacao = '🔴 Crítica';
}else if(pontuacao >= 80){
  nivelPontuacao = '🟢 Excelente';
}else if(pontuacao >= 60){
  nivelPontuacao = '🟡 Boa';
}else if(pontuacao >= 40){
  nivelPontuacao = '🟠 Atenção';
}else{
  nivelPontuacao = '🔴 Crítica';
}


  let explicacaoPontuacao = '';

if(balance < 0){

  explicacaoPontuacao =
    'Seus gastos ultrapassaram o dinheiro disponível.';

}else if(mediaDiaria > limiteDiario && limiteDiario > 0){

  explicacaoPontuacao =
    'Sua média de gastos está acima do limite diário recomendado.';

}else if(percentualFixas >= 50){

  explicacaoPontuacao =
    'Mais da metade da sua renda está comprometida com despesas fixas.';

}else if(diff > 0 && prevSpent > 0){

  explicacaoPontuacao =
    'Seus gastos aumentaram em relação ao mês anterior.';

}else{

  explicacaoPontuacao =
    'Seus gastos estão sob controle neste mês.';
}

  

  let orientacaoDiaria='';

if(balance<=0){

  orientacaoDiaria=`
    <div class="insight">
      🔴 Não há limite disponível para novos gastos.
    </div>
  `;

}else if(mediaDiaria>limiteDiario){

  orientacaoDiaria=`
    <div class="insight">
      📉 Para voltar ao limite recomendado,
      tente reduzir aproximadamente
      <strong>${brl(diferencaDiaria)}</strong>
      por dia.
    </div>
  `;

}else{

  orientacaoDiaria=`
    <div class="insight">
      💰 Você está economizando aproximadamente
      <strong>${brl(diferencaDiaria)}</strong>
      por dia em relação ao limite.
    </div>
  `;
}

  let comparacaoDiaria='';

if(balance<=0){
  comparacaoDiaria=`
    <div class="insight">
      🔴 Seus gastos já ultrapassaram o dinheiro disponível.
    </div>
  `;
}else if(mediaDiaria>limiteDiario){
  comparacaoDiaria=`
    <div class="insight">
      🟠 <strong>Atenção:</strong>
      você está gastando acima do limite diário recomendado.
    </div>
  `;
}else{
  comparacaoDiaria=`
    <div class="insight">
      🟢 <strong>Muito bom:</strong>
      você está gastando abaixo do limite diário recomendado.
    </div>
  `;
}



  
let statusGasto='';

// Remove qualquer estado anterior
document.body.classList.remove(
  'saude-excelente',
  'saude-boa',
  'saude-atencao',
  'saude-critica'
);

if(balance<=0){

  document.body.classList.add('saude-critica');

  statusGasto=`
    <div class="insight">
      🔴 <strong>Situação crítica</strong><br>
      Seus gastos já ultrapassaram o dinheiro disponível.
    </div>
  `;

}else if(limiteDiario<50){

  document.body.classList.add('saude-atencao');

  statusGasto=`
    <div class="insight">
      🟠 <strong>Atenção</strong><br>
      Seu limite diário está baixo. Evite gastos desnecessários.
    </div>
  `;

}else{

  document.body.classList.add('saude-excelente');

  statusGasto=`
    <div class="insight">
      🟢 <strong>Situação tranquila</strong><br>
      Seu dinheiro está dentro de um limite confortável.
    </div>
  `;
}




 /*
  * INSIGHTS
  */

 let insights=[];

 if(income>0 && rows.length){

   insights.push(
     `${catIcon(rows[0][0])} Você gastou ${(rows[0][1]/income*100).toFixed(1)}% da sua renda com ${catName(rows[0][0]).toLowerCase()}.`
   );

 }

 if(diff>0){

   insights.push(
     `⚠️ Suas despesas aumentaram ${brl(diff)} em relação ao mês passado.`
   );

 }else if(diff<0){

   insights.push(
     `✅ Suas despesas caíram ${brl(Math.abs(diff))} em relação ao mês passado.`
   );

 }

 if(rows.length){

   insights.push(
     `💡 Seu maior gasto este mês foi ${catName(rows[0][0]).toLowerCase()}.`
   );

 }

 if(income>0){

   if(balance>=0){

     insights.push(
       `💰 Você ainda tem ${brl(balance)} disponíveis neste mês.`
     );

   }else{

     insights.push(
       `🚨 Seus gastos ultrapassaram sua renda em ${brl(Math.abs(balance))}.`
     );

   }

 }


 /*
  * DASHBOARD
  */

 document.getElementById('view-dashboard').innerHTML=`

<div class="panel" style="margin-bottom:16px">
  <h2>Saúde financeira</h2>

  <div class="insight">
    🎯 Pontuação do mês:
    <strong>${pontuacao}/100</strong>
  </div>
  <div class="insight">
  ${nivelPontuacao}
</div>

<div class="insight">
  💡 ${explicacaoPontuacao}
</div>

</div>


 <div class="cards">

   <div class="card">
     <div class="label">Dinheiro do mês</div>
     <div class="value">${brl(income)}</div>
   </div>

   <div class="card">
     <div class="label">Receitas extras</div>
     <div class="value positive">${brl(total(r))}</div>
   </div>

   <div class="card">
     <div class="label">Despesas</div>
     <div class="value negative">${brl(spent)}</div>
   </div>

   <div class="card">
  <div class="label">Despesas de hoje</div>
  <div class="value negative">${brl(despesasHoje)}</div>
</div>

   <div class="card">
     <div class="label">Disponível</div>
     <div class="value ${balance<0?'negative':'positive'}">
       ${brl(balance)}
     </div>
   </div>

   <div class="card">
  <div class="label">Guardado nas metas</div>
  <div class="value positive">
    ${brl(totalGuardadoMetas)}
  </div>
</div>

<div class="card">
  <div class="label">Compromissos futuros</div>
  <div class="value">
    ${brl(compromissos.total)}
  </div>
  <div class="muted">
    ${compromissos.parcelas} parcelas restantes
  </div>
</div>


<div class="card">
  <div class="label">
    Saldo previsto — ${
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth()+1,
        1
      ).toLocaleDateString('pt-BR',{month:'long'})
    }
  </div>

  <div class="value ${saldoPrevistoAtual>=0?'positive':'negative'}">
    ${brl(saldoPrevistoAtual)}
  </div>

  <div class="muted">
    Estimativa para o próximo mês
  </div>
</div>

 </div>


 <div class="grid2">

   <div class="panel">

     <h2>Para onde foi seu dinheiro?</h2>

     ${
       rows.length

       ?

       rows.map(([id,val])=>`

         <div class="bar-row">

           <div class="bar-head">

             <span>
               ${catIcon(id)} ${catName(id)}
             </span>

             <strong>
               ${brl(val)}
             </strong>

             <small>
  ${income>0 ? (val/income*100).toFixed(1) : 0}% da renda
</small>

           </div>

           <div class="bar">

             <i style="width:${Math.min(100,val/max*100)}%"></i>

           </div>

         </div>

       `).join('')

       :

       '<div class="empty">Nenhuma despesa registrada neste mês.</div>'
     }

   </div>


   <div class="panel">

     <h2>Quanto posso gastar?</h2>

     ${statusGasto}

     ${
       balance>0

       ?

       `

       <div class="insight">

         💰 Você tem
         <strong>${brl(balance)}</strong>
         disponíveis.

       </div>

       <div class="insight">

         📅 Faltam
         <strong>${diasRestantes} dias</strong>
         para terminar este mês.

       </div>

       <div class="insight">

         🎯 Você pode gastar aproximadamente
         <strong>${brl(limiteDiario)}</strong>
         por dia.

       </div>


       <div class="insight">
  📊 Sua média de gastos está em
  <strong>${brl(mediaDiaria)}</strong>
  por dia.
</div>

${comparacaoDiaria}
${orientacaoDiaria}
<div class="insight">
  🔮 Se continuar nesse ritmo,
  seus gastos no mês podem chegar a
  <strong>${brl(previsaoDespesas)}</strong>.
</div>

<div class="insight">
  ${
    previsaoSaldo>=0
    ?
    `💰 Sua previsão de saldo no final do mês é
     <strong>${brl(previsaoSaldo)}</strong>.`
    :
    `🔴 Nesse ritmo, você poderá terminar o mês
     com um déficit de
     <strong>${brl(Math.abs(previsaoSaldo))}</strong>.`
  }
</div>

       `

       :

       `

       <div class="insight">

         🚨 Você não possui saldo disponível
         para este mês.

       </div>

       `
     }

   </div>

 </div>

 <div class="panel" style="margin-top:16px">
  <h2>Despesas fixas e variáveis</h2>

  <div class="insight">
    🏠 Despesas fixas:
    <strong>${brl(despesasFixas)}</strong>
    (${percentualFixas.toFixed(1)}% da renda)
  </div>

  <div class="insight">
  💰 Depois das despesas fixas,
  você tem
  <strong>${brl(aposFixas)}</strong>
  disponíveis para os demais gastos.
</div>

<div class="insight">
  📌 Você já comprometeu
  <strong>${percentualComprometidoFixas.toFixed(1)}%</strong>
  da sua renda com despesas fixas.
</div>

  <div class="insight">
    🛒 Despesas variáveis:
    <strong>${brl(despesasVariaveis)}</strong>
    (${percentualVariaveis.toFixed(1)}% da renda)
  </div>
</div>


 <div class="panel" style="margin-top:16px">

   <h2>Insights</h2>

   ${alertaCategoria}
   ${comparacaoMes}

   ${
     insights.map(x=>`

       <div class="insight">
         ${x}
       </div>

     `).join('')

     ||

     '<div class="empty">Cadastre algumas despesas para receber análises.</div>'
   }

 </div>


 <div class="panel" style="margin-top:16px">

   <h2>Configuração do mês</h2>

   <div class="toolbar">

     <div>

       <div class="label">
         Renda mensal base
       </div>

       <div class="value">
  ${brl(rendaDoMes())}
</div>

     </div>

     <button
       class="btn"
       onclick="openIncomeModal()"
     >
       Alterar renda
     </button>

   </div>

 </div>

 `;
}
function renderReceitas(){
 const rows=receitasMes().sort((a,b)=>b.data.localeCompare(a.data));
 document.getElementById('view-receitas').innerHTML=`<div class="toolbar"><div><strong>Receitas de ${monthLabel()}</strong><div class="muted">Além da renda mensal base, registre entradas extras.</div></div><button class="btn" onclick="openReceitaModal()">+ Nova receita</button></div>
 <div class="table-wrap">${rows.length?`<table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td>${dateBR(x.data)}</td><td>${esc(x.descricao)}</td><td>${esc(x.categoria||'Renda extra')}</td><td class="money">${brl(x.valor)}</td><td>


<button class="btn danger" onclick="removeItem('receitas','${x.id}')">Excluir</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhuma receita extra neste mês.</div>'}</div>`;
}

function renderDespesas(){
  const rows=despesasMes().sort((a,b)=>b.data.localeCompare(a.data));

  document.getElementById('view-despesas').innerHTML=`
    <div class="toolbar">
      <div>
        <strong>Despesas de ${monthLabel()}</strong>
        <div class="muted">Registre até os pequenos gastos.</div>
      </div>
      <button class="btn" onclick="openDespesaModal()">+ Nova despesa</button>
    </div>

    <div class="table-wrap">
      ${
        rows.length
        ?
        `<table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Parcelamento</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${
              rows.map(x=>`
                <tr>
                  <td>${dateBR(x.data)}</td>

                  <td>${esc(x.descricao)}</td>

                  <td>
                    ${catIcon(x.categoria_id)}
                    ${esc(catName(x.categoria_id))}
                  </td>

                  <td>
                    ${x.tipo==='fixa'?'Fixa':'Variável'}
                  </td>

                  <td class="money">
                    ${brl(x.valor)}
                  </td>

                  <td>
                    ${
                      (Number(x.parcelas)||1)>1
                      ?
                      `Parcela ${x.parcelaAtual}/${x.parcelas}`
                      :
                      'À vista'
                    }
                  </td>

                  <td>
                    <button
                      class="btn danger"
                      onclick="removeItem('despesas','${x.id}')">
                      Excluir
                    </button>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>`
        :
        '<div class="empty">Nenhuma despesa neste mês.</div>'
      }
    </div>
  `;
}


function renderCategorias(){
 document.getElementById('view-categorias').innerHTML=`<div class="toolbar"><div><strong>Suas categorias</strong><div class="muted">As categorias ajudam a identificar os maiores gastos.</div></div><button class="btn" onclick="openCategoriaModal()">+ Nova categoria</button></div><div class="panel"><div class="chips">${state.categorias.map(c=>`<span class="chip">${c.icon} ${esc(c.name)} ${state.categorias.length>1?`<button style="border:0;background:none;cursor:pointer" onclick="removeCategoria('${c.id}')">×</button>`:''}</span>`).join('')}</div></div>`;
}

function renderMetas(){
 const d=despesasMes();
const income=rendaDoMes()+total(receitasMes());
 const saved=Math.max(0,income-total(d));

 document.getElementById('view-metas').innerHTML=`
 <div class="toolbar">
   <div>
     <strong>Metas de economia</strong>
     <div class="muted">Acompanhe o quanto você consegue guardar.</div>
   </div>

   <button class="btn" onclick="openMetaModal()">
     + Nova meta
   </button>
 </div>

 <div class="panel">

   <div class="insight">
     💰 Disponível antes das metas:
     <strong>${brl(saved)}</strong>
   </div>

   ${
     state.metas.length

     ?

     state.metas.map(m=>{

       const valorMeta=Number(m.valor)||0;
       const valorAtual=Number(m.valorAtual)||0;




let mensalNecessario=0;
let diarioNecessario=0;
let diasMeta=0;
let metaVencida=false;

if(m.prazo && valorAtual<valorMeta){

  const hoje=new Date();
  const prazo=new Date(m.prazo+'T12:00:00');

  const diferenca=prazo-hoje;

  diasMeta=Math.ceil(diferenca/(1000*60*60*24));

  if(diasMeta<=0){

    metaVencida=true;

  }else if(diasMeta<=30){

    diarioNecessario=(valorMeta-valorAtual)/diasMeta;

  }else{

    const mesesRestantes=
      (prazo.getFullYear()-hoje.getFullYear())*12+
      (prazo.getMonth()-hoje.getMonth());

    if(mesesRestantes>0){
      mensalNecessario=(valorMeta-valorAtual)/mesesRestantes;
    }

  }
}
       const pct=
         valorMeta>0
         ? Math.min(100,valorAtual/valorMeta*100)
         : 0;

       const falta=
         Math.max(0,valorMeta-valorAtual);

       return `

       <div class="goal">

         <div style="flex:1">

           <strong>${esc(m.nome)}</strong>

     <div class="muted">
  Meta: ${brl(valorMeta)}
</div>

${m.prazo ? `
  <div class="muted">
    📅 Prazo: ${dateBR(m.prazo)}
  </div>
` : ''}

           

           <div class="progress">
             <i style="width:${pct}%"></i>
           </div>

           <div class="muted">
             ${brl(valorAtual)}
             de
             ${brl(valorMeta)}
             (${pct.toFixed(0)}%)
           </div>


${metaVencida ? `
  <div class="muted">
    🔴 O prazo desta meta já terminou.
  </div>
` : diarioNecessario>0 ? `
  <div class="muted">
    🎯 Faltam aproximadamente
    <strong>${diasMeta} dias</strong>.
    Para atingir a meta, guarde cerca de
    <strong>${brl(diarioNecessario)}</strong>
    por dia.
  </div>
` : mensalNecessario>0 ? `
  <div class="muted">
    🎯 Para atingir a meta no prazo,
    guarde aproximadamente
    <strong>${brl(mensalNecessario)}</strong>
    por mês.
  </div>
` : ''}

           

           <div class="muted">
             ${
               falta>0
               ? `Falta ${brl(falta)} para atingir sua meta.`
               : '🎉 Meta atingida!'
             }
           </div>

         </div>

<button
  class="btn"
  onclick="adicionarDinheiroMeta('${m.id}')"
>
  + Adicionar
</button>

<button
  class="btn secondary"
  onclick="retirarDinheiroMeta('${m.id}')"
>
  − Retirar
</button>


         <button
           class="btn danger"
           onclick="removeItem('metas','${m.id}')"
         >
           Excluir
         </button>

       </div>

       `;

     }).join('')

     :

     '<div class="empty">Você ainda não criou uma meta.</div>'
   }

 </div>
 `;
}


function renderHistorico(){
 const all=[...state.receitas.map(x=>({...x,mov:'Entrada'})),...state.despesas.map(x=>({...x,mov:'Saída'}))].sort((a,b)=>b.data.localeCompare(a.data));
 document.getElementById('view-historico').innerHTML=`<div class="toolbar"><div><strong>Histórico completo</strong><div class="muted">${all.length} movimentação(ões)</div></div></div><div class="table-wrap">${all.length?`<table class="table"><thead><tr><th>Data</th><th>Movimento</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${all.map(x=>`<tr><td>${dateBR(x.data)}</td><td>${x.mov}</td><td>${esc(x.descricao)}</td><td class="money">${x.mov==='Entrada'?'+':'-'} ${brl(x.valor)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhuma movimentação registrada.</div>'}</div>`;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function today(){
  const d = new Date();

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function openModal(html){document.getElementById('modal').innerHTML=html;document.getElementById('modalBackdrop').classList.add('open')}
function closeModal(){document.getElementById('modalBackdrop').classList.remove('open')}

function openIncomeModal(){

  const hoje=new Date();
  hoje.setDate(1);
const mesAtualSistema=monthKey(hoje);
  const mesSelecionado=selectedMonth();

  if(mesSelecionado < mesAtualSistema){
    toast('Não é possível alterar a renda de um mês anterior');
    return;
  }

  const rendaAtual=rendaDoMes();

  openModal(`
    <button class="modal-close" onclick="closeModal()">×</button>

    <h2>Renda mensal</h2>

    <div class="field">
      <label>Quanto você recebe por mês?</label>
      <input
        id="incomeInput"
        type="number"
        min="0"
        step=".01"
        value="${rendaAtual}"
      >
    </div>

    <div class="muted">
      Essa renda será válida a partir de ${monthLabel()} e continuará nos próximos meses até você alterá-la novamente.
    </div>

    <div class="actions">
      <button class="btn secondary" onclick="closeModal()">Cancelar</button>

      <button class="btn" onclick="
  const valor=Number(document.getElementById('incomeInput').value)||0;

  if(!state.rendas){
    state.rendas=[];
  }

  state.rendas=state.rendas.filter(
    x=>String(x.mes).slice(0,7)!==selectedMonth()
  );

  state.rendas.push({
    mes:selectedMonth(),
    valor:valor
  });

  state.income=valor;

  save();
  closeModal();

  rastrear('renda_cadastrada','dashboard',{
    mes:selectedMonth(),
    valor:valor
  });

  toast('Renda atualizada');
">
        Salvar
      </button>
    </div>
  `);
}



function openReceitaModal(){openModal(`<button class="modal-close" onclick="closeModal()">×</button><h2>Nova receita</h2><form onsubmit="addReceita(event)"><div class="form-grid"><div class="field full"><label>Descrição</label><input id="rDesc" required placeholder="Ex.: Freelance"></div><div class="field"><label>Valor</label><input id="rVal" required type="number" min="0.01" step=".01"></div><div class="field"><label>Data</label><input id="rDate" type="date" value="${today()}" required></div><div class="field full"><label>Tipo</label><select id="rCat"><option>Renda extra</option><option>Salário</option><option>Freelance</option><option>Outros</option></select></div></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn">Salvar</button></div></form>`)}
function addReceita(e){
  e.preventDefault();

  const descricao=document.getElementById('rDesc').value;
  const valor=Number(document.getElementById('rVal').value);
  const data=document.getElementById('rDate').value;
  const categoria=document.getElementById('rCat').value;

  state.receitas.push({
    id:uid(),
    descricao:descricao,
    valor:valor,
    data:data,
    categoria:categoria
  });

  save();
  closeModal();

  rastrear('receita_cadastrada','receitas',{
    valor:valor,
    categoria:categoria
  });

  toast('Receita cadastrada');
}



function openDespesaModal(){openModal(`<button class="modal-close" onclick="closeModal()">×</button><h2>Nova despesa</h2><form onsubmit="addDespesa(event)"><div class="form-grid"><div class="field full"><label>Descrição</label><input id="dDesc" required placeholder="Ex.: Supermercado"></div><div class="field"><label>Valor</label><input id="dVal" required type="number" min="0.01" step=".01"></div><div class="field"><label>Data</label>

<input id="dDate" type="date" value="${today()}" required></div><div class="field"><label>Categoria</label><select id="dCat">${state.categorias.map(c=>`<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join('')}</select></div>

<div 

class="field"><label>Tipo</label><select id="dType"><option value="variavel">Variável</option><option value="fixa">Fixa</option></select></div>

<div class="field">
  <label>Parcelas</label>
  <input
    id="dParcelas"
    type="number"
    min="1"
    step="1"
    value="1"
  >
</div>


<div class="field"><label>Forma de pagamento</label><select id="dPay"><option>Pix</option><option>Débito</option><option>Crédito</option><option>Dinheiro</option><option>Boleto</option><option>Outro</option></select></div><div class="field full"><label>Observação</label><textarea id="dObs" placeholder="Opcional"></textarea></div></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn">Salvar</button></div></form>`)}



 
function addDespesa(e){
  e.preventDefault();

  const tipo=document.getElementById('dType').value;
  const parcelas=Number(document.getElementById('dParcelas').value)||1;

  state.despesas.push({
    id:uid(),
    descricao:document.getElementById('dDesc').value,
    valor:Number(document.getElementById('dVal').value),
    data:document.getElementById('dDate').value,
    categoria_id:document.getElementById('dCat').value,
    tipo:tipo,
    pagamento:document.getElementById('dPay').value,
    observacao:document.getElementById('dObs').value,
    parcelas:parcelas
  });

  save();
  closeModal();

  rastrear('despesa_cadastrada','despesas',{
    tipo:tipo,
    parcelas:parcelas
  });

  if(parcelas>1){
    rastrear('despesa_parcelada','despesas',{
      parcelas:parcelas
    });
  }

  toast('Despesa cadastrada');
}





function openCategoriaModal(){
  openModal(`
    <button class="modal-close" onclick="closeModal()">×</button>

    <h2>Nova categoria</h2>

    <form onsubmit="addCategoria(event)">

      <div class="form-grid">

        <div class="field">
          <label>Nome</label>
          <input id="cName" required placeholder="Ex.: Pets">
        </div>

        <div class="field">
          <label>Ícone</label>

          <input
  id="cIcon"
  value="📦"
  maxlength="2"
  readonly
  onclick="openEmojiPicker()"
  style="cursor:pointer;text-align:left"
>

        </div>

      </div>

      <div class="actions">
        <button type="button" class="btn secondary" onclick="closeModal()">
          Cancelar
        </button>

        <button class="btn">
          Salvar
        </button>
      </div>

    </form>
  `);
}

function openEmojiPicker(){

  const grupos = [

    {
      nome: '🧺 Lavanderia e Roupas',
      emojis: [
        '🧺','🧼','🫧','🧴','👕','👖','🧦','👔','👚','👗',
        '🩳','🧥','🧣','🧤','👙','🩲','🥼','👟','👞','🥿',
        '👠','👢','🦺','🧢','👒','🎒','💼','👜','👝','🕶️',
        '🥽','🧹','🪠','🧽','🪣','🪥','🚿','🛁','🧵','🪡','🧶'
      ]
    },

    {
      nome: '🍔 Alimentação e Bebidas',
      emojis: [
        '🍔','🍕','🌭','🥪','🌮','🌯','🥗','🍿','🍱','🍣',
        '🍙','🍜','🍲','🍛','🍡','🥟','🍤','🍦','🍰','🍩',
        '🍪','🍫','🍯','🥛','☕','🍵','🧃','🥤','🧉','🍾',
        '🍷','🍸','🍹','🍺','🍻','🍽️','🍴','🥄','🧑‍🍳','🍳'
      ]
    },

    {
      nome: '🛠️ Serviços, Status e Atendimento',
      emojis: [
        '🛠️','⚙️','🔧','🔨','🪛','📦','🚚','🚛','🛵','🚲',
        '🛒','🛍️','💳','💵','💰','🏷️','🛎️','📞','📱','💬',
        '✉️','📅','⏰','⏱️','📍','🗺️','🔒','🔓','🔑','📝',
        '📊','📈','📉','📋','📌','🔍','💡','🚀','🔄','✅',
        '❌','⚠️','ℹ️','#️⃣','🔔'
      ]
    }

  ];

  const picker = document.createElement('div');

  picker.id = 'emojiPicker';

  picker.innerHTML = `
    <div class="emoji-picker-box">

      <div class="emoji-picker-header">
        <strong>Escolha um ícone</strong>

        <button
          type="button"
          onclick="closeEmojiPicker()"
        >
          ×
        </button>
      </div>

      <div class="emoji-picker-content">

        ${grupos.map(grupo => `

          <div class="emoji-category">

            <div class="emoji-category-title">
              ${grupo.nome}
            </div>

            <div class="emoji-grid">

              ${grupo.emojis.map(emoji => `
                <button
                  type="button"
                  class="emoji-option"
                  onclick="selectEmoji('${emoji}')"
                >
                  ${emoji}
                </button>
              `).join('')}

            </div>

          </div>

        `).join('')}

      </div>

    </div>
  `;

  document.body.appendChild(picker);
}

function selectEmoji(emoji){

  const input = document.getElementById('cIcon');

  if(input){
    input.value = emoji;
  }

  closeEmojiPicker();
}

function closeEmojiPicker(){

  const picker = document.getElementById('emojiPicker');

  if(picker){
    picker.remove();
  }

}
function addCategoria(e){e.preventDefault();state.categorias.push({id:uid(),name:document.getElementById('cName').value.trim(),icon:document.getElementById('cIcon').value||'📦'});save();closeModal();toast('Categoria criada')}
function removeCategoria(id){if(state.despesas.some(x=>x.categoria_id===id)){toast('Não é possível excluir: categoria possui despesas');return}state.categorias=state.categorias.filter(x=>x.id!==id);save();toast('Categoria excluída')}
function openMetaModal(){
  openModal(`
    <button class="modal-close" onclick="closeModal()">×</button>

    <h2>Nova meta</h2>

    <form onsubmit="addMeta(event)">

      <div class="form-grid">

        <div class="field">
          <label>Nome da meta</label>
          <input
            id="mName"
            required
            placeholder="Ex.: Reserva"
          >
        </div>

        <div class="field">
          <label>Valor</label>
          <input
            id="mVal"
            required
            type="number"
            min=".01"
            step=".01"
            placeholder="500"
          >
        </div>

        <div class="field">
          <label>Prazo da meta</label>
          <input
            id="mPrazo"
            type="date"
          >
        </div>

      </div>

      <div class="actions">

        <button
          type="button"
          class="btn secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button class="btn">
          Salvar
        </button>

      </div>

    </form>
  `);
}
function addMeta(e){
  e.preventDefault();

  const nome=document.getElementById('mName').value.trim();
  const valor=Number(document.getElementById('mVal').value);
  const prazo=document.getElementById('mPrazo').value;

  state.metas.push({
    id:uid(),
    nome:nome,
    valor:valor,
    valorAtual:0,
    prazo:prazo
  });

  save();
  closeModal();

  rastrear('meta_criada','metas',{
    valor:valor,
    prazo:prazo
  });

  toast('Meta criada');
}
function adicionarDinheiroMeta(id){
  const meta=state.metas.find(x=>x.id===id);

  if(!meta)return;

  const valor=prompt(`Quanto você quer adicionar à meta "${meta.nome}"?`);

  if(valor===null)return;

  const valorNumerico=money(valor);

  if(valorNumerico<=0){
    toast('Informe um valor válido');
    return;
  }

  const valorAntes=Number(meta.valorAtual)||0;

  meta.valorAtual=valorAntes+valorNumerico;

  if(meta.valorAtual>Number(meta.valor)){
    meta.valorAtual=Number(meta.valor);
  }

  const valorAdicionado=meta.valorAtual-valorAntes;

  save();

  rastrear('meta_adicionada','metas',{
    meta:meta.nome,
    valor:valorAdicionado,
    valor_atual:meta.valorAtual
  });

  toast('Valor adicionado à meta');
}


function retirarDinheiroMeta(id){
  const meta=state.metas.find(x=>x.id===id);

  if(!meta)return;

  const valor=prompt(`Quanto você quer retirar da meta "${meta.nome}"?`);

  if(valor===null)return;

  const valorNumerico=money(valor);

  if(valorNumerico<=0){
    toast('Informe um valor válido');
    return;
  }

  const atual=Number(meta.valorAtual)||0;

  if(valorNumerico>atual){
    toast('Você não pode retirar mais do que já guardou');
    return;
  }

  meta.valorAtual=atual-valorNumerico;

  save();

  rastrear('meta_retirada','metas',{
    meta:meta.nome,
    valor:valorNumerico,
    valor_atual:meta.valorAtual
  });

  toast('Valor retirado da meta');
}


function removeItem(collection,id){if(!confirm('Excluir este registro?'))return;state[collection]=state[collection].filter(x=>x.id!==id);save();toast('Registro excluído')}


let toastTimer;

function toast(t){
  const x=document.getElementById('toast');

  if(!x)return;

  clearTimeout(toastTimer);

  x.textContent=t;
  x.classList.add('show');

  toastTimer=setTimeout(()=>{
    x.classList.remove('show');
  },2200);
}



function backup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`backup-dinheiro-do-mes-${selectedMonth()}.json`;a.click();URL.revokeObjectURL(a.href)}
function restore(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.despesas||!x.receitas)throw Error();state=x;save();toast('Backup restaurado')}catch{alert('Arquivo de backup inválido.')}};r.readAsText(file)}
document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.action==='backup')backup();if(b.dataset.action==='restore')document.getElementById('restoreInput').click()}));
document.getElementById('restoreInput').addEventListener('change',e=>e.target.files[0]&&restore(e.target.files[0]));



document.getElementById('prevMonth').onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()-1);

  rastrear('mes_anterior_visualizado','dashboard',{
    mes:selectedMonth()
  });

  render();
};

document.getElementById('nextMonth').onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()+1);

  rastrear('mes_proximo_visualizado','dashboard',{
    mes:selectedMonth()
  });

  render();
};






document.getElementById('menuBtn').onclick=()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('open')};
document.getElementById('overlay').onclick=()=>{document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open')};
document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});
rastrear('app_aberto','dashboard');

/* ==========================================
   TUTORIAL DE PRIMEIRO USO
   ========================================== */

const tutorialPassos = [

  {
    titulo: '👋 Bem-vindo ao Dinheiro do Mês',
    texto: 'Vamos mostrar rapidamente como usar o sistema para organizar seu dinheiro.'
  },


  {
  titulo: '💡 Importante!',
  texto: 'Os valores apresentados são meramente ilustrativos. Eles servem como base para os cálculos e ajudam você a entender, na prática, como funciona a gestão e o controle dos seus gastos.'
},

  {
    titulo: '💰 Comece pela sua renda',
    texto: 'Informe quanto você recebe no mês. Esse valor será usado para calcular seu dinheiro disponível e seus limites.'
  },

  {
    titulo: '🧾 Registre suas despesas',
    texto: 'Adicione seus gastos e escolha uma categoria. Assim você consegue descobrir para onde seu dinheiro está indo.'
  },

  {
    titulo: '🎯 Crie suas metas',
    texto: 'Quer guardar dinheiro para alguma coisa? Crie uma meta e acompanhe quanto já conseguiu guardar.'
  },

  {
    titulo: '📊 Acompanhe seu dinheiro',
    texto: 'No Dashboard você encontra seus principais números, gastos, limites, compromissos e sua saúde financeira.'
  },
{
  titulo: '💾 Faça backup dos seus dados',
  texto: 'As informações ficam armazenadas no navegador deste dispositivo. Se os dados do navegador forem apagados, suas informações poderão ser perdidas. Use a função "Backup" para salvar uma cópia e, se necessário, utilize "Restaurar" para recuperá-la.'
},

  {
  titulo: '🔒 Seus dados',
  texto: 'O sistema não solicita seus dados pessoais nem cria um perfil de usuário. As informações financeiras são registradas ficam armazenadas no navegador deste dispositivo, atualmente não contamos com sistema de cadastro ou login'
},

  


  {
    titulo: '🎉 Tudo pronto!',
    texto: 'Agora você já conhece o básico. Comece registrando sua renda e depois suas primeiras despesas.'
  }

];

let tutorialAtual = 0;

function abrirTutorial(){

  const tutorial = document.getElementById('tutorialPrimeiroUso');

  if(!tutorial)return;

  tutorialAtual = 0;

  mostrarPassoTutorial();

  tutorial.classList.add('aberto');
}

function mostrarPassoTutorial(){

  const conteudo = document.getElementById('tutorialConteudo');
  const botao = document.getElementById('tutorialProximo');

  if(!conteudo || !botao)return;

  const passo = tutorialPassos[tutorialAtual];

  conteudo.innerHTML = `
    <div class="tutorial-passo">
      <div class="tutorial-indicador">
        ${tutorialAtual + 1} de ${tutorialPassos.length}
      </div>

      <h2>${passo.titulo}</h2>

      <p>${passo.texto}</p>
    </div>
  `;

  if(tutorialAtual === 0){
    botao.textContent = 'Começar';
  }else if(tutorialAtual === tutorialPassos.length - 1){
    botao.textContent = 'Começar a usar';
  }else{
    botao.textContent = 'Próximo';
  }
}

function proximoTutorial(){

  if(tutorialAtual < tutorialPassos.length - 1){

    tutorialAtual++;

    mostrarPassoTutorial();

  }else{

    concluirTutorial();

  }
}

function pularTutorial(){
  concluirTutorial();
}

function concluirTutorial(){

  localStorage.setItem(
    'dinheiro_do_mes_tutorial',
    'concluido'
  );

  const tutorial =
    document.getElementById('tutorialPrimeiroUso');

  if(tutorial){
    tutorial.classList.remove('aberto');
  }
}
/*localStorage.removeItem('dinheiro_do_mes_tutorial');*/

/* Abre somente no primeiro uso */

function verificarTutorial(){

  const concluido =
    localStorage.getItem('dinheiro_do_mes_tutorial');

  if(concluido !== 'concluido'){

    setTimeout(() => {
      abrirTutorial();
    }, 500);

  }

}

verificarTutorial();

render();

const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {

  function atualizarTema() {

    const modoEscuro =
      document.body.classList.contains('modo-escuro');

    if (modoEscuro) {
      themeToggle.innerHTML = '☀️ <span>Modo claro</span>';
    } else {
      themeToggle.innerHTML = '🌙 <span>Modo escuro</span>';
    }
  }

  // Recupera o tema salvo
  const temaSalvo = localStorage.getItem('dinheiro_do_mes_tema');

  if (temaSalvo === 'escuro') {
    document.body.classList.add('modo-escuro');
  }

  themeToggle.addEventListener('click', function () {

    document.body.classList.toggle('modo-escuro');

    // Salva a escolha
    if (document.body.classList.contains('modo-escuro')) {
      localStorage.setItem('dinheiro_do_mes_tema', 'escuro');
    } else {
      localStorage.setItem('dinheiro_do_mes_tema', 'claro');
    }

    atualizarTema();

  });

  atualizarTema();

}


/* ================================
   TELA DE CARREGAMENTO
================================ */

window.addEventListener('load', function () {
  const telaLoading = document.getElementById('telaLoading');

  if (telaLoading) {
    setTimeout(function () {
      telaLoading.classList.add('oculta');

      setTimeout(function () {
        telaLoading.remove();
      }, 1500);
    }, 1500);
  }
});

/* ================================
   VIBRAÇÃO DOS BOTÕES
================================ */
function vibrar() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(50);
      console.log("Vibração solicitada");
    } else {
      console.log("Este navegador não suporta navigator.vibrate");
    }
  } catch (erro) {
    console.log("Erro na vibração:", erro);
  }
}
document.addEventListener('click', function (event) {

  const botao = event.target.closest('button');

  if (!botao) return;

  vibrar('leve');

});
const SUPABASE_URL='https://kbdhjmyudlnaqjfhmzox.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZGhqbXl1ZGxuYXFqZmhtem94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxMzY1MjcsImV4cCI6MjEwMzcxMjUyN30.2FZnISm2sehrr_Z2RimG6qSkF_5Xzk_Igub-XJAMcd4';
let db=null;








let visitanteId = localStorage.getItem('dinheiro_do_mes_visitante');

if(!visitanteId){
  visitanteId = crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now()+'-'+Math.random();

  localStorage.setItem('dinheiro_do_mes_visitante', visitanteId);
}



let sessaoId = sessionStorage.getItem('dinheiro_do_mes_sessao');

if(!sessaoId){
  sessaoId = crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now()+'-'+Math.random();

  sessionStorage.setItem('dinheiro_do_mes_sessao', sessaoId);
}

async function rastrear(evento, pagina='', detalhes={}){

  if(!db)return;

  try{

await db
  .from('uso_app')
  .insert({
    visitante_id:visitanteId,
    sessao_id:sessaoId,
    evento:evento,
    pagina:pagina,
    detalhes:detalhes
  });

  }catch(e){

    console.warn('Erro ao registrar rastreamento:',e);

  }
}





try{ if(window.supabase) db=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY); }catch(e){ console.warn('Supabase ainda não está sendo usado no MVP:',e); }

const KEY='dinheiro_do_mes_mvp_v1';
const defaultCategories=[
 {id:'cat-1',name:'Moradia',icon:'🏠'},{id:'cat-2',name:'Alimentação',icon:'🍔'},
 {id:'cat-3',name:'Transporte',icon:'🚗'},{id:'cat-4',name:'Contas',icon:'💡'},
 {id:'cat-5',name:'Saúde',icon:'💊'},{id:'cat-6',name:'Lazer',icon:'🎮'},
 {id:'cat-7',name:'Compras',icon:'🛒'},{id:'cat-8',name:'Educação',icon:'📚'},
 {id:'cat-9',name:'Dívidas',icon:'💳'},{id:'cat-10',name:'Outros',icon:'📦'}
];
let state=loadState();
let currentDate=new Date(); currentDate.setDate(1);

function loadState(){
 const saved=localStorage.getItem(KEY);
 if(saved) return JSON.parse(saved);
 return {
  income:3000,
  rendas:[
    {
mes:`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`,
      valor:3000
    }
  ],
  receitas:[],
  despesas:[],
  categorias:defaultCategories,
  metas:[]
};
}
function save(){localStorage.setItem(KEY,JSON.stringify(state)); render(); }
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random();}
function brl(n){return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n)||0)}

function monthKey(date){
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');

  return `${ano}-${mes}`;
}


function selectedMonth(){
  const ano = currentDate.getFullYear();
  const mes = String(currentDate.getMonth() + 1).padStart(2, '0');

  return `${ano}-${mes}`;
}


function dateBR(d){return new Date(d+'T12:00:00').toLocaleDateString('pt-BR')}
function money(v){return Number(String(v).replace(/\./g,'').replace(',','.'))||0}
function isSameMonth(d,m){return String(d).slice(0,7)===m}
function monthLabel(){return currentDate.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}).replace(/^./,x=>x.toUpperCase())}



function despesasMes(){
  const mesAtual=selectedMonth();
  const resultado=[];

  state.despesas.forEach(x=>{
    const parcelas=Number(x.parcelas)||1;

    if(parcelas===1){
      if(isSameMonth(x.data,mesAtual)){
        resultado.push(x);
      }
      return;
    }

    const dataInicial=new Date(x.data+'T12:00:00');
    const anoInicial=dataInicial.getFullYear();
    const mesInicial=dataInicial.getMonth();

    const dataSelecionada=new Date(mesAtual+'-01T12:00:00');
    const anoSelecionado=dataSelecionada.getFullYear();
    const mesSelecionado=dataSelecionada.getMonth();

    const diferencaMeses=
      (anoSelecionado-anoInicial)*12+
      (mesSelecionado-mesInicial);

    if(diferencaMeses>=0 && diferencaMeses<parcelas){
      resultado.push({
        ...x,
        valor:Number(x.valor)/parcelas,
        valorTotal:Number(x.valor),
        parcelaAtual:diferencaMeses+1
      });
    }
  });

  return resultado;
}

function compromissosFuturos(){
  const mesSelecionado=selectedMonth();

  let totalFuturo=0;
  let parcelasRestantes=0;

  state.despesas.forEach(x=>{
    const parcelas=Number(x.parcelas)||1;

    if(parcelas<=1)return;

    const valorParcela=Number(x.valor)/parcelas;

    const dataInicial=new Date(x.data+'T12:00:00');
    const anoInicial=dataInicial.getFullYear();
    const mesInicial=dataInicial.getMonth();

    const dataSelecionada=new Date(mesSelecionado+'-01T12:00:00');
    const anoSelecionado=dataSelecionada.getFullYear();
    const mesSelecionadoNumero=dataSelecionada.getMonth();

    const diferencaMeses=
      (anoSelecionado-anoInicial)*12+
      (mesSelecionadoNumero-mesInicial);

    if(diferencaMeses>=0 && diferencaMeses<parcelas){

      const parcelaAtual=diferencaMeses+1;
      const restantes=parcelas-parcelaAtual+1;

      totalFuturo+=valorParcela*restantes;
      parcelasRestantes+=restantes;
    }
  });

  return {
    total:totalFuturo,
    parcelas:parcelasRestantes
  };
}



function saldoPrevisto(){
  const r=receitasMes();
  const d=despesasMes();

  const renda=state.income+total(r);
  const despesas=total(d);
  const metas=state.metas.reduce(
    (s,m)=>s+(Number(m.valorAtual)||0),
    0
  );

  const compromissos=compromissosFuturos();

  return renda-despesas-metas;
}


function saldoPrevistoProximoMes(){
  const proximoMes=new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()+1,
    1
  );

const mes =
  `${proximoMes.getFullYear()}-${String(proximoMes.getMonth()+1).padStart(2,'0')}`;

  const renda=rendaDoMes(mes);

  const receitasExtrasProximoMes=state.receitas
  .filter(x=>isSameMonth(x.data,mes))
  .reduce((s,x)=>s+Number(x.valor),0);

  const despesasProximoMes=state.despesas.filter(x=>{
    const parcelas=Number(x.parcelas)||1;

    if(parcelas===1){
      return isSameMonth(x.data,mes);
    }

    const dataInicial=new Date(x.data+'T12:00:00');

    const diferencaMeses=
      (proximoMes.getFullYear()-dataInicial.getFullYear())*12+
      (proximoMes.getMonth()-dataInicial.getMonth());

    return diferencaMeses>=0 && diferencaMeses<parcelas;
  }).reduce((s,x)=>{
    const parcelas=Number(x.parcelas)||1;
    return s+(Number(x.valor)/parcelas);
  },0);

  const metas=state.metas.reduce(
    (s,m)=>s+(Number(m.valorAtual)||0),
    0
  );

  return renda+receitasExtrasProximoMes-despesasProximoMes-metas;
}

function receitasMes(){return state.receitas.filter(x=>isSameMonth(x.data,selectedMonth()))}
function total(arr){return arr.reduce((s,x)=>s+Number(x.valor),0)}


function rendaDoMes(mes=selectedMonth()){
  if(!state.rendas || !state.rendas.length){
    return Number(state.income)||0;
  }

  const historico=[...state.rendas]
    .filter(x=>String(x.mes).slice(0,7)<=mes)
    .sort((a,b)=>String(a.mes).localeCompare(String(b.mes)));

  if(!historico.length){
    return 0;
  }

  return Number(historico[historico.length-1].valor)||0;
}



function catName(id){return state.categorias.find(c=>c.id===id)?.name||'Outros'}
function catIcon(id){return state.categorias.find(c=>c.id===id)?.icon||'📦'}

const views={
 dashboard:['Dashboard','Veja para onde seu dinheiro está indo.'],
 receitas:['Receitas','Cadastre o dinheiro que entra.'],
 despesas:['Despesas','Registre cada saída e entenda seus gastos.'],
 categorias:['Categorias','Organize suas despesas.'],
 metas:['Metas','Defina quanto quer economizar.'],
 historico:['Histórico','Consulte suas movimentações.']
};
function setView(v){
 document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
 document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
 document.getElementById('view-'+v).classList.add('active');
 document.getElementById('pageTitle').textContent=views[v][0];
 document.getElementById('pageSubtitle').textContent=views[v][1];
 document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('open');
 render();
  rastrear('tela_acessada',v);
}



function render(){document.getElementById('currentMonthLabel').textContent=monthLabel(); renderDashboard();renderReceitas();renderDespesas();renderCategorias();renderMetas();renderHistorico();}

function renderDashboard(){
 const r=receitasMes();
 const d=despesasMes();
const compromissos=compromissosFuturos();
const saldoPrevistoAtual=saldoPrevistoProximoMes();

 const income=rendaDoMes()+total(r);
 const spent=total(d);

  const hojeString = today();

const despesasHoje = d
  .filter(x => x.data === hojeString)
  .reduce((s,x) => s + Number(x.valor), 0);

  const despesasFixas = d
  .filter(x => x.tipo === 'fixa')
  .reduce((s,x) => s + Number(x.valor), 0);

const despesasVariaveis = d
  .filter(x => x.tipo !== 'fixa')
  .reduce((s,x) => s + Number(x.valor), 0);

  const aposFixas =
  income - despesasFixas;

const percentualComprometidoFixas =
  income > 0
  ? (despesasFixas / income * 100)
  : 0;

  const percentualFixas =
  income > 0
  ? (despesasFixas / income * 100)
  : 0;

const percentualVariaveis =
  income > 0
  ? (despesasVariaveis / income * 100)
  : 0;

  
  
const totalGuardadoMetas=state.metas.reduce(
  (s,m)=>s+(Number(m.valorAtual)||0),
  0
);

const balance=income-spent-totalGuardadoMetas;

 const prev=new Date(currentDate);
 prev.setMonth(prev.getMonth()-1);

const prevMes =
  `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}`;

const prevD=state.despesas.filter(
  x=>isSameMonth(x.data,prevMes)
);

 const prevSpent=total(prevD);
 const diff=spent-prevSpent;
  let variacaoPercentual=0;

if(prevSpent>0){
  variacaoPercentual=(diff/prevSpent)*100;
}



  let comparacaoMes='';

if(prevSpent===0){

  comparacaoMes=`
    <div class="insight">
      📊 Ainda não há gastos registrados no mês anterior
      para fazer uma comparação.
    </div>
  `;

}else if(diff>0){

  comparacaoMes=`
    <div class="insight">
      📈 Você gastou
      <strong>${brl(diff)}</strong>
      a mais que no mês passado
      (${variacaoPercentual.toFixed(1)}%).
    </div>
  `;

}else if(diff<0){

  comparacaoMes=`
    <div class="insight">
      📉 Você gastou
      <strong>${brl(Math.abs(diff))}</strong>
      a menos que no mês passado
      (${Math.abs(variacaoPercentual).toFixed(1)}%).
    </div>
  `;

}else{

  comparacaoMes=`
    <div class="insight">
      ➖ Seus gastos estão iguais aos do mês passado.
    </div>
  `;
}

 const groups={};

 d.forEach(x=>{
   groups[x.categoria_id]=(groups[x.categoria_id]||0)+Number(x.valor);
 });

 const rows=Object.entries(groups)
   .sort((a,b)=>b[1]-a[1]);

 const max=rows[0]?.[1]||1;



  

  const maiorCategoria =
  rows.length
  ? rows[0][0]
  : null;

const maiorCategoriaValor =
  rows.length
  ? rows[0][1]
  : 0;

const maiorCategoriaPercentual =
  income>0
  ? (maiorCategoriaValor/income*100)
  : 0;

  let alertaCategoria='';

if(maiorCategoria){

  if(maiorCategoriaPercentual>=30){

    alertaCategoria=`
      <div class="insight">
        🚨 <strong>Atenção:</strong>
        ${catIcon(maiorCategoria)}
        ${catName(maiorCategoria)}
        já representa
        <strong>${maiorCategoriaPercentual.toFixed(1)}%</strong>
        da sua renda.
      </div>
    `;

  }else if(maiorCategoriaPercentual>=20){

    alertaCategoria=`
      <div class="insight">
        🟠 <strong>Fique atento:</strong>
        ${catIcon(maiorCategoria)}
        ${catName(maiorCategoria)}
        representa
        <strong>${maiorCategoriaPercentual.toFixed(1)}%</strong>
        da sua renda.
      </div>
    `;

  }else{

    alertaCategoria=`
      <div class="insight">
        🟢 Sua maior categoria de gasto é
        <strong>${catName(maiorCategoria)}</strong>,
        representando
        <strong>${maiorCategoriaPercentual.toFixed(1)}%</strong>
        da sua renda.
      </div>
    `;
  }
}

 /*
  * CÁLCULO DO LIMITE DIÁRIO
  */

 const hoje=new Date();

 let diasRestantes;

 if(
   hoje.getFullYear()===currentDate.getFullYear() &&
   hoje.getMonth()===currentDate.getMonth()
 ){
   const ultimoDia=new Date(
     currentDate.getFullYear(),
     currentDate.getMonth()+1,
     0
   ).getDate();

   diasRestantes=Math.max(
     1,
     ultimoDia-hoje.getDate()+1
   );

 }else{

   /*
    * Para meses diferentes do atual,
    * usamos a quantidade total de dias do mês.
    */

   diasRestantes=new Date(
     currentDate.getFullYear(),
     currentDate.getMonth()+1,
     0
   ).getDate();

 }

 const limiteDiario=
   balance>0 ? balance/diasRestantes : 0;

  let diasDecorridos;

if(
  hoje.getFullYear()===currentDate.getFullYear() &&
  hoje.getMonth()===currentDate.getMonth()
){
  diasDecorridos=hoje.getDate();
}else{
  diasDecorridos=new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()+1,
    0
  ).getDate();
}

const mediaDiaria=
  diasDecorridos>0
  ? spent/diasDecorridos
  : 0;

  const previsaoDespesas =
  mediaDiaria * (diasDecorridos + diasRestantes);

  const previsaoSaldo =
  income - previsaoDespesas;

  const diferencaDiaria =
  Math.abs(limiteDiario - mediaDiaria);

let pontuacao = 100;

if(balance < 0){
  pontuacao -= 40;
}

if(mediaDiaria > limiteDiario && limiteDiario > 0){
  pontuacao -= 20;
}

if(percentualFixas >= 50){
  pontuacao -= 20;
}

if(diff > 0 && prevSpent > 0){
  pontuacao -= 10;
}

pontuacao = Math.max(0, pontuacao);




let nivelPontuacao = '';

if(balance < 0){
  nivelPontuacao = '🔴 Crítica';
}else if(pontuacao >= 80){
  nivelPontuacao = '🟢 Excelente';
}else if(pontuacao >= 60){
  nivelPontuacao = '🟡 Boa';
}else if(pontuacao >= 40){
  nivelPontuacao = '🟠 Atenção';
}else{
  nivelPontuacao = '🔴 Crítica';
}


  let explicacaoPontuacao = '';

if(balance < 0){

  explicacaoPontuacao =
    'Seus gastos ultrapassaram o dinheiro disponível.';

}else if(mediaDiaria > limiteDiario && limiteDiario > 0){

  explicacaoPontuacao =
    'Sua média de gastos está acima do limite diário recomendado.';

}else if(percentualFixas >= 50){

  explicacaoPontuacao =
    'Mais da metade da sua renda está comprometida com despesas fixas.';

}else if(diff > 0 && prevSpent > 0){

  explicacaoPontuacao =
    'Seus gastos aumentaram em relação ao mês anterior.';

}else{

  explicacaoPontuacao =
    'Seus gastos estão sob controle neste mês.';
}

  

  let orientacaoDiaria='';

if(balance<=0){

  orientacaoDiaria=`
    <div class="insight">
      🔴 Não há limite disponível para novos gastos.
    </div>
  `;

}else if(mediaDiaria>limiteDiario){

  orientacaoDiaria=`
    <div class="insight">
      📉 Para voltar ao limite recomendado,
      tente reduzir aproximadamente
      <strong>${brl(diferencaDiaria)}</strong>
      por dia.
    </div>
  `;

}else{

  orientacaoDiaria=`
    <div class="insight">
      💰 Você está economizando aproximadamente
      <strong>${brl(diferencaDiaria)}</strong>
      por dia em relação ao limite.
    </div>
  `;
}

  let comparacaoDiaria='';

if(balance<=0){
  comparacaoDiaria=`
    <div class="insight">
      🔴 Seus gastos já ultrapassaram o dinheiro disponível.
    </div>
  `;
}else if(mediaDiaria>limiteDiario){
  comparacaoDiaria=`
    <div class="insight">
      🟠 <strong>Atenção:</strong>
      você está gastando acima do limite diário recomendado.
    </div>
  `;
}else{
  comparacaoDiaria=`
    <div class="insight">
      🟢 <strong>Muito bom:</strong>
      você está gastando abaixo do limite diário recomendado.
    </div>
  `;
}



  
let statusGasto='';

// Remove qualquer estado anterior
document.body.classList.remove(
  'saude-excelente',
  'saude-boa',
  'saude-atencao',
  'saude-critica'
);

if(balance<=0){

  document.body.classList.add('saude-critica');

  statusGasto=`
    <div class="insight">
      🔴 <strong>Situação crítica</strong><br>
      Seus gastos já ultrapassaram o dinheiro disponível.
    </div>
  `;

}else if(limiteDiario<50){

  document.body.classList.add('saude-atencao');

  statusGasto=`
    <div class="insight">
      🟠 <strong>Atenção</strong><br>
      Seu limite diário está baixo. Evite gastos desnecessários.
    </div>
  `;

}else{

  document.body.classList.add('saude-excelente');

  statusGasto=`
    <div class="insight">
      🟢 <strong>Situação tranquila</strong><br>
      Seu dinheiro está dentro de um limite confortável.
    </div>
  `;
}




 /*
  * INSIGHTS
  */

 let insights=[];

 if(income>0 && rows.length){

   insights.push(
     `${catIcon(rows[0][0])} Você gastou ${(rows[0][1]/income*100).toFixed(1)}% da sua renda com ${catName(rows[0][0]).toLowerCase()}.`
   );

 }

 if(diff>0){

   insights.push(
     `⚠️ Suas despesas aumentaram ${brl(diff)} em relação ao mês passado.`
   );

 }else if(diff<0){

   insights.push(
     `✅ Suas despesas caíram ${brl(Math.abs(diff))} em relação ao mês passado.`
   );

 }

 if(rows.length){

   insights.push(
     `💡 Seu maior gasto este mês foi ${catName(rows[0][0]).toLowerCase()}.`
   );

 }

 if(income>0){

   if(balance>=0){

     insights.push(
       `💰 Você ainda tem ${brl(balance)} disponíveis neste mês.`
     );

   }else{

     insights.push(
       `🚨 Seus gastos ultrapassaram sua renda em ${brl(Math.abs(balance))}.`
     );

   }

 }


 /*
  * DASHBOARD
  */

 document.getElementById('view-dashboard').innerHTML=`

<div class="panel" style="margin-bottom:16px">
  <h2>Saúde financeira</h2>

  <div class="insight">
    🎯 Pontuação do mês:
    <strong>${pontuacao}/100</strong>
  </div>
  <div class="insight">
  ${nivelPontuacao}
</div>

<div class="insight">
  💡 ${explicacaoPontuacao}
</div>

</div>


 <div class="cards">

   <div class="card">
     <div class="label">Dinheiro do mês</div>
     <div class="value">${brl(income)}</div>
   </div>

   <div class="card">
     <div class="label">Receitas extras</div>
     <div class="value positive">${brl(total(r))}</div>
   </div>

   <div class="card">
     <div class="label">Despesas</div>
     <div class="value negative">${brl(spent)}</div>
   </div>

   <div class="card">
  <div class="label">Despesas de hoje</div>
  <div class="value negative">${brl(despesasHoje)}</div>
</div>

   <div class="card">
     <div class="label">Disponível</div>
     <div class="value ${balance<0?'negative':'positive'}">
       ${brl(balance)}
     </div>
   </div>

   <div class="card">
  <div class="label">Guardado nas metas</div>
  <div class="value positive">
    ${brl(totalGuardadoMetas)}
  </div>
</div>

<div class="card">
  <div class="label">Compromissos futuros</div>
  <div class="value">
    ${brl(compromissos.total)}
  </div>
  <div class="muted">
    ${compromissos.parcelas} parcelas restantes
  </div>
</div>


<div class="card">
  <div class="label">
    Saldo previsto — ${
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth()+1,
        1
      ).toLocaleDateString('pt-BR',{month:'long'})
    }
  </div>

  <div class="value ${saldoPrevistoAtual>=0?'positive':'negative'}">
    ${brl(saldoPrevistoAtual)}
  </div>

  <div class="muted">
    Estimativa para o próximo mês
  </div>
</div>

 </div>


 <div class="grid2">

   <div class="panel">

     <h2>Para onde foi seu dinheiro?</h2>

     ${
       rows.length

       ?

       rows.map(([id,val])=>`

         <div class="bar-row">

           <div class="bar-head">

             <span>
               ${catIcon(id)} ${catName(id)}
             </span>

             <strong>
               ${brl(val)}
             </strong>

             <small>
  ${income>0 ? (val/income*100).toFixed(1) : 0}% da renda
</small>

           </div>

           <div class="bar">

             <i style="width:${Math.min(100,val/max*100)}%"></i>

           </div>

         </div>

       `).join('')

       :

       '<div class="empty">Nenhuma despesa registrada neste mês.</div>'
     }

   </div>


   <div class="panel">

     <h2>Quanto posso gastar?</h2>

     ${statusGasto}

     ${
       balance>0

       ?

       `

       <div class="insight">

         💰 Você tem
         <strong>${brl(balance)}</strong>
         disponíveis.

       </div>

       <div class="insight">

         📅 Faltam
         <strong>${diasRestantes} dias</strong>
         para terminar este mês.

       </div>

       <div class="insight">

         🎯 Você pode gastar aproximadamente
         <strong>${brl(limiteDiario)}</strong>
         por dia.

       </div>


       <div class="insight">
  📊 Sua média de gastos está em
  <strong>${brl(mediaDiaria)}</strong>
  por dia.
</div>

${comparacaoDiaria}
${orientacaoDiaria}
<div class="insight">
  🔮 Se continuar nesse ritmo,
  seus gastos no mês podem chegar a
  <strong>${brl(previsaoDespesas)}</strong>.
</div>

<div class="insight">
  ${
    previsaoSaldo>=0
    ?
    `💰 Sua previsão de saldo no final do mês é
     <strong>${brl(previsaoSaldo)}</strong>.`
    :
    `🔴 Nesse ritmo, você poderá terminar o mês
     com um déficit de
     <strong>${brl(Math.abs(previsaoSaldo))}</strong>.`
  }
</div>

       `

       :

       `

       <div class="insight">

         🚨 Você não possui saldo disponível
         para este mês.

       </div>

       `
     }

   </div>

 </div>

 <div class="panel" style="margin-top:16px">
  <h2>Despesas fixas e variáveis</h2>

  <div class="insight">
    🏠 Despesas fixas:
    <strong>${brl(despesasFixas)}</strong>
    (${percentualFixas.toFixed(1)}% da renda)
  </div>

  <div class="insight">
  💰 Depois das despesas fixas,
  você tem
  <strong>${brl(aposFixas)}</strong>
  disponíveis para os demais gastos.
</div>

<div class="insight">
  📌 Você já comprometeu
  <strong>${percentualComprometidoFixas.toFixed(1)}%</strong>
  da sua renda com despesas fixas.
</div>

  <div class="insight">
    🛒 Despesas variáveis:
    <strong>${brl(despesasVariaveis)}</strong>
    (${percentualVariaveis.toFixed(1)}% da renda)
  </div>
</div>


 <div class="panel" style="margin-top:16px">

   <h2>Insights</h2>

   ${alertaCategoria}
   ${comparacaoMes}

   ${
     insights.map(x=>`

       <div class="insight">
         ${x}
       </div>

     `).join('')

     ||

     '<div class="empty">Cadastre algumas despesas para receber análises.</div>'
   }

 </div>


 <div class="panel" style="margin-top:16px">

   <h2>Configuração do mês</h2>

   <div class="toolbar">

     <div>

       <div class="label">
         Renda mensal base
       </div>

       <div class="value">
  ${brl(rendaDoMes())}
</div>

     </div>

     <button
       class="btn"
       onclick="openIncomeModal()"
     >
       Alterar renda
     </button>

   </div>

 </div>

 `;
}
function renderReceitas(){
 const rows=receitasMes().sort((a,b)=>b.data.localeCompare(a.data));
 document.getElementById('view-receitas').innerHTML=`<div class="toolbar"><div><strong>Receitas de ${monthLabel()}</strong><div class="muted">Além da renda mensal base, registre entradas extras.</div></div><button class="btn" onclick="openReceitaModal()">+ Nova receita</button></div>
 <div class="table-wrap">${rows.length?`<table class="table"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td>${dateBR(x.data)}</td><td>${esc(x.descricao)}</td><td>${esc(x.categoria||'Renda extra')}</td><td class="money">${brl(x.valor)}</td><td>


<button class="btn danger" onclick="removeItem('receitas','${x.id}')">Excluir</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhuma receita extra neste mês.</div>'}</div>`;
}

function renderDespesas(){
  const rows=despesasMes().sort((a,b)=>b.data.localeCompare(a.data));

  document.getElementById('view-despesas').innerHTML=`
    <div class="toolbar">
      <div>
        <strong>Despesas de ${monthLabel()}</strong>
        <div class="muted">Registre até os pequenos gastos.</div>
      </div>
      <button class="btn" onclick="openDespesaModal()">+ Nova despesa</button>
    </div>

    <div class="table-wrap">
      ${
        rows.length
        ?
        `<table class="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Parcelamento</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            ${
              rows.map(x=>`
                <tr>
                  <td>${dateBR(x.data)}</td>

                  <td>${esc(x.descricao)}</td>

                  <td>
                    ${catIcon(x.categoria_id)}
                    ${esc(catName(x.categoria_id))}
                  </td>

                  <td>
                    ${x.tipo==='fixa'?'Fixa':'Variável'}
                  </td>

                  <td class="money">
                    ${brl(x.valor)}
                  </td>

                  <td>
                    ${
                      (Number(x.parcelas)||1)>1
                      ?
                      `Parcela ${x.parcelaAtual}/${x.parcelas}`
                      :
                      'À vista'
                    }
                  </td>

                  <td>
                    <button
                      class="btn danger"
                      onclick="removeItem('despesas','${x.id}')">
                      Excluir
                    </button>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>`
        :
        '<div class="empty">Nenhuma despesa neste mês.</div>'
      }
    </div>
  `;
}


function renderCategorias(){
 document.getElementById('view-categorias').innerHTML=`<div class="toolbar"><div><strong>Suas categorias</strong><div class="muted">As categorias ajudam a identificar os maiores gastos.</div></div><button class="btn" onclick="openCategoriaModal()">+ Nova categoria</button></div><div class="panel"><div class="chips">${state.categorias.map(c=>`<span class="chip">${c.icon} ${esc(c.name)} ${state.categorias.length>1?`<button style="border:0;background:none;cursor:pointer" onclick="removeCategoria('${c.id}')">×</button>`:''}</span>`).join('')}</div></div>`;
}

function renderMetas(){
 const d=despesasMes();
const income=rendaDoMes()+total(receitasMes());
 const saved=Math.max(0,income-total(d));

 document.getElementById('view-metas').innerHTML=`
 <div class="toolbar">
   <div>
     <strong>Metas de economia</strong>
     <div class="muted">Acompanhe o quanto você consegue guardar.</div>
   </div>

   <button class="btn" onclick="openMetaModal()">
     + Nova meta
   </button>
 </div>

 <div class="panel">

   <div class="insight">
     💰 Disponível antes das metas:
     <strong>${brl(saved)}</strong>
   </div>

   ${
     state.metas.length

     ?

     state.metas.map(m=>{

       const valorMeta=Number(m.valor)||0;
       const valorAtual=Number(m.valorAtual)||0;




let mensalNecessario=0;
let diarioNecessario=0;
let diasMeta=0;
let metaVencida=false;

if(m.prazo && valorAtual<valorMeta){

  const hoje=new Date();
  const prazo=new Date(m.prazo+'T12:00:00');

  const diferenca=prazo-hoje;

  diasMeta=Math.ceil(diferenca/(1000*60*60*24));

  if(diasMeta<=0){

    metaVencida=true;

  }else if(diasMeta<=30){

    diarioNecessario=(valorMeta-valorAtual)/diasMeta;

  }else{

    const mesesRestantes=
      (prazo.getFullYear()-hoje.getFullYear())*12+
      (prazo.getMonth()-hoje.getMonth());

    if(mesesRestantes>0){
      mensalNecessario=(valorMeta-valorAtual)/mesesRestantes;
    }

  }
}
       const pct=
         valorMeta>0
         ? Math.min(100,valorAtual/valorMeta*100)
         : 0;

       const falta=
         Math.max(0,valorMeta-valorAtual);

       return `

       <div class="goal">

         <div style="flex:1">

           <strong>${esc(m.nome)}</strong>

     <div class="muted">
  Meta: ${brl(valorMeta)}
</div>

${m.prazo ? `
  <div class="muted">
    📅 Prazo: ${dateBR(m.prazo)}
  </div>
` : ''}

           

           <div class="progress">
             <i style="width:${pct}%"></i>
           </div>

           <div class="muted">
             ${brl(valorAtual)}
             de
             ${brl(valorMeta)}
             (${pct.toFixed(0)}%)
           </div>


${metaVencida ? `
  <div class="muted">
    🔴 O prazo desta meta já terminou.
  </div>
` : diarioNecessario>0 ? `
  <div class="muted">
    🎯 Faltam aproximadamente
    <strong>${diasMeta} dias</strong>.
    Para atingir a meta, guarde cerca de
    <strong>${brl(diarioNecessario)}</strong>
    por dia.
  </div>
` : mensalNecessario>0 ? `
  <div class="muted">
    🎯 Para atingir a meta no prazo,
    guarde aproximadamente
    <strong>${brl(mensalNecessario)}</strong>
    por mês.
  </div>
` : ''}

           

           <div class="muted">
             ${
               falta>0
               ? `Falta ${brl(falta)} para atingir sua meta.`
               : '🎉 Meta atingida!'
             }
           </div>

         </div>

<button
  class="btn"
  onclick="adicionarDinheiroMeta('${m.id}')"
>
  + Adicionar
</button>

<button
  class="btn secondary"
  onclick="retirarDinheiroMeta('${m.id}')"
>
  − Retirar
</button>


         <button
           class="btn danger"
           onclick="removeItem('metas','${m.id}')"
         >
           Excluir
         </button>

       </div>

       `;

     }).join('')

     :

     '<div class="empty">Você ainda não criou uma meta.</div>'
   }

 </div>
 `;
}


function renderHistorico(){
 const all=[...state.receitas.map(x=>({...x,mov:'Entrada'})),...state.despesas.map(x=>({...x,mov:'Saída'}))].sort((a,b)=>b.data.localeCompare(a.data));
 document.getElementById('view-historico').innerHTML=`<div class="toolbar"><div><strong>Histórico completo</strong><div class="muted">${all.length} movimentação(ões)</div></div></div><div class="table-wrap">${all.length?`<table class="table"><thead><tr><th>Data</th><th>Movimento</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${all.map(x=>`<tr><td>${dateBR(x.data)}</td><td>${x.mov}</td><td>${esc(x.descricao)}</td><td class="money">${x.mov==='Entrada'?'+':'-'} ${brl(x.valor)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhuma movimentação registrada.</div>'}</div>`;
}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function today(){
  const d = new Date();

  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function openModal(html){document.getElementById('modal').innerHTML=html;document.getElementById('modalBackdrop').classList.add('open')}
function closeModal(){document.getElementById('modalBackdrop').classList.remove('open')}

function openIncomeModal(){

  const hoje=new Date();
  hoje.setDate(1);
const mesAtualSistema=monthKey(hoje);
  const mesSelecionado=selectedMonth();

  if(mesSelecionado < mesAtualSistema){
    toast('Não é possível alterar a renda de um mês anterior');
    return;
  }

  const rendaAtual=rendaDoMes();

  openModal(`
    <button class="modal-close" onclick="closeModal()">×</button>

    <h2>Renda mensal</h2>

    <div class="field">
      <label>Quanto você recebe por mês?</label>
      <input
        id="incomeInput"
        type="number"
        min="0"
        step=".01"
        value="${rendaAtual}"
      >
    </div>

    <div class="muted">
      Essa renda será válida a partir de ${monthLabel()} e continuará nos próximos meses até você alterá-la novamente.
    </div>

    <div class="actions">
      <button class="btn secondary" onclick="closeModal()">Cancelar</button>

      <button class="btn" onclick="
  const valor=Number(document.getElementById('incomeInput').value)||0;

  if(!state.rendas){
    state.rendas=[];
  }

  state.rendas=state.rendas.filter(
    x=>String(x.mes).slice(0,7)!==selectedMonth()
  );

  state.rendas.push({
    mes:selectedMonth(),
    valor:valor
  });

  state.income=valor;

  save();
  closeModal();

  rastrear('renda_cadastrada','dashboard',{
    mes:selectedMonth(),
    valor:valor
  });

  toast('Renda atualizada');
">
        Salvar
      </button>
    </div>
  `);
}



function openReceitaModal(){openModal(`<button class="modal-close" onclick="closeModal()">×</button><h2>Nova receita</h2><form onsubmit="addReceita(event)"><div class="form-grid"><div class="field full"><label>Descrição</label><input id="rDesc" required placeholder="Ex.: Freelance"></div><div class="field"><label>Valor</label><input id="rVal" required type="number" min="0.01" step=".01"></div><div class="field"><label>Data</label><input id="rDate" type="date" value="${today()}" required></div><div class="field full"><label>Tipo</label><select id="rCat"><option>Renda extra</option><option>Salário</option><option>Freelance</option><option>Outros</option></select></div></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn">Salvar</button></div></form>`)}
function addReceita(e){
  e.preventDefault();

  const descricao=document.getElementById('rDesc').value;
  const valor=Number(document.getElementById('rVal').value);
  const data=document.getElementById('rDate').value;
  const categoria=document.getElementById('rCat').value;

  state.receitas.push({
    id:uid(),
    descricao:descricao,
    valor:valor,
    data:data,
    categoria:categoria
  });

  save();
  closeModal();

  rastrear('receita_cadastrada','receitas',{
    valor:valor,
    categoria:categoria
  });

  toast('Receita cadastrada');
}



function openDespesaModal(){openModal(`<button class="modal-close" onclick="closeModal()">×</button><h2>Nova despesa</h2><form onsubmit="addDespesa(event)"><div class="form-grid"><div class="field full"><label>Descrição</label><input id="dDesc" required placeholder="Ex.: Supermercado"></div><div class="field"><label>Valor</label><input id="dVal" required type="number" min="0.01" step=".01"></div><div class="field"><label>Data</label>

<input id="dDate" type="date" value="${today()}" required></div><div class="field"><label>Categoria</label><select id="dCat">${state.categorias.map(c=>`<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join('')}</select></div>

<div 

class="field"><label>Tipo</label><select id="dType"><option value="variavel">Variável</option><option value="fixa">Fixa</option></select></div>

<div class="field">
  <label>Parcelas</label>
  <input
    id="dParcelas"
    type="number"
    min="1"
    step="1"
    value="1"
  >
</div>


<div class="field"><label>Forma de pagamento</label><select id="dPay"><option>Pix</option><option>Débito</option><option>Crédito</option><option>Dinheiro</option><option>Boleto</option><option>Outro</option></select></div><div class="field full"><label>Observação</label><textarea id="dObs" placeholder="Opcional"></textarea></div></div><div class="actions"><button type="button" class="btn secondary" onclick="closeModal()">Cancelar</button><button class="btn">Salvar</button></div></form>`)}



 
function addDespesa(e){
  e.preventDefault();

  const tipo=document.getElementById('dType').value;
  const parcelas=Number(document.getElementById('dParcelas').value)||1;

  state.despesas.push({
    id:uid(),
    descricao:document.getElementById('dDesc').value,
    valor:Number(document.getElementById('dVal').value),
    data:document.getElementById('dDate').value,
    categoria_id:document.getElementById('dCat').value,
    tipo:tipo,
    pagamento:document.getElementById('dPay').value,
    observacao:document.getElementById('dObs').value,
    parcelas:parcelas
  });

  save();
  closeModal();

  rastrear('despesa_cadastrada','despesas',{
    tipo:tipo,
    parcelas:parcelas
  });

  if(parcelas>1){
    rastrear('despesa_parcelada','despesas',{
      parcelas:parcelas
    });
  }

  toast('Despesa cadastrada');
}





function openCategoriaModal(){
  openModal(`
    <button class="modal-close" onclick="closeModal()">×</button>

    <h2>Nova categoria</h2>

    <form onsubmit="addCategoria(event)">

      <div class="form-grid">

        <div class="field">
          <label>Nome</label>
          <input id="cName" required placeholder="Ex.: Pets">
        </div>

        <div class="field">
          <label>Ícone</label>

          <input
  id="cIcon"
  value="📦"
  maxlength="2"
  readonly
  onclick="openEmojiPicker()"
  style="cursor:pointer;text-align:left"
>

        </div>

      </div>

      <div class="actions">
        <button type="button" class="btn secondary" onclick="closeModal()">
          Cancelar
        </button>

        <button class="btn">
          Salvar
        </button>
      </div>

    </form>
  `);
}

function openEmojiPicker(){

  const grupos = [

    {
      nome: '🧺 Lavanderia e Roupas',
      emojis: [
        '🧺','🧼','🫧','🧴','👕','👖','🧦','👔','👚','👗',
        '🩳','🧥','🧣','🧤','👙','🩲','🥼','👟','👞','🥿',
        '👠','👢','🦺','🧢','👒','🎒','💼','👜','👝','🕶️',
        '🥽','🧹','🪠','🧽','🪣','🪥','🚿','🛁','🧵','🪡','🧶'
      ]
    },

    {
      nome: '🍔 Alimentação e Bebidas',
      emojis: [
        '🍔','🍕','🌭','🥪','🌮','🌯','🥗','🍿','🍱','🍣',
        '🍙','🍜','🍲','🍛','🍡','🥟','🍤','🍦','🍰','🍩',
        '🍪','🍫','🍯','🥛','☕','🍵','🧃','🥤','🧉','🍾',
        '🍷','🍸','🍹','🍺','🍻','🍽️','🍴','🥄','🧑‍🍳','🍳'
      ]
    },

    {
      nome: '🛠️ Serviços, Status e Atendimento',
      emojis: [
        '🛠️','⚙️','🔧','🔨','🪛','📦','🚚','🚛','🛵','🚲',
        '🛒','🛍️','💳','💵','💰','🏷️','🛎️','📞','📱','💬',
        '✉️','📅','⏰','⏱️','📍','🗺️','🔒','🔓','🔑','📝',
        '📊','📈','📉','📋','📌','🔍','💡','🚀','🔄','✅',
        '❌','⚠️','ℹ️','#️⃣','🔔'
      ]
    }

  ];

  const picker = document.createElement('div');

  picker.id = 'emojiPicker';

  picker.innerHTML = `
    <div class="emoji-picker-box">

      <div class="emoji-picker-header">
        <strong>Escolha um ícone</strong>

        <button
          type="button"
          onclick="closeEmojiPicker()"
        >
          ×
        </button>
      </div>

      <div class="emoji-picker-content">

        ${grupos.map(grupo => `

          <div class="emoji-category">

            <div class="emoji-category-title">
              ${grupo.nome}
            </div>

            <div class="emoji-grid">

              ${grupo.emojis.map(emoji => `
                <button
                  type="button"
                  class="emoji-option"
                  onclick="selectEmoji('${emoji}')"
                >
                  ${emoji}
                </button>
              `).join('')}

            </div>

          </div>

        `).join('')}

      </div>

    </div>
  `;

  document.body.appendChild(picker);
}

function selectEmoji(emoji){

  const input = document.getElementById('cIcon');

  if(input){
    input.value = emoji;
  }

  closeEmojiPicker();
}

function closeEmojiPicker(){

  const picker = document.getElementById('emojiPicker');

  if(picker){
    picker.remove();
  }

}
function addCategoria(e){e.preventDefault();state.categorias.push({id:uid(),name:document.getElementById('cName').value.trim(),icon:document.getElementById('cIcon').value||'📦'});save();closeModal();toast('Categoria criada')}
function removeCategoria(id){if(state.despesas.some(x=>x.categoria_id===id)){toast('Não é possível excluir: categoria possui despesas');return}state.categorias=state.categorias.filter(x=>x.id!==id);save();toast('Categoria excluída')}
function openMetaModal(){
  openModal(`
    <button class="modal-close" onclick="closeModal()">×</button>

    <h2>Nova meta</h2>

    <form onsubmit="addMeta(event)">

      <div class="form-grid">

        <div class="field">
          <label>Nome da meta</label>
          <input
            id="mName"
            required
            placeholder="Ex.: Reserva"
          >
        </div>

        <div class="field">
          <label>Valor</label>
          <input
            id="mVal"
            required
            type="number"
            min=".01"
            step=".01"
            placeholder="500"
          >
        </div>

        <div class="field">
          <label>Prazo da meta</label>
          <input
            id="mPrazo"
            type="date"
          >
        </div>

      </div>

      <div class="actions">

        <button
          type="button"
          class="btn secondary"
          onclick="closeModal()"
        >
          Cancelar
        </button>

        <button class="btn">
          Salvar
        </button>

      </div>

    </form>
  `);
}
function addMeta(e){
  e.preventDefault();

  const nome=document.getElementById('mName').value.trim();
  const valor=Number(document.getElementById('mVal').value);
  const prazo=document.getElementById('mPrazo').value;

  state.metas.push({
    id:uid(),
    nome:nome,
    valor:valor,
    valorAtual:0,
    prazo:prazo
  });

  save();
  closeModal();

  rastrear('meta_criada','metas',{
    valor:valor,
    prazo:prazo
  });

  toast('Meta criada');
}
function adicionarDinheiroMeta(id){
  const meta=state.metas.find(x=>x.id===id);

  if(!meta)return;

  const valor=prompt(`Quanto você quer adicionar à meta "${meta.nome}"?`);

  if(valor===null)return;

  const valorNumerico=money(valor);

  if(valorNumerico<=0){
    toast('Informe um valor válido');
    return;
  }

  const valorAntes=Number(meta.valorAtual)||0;

  meta.valorAtual=valorAntes+valorNumerico;

  if(meta.valorAtual>Number(meta.valor)){
    meta.valorAtual=Number(meta.valor);
  }

  const valorAdicionado=meta.valorAtual-valorAntes;

  save();

  rastrear('meta_adicionada','metas',{
    meta:meta.nome,
    valor:valorAdicionado,
    valor_atual:meta.valorAtual
  });

  toast('Valor adicionado à meta');
}


function retirarDinheiroMeta(id){
  const meta=state.metas.find(x=>x.id===id);

  if(!meta)return;

  const valor=prompt(`Quanto você quer retirar da meta "${meta.nome}"?`);

  if(valor===null)return;

  const valorNumerico=money(valor);

  if(valorNumerico<=0){
    toast('Informe um valor válido');
    return;
  }

  const atual=Number(meta.valorAtual)||0;

  if(valorNumerico>atual){
    toast('Você não pode retirar mais do que já guardou');
    return;
  }

  meta.valorAtual=atual-valorNumerico;

  save();

  rastrear('meta_retirada','metas',{
    meta:meta.nome,
    valor:valorNumerico,
    valor_atual:meta.valorAtual
  });

  toast('Valor retirado da meta');
}


function removeItem(collection,id){if(!confirm('Excluir este registro?'))return;state[collection]=state[collection].filter(x=>x.id!==id);save();toast('Registro excluído')}


let toastTimer;

function toast(t){
  const x=document.getElementById('toast');

  if(!x)return;

  clearTimeout(toastTimer);

  x.textContent=t;
  x.classList.add('show');

  toastTimer=setTimeout(()=>{
    x.classList.remove('show');
  },2200);
}



function backup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`backup-dinheiro-do-mes-${selectedMonth()}.json`;a.click();URL.revokeObjectURL(a.href)}
function restore(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.despesas||!x.receitas)throw Error();state=x;save();toast('Backup restaurado')}catch{alert('Arquivo de backup inválido.')}};r.readAsText(file)}
document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.action==='backup')backup();if(b.dataset.action==='restore')document.getElementById('restoreInput').click()}));
document.getElementById('restoreInput').addEventListener('change',e=>e.target.files[0]&&restore(e.target.files[0]));



document.getElementById('prevMonth').onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()-1);

  rastrear('mes_anterior_visualizado','dashboard',{
    mes:selectedMonth()
  });

  render();
};

document.getElementById('nextMonth').onclick=()=>{
  currentDate.setMonth(currentDate.getMonth()+1);

  rastrear('mes_proximo_visualizado','dashboard',{
    mes:selectedMonth()
  });

  render();
};






document.getElementById('menuBtn').onclick=()=>{document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('open')};
document.getElementById('overlay').onclick=()=>{document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open')};
document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});
rastrear('app_aberto','dashboard');

/* ==========================================
   TUTORIAL DE PRIMEIRO USO
   ========================================== */

const tutorialPassos = [

  {
    titulo: '👋 Bem-vindo ao Dinheiro do Mês',
    texto: 'Vamos mostrar rapidamente como usar o sistema para organizar seu dinheiro.'
  },


  {
  titulo: '💡 Importante!',
  texto: 'Os valores apresentados são meramente ilustrativos. Eles servem como base para os cálculos e ajudam você a entender, na prática, como funciona a gestão e o controle dos seus gastos.'
},

  {
    titulo: '💰 Comece pela sua renda',
    texto: 'Informe quanto você recebe no mês. Esse valor será usado para calcular seu dinheiro disponível e seus limites.'
  },

  {
    titulo: '🧾 Registre suas despesas',
    texto: 'Adicione seus gastos e escolha uma categoria. Assim você consegue descobrir para onde seu dinheiro está indo.'
  },

  {
    titulo: '🎯 Crie suas metas',
    texto: 'Quer guardar dinheiro para alguma coisa? Crie uma meta e acompanhe quanto já conseguiu guardar.'
  },

  {
    titulo: '📊 Acompanhe seu dinheiro',
    texto: 'No Dashboard você encontra seus principais números, gastos, limites, compromissos e sua saúde financeira.'
  },
{
  titulo: '💾 Faça backup dos seus dados',
  texto: 'As informações ficam armazenadas no navegador deste dispositivo. Se os dados do navegador forem apagados, suas informações poderão ser perdidas. Use a função "Backup" para salvar uma cópia e, se necessário, utilize "Restaurar" para recuperá-la.'
},

  {
  titulo: '🔒 Seus dados',
  texto: 'O sistema não solicita seus dados pessoais nem cria um perfil de usuário. As informações financeiras são registradas ficam armazenadas no navegador deste dispositivo, atualmente não contamos com sistema de cadastro ou login'
},

  


  {
    titulo: '🎉 Tudo pronto!',
    texto: 'Agora você já conhece o básico. Comece registrando sua renda e depois suas primeiras despesas.'
  }

];

let tutorialAtual = 0;

function abrirTutorial(){

  const tutorial = document.getElementById('tutorialPrimeiroUso');

  if(!tutorial)return;

  tutorialAtual = 0;

  mostrarPassoTutorial();

  tutorial.classList.add('aberto');
}

function mostrarPassoTutorial(){

  const conteudo = document.getElementById('tutorialConteudo');
  const botao = document.getElementById('tutorialProximo');

  if(!conteudo || !botao)return;

  const passo = tutorialPassos[tutorialAtual];

  conteudo.innerHTML = `
    <div class="tutorial-passo">
      <div class="tutorial-indicador">
        ${tutorialAtual + 1} de ${tutorialPassos.length}
      </div>

      <h2>${passo.titulo}</h2>

      <p>${passo.texto}</p>
    </div>
  `;

  if(tutorialAtual === 0){
    botao.textContent = 'Começar';
  }else if(tutorialAtual === tutorialPassos.length - 1){
    botao.textContent = 'Começar a usar';
  }else{
    botao.textContent = 'Próximo';
  }
}

function proximoTutorial(){

  if(tutorialAtual < tutorialPassos.length - 1){

    tutorialAtual++;

    mostrarPassoTutorial();

  }else{

    concluirTutorial();

  }
}

function pularTutorial(){
  concluirTutorial();
}

function concluirTutorial(){

  localStorage.setItem(
    'dinheiro_do_mes_tutorial',
    'concluido'
  );

  const tutorial =
    document.getElementById('tutorialPrimeiroUso');

  if(tutorial){
    tutorial.classList.remove('aberto');
  }
}
/*localStorage.removeItem('dinheiro_do_mes_tutorial');*/

/* Abre somente no primeiro uso */

function verificarTutorial(){

  const concluido =
    localStorage.getItem('dinheiro_do_mes_tutorial');

  if(concluido !== 'concluido'){

    setTimeout(() => {
      abrirTutorial();
    }, 500);

  }

}

verificarTutorial();

render();

const themeToggle = document.getElementById('themeToggle');

if (themeToggle) {

  function atualizarTema() {

    const modoEscuro =
      document.body.classList.contains('modo-escuro');

    if (modoEscuro) {
      themeToggle.innerHTML = '☀️ <span>Modo claro</span>';
    } else {
      themeToggle.innerHTML = '🌙 <span>Modo escuro</span>';
    }
  }

  // Recupera o tema salvo
  const temaSalvo = localStorage.getItem('dinheiro_do_mes_tema');

  if (temaSalvo === 'escuro') {
    document.body.classList.add('modo-escuro');
  }

  themeToggle.addEventListener('click', function () {

    document.body.classList.toggle('modo-escuro');

    // Salva a escolha
    if (document.body.classList.contains('modo-escuro')) {
      localStorage.setItem('dinheiro_do_mes_tema', 'escuro');
    } else {
      localStorage.setItem('dinheiro_do_mes_tema', 'claro');
    }

    atualizarTema();

  });

  atualizarTema();

}


/* ================================
   TELA DE CARREGAMENTO
================================ */

window.addEventListener('load', function () {
  const telaLoading = document.getElementById('telaLoading');

  if (telaLoading) {
    setTimeout(function () {
      telaLoading.classList.add('oculta');

      setTimeout(function () {
        telaLoading.remove();
      }, 1500);
    }, 1500);
  }
});

/* ================================
   VIBRAÇÃO DOS BOTÕES
================================ */
function vibrar() {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(50);
      console.log("Vibração solicitada");
    } else {
      console.log("Este navegador não suporta navigator.vibrate");
    }
  } catch (erro) {
    console.log("Erro na vibração:", erro);
  }
}
document.addEventListener('click', function (event) {

  const botao = event.target.closest('button');

  if (!botao) return;

  vibrar('leve');

});
