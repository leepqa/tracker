export type Priority = "high" | "medium" | "low";

export type ViewMode = "day" | "week" | "archive";

export type Task = {
  id: string;
  text: string;
  date: string;
  priority: Priority;
  done: boolean;
  moved: number;
  archived: boolean;
  created_at: number;
};

export type NewTask = {
  text: string;
  date: string;
  priority: Priority;
};
