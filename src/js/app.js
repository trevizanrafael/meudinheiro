/*
 * app.js — liga as regras de negócio (financas.js) à tela.
 * Responsável por: ler o formulário, mostrar erros, salvar no navegador
 * (localStorage) e desenhar o resumo e a lista de lançamentos.
 */
(function () {
  const F = window.Financas;
  const CHAVE = 'meudinheiro:lancamentos';

  // ---------- armazenamento local ----------
  function carregar() {
    try {
      return JSON.parse(localStorage.getItem(CHAVE)) || [];
    } catch (e) {
      return [];
    }
  }
  function salvar(lista) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(lista));
    } catch (e) {
      // se o navegador bloquear o armazenamento, o app continua funcionando na sessão
    }
  }

  let lancamentos = carregar();

  // ---------- elementos da tela ----------
  const form = document.getElementById('form-lancamento');
  const campos = {
    descricao: document.getElementById('descricao'),
    valor: document.getElementById('valor'),
    tipo: document.getElementById('tipo'),
    data: document.getElementById('data'),
  };
  const listaErros = document.getElementById('erros');
  const corpoTabela = document.getElementById('lista');
  const tabela = document.getElementById('tabela');
  const vazio = document.getElementById('lista-vazia');

  function hoje() {
    const d = new Date();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mes}-${dia}`;
  }

  function formatarData(iso) {
    const [a, m, d] = iso.split('-');
    return `${d}/${m}/${a}`;
  }

  function mostrarErros(erros) {
    listaErros.innerHTML = '';
    erros.forEach((msg) => {
      const li = document.createElement('li');
      li.textContent = msg;
      listaErros.appendChild(li);
    });
  }

  // ---------- desenho da tela ----------
  function renderizarResumo() {
    const r = F.calcularResumo(lancamentos);
    document.getElementById('total-receitas').textContent = F.formatarMoeda(r.receitas);
    document.getElementById('total-despesas').textContent = F.formatarMoeda(r.despesas);
    const saldo = document.getElementById('saldo');
    saldo.textContent = F.formatarMoeda(r.saldo);
    saldo.classList.toggle('negativo', r.saldo < 0);
  }

  function renderizarLista() {
    const visiveis = F.ordenarPorData(lancamentos);
    corpoTabela.innerHTML = '';
    tabela.hidden = visiveis.length === 0;
    vazio.hidden = visiveis.length > 0;

    visiveis.forEach((l) => {
      const tr = document.createElement('tr');

      const tdData = document.createElement('td');
      tdData.textContent = formatarData(l.data);

      const tdDesc = document.createElement('td');
      tdDesc.textContent = l.descricao; // textContent evita injeção de HTML

      const tdTipo = document.createElement('td');
      const tag = document.createElement('span');
      tag.className = `tag ${l.tipo}`;
      tag.textContent = l.tipo === 'receita' ? 'Receita' : 'Despesa';
      tdTipo.appendChild(tag);

      const tdValor = document.createElement('td');
      tdValor.className = 'valor';
      tdValor.textContent = (l.tipo === 'despesa' ? '− ' : '+ ') + F.formatarMoeda(l.valor);

      const tdAcao = document.createElement('td');
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'remover';
      botao.textContent = 'Remover';
      botao.addEventListener('click', () => {
        lancamentos = F.removerLancamento(lancamentos, l.id);
        salvar(lancamentos);
        renderizar();
      });
      tdAcao.appendChild(botao);

      tr.append(tdData, tdDesc, tdTipo, tdValor, tdAcao);
      corpoTabela.appendChild(tr);
    });
  }

  function renderizar() {
    renderizarResumo();
    renderizarLista();
  }

  // ---------- cadastro ----------
  form.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const dados = {
      descricao: campos.descricao.value,
      valor: campos.valor.value,
      tipo: campos.tipo.value,
      data: campos.data.value,
    };
    const { valido, erros } = F.validarLancamento(dados);
    if (!valido) {
      mostrarErros(erros);
      return;
    }
    mostrarErros([]);
    lancamentos.push(F.criarLancamento(dados));
    salvar(lancamentos);
    form.reset();
    campos.data.value = hoje();
    campos.descricao.focus();
    renderizar();
  });

  // ---------- versão publicada (gerada pelo pipeline) ----------
  fetch('version.json', { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((v) => {
      document.getElementById('versao').textContent =
        `versão ${v.versao} · commit ${v.commit} · execução #${v.execucao}`;
    })
    .catch(() => { /* aberto localmente, sem build: mantém "versão local" */ });

  campos.data.value = hoje();
  renderizar();
})();
