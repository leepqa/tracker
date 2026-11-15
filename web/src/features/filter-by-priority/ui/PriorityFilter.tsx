import type { Priority } from "../../../entities/task/model/types";
import { PRIORITY_FILTER_OPTIONS } from "../../../shared/config";
import { SegmentedControl } from "../../../shared/ui/SegmentedControl";

type PriorityFilterProps = {
  value: Priority | "all";
  onChange: (value: Priority | "all") => void;
};

export function PriorityFilter({ value, onChange }: PriorityFilterProps) {
  return (
    <SegmentedControl
      className="filters"
      ariaLabel="Приоритет"
      options={PRIORITY_FILTER_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
