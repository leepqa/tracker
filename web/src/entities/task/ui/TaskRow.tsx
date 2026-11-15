import { PRIORITY_LABELS } from "../../../shared/config";
import type { Task } from "../model/types";

type TaskRowProps = {
  task: Task;
  onToggle: (task: Task, done: boolean) => void;
  onDelete: (task: Task) => void;
};

export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  return (
    <li className={`task prio-${task.priority}${task.done ? " done" : ""}`}>
      <label className="task__check-wrap">
        <input
          type="checkbox"
          className="task__check"
          checked={task.done}
          aria-label="Отметить выполненной"
          onChange={(event) => onToggle(task, event.target.checked)}
        />
      </label>
      <span className="task__text">{task.text}</span>
      {task.moved > 0 && <span className="task__moved">перенос ×{task.moved}</span>}
      <span className="task__prio">{PRIORITY_LABELS[task.priority]}</span>
      <button type="button" className="task__del" title="Удалить" onClick={() => onDelete(task)}>
        ✕
      </button>
    </li>
  );
}
