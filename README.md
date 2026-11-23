# 💰 MeuDinheiro

Aplicação web simples de controle financeiro pessoal: registre **receitas** e **despesas** e veja o **saldo** atualizado na hora.

Projeto prático **Operação Deploy** — disciplina *Gerência de Configuração e Manutenção de Software*.

🔗 **Aplicação publicada:** https://SEU-USUARIO.github.io/meudinheiro/
🔗 **Execuções do pipeline:** https://github.com/SEU-USUARIO/meudinheiro/actions

## Equipe

| Integrante | Responsabilidades principais |
|---|---|
| NOME 1 | Líder de integração, desenvolvimento, pipeline CI/CD |
| NICOLE SOBRENOME | Desenvolvimento, testes automatizados, documentação e evidências |

> As responsabilidades foram divididas, mas as duas pessoas revisaram e conhecem todo o projeto.

## Problema que o sistema resolve

Muitas pessoas não sabem para onde vai o próprio dinheiro no fim do mês. O MeuDinheiro oferece um jeito rápido de anotar entradas e saídas e enxergar o saldo, sem cadastro, sem login e sem instalar nada.

## Funcionalidades

- **Cadastrar lançamento** (descrição, valor, tipo receita/despesa e data), com **validação** dos dados.
- **Consultar lançamentos** em uma lista ordenada por data, com **filtro por tipo e por mês**.
- **Resumo automático**: total de receitas, total de despesas e saldo (fica vermelho quando negativo).
- **Remover lançamento**.
- Os dados ficam salvos no próprio navegador (`localStorage`).

## Tecnologias

| Tecnologia | Para que foi usada |
|---|---|
| HTML, CSS e JavaScript | Interface e lógica da aplicação (sem frameworks) |
| localStorage | Armazenamento dos dados no navegador |
| Node.js (`node:test`) | Execução dos testes automatizados, sem instalar bibliotecas |
| Git e GitHub | Controle de versão, branches e pull requests |
| GitHub Actions | Pipeline de CI/CD (build, testes e publicação) |
| GitHub Pages | Hospedagem da aplicação publicada |

## Como executar

**Opção 1 — sem instalar nada:** abra o arquivo `src/index.html` no navegador (duplo clique).

**Opção 2 — com Node.js 20 ou superior:**

```bash
npm run build   # verifica os arquivos e gera a pasta dist/
npm test        # executa os testes automatizados
```

Depois abra `dist/index.html` no navegador.

## Estrutura do repositório

```
meudinheiro/
├── src/                      # código da aplicação
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── financas.js       # regras de negócio (validação, cálculos, filtros)
│       └── app.js            # interface (formulário, lista, armazenamento)
├── tests/financas.test.js    # testes automatizados
├── scripts/build.js          # etapa de build
├── docs/evidencias/          # capturas de tela usadas no relatório
├── .github/workflows/ci-cd.yml  # pipeline CI/CD
└── package.json              # comandos npm run build / npm test
```

## Pipeline CI/CD

Arquivo: [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)

```
push / pull request ─▶ CI: build ─▶ CI: testes ─▶ artefato (dist/) ─▶ CD: publicar no GitHub Pages
                                         │
                                         └─ se falhar ─▶ pipeline vermelho, publicação BLOQUEADA
```

1. **Gatilho:** qualquer `push` (em qualquer branch), pull request para a `main` ou execução manual.
2. **Build** (`npm run build`): confere se os arquivos obrigatórios existem, verifica erros de sintaxe no JavaScript e gera a pasta `dist/` com um arquivo `version.json` (versão, commit e número da execução).
3. **Testes** (`npm test`): executa os testes automatizados. Se algum falhar, o job para.
4. **Artefato:** a pasta `dist/` aprovada é guardada como artefato do GitHub Actions.
5. **Publicação:** o job `publicar` só roda na `main` e só se o job anterior passou (`needs: build-e-testes`). Se os testes falharem, ele aparece como *skipped* e a versão anterior continua no ar.

**Entrega contínua × implantação contínua:** toda versão que passa no CI vira um artefato pronto para entrega (entrega contínua). Neste projeto, como o risco é baixo, a publicação na `main` também é automática (implantação contínua). Para exigir aprovação humana antes de publicar, basta adicionar um revisor obrigatório no ambiente `github-pages` (Settings → Environments).

## Testes automatizados

Arquivo: `tests/financas.test.js` — rodar com `npm test`.

| # | O que verifica |
|---|---|
| 1 | Um lançamento com todos os campos corretos é aceito |
| 2 | Descrição curta, valor zero, tipo inválido e data inexistente são recusados |
| 3 | Valor vazio, com letras ou negativo é recusado |
| 4 | O cadastro converte valores no formato brasileiro (`1.234,56`) |
| 5 | Dados inválidos não viram registro |
| 6 | O saldo é calculado corretamente (receitas − despesas, sem erro de centavos) |
| 7 | Lista vazia dá saldo zero; gastar mais que recebe dá saldo negativo |
| 8 | Remover apaga apenas o lançamento escolhido |
| 9 | Filtro por tipo (só receitas / só despesas) |
| 10 | Filtro por mês, combinado com o tipo |

## Rastreabilidade

O rodapé da aplicação publicada mostra a **versão, o commit e o número da execução** do pipeline que a gerou (lidos do `version.json`). Assim dá para ligar a versão no ar ao commit no histórico e à execução correspondente na aba *Actions*.

## Limitações conhecidas

- Os dados ficam só no navegador usado: não sincronizam entre dispositivos e somem se o histórico do navegador for limpo.
- Não há edição de lançamentos (apenas cadastrar e remover).
- Não há categorias, gráficos ou exportação.
- Não há login (proposital, conforme o escopo do projeto).
