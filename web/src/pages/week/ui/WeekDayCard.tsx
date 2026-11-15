import type { Task } from "../../../entities/task/model/types";
import { TaskRow } from "../../../entities/task/ui/TaskRow";
import { MoveUnfinishedButton } from "../../../features/move-unfinished/ui/MoveUnfinishedButton";
import { formatDayLabel } from "../../../shared/lib/date";
import { EmptyState } from "../../../shared/ui/EmptyState";

type WeekDayCardProps = {
  label: string;
  date: string;
  tasks: Task[];
  loading: boolean;
  onToggle: (task: Task, done: boolean) => void;
  onDelete: (task: Task) => void;
  onMoveUnfinished: (date: string) => void;
};

export function WeekDayCard({
  label,
  date,
  tasks,
  loading,
  onToggle,
  onDelete,
  onMoveUnfinished,
}: WeekDayCardProps) {
  const done = tasks.filter((task) => task.done).length;

  return (
    <section className="week-day">
      <div className="week-day__head">
        <span className="week-day__title">{formatDayLabel(label, date)}</span>
        <span className="week-day__stats">
          {tasks.length ? `выполнено ${done} из ${tasks.length}` : ""}
        </span>
        {done < tasks.length && (
          <MoveUnfinishedButton
            className="week-day__move"
            label="Незакрытые →"
            title="Перенести незакрытые задачи на следующий день"
            onClick={() => onMoveUnfinished(date)}
          />
        )}
      </div>
      {tasks.length ? (
        <ul>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </ul>
      ) : (
        !loading && <EmptyState text="Задач нет" />
      )}
    </section>
  );
}
