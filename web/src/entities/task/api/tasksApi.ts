import { api } from "../../../shared/api/client";
import type { NewTask, Task } from "../model/types";

const encode = encodeURIComponent;

function tasksPath(params: Record<string, string>): string {
  return `/api/tasks?${new URLSearchParams(params).toString()}`;
}

export function fetchDay(date: string, query: string): Promise<Task[]> {
  return api.get<Task[]>(tasksPath(query ? { date, q: query } : { date }));
}

export function fetchRange(from: string, to: string, query: string): Promise<Task[]> {
  return api.get<Task[]>(tasksPath(query ? { from, to, q: query } : { from, to }));
}

export function fetchArchive(): Promise<Task[]> {
  return api.get<Task[]>("/api/archive");
}

export function createTask(input: NewTask): Promise<Task> {
  return api.post<Task>("/api/tasks", input);
}

export function updateTask(id: string, patch: { done: boolean }): Promise<Task> {
  return api.patch<Task>(`/api/tasks/${encode(id)}`, patch);
}

export function deleteTask(id: string): Promise<{ ok: boolean; id: string }> {
  return api.remove<{ ok: boolean; id: string }>(`/api/tasks/${encode(id)}`);
}

export function archiveDone(date: string): Promise<{ archived: number; date: string }> {
  return api.post<{ archived: number; date: string }>("/api/tasks/archive-done", { date });
}

export function moveUnfinished(date: string): Promise<{ moved: number; date: string }> {
  return api.post<{ moved: number; date: string }>("/api/tasks/move-unfinished", { date });
}

export function restoreTask(id: string): Promise<Task> {
  return api.post<Task>(`/api/tasks/${encode(id)}/restore`);
}
