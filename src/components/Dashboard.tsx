import React from "react";
import { DashboardMetrics } from "../types";
import { AlertCircle, Clock, ListTodo, Milestone } from "lucide-react";

interface DashboardProps {
  metrics: DashboardMetrics | null;
  onRefresh: () => void;
  onFilterOverdue: () => void;
  onFilterUrgent: () => void;
  onClearFilters: () => void;
  currentFilter: "OVERDUE" | "URGENT" | null;
}

export default function Dashboard({
  metrics,
  onRefresh,
  onFilterOverdue,
  onFilterUrgent,
  onClearFilters,
  currentFilter
}: DashboardProps) {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { summary } = metrics;

  // Calculando taxa de conclusão (%)
  const completionRate = summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0;

  // Format counter to 2 digits
  const formatCount = (count: number) => {
    return count < 10 ? `0${count}` : `${count}`;
  };

  return (
    <div className="space-y-6">
      {/* SLA E DETALHES DE ALERTA RÁPIDO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Geral de Tarefas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total de Tarefas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatCount(summary.total)}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Cadastradas</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2.5">Sendo {summary.completed} concluídas ({completionRate}%)</p>
        </div>

        {/* Carga Em Andamento */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">WIP Total</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCount(summary.inProgress)}</span>
              <span className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold uppercase">Ativas em andamento</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2.5">Limite WIP recomendado por pessoa: 2</p>
        </div>

        {/* ALERTA CRÍTICO: ATRASADAS (SLA Estourado) */}
        <button
          onClick={onFilterOverdue}
          className={`text-left p-5 rounded-xl border shadow-sm transition group cursor-pointer flex flex-col justify-between h-full ${
            currentFilter === "OVERDUE"
              ? "border-red-500 bg-red-50/30 dark:bg-red-950/20"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-300 dark:hover:border-red-800 hover:bg-slate-50/20 dark:hover:bg-slate-800/20"
          }`}
        >
          <div className="w-full">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition">Atrasadas</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-red-600 dark:text-red-400 group-hover:scale-105 transition duration-200">
                {formatCount(summary.overdueCount)}
              </span>
              <span className="text-[10px] text-red-400 dark:text-red-500 font-bold uppercase">SLA Estourado</span>
            </div>
          </div>
          <p className="text-[10px] text-red-500 dark:text-red-400 font-semibold mt-2.5">
            {currentFilter === "OVERDUE" ? "👉 Filtro ativado! Clique p/ limpar" : "👉 Filtrar no quadro"}
          </p>
        </button>

        {/* ALERTA PRÓ-ATIVO: VENCEM EM 24H */}
        <button
          onClick={onFilterUrgent}
          className={`text-left p-5 rounded-xl border shadow-sm transition group cursor-pointer flex flex-col justify-between h-full ${
            currentFilter === "URGENT"
              ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-slate-50/20 dark:hover:bg-slate-800/20"
          }`}
        >
          <div className="w-full">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">Próx. 24h</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-500 group-hover:scale-105 transition duration-200">
                {formatCount(summary.urgentCount)}
              </span>
              <span className="text-[10px] text-amber-500 font-bold uppercase">Ações Urgentes</span>
            </div>
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-2.5">
            {currentFilter === "URGENT" ? "👉 Filtro ativado! Clique p/ limpar" : "👉 Filtrar no quadro"}
          </p>
        </button>
      </div>

      {/* SLA Alert Context explaining real actions */}
      {(summary.overdueCount > 0 || summary.urgentCount > 0) && (
        <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 p-4 shrink-0 flex gap-3 transition-colors">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-350 uppercase tracking-wider">Decisões de Gestão (Ação Proativa)</h4>
            <p className="text-xs text-blue-700/95 dark:text-blue-300/95 mt-1 leading-relaxed">
              Ricardo, você possui <strong className="text-red-700 dark:text-red-400">{summary.overdueCount} entregas atrasadas</strong> e 
              <strong className="dark:text-white"> {summary.urgentCount} que vencem em breve</strong>. Elas ameaçam a satisfação dos clientes da Quatro5. 
              Como Carlos e Mariana estão operando em carga máxima, utilize a tabela à esquerda para delegar estas responsabilidades de maior risco a quem está com maior disponibilidade.
            </p>
            {currentFilter && (
              <button
                onClick={onClearFilters}
                className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-350 underline block cursor-pointer"
              >
                Limpar filtros de SLA e restaurar visão geral do time
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

