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
  createTask: (title: string, priority?: number) => Promise<void>;
  toggleDone: (id: string, done: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

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
      }>("/api/tasks", {
        params: { q, status, sort, order, page, limit },
      });

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

  createTask: async (title: string, priority = 5) => {
    set({ loading: true, error: null });

    try {
      const res = await api.post<{ task: Task }>("/api/tasks", {
        title,
        priority,
      });

      // Додаємо на початок, бо зазвичай sort = createdAt desc
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

  toggleDone: async (id: string, done: boolean) => {
    set({ error: null });

    // optimistic
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, done } : t)),
    }));

    try {
      const res = await api.patch<{ task: Task }>(`/api/tasks/${id}`, { done });

      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data.task : t)),
      }));
    } catch (err: any) {
      // rollback
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? { ...t, done: !done } : t)),
        error: err.response?.data?.message || err.message || "Failed to update task",
      }));
    }
  },

  deleteTask: async (id: string) => {
    set({ error: null });

    let removed: Task | null = null;

    // optimistic remove
    set((state) => {
      removed = state.tasks.find((t) => t._id === id) ?? null;
      return {
        tasks: state.tasks.filter((t) => t._id !== id),
        total: Math.max(0, state.total - 1),
      };
    });

    try {
      await api.delete(`/api/tasks/${id}`);
    } catch (err: any) {
      // rollback
      set((state) => ({
        tasks: removed ? [removed, ...state.tasks] : state.tasks,
        total: removed ? state.total + 1 : state.total,
        error: err.response?.data?.message || err.message || "Failed to delete task",
      }));
    }
  },

  // setters (скидаємо page до 1 при зміні фільтрів)
  setQ: (q: string) => set({ q, page: 1 }),
  setStatus: (status: StatusFilter) => set({ status, page: 1 }),
  setSort: (sort: SortField) => set({ sort, page: 1 }),
  setOrder: (order: SortOrder) => set({ order, page: 1 }),
  setPage: (page: number) => set({ page }),

  // helpers
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
