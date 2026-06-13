import React, { useState, useEffect } from "react";
import { User, Task } from "../types";
import { X, Calendar, User as UserIcon, Type, AlignLeft, CheckCircle } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate: string;
    userId: string;
    isHighImpact: boolean;
  }) => void;
  users: User[];
  task?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSave, users, task }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"TODO" | "IN_PROGRESS" | "DONE">("TODO");
  const [dueDate, setDueDate] = useState("");
  const [userId, setUserId] = useState("");
  const [isHighImpact, setIsHighImpact] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      // Format to yyyy-MM-dd
      const dateObj = new Date(task.dueDate);
      const formattedDate = dateObj.toISOString().split("T")[0];
      setDueDate(formattedDate);
      setUserId(task.userId);
      setIsHighImpact(!!task.isHighImpact);
    } else {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      // Default due date to today
      setDueDate(new Date().toISOString().split("T")[0]);
      setUserId(users[0]?.id || "");
      setIsHighImpact(false);
    }
  }, [task, isOpen, users]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate || !userId) return;
    onSave({
      title,
      description,
      status,
      dueDate,
      userId,
      isHighImpact,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl transition-all border border-neutral-100 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-slate-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-slate-100">
            {task ? "Editar Tarefa" : "Nova Tarefa"}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-neutral-600 dark:hover:text-slate-300 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Type className="h-3.5 w-3.5 text-neutral-400" /> Título da Tarefa
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Criar API de pagamentos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 dark:border-slate-700 px-3.5 py-2 text-sm text-neutral-800 dark:text-slate-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5 text-neutral-400" /> Descrição
            </label>
            <textarea
              placeholder="Descreva brevemente os objetivos e entregáveis da tarefa..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 dark:border-slate-700 px-3.5 py-2 text-sm text-neutral-800 dark:text-slate-100 placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Responsável e Status em Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Responsável */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="h-3.5 w-3.5 text-neutral-400" /> Responsável
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 dark:border-slate-700 px-3 py-2 text-sm text-neutral-800 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-100">
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-neutral-400" /> Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-neutral-200 dark:border-slate-700 px-3 py-2 text-sm text-neutral-800 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="TODO" className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-100">A Fazer</option>
                <option value="IN_PROGRESS" className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-100">Em Andamento</option>
                <option value="DONE" className="bg-white dark:bg-slate-900 text-neutral-800 dark:text-slate-100">Concluído</option>
              </select>
            </div>
          </div>

          {/* Prazo */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" /> Data de Vencimento
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 dark:border-slate-700 px-3.5 py-2 text-sm text-neutral-800 dark:text-slate-100 bg-white dark:bg-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Alta Importância switch/checkbox */}
          <div className="flex items-center justify-between p-3.5 bg-indigo-50/45 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
            <div className="space-y-0.5">
              <label htmlFor="is-high-impact-checkbox" className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wide flex items-center gap-1.5 cursor-pointer select-none">
                🌟 Alta Importância (High Impact)
              </label>
              <p className="text-[10px] text-indigo-700 dark:text-indigo-400 leading-relaxed max-w-[340px]">
                Define se esta atividade possui relevância técnica ou estratégica elevada.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="is-high-impact-checkbox"
                type="checkbox"
                checked={isHighImpact}
                onChange={(e) => setIsHighImpact(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="border-t border-neutral-100 dark:border-slate-800 pt-5 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-slate-300 hover:bg-neutral-50 dark:hover:bg-slate-800 hover:text-neutral-800 dark:hover:text-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition shadow-sm"
            >
              Salvar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
