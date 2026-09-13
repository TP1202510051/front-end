import { UserNav } from '@/components/auth/UserNav';
import { ProjectHeader } from './ProjectHeader';

interface SidebarProps {
  projectId: string;
  projectName: string;
  setIsSaving: (value: boolean) => void;
}

/** El carril del proyecto: quien esta, y el nombre del proyecto con sus acciones. */
export const Sidebar = ({ projectId, projectName, setIsSaving }: SidebarProps) => {
  return (
    <div className="w-1/4 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col overflow-auto p-4 gap-3">
      <UserNav />
      <ProjectHeader projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
    </div>
  );
};
