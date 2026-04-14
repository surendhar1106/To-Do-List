import { useState } from "react";
import { format, parseISO, isToday, isTomorrow, isPast } from "date-fns";
import type { Id } from "../../convex/_generated/dataModel";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: "pending" | "completed" | "cancelled";
  date: string;
  time?: string;
}

interface Props {
  task: Task;
  onDelete: (id: Id<"tasks">) => void;
  onStatusChange: (id: Id<"tasks">, status: "pending" | "completed" | "cancelled") => void;
  onEdit: (task: Task) => void;
  darkMode: boolean;
}

export default function TaskCard({ task, onDelete, onStatusChange, onEdit, darkMode }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const statusConfig = {
    pending: { label: "Pending", bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    completed: { label: "Completed", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    cancelled: { label: "Cancelled", bg: "bg-rose-100 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
  };

  const cfg = statusConfig[task.status];

  const formatDate = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isToday(d)) return "Today";
      if (isTomorrow(d)) return "Tomorrow";
      return format(d, "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const isOverdue = task.status === "pending" && (() => {
    try { return isPast(parseISO(task.date + "T23:59:59")); } catch { return false; }
  })();

  return (
    <div className={`
      group relative bg-white dark:bg-slate-800/80 rounded-2xl border transition-all duration-200
      hover:shadow-lg hover:-translate-y-0.5
      ${task.status === "completed" ? "opacity-75" : ""}
      ${isOverdue ? "border-rose-300 dark:border-rose-700" : "border-slate-200 dark:border-slate-700"}
    `}>
      <div className="p-4 flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onStatusChange(task._id, task.status === "completed" ? "pending" : "completed")}
          className={`
            mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
            ${task.status === "completed"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-slate-300 dark:border-slate-600 hover:border-violet-500"
            }
          `}
        >
          {task.status === "completed" && <span className="text-xs">✓</span>}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-slate-900 dark:text-white ${task.status === "completed" ? "line-through text-slate-400 dark:text-slate-500" : ""}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
              {cfg.label}
            </span>
            <span className={`text-xs ${isOverdue ? "text-rose-500 font-semibold" : "text-slate-400 dark:text-slate-500"}`}>
              📅 {formatDate(task.date)}{task.time ? ` · ${task.time}` : ""}
              {isOverdue && " · Overdue"}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
          >
            ⋯
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden">
                {task.status !== "completed" && (
                  <button
                    onClick={() => { onStatusChange(task._id, "completed"); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    ✓ Mark Complete
                  </button>
                )}
                {task.status !== "pending" && (
                  <button
                    onClick={() => { onStatusChange(task._id, "pending"); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    ↺ Mark Pending
                  </button>
                )}
                <button
                  onClick={() => { onEdit(task); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  ✎ Reschedule
                </button>
                {task.status !== "cancelled" && (
                  <button
                    onClick={() => { onStatusChange(task._id, "cancelled"); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    ✕ Cancel Task
                  </button>
                )}
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  onClick={() => { onDelete(task._id); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2"
                >
                  🗑 Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
