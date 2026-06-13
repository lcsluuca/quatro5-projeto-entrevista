import React, { useState, useEffect } from "react";
import { Task, User } from "../types";
import { 
  AlertOctagon, 
  Clock, 
  ExternalLink, 
  Calendar, 
  User as UserIcon, 
  HelpCircle, 
  TrendingUp, 
  Info,
  Layers,
  Sparkles,
  Zap,
  CheckCircle,
  Hourglass
} from "lucide-react";

interface EisenhowerMatrixProps {
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onUpdateStatus?: (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => void;
}

export default function EisenhowerMatrix({ tasks, users, onTaskClick, onUpdateStatus }: EisenhowerMatrixProps) {
  const [now, setNow] = useState(new Date());

  // Keep now updated every minute for temporal gravity alignment
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Filter out completed tasks so the matrix focuses on actionable WIP tasks
  const activeTasks = tasks.filter(t => t.status !== "DONE");
  const completedTasks = tasks.filter(t => t.status === "DONE");

  // Helper calculation for dynamic quadrant sorting
  const getTaskHoursLeft = (taskDueDateStr: string): number => {
    const taskDate = new Date(taskDueDateStr);
    const diffMs = taskDate.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60); // Difference in decimal hours
  };

  // Dynamic grouping logic based on temporal gravity (next 24 hours threshold)
  const q1_urgentImportant: Task[] = [];
  const q2_importantNotUrgent: Task[] = [];
  const q3_urgentNotImportant: Task[] = [];
  const q4_notUrgentNotImportant: Task[] = [];

  activeTasks.forEach(task => {
    const hoursLeft = getTaskHoursLeft(task.dueDate);
    const isUrgent = hoursLeft <= 24; // Less than or equal to 24 hours left, or overdue

    if (task.isHighImpact) {
      if (isUrgent) {
        q1_urgentImportant.push(task);
      } else {
        q2_importantNotUrgent.push(task);
      }
    } else {
      if (isUrgent) {
        q3_urgentNotImportant.push(task);
      } else {
        q4_notUrgentNotImportant.push(task);
      }
    }
  });

  const formatTemporalCountdown = (hoursLeft: number): { text: string; style: string } => {
    if (hoursLeft < 0) {
      const positiveHours = Math.abs(hoursLeft);
      if (positiveHours > 24) {
        const days = Math.floor(positiveHours / 24);
        return { text: `Atrasado há ${days}d`, style: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 font-extrabold" };
      }
      return { text: `Atrasado há ${Math.round(positiveHours)}h`, style: "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/35 border-red-200 dark:border-red-900/35 font-extrabold animate-pulse" };
    }
    
    if (hoursLeft <= 1) {
      const minutes = Math.round(hoursLeft * 60);
      return { text: `Vence em ${minutes} min!`, style: "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/35 font-black animate-pulse" };
    }

    if (hoursLeft <= 24) {
      return { text: `Resta ${Math.round(hoursLeft)}h (Gravidade)`, style: "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 font-bold" };
    }

    const days = Math.floor(hoursLeft / 24);
    const remHours = Math.round(hoursLeft % 24);
    return { text: `${days}d ${remHours}h restantes`, style: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800/80" };
  };

  return (
    <div className="space-y-6">
      
      {/* Informative explanation header */}
      <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-sm p-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 pointer-events-none">
          <Zap className="h-40 w-40 text-white" />
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Zap className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
              <span>Matriz de Eisenhower com Gravidade Temporal</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              As atividades mudam de quadrante <strong>automaticamente</strong> conforme o prazo de vencimento se aproxima das 
              <strong> últimas 24 horas</strong>. Tarefas com <strong className="text-indigo-350">Alta Importância</strong> são promovidas para os quadrantes de elite (Q1 e Q2) retirando o peso gerencial manual de triagem.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg shrink-0">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            <div className="text-right">
              <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest">Hora Interna</span>
              <span className="text-[11px] font-mono font-bold tracking-tight text-slate-200">
                {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2x2 Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="eisenhower-matrix-container">
        
        {/* QUADRANT 1: DO FIRST (Urgente e Importante) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-200 dark:border-red-900/60 shadow-xs overflow-hidden flex flex-col min-h-[340px] transition-colors">
          <div className="px-5 py-3.5 bg-red-50/60 dark:bg-red-950/20 border-b border-red-100 dark:border-red-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-650 text-[10px] font-black text-white shadow-xs">
                Q1
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-red-950 dark:text-red-200">FAZER AGORA (Urgente & Importante)</h4>
                <p className="text-[9.5px] text-red-600 dark:text-red-400 font-semibold">Alta Importância • Vence em menos de 24h ou em atraso</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-600 text-white rounded-md">
              {q1_urgentImportant.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px] bg-red-50/10 dark:bg-slate-950/30">
            {q1_urgentImportant.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle className="h-8 w-8 text-emerald-500 mb-2" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sem incêndios pendentes neste quadrante!</span>
              </div>
            ) : (
              q1_urgentImportant.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  hoursLeft={getTaskHoursLeft(task.dueDate)} 
                  countdown={formatTemporalCountdown(getTaskHoursLeft(task.dueDate))}
                  onTaskClick={onTaskClick}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* QUADRANT 2: SCHEDULE (Importante, não Urgente) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs overflow-hidden flex flex-col min-h-[340px] transition-colors">
          <div className="px-5 py-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-xs">
                Q2
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950 dark:text-indigo-200">AGENDAR (Importante, Não Urgente)</h4>
                <p className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-semibold">Alta Importância • Vencimento superior a 24 horas</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-600 text-white rounded-md">
              {q2_importantNotUrgent.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px] bg-indigo-50/10 dark:bg-slate-950/30">
            {q2_importantNotUrgent.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <HelpCircle className="h-8 w-8 text-indigo-300 mb-2" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Nenhuma meta estratégica listada.</span>
              </div>
            ) : (
              q2_importantNotUrgent.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  hoursLeft={getTaskHoursLeft(task.dueDate)} 
                  countdown={formatTemporalCountdown(getTaskHoursLeft(task.dueDate))}
                  onTaskClick={onTaskClick}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* QUADRANT 3: DELEGATE (Urgente, não Importante) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-xs overflow-hidden flex flex-col min-h-[340px] transition-colors">
          <div className="px-5 py-3.5 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-xs">
                Q3
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-955 dark:text-amber-200">DELEGAR / TRATAR (Urgente, Não Importante)</h4>
                <p className="text-[9.5px] text-amber-600 dark:text-amber-450 font-medium">Baixa Importância • Vence em menos de 24h ou em atraso</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-white rounded-md">
              {q3_urgentNotImportant.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px] bg-amber-50/10 dark:bg-slate-950/30">
            {q3_urgentNotImportant.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <HelpCircle className="h-8 w-8 text-amber-300 mb-2" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sem atividades urgentes secundárias.</span>
              </div>
            ) : (
              q3_urgentNotImportant.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  hoursLeft={getTaskHoursLeft(task.dueDate)} 
                  countdown={formatTemporalCountdown(getTaskHoursLeft(task.dueDate))}
                  onTaskClick={onTaskClick}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </div>
        </div>

        {/* QUADRANT 4: ELIMINATE / POSTPONE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col min-h-[340px] transition-colors">
          <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/45 border-b border-slate-150 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-[10px] font-black text-white shadow-xs">
                Q4
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-950 dark:text-slate-205">ELIMINAR / POSTERGAR (Mera Operação)</h4>
                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">Baixa Importância • Vencimento superior a 24 horas</p>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-500 text-white rounded-md">
              {q4_notUrgentNotImportant.length}
            </span>
          </div>

          <div className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[400px] bg-slate-50/10 dark:bg-slate-950/30">
            {q4_notUrgentNotImportant.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <HelpCircle className="h-8 w-8 text-slate-300 mb-2" />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Nenhuma tarefa secundária pendente.</span>
              </div>
            ) : (
              q4_notUrgentNotImportant.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  hoursLeft={getTaskHoursLeft(task.dueDate)} 
                  countdown={formatTemporalCountdown(getTaskHoursLeft(task.dueDate))}
                  onTaskClick={onTaskClick}
                  onUpdateStatus={onUpdateStatus}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Completed archiving footer inside Eisenhower view */}
      {completedTasks.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Histórico Operacional de Conclusões ({completedTasks.length})
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Encerrado e Arquivado</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {completedTasks.slice(0, 6).map(task => (
              <div 
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="p-2.5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg cursor-pointer hover:border-indigo-350 dark:hover:border-indigo-700 hover:shadow-xs transition flex justify-between items-center text-xs"
              >
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-100 block truncate">{task.title}</span>
                  <span className="text-[9.5px] text-slate-400 dark:text-slate-500">{task.user.name}</span>
                </div>
                <span className="shrink-0 px-1.5 py-0.5 text-[8px] font-bold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-900/40 uppercase">
                  Feito
                </span>
              </div>
            ))}
            {completedTasks.length > 6 && (
              <div className="p-2.5 border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-400">
                + {completedTasks.length - 6} outras concluídas
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Subcomponent static cards inside the quadrants
interface TaskCardProps {
  key?: string;
  task: Task;
  hoursLeft: number;
  countdown: { text: string; style: string };
  onTaskClick: (task: Task) => void;
  onUpdateStatus?: (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => void;
}

function TaskCard({ task, hoursLeft, countdown, onTaskClick, onUpdateStatus }: TaskCardProps) {
  // Check default badge based on task state
  const statusLabels = {
    TODO: { text: "A Fazer", style: "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950" },
    IN_PROGRESS: { text: "Em Andamento", style: "border-indigo-105 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-450 bg-indigo-50/50 dark:bg-indigo-950/20" },
    DONE: { text: "Concluído", style: "border-emerald-105 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20" }
  };

  return (
    <div 
      className={`p-3.5 bg-white dark:bg-slate-900 border rounded-xl shadow-xs hover:shadow-md transition duration-150 relative flex flex-col justify-between gap-3 ${
        hoursLeft <= 24 
          ? 'border-l-4 border-l-red-500 border-slate-250 dark:border-slate-800' 
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="space-y-1">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border tracking-wider uppercase ${statusLabels[task.status].style}`}>
            {statusLabels[task.status].text}
          </span>
          
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border tracking-wide flex items-center gap-1 ${countdown.style}`}>
            <Hourglass className="h-2.5 w-2.5 shrink-0" />
            <span>{countdown.text}</span>
          </span>
        </div>

        {/* Title and trigger modal */}
        <div className="group cursor-pointer" onClick={() => onTaskClick(task)}>
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1">
            <span>{task.title}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 text-indigo-600 dark:text-indigo-400 shrink-0" />
          </h5>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description || "Nenhuma descrição informada."}
          </p>
        </div>
      </div>

      {/* Footer assignee and quick transition toolbar */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5 gap-2">
        {/* Colleague and avatar badge */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div 
            className="w-5.5 h-5.5 rounded-full flex items-center justify-center text-[8.5px] font-black text-white shrink-0 shadow-inner"
            style={{ backgroundColor: task.user?.avatarColor || "#cbd5e1" }}
          >
            {task.user?.name.substring(0, 2).toUpperCase() || "T"}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
            {task.user?.name || "Sem designação"}
          </span>
        </div>

        {/* Quick action buttons */}
        {onUpdateStatus && (
          <div className="flex items-center gap-1 text-[9.5px]">
            {task.status !== "IN_PROGRESS" && (
              <button 
                onClick={() => onUpdateStatus(task.id, "IN_PROGRESS")}
                className="px-2 py-1 border border-indigo-200/60 dark:border-indigo-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded transition cursor-pointer"
              >
                Iniciar
              </button>
            )}
            <button 
              onClick={() => onUpdateStatus(task.id, "DONE")}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-750 text-white font-extrabold rounded-md transition shadow-xs cursor-pointer"
            >
              Concluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
