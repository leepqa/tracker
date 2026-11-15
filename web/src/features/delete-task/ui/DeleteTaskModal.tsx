import type { Task } from "../../../entities/task/model/types";
import { Modal } from "../../../shared/ui/Modal";

type DeleteTaskModalProps = {
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteTaskModal({ task, onCancel, onConfirm }: DeleteTaskModalProps) {
  return (
    <Modal
      open={task !== null}
      title="Удалить задачу?"
      text={task?.text ?? ""}
      confirmLabel="Удалить"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
