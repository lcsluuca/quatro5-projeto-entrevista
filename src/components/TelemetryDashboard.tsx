import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckSquare, Activity, User, ShieldAlert, Award, ArrowUpRight } from "lucide-react";

interface TelemetryData {
  avgLeadTimeHours: number;
  avgMttrHours: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  totalTasksCount: number;
  alertTriggered: boolean;
  userBreakdown: Array<{
    userId: string;
    userName: string;
    role: string;
    avatarColor: string;
    completedTasksCount: number;
    avgLeadTimeHours: number;
    avgMttrHours: number;
  }>;
  recentCompletedTasks: Array<{
    id: string;
    title: string;
    userName: string;
    avatarColor: string;
    leadTimeHours: number;
    mttrHours: number;
    completedAt: string;
  }>;
}

interface TelemetryDashboardProps {
  tasksVersion: number; // Increment to trigger refresh when tasks change
}

export default function TelemetryDashboard({ tasksVersion }: TelemetryDashboardProps) {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/metrics/telemetry");
      if (!res.ok) {
        throw new Error("Não foi possível carregar as métricas de telemetria");
      }
      const telemetryJson = await res.json();
      setData(telemetryJson);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro de rede ao carregar telemetria");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [tasksVersion]);

  // Helper to format hours in a highly readable format
  const formatHourDuration = (hours: number): string => {
    if (hours === 0) return "0h";
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    const d = Math.floor(hours / 24);
    const h = Math.round(hours % 24);
    
    if (d > 0) {
      return `${d}d ${h}h`;
    }
    return `${hours.toFixed(1)}h`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-8 flex flex-col items-center justify-center min-h-[300px] transition-colors">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
          <Activity className="absolute inset-0 m-auto h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-4 animate-pulse">
          Calculando Telemetria & MTTR do Time...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-6 text-center max-w-lg mx-auto my-6 transition-colors">
        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-3" />
        <h3 className="text-sm font-extrabold text-red-900 dark:text-red-200 uppercase tracking-wider">Falha de Conexão Telemetria</h3>
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error || "Não foi possível carregar os dados agregados dos servidores."}</p>
        <button
          onClick={fetchTelemetry}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase rounded-lg shadow-sm cursor-pointer transition"
        >
          Tentar Recomposição
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header section of telemetry applet */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-4 transition-colors">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-450" />
            <span>Métricas Avançadas de Fluxo & Vazão (MTTR)</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tempo de resposta operacional e lead-time agregados da agência Quatro5 em tempo real.
          </p>
        </div>
        
        <button
          onClick={fetchTelemetry}
          className="mt-2 md:mt-0 self-start md:self-auto px-2.5 py-1 text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-850 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-1 cursor-pointer transition shadow-xs bg-white dark:bg-slate-900"
        >
          <Clock className="h-3 w-3" />
          <span>Sincronizar Métricas</span>
        </button>
      </div>

      {/* Primary KPI Boards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* KPI: LEAD TIME */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between transition-colors">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-50 dark:bg-indigo-950 rounded-full -z-10 opacity-60 dark:opacity-20"></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead Time Médio</span>
              <span className="px-2 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-full border border-indigo-100 dark:border-indigo-900/30">Fluxo de Criação a Conclusão</span>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {formatHourDuration(data.avgLeadTimeHours)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">({data.avgLeadTimeHours.toFixed(1)} horas)</span>
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
            Mede o ciclo de vida total das tarefas desde o momento do cadastro pelo Ricardo Santos até a entrega homologada e finalizada.
          </p>
        </div>

        {/* KPI: MTTR (Mean Time to Resolve) */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 relative overflow-hidden flex flex-col justify-between transition-colors">
          <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 ${data.alertTriggered ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'} rounded-full -z-10 opacity-60 dark:opacity-20`}></div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MTTR (Mean Time to Resolve)</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                data.alertTriggered 
                  ? 'text-red-700 bg-red-50 border-red-150 dark:text-red-400 dark:bg-red-950/40 dark:border-red-900/30' 
                  : 'text-emerald-700 bg-emerald-50 border-emerald-150 dark:text-emerald-450 dark:bg-emerald-950/40 dark:border-emerald-900/30'
              }`}>
                {data.alertTriggered ? "Atenção: Crítico" : "Eficiência Excelente"}
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2.5">
              <span className={`text-3xl font-black tracking-tight ${data.alertTriggered ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {formatHourDuration(data.avgMttrHours)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">({data.avgMttrHours.toFixed(1)} horas)</span>
            </div>
          </div>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
            Tempo decorrido entre o arrastar para a coluna <strong>"Em Andamento"</strong> (startedAt) e a efetiva entrega na coluna <strong>"Concluído"</strong> (resolvedAt).
          </p>
        </div>

      </div>

             {/* Condicional SLA Red Barrier Guard alert if MTTR exceeds 48 hours */}
      {data.alertTriggered && (
        <div id="telemetry-sla-alert" className="bg-gradient-to-br from-rose-50 to-red-50/50 dark:from-red-950/10 dark:to-red-950/5 border border-red-200 dark:border-red-900/40 rounded-xl p-5 flex gap-4 items-start shadow-xs animate-pulse">
          <div className="p-2.5 bg-red-600 dark:bg-rose-600 text-white rounded-lg shadow-md shrink-0 mt-0.5">
            <ShieldAlert className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-xs font-black text-red-900 dark:text-red-200 uppercase tracking-wider flex items-center gap-1.5">
              ⚠️ ALERTA DE GARGALO DETECTADO: SLA de MTTR Excedeu as 48 Horas
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-semibold">
              O MTTR médio global da agência Quatro5 neste momento é de <strong className="text-red-900 dark:text-red-105">{formatHourDuration(data.avgMttrHours)} ({data.avgMttrHours.toFixed(1)}h)</strong>, ultrapassando a barreira crítica operacional de engenharia de <strong>48 horas</strong>.
            </p>
            <p className="text-[11px] text-red-600 dark:text-red-400 leading-relaxed">
              <strong>Impacto para o Ricardo Santos:</strong> Carlos Oliveira e Mariana Lima estão operando com WIP excessivo (mais de 2 tarefas ativas concorrentes), enquanto outros membros do time possuem capacidade ociosa de vazão. Subdivida atividades complexas e use o filtro de carga de trabalho para remanejar gargalos de andamento técnicos.
            </p>
          </div>
        </div>
      )}

      {/* Team Breakdown table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-205 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Métricas Individuais de Desempenho</h4>
            <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">Vazão média e eficiência por membro ativo do time.</p>
          </div>
          <span className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">
            {data.userBreakdown.length} Membros Analisados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-50/30 dark:bg-slate-950/10">
                <th className="py-3 px-5">Colaborador</th>
                <th className="py-3 px-4">Cargo / Função</th>
                <th className="py-3 px-4 text-center">Entregas Feitas</th>
                <th className="py-3 px-4 text-right">Lead Time Médio</th>
                <th className="py-3 px-4 text-right">MTTR Médio</th>
                <th className="py-3 px-5 text-right font-medium">Indicador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.userBreakdown.map((u) => {
                const isOverSla = u.avgMttrHours > 48;
                return (
                  <tr key={u.userId} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/30 text-xs text-slate-650 dark:text-slate-300 transition">
                    <td className="py-3.5 px-5 font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6.5 h-6.5 rounded-full shadow-inner flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ backgroundColor: u.avatarColor }}
                        >
                          {u.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <span>{u.userName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400">{u.role}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {u.completedTasksCount > 0 ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                          {u.completedTasksCount}
                        </span>
                      ) : (
                        <span className="text-slate-350 dark:text-slate-600 font-normal">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.completedTasksCount > 0 ? (
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-300 font-semibold">{formatHourDuration(u.avgLeadTimeHours)}</span>
                      ) : (
                        <span className="text-slate-350 dark:text-slate-600 font-mono text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.completedTasksCount > 0 ? (
                        <span className={`font-mono text-[11px] font-bold ${isOverSla ? 'text-red-650 dark:text-red-400' : 'text-emerald-650 dark:text-emerald-400'}`}>
                          {formatHourDuration(u.avgMttrHours)}
                        </span>
                      ) : (
                        <span className="text-slate-350 dark:text-slate-600 font-mono text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {u.completedTasksCount === 0 ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100/70 dark:bg-slate-800/40 px-2 py-0.5 rounded-md font-medium">Sem entregas</span>
                      ) : isOverSla ? (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-red-700 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 px-2.5 py-0.5 rounded-md border border-red-100 dark:border-red-900/30">
                          <AlertTriangle className="h-2.5 w-2.5 animate-bounce" />
                          <span>Gargalo</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                          <Award className="h-2.5 w-2.5" />
                          <span>Excelente</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Historial Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>Últimas Entregas Homologadas (Histórico Analítico)</span>
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-450 mb-4">
          Auditoria das tarefas recém finalizadas e seus respectivos tempos de processamento internos.
        </p>

        {data.recentCompletedTasks.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-855 rounded-lg p-5 text-center text-slate-400 dark:text-slate-505 text-xs">
            Nenhuma tarefa foi movida para Concluído até o momento nesta sessão.
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentCompletedTasks.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50/55 dark:bg-slate-950/30 rounded-xl border border-slate-150 dark:border-slate-800 text-xs transition hover:bg-slate-50 dark:hover:bg-slate-850">
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[8.5px] font-black text-white shrink-0"
                    style={{ backgroundColor: t.avatarColor }}
                  >
                    {t.userName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-205 block leading-tight">{t.title}</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500">Resolvido por {t.userName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[11px] self-end sm:self-auto shrink-0 font-mono">
                  <div className="text-right">
                    <span className="text-slate-400 dark:text-slate-505 block text-[9px] uppercase font-bold tracking-wider">Lead Time</span>
                    <span className="text-slate-700 dark:text-slate-350 font-semibold">{formatHourDuration(t.leadTimeHours)}</span>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className="text-slate-400 dark:text-slate-550 block text-[9px] uppercase font-bold tracking-wider">MTTR</span>
                    <span className="text-indigo-650 dark:text-indigo-400 font-bold">{formatHourDuration(t.mttrHours)}</span>
                  </div>
                  <div className="text-right whitespace-nowrap pl-2 border-l border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-505">
                    {new Date(t.completedAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
