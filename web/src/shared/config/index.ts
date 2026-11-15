export const PRIORITIES = ["high", "medium", "low"] as const;

export const PRIORITY_LABELS = {
  high: "Высокий",
  medium: "Средний",
  low: "Низкий",
} as const;

export const VIEW_OPTIONS = [
  { value: "day", label: "День" },
  { value: "week", label: "Неделя" },
] as const;

export const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "high", label: "Высокий" },
  { value: "medium", label: "Средний" },
  { value: "low", label: "Низкий" },
] as const;

export const SEARCH_DEBOUNCE_MS = 250;
