import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Sidebar from "./components/Sidebar";
import TasksView from "./components/TasksView";
import AnalyticsView from "./components/AnalyticsView";

export type View = "tasks" | "analytics";

export default function Dashboard() {
  const [view, setView] = useState<View>("tasks");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
        <Sidebar
          view={view}
          setView={setView}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {view === "tasks" ? (
            <TasksView onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} />
          ) : (
            <AnalyticsView onMenuClick={() => setSidebarOpen(true)} darkMode={darkMode} />
          )}
        </main>
      </div>
    </div>
  );
}
