import React, { useState, useEffect } from "react";
import { Task, User, DashboardMetrics } from "./types";
import Dashboard from "./components/Dashboard";
import KanbanBoard from "./components/KanbanBoard";
import WorkloadList from "./components/WorkloadList";
import TaskModal from "./components/TaskModal";
import TopologyDashboard from "./components/TopologyDashboard";
import TelemetryDashboard from "./components/TelemetryDashboard";
import EisenhowerMatrix from "./components/EisenhowerMatrix";
import ThemeToggle from "./components/ThemeToggle";
import { 
  Users, 
  Layers, 
  Activity, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle,
  Briefcase,
  AlertTriangle,
  Sparkles,
  Network,
  FileText,
  Download,
  X,
  Zap
} from "lucide-react";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<string | null>(null);
  const [generationLoading, setGenerationLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"kanban" | "topology" | "telemetry" | "eisenhower">("eisenhower");
  const [tasksVersion, setTasksVersion] = useState(0);
  const [downloadToast, setDownloadToast] = useState<{ id: string; title: string; url: string; userName: string } | null>(null);

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

      setTasksVersion(prev => prev + 1);
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
      const updatedData = await res.json();

      if (updatedData.pdfUrl) {
        setDownloadToast({
          id: updatedData.id,
          title: updatedData.title,
          url: updatedData.pdfUrl,
          userName: updatedData.user?.name || "Colaborador"
        });
      }
      
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
    isHighImpact: boolean;
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
        const updatedData = await res.json();

        if (updatedData.pdfUrl) {
          setDownloadToast({
            id: updatedData.id,
            title: updatedData.title,
            url: updatedData.pdfUrl,
            userName: updatedData.user?.name || "Colaborador"
          });
        }
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-neutral-800 dark:text-slate-200 transition-colors duration-200">
      {/* Visual Navigation Margin Indicator strictly avoided to keep elegant empty background feel */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Minimalist Logo Quatro5 */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 dark:bg-blue-700 text-white font-extrabold text-[15px] shadow-sm">
              Q5
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-150 tracking-tight">Quatro5</h1>
                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-semibold">|</span>
                <span className="text-[10px] tracking-wider text-slate-500 dark:text-slate-400 font-bold uppercase">Gestão de Time</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Canal exclusivo do Ricardo Santos</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={fetchData}
              disabled={loading}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-850 dark:hover:text-white transition lg:flex lg:items-center lg:gap-1.5 text-xs font-bold cursor-pointer shadow-sm bg-white dark:bg-slate-900"
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

        {/* Document Automation Download Alert Banner */}
        {downloadToast && (
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/40 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  ✨ Kanban Inteligente: Termo de Conclusão Gerado!
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  O sistema gerou o <strong>Termo de Responsabilidade e Conclusão</strong> em PDF para a atividade <span className="font-semibold text-slate-805">"{downloadToast.title}"</span> resolvida sob a autoria de <strong>{downloadToast.userName}</strong>.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              <a
                href={downloadToast.url}
                download={`termo-${downloadToast.id}.pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 text-xs font-extrabold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition duration-150 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Salvar Documento</span>
              </a>
              <button
                onClick={() => setDownloadToast(null)}
                className="p-1 px-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
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
            <div className="rounded-xl border border-blue-150 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-slate-900 dark:to-slate-950/80 p-5 shadow-sm space-y-3 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-100/30 dark:bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                    AI
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-105 uppercase tracking-wider">Briefing Inteligente de Segunda-feira</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Análise proativa com IA do fluxo de trabalho do time para Ricardo Santos</p>
                  </div>
                </div>
                <button 
                  onClick={() => setBriefing(null)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-colors"
                >
                  Ocultar
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3 pt-1">
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
              
              <div className="text-[9px] text-blue-600/90 dark:text-blue-400 font-medium flex items-center gap-1 mt-1 bg-white/60 dark:bg-slate-900/60 w-fit px-2.5 py-1 rounded border border-blue-50 dark:border-blue-900/30 transition-colors">
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

          {/* Kanban Board, Topology, Telemetry or Eisenhower Column (Weight: 3/4) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-1">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                {activeTab === "eisenhower" ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> 
                    <span>Matriz de Eisenhower (Gravidade Temporal)</span>
                  </>
                ) : activeTab === "kanban" ? (
                  <>
                    <Layers className="h-3.5 w-3.5 text-blue-500" /> 
                    <span>Fluxo de Trabalho (Kanban)</span>
                  </>
                ) : activeTab === "topology" ? (
                  <>
                    <Network className="h-3.5 w-3.5 text-violet-500 animate-pulse" /> 
                    <span>Topologia de Rede (WIP Latency)</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-3.5 w-3.5 text-indigo-550 animate-pulse" /> 
                    <span>Telemetria Analítica & MTTR</span>
                  </>
                )}
              </h2>

              {/* View Switches */}
              <div className="flex items-center gap-0.5 bg-slate-200/50 dark:bg-slate-900/60 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/80 self-start sm:self-auto flex-wrap transition-colors">
                <button
                  onClick={() => setActiveTab("eisenhower")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                    activeTab === "eisenhower"
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span>Matriz Eisenhower</span>
                </button>
                <button
                  onClick={() => setActiveTab("kanban")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer ${
                    activeTab === "kanban"
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Layers className="h-3 w-3 text-blue-500" />
                  <span>Quadro Kanban</span>
                </button>
                <button
                  onClick={() => setActiveTab("topology")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "topology"
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-xs font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Network className="h-3 w-3 text-violet-500" />
                  <span>Visualização Topológica</span>
                </button>
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "telemetry"
                      ? "bg-slate-850 dark:bg-slate-800 text-white dark:text-slate-100 shadow-xs font-black"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Activity className="h-3 w-3 text-indigo-400" />
                  <span>Métodos & MTTR</span>
                </button>
              </div>
            </div>

            {activeTab === "eisenhower" ? (
              <EisenhowerMatrix
                tasks={tasks}
                users={users}
                onTaskClick={handleEditTask}
                onUpdateStatus={handleUpdateTaskStatus}
              />
            ) : activeTab === "kanban" ? (
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
            ) : activeTab === "topology" ? (
              <TopologyDashboard
                tasks={tasks}
                users={users}
                onTaskClick={handleEditTask}
              />
            ) : (
              <TelemetryDashboard
                tasksVersion={tasksVersion}
              />
            )}
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
