"use client";

import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = "app-tracking-tasks";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t): t is Task =>
        t != null &&
        typeof t === "object" &&
        typeof (t as Task).id === "string" &&
        typeof (t as Task).title === "string" &&
        typeof (t as Task).completed === "boolean"
    );
  } catch {
    return [];
  }
}

export function TaskTracker() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTasks(loadTasks());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, mounted]);

  const addTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const title = input.trim();
      if (!title) return;
      setTasks((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title,
          completed: false,
        },
      ]);
      setInput("");
    },
    [input]
  );

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm shadow-zinc-900/5 sm:p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Tasks
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {activeCount === 0
            ? "Nothing left to do"
            : `${activeCount} active ${activeCount === 1 ? "task" : "tasks"}`}
        </p>
      </header>

      <form onSubmit={addTask} className="mb-6 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Add a task…"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20"
          aria-label="New task title"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Add
        </button>
      </form>

      <ul className="space-y-2" aria-label="Task list">
        {tasks.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-200 py-10 text-center text-sm text-zinc-400">
            No tasks yet. Add one above.
          </li>
        ) : (
          tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50/50 px-3 py-2.5 transition hover:border-zinc-200 hover:bg-white"
            >
              <button
                type="button"
                onClick={() => toggleComplete(task.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 transition hover:border-violet-300 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                aria-pressed={task.completed}
                aria-label={
                  task.completed ? "Mark as not done" : "Mark as done"
                }
              >
                {task.completed ? (
                  <svg
                    className="h-4 w-4 text-violet-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <span className="h-3.5 w-3.5 rounded border border-zinc-300" />
                )}
              </button>
              <span
                className={`min-w-0 flex-1 text-sm ${
                  task.completed
                    ? "text-zinc-400 line-through decoration-zinc-300"
                    : "text-zinc-800"
                }`}
              >
                {task.title}
              </span>
              <button
                type="button"
                onClick={() => deleteTask(task.id)}
                className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                aria-label={`Delete ${task.title}`}
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
