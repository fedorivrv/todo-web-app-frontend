import { create } from "zustand";
import { api } from "@/lib/api";

export type Task = {
  _id: string;
  title: string;
  description: string | null;
  done: boolean;
  priority: number;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StatusFilter = "all" | "done" | "undone";
export type SortField = "createdAt" | "priority";
export type SortOrder = "asc" | "desc";

type TasksState = {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  q: string;
  status: StatusFilter;
  sort: SortField;
  order: SortOrder;

  loading: boolean;
  error: string | null;

  // actions
  fetchTasks: () => Promise<void>;
  createTask: (title: string, priority?: number, category?: string | null) => Promise<void>;
  toggleDone: (id: string, done: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updatePriority: (id: string, priority: number) => Promise<void>;

  updateTaskField: <
    K extends keyof Pick<Task, "title" | "description" | "priority" | "done" | "category" | "dueDate">
  >(
    id: string,
    patch: Pick<Task, K>
  ) => Promise<void>;

  // filters/actions
  setQ: (q: string) => void;
  setStatus: (status: StatusFilter) => void;
  setSort: (sort: SortField) => void;
  setOrder: (order: SortOrder) => void;
  setPage: (page: number) => void;

  apply: () => Promise<void>;
  resetFilters: () => Promise<void>;
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,

  q: "",
  status: "all",
  sort: "createdAt",
  order: "desc",

  loading: false,
  error: null,

  fetchTasks: async () => {
    const { q, status, sort, order, page, limit } = get();

    set({ loading: true, error: null });

    try {
      const res = await api.get<{
        tasks: Task[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>("/api/tasks", { params: { q, status, sort, order, page, limit } });

      set({
        tasks: res.data.tasks,
        total: res.data.total,
        page: res.data.page,
        limit: res.data.limit,
        totalPages: res.data.totalPages,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to fetch tasks",
        loading: false,
      });
    }
  },

  createTask: async (title: string, priority = 5, category: string | null = null) => {
    set({ loading: true, error: null });

    try {
      const res = await api.post<{ task: Task }>("/api/tasks", {
        title,
        priority,
        category: category && category.trim() ? category.trim() : null,
      });

      set((state) => ({
        tasks: [res.data.task, ...state.tasks],
        total: state.total + 1,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message || "Failed to create task",
        loading: false,
      });
    }
  },

  updateTaskField: async (id, patch) => {
    set({ error: null });

    const prev = get().tasks.find((t) => t._id === id) ?? null;

    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...patch } : t)),
    }));

    try {
      const res = await api.patch<{ task: Task }>(`/api/tasks/${id}`, patch);

      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data.task : t)),
      }));
    } catch (err: any) {
      set((state) => ({
        tasks: prev ? state.tasks.map((t) => (t._id === id ? prev : t)) : state.tasks,
        error: err.response?.data?.message || err.message || "Failed to update task",
      }));
    }
  },

  toggleDone: async (id: string, done: boolean) => {
    await get().updateTaskField(id, { done });
  },

  updatePriority: async (id: string, priority: number) => {
    const p = Math.max(1, Math.min(10, Math.trunc(priority)));
    await get().updateTaskField(id, { priority: p });
  },

  deleteTask: async (id: string) => {
    set({ error: null });

    const prevTasks = get().tasks;
    const removed = prevTasks.find((t) => t._id === id) ?? null;

    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
      total: Math.max(0, state.total - 1),
    }));

    try {
      await api.delete(`/api/tasks/${id}`);
    } catch (err: any) {
      set({
        tasks: removed ? [removed, ...prevTasks] : prevTasks,
        total: removed ? get().total + 1 : get().total,
        error: err.response?.data?.message || err.message || "Failed to delete task",
      });
    }
  },

  setQ: (q: string) => set({ q, page: 1 }),
  setStatus: (status: StatusFilter) => set({ status, page: 1 }),
  setSort: (sort: SortField) => set({ sort, page: 1 }),
  setOrder: (order: SortOrder) => set({ order, page: 1 }),
  setPage: (page: number) => set({ page }),

  apply: async () => {
    await get().fetchTasks();
  },

  resetFilters: async () => {
    set({
      q: "",
      status: "all",
      sort: "createdAt",
      order: "desc",
      page: 1,
    });
    await get().fetchTasks();
  },
}));
