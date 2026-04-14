import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, Title, Tooltip, Legend, Filler
);

type Range = "7d" | "30d" | "custom";

interface Props {
  onMenuClick: () => void;
  darkMode: boolean;
}

export default function AnalyticsView({ onMenuClick, darkMode }: Props) {
  const [range, setRange] = useState<Range>("7d");
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));

  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    if (range === "7d") return { startDate: format(subDays(today, 6), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
    if (range === "30d") return { startDate: format(subDays(today, 29), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
    return { startDate: customStart, endDate: customEnd };
  }, [range, customStart, customEnd]);

  const analytics = useQuery(api.tasks.getAnalytics, { startDate, endDate });

  const chartColors = {
    violet: darkMode ? "rgba(139, 92, 246, 0.8)" : "rgba(124, 58, 237, 0.85)",
    emerald: darkMode ? "rgba(52, 211, 153, 0.8)" : "rgba(16, 185, 129, 0.85)",
    amber: darkMode ? "rgba(251, 191, 36, 0.8)" : "rgba(245, 158, 11, 0.85)",
    rose: darkMode ? "rgba(251, 113, 133, 0.8)" : "rgba(244, 63, 94, 0.85)",
    grid: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
    text: darkMode ? "#94a3b8" : "#64748b",
  };

  const days = useMemo(() => {
    try {
      return eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });
    } catch { return []; }
  }, [startDate, endDate]);

  const barData = useMemo(() => {
    const labels = days.map((d) => format(d, "MMM d"));
    const completedData = days.map((d) => analytics?.perDay?.[format(d, "yyyy-MM-dd")]?.completed ?? 0);
    const pendingData = days.map((d) => analytics?.perDay?.[format(d, "yyyy-MM-dd")]?.pending ?? 0);
    return {
      labels,
      datasets: [
        { label: "Completed", data: completedData, backgroundColor: chartColors.emerald, borderRadius: 6 },
        { label: "Pending", data: pendingData, backgroundColor: chartColors.amber, borderRadius: 6 },
      ],
    };
  }, [days, analytics, darkMode]);

  const pieData = useMemo(() => ({
    labels: ["Completed", "Pending", "Cancelled"],
    datasets: [{
      data: [analytics?.completed ?? 0, analytics?.pending ?? 0, analytics?.cancelled ?? 0],
      backgroundColor: [chartColors.emerald, chartColors.amber, chartColors.rose],
      borderWidth: 0,
    }],
  }), [analytics, darkMode]);

  const lineData = useMemo(() => {
    const labels = days.map((d) => format(d, "MMM d"));
    let cumulative = 0;
    const cumulativeData = days.map((d) => {
      cumulative += analytics?.perDay?.[format(d, "yyyy-MM-dd")]?.completed ?? 0;
      return cumulative;
    });
    return {
      labels,
      datasets: [{
        label: "Cumulative Completed",
        data: cumulativeData,
        borderColor: chartColors.violet,
        backgroundColor: darkMode ? "rgba(139,92,246,0.15)" : "rgba(124,58,237,0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.violet,
        pointRadius: 4,
      }],
    };
  }, [days, analytics, darkMode]);

  const chartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartColors.text, font: { size: 12 } } },
      title: { display: false },
      tooltip: { backgroundColor: darkMode ? "#1e293b" : "#fff", titleColor: darkMode ? "#f1f5f9" : "#0f172a", bodyColor: chartColors.text, borderColor: darkMode ? "#334155" : "#e2e8f0", borderWidth: 1 },
    },
    scales: {
      x: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text, maxTicksLimit: 8 } },
      y: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text } },
    },
  });

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { color: chartColors.text, padding: 16, font: { size: 12 } } },
      tooltip: { backgroundColor: darkMode ? "#1e293b" : "#fff", titleColor: darkMode ? "#f1f5f9" : "#0f172a", bodyColor: chartColors.text, borderColor: darkMode ? "#334155" : "#e2e8f0", borderWidth: 1 },
    },
  };

  const metrics = [
    { label: "Total Tasks", value: analytics?.total ?? 0, icon: "◈", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Completed", value: analytics?.completed ?? 0, icon: "✓", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Pending", value: analytics?.pending ?? 0, icon: "◷", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Cancelled", value: analytics?.cancelled ?? 0, icon: "✕", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Completion %", value: `${analytics?.completionRate ?? 0}%`, icon: "◎", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    { label: "🔥 Streak", value: `${analytics?.streak ?? 0} days`, icon: "🔥", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">☰</button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your productivity</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Range Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {(["7d", "30d", "custom"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                range === r
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-violet-300"
              }`}
            >
              {r === "7d" ? "Last 7 Days" : r === "30d" ? "Last 30 Days" : "Custom Range"}
            </button>
          ))}
          {range === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          )}
        </div>

        {analytics === undefined ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600"></div>
          </div>
        ) : analytics === null ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-slate-500 dark:text-slate-400">No data available</p>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className={`${m.bg} rounded-2xl p-4 flex flex-col gap-1`}>
                  <span className={`text-2xl font-bold ${m.color}`}>{m.value}</span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Completion Progress */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Completion Rate</h3>
                <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{analytics?.completionRate ?? 0}%</span>
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${analytics?.completionRate ?? 0}%` }}
                />
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bar Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Tasks Per Day</h3>
                <div className="h-56">
                  <Bar data={barData} options={chartOptions("Tasks Per Day") as any} />
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Task Status Distribution</h3>
                <div className="h-56">
                  {(analytics?.total ?? 0) > 0 ? (
                    <Pie data={pieData} options={pieOptions} />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                      No data for this period
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Productivity Trend</h3>
              <div className="h-56">
                <Line data={lineData} options={chartOptions("Productivity Trend") as any} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
