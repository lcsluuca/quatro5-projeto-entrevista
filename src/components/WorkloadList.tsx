import React from "react";
import { WorkloadItem } from "../types";
import { AlertTriangle, CheckCircle2, MinusCircle, User } from "lucide-react";

interface WorkloadListProps {
  workload: WorkloadItem[];
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
}

export default function WorkloadList({ workload, selectedUserId, onSelectUser }: WorkloadListProps) {
  // Sort by highest in-progress tasks count to highlight overloaded people on top
  const sortedWorkload = [...workload].sort((a, b) => b.inProgressCount - a.inProgressCount);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Carga de Trabalho</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          Tarefas em andamento por pessoa
        </p>
      </div>

      <div className="space-y-4">
        {sortedWorkload.map((item) => {
          const isSelected = selectedUserId === item.userId;
          // Calculate WIP percentage (WIP recommended is 2)
          const wipMax = 2;
          const percentage = Math.min(100, (item.inProgressCount / wipMax) * 100);
          
          // Determine progress bar color
          let barColor = "bg-blue-600 dark:bg-blue-500";
          if (item.inProgressCount > wipMax) {
            barColor = "bg-rose-500 animate-pulse";
          } else if (item.inProgressCount === wipMax) {
            barColor = "bg-amber-500";
          } else if (item.inProgressCount === 0) {
            barColor = "bg-slate-200 dark:bg-slate-700";
          } else {
            barColor = "bg-emerald-500";
          }

          return (
            <div
              key={item.userId}
              onClick={() => onSelectUser(isSelected ? null : item.userId)}
              className={`group rounded-xl p-3 border transition cursor-pointer space-y-2.5 ${
                isSelected
                  ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/30"
                  : "border-slate-105 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
              }`}
            >
              {/* Top Row: User details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: item.avatarColor }}
                  >
                    {getInitials(item.name)}
                  </div>
                  <div className="truncate max-w-[130px]">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {item.inProgressCount} / {wipMax}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 ml-1 font-semibold">WIP</span>
                </div>
              </div>

              {/* Progress Bar Row */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${barColor} transition-all duration-500`} 
                    style={{ width: `${item.inProgressCount === 0 ? 4 : percentage}%` }}
                  />
                </div>
                
                {/* Secondary status tag inline */}
                <div className="flex items-center justify-between text-[9px] font-medium pt-0.5">
                  {item.inProgressCount > wipMax ? (
                    <span className="text-rose-600 dark:text-rose-450 font-bold flex items-center gap-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" /> WIP Lim Excedido!
                    </span>
                  ) : item.inProgressCount > 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-450 font-bold">Fluxo Saudável</span>
                  ) : (
                    <span className="text-slate-450 dark:text-slate-500 font-semibold">Ocioso / Disponível</span>
                  )}
                  {isSelected && (
                    <span className="text-blue-600 dark:text-blue-450 font-bold underline">Filtro Ativo</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl text-[10px] text-blue-700 dark:text-blue-350 leading-snug">
        💡 <strong>Dica do Ricardo:</strong> Redistribua tarefas para integrantes ociosos ou com fluxo saudável para mitigar gargalos operacionais imediatos.
      </div>
    </div>
  );
}

