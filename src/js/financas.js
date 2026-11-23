/*
 * financas.js — regras de negócio do MeuDinheiro.
 *
 * Este arquivo NÃO mexe na tela nem no navegador. Ele só tem funções "puras"
 * (recebem dados e devolvem um resultado). Por isso ele pode ser usado:
 *   - no navegador (pelo app.js), como window.Financas
 *   - no Node.js (pelos testes automatizados), via require()
 */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = api; // Node.js (testes)
  } else {
    raiz.Financas = api; // navegador
  }
})(typeof self !== 'undefined' ? self : this, function () {
  const TIPOS = ['receita', 'despesa'];

  // Aceita "10,50", "10.50" ou 10.5 e devolve um número (ou NaN).
  function converterValor(valor) {
    if (typeof valor === 'number') return valor;
    if (typeof valor !== 'string' || valor.trim() === '') return NaN;
    let texto = valor.trim();
    if (texto.includes(',')) {
      // formato brasileiro: "1.234,56" -> "1234.56"
      texto = texto.replace(/\./g, '').replace(',', '.');
    }
    if (!/^-?\d+(\.\d+)?$/.test(texto)) return NaN;
    return Number(texto);
  }

  function dataValida(texto) {
    if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
    const [ano, mes, dia] = texto.split('-').map(Number);
    const d = new Date(Date.UTC(ano, mes - 1, dia));
    return d.getUTCFullYear() === ano && d.getUTCMonth() === mes - 1 && d.getUTCDate() === dia;
  }

  // Validação dos dados de entrada do formulário.
  function validarLancamento(dados) {
    const erros = [];
    const d = dados || {};

    const descricao = typeof d.descricao === 'string' ? d.descricao.trim() : '';
    if (descricao.length < 3) erros.push('A descrição deve ter pelo menos 3 caracteres.');
    if (descricao.length > 60) erros.push('A descrição deve ter no máximo 60 caracteres.');

    const valor = converterValor(d.valor);
    if (!Number.isFinite(valor)) erros.push('Informe um valor numérico.');
    else if (valor <= 0) erros.push('O valor deve ser maior que zero.');
    else if (valor > 1000000) erros.push('O valor deve ser no máximo R$ 1.000.000,00.');

    if (!TIPOS.includes(d.tipo)) erros.push('Escolha o tipo: receita ou despesa.');

    if (!dataValida(d.data)) erros.push('Informe uma data válida.');

    return { valido: erros.length === 0, erros };
  }

  function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // Cria um lançamento "limpo" a partir dos dados do formulário.
  // Lança um erro se os dados forem inválidos.
  function criarLancamento(dados, id) {
    const resultado = validarLancamento(dados);
    if (!resultado.valido) {
      throw new Error(resultado.erros.join(' '));
    }
    return {
      id: id || gerarId(),
      descricao: dados.descricao.trim(),
      valor: Math.round(converterValor(dados.valor) * 100) / 100,
      tipo: dados.tipo,
      data: dados.data,
    };
  }

  // Soma receitas e despesas e calcula o saldo.
  // As contas são feitas em centavos para evitar erros de arredondamento (0,1 + 0,2).
  function calcularResumo(lancamentos) {
    let receitas = 0;
    let despesas = 0;
    for (const l of lancamentos || []) {
      const centavos = Math.round(l.valor * 100);
      if (l.tipo === 'receita') receitas += centavos;
      else if (l.tipo === 'despesa') despesas += centavos;
    }
    return {
      receitas: receitas / 100,
      despesas: despesas / 100,
      saldo: (receitas + despesas) / 100,
    };
  }

  // Devolve uma nova lista sem o lançamento indicado.
  function removerLancamento(lancamentos, id) {
    return (lancamentos || []).filter((l) => l.id !== id);
  }

  // Ordena do mais recente para o mais antigo (sem alterar a lista original).
  function ordenarPorData(lancamentos) {
    return [...(lancamentos || [])].sort((a, b) => b.data.localeCompare(a.data));
  }

  // Filtra a lista por tipo ("todos", "receita" ou "despesa") e por mês ("2026-11").
  // Mês vazio = todos os meses.
  function filtrarLancamentos(lancamentos, filtro) {
    const tipo = (filtro && filtro.tipo) || 'todos';
    const mes = (filtro && filtro.mes) || '';
    return (lancamentos || []).filter((l) =>
      (tipo === 'todos' || l.tipo === tipo) &&
      (mes === '' || l.data.startsWith(mes + '-')));
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  return {
    TIPOS,
    converterValor,
    validarLancamento,
    criarLancamento,
    calcularResumo,
    removerLancamento,
    ordenarPorData,
    filtrarLancamentos,
    formatarMoeda,
  };
});
