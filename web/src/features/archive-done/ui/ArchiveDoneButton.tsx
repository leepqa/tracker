import { Button } from "../../../shared/ui/Button";

type ArchiveDoneButtonProps = {
  onClick: () => void;
};

export function ArchiveDoneButton({ onClick }: ArchiveDoneButtonProps) {
  return <Button onClick={onClick}>Убрать выполненные</Button>;
}
