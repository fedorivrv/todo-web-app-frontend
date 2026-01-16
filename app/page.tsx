"use client";

import { useEffect, useState } from "react";
import { useTasksStore } from "@/store/tasks.store";

export default function HomePage() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    toggleDone,
    deleteTask,
  } = useTasksStore();

  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onAdd = async () => {
    const value = title.trim();
    if (!value) return;

    await createTask(value, 5);
    setTitle("");
  };

  return (
    <main style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Tasks
      </h1>

      {/* Create task */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
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

      {error && (
        <p style={{ color: "red", marginBottom: 12 }}>{error}</p>
      )}

      {/* Tasks list */}
      {loading && tasks.length === 0 ? (
        <p>Loading...</p>
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
                  onChange={(e) =>
                    toggleDone(task._id, e.target.checked)
                  }
                />
                <span
                  style={{
                    textDecoration: task.done
                      ? "line-through"
                      : "none",
                    opacity: task.done ? 0.6 : 1,
                  }}
                >
                  {task.title}
                </span>
                <span style={{ opacity: 0.6 }}>
                  p:{task.priority}
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
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
