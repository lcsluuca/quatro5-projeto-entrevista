import React, { useState, useEffect, useRef } from "react";
import { Task, User } from "../types";
import { 
  Network, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User as UserIcon, 
  Layers, 
  Server, 
  Cpu, 
  Sliders, 
  HelpCircle,
  TrendingUp,
  SlidersHorizontal
} from "lucide-react";

interface TopologyDashboardProps {
  tasks: Task[];
  users: User[];
  onTaskClick?: (task: Task) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

// Custom Node positions state type
interface UserPositions {
  [userId: string]: NodePosition;
}

export default function TopologyDashboard({ tasks, users, onTaskClick }: TopologyDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<UserPositions>({});
  const [draggedUserId, setDraggedUserId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 });
  
  // Selected state for details panel
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<"user" | "task" | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Toggle modes
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "TODO" | "IN_PROGRESS" | "DONE">("IN_PROGRESS");
  const [alertThreshold, setAlertThreshold] = useState<number>(5);

  // Mock data for test & demonstration purposes (specifically to showcase 5+ tasks alert)
  const mockUsers: User[] = [
    { id: "mock-1", name: "Carlos Fonseca", role: "Dev Back-end", email: "carlos@quatro5.com.br", avatarColor: "#6366f1" },
    { id: "mock-2", name: "Mariana Souza", role: "Dev Front-end", email: "mariana@quatro5.com.br", avatarColor: "#ec4899" },
    { id: "mock-3", name: "Pedro Alves", role: "UI/UX Designer", email: "pedro@quatro5.com.br", avatarColor: "#eab308" },
    { id: "mock-4", name: "Julia Nogueira", role: "QA Engineer", email: "julia@quatro5.com.br", avatarColor: "#10b981" }
  ];

  const mockTasks: Task[] = [
    // Carlos (WIP count = 6, overcapacity alert triggered!)
    { id: "mt-1", title: "Refatorar Queries Node-Postgres", description: "Otimizar latência do banco", status: "IN_PROGRESS", dueDate: "2026-06-15", userId: "mock-1", user: mockUsers[0], createdAt: "", updatedAt: "" },
    { id: "mt-2", title: "Testes de Carga na API", description: "Mediar throughput com autocannon", status: "IN_PROGRESS", userId: "mock-1", user: mockUsers[0], dueDate: "2026-06-16", createdAt: "", updatedAt: "" },
    { id: "mt-3", title: "Setup Docker Composer", description: "Configurar variáveis de rede do DB", status: "IN_PROGRESS", userId: "mock-1", user: mockUsers[0], dueDate: "2026-06-18", createdAt: "", updatedAt: "" },
    { id: "mt-4", title: "Migração de Migrations", description: "Aplicar novas tabelas de metadados", status: "IN_PROGRESS", userId: "mock-1", user: mockUsers[0], dueDate: "2026-06-19", createdAt: "", updatedAt: "" },
    { id: "mt-5", title: "Implementar Redis Caching", description: "Fazer cache das sessões JWT", status: "IN_PROGRESS", userId: "mock-1", user: mockUsers[0], dueDate: "2026-06-20", createdAt: "", updatedAt: "" },
    { id: "mt-6", title: "Logs de Auditoria", description: "Conectar arquivos persistentes no Cloud Storage", status: "IN_PROGRESS", userId: "mock-1", user: mockUsers[0], dueDate: "2026-06-21", createdAt: "", updatedAt: "" },
    { id: "mt-7", title: "Revisão SQL Schema", description: "Estudar índices secundários", status: "TODO", userId: "mock-1", user: mockUsers[0], dueDate: "2026-06-21", createdAt: "", updatedAt: "" },
    
    // Mariana (WIP count = 4, warnings/healthy WIP depending on limits)
    { id: "mt-8", title: "Refatorar Componente de Tabela", description: "Adicionar paginação infinita", status: "IN_PROGRESS", userId: "mock-2", user: mockUsers[1], dueDate: "2026-06-15", createdAt: "", updatedAt: "" },
    { id: "mt-9", title: "Criar Landing Page", description: "Mockup responsivo com Tailwind", status: "IN_PROGRESS", userId: "mock-2", user: mockUsers[1], dueDate: "2026-06-16", createdAt: "", updatedAt: "" },
    { id: "mt-10", title: "Integrar Contexto Global", description: "Reduzir prop-drilling", status: "IN_PROGRESS", userId: "mock-2", user: mockUsers[1], dueDate: "2026-06-17", createdAt: "", updatedAt: "" },
    { id: "mt-11", title: "Estilizar Alertas Corporativos", description: "Toasts responsivos e acessíveis", status: "IN_PROGRESS", userId: "mock-2", user: mockUsers[1], dueDate: "2026-06-20", createdAt: "", updatedAt: "" },

    // Pedro (WIP count = 1)
    { id: "mt-12", title: "Prototipar Fluxo de Pagamento", description: "Alta fidelidade no Figma", status: "IN_PROGRESS", userId: "mock-3", user: mockUsers[2], dueDate: "2026-06-15", createdAt: "", updatedAt: "" },
    { id: "mt-13", title: "Pesquisa de Usuário", description: "Entrevistar 4 clientes corporativos", status: "TODO", userId: "mock-3", user: mockUsers[2], dueDate: "2026-06-25", createdAt: "", updatedAt: "" },

    // Julia (WIP count = 2)
    { id: "mt-14", title: "Cenários de Teste Checkout", description: "Escrever testes de aceitação automatizados", status: "IN_PROGRESS", userId: "mock-4", user: mockUsers[3], dueDate: "2026-06-16", createdAt: "", updatedAt: "" },
    { id: "mt-15", title: "Testes E2E com Cypress", description: "Validar fluxos críticos e integridade", status: "IN_PROGRESS", userId: "mock-4", user: mockUsers[3], dueDate: "2026-06-17", createdAt: "", updatedAt: "" },
    { id: "mt-16", title: "Homologar Sprint Atual", description: "Apresentar relatório de cobertura de bugs", status: "DONE", userId: "mock-4", user: mockUsers[3], dueDate: "2026-06-14", createdAt: "", updatedAt: "" }
  ];

  // Active dataset depending on mode selector
  const activeUsers = isDemoMode ? mockUsers : users;
  const activeTasks = isDemoMode ? mockTasks : tasks;

  // Initialize node layout position
  useEffect(() => {
    if (!containerRef.current || activeUsers.length === 0) return;
    
    // Calculate layout according to the container width dynamically
    const width = containerRef.current.clientWidth || 800;
    const height = 480;
    const padding = 150;
    
    const newPositions: UserPositions = {};
    activeUsers.forEach((user, index) => {
      // Draw nodes in an evenly spaced horizontal line or slightly staggered
      const count = activeUsers.length;
      const x = padding + ((width - padding * 2) / (count - 1 || 1)) * index;
      const y = height / 2 + (index % 2 === 0 ? -40 : 40); // slightly Staggered
      newPositions[user.id] = { x, y };
    });

    setPositions(newPositions);
    
    // Select first node by default to show some data in side-panel
    if (activeUsers[0]) {
      setSelectedNodeId(activeUsers[0].id);
      setSelectedNodeType("user");
    }
  }, [activeUsers.length, isDemoMode]);

  // Calculate task distribution for each user
  const getUserTasks = (userId: string) => {
    return activeTasks.filter(t => t.userId === userId && (filterStatus === "ALL" || t.status === filterStatus));
  };

  const getUserInProgressCount = (userId: string) => {
    return activeTasks.filter(t => t.userId === userId && t.status === "IN_PROGRESS").length;
  };

  // Drag handlers
  const handleMouseDown = (userId: string, e: React.MouseEvent) => {
    e.preventDefault();
    const pos = positions[userId] || { x: 300, y: 250 };
    setDraggedUserId(userId);
    setDragOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedUserId) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Boundary constraints
    const cleanX = Math.max(40, Math.min(container.clientWidth - 40, e.clientX - dragOffset.x));
    const cleanY = Math.max(40, Math.min(container.clientHeight - 40, e.clientY - dragOffset.y));

    setPositions(prev => ({
      ...prev,
      [draggedUserId]: { x: cleanX, y: cleanY }
    }));
  };

  const handleMouseUp = () => {
    setDraggedUserId(null);
  };

  const cleanSelectedId = () => {
    setSelectedNodeId(null);
    setSelectedNodeType(null);
    setSelectedTaskId(null);
  };

  // Selected details info retrieval
  const focusedUser = activeUsers.find(u => u.id === selectedNodeId);
  const focusedUserTasks = focusedUser ? activeTasks.filter(t => t.userId === focusedUser.id) : [];
  const focusedTask = activeTasks.find(t => t.id === selectedTaskId);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col transition-colors">
      {/* Topology CSS Variables injection */}
      <style>{`
        @keyframes network-pulse-red {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
            border-color: rgba(239, 68, 68, 1);
          }
          50% {
            box-shadow: 0 0 0 16px rgba(239, 68, 68, 0);
            border-color: rgba(248, 113, 113, 1);
          }
        }
        @keyframes network-pulse-blue {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
            border-color: rgba(59, 130, 246, 1);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            border-color: rgba(147, 197, 253, 1);
          }
        }
        @keyframes flow-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .flow-line-normal {
          stroke-dasharray: 4, 4;
          animation: flow-dash 1.5s linear infinite;
        }
        .flow-line-congested {
          stroke-dasharray: 6, 2;
          animation: flow-dash 0.4s linear infinite;
        }
      `}</style>

      {/* Control Header */}
      <div className="border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <Network className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Topologia de Rede do Fluxo (WIP Latency)</h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize o fluxo operacional como infraestrutura. Arraste os membros da equipe (gargalos em vermelho) para reorganizar a rede.
          </p>
        </div>

        {/* Filters and Toggle buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-xs transition-colors">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold px-2 uppercase">Filtrar satélites:</span>
            {(["ALL", "TODO", "IN_PROGRESS", "DONE"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2 py-1 text-[10px] font-bold rounded-md transition cursor-pointer ${
                  filterStatus === status 
                    ? "bg-slate-800 dark:bg-slate-700 text-white" 
                    : "text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}
              >
                {status === "ALL" ? "Todos" : status === "TODO" ? "A Fazer" : status === "IN_PROGRESS" ? "Em WIP" : "Pronto"}
              </button>
            ))}
          </div>

          {/* Alert Threshold Slider */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 shadow-xs transition-colors">
            <SlidersHorizontal className="h-3 w-3 text-slate-400 " />
            <span>Limite Vermelho (WIP): </span>
            <select
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-300 font-bold focus:outline-none"
            >
              {[2, 3, 4, 5, 6].map(v => (
                <option key={v} value={v}>{v} tarefas</option>
              ))}
            </select>
          </div>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => {
              setIsDemoMode(!isDemoMode);
              cleanSelectedId();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isDemoMode 
                ? "bg-rose-500 hover:bg-rose-600 text-white" 
                : "bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300/90 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300"
            }`}
            title="Clique para alternar para um estado com dados fictícios sobrecarregados"
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>{isDemoMode ? "Ver Banco Real" : "Simular Sobrecarga (Mock)"}</span>
          </button>
        </div>
      </div>

      {/* Main interactive area split into SVG Grid and Details side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[480px]">
        {/* NETWORK CANVAS (3/4 Width) */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="lg:col-span-3 border-r border-slate-200 relative bg-slate-950/95 overflow-hidden select-none"
          style={{ height: "480px" }}
        >
          {/* Retro Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 pointer-events-none" />
          
          {/* Title accent in background */}
          <div className="absolute bottom-4 left-4 font-mono text-[9px] text-slate-400/50 pointer-events-none uppercase tracking-wider space-y-0.5">
            <div>Infraestrutura: Quatro5 Kanban Grid</div>
            <div>Alert Limit: &gt;={alertThreshold} WIP</div>
            <div>Status: System Nominal</div>
          </div>

          {/* SVG Connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {activeUsers.map((user) => {
              const uPos = positions[user.id];
              if (!uPos) return null;

              const userTasks = getUserTasks(user.id);
              const wipCount = getUserInProgressCount(user.id);
              const isOvercapacity = wipCount >= alertThreshold;

              return userTasks.map((task, index) => {
                // Calculate orbital satellite positions around user node
                const totalSatellites = userTasks.length;
                const radius = 100;
                // Distribute satellites evenly around the circle
                const angle = (2 * Math.PI / (totalSatellites || 1)) * index;
                const tx = uPos.x + radius * Math.cos(angle);
                const ty = uPos.y + radius * Math.sin(angle);

                // Line coloring depending on status & user overcapacity
                let linkColor = isOvercapacity ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.25)";
                if (task.status === "DONE") linkColor = "rgba(16, 185, 129, 0.2)";

                const isCongested = isOvercapacity && task.status === "IN_PROGRESS";

                return (
                  <g key={task.id}>
                    {/* Glowing outer cable */}
                    <path
                      d={`M ${uPos.x} ${uPos.y} Q ${(uPos.x + tx)/2} ${(uPos.y + ty)/2 - 15}, ${tx} ${ty}`}
                      fill="none"
                      stroke={linkColor}
                      strokeWidth={isCongested ? "2.5" : "1.5"}
                      className={isCongested ? "flow-line-congested" : "flow-line-normal"}
                    />
                    
                    {/* Cable node interface background */}
                    <circle cx={tx} cy={ty} r="4" fill="#020617" stroke={task.status === "DONE" ? "#10b981" : "#3b82f6"} strokeWidth="1" />
                  </g>
                );
              });
            })}
          </svg>

          {/* RENDER TASKS (Orbital Satellites) - Rendered behind users for ease of click */}
          {activeUsers.map((user) => {
            const uPos = positions[user.id];
            if (!uPos) return null;

            const userTasks = getUserTasks(user.id);

            return userTasks.map((task, index) => {
              const totalSatellites = userTasks.length;
              const radius = 100;
              const angle = (2 * Math.PI / (totalSatellites || 1)) * index;
              const tx = uPos.x + radius * Math.cos(angle);
              const ty = uPos.y + radius * Math.sin(angle);

              const isSelected = selectedTaskId === task.id;

              // Theme based on state
              let statusFill = "bg-blue-900 border-blue-400 text-blue-300";
              if (task.status === "TODO") statusFill = "bg-slate-800 border-slate-500 text-slate-350";
              if (task.status === "DONE") statusFill = "bg-emerald-950 border-emerald-500 text-emerald-400";

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setSelectedNodeId(user.id);
                    setSelectedNodeType("task");
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border cursor-pointer hover:scale-115 transition duration-150 shadow-md ${statusFill} ${
                    isSelected ? "ring-2 ring-white scale-110 z-10" : "z-5"
                  }`}
                  style={{ left: tx, top: ty }}
                  title={`${task.title} (${task.status})`}
                >
                  {task.status === "DONE" ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : task.status === "TODO" ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[9px] font-extrabold uppercase font-mono">WIP</span>
                  )}
                </div>
              );
            });
          })}

          {/* RENDER USER NODES (Draggable Hubs) */}
          {activeUsers.map((user) => {
            const uPos = positions[user.id];
            if (!uPos) return null;

            const wipCount = getUserInProgressCount(user.id);
            const isOvercapacity = wipCount >= alertThreshold;
            const isSelected = selectedNodeId === user.id && selectedNodeType === "user";

            // Initials helper
            const initials = user.name
              .split(" ")
              .map(n => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div
                key={user.id}
                onMouseDown={(e) => handleMouseDown(user.id, e)}
                onClick={() => {
                  setSelectedNodeId(user.id);
                  setSelectedNodeType("user");
                  setSelectedTaskId(null);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 select-none cursor-grab active:cursor-grabbing rounded-full p-1.5 flex flex-col items-center justify-center transition-all ${
                  isOvercapacity 
                    ? "z-20 border-2" 
                    : "z-10 border"
                }`}
                style={{ 
                  left: uPos.x, 
                  top: uPos.y,
                  animation: isOvercapacity ? "network-pulse-red 2s infinite" : "network-pulse-blue 3.8s infinite",
                  backgroundColor: isOvercapacity ? "#450a0a" : "#0f172a"
                }}
              >
                {/* Node details */}
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-full text-xs font-black text-white shadow-inner relative"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {initials}
                  
                  {/* Internal overload alert icon badge */}
                  {isOvercapacity && (
                    <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[9px] shadow border border-white animate-bounce">
                      ⚠️
                    </span>
                  )}
                </div>

                {/* Sub label */}
                <div className="absolute top-14 bg-slate-900/90 border border-slate-700/60 rounded px-1.5 py-0.5 text-center text-[9px] text-white whitespace-nowrap leading-none font-bold shadow-sm pointer-events-none">
                  {user.name.split(" ")[0]} 
                  <span className={`ml-1 font-mono uppercase px-1 rounded ${isOvercapacity ? "bg-red-900/80 text-red-300" : "bg-slate-800 text-slate-300"}`}>
                    WIP: {wipCount}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

               {/* DETAILS SIDEBAR PANEL (1/4 Width) */}
        <div className="lg:col-span-1 bg-slate-50 dark:bg-slate-950 p-4 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 flex flex-col justify-between max-h-[480px] overflow-y-auto transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Gargalos e Diagnósticos</span>
              {selectedNodeId && (
                <button 
                  onClick={cleanSelectedId}
                  className="text-[9px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline font-bold cursor-pointer transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* If Task details selected */}
            {selectedNodeType === "task" && focusedTask && (
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-650 dark:text-slate-300 uppercase font-bold">{focusedTask.status}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">ID: {focusedTask.id}</span>
                  </div>
                  
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{focusedTask.title}</h4>
                  
                  {focusedTask.description && (
                    <p className="text-[11px] text-slate-505 dark:text-slate-400 leading-normal">{focusedTask.description}</p>
                  )}
                  
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-405">
                    <span>Responsável:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{focusedTask.user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-405">
                    <span>Prazo (SLA):</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{focusedTask.dueDate}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <p className="text-[10px] text-blue-700 dark:text-blue-300 italic leading-relaxed">
                    💡 <strong>Ação de Tática:</strong> Você pode transferir esta tarefa de {focusedTask.user?.name} para um membro com carga mais saudável na tabela do Kanban.
                  </p>
                </div>
              </div>
            )}

            {/* If User node details selected */}
            {selectedNodeType === "user" && focusedUser && (
              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5 transition-colors">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: focusedUser.avatarColor }}
                    >
                      {focusedUser.name.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{focusedUser.name}</h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{focusedUser.role}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
                    <div className="bg-slate-50 dark:bg-slate-950 p-1.5 rounded border border-slate-100 dark:border-slate-800">
                      <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {focusedUserTasks.filter(t=>t.status === "TODO").length}
                      </div>
                      <div className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase">A Fazer</div>
                    </div>
                    <div className="bg-blue-50/50 dark:bg-blue-950/20 p-1.5 rounded border border-blue-100/50 dark:border-blue-900/30">
                      <div className="text-xs font-black text-blue-600 dark:text-blue-400">
                        {focusedUserTasks.filter(t=>t.status === "IN_PROGRESS").length}
                      </div>
                      <div className="text-[8px] text-blue-500 dark:text-blue-450 font-bold uppercase">WIP</div>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-1.5 rounded border border-emerald-100/50 dark:border-emerald-900/30">
                      <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {focusedUserTasks.filter(t=>t.status === "DONE").length}
                      </div>
                      <div className="text-[8px] text-emerald-500 dark:text-emerald-450 font-bold uppercase">Pronto</div>
                    </div>
                  </div>

                  {/* Overcapacity Diagnostics warning */}
                  {getUserInProgressCount(focusedUser.id) >= alertThreshold ? (
                    <div className="rounded-lg bg-red-50 dark:bg-red-955/20 border border-red-150 dark:border-red-900/40 p-2.5 text-red-800 dark:text-red-300 text-[10px] leading-relaxed flex gap-1.5 items-start">
                      <AlertTriangle className="h-4 w-4 text-red-650 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-red-900 dark:text-red-200 block font-bold uppercase tracking-wider text-[9px] mb-0.5">⚠️ Sobrecarga Crítica detectada!</strong>
                        {focusedUser.name} excedeu o limite configurado de {alertThreshold} tarefas em paralelo. Reatribua tarefas imediatamente para evitar gargalos na reunião semanal de segunda-feira.
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-150 dark:border-emerald-900/30 p-2.5 text-emerald-800 dark:text-emerald-300 text-[10px] leading-relaxed flex gap-1.5 items-start">
                      <CheckCircle className="h-4 w-4 text-emerald-650 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-950 dark:text-emerald-200 block font-bold uppercase tracking-wider text-[9px] mb-0.5">🔋 Fluxo Fluido / Saudável</strong>
                        Carga de trabalho equilibrada para {focusedUser.name}. Fluxo operacional nominal sem riscos de gargalo imediatos.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Default overview when no specific node clicked */}
            {!selectedNodeType && (
              <div className="space-y-3.5 text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-2 transition-colors">
                  <Network className="h-7 w-7 text-blue-500 mx-auto" />
                  <p className="font-bold text-slate-705 dark:text-slate-200">Analise a Topologia</p>
                  <p>Clique em qualquer membro da equipe ou satélite de tarefa para visualizar detalhes diagnósticos.</p>
                </div>

                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Activity className="h-3.5 w-3.5 text-blue-500" />
                    <span>Legenda de Cores</span>
                  </div>
                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-600 border border-blue-400" />
                      <span>Membro em Fluxo Saudável</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600 border border-red-400" />
                      <span>Membro com Sobrecarga (&gt;= {alertThreshold} WIP)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded bg-emerald-600 border border-emerald-400" />
                      <span>Satélite de Tarefa Concluída</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded bg-blue-800 border border-blue-400" />
                      <span>Satélite de Tarefa Ativa</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 text-[9px] text-slate-400 dark:text-slate-500 text-center leading-snug">
            💡 <strong>Dica do Ricardo:</strong> Uma boa topologia reduz o "achismo" em reuniões técnicas.
          </div>
        </div>
      </div>
    </div>
  );
}
