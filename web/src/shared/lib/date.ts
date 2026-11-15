const pad = (value: number): string => String(value).padStart(2, "0");

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseISO(iso: string): Date {
  const parts = iso.split("-").map(Number);
  return new Date(parts[0] ?? 1970, (parts[1] ?? 1) - 1, parts[2] ?? 1);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/** Понедельник недели, в которую попадает дата. */
export function weekStart(iso: string): string {
  const date = parseISO(iso);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toISO(date);
}

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

/** Подпись дня недели: «Пн, 15.11». */
export function formatDayLabel(weekday: string, iso: string): string {
  return `${weekday}, ${iso.slice(8, 10)}.${iso.slice(5, 7)}`;
}
