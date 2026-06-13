import React, { useState, useEffect } from "react";
import { Task, User, DashboardMetrics } from "./types";
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import WorkloadList from "./components/WorkloadList";
import TaskModal from "./components/TaskModal";
import { 
  Users, 
  Layers, 
  Activity, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle,
  Briefcase,
  AlertTriangle,
  Sparkles
} from "lucide-react";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);

  // Formatting helper for markdown-style bold tags in the briefing
  const formatBriefingText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  // Generate tactical briefing with Gemini AI
  const handleGenerateBriefing = async () => {
    try {
      setGenerationLoading(true);
      setError(null);
      const res = await fetch("/api/dashboard/briefing", {
        method: "POST"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Falha ao compilar os dados ou contactar a API do Gemini.");
      }
      const data = await res.json();
      setBriefing(data.briefing);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao gerar o briefing semanal de segunda-feira.");
    } finally {
      setGenerationLoading(false);
    }
  };

  // Filter States
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentSlaFilter, setCurrentSlaFilter] = useState<"OVERDUE" | "URGENT" | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      const usersRes = await fetch("/api/users");
      if (!usersRes.ok) throw new Error("Falha ao carregar usuários");
      const usersData: User[] = await usersRes.json();
      setUsers(usersData);

      // Fetch tasks
      const tasksRes = await fetch("/api/tasks");
      if (!tasksRes.ok) throw new Error("Falha ao carregar tarefas");
      const tasksData: Task[] = await tasksRes.json();
      setTasks(tasksData);

      // Fetch dashboard metrics
      const metricsRes = await fetch("/api/dashboard/metrics");
      if (!metricsRes.ok) throw new Error("Falha ao calcular indicadores");
      const metricsData: DashboardMetrics = await metricsRes.json();
      setMetrics(metricsData);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido ao carregar o sistema");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update a task status (column drop or quick change)
  const handleUpdateTaskStatus = async (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Falha ao atualizar status da tarefa");
      
      // Instantly refresh
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Add a new task (Post)
  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate: string;
    userId: string;
  }) => {
    try {
      if (selectedTask) {
        // Edit Mode
        const res = await fetch(`/api/tasks/${selectedTask.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Falha ao atualizar tarefa");
      } else {
        // Create Mode
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Falha ao criar tarefa");
      }

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open Edit Task Modal
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Open Create Task Modal
  const handleAddNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // Delete a task (Delete)
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Falha ao excluir tarefa");

      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filters Clear
  const handleClearFilters = () => {
    setSelectedUserId(null);
    setCurrentSlaFilter(null);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-neutral-800">
      {/* Visual Navigation Margin Indicator strictly avoided to keep elegant empty background feel */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Minimalist Logo Quatro5 */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-[15px] shadow-sm">
              Q5
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-800 tracking-tight">Quatro5</h1>
                <span className="text-[10px] text-slate-400 font-semibold">|</span>
                <span className="text-[10px] tracking-wider text-slate-500 font-bold uppercase">Gestão de Time</span>
              </div>
              <p className="text-[10px] text-slate-400">Canal exclusivo do Ricardo Santos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-slate-600 hover:bg-slate-50 hover:text-slate-850 transition lg:flex lg:items-center lg:gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Sincronizando..." : "Sincronizar"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        
        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-[10px] text-rose-500 hover:text-rose-700 underline font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Dashboard de Indicadores / KPIs (SLA counters) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-500" /> Indicadores Críticos de SLAs
            </h2>
            <button
              onClick={handleGenerateBriefing}
              disabled={generationLoading}
              className="px-3 py-1.5 text-xs font-bold leading-none bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition duration-155 cursor-pointer w-full sm:w-auto justify-center"
            >
              {generationLoading ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin text-white" />
                  <span>Gerando Briefing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 text-blue-200" />
                  <span>Gerar Resumo para a Reunião</span>
                </>
              )}
            </button>
          </div>

          {/* Elegant Briefing Output card on top of the Dashboard */}
          {briefing && (
            <div className="rounded-xl border border-blue-150 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 p-5 shadow-sm space-y-3 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-100/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    AI
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Briefing Inteligente de Segunda-feira</h3>
                    <p className="text-[10px] text-slate-400">Análise proativa com IA do fluxo de trabalho do time para Ricardo Santos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setBriefing(null)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] uppercase font-bold tracking-wider cursor-pointer"
                >
                  Ocultar
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed space-y-3 pt-1">
                {briefing.split("\n\n").map((para, i) => {
                  if (para.trim().startsWith("-") || para.trim().startsWith("*")) {
                    return (
                      <ul key={i} className="list-disc pl-4 space-y-1">
                        {para.split("\n").map((line, j) => (
                          <li key={j} dangerouslySetInnerHTML={{ __html: formatBriefingText(line.replace(/^[-*]\s*/, "")) }} />
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} dangerouslySetInnerHTML={{ __html: formatBriefingText(para) }} />
                  );
                })}
              </div>
              
              <div className="text-[9px] text-blue-600/90 font-medium flex items-center gap-1 mt-1 bg-white/60 w-fit px-2.5 py-1 rounded border border-blue-50">
                💡 <strong>Conselho:</strong> Ricardo, use estas recomendações para conduzir a pauta de segunda-feira com o time sem achismos!
              </div>
            </div>
          )}

          <Dashboard
            metrics={metrics}
            onRefresh={fetchData}
            onFilterOverdue={() => {
              setCurrentSlaFilter(currentSlaFilter === "OVERDUE" ? null : "OVERDUE");
            }}
            onFilterUrgent={() => {
              setCurrentSlaFilter(currentSlaFilter === "URGENT" ? null : "URGENT");
            }}
            onClearFilters={handleClearFilters}
            currentFilter={currentSlaFilter}
          />
        </section>

        {/* Unified Workload List and Kanban Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Workload Column (Weight: 1/4) */}
          <div className="lg:col-span-1 space-y-2 lg:sticky lg:top-24">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-500" /> Distribuição de Carga
            </h2>
            <WorkloadList
              workload={metrics?.workload || []}
              selectedUserId={selectedUserId}
              onSelectUser={(userId) => {
                setSelectedUserId(userId);
              }}
            />
          </div>

          {/* Kanban Board Column (Weight: 3/4) */}
          <div className="lg:col-span-3 space-y-2">
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" /> Fluxo de Trabalho (Kanban)
            </h2>
            <KanbanBoard
              tasks={tasks}
              users={users}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAddNewTask={handleAddNewTask}
              selectedUserId={selectedUserId}
              currentSlaFilter={currentSlaFilter}
              onClearFilters={handleClearFilters}
            />
          </div>
        </section>
      </main>

      {/* Unified Task Creator & Editor Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        users={users}
        task={selectedTask}
      />
    </div>
  );
}
