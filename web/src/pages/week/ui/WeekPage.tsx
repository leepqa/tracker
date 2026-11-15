import type { NewTask, Priority, Task } from "../../../entities/task/model/types";
import { AddTaskForm } from "../../../features/add-task/ui/AddTaskForm";
import { PriorityFilter } from "../../../features/filter-by-priority/ui/PriorityFilter";
import { SearchInput } from "../../../features/search-tasks/ui/SearchInput";
import { weekStart } from "../../../shared/lib/date";
import { WeekTasks } from "../../../widgets/week-tasks/ui/WeekTasks";

type WeekPageProps = {
  date: string;
  tasks: Task[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  priority: Priority | "all";
  onPriorityChange: (value: Priority | "all") => void;
  onToggle: (task: Task, done: boolean) => void;
  onDelete: (task: Task) => void;
  onMoveUnfinished: (date: string) => void;
  onAdd: (input: NewTask) => Promise<boolean>;
};

export function WeekPage({
  date,
  tasks,
  loading,
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  onToggle,
  onDelete,
  onMoveUnfinished,
  onAdd,
}: WeekPageProps) {
  return (
    <>
      <AddTaskForm date={date} onAdd={onAdd} />
      <div className="tools">
        <SearchInput value={search} onChange={onSearchChange} />
        <PriorityFilter value={priority} onChange={onPriorityChange} />
      </div>
      <WeekTasks
        start={weekStart(date)}
        tasks={tasks}
        loading={loading}
        onToggle={onToggle}
        onDelete={onDelete}
        onMoveUnfinished={onMoveUnfinished}
      />
    </>
  );
}
