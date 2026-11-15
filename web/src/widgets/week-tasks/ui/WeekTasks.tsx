import type { Task } from "../../../entities/task/model/types";
import { addDays, WEEKDAYS } from "../../../shared/lib/date";
import { WeekDayCard } from "../../../pages/week/ui/WeekDayCard";

type WeekTasksProps = {
  start: string;
  tasks: Task[];
  loading: boolean;
  onToggle: (task: Task, done: boolean) => void;
  onDelete: (task: Task) => void;
  onMoveUnfinished: (date: string) => void;
};

export function WeekTasks({ start, tasks, loading, onToggle, onDelete, onMoveUnfinished }: WeekTasksProps) {
  const days = WEEKDAYS.map((label, index) => ({ label, date: addDays(start, index) }));
  const byDate = new Map<string, Task[]>();
  for (const task of tasks) {
    const list = byDate.get(task.date);
    if (list) list.push(task);
    else byDate.set(task.date, [task]);
  }
  const done = tasks.filter((task) => task.done).length;

  return (
    <>
      <div className="week">
        {days.map((day) => (
          <WeekDayCard
            key={day.date}
            label={day.label}
            date={day.date}
            tasks={byDate.get(day.date) ?? []}
            loading={loading}
            onToggle={onToggle}
            onDelete={onDelete}
            onMoveUnfinished={onMoveUnfinished}
          />
        ))}
      </div>
      <footer>
        <span>{tasks.length ? `Выполнено ${done} из ${tasks.length} за неделю` : ""}</span>
      </footer>
    </>
  );
}
