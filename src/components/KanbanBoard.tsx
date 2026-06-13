import React from "react";
import { Task, User } from "../types";
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Plus, 
  Flame,
  Search
} from "lucide-react";

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  onUpdateTaskStatus: (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddNewTask: () => void;
  selectedUserId: string | null;
  currentSlaFilter: "OVERDUE" | "URGENT" | null;
  onClearFilters: () => void;
}

export default function KanbanBoard({
  tasks,
  users,
  onUpdateTaskStatus,
  onEditTask,
  onDeleteTask,
  onAddNewTask,
  selectedUserId,
  currentSlaFilter,
  onClearFilters,
}: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  // Determine if a task is overdue
  const isOverdue = (dueDateStr: string, status: string) => {
    if (status === "DONE") return false;
    return new Date(dueDateStr) < new Date();
  };

  // Determine if a task expires in next 24h
  const isUrgent = (dueDateStr: string, status: string) => {
    if (status === "DONE") return false;
    const now = new Date();
    const next24 = new Date();
    next24.setHours(next24.getHours() + 24);
    const due = new Date(dueDateStr);
    return due >= now && due <= next24;
  };

  // Filters logic
  const filteredTasks = tasks.filter((task) => {
    // 1. Filter by search query
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter by user select
    if (selectedUserId && task.userId !== selectedUserId) return false;

    // 3. Filter by SLA alerts from Dashboard
    if (currentSlaFilter === "OVERDUE") {
      return isOverdue(task.dueDate, task.status);
    }
    if (currentSlaFilter === "URGENT") {
      return isUrgent(task.dueDate, task.status);
    }

    return true;
  });

  const columns = [
    { id: "TODO", title: "A Fazer", bg: "bg-slate-50 dark:bg-slate-950", text: "text-slate-700 dark:text-slate-300", border: "border-slate-200 dark:border-slate-800" },
    { id: "IN_PROGRESS", title: "Em Andamento (WIP)", bg: "bg-blue-50/20 dark:bg-slate-950", text: "text-blue-800 dark:text-blue-300", border: "border-blue-100 dark:border-slate-800" },
    { id: "DONE", title: "Concluído", bg: "bg-emerald-50/20 dark:bg-slate-950", text: "text-emerald-800 dark:text-emerald-400", border: "border-emerald-100 dark:border-slate-800" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text");
    if (taskId) {
      onUpdateTaskStatus(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-5">
      {/* Filtering status header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por título, descrição ou responsável..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-950 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {(selectedUserId || currentSlaFilter) && (
            <span className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
              Filtro ativo: {selectedUserId ? "Membro selecionado" : ""}
              {selectedUserId && currentSlaFilter ? " + " : ""}
              {currentSlaFilter === "OVERDUE" ? "Atrasas" : ""}
              {currentSlaFilter === "URGENT" ? "Vencem <24h" : ""}
              <button
                onClick={onClearFilters}
                className="hover:text-amber-900 font-bold underline ml-1 cursor-pointer focus:outline-none"
              >
                Limpar
              </button>
            </span>
          )}

          <button
            onClick={onAddNewTask}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {columns.map((column) => {
          const columnTasks = filteredTasks.filter((t) => t.status === column.id);
          
          return (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as any)}
              className={`rounded-xl border ${column.border} ${column.bg} p-4 min-h-[520px] flex flex-col space-y-3`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${column.text}`}>
                    {column.title}
                  </span>
                  <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    {columnTasks.length}
                  </span>
                </div>
                {column.id === "IN_PROGRESS" && columnTasks.length > 2 && (
                  <span className="text-[9px] text-rose-700 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/40 rounded-full py-0.5 px-2 font-bold leading-none animate-pulse border border-rose-100 dark:border-rose-900/40 flex items-center gap-0.5">
                    <Flame className="h-2.5 w-2.5" />Limite de WIP!
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10 p-4 transition-colors">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Nenhuma tarefa aqui</p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const expired = isOverdue(task.dueDate, task.status);
                    const urgent = isUrgent(task.dueDate, task.status);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="group relative rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow hover:border-blue-400 dark:hover:border-blue-500 hover:-translate-y-0.5 transition duration-200 cursor-grab active:cursor-grabbing"
                      >
                        {/* Task User & Menu Row */}
                        <div className="flex items-center justify-between mb-3">
                          {/* User tag */}
                          <div className="flex items-center gap-2 max-w-[70%]">
                            <div
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: task.user.avatarColor }}
                              title={`${task.user.name} - ${task.user.role}`}
                            >
                              {getInitials(task.user.name)}
                            </div>
                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 truncate">
                              {task.user.name.split(" ")[0]}
                            </span>
                          </div>

                          {/* Quick Controls */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150">
                            <button
                              onClick={() => onEditTask(task)}
                              className="rounded p-1 text-slate-400 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Editar tarefa"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              className="rounded p-1 text-slate-400 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                              title="Deletar tarefa"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Due dates and Column shifts */}
                        <div className="mt-4 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/60 pt-2.5">
                          {/* Due Date Indicator */}
                          <div>
                            {task.status === "DONE" ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                <CheckCircle className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-450" /> Pronta
                              </span>
                            ) : expired ? (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-400 border border-rose-150 dark:border-rose-900/30 animate-pulse">
                                <AlertTriangle className="h-2.5 w-2.5 text-rose-600 dark:text-rose-450" /> {formatDate(task.dueDate)} (Atrasada!)
                              </span>
                            ) : urgent ? (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-400 border border-amber-150 dark:border-amber-900/30 animate-pulse">
                                <Clock className="h-2.5 w-2.5 text-amber-600 dark:text-amber-450 animate-pulse" /> Vence &lt;24h!
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                                <Calendar className="h-2.5 w-2.5" /> {formatDate(task.dueDate)}
                              </span>
                            )}
                          </div>

                          {/* Quick Column Shifts */}
                          <div className="flex gap-1">
                            {column.id !== "TODO" && (
                              <button
                                onClick={() => {
                                  const prev = column.id === "IN_PROGRESS" ? "TODO" : "IN_PROGRESS";
                                  onUpdateTaskStatus(task.id, prev as any);
                                }}
                                className="rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-0.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Mover para esquerda"
                              >
                                <ChevronLeft className="h-3 w-3" />
                              </button>
                            )}
                            {column.id !== "DONE" && (
                              <button
                                onClick={() => {
                                  const next = column.id === "TODO" ? "IN_PROGRESS" : "DONE";
                                  onUpdateTaskStatus(task.id, next as any);
                                }}
                                className="rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-0.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/10 transition cursor-pointer"
                                title="Mover para direita"
                              >
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
