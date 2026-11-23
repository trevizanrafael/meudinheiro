/*
 * build.js — etapa de BUILD do pipeline.
 *
 * O que faz:
 *  1. Confere se todos os arquivos obrigatórios da aplicação existem.
 *  2. Confere se o JavaScript carrega sem erro de sintaxe.
 *  3. Copia a aplicação de src/ para dist/ (dist/ é o ARTEFATO de entrega).
 *  4. Grava dist/version.json com a versão, o commit e o número da execução,
 *     para sabermos exatamente qual código está publicado (rastreabilidade).
 *
 * Rodar localmente:  npm run build
 */
const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');
const src = path.join(raiz, 'src');
const dist = path.join(raiz, 'dist');

const obrigatorios = ['index.html', 'css/style.css', 'js/financas.js', 'js/app.js'];

console.log('🔎 Verificando arquivos obrigatórios...');
for (const arquivo of obrigatorios) {
  if (!fs.existsSync(path.join(src, arquivo))) {
    console.error(`❌ Arquivo obrigatório não encontrado: src/${arquivo}`);
    process.exit(1);
  }
  console.log(`   ✔ src/${arquivo}`);
}

console.log('🔎 Verificando se o JavaScript carrega sem erros...');
for (const arquivo of ['js/financas.js', 'js/app.js']) {
  try {
    // compila o código sem executá-lo (detecta erros de sintaxe)
    new Function(fs.readFileSync(path.join(src, arquivo), 'utf8'));
    console.log(`   ✔ src/${arquivo}`);
  } catch (erro) {
    console.error(`❌ Erro de sintaxe em src/${arquivo}: ${erro.message}`);
    process.exit(1);
  }
}

console.log('📦 Gerando o artefato em dist/ ...');
fs.rmSync(dist, { recursive: true, force: true });
fs.cpSync(src, dist, { recursive: true });

const pacote = require(path.join(raiz, 'package.json'));
const versao = {
  versao: pacote.version,
  commit: (process.env.GITHUB_SHA || 'local').slice(0, 7),
  execucao: process.env.GITHUB_RUN_NUMBER || 'local',
  geradoEm: new Date().toISOString(),
};
fs.writeFileSync(path.join(dist, 'version.json'), JSON.stringify(versao, null, 2));

console.log('✅ Build concluído:', versao);
