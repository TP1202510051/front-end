import { UserNav } from '@/components/auth/UserNav';
import ProductInterface from '@/pages/products-interface/ProductInterface';
import { ProjectHeader } from './ProjectHeader';
import { WindowSidebar } from '@/pages/window-interface/WindowSidebar';
import type { AppWindow } from '@/models/windowModel';

interface SidebarProps {
  projectId: string;
  projectName: string;
  setIsSaving: (value: boolean) => void;
  onSelectWindow: (win: AppWindow | null) => void;

}

export const Sidebar = ({ projectId, projectName, setIsSaving, onSelectWindow }: SidebarProps) => {
  return (
    <div className="w-1/4 bg-[var(--sidebar)] text-[var(--sidebar-foreground)] flex flex-col overflow-auto p-4 gap-3">
      <UserNav />
      <ProjectHeader projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
      <WindowSidebar projectId={projectId} onSelect={onSelectWindow} setIsSaving={setIsSaving} />
      <ProductInterface projectId={projectId} projectName={projectName} setIsSaving={setIsSaving} />
    </div>
  );
};
