import { useEffect, useMemo, useState } from "react";

import type { NewTask, Priority, Task, ViewMode } from "../entities/task/model/types";
import { useTasks } from "../entities/task/model/useTasks";
import { DeleteTaskModal } from "../features/delete-task/ui/DeleteTaskModal";
import { useToggleTask } from "../features/toggle-task/model/useToggleTask";
import { ArchivePage } from "../pages/archive/ui/ArchivePage";
import { DayPage } from "../pages/day/ui/DayPage";
import { WeekPage } from "../pages/week/ui/WeekPage";
import { SEARCH_DEBOUNCE_MS } from "../shared/config";
import { addDays, todayISO } from "../shared/lib/date";
import { Header } from "../widgets/header/ui/Header";

export function App() {
  const [mode, setMode] = useState<ViewMode>("day");
  const [modeBeforeArchive, setModeBeforeArchive] = useState<ViewMode>("day");
  const [viewDate, setViewDate] = useState(todayISO);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const { tasks, loading, error, addTask, toggleTask, deleteTask, archiveDone, moveUnfinished, restoreTask } =
    useTasks({ mode, date: viewDate, query });

  const onToggle = useToggleTask(toggleTask);

  const visibleTasks = useMemo(
    () => (priority === "all" ? tasks : tasks.filter((task) => task.priority === priority)),
    [tasks, priority],
  );

  const handleAdd = async (input: NewTask): Promise<boolean> => {
    const ok = await addTask(input);
    if (ok && mode === "day") setViewDate(input.date);
    return ok;
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    if (await deleteTask(pendingDelete.id)) setPendingDelete(null);
  };

  const shift = (days: number) => setViewDate((date) => addDays(date, days));

  const toggleArchive = () => {
    if (mode === "archive") {
      setMode(modeBeforeArchive);
      return;
    }
    setModeBeforeArchive(mode);
    setMode("archive");
  };

  return (
    <div className="app">
      <Header
        mode={mode}
        date={viewDate}
        onDateChange={setViewDate}
        onPrev={() => shift(mode === "week" ? -7 : -1)}
        onNext={() => shift(mode === "week" ? 7 : 1)}
        onToday={() => setViewDate(todayISO())}
        onModeChange={setMode}
        onToggleArchive={toggleArchive}
      />

      {mode === "day" && (
        <DayPage
          date={viewDate}
          tasks={visibleTasks}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          onAdd={handleAdd}
          onToggle={onToggle}
          onDelete={setPendingDelete}
          onArchiveDone={() => void archiveDone(viewDate)}
          onMoveUnfinished={() => void moveUnfinished(viewDate)}
        />
      )}

      {mode === "week" && (
        <WeekPage
          date={viewDate}
          tasks={visibleTasks}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          onToggle={onToggle}
          onDelete={setPendingDelete}
          onMoveUnfinished={(date) => void moveUnfinished(date)}
          onAdd={handleAdd}
        />
      )}

      {mode === "archive" && (
        <ArchivePage tasks={tasks} loading={loading} onRestore={(id) => void restoreTask(id)} />
      )}

      {error && <p className="error">{error}</p>}

      <DeleteTaskModal
        task={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
