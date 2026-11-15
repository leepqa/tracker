import type { Task } from "../../../entities/task/model/types";
import { RestoreTaskButton } from "../../../features/restore-task/ui/RestoreTaskButton";
import { PRIORITY_LABELS } from "../../../shared/config";
import { EmptyState } from "../../../shared/ui/EmptyState";

type ArchiveTasksProps = {
  tasks: Task[];
  loading: boolean;
  onRestore: (id: string) => void;
};

export function ArchiveTasks({ tasks, loading, onRestore }: ArchiveTasksProps) {
  return (
    <>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className={`task prio-${task.priority}`}>
            <span className="task__text">{task.text}</span>
            <span className="task__prio">{PRIORITY_LABELS[task.priority]}</span>
            <span className="task__date">{task.date}</span>
            <RestoreTaskButton onClick={() => onRestore(task.id)} />
          </li>
        ))}
      </ul>
      {!loading && tasks.length === 0 && <EmptyState text="Архив пуст" />}
      <footer>
        <span>{tasks.length ? `В архиве ${tasks.length}` : ""}</span>
      </footer>
    </>
  );
}
