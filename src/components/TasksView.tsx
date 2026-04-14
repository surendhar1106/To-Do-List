import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import type { Id } from "../../convex/_generated/dataModel";

type StatusFilter = "all" | "pending" | "completed" | "cancelled";

interface Props {
  onMenuClick: () => void;
  darkMode: boolean;
}

export default function TasksView({ onMenuClick, darkMode }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<any>(null);

  const tasks = useQuery(api.tasks.list, {
    status: statusFilter,
    search: search || undefined,
  });

  const removeTask = useMutation(api.tasks.remove);
  const updateStatus = useMutation(api.tasks.updateStatus);

  const handleDelete = async (id: Id<"tasks">) => {
    await removeTask({ id });
    toast.success("Task deleted");
  };

  const handleStatusChange = async (id: Id<"tasks">, status: "pending" | "completed" | "cancelled") => {
    await updateStatus({ id, status });
    const msgs = { completed: "Task completed! 🎉", cancelled: "Task cancelled", pending: "Task marked as pending" };
    toast.success(msgs[status]);
  };

  const filters: { label: string; value: StatusFilter; color: string }[] = [
    { label: "All", value: "all", color: "bg-slate-600" },
    { label: "Pending", value: "pending", color: "bg-amber-500" },
    { label: "Completed", value: "completed", color: "bg-emerald-500" },
    { label: "Cancelled", value: "cancelled", color: "bg-rose-500" },
  ];

  const counts = {
    all: tasks?.length ?? 0,
    pending: tasks?.filter((t) => t.status === "pending").length ?? 0,
    completed: tasks?.filter((t) => t.status === "completed").length ?? 0,
    cancelled: tasks?.filter((t) => t.status === "cancelled").length ?? 0,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ☰
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tasks?.length ?? 0} tasks total
          </p>
        </div>
        <button
          onClick={() => { setEditTask(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-95"
        >
          <span className="text-lg leading-none">+</span>
          Add Task
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${statusFilter === f.value
                  ? `${f.color} text-white shadow-md`
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }
              `}
            >
              {f.label}
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full font-bold
                ${statusFilter === f.value ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}
              `}>
                {counts[f.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Tasks */}
        {tasks === undefined ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl mb-4">
              {search ? "🔍" : "✦"}
            </div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {search ? "No tasks found" : "No tasks yet"}
            </h3>
            <p className="text-slate-500 dark:text-slate-500 text-sm">
              {search ? "Try a different search term" : "Create your first task to get started"}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onEdit={(t) => { setEditTask(t); setShowModal(true); }}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editTask}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}
    </div>
  );
}
