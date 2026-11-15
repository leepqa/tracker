import { useCallback } from "react";

import type { Task } from "../../../entities/task/model/types";

/** Обработчик чекбокса задачи: отметка выполненной/невыполненной. */
export function useToggleTask(onToggle: (id: string, done: boolean) => void) {
  return useCallback((task: Task, done: boolean) => onToggle(task.id, done), [onToggle]);
}
