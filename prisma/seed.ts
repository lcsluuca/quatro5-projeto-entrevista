import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de dados...");

  // Limpar dados antigos
  await prisma.task.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Criar os 10 membros do time com cores de avatar diferenciadas
  const usersData = [
    { name: "Ricardo Santos", email: "ricardo@quatro5.com.br", role: "Gestor & Fundador", avatarColor: "#1e3a8a" }, // Imperial Blue
    { name: "Carlos Oliveira", email: "carlos@quatro5.com.br", role: "Dev Fullstack Sênior", avatarColor: "#0f766e" }, // Teal
    { name: "Ana Costa", email: "ana@quatro5.com.br", role: "Designer UI/UX UI Sênior", avatarColor: "#be185d" }, // Pink
    { name: "Mariana Lima", email: "mariana@quatro5.com.br", role: "Dev Frontend Sênior", avatarColor: "#7c3aed" }, // Violet
    { name: "Felipe Souza", email: "felipe@quatro5.com.br", role: "Dev Backend Pleno", avatarColor: "#2563eb" }, // Blue
    { name: "Bruno Rocha", email: "bruno@quatro5.com.br", role: "Engenheiro de QA", avatarColor: "#d97706" }, // Amber
    { name: "Beatriz Silva", email: "beatriz@quatro5.com.br", role: "Dev Mobile Pleno", avatarColor: "#059669" }, // Emerald
    { name: "Pedro Alves", email: "pedro@quatro5.com.br", role: "Cientista de Dados", avatarColor: "#4f46e5" }, // Indigo
    { name: "Julia Nogueira", email: "julia@quatro5.com.br", role: "Social Media / Produtora", avatarColor: "#db2777" }, // Pinkish Red
    { name: "Lucas Ferreira", email: "lucas@quatro5.com.br", role: "Analista de Suporte / Infra", avatarColor: "#4b5563" }, // Slate Gray
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: u,
    });
    users.push(user);
    console.log(`Usuário criado: ${user.name} (${user.role})`);
  }

  // Obter datas úteis relativas a "hoje" (13 de junho de 2026)
  const now = new Date();
  
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d;
  };

  const daysAhead = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  const hoursAhead = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() + hours);
    return d;
  };

  const hoursAgo = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() - hours);
    return d;
  };

  // 2. Criar dezenas de tarefas com datas variadas para simular atrasos, urgências e carga de trabalho desequilibrada
  // Ricardo quer detectar que Carlos, Mariana e Felipe estão afogados, e Julia/Pedro estão mais ociosos.
  const tasksData = [
    // ----------------------------------------------------
    // CARLOS OLIVEIRA: Extremamente sobrecarregado (WIP alto)
    // ----------------------------------------------------
    {
      title: "Refatoração de API Legada de Clientes",
      description: "Substituir endpoints antigos por rotas REST estruturadas com validações rigorosas e documentação Swagger.",
      status: "IN_PROGRESS",
      dueDate: daysAgo(2), // Atrasada!
      userIndex: 1, // Carlos
    },
    {
      title: "Configuração do Gateway de Pagamento",
      description: "Implementar webhooks, assinaturas recorrentes e tratamento de falha de cobrança com a Stripe.",
      status: "IN_PROGRESS",
      dueDate: hoursAhead(12), // Vence nas próximas 24 horas! Alerta!
      userIndex: 1, // Carlos
    },
    {
      title: "Integração com CRM Hubspot",
      description: "Sincronizar leads capturados nos formulários da landing page diretamente para o pipeline comercial.",
      status: "IN_PROGRESS",
      dueDate: daysAhead(4), // Futura ativa
      userIndex: 1, // Carlos
    },
    {
      title: "Migração de Servidores para Cloud Run",
      description: "Escrever Dockerfile e criar pipelines de CI/CD para deploy automatizado na nuvem.",
      status: "TODO",
      dueDate: daysAgo(5), // Atrasada em TODO!
      userIndex: 1, // Carlos
    },
    {
      title: "Otimização de Queries SQL",
      description: "Analisar consultas lentas na tabela de transações históricas e adicionar índices necessários.",
      status: "DONE",
      dueDate: daysAgo(4), // Concluída a tempo
      userIndex: 1, // Carlos
    },

    // ----------------------------------------------------
    // MARIANA LIMA: Muito sobrecarregada (Frontend de tudo)
    // ----------------------------------------------------
    {
      title: "Dashboard de Métricas Quatro5 (Frontend)",
      description: "Implementar visualização de Kanban, gráficos de desempenho com Recharts e filtros dinâmicos de dados.",
      status: "IN_PROGRESS",
      dueDate: hoursAhead(6), // Vence nas próximas 24 horas! Alerta!
      userIndex: 3, // Mariana
    },
    {
      title: "Responsividade da Área Logada",
      description: "Ajustar tabelas e layouts de bento-grid para celular e tablet, visando eliminar scroll horizontal na lista de clientes.",
      status: "IN_PROGRESS",
      dueDate: daysAgo(1), // Atrasada!
      userIndex: 3, // Mariana
    },
    {
      title: "Correção de Bugs do Modo Escuro",
      description: "Alguns componentes text-gray-800 estão ilegíveis com fundo escuro. Corrigir as diretivas CSS tailwind.",
      status: "IN_PROGRESS",
      dueDate: daysAhead(1), // Vence em breve (>24h mas curto prazo)
      userIndex: 3, // Mariana
    },
    {
      title: "Interface de Upload de Arquivos",
      description: "Criar componente drag-and-drop para os anexos que aceite múltiplos formatos.",
      status: "TODO",
      dueDate: daysAhead(3), // Futura ativa
      userIndex: 3, // Mariana
    },

    // ----------------------------------------------------
    // FELIPE SOUZA: Média/Alta carga no Backend
    // ----------------------------------------------------
    {
      title: "Arquitetura de Notificações via Email & WhatsApp",
      description: "Desenvolver microserviço para enviar lembretes automáticos de vencimento e avisos de tarefas pendentes.",
      status: "IN_PROGRESS",
      dueDate: daysAgo(3), // Atrasada!
      userIndex: 4, // Felipe
    },
    {
      title: "Exportação de Relatórios de Tarefas em PDF/XLS",
      description: "Fazer geração do lado do backend utilizando pdfkit e exceljs para relatórios de auditoria.",
      status: "TODO",
      dueDate: hoursAhead(18), // Vence nas próximas 24h! Alerta!
      userIndex: 4, // Felipe
    },
    {
      title: "Modelagem da Tabela de Logs de Auditoria",
      description: "Registrar modificações, trocas de status e deleção de tarefas sensíveis por segurança.",
      status: "DONE",
      dueDate: daysAgo(2), // Pronta!
      userIndex: 4, // Felipe
    },

    // ----------------------------------------------------
    // ANA COSTA: UI/UX (Carga moderada e balanceada)
    // ----------------------------------------------------
    {
      title: "User Flow da Nova Funcionalidade de Kanban",
      description: "Mapear interações de drag-and-drop, modals de detalhamento e atalhos rápidos de teclado.",
      status: "DONE",
      dueDate: daysAgo(5), // Concluída
      userIndex: 2, // Ana
    },
    {
      title: "Protótipo de Alta Fidelidade no Figma",
      description: "Desenhar as telas de Kanban, Perfil de Usuários e Estatísticas Semanais da Quatro5.",
      status: "IN_PROGRESS",
      dueDate: daysAhead(2), // Em andamento, no prazo
      userIndex: 2, // Ana
    },
    {
      title: "Guia de Estilos & Design System",
      description: "Definir tipografia (Inter/Fira Code), paleta de cores institucional e guia de uso dos componentes de formulários.",
      status: "TODO",
      dueDate: daysAhead(8), // Planejada
      userIndex: 2, // Ana
    },

    // ----------------------------------------------------
    // BRUNO ROCHA: QA (Média carga, focado em testes)
    // ----------------------------------------------------
    {
      title: "Criação da Suíte de Testes e2e (Playwright)",
      description: "Escrever testes automatizados cobrindo os fluxos críticos de login, criação de tarefas e movimentação de colunas.",
      status: "IN_PROGRESS",
      dueDate: hoursAhead(2), // Vence nas próximas 24h! Alerta!
      userIndex: 5, // Bruno
    },
    {
      title: "Executar Bateria de Testes de Carga",
      description: "Testar o comportamento do backend sob concorrência de 1000 usuários simultâneos no banco de dados SQLite.",
      status: "DONE",
      dueDate: daysAgo(1), // Finalizado com sucesso
      userIndex: 5, // Bruno
    },

    // ----------------------------------------------------
    // BEATRIZ SILVA: Mobile (Carga normal)
    // ----------------------------------------------------
    {
      title: "Publicação do App Android na Play Store",
      description: "Gerar bundle compilado assinado de produção e subir para a faixa de testes internos da Play Console.",
      status: "IN_PROGRESS",
      dueDate: daysAgo(1), // Atrasada!
      userIndex: 6, // Beatriz
    },
    {
      title: "Correção de Push Notifications (iOS)",
      description: "Configurar certificados APNs e depurar falha de recebimento de notificações em background.",
      status: "DONE",
      dueDate: daysAgo(3), // Resolvido
      userIndex: 6, // Beatriz
    },

    // ----------------------------------------------------
    // RICARDO SANTOS: Gestor/Dono (Trabalho pontual estratégico)
    // ----------------------------------------------------
    {
      title: "Reunião de Alinhamento com Investidores",
      description: "Apresentar os principais relatórios de desempenho operacional e crescimento do mês anterior.",
      status: "DONE",
      dueDate: daysAgo(1), // Concluído
      userIndex: 0, // Ricardo
    },
    {
      title: "Planejamento Estratégico do Q3",
      description: "Definir metas de entrega, planos de contratação e orçamento de infraestrutura cloud.",
      status: "IN_PROGRESS",
      dueDate: daysAhead(10), // Prazo longo
      userIndex: 0, // Ricardo
    },

    // ----------------------------------------------------
    // PEDRO ALVES / JULIA NOGUEIRA / LUCAS FERREIRA: Quase fáceis, pouca WIP (Ocio)
    // ----------------------------------------------------
    {
      title: "Limpeza Operacional de Servidores de Staging",
      description: "Remover volumes Docker órfãos e logs antigos acumulados para liberar espaço em disco.",
      status: "DONE",
      dueDate: daysAgo(2), // Finalizado
      userIndex: 9, // Lucas
    },
    {
      title: "Atendimento de Chamados de Nível 2",
      description: "Resolver incidentes de login bloqueado relatados por clientes externos no início da semana.",
      status: "TODO",
      dueDate: daysAhead(1), // Planejada
      userIndex: 9, // Lucas
    },
    {
      title: "Script de Análise de Padrões de Uso do App",
      description: "Gerar insights agregados sobre os horários de maior tráfego para propor janelas de manutenção corretiva.",
      status: "DONE",
      dueDate: daysAgo(3), // Concluído
      userIndex: 7, // Pedro
    },
    {
      title: "Criação de Postagens para Campanha Institucional",
      description: "Elaborar cards e roteiro de vídeo divulgando a nova metodologia ágil interativa adotada pela Quatro5.",
      status: "TODO",
      dueDate: daysAhead(5), // Planejada, muito tempo
      userIndex: 8, // Julia
    }
  ];

  for (const t of tasksData) {
    const assignedUser = users[t.userIndex];
    
    // Set startedAt and resolvedAt for seeded data to display authentic data on telemetry dashboard
    let startedAt: Date | null = null;
    let resolvedAt: Date | null = null;
    
    if (t.status === "IN_PROGRESS") {
      // Started some days or hours ago
      startedAt = new Date(t.dueDate);
      startedAt.setDate(startedAt.getDate() - 3);
    } else if (t.status === "DONE") {
      // Started some days ago, completed some days ago
      startedAt = new Date(t.dueDate);
      startedAt.setDate(startedAt.getDate() - 5);
      
      resolvedAt = new Date(t.dueDate);
      resolvedAt.setDate(resolvedAt.getDate() - 2);
    }

    const task = await prisma.task.create({
      data: {
        title: t.title,
        description: t.description,
        status: t.status,
        dueDate: t.dueDate,
        userId: assignedUser.id,
        startedAt,
        resolvedAt
      },
    });
    console.log(`Tarefa criada: ${task.title} designada para ${assignedUser.name}`);
  }

  console.log("Seed de dados concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed de dados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
