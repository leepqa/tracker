import { Button } from "../../../shared/ui/Button";

type RestoreTaskButtonProps = {
  onClick: () => void;
};

export function RestoreTaskButton({ onClick }: RestoreTaskButtonProps) {
  return (
    <Button className="task__restore" onClick={onClick}>
      Вернуть
    </Button>
  );
}
