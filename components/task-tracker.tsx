"use client";

import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export type Track = {
  id: string;
  name: string;
  tasks: Task[];
};

const STORAGE_KEY = "app-tracking-tracks";
const LEGACY_STORAGE_KEY = "app-tracking-tasks";
const INITIAL_TRACK_COUNT = 5;

function isTask(t: unknown): t is Task {
  return (
    t != null &&
    typeof t === "object" &&
    typeof (t as Task).id === "string" &&
    typeof (t as Task).title === "string" &&
    typeof (t as Task).completed === "boolean"
  );
}

function loadLegacyTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

function isTrack(t: unknown): t is Track {
  if (t == null || typeof t !== "object") return false;
  const o = t as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.name !== "string" ||
    !Array.isArray(o.tasks)
  ) {
    return false;
  }
  return o.tasks.every(isTask);
}

function createEmptyTrack(displayIndex: number): Track {
  return {
    id: crypto.randomUUID(),
    name: `Track ${displayIndex}`,
    tasks: [],
  };
}

function defaultTracks(): Track[] {
  return Array.from({ length: INITIAL_TRACK_COUNT }, (_, i) =>
    createEmptyTrack(i + 1)
  );
}

function loadTracks(): Track[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isTrack)) {
        return parsed;
      }
    }
    const legacyTasks = loadLegacyTasks();
    const tracks = defaultTracks();
    if (legacyTasks.length > 0) {
      tracks[0] = { ...tracks[0], tasks: legacyTasks };
    }
    return tracks;
  } catch {
    return defaultTracks();
  }
}

type TrackColumnProps = {
  track: Track;
  onAddTask: (trackId: string, title: string) => void;
  onToggleTask: (trackId: string, taskId: string) => void;
  onDeleteTask: (trackId: string, taskId: string) => void;
};

function TrackColumn({
  track,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: TrackColumnProps) {
  const [input, setInput] = useState("");

  const addTask = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const title = input.trim();
      if (!title) return;
      onAddTask(track.id, title);
      setInput("");
    },
    [input, onAddTask, track.id]
  );

  const activeCount = track.tasks.filter((t) => !t.completed).length;

  return (
    <div className="flex w-[min(100%,20rem)] shrink-0 flex-col rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm shadow-zinc-900/5 sm:p-5">
      <header className="mb-4">
        <h2 className="text-base font-semibold tracking-tight text-zinc-900">
          {track.name}
        </h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          {activeCount === 0
            ? "Nothing left to do"
            : `${activeCount} active ${activeCount === 1 ? "task" : "tasks"}`}
        </p>
      </header>

      <form onSubmit={addTask} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Add a task…"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20"
          aria-label={`New task for ${track.name}`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
        >
          Add
        </button>
      </form>

      <ul className="max-h-[min(50vh,24rem)] space-y-2 overflow-y-auto" aria-label={`Tasks in ${track.name}`}>
        {track.tasks.length === 0 ? (
          <li className="rounded-xl border border-dashed border-zinc-200 py-8 text-center text-xs text-zinc-400">
            No tasks yet.
          </li>
        ) : (
          track.tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 px-2.5 py-2 transition hover:border-zinc-200 hover:bg-white"
            >
              <button
                type="button"
                onClick={() => onToggleTask(track.id, task.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400 transition hover:border-violet-300 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
                aria-pressed={task.completed}
                aria-label={
                  task.completed ? "Mark as not done" : "Mark as done"
                }
              >
                {task.completed ? (
                  <svg
                    className="h-3.5 w-3.5 text-violet-600"
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
                  <span className="h-3 w-3 rounded border border-zinc-300" />
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
                onClick={() => onDeleteTask(track.id, task.id)}
                className="shrink-0 rounded-lg px-1.5 py-1 text-[10px] font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
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

export function TaskTracker() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTracks(loadTracks());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks));
  }, [tracks, mounted]);

  const addTrack = useCallback(() => {
    setTracks((prev) => [
      ...prev,
      createEmptyTrack(prev.length + 1),
    ]);
  }, []);

  const addTask = useCallback((trackId: string, title: string) => {
    setTracks((prev) =>
      prev.map((tr) =>
        tr.id === trackId
          ? {
              ...tr,
              tasks: [
                ...tr.tasks,
                {
                  id: crypto.randomUUID(),
                  title,
                  completed: false,
                },
              ],
            }
          : tr
      )
    );
  }, []);

  const toggleComplete = useCallback((trackId: string, taskId: string) => {
    setTracks((prev) =>
      prev.map((tr) =>
        tr.id !== trackId
          ? tr
          : {
              ...tr,
              tasks: tr.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
      )
    );
  }, []);

  const deleteTask = useCallback((trackId: string, taskId: string) => {
    setTracks((prev) =>
      prev.map((tr) =>
        tr.id !== trackId
          ? tr
          : { ...tr, tasks: tr.tasks.filter((t) => t.id !== taskId) }
      )
    );
  }, []);

  const totalActive = tracks.reduce(
    (n, tr) => n + tr.tasks.filter((t) => !t.completed).length,
    0
  );

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/30 p-4 shadow-sm shadow-zinc-900/5 sm:p-6">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Tracks
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
            {totalActive > 0
              ? ` · ${totalActive} active ${totalActive === 1 ? "task" : "tasks"}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={addTrack}
          className="shrink-0 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-800 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-400/40"
        >
          Add new
        </button>
      </header>

      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-2">
        {tracks.map((track) => (
          <TrackColumn
            key={track.id}
            track={track}
            onAddTask={addTask}
            onToggleTask={toggleComplete}
            onDeleteTask={deleteTask}
          />
        ))}
      </div>
    </div>
  );
}
