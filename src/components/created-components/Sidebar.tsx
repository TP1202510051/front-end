import { UserNav } from '@/components/auth/UserNav';
import { ProjectHeader } from './ProjectHeader';

interface SidebarProps {
  projectId: string;
  projectName: string;
  setIsSaving: (value: boolean) => void;
}

/** El carril del proyecto: quien esta, y el nombre del proyecto con sus acciones. */
export const Sidebar = ({ projectId, projectName, setIsSaving }: SidebarProps) => {
  // A lo ancho de un telefono el carril se apila sobre el lienzo; un cuarto de 360 px no
  // cabe ni el nombre del proyecto.
  return (
    <div className="w-full shrink-0 md:w-1/4 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col overflow-auto p-4 gap-3">
      <UserNav />
      <ProjectHeader projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
    </div>
  );
};
