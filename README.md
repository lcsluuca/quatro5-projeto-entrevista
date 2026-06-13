# 🚀 Quatro5 - Gestão de Atividades de Equipe

Este repositório contém o desafio técnico completo construído para resolver as dores reais do Ricardo, proprietário e gestor da empresa fictícia **Quatro5**. O sistema disponibiliza uma abordagem visual e analítica para o controle operacional de times, mitigando gargalos de comunicação, reduzindo prazos estourados e oferecendo insights de alta precisão para as reuniões semanais.

---

## 🛠️ Stack Tecnológica

- **Front-end:** React 19 (com Vite), Tailwind CSS v4 para estilização de alto contraste, e ícones vetorizados do `lucide-react`.
- **Back-end:** Node.js integrado com **Express.js**, expondo rotas REST robustas de manipulação de dados e cálculo de métricas agregadas.
- **Banco de Dados:** **SQLite**, garantindo portabilidade imediata (banco de dados baseado em arquivo único `.db`), permitindo execução local instantânea sem dependências ou configurações complexas de infraestrutura cloud.
- **ORM:** **Prisma ORM**, garantindo tipagens automáticas e sincronização segura de esquemas relacionais, além de um fluxo transparente para semeadura (`seed`) de dados iniciais.

---

## 💡 Abordagem Metodológica Escolhida

Para solucionar os problemas enfrentados pelo Ricardo, adotamos uma fusão de duas metodologias ágeis consagradas:
1. **Visual Kanban combinada com Limites WIP (Work-in-Progress):** Para mitigar o problema de trabalho pulverizado no WhatsApp e planilhas, mapeamos o fluxo em colunas simples (*A Fazer*, *Em Andamento*, *Concluído*). Para o desequilíbrio de carga (membros afogados e outros ociosos), estabelecemos um **WIP Limit recomendado de 2 tarefas ativas por desenvolvedor**. O painel sinaliza visualmente qualquer membro que ocupe mais de duas tarefas simultâneas, servindo como gatilho de apoio ao Ricardo para reatribuir esforços.
2. **Gestão proativa de SLAs por Alertas Temporais:** Para sanar atrasos nos projetos e prazos estourados sem aviso prévio, o sistema analisa os vencimentos ativamente. Classificamos tarefas de risco em alertas prioritários e fornecemos filtros acionáveis na mesma tela.

---

## 📊 Justificativa dos Indicadores Solicitados

Disponibilizamos os dois indicadores primários estrategicamente posicionados no topo do painel operacional do Ricardo:

### 1. Carga de Trabalho por Pessoa (Foco no WIP Limit)
- **O que monitora:** A quantidade exata de tarefas em status **"Em Andamento"** vinculadas a cada colaborador.
- **Justificativa da Decisão:** Ricardo observava que alguns colaboradores estavam exaustos enquanto outros tinham tempo ocioso. Este indicador sinaliza visualmente `WIP Estourado` quando alguém excede 2 tarefas em progresso (ex: *Carlos Oliveira* e *Mariana Lima* iniciam o sistema com 3 tarefas em andamento cada). Com isso, Ricardo pode agir de imediato nas reuniões de status diárias para reatribuir as tarefas urgentes para membros marcados como `Ocioso / Disponível` ou com `Carga Saudável` (ex: *Julia Nogueira* ou *Pedro Alves*).

### 2. Alerta de Prazos (SLA Activeness)
- **O que monitora:** Dois contadores de urgência temporal: **Atrasadas (SLA Estourado)** e **Vencem em até 24h (Atenção)**.
- **Justificativa da Decisão:** Anteriormente, Ricardo perdia o controle dos prazos e os clientes reclamavam sem aviso prévio. Ao centralizar as tarefas que estão fora do prazo ou que estão na iminência de estourar, o gestor ganha proatividade. Clicar em qualquer um desses cartões no painel filtra imediatamente o quadro Kanban para as tarefas geradoras do perigo. Desse modo, o Ricardo sabe exatamente quais prazos ligar para o cliente para renegociar preemptivamente ou direcionar esforço emergencial do time de suporte/infra.

---

## 🚀 Como Executar o Sistema Localmente

O projeto foi planejado para rodar de maneira autônoma com zero configurações prévias necessários.

### Pré-requisitos
- Node.js (versão 18 ou superior instalada na máquina).

### Passo 1: Instalar dependências
No diretório raiz do projeto, instale os pacotes principais:
```bash
npm install
```

### Passo 2: Sincronizar banco de dados SQLite
Prisma irá ler o arquivo `prisma/schema.prisma` e gerar localmente o arquivo físico SQLite `prisma/dev.db`:
```bash
npx prisma db push
```

### Passo 3: Semear Base de Dados Virtual (Seed)
Para que o sistema não inicie vazio, criamos um script completo que espelha os 10 funcionários virtuais da Quatro5 e dezenas de tarefas com prazos calculados e urgências temporais variadas:
```bash
npx tsx prisma/seed.ts
```

### Passo 4: Executar Servidor Full-stack Integrado
Escreva o comando abaixo para inicializar o servidor Express acoplado com o middleware Vite executando de forma integrada na porta `3000`:
```bash
npm run dev
```
Abra o navegador em `http://localhost:3000` para experimentar a plataforma completa da Quatro5.

---

## 🔮 O que Ficou de Fora (Próximos Passos com Mais Tempo)

Com mais tempo disponível para o projeto, as seguintes extensões seriam priorizadas sob o aspecto de Engenharia de Plataformas Sênior:

1. **Gestão de Dependências e Precedência entre Tarefas:** Impedir que uma tarefa seja movida para "Em Andamento" se seus requisitos lógicos (ex: Design UI dependendo de User Story) ainda não estivessem como "Concluído".
2. **Autenticação Real Multi-tenant (Firebase Auth / JWT):** Permitir segurança e isolamento para que cada membro do time fizesse login individual, visualizasse e alterasse exclusivamente suas próprias metas por padrão, necessitando permissão MASTER (do Ricardo) para transferir cargas de trabalho.
3. **Histórico de SLA Cumprido (Analytics de Desempenho):** Criar gráficos de evolução mensal mostrando a média de dias que o time leva para fechar uma tarefa vs o prazo estimado (Lead Time / Cycle Time), para dar base estatística preditiva nas reuniões semanais.
4. **Notificações em Tempo Real (WebSockets / Push Notifications):** Notificar instantaneamente no navegador (ou via WhatsApp/E-mail através das rotas planejadas do Felipe) se uma tarefa de alta relevância estivesse próxima do vencimento.
