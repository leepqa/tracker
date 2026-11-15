import type { Task } from "../../../entities/task/model/types";
import { TaskRow } from "../../../entities/task/ui/TaskRow";
import { ArchiveDoneButton } from "../../../features/archive-done/ui/ArchiveDoneButton";
import { MoveUnfinishedButton } from "../../../features/move-unfinished/ui/MoveUnfinishedButton";
import { EmptyState } from "../../../shared/ui/EmptyState";

type DayTasksProps = {
  tasks: Task[];
  loading: boolean;
  filtered: boolean;
  onToggle: (task: Task, done: boolean) => void;
  onDelete: (task: Task) => void;
  onArchiveDone: () => void;
  onMoveUnfinished: () => void;
};

export function DayTasks({
  tasks,
  loading,
  filtered,
  onToggle,
  onDelete,
  onArchiveDone,
  onMoveUnfinished,
}: DayTasksProps) {
  const done = tasks.filter((task) => task.done).length;

  return (
    <>
      <ul>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>
      {!loading && tasks.length === 0 && (
        <EmptyState text={filtered ? "Ничего не найдено" : "На этот день задач нет"} />
      )}
      <footer>
        <span>{tasks.length ? `Выполнено ${done} из ${tasks.length}` : ""}</span>
        {done < tasks.length && <MoveUnfinishedButton onClick={onMoveUnfinished} />}
        {done > 0 && <ArchiveDoneButton onClick={onArchiveDone} />}
      </footer>
    </>
  );
}
