import { Button } from "../../../shared/ui/Button";
import { ViewSwitch } from "../../../features/switch-view/ui/ViewSwitch";
import type { ViewMode } from "../../../entities/task/model/types";

type HeaderProps = {
  mode: ViewMode;
  date: string;
  onDateChange: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onModeChange: (mode: ViewMode) => void;
  onToggleArchive: () => void;
};

export function Header({
  mode,
  date,
  onDateChange,
  onPrev,
  onNext,
  onToday,
  onModeChange,
  onToggleArchive,
}: HeaderProps) {
  const archive = mode === "archive";

  return (
    <header>
      <h1>BartolomewTT</h1>
      <div className="day-nav">
        <Button className="icon" title="Предыдущий день" disabled={archive} onClick={onPrev}>
          ←
        </Button>
        <input
          type="date"
          aria-label="Выбранный день"
          value={date}
          disabled={archive || mode === "week"}
          onChange={(event) => {
            if (event.target.value) onDateChange(event.target.value);
          }}
        />
        <Button className="icon" title="Следующий день" disabled={archive} onClick={onNext}>
          →
        </Button>
        <Button id="today" disabled={archive} onClick={onToday}>
          Сегодня
        </Button>
        <ViewSwitch mode={mode} onChange={onModeChange} />
        <Button id="archive-toggle" onClick={onToggleArchive}>
          {archive ? "К задачам" : "Архив"}
        </Button>
      </div>
    </header>
  );
}
