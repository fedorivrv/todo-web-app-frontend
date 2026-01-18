"use client";

import { useEffect, useMemo, useState } from "react";
import { useTasksStore } from "@/store/tasks.store";

function toDateInputValue(isoOrNull: string | null): string {
  if (!isoOrNull) return "";
  const d = new Date(isoOrNull);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function HomePage() {
  const {
    tasks,
    total,
    loading,
    error,

    q,
    status,
    sort,
    order,
    page,
    totalPages,

    fetchTasks,
    createTask,
    toggleDone,
    deleteTask,
    updatePriority,
    updateTaskField,

    setQ,
    setStatus,
    setSort,
    setOrder,
    setPage,

    apply,
    resetFilters,
  } = useTasksStore();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState(""); // YYYY-MM-DD або ""

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const activeSubtitle = useMemo(() => {
    const parts: string[] = [];
    if (q.trim()) parts.push(`q="${q.trim()}"`);
    if (status !== "all") parts.push(`status=${status}`);
    parts.push(`sort=${sort}:${order}`);
    parts.push(`page=${page}/${totalPages || 1}`);
    return parts.join(" • ");
  }, [q, status, sort, order, page, totalPages]);

  const onAdd = async () => {
    const value = title.trim();
    if (!value) return;

    await createTask(value, 5, category.trim() ? category : null, dueDate ? dueDate : null);

    setTitle("");
    setCategory("");
    setDueDate("");
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Tasks</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {activeSubtitle} • total={total}
        </p>
      </header>

      {/* Create */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3">
          <div className="flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New task title..."
              className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            />
            <button
              onClick={onAdd}
              disabled={loading}
              className="h-10 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="h-10 flex-1 rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-10 w-44 rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
              aria-label="Due date (optional)"
            />
          </div>

          <p className="text-xs text-zinc-500">
            Create supports category + due date. Edit also available per task.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks..."
            className="h-10 rounded-xl border border-zinc-200 px-3 outline-none focus:border-zinc-400"
          />

          <div className="flex flex-wrap gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            >
              <option value="all">All</option>
              <option value="done">Done</option>
              <option value="undone">Undone</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            >
              <option value="createdAt">Created date</option>
              <option value="priority">Priority</option>
            </select>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as any)}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <button
              onClick={apply}
              disabled={loading}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply
            </button>

            <button
              onClick={resetFilters}
              disabled={loading}
              className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* List */}
      <section className="space-y-3">
        {loading && tasks.length === 0 ? (
          <p className="text-sm text-zinc-600">Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-zinc-600">No tasks found.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task._id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <label className="flex flex-1 items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => toggleDone(task._id, e.target.checked)}
                      className="mt-1 h-4 w-4"
                    />
                    <div className="flex-1">
                      <div
                        className={[
                          "font-medium",
                          task.done ? "line-through text-zinc-500" : "text-zinc-900",
                        ].join(" ")}
                      >
                        {task.title}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-600">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Priority</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={task.priority}
                            onChange={(e) => updatePriority(task._id, Number(e.target.value))}
                            className="h-9 w-20 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Category</span>
                          <input
                            value={task.category ?? ""}
                            onChange={(e) =>
                              updateTaskField(task._id, {
                                category: e.target.value.trim() ? e.target.value : null,
                              })
                            }
                            placeholder="(none)"
                            className="h-9 w-48 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500">Due</span>
                          <input
                            type="date"
                            value={toDateInputValue(task.dueDate)}
                            onChange={(e) =>
                              updateTaskField(task._id, {
                                dueDate: e.target.value ? e.target.value : null,
                              })
                            }
                            className="h-9 w-44 rounded-xl border border-zinc-200 bg-white px-3 outline-none focus:border-zinc-400"
                          />
                        </div>
                      </div>
                    </div>
                  </label>

                  <button
                    onClick={() => deleteTask(task._id)}
                    title="Delete task"
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold hover:bg-zinc-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <footer className="mt-6 flex items-center gap-3">
        <button
          onClick={async () => {
            if (!canPrev) return;
            setPage(page - 1);
            await apply();
          }}
          disabled={!canPrev || loading}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Prev
        </button>

        <div className="text-sm text-zinc-600">
          Page <span className="font-semibold text-zinc-900">{page}</span> /{" "}
          <span className="font-semibold text-zinc-900">{totalPages || 1}</span>
        </div>

        <button
          onClick={async () => {
            if (!canNext) return;
            setPage(page + 1);
            await apply();
          }}
          disabled={!canNext || loading}
          className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Next
        </button>
      </footer>
    </main>
  );
}
