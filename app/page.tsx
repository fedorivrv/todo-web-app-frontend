"use client";

import { useEffect, useMemo, useState } from "react";
import { useTasksStore } from "@/store/tasks.store";

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

    await createTask(value, 5, category);
    setTitle("");
    setCategory("");
  };

  return (
    <main style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          Tasks
        </h1>
        <div style={{ opacity: 0.7, fontSize: 13 }}>
          {activeSubtitle} • total={total}
        </div>
      </header>

      {/* Create task */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New task title..."
              style={{
                flex: 1,
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            />
            <button
              onClick={onAdd}
              disabled={loading}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Add
            </button>
          </div>

          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (optional) e.g. work, home"
            style={{
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />
        </div>
      </section>

      {/* Filters */}
      <section style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks..."
            style={{
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
            }}
          />

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              style={{
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="done">Done</option>
              <option value="undone">Undone</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              style={{
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
              aria-label="Sort field"
            >
              <option value="createdAt">Created date</option>
              <option value="priority">Priority</option>
            </select>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as any)}
              style={{
                padding: 10,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
              aria-label="Sort order"
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>

            <button
              onClick={apply}
              disabled={loading}
              style={{ padding: "10px 14px", borderRadius: 8 }}
            >
              Apply
            </button>

            <button
              onClick={resetFilters}
              disabled={loading}
              style={{ padding: "10px 14px", borderRadius: 8 }}
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

      {/* Tasks list */}
      <section style={{ marginBottom: 16 }}>
        {loading && tasks.length === 0 ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No tasks found.</p>
        ) : (
          <ul style={{ display: "grid", gap: 8 }}>
            {tasks.map((task) => (
              <li
                key={task._id}
                style={{
                  padding: 12,
                  border: "1px solid #eee",
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => toggleDone(task._id, e.target.checked)}
                    />

                    <span
                      style={{
                        textDecoration: task.done ? "line-through" : "none",
                        opacity: task.done ? 0.6 : 1,
                        wordBreak: "break-word",
                        flex: 1,
                      }}
                    >
                      {task.title}
                    </span>
                  </label>

                  <button
                    onClick={() => deleteTask(task._id)}
                    title="Delete task"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    🗑️
                  </button>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {/* Priority editor */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ opacity: 0.6 }}>Priority</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={task.priority}
                      onChange={(e) =>
                        updatePriority(task._id, Number(e.target.value))
                      }
                      style={{
                        width: 64,
                        padding: "6px 8px",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                      }}
                    />
                  </div>

                  {/* Category editor */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ opacity: 0.6 }}>Category</span>
                    <input
                      value={task.category ?? ""}
                      onChange={(e) =>
                        updateTaskField(task._id, {
                          category: e.target.value.trim() ? e.target.value : null,
                        })
                      }
                      placeholder="(none)"
                      style={{
                        width: 180,
                        padding: "6px 8px",
                        border: "1px solid #ccc",
                        borderRadius: 8,
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pagination */}
      <footer style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={async () => {
            if (!canPrev) return;
            setPage(page - 1);
            await apply();
          }}
          disabled={!canPrev || loading}
          style={{ padding: "10px 14px", borderRadius: 8 }}
        >
          Prev
        </button>

        <div style={{ opacity: 0.75 }}>
          Page <b>{page}</b> / <b>{totalPages || 1}</b>
        </div>

        <button
          onClick={async () => {
            if (!canNext) return;
            setPage(page + 1);
            await apply();
          }}
          disabled={!canNext || loading}
          style={{ padding: "10px 14px", borderRadius: 8 }}
        >
          Next
        </button>
      </footer>
    </main>
  );
}
