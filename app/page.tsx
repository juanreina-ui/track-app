import { TaskTracker } from "@/components/task-tracker";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-6xl">
        <TaskTracker />
      </div>
    </main>
  );
}
