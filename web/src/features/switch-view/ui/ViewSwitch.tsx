import type { ViewMode } from "../../../entities/task/model/types";
import { VIEW_OPTIONS } from "../../../shared/config";
import { SegmentedControl } from "../../../shared/ui/SegmentedControl";

type ViewSwitchProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export function ViewSwitch({ mode, onChange }: ViewSwitchProps) {
  const archive = mode === "archive";

  return (
    <SegmentedControl
      className="modes"
      ariaLabel="Вид"
      options={VIEW_OPTIONS}
      value={archive ? null : mode}
      disabled={archive}
      onChange={onChange}
    />
  );
}
