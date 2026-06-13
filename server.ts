import express from "express";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { generateTermoPDF } from "./src/utils/pdfHelper";

const prisma = new PrismaClient();
const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/public/termos", express.static(path.join(process.cwd(), "public", "termos")));

// API Routes

// 1. Get all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            tasks: {
              where: { status: "IN_PROGRESS" }
            }
          }
        }
      }
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// 2. Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        user: true
      },
      orderBy: {
        dueDate: "asc"
      }
    });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
});

// 3. Create a task
app.post("/api/tasks", async (req, res) => {
  try {
    const { title, description, status, dueDate, userId } = req.body;
    if (!title || !status || !dueDate || !userId) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }
    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        status,
        dueDate: new Date(dueDate),
        userId
      },
      include: {
        user: true
      }
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Erro ao criar tarefa" });
  }
});

// 4. Update a task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, userId } = req.body;
    
    // Find first
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        status: status !== undefined ? status : existing.status,
        dueDate: dueDate !== undefined ? new Date(dueDate) : existing.dueDate,
        userId: userId !== undefined ? userId : existing.userId
      },
      include: {
        user: true
      }
    });

    let pdfUrl: string | undefined = undefined;
    if (updated.status === "DONE" && updated.user) {
      try {
        pdfUrl = await generateTermoPDF(
          updated.id,
          updated.title,
          updated.description || "",
          updated.user.name,
          updated.user.role,
          updated.dueDate.toLocaleDateString("pt-BR")
        );
      } catch (pdfErr) {
        console.error("Error generating PDF:", pdfErr);
      }
    }

    res.json({
      ...updated,
      pdfUrl
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Erro ao atualizar tarefa" });
  }
});

// 5. Delete a task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id }
    });
    res.json({ message: "Tarefa excluída com sucesso" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Erro ao excluir tarefa" });
  }
});

// 6. Dashboard metrics
app.get("/api/dashboard/metrics", async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date();
    next24Hours.setHours(next24Hours.getHours() + 24);

    const tasks = await prisma.task.findMany({
      include: {
        user: true
      }
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "DONE").length;
    const todoTasks = tasks.filter(t => t.status === "TODO").length;
    const inProgressTasks = tasks.filter(t => t.status === "IN_PROGRESS").length;

    // SLA Overdue tasks (not done, due date passed)
    const overdueTasks = tasks.filter(t => t.status !== "DONE" && new Date(t.dueDate) < now);
    
    // SLA Urgent tasks (not done, due date within next 24 hours)
    const urgentTasks = tasks.filter(t => {
      const due = new Date(t.dueDate);
      return t.status !== "DONE" && due >= now && due <= next24Hours;
    });

    // Workload calculation (IN_PROGRESS per user)
    const users = await prisma.user.findMany({
      include: {
        tasks: {
          where: {
            status: "IN_PROGRESS"
          }
        }
      }
    });

    const workload = users.map(u => ({
      userId: u.id,
      name: u.name,
      role: u.role,
      avatarColor: u.avatarColor,
      inProgressCount: u.tasks.length,
      isOvercapacity: u.tasks.length > 2 // WIP Warning limit set to 2 inProgress tasks
    }));

    res.json({
      summary: {
        total: totalTasks,
        completed: completedTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        overdueCount: overdueTasks.length,
        urgentCount: urgentTasks.length
      },
      overdueTasks,
      urgentTasks,
      workload
    });
  } catch (error) {
    console.error("Error creating metrics:", error);
    res.status(500).json({ error: "Erro ao calcular métricas" });
  }
});

// 7. Generate Monday briefing using Gemini
app.post("/api/dashboard/briefing", async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "A chave de API do Gemini (GEMINI_API_KEY) não está configurada no seu ambiente. Por favor, adicione seu token nas configurações (Settings > Secrets) do AI Studio para habilitar a IA."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const now = new Date();
    const next24Hours = new Date();
    next24Hours.setHours(next24Hours.getHours() + 24);

    const users = await prisma.user.findMany({
      include: {
        tasks: true
      }
    });

    const tasks = await prisma.task.findMany({
      include: {
        user: true
      }
    });

    // Compile state for Gemini
    const teamState = users.map(u => {
      const inProgressTasks = u.tasks.filter(t => t.status === "IN_PROGRESS");
      const todoTasks = u.tasks.filter(t => t.status === "TODO");
      const doneTasks = u.tasks.filter(t => t.status === "DONE");
      return {
        name: u.name,
        role: u.role,
        wipCount: inProgressTasks.length,
        todoCount: todoTasks.length,
        doneCount: doneTasks.length,
        tasksInProgressList: inProgressTasks.map(t => ({
          title: t.title,
          dueDate: t.dueDate.toISOString().split('T')[0]
        }))
      };
    });

    const overdueTasks = tasks.filter(t => t.status !== "DONE" && new Date(t.dueDate) < now).map(t => ({
      title: t.title,
      responsible: t.user.name,
      dueDate: t.dueDate.toISOString().split('T')[0]
    }));

    const urgentTasks = tasks.filter(t => {
      const due = new Date(t.dueDate);
      return t.status !== "DONE" && due >= now && due <= next24Hours;
    }).map(t => ({
      title: t.title,
      responsible: t.user.name,
      dueDate: t.dueDate.toISOString().split('T')[0]
    }));

    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === "DONE").length,
      inProgressTasks: tasks.filter(t => t.status === "IN_PROGRESS").length,
      overdueCount: overdueTasks.length,
      urgentCount: urgentTasks.length
    };

    const prompt = `
Você é o assessor gerencial inteligente do líder de equipe Ricardo Santos, gestor da agência Quatro5.
Analise os dados abaixo da equipe e do fluxo Kanban (WIP recomendado: máximo 2 tarefas simultâneas "Em Andamento" por pessoa).

Gere um briefing de segunda-feira focado na reunião de alinhamento tático do time.
O briefing deve ser altamente focado, direto e gerencial (MÁXIMO 3 PARÁGRAFOS). Ele deve:
1. Apontar gargalos operacionais específicos (quem está sobrecarregado com WIP > 2, quem está ocioso ou com fluxo saudável com WIP 0 ou 1).
2. Indicar as tarefas urgentes ou cujo prazo de SLA já expirou (atrasadas) que trazem mais risco aos clientes da Quatro5.
3. Propor decisões explícitas de reatribuição ou priorização (ex: recomendando repassar tarefas específicas para quem está com maior disponibilidade para balancear a carga).

DADOS DA EQUIPE:
${JSON.stringify(teamState, null, 2)}

TAREFAS ATRASADAS (SLA Estourado):
${JSON.stringify(overdueTasks, null, 2)}

TAREFAS URGENTES (Vencem nas próximas 24h):
${JSON.stringify(urgentTasks, null, 2)}

ESTATÍSTICAS GERAIS:
${JSON.stringify(stats, null, 2)}

Responda em português brasileiro. Escreva parágrafos fluidos, objetivos e fáceis de ler para que o Ricardo possa ler em voz alta ou usá-los como guia para tomar decisões rápidas na reunião de segunda-feira. Não inclua telemetria, logs de sistema ou jargões técnicos supérfluos. Use negrito sutil para tarefas e pessoas para dar ênfase visual.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    const briefingText = response.text || "Não foi possível gerar o briefing no momento.";
    res.json({ briefing: briefingText });
  } catch (error: any) {
    console.error("Error generating briefing:", error);
    res.status(500).json({ error: "Erro ao gerar briefing com o Gemini. Detalhes: " + error.message });
  }
});

// Serve frontend assets
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
