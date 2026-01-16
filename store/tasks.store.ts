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

type TasksState = {
  tasks: Task[];
  total: number;
  loading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  createTask: (title: string, priority?: number) => Promise<void>;
  toggleDone: (id: string, done: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  total: 0,
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get<{
        tasks: Task[];
        total: number;
        page?: number;
        limit?: number;
        totalPages?: number;
      }>("/api/tasks", { params: { page: 1, limit: 20 } });

      set({
        tasks: res.data.tasks,
        total: res.data.total,
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

 
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? { ...t, done } : t)),
    }));

    try {
      const res = await api.patch<{ task: Task }>(`/api/tasks/${id}`, { done });

    
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? res.data.task : t)),
      }));
    } catch (err: any) {
   
      set((state) => ({
        tasks: state.tasks.map((t) => (t._id === id ? { ...t, done: !done } : t)),
        error: err.response?.data?.message || err.message || "Failed to update task",
      }));
    }
  },

  deleteTask: async (id: string) => {
    set({ error: null });

    let removed: Task | null = null;

   
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
    
      set((state) => ({
        tasks: removed ? [removed, ...state.tasks] : state.tasks,
        total: removed ? state.total + 1 : state.total,
        error: err.response?.data?.message || err.message || "Failed to delete task",
      }));
    }
  },
}));
