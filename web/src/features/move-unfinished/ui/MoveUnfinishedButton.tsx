import { Button } from "../../../shared/ui/Button";

type MoveUnfinishedButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
  title?: string;
};

export function MoveUnfinishedButton({
  onClick,
  label = "Перенести на завтра",
  className,
  title,
}: MoveUnfinishedButtonProps) {
  return (
    <Button className={className} title={title} onClick={onClick}>
      {label}
    </Button>
  );
}
