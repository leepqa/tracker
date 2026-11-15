import type { NewTask, Priority, Task } from "../../../entities/task/model/types";
import { AddTaskForm } from "../../../features/add-task/ui/AddTaskForm";
import { PriorityFilter } from "../../../features/filter-by-priority/ui/PriorityFilter";
import { SearchInput } from "../../../features/search-tasks/ui/SearchInput";
import { DayTasks } from "../../../widgets/day-tasks/ui/DayTasks";

type DayPageProps = {
  date: string;
  tasks: Task[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  priority: Priority | "all";
  onPriorityChange: (value: Priority | "all") => void;
  onAdd: (input: NewTask) => Promise<boolean>;
  onToggle: (task: Task, done: boolean) => void;
  onDelete: (task: Task) => void;
  onArchiveDone: () => void;
  onMoveUnfinished: () => void;
};

export function DayPage({
  date,
  tasks,
  loading,
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  onAdd,
  onToggle,
  onDelete,
  onArchiveDone,
  onMoveUnfinished,
}: DayPageProps) {
  return (
    <>
      <AddTaskForm date={date} onAdd={onAdd} />
      <div className="tools">
        <SearchInput value={search} onChange={onSearchChange} />
        <PriorityFilter value={priority} onChange={onPriorityChange} />
      </div>
      <DayTasks
        tasks={tasks}
        loading={loading}
        filtered={search.trim().length > 0 || priority !== "all"}
        onToggle={onToggle}
        onDelete={onDelete}
        onArchiveDone={onArchiveDone}
        onMoveUnfinished={onMoveUnfinished}
      />
    </>
  );
}
