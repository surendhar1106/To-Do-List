import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {
    search: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    if (args.status && args.status !== "all") {
      tasks = tasks.filter((t) => t.status === args.status);
    }

    if (args.search && args.search.trim() !== "") {
      const s = args.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description ?? "").toLowerCase().includes(s)
      );
    }

    return tasks;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    date: v.string(),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("tasks", {
      userId,
      title: args.title,
      description: args.description,
      date: args.date,
      time: args.time,
      status: "pending",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    const { id, ...rest } = args;
    const patch: Record<string, string | undefined> = {};
    if (rest.title !== undefined) patch.title = rest.title;
    if (rest.description !== undefined) patch.description = rest.description;
    if (rest.date !== undefined) patch.date = rest.date;
    if (rest.time !== undefined) patch.time = rest.time;

    await ctx.db.patch(args.id, patch);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});

export const getAnalytics = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const filtered = tasks.filter((t) => t.date >= args.startDate && t.date <= args.endDate);

    const total = filtered.length;
    const completed = filtered.filter((t) => t.status === "completed").length;
    const pending = filtered.filter((t) => t.status === "pending").length;
    const cancelled = filtered.filter((t) => t.status === "cancelled").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Tasks per day
    const perDay: Record<string, { completed: number; pending: number; cancelled: number }> = {};
    for (const t of filtered) {
      if (!perDay[t.date]) perDay[t.date] = { completed: 0, pending: 0, cancelled: 0 };
      perDay[t.date][t.status]++;
    }

    // Streak: consecutive days with at least 1 completed task (from today backwards)
    const allCompleted = tasks.filter((t) => t.status === "completed");
    const completedDays = new Set(allCompleted.map((t) => t.date));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (completedDays.has(ds)) {
        streak++;
      } else {
        break;
      }
    }

    return { total, completed, pending, cancelled, completionRate, perDay, streak };
  },
});
