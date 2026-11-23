/*
 * Testes automatizados do MeuDinheiro.
 * Usam o executor de testes que já vem no Node.js (node:test), sem instalar nada.
 * Rodar localmente:  npm test
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const F = require('../src/js/financas.js');

const valido = { descricao: 'Salário', valor: '2500,00', tipo: 'receita', data: '2026-11-05' };

// Teste 1 — validação de entrada: dados corretos são aceitos
test('validarLancamento aceita um lançamento com todos os campos corretos', () => {
  const r = F.validarLancamento(valido);
  assert.equal(r.valido, true);
  assert.deepEqual(r.erros, []);
});

// Teste 2 — validação de entrada: dados errados são recusados com mensagens
test('validarLancamento recusa descrição curta, valor zero, tipo e data inválidos', () => {
  const r = F.validarLancamento({ descricao: 'ab', valor: '0', tipo: 'outro', data: '2026-02-30' });
  assert.equal(r.valido, false);
  assert.equal(r.erros.length, 4);
  assert.ok(r.erros.includes('O valor deve ser maior que zero.'));
});

// Teste 3 — validação de entrada: valor não numérico ou negativo
test('validarLancamento recusa valor vazio, com letras ou negativo', () => {
  for (const valor of ['', 'abc', '-50']) {
    const r = F.validarLancamento({ ...valido, valor });
    assert.equal(r.valido, false, `deveria recusar o valor "${valor}"`);
  }
});

// Teste 4 — cadastro: cria o registro convertendo o valor em formato brasileiro
test('criarLancamento converte "1.234,56" para o número 1234.56', () => {
  const l = F.criarLancamento({ ...valido, descricao: '  Freelance  ', valor: '1.234,56' }, 'id-1');
  assert.deepEqual(l, {
    id: 'id-1',
    descricao: 'Freelance',
    valor: 1234.56,
    tipo: 'receita',
    data: '2026-11-05',
  });
});

// Teste 5 — cadastro: dados inválidos não viram registro
test('criarLancamento lança erro quando os dados são inválidos', () => {
  assert.throws(() => F.criarLancamento({ ...valido, tipo: '' }), /Escolha o tipo/);
});

// Teste 6 — cálculo do saldo (a funcionalidade principal)
test('calcularResumo soma receitas, despesas e calcula o saldo corretamente', () => {
  const lista = [
    { id: '1', descricao: 'Salário', valor: 2500, tipo: 'receita', data: '2026-11-05' },
    { id: '2', descricao: 'Aluguel', valor: 900.5, tipo: 'despesa', data: '2026-11-06' },
    { id: '3', descricao: 'Mercado', valor: 0.1, tipo: 'despesa', data: '2026-11-07' },
    { id: '4', descricao: 'Mercado', valor: 0.2, tipo: 'despesa', data: '2026-11-08' },
  ];
  assert.deepEqual(F.calcularResumo(lista), { receitas: 2500, despesas: 900.8, saldo: 1599.2 });
});

// Teste 7 — cálculo do saldo: lista vazia e saldo negativo
test('calcularResumo retorna zero para lista vazia e saldo negativo quando gasta mais', () => {
  assert.deepEqual(F.calcularResumo([]), { receitas: 0, despesas: 0, saldo: 0 });
  const r = F.calcularResumo([{ id: '1', descricao: 'Conta', valor: 100, tipo: 'despesa', data: '2026-11-01' }]);
  assert.equal(r.saldo, -100);
});

// Teste 8 — remoção de um registro
test('removerLancamento remove apenas o lançamento escolhido', () => {
  const lista = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.deepEqual(F.removerLancamento(lista, 'b'), [{ id: 'a' }, { id: 'c' }]);
  assert.equal(lista.length, 3, 'a lista original não deve ser alterada');
});
