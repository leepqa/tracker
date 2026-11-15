import type { Task } from "../../../entities/task/model/types";
import { ArchiveTasks } from "../../../widgets/archive-tasks/ui/ArchiveTasks";

type ArchivePageProps = {
  tasks: Task[];
  loading: boolean;
  onRestore: (id: string) => void;
};

export function ArchivePage({ tasks, loading, onRestore }: ArchivePageProps) {
  return <ArchiveTasks tasks={tasks} loading={loading} onRestore={onRestore} />;
}
