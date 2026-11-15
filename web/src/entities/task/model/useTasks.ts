import { useCallback, useEffect, useState } from "react";

import { addDays, weekStart } from "../../../shared/lib/date";
import {
  archiveDone as archiveDoneApi,
  createTask,
  deleteTask as deleteTaskApi,
  fetchArchive,
  fetchDay,
  fetchRange,
  moveUnfinished as moveUnfinishedApi,
  restoreTask as restoreTaskApi,
  updateTask,
} from "../api/tasksApi";
import type { NewTask, Task, ViewMode } from "./types";

type UseTasksParams = {
  mode: ViewMode;
  date: string;
  query: string;
};

export type UseTasksResult = {
  tasks: Task[];
  loading: boolean;
  error: string;
  addTask: (input: NewTask) => Promise<boolean>;
  toggleTask: (id: string, done: boolean) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  archiveDone: (date: string) => Promise<boolean>;
  moveUnfinished: (date: string) => Promise<boolean>;
  restoreTask: (id: string) => Promise<boolean>;
};

/** Невыполненные сверху, внутри — по времени создания. */
function sortTasks(tasks: Task[]): Task[] {
  return tasks
    .slice()
    .sort((a, b) => (a.done === b.done ? a.created_at - b.created_at : a.done ? 1 : -1));
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function useTasks({ mode, date, query }: UseTasksParams): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (mode === "archive") {
        setTasks(await fetchArchive());
      } else if (mode === "week") {
        const start = weekStart(date);
        setTasks(sortTasks(await fetchRange(start, addDays(start, 6), query)));
      } else {
        setTasks(sortTasks(await fetchDay(date, query)));
      }
    } catch (cause) {
      setTasks([]);
      setError(`Не удалось загрузить задачи: ${message(cause)}`);
    } finally {
      setLoading(false);
    }
  }, [mode, date, query]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = useCallback(
    async (action: () => Promise<unknown>, errorPrefix: string): Promise<boolean> => {
      setError("");
      try {
        await action();
        await load();
        return true;
      } catch (cause) {
        setError(`${errorPrefix}${message(cause)}`);
        return false;
      }
    },
    [load],
  );

  return {
    tasks,
    loading,
    error,
    addTask: (input) => run(() => createTask(input), "Не удалось добавить задачу: "),
    toggleTask: (id, done) => run(() => updateTask(id, { done }), "Не удалось сохранить отметку: "),
    deleteTask: (id) => run(() => deleteTaskApi(id), "Не удалось удалить задачу: "),
    archiveDone: (day) => run(() => archiveDoneApi(day), "Не удалось убрать выполненные: "),
    moveUnfinished: (day) => run(() => moveUnfinishedApi(day), "Не удалось перенести задачи: "),
    restoreTask: (id) => run(() => restoreTaskApi(id), "Не удалось вернуть задачу: "),
  };
}
